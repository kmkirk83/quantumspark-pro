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
}
