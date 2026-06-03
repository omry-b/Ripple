/** Deterministic ingest/alert ids so repeated runs upsert instead of duplicating. */
export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h + s.charCodeAt(i) * 31) | 0;
  return Math.abs(h);
}

export function stableIngestEventId(adapter: string, summary: string): string {
  const key = `${adapter}:${summary.trim().toLowerCase()}`;
  return `${adapter}-${hashString(key).toString(36)}`;
}
