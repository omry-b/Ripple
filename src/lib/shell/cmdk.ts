export const CMDK_OPEN_EVENT = "ripple:open-cmdk";

export function openCommandPalette(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CMDK_OPEN_EVENT));
}
