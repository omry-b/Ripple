import { describe, expect, it } from "vitest";
import type { CommandItem } from "@/types/domain";
import { groupCommandItems } from "@/components/shell/command-palette-groups";

const item = (group: CommandItem["group"], id: string): CommandItem => ({
  id,
  label: id,
  href: `/${id}`,
  group,
});

describe("groupCommandItems", () => {
  it("orders groups Company, Alert, Signal, Navigate", () => {
    const groups = groupCommandItems([
      item("Navigate", "nav"),
      item("Company", "co"),
      item("Alert", "al"),
    ]);
    expect(groups.map((g) => g.group)).toEqual(["Company", "Alert", "Navigate"]);
  });
});
