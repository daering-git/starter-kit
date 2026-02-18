import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { parseOutputXml } from "@/features/upload/lib/xml-parser";

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    // Support raw body upload (CLI: curl -X POST --data-binary @output.xml)
    let xmlContent: string;
    let fileName: string;

    if (file) {
      xmlContent = await file.text();
      fileName = file.name;
    } else {
      // Fallback: read raw body for CLI uploads with Content-Type header
      xmlContent = await req.text();
      fileName = formData.get("name")?.toString() ?? "output.xml";
    }

    if (!xmlContent || !xmlContent.includes("<robot")) {
      return NextResponse.json(
        { error: "Invalid file: must be a Robot Framework output.xml" },
        { status: 400 }
      );
    }

    const parsed = parseOutputXml(xmlContent);

    // Insert into DB within a transaction
    const testRun = await prisma.$transaction(async (tx) => {
      const run = await tx.testRun.create({
        data: {
          name: parsed.name,
          source: fileName,
          host: parsed.host,
          startedAt: parsed.startedAt,
          endedAt: parsed.endedAt,
          duration: parsed.duration,
          total: parsed.total,
          passed: parsed.passed,
          failed: parsed.failed,
          skipped: parsed.skipped,
          status: "COMPLETED",
          uploadedBy: session.user.email ?? session.user.id,
          suites: {
            create: parsed.suites.map((suite) => ({
              name: suite.name,
              source: suite.source,
              duration: suite.duration,
              total: suite.tests.length,
              passed: suite.tests.filter((t) => t.status === "PASS").length,
              failed: suite.tests.filter((t) => t.status === "FAIL").length,
              skipped: suite.tests.filter((t) => t.status === "SKIP").length,
              tests: {
                create: suite.tests.map((test) => ({
                  name: test.name,
                  status: test.status,
                  duration: test.duration,
                  message: test.message,
                  tags: test.tags,
                  metadata: {},
                })),
              },
            })),
          },
        },
        include: {
          suites: {
            include: { tests: true },
          },
        },
      });

      return run;
    });

    return NextResponse.json({
      id: testRun.id,
      name: testRun.name,
      total: testRun.total,
      passed: testRun.passed,
      failed: testRun.failed,
      skipped: testRun.skipped,
      status: testRun.status,
      suitesCount: testRun.suites.length,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
