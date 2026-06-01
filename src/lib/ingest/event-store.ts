import type { NormalizedIngestEvent } from "./types";

const MAX_EVENTS = 400;
const memoryEvents: NormalizedIngestEvent[] = [];

export function pushIngestEvents(events: NormalizedIngestEvent[]): void {
  for (const e of events) {
    const idx = memoryEvents.findIndex((x) => x.id === e.id);
    if (idx >= 0) memoryEvents[idx] = e;
    else memoryEvents.unshift(e);
  }
  if (memoryEvents.length > MAX_EVENTS) {
    memoryEvents.length = MAX_EVENTS;
  }
}

export function getRecentIngestEvents(limit = 200): NormalizedIngestEvent[] {
  return memoryEvents.slice(0, limit);
}

export function clearIngestEventsForTests(): void {
  memoryEvents.length = 0;
}
