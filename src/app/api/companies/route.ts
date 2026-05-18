import { getScopedCompanies } from "@/lib/api/scoped";
import { CACHE_PUBLIC_SHORT, jsonData } from "@/lib/api/response";

export async function GET(request: Request) {
  const companies = await getScopedCompanies(request);
  return jsonData({ companies }, 200, CACHE_PUBLIC_SHORT);
}
