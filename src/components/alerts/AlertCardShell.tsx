import type { ReactNode } from "react";

export type AlertCardVariant = "critical" | "elevated" | "default";

type AlertCardShellProps = {
  variant?: AlertCardVariant;
  children: ReactNode;
};

export function AlertCardShell({ variant = "default", children }: AlertCardShellProps) {
  if (variant === "critical") {
    return (
      <div className="grad-border-wrapper">
        <div className="grad-border-inner glass-card">{children}</div>
      </div>
    );
  }

  return <div className={`glass-card${variant === "elevated" ? " alert-card-elevated" : ""}`}>{children}</div>;
}
