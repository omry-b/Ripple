"use client";

type CompanyPrintButtonProps = {
  companyName: string;
};

export function CompanyPrintButton({ companyName }: CompanyPrintButtonProps) {
  return (
    <div className="company-print-actions no-print">
      <button
        type="button"
        className="filter-export-btn"
        onClick={() => window.print()}
      >
        Print report  -  {companyName}
      </button>
    </div>
  );
}
