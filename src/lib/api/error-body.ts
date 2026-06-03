export type ApiErrorBody = { asOf?: string; error: string };

/** Parse standard `{ error }` JSON from failed API responses (client-safe). */
export async function readApiError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as ApiErrorBody;
    if (typeof body.error === "string" && body.error.length > 0) return body.error;
  } catch {
    /* non-JSON body */
  }
  return `Request failed (${res.status})`;
}
