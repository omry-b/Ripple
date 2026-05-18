import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AlertCard } from "./AlertCard";
import { mockAlertCritical, mockAlertElevated } from "@/storybook/fixtures";

const meta = {
  title: "Alerts/AlertCard",
  component: AlertCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story, { args }) => (
      <div className={`glass-card${args.alert.critical ? "" : ""}`} style={{ padding: 20, maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AlertCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Critical: Story = {
  args: { alert: mockAlertCritical },
};

export const Elevated: Story = {
  args: { alert: mockAlertElevated },
  decorators: [
    (Story) => (
      <div className="grad-border-wrapper">
        <div className="grad-border-inner glass-card" style={{ padding: 20, maxWidth: 480 }}>
          <Story />
        </div>
      </div>
    ),
  ],
};
