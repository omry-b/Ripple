import { authorizeServiceRequest } from "@/lib/auth/service-secret";
import { warmStoriesForTopCompanies } from "@/lib/news/warm-stories";

/** Scheduled story crawl — top-risk companies, last 24h only. */
export async function GET(request: Request) {
  if (!authorizeServiceRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await warmStoriesForTopCompanies(12);
  return Response.json({
    asOf: new Date().toISOString(),
    task: "stories-refresh",
    ...result,
  });
}
