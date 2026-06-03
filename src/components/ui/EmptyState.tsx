import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

/** Minimal empty state — grid pattern, no emoji or illustration slop. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state-panel" role="status">
      <div className="empty-state-pattern" aria-hidden />
      <p className="empty-state-title">{title}</p>
      {description ? <p className="empty-state-desc">{description}</p> : null}
      {action}
    </div>
  );
}
