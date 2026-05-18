import { getSnapshot } from "@/lib/api";

export async function GET() {
  const snapshot = await getSnapshot();
  return Response.json({ asOf: snapshot.asOf, snapshot });
}
