const DEFAULT_RETRIES = 3;
const MAX_DELAY_MS = 8000;

function demoAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  try {
    const role = localStorage.getItem("ripple-demo-role");
    const org = localStorage.getItem("ripple-demo-org");
    return {
      ...(role ? { "x-ripple-role": role } : {}),
      ...(org ? { "x-ripple-org-id": org } : {}),
    };
  } catch {
    return {};
  }
}

export async function fetchJsonWithRetry<T>(
  path: string,
  init?: RequestInit,
  retries = DEFAULT_RETRIES
): Promise<T> {
  let lastError: Error | null = null;
  const mergedHeaders = { ...demoAuthHeaders(), ...(init?.headers as Record<string, string>) };

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const res = await fetch(path, {
        cache: "no-store",
        ...init,
        headers: mergedHeaders,
      });
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
