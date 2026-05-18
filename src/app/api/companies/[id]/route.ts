import { getCompany } from "@/lib/api";
import { jsonError, jsonOk } from "@/lib/api/response";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const company = await getCompany(id);

    if (!company) {
      return jsonError("Company not found", 404);
    }

    return jsonOk({ company });
  } catch {
    return jsonError("Failed to load company", 500);
  }
}
