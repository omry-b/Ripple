import { eq } from "drizzle-orm";
import { mockStore } from "@/lib/mock/store";
import { getDb } from "./client";
import * as schema from "./schema";

const DEMO_ORG_ID = "org_demo";
const DEMO_USER_ID = "user_demo";

export async function seedDatabase(): Promise<{ seeded: boolean; message: string }> {
  const db = getDb();

  const existing = await db.select().from(schema.companies).limit(1);
  if (existing.length > 0) {
    return { seeded: false, message: "Database already seeded" };
  }

  const dashboard = await mockStore.getDashboard();
  const snapshot = dashboard.snapshot;

  await db.insert(schema.organizations).values({
    id: DEMO_ORG_ID,
    name: "Demo Organization",
  });

  await db.insert(schema.users).values({
    id: DEMO_USER_ID,
    email: "analyst@ripple.demo",
    organizationId: DEMO_ORG_ID,
    role: "analyst",
  });

  await db.insert(schema.companies).values(
    dashboard.companies.map((c) => ({
      id: c.id,
      name: c.name,
      score: c.score,
      tier: c.tier,
      cvar: c.cvar,
      cvarUsd: c.cvarUsd,
      delta7d: c.delta7d,
      deltaTrend: c.deltaTrend,
      contagionHops: c.contagionHops,
      scoreLevel: c.scoreLevel,
      history30d: c.history30d,
      organizationId: DEMO_ORG_ID,
    }))
  );

  await db.insert(schema.signalStreams).values(
    dashboard.streams.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      score: s.score,
      level: s.level,
      sparkline: s.sparkline,
      history7d: s.history7d,
      timeLabel: s.time,
      description: s.description,
      methodology: s.methodology ?? null,
      relatedCompanyIds: s.relatedCompanyIds,
      organizationId: DEMO_ORG_ID,
    }))
  );

  await db.insert(schema.alerts).values(
    dashboard.alerts.map((a) => ({
      id: a.id,
      level: a.level,
      status: a.status,
      statusLabel: a.statusLabel,
      title: a.title,
      detail: a.detail,
      meta: a.meta,
      critical: a.critical ?? false,
      timeline: a.timeline,
      affectedCompanyIds: a.affectedCompanyIds,
      organizationId: DEMO_ORG_ID,
    }))
  );

  await db.insert(schema.scenarios).values(
    dashboard.scenarios.map((s) => ({
      id: s.id,
      name: s.name,
      subtitle: s.subtitle,
      preview: s.preview,
      profile: s.profile,
      impacts: s.impacts,
      organizationId: DEMO_ORG_ID,
    }))
  );

  await db.insert(schema.tickerItems).values(
    dashboard.ticker.map((t, i) => ({
      label: t.label,
      level: t.level,
      sortOrder: i,
    }))
  );

  await db.insert(schema.mapHotspots).values(
    snapshot.hotspots.map((h, i) => ({
      id: `hotspot-${i}`,
      cx: h.cx,
      cy: h.cy,
      level: h.level,
      alertId: h.alertId,
      label: h.label,
    }))
  );

  await db.insert(schema.dashboardSnapshots).values({
    id: "latest",
    payload: snapshot,
  });

  await db.insert(schema.watchlists).values({
    id: "wl_default",
    userId: DEMO_USER_ID,
    name: "Default watchlist",
  });

  return { seeded: true, message: "Seeded demo organization and reference data" };
}

export async function ensureSeeded(): Promise<void> {
  const db = getDb();
  const row = await db
    .select()
    .from(schema.companies)
    .where(eq(schema.companies.id, "apple"))
    .limit(1);
  if (row.length === 0) {
    await seedDatabase();
  }
}

export { DEMO_ORG_ID, DEMO_USER_ID };
