import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PageHeader } from "./PageHeader";

const meta = {
  title: "Shell/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Companies: Story = {
  args: {
    title: "Company Exposure",
    subtitle: "Tracked companies and exposure from live snapshot",
  },
};

export const Signals: Story = {
  args: {
    title: "Live Signal Streams",
    subtitle: "7 active channels · updated 2m ago",
  },
};
