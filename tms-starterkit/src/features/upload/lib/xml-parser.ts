import { XMLParser } from "fast-xml-parser";

// ─── Types for parsed Robot Framework output.xml ───

interface RFStatus {
  "@_status": string;
  "@_start"?: string;
  "@_starttime"?: string;
  "@_elapsed"?: string;
  "@_endtime"?: string;
  "@_message"?: string;
  "#text"?: string;
}

interface RFTest {
  "@_id": string;
  "@_name": string;
  tag?: string | string[];
  tags?: { tag: string | string[] };
  status: RFStatus;
}

interface RFSuite {
  "@_id": string;
  "@_name": string;
  "@_source"?: string;
  suite?: RFSuite | RFSuite[];
  test?: RFTest | RFTest[];
  meta?: Array<{ "@_name": string; "#text": string }>;
  status: RFStatus;
}

interface RFRobot {
  "@_generator": string;
  "@_generated": string;
  "@_schemaversion"?: string;
  suite: RFSuite;
}

// ─── Parsed output types ───

export interface ParsedTestCase {
  name: string;
  status: "PASS" | "FAIL" | "SKIP";
  duration: number | null;
  message: string | null;
  tags: string[];
}

export interface ParsedTestSuite {
  name: string;
  source: string | null;
  duration: number | null;
  tests: ParsedTestCase[];
}

export interface ParsedTestRun {
  name: string;
  generator: string;
  host: string | null;
  startedAt: Date;
  endedAt: Date | null;
  duration: number | null;
  suites: ParsedTestSuite[];
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

// ─── Parser helpers ───

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parseStatusValue(status: string): "PASS" | "FAIL" | "SKIP" {
  const upper = status.toUpperCase();
  if (upper === "PASS") return "PASS";
  if (upper === "FAIL") return "FAIL";
  return "SKIP";
}

function parseDurationMs(status: RFStatus): number | null {
  // RF 7.x: elapsed attribute (seconds as float)
  if (status["@_elapsed"]) {
    return Math.round(parseFloat(status["@_elapsed"]) * 1000);
  }
  // RF 6.x: calculate from starttime/endtime
  if (status["@_starttime"] && status["@_endtime"]) {
    const start = parseRF6Timestamp(status["@_starttime"]);
    const end = parseRF6Timestamp(status["@_endtime"]);
    if (start && end) return end.getTime() - start.getTime();
  }
  return null;
}

function parseTimestamp(status: RFStatus): Date | null {
  // RF 7.x: ISO 8601
  if (status["@_start"]) {
    return new Date(status["@_start"]);
  }
  // RF 6.x: custom format "YYYYMMDD HH:MM:SS.mmm"
  if (status["@_starttime"]) {
    return parseRF6Timestamp(status["@_starttime"]);
  }
  return null;
}

function parseRF6Timestamp(ts: string): Date | null {
  if (!ts || ts === "N/A") return null;
  // Format: "20231107 19:57:01.123"
  const match = ts.match(
    /(\d{4})(\d{2})(\d{2})\s+(\d{2}):(\d{2}):(\d{2})\.(\d{3})/
  );
  if (!match) return null;
  const [, y, mo, d, h, mi, s, ms] = match;
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}.${ms}Z`);
}

function getErrorMessage(status: RFStatus): string | null {
  // RF 7.x: text content
  if (status["#text"]) return status["#text"];
  // RF 6.x: message attribute
  if (status["@_message"]) return status["@_message"];
  return null;
}

function extractTags(test: RFTest): string[] {
  // RF 7.x: <tag> as direct children
  if (test.tag) return toArray(test.tag).map(String);
  // RF 6.x: <tags><tag>...
  if (test.tags?.tag) return toArray(test.tags.tag).map(String);
  return [];
}

function extractHost(robot: RFRobot): string | null {
  // Check suite metadata for Host
  const rootSuite = robot.suite;
  const metas = rootSuite.meta ?? [];
  const hostMeta = metas.find(
    (m) => m["@_name"]?.toLowerCase() === "host"
  );
  if (hostMeta?.["#text"]) return hostMeta["#text"];
  return null;
}

// ─── Recursive suite flattening ───

function flattenSuites(suite: RFSuite): ParsedTestSuite[] {
  const results: ParsedTestSuite[] = [];

  const tests = toArray(suite.test);
  if (tests.length > 0) {
    const parsedTests: ParsedTestCase[] = tests.map((test) => ({
      name: test["@_name"],
      status: parseStatusValue(test.status["@_status"]),
      duration: parseDurationMs(test.status),
      message: getErrorMessage(test.status),
      tags: extractTags(test),
    }));

    results.push({
      name: suite["@_name"],
      source: suite["@_source"] ?? null,
      duration: parseDurationMs(suite.status),
      tests: parsedTests,
    });
  }

  // Recurse into sub-suites
  const subSuites = toArray(suite.suite);
  for (const sub of subSuites) {
    results.push(...flattenSuites(sub));
  }

  return results;
}

// ─── Main parse function ───

export function parseOutputXml(xmlContent: string): ParsedTestRun {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    isArray: (name) =>
      name === "suite" || name === "test" || name === "tag" || name === "meta",
  });

  const parsed = parser.parse(xmlContent);
  const robot = parsed.robot;

  if (!robot) {
    throw new Error("Invalid Robot Framework output.xml: missing <robot> root element");
  }

  // isArray makes suite/test always arrays; root suite is the first element
  const rootSuite: RFSuite = Array.isArray(robot.suite)
    ? robot.suite[0]
    : robot.suite;
  const suites = flattenSuites(rootSuite);

  // Aggregate counts
  let total = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (const suite of suites) {
    for (const test of suite.tests) {
      total++;
      if (test.status === "PASS") passed++;
      else if (test.status === "FAIL") failed++;
      else skipped++;
    }
  }

  const startedAt = parseTimestamp(rootSuite.status) ?? new Date();
  const durationMs = parseDurationMs(rootSuite.status);
  const endedAt = durationMs != null
    ? new Date(startedAt.getTime() + durationMs)
    : null;

  return {
    name: rootSuite["@_name"],
    generator: robot["@_generator"],
    host: extractHost(robot),
    startedAt,
    endedAt,
    duration: durationMs,
    suites,
    total,
    passed,
    failed,
    skipped,
  };
}
