import Link from "next/link";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  children?: ReactNode;
};

export function EmptyState({ title, description, action, children }: EmptyStateProps) {
  return (
    <div className="empty-state-panel" role="status">
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-desc">{description}</p>}
      {children}
      {action && (
        <Link href={action.href} className="filter-export-btn empty-state-action">
          {action.label}
        </Link>
      )}
    </div>
  );
}
