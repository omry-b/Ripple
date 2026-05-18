import type { Decorator } from "@storybook/react";
import { LiveDataProvider } from "@/context/LiveDataContext";
import { mockSnapshot } from "./fixtures";

export const withRippleShell: Decorator = (Story) => (
  <div
    style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#f5f5f5",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}
  >
    <div className="content-container" style={{ paddingTop: 24 }}>
      <Story />
    </div>
  </div>
);

export const withLiveData: Decorator = (Story) => (
  <LiveDataProvider initialAsOf={mockSnapshot.asOf} initialSnapshot={mockSnapshot}>
    <Story />
  </LiveDataProvider>
);
