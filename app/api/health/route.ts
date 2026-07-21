export interface HealthStatus {
  status: "ok" | "degraded" | "down";
  timestamp: string;
  version: string;
  services: {
    api: "up" | "down";
  };
}

export function GET(): Response {
  const health: HealthStatus = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env["npm_package_version"] ?? "1.0.0",
    services: {
      api: "up",
    },
  };

  return Response.json(health);
}
