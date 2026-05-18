import Link from "next/link";
import type { ReactNode } from "react";

type MetricCardProps = {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  accent?: "critical" | "elevated" | "none";
  id?: string;
  cardId?: string;
  href?: string;
  className?: string;
  children?: ReactNode;
};

const ACCENT_CLASS = {
  critical: "critical-accent",
  elevated: "elevated-accent",
  none: "",
} as const;

export function MetricCard({
  title,
  value,
  subtitle,
  accent = "none",
  id,
  cardId,
  href,
  className = "",
  children,
}: MetricCardProps) {
  const body = (
    <>
      <div className="card-title">{title}</div>
      <div className={`metric-display-medium ${ACCENT_CLASS[accent]}`.trim()} id={id}>
        {value}
      </div>
      {subtitle != null && <div className="card-subtitle">{subtitle}</div>}
      {children}
    </>
  );

  if (href) {
    return (
      <Link
        id={cardId}
        href={href}
        className={`bento-card bento-small metric-card-link ${className}`.trim()}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {body}
      </Link>
    );
  }

  return (
    <div id={cardId} className={`bento-card bento-small ${className}`.trim()}>
      {body}
    </div>
  );
}
