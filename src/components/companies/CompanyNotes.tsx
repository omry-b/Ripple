"use client";

import { useEffect, useState } from "react";
import { getCompanyNote, setCompanyNote } from "@/lib/company-notes";

type CompanyNotesProps = {
  companyId: string;
  companyName: string;
};

export function CompanyNotes({ companyId, companyName }: CompanyNotesProps) {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNote(getCompanyNote(companyId));
  }, [companyId]);

  const save = () => {
    setCompanyNote(companyId, note);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section className="workbench-card" style={{ marginBottom: 24 }}>
      <div className="card-title">Analyst notes</div>
      <p style={{ fontSize: 11, color: "#525252", marginBottom: 12 }}>
        Private notes for {companyName} · stored in this browser only
      </p>
      <textarea
        className="company-notes-input"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add context, follow-ups, or escalation notes…"
        rows={4}
        aria-label={`Notes for ${companyName}`}
      />
      <div className="company-notes-actions">
        <button type="button" className="filter-export-btn" onClick={save}>
          Save note
        </button>
        {saved && <span className="company-notes-saved">Saved</span>}
      </div>
    </section>
  );
}
