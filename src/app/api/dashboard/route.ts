import { getDashboard } from "@/lib/api";

export async function GET() {
  const data = await getDashboard();
  return Response.json(data);
}
