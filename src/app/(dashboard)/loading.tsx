export default function DashboardLoading() {
  return (
    <main className="content-container" style={{ paddingTop: 48 }}>
      <div
        style={{
          height: 280,
          background: "#0d0d0d",
          borderRadius: 12,
          border: "1px solid #1a1a1a",
          marginBottom: 24,
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              height: 120,
              background: "#0d0d0d",
              borderRadius: 12,
              border: "1px solid #1a1a1a",
              gridColumn: i === 1 ? "span 2" : undefined,
              gridRow: i === 1 ? "span 2" : undefined,
              minHeight: i === 1 ? 200 : 120,
            }}
          />
        ))}
      </div>
    </main>
  );
}
