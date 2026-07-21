<<<<<<< HEAD
import { NextResponse } from "next/server";

export interface HealthResponse {
  status: "ok" | "error";
  timestamp: string;
  version: string;
  uptime: number;
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const response: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "1.0.0",
    uptime: Math.floor(process.uptime()),
  };

  return NextResponse.json(response, { status: 200 });
=======
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
>>>>>>> origin/main
}
