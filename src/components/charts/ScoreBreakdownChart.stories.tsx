import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ScoreBreakdownChart } from "./ScoreBreakdownChart";
import { mockScoreFactors } from "@/storybook/fixtures";

const meta = {
  title: "Charts/ScoreBreakdownChart",
  component: ScoreBreakdownChart,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof ScoreBreakdownChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    factors: mockScoreFactors,
    totalScore: 81,
  },
};
