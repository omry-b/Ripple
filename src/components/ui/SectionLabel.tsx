import type { ReactNode } from "react";

type SectionLabelProps = {
  id?: string;
  children: ReactNode;
  primary?: boolean;
  count?: ReactNode;
  actions?: ReactNode;
};

/** Section heading with left rail — primary visual hierarchy cue. */
export function SectionLabel({
  id,
  children,
  primary,
  count,
  actions,
}: SectionLabelProps) {
  return (
    <div
      id={id}
      className={`section-label-rail${primary ? " section-label-rail--primary" : ""}`}
    >
      <span className="section-label-rail__text">{children}</span>
      {(count != null || actions != null) && (
        <div className="section-label-rail__meta">
          {count}
          {actions}
        </div>
      )}
    </div>
  );
}
