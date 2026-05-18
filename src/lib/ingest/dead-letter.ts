export type DeadLetterEntry = {
  id: string;
  adapter: string;
  failedAt: string;
  error: string;
  payload?: unknown;
};

const queue: DeadLetterEntry[] = [];
const MAX = 50;

export function pushDeadLetter(
  adapter: string,
  error: string,
  payload?: unknown
): DeadLetterEntry {
  const entry: DeadLetterEntry = {
    id: `dlq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    adapter,
    failedAt: new Date().toISOString(),
    error,
    payload,
  };
  queue.unshift(entry);
  if (queue.length > MAX) queue.pop();
  return entry;
}

export function listDeadLetters(limit = 20): DeadLetterEntry[] {
  return queue.slice(0, limit);
}
