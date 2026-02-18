import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const runs = await prisma.testRun.findMany({
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      name: true,
      source: true,
      host: true,
      startedAt: true,
      duration: true,
      total: true,
      passed: true,
      failed: true,
      skipped: true,
      status: true,
      uploadedBy: true,
      createdAt: true,
    },
  });

  return NextResponse.json(runs);
}
