"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "ripple-digest-prefs";

type DigestPrefs = {
  enabled: boolean;
  frequency: "daily" | "weekly";
};

function loadPrefs(): DigestPrefs {
  if (typeof window === "undefined") {
    return { enabled: false, frequency: "weekly" };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { enabled: false, frequency: "weekly" };
    return JSON.parse(raw) as DigestPrefs;
  } catch {
    return { enabled: false, frequency: "weekly" };
  }
}

function savePrefs(prefs: DigestPrefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function DigestPreferences() {
  const [prefs, setPrefs] = useState<DigestPrefs>({ enabled: false, frequency: "weekly" });

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const update = (next: DigestPrefs) => {
    setPrefs(next);
    savePrefs(next);
  };

  return (
    <section className="workbench-card digest-prefs">
      <h3 className="supplier-tier-title">Email digest</h3>
      <p className="watchlist-manager-hint">
        Get a recurring summary of risk changes across your watchlist.
      </p>
      <label className="digest-toggle">
        <input
          type="checkbox"
          checked={prefs.enabled}
          onChange={(e) => update({ ...prefs, enabled: e.target.checked })}
        />
        Send watchlist risk digest
      </label>
      <select
        className="filter-select"
        value={prefs.frequency}
        disabled={!prefs.enabled}
        onChange={(e) =>
          update({ ...prefs, frequency: e.target.value as DigestPrefs["frequency"] })
        }
        aria-label="Digest frequency"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>
    </section>
  );
}
