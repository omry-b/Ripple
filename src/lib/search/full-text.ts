import type { CommandItem } from "@/types/domain";

export type SearchableItem = CommandItem & {
  searchText?: string;
};

export function fullTextSearch(items: SearchableItem[], query: string): SearchableItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  const terms = q.split(/\s+/).filter(Boolean);

  return items
    .map((item) => {
      const haystack = [
        item.label,
        item.sublabel,
        item.group,
        item.href,
        item.searchText,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      let score = 0;
      for (const term of terms) {
        if (haystack.includes(term)) score += term.length;
        if (item.label.toLowerCase().startsWith(term)) score += 5;
      }
      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}
