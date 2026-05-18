import { getDashboard } from "@/lib/api";
import { CACHE_PUBLIC_SHORT, jsonData } from "@/lib/api/response";

export async function GET() {
  const data = await getDashboard();
  return jsonData(data, 200, CACHE_PUBLIC_SHORT);
}
