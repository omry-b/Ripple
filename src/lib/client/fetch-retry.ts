const DEFAULT_RETRIES = 3;
const MAX_DELAY_MS = 8000;

export async function fetchJsonWithRetry<T>(
  path: string,
  init?: RequestInit,
  retries = DEFAULT_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const res = await fetch(path, { cache: "no-store", ...init });
      if (!res.ok) {
        throw new Error(`API ${path} failed: ${res.status}`);
      }
      return (await res.json()) as T;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt === retries) break;
      const delay = Math.min(1000 * 2 ** attempt, MAX_DELAY_MS);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError ?? new Error(`API ${path} failed`);
}
