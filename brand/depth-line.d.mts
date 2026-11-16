/** Depth Line, the Trident fleet mark (see brand/README.md). */
export const DEPTH_LINE_LEFT: string
export const DEPTH_LINE_CENTER: string
export interface DepthLineOptions {
  /** Six-digit hex. Default the studio teal. */
  accent1?: string
  /** Six-digit hex. Default the studio cyan. */
  accent2?: string
  /** Accessible name. Omit for a decorative mark (aria-hidden). */
  title?: string
}
/** The mark as an SVG string, with its own gradient id (several marks can share a page). */
export function depthLineMark(options?: DepthLineOptions): string
