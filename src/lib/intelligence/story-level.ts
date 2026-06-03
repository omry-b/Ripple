import type { CompanyStorySource } from "@/types/domain";

/** Map story outlet to risk level for timeline dot color (semantic only). */
export function levelFromStorySource(
  source: CompanyStorySource
): "critical" | "elevated" | "normal" {
  if (source === "gdelt" || source === "sec") return "elevated";
  if (source === "news" || source === "bbc" || source === "npr") return "normal";
  return "normal";
}
