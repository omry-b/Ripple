export function jsonOk<T extends Record<string, unknown>>(body: T, status = 200) {
  return Response.json({ asOf: new Date().toISOString(), ...body }, { status });
}

export function jsonError(message: string, status: number) {
  return Response.json(
    { asOf: new Date().toISOString(), error: message },
    { status }
  );
}
