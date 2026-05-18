import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { ensureSeeded } from "@/lib/db/seed";
import * as schema from "@/lib/db/schema";
import type { SignalStream } from "@/types/domain";
import type { SignalReading } from "@/lib/ingest/normalizer";
import { applyReadingsToStreams } from "@/lib/risk/apply-readings";

function rowToSignal(row: typeof schema.signalStreams.$inferSelect): SignalStream {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    score: row.score,
    level: row.level as SignalStream["level"],
    sparkline: row.sparkline,
    history7d: row.history7d,
    time: row.timeLabel,
    description: row.description,
    methodology: row.methodology ?? undefined,
    relatedCompanyIds: row.relatedCompanyIds,
  };
}

export async function persistReadingsAndRescoreStreams(
  readings: SignalReading[]
): Promise<number> {
  if (readings.length === 0) return 0;

  await ensureSeeded();
  const db = getDb();

  await db
    .insert(schema.signalReadings)
    .values(
      readings.map((r) => ({
        id: r.id,
        signalId: r.signalId,
        recordedAt: new Date(r.recordedAt),
        value: r.value,
        source: r.summary.slice(0, 512),
      }))
    )
    .onConflictDoNothing();

  const rows = await db.select().from(schema.signalStreams);
  const streams = rows.map(rowToSignal);
  const updated = applyReadingsToStreams(streams, readings);

  let changed = 0;
  for (const stream of updated) {
    const prior = streams.find((s) => s.id === stream.id);
    if (!prior || prior.score === stream.score) continue;
    await db
      .update(schema.signalStreams)
      .set({
        score: stream.score,
        level: stream.level,
        history7d: stream.history7d,
      })
      .where(eq(schema.signalStreams.id, stream.id));
    changed += 1;
  }

  return changed;
}
