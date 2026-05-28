import { execSync } from "node:child_process";
import { authorizeServiceRequest } from "@/lib/auth/service-secret";
import { isDatabaseConfigured } from "@/lib/db/client";
import { seedDatabase } from "@/lib/db/seed";

export const maxDuration = 60;

/** One-time or repair: push schema + seed. Bearer CRON_SECRET. */
export async function POST(request: Request) {
  if (!authorizeServiceRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return Response.json({ error: "DATABASE_URL not set" }, { status: 500 });
  }

  try {
    execSync("npx drizzle-kit push", {
      env: process.env,
      stdio: "pipe",
      encoding: "utf8",
    });
    const seed = await seedDatabase();
    return Response.json({
      asOf: new Date().toISOString(),
      schema: "pushed",
      seed,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Setup failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
