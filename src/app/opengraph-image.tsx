import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Ripple — Supply Chain Risk Intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 64,
          background: "linear-gradient(135deg, #0a0a0a 0%, #1e1b4b 50%, #0a0a0a 100%)",
          color: "#f5f5f5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#737373", marginBottom: 12 }}>Supply chain intelligence</div>
        <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2 }}>Ripple</div>
        <div style={{ fontSize: 32, marginTop: 24, color: "#a3a3a3" }}>
          Live risk signals · CVaR · Scenario simulation
        </div>
      </div>
    ),
    { ...size }
  );
}
