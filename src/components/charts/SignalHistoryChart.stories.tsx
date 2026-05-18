import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SignalHistoryChart } from "./SignalHistoryChart";

const meta = {
  title: "Charts/SignalHistoryChart",
  component: SignalHistoryChart,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="workbench-card" style={{ padding: 20, maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SignalHistoryChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Critical: Story = {
  args: {
    values: [62, 68, 74, 78, 82, 86, 89],
    level: "critical",
  },
};

export const Elevated: Story = {
  args: {
    values: [48, 50, 52, 53, 54, 55, 58],
    level: "elevated",
  },
};
