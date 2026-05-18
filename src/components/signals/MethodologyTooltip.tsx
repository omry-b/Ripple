"use client";

import { useId, useState } from "react";

type MethodologyTooltipProps = {
  methodology: string;
};

export function MethodologyTooltip({ methodology }: MethodologyTooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="methodology-tooltip-wrap">
      <button
        type="button"
        className="methodology-trigger"
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        Methodology ⓘ
      </button>
      {open && (
        <span id={id} role="tooltip" className="methodology-popover">
          {methodology}
        </span>
      )}
    </span>
  );
}
