import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { StreamGrid } from "./StreamGrid";
import { mockStreams } from "@/storybook/fixtures";

const meta = {
  title: "Streams/StreamGrid",
  component: StreamGrid,
  tags: ["autodocs"],
} satisfies Meta<typeof StreamGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    streams: mockStreams,
  },
};

export const Selectable: Story = {
  args: {
    streams: mockStreams,
    onStreamSelect: fn(),
    selectedId: "ais",
  },
};
