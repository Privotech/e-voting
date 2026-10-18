import { NextResponse } from "next/server";
import { isAvailable } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const databaseAvailable = await isAvailable();
  return NextResponse.json({
    status: "ok",
    database: databaseAvailable ? "postgresql" : "disconnected",
    message: "E-Voting application is running",
  });
}
