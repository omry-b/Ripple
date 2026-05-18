import type { Preview } from "@storybook/nextjs-vite";
import { Plus_Jakarta_Sans, DM_Mono } from "next/font/google";
import "../src/app/globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const preview: Preview = {
  decorators: [
    (Story) => (
      <div
        className={`${plusJakarta.variable} ${dmMono.variable}`}
        style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f5f5f5" }}
      >
        <div className="content-container" style={{ paddingTop: 24, paddingBottom: 48 }}>
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "ripple",
      values: [{ name: "ripple", value: "#0a0a0a" }],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
};

export default preview;
