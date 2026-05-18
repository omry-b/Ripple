import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { GlobalRiskMap } from "./GlobalRiskMap";
import { mockSnapshot } from "@/storybook/fixtures";

const meta = {
  title: "Bento/GlobalRiskMap",
  component: GlobalRiskMap,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="bento-card bento-large" style={{ padding: 16, maxWidth: 520 }}>
        <div className="card-title" style={{ marginBottom: 8 }}>
          Global Risk Map
        </div>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlobalRiskMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    hotspots: mockSnapshot.hotspots,
  },
};

export const Interactive: Story = {
  args: {
    hotspots: mockSnapshot.hotspots,
    onHotspotClick: fn(),
  },
};
