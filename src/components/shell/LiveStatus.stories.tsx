import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LiveStatus } from "./LiveStatus";

const meta = {
  title: "Shell/LiveStatus",
  component: LiveStatus,
  tags: ["autodocs"],
} satisfies Meta<typeof LiveStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Live: Story = {
  args: {
    asOf: new Date().toISOString(),
    isRefreshing: false,
  },
};

export const Syncing: Story = {
  args: {
    asOf: new Date(Date.now() - 120_000).toISOString(),
    isRefreshing: true,
  },
};

export const Stale: Story = {
  args: {
    asOf: new Date(Date.now() - 600_000).toISOString(),
    isRefreshing: false,
  },
};
