/**
 * @trident/ui — display group (spec §7 P0): Badge, StatusPill, Chip, Avatar, Card, StatCard.
 * Re-exported from the package root (src/index.ts). Names and props stay compatible with the
 * portal's `_ds_bundle.js` (Badge, StatusPill, Avatar, Card, StatCard) so tab migrations are drop-in.
 * Component CSS is src/display/styles.css (joined into dist/styles.css by the build).
 */
export { Badge, type BadgeProps } from './Badge'
export { StatusPill, STATUS_MAP, type Status, type StatusPillProps } from './StatusPill'
export { Chip, type ChipProps } from './Chip'
export { Avatar, AVATAR_SIZES, initialsOf, type AvatarProps, type AvatarSize } from './Avatar'
export { Card, type CardPadding, type CardProps, type CardVariant } from './Card'
export { StatCard, type StatCardProps, type StatTrend, type TrendDir } from './StatCard'
export {
  TONES,
  TONE_INK_PCT,
  TONE_LABEL,
  TONE_ROLE,
  TONE_TINT_PCT,
  normalizeTone,
  type Tone,
  type ToneAlias,
  type ToneName,
} from './tone'
export { pointerMotionAllowed } from './motion-gate'
