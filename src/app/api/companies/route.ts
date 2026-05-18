import { getCompanies } from "@/lib/api";
import { CACHE_PUBLIC_SHORT, jsonData } from "@/lib/api/response";

export async function GET() {
  const companies = await getCompanies();
  return jsonData({ companies }, 200, CACHE_PUBLIC_SHORT);
}
