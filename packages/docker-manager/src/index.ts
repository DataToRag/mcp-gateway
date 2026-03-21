import Docker from "dockerode";

const NETWORK_NAME = "datatorag-mcp-network";
const CONTAINER_PREFIX = "dtrmcp-server-";

export interface ContainerInfo {
  containerId: string;
  internalUrl: string;
  slug: string;
  running: boolean;
}

export interface StartContainerOptions {
  slug: string;
  imageTag: string;
  port: number;
  mcpPath?: string;
  env?: Record<string, string>;
}

export class DockerManager {
  private docker: Docker;

  constructor(socketPath?: string) {
    this.docker = new Docker(
      socketPath ? { socketPath } : undefined
    );
  }

  /** Ensure the shared gateway network exists. */
  async ensureNetwork(): Promise<void> {
    const networks = await this.docker.listNetworks({
      filters: { name: [NETWORK_NAME] },
    });
    if (networks.length === 0) {
      await this.docker.createNetwork({
        Name: NETWORK_NAME,
        Driver: "bridge",
      });
    }
  }

  /** Start a container for an MCP server. */
  async startContainer(options: StartContainerOptions): Promise<ContainerInfo> {
    const { slug, imageTag, port, env = {} } = options;
    const containerName = `${CONTAINER_PREFIX}${slug}`;

    await this.ensureNetwork();

    // Remove existing container if present
    try {
      const existing = this.docker.getContainer(containerName);
      const info = await existing.inspect();
      if (info.State.Running) {
        await existing.stop();
      }
      await existing.remove();
    } catch {
      // Container doesn't exist — fine
    }

    const envArray = Object.entries(env).map(([k, v]) => `${k}=${v}`);

    const container = await this.docker.createContainer({
      name: containerName,
      Image: imageTag,
      Env: envArray,
      ExposedPorts: { [`${port}/tcp`]: {} },
      HostConfig: {
        Memory: 512 * 1024 * 1024,
        MemorySwap: 512 * 1024 * 1024,
        CpuQuota: 50000,
        CpuPeriod: 100000,
        RestartPolicy: { Name: "unless-stopped" },
        NetworkMode: NETWORK_NAME,
      },
    });

    await container.start();

    const mcpPath = options.mcpPath ?? "/mcp";
    return {
      containerId: container.id,
      internalUrl: `http://${containerName}:${port}${mcpPath}`,
      slug,
      running: true,
    };
  }

  /** Stop and remove a container by slug. */
  async stopContainer(slug: string): Promise<void> {
    const containerName = `${CONTAINER_PREFIX}${slug}`;
    try {
      const container = this.docker.getContainer(containerName);
      const info = await container.inspect();
      if (info.State.Running) {
        await container.stop();
      }
      await container.remove();
    } catch {
      // Already gone
    }
  }

  /** Check if a container is running and healthy. */
  async getStatus(slug: string): Promise<ContainerInfo | null> {
    const containerName = `${CONTAINER_PREFIX}${slug}`;
    try {
      const container = this.docker.getContainer(containerName);
      const info = await container.inspect();
      return {
        containerId: container.id,
        internalUrl: "",
        slug,
        running: info.State.Running,
      };
    } catch {
      return null;
    }
  }

  /** List all running MCP server containers. */
  async listContainers(): Promise<ContainerInfo[]> {
    const containers = await this.docker.listContainers({
      filters: { name: [CONTAINER_PREFIX] },
    });
    return containers.map((c) => ({
      containerId: c.Id,
      internalUrl: "",
      slug: (c.Names[0] ?? "").replace(`/${CONTAINER_PREFIX}`, ""),
      running: c.State === "running",
    }));
  }

  /** Build a Docker image from a local path. */
  async buildImage(
    contextPath: string,
    imageTag: string,
    dockerfile?: string
  ): Promise<void> {
    const stream = await this.docker.buildImage(
      { context: contextPath, src: ["."] },
      {
        t: imageTag,
        dockerfile: dockerfile ?? "Dockerfile",
      }
    );

    // Wait for build to complete
    await new Promise<void>((resolve, reject) => {
      this.docker.modem.followProgress(
        stream,
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
}
