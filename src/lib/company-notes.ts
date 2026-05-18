import { sanitizePlainText } from "@/lib/sanitize";

const prefix = "ripple-notes-";

export function getCompanyNote(companyId: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(`${prefix}${companyId}`) ?? "";
}

export function setCompanyNote(companyId: string, note: string): void {
  if (typeof window === "undefined") return;
  const clean = sanitizePlainText(note);
  if (clean.trim()) {
    localStorage.setItem(`${prefix}${companyId}`, clean);
  } else {
    localStorage.removeItem(`${prefix}${companyId}`);
  }
}
