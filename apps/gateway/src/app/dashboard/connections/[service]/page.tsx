import Link from "next/link";
import { notFound } from "next/navigation";
import { getService } from "../services";
import { ConnectionDetailClient } from "./client";

interface Props {
  params: Promise<{ service: string }>;
}

export default async function ConnectionDetailPage({ params }: Props) {
  const { service: serviceId } = await params;
  const service = getService(serviceId);
  if (!service) notFound();

  return (
    <div>
      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        &larr; Dashboard
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <div className="shrink-0">{service.icon}</div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {service.name}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {service.description}
          </p>
        </div>
      </div>

      <ConnectionDetailClient service={serviceId} connectUrl={service.connectUrl} />
    </div>
  );
}
