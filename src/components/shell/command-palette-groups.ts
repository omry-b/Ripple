import type { CommandItem } from "@/types/domain";

const GROUP_ORDER = ["Company", "Alert", "Signal", "Navigate"] as const;

export function groupCommandItems(items: CommandItem[]): { group: string; items: CommandItem[] }[] {
  const map = new Map<string, CommandItem[]>();
  for (const item of items) {
    const list = map.get(item.group) ?? [];
    list.push(item);
    map.set(item.group, list);
  }
  const ordered: { group: string; items: CommandItem[] }[] = [];
  for (const g of GROUP_ORDER) {
    const list = map.get(g);
    if (list?.length) ordered.push({ group: g, items: list });
  }
  for (const [group, list] of map) {
    if (!GROUP_ORDER.includes(group as (typeof GROUP_ORDER)[number])) {
      ordered.push({ group, items: list });
    }
  }
  return ordered;
}
