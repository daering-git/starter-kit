import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Session } from "next-auth";

/**
 * Verify API route authentication.
 * Middleware already handles auth for API routes, this provides defense-in-depth.
 */
export async function requireAuth(): Promise<
  { session: Session; error: null } | { session: null; error: NextResponse }
> {
  const session = await auth();
  if (!session?.user) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, error: null };
}
