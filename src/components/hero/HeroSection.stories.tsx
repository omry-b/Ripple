import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HeroSection } from "./HeroSection";
import { withLiveData } from "@/storybook/decorators";

const meta = {
  title: "Hero/HeroSection",
  component: HeroSection,
  tags: ["autodocs"],
  decorators: [withLiveData],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HeroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
