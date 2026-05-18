import { listDeadLetters } from "@/lib/ingest/dead-letter";
import { jsonData } from "@/lib/api/response";

export async function GET() {
  return jsonData({ items: listDeadLetters() });
}
