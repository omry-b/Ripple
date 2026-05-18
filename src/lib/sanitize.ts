/** Strip HTML tags from user-generated text (notes, etc.). */
export function sanitizePlainText(input: string, maxLength = 4000): string {
  const stripped = input
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .trim();
  return stripped.slice(0, maxLength);
}
