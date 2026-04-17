export interface Connector {
  id: string;
  title: string;
  slug: string;
}

export const CONNECTORS: Connector[] = [
  {
    id: "google-workspace",
    title: "Google Workspace",
    slug: "google-workspace",
  },
  {
    id: "atlassian",
    title: "Atlassian",
    slug: "atlassian",
  },
];

export function getConnector(id: string): Connector | undefined {
  return CONNECTORS.find((c) => c.id === id);
}
