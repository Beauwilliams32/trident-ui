/** Join class names, skipping falsy values. Internal helper for the display and feedback groups. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}
