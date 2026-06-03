import { asc, eq } from "drizzle-orm";
import type { ScenarioRunOptions } from "@/types/domain";
import { isDatabaseConfigured } from "@/lib/db/client";
import { getDb } from "@/lib/db/client";
import { DEMO_ORG_ID } from "@/lib/db/seed";
import * as schema from "@/lib/db/schema";
import type { ScenarioJob, ScenarioJobStatus } from "@/lib/scenario/job-queue";

const memoryJobs = new Map<string, ScenarioJob>();

function newJobId(): string {
  return `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function createScenarioJob(
  scenarioId: string,
  options?: ScenarioRunOptions
): Promise<ScenarioJob> {
  const id = newJobId();
  const job: ScenarioJob = {
    id,
    scenarioId,
    status: "queued",
    createdAt: new Date().toISOString(),
    options,
  };

  if (isDatabaseConfigured()) {
    const db = getDb();
    await db.insert(schema.scenarioJobs).values({
      id,
      scenarioId,
      status: "queued",
      options: options ?? null,
      organizationId: DEMO_ORG_ID,
    });
  } else {
    memoryJobs.set(id, job);
  }

  return job;
}

export async function getScenarioJobById(id: string): Promise<ScenarioJob | undefined> {
  if (isDatabaseConfigured()) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(schema.scenarioJobs)
      .where(eq(schema.scenarioJobs.id, id))
      .limit(1);
    if (!row) return undefined;
    return {
      id: row.id,
      scenarioId: row.scenarioId,
      status: row.status as ScenarioJobStatus,
      createdAt: row.createdAt.toISOString(),
      completedAt: row.completedAt?.toISOString(),
      error: row.error ?? undefined,
      run: row.result ?? undefined,
    };
  }
  return memoryJobs.get(id);
}

export async function updateScenarioJob(
  id: string,
  patch: Partial<Pick<ScenarioJob, "status" | "error" | "run" | "completedAt">>
): Promise<void> {
  if (isDatabaseConfigured()) {
    const db = getDb();
    await db
      .update(schema.scenarioJobs)
      .set({
        status: patch.status,
        error: patch.error ?? null,
        result: patch.run ?? null,
        completedAt: patch.completedAt ? new Date(patch.completedAt) : undefined,
      })
      .where(eq(schema.scenarioJobs.id, id));
    return;
  }
  const current = memoryJobs.get(id);
  if (!current) return;
  memoryJobs.set(id, { ...current, ...patch });
}

export async function listQueuedScenarioJobs(limit = 5): Promise<ScenarioJob[]> {
  if (isDatabaseConfigured()) {
    const db = getDb();
    const rows = await db
      .select()
      .from(schema.scenarioJobs)
      .where(eq(schema.scenarioJobs.status, "queued"))
      .orderBy(asc(schema.scenarioJobs.createdAt))
      .limit(limit);
    return rows.map((row) => ({
      id: row.id,
      scenarioId: row.scenarioId,
      status: row.status as ScenarioJobStatus,
      createdAt: row.createdAt.toISOString(),
    }));
  }
  return [...memoryJobs.values()].filter((j) => j.status === "queued").slice(0, limit);
}

export async function getJobOptions(id: string): Promise<ScenarioRunOptions | undefined> {
  if (isDatabaseConfigured()) {
    const db = getDb();
    const [row] = await db
      .select({ options: schema.scenarioJobs.options })
      .from(schema.scenarioJobs)
      .where(eq(schema.scenarioJobs.id, id))
      .limit(1);
    return row?.options ?? undefined;
  }
  const mem = memoryJobs.get(id);
  return mem?.options;
}
