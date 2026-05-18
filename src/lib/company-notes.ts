const prefix = "ripple-notes-";

export function getCompanyNote(companyId: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(`${prefix}${companyId}`) ?? "";
}

export function setCompanyNote(companyId: string, note: string): void {
  if (typeof window === "undefined") return;
  if (note.trim()) {
    localStorage.setItem(`${prefix}${companyId}`, note);
  } else {
    localStorage.removeItem(`${prefix}${companyId}`);
  }
}
