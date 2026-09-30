/**
 * @trident/ui — feedback group (spec §7 P0): Alert, FlashBanner, Toast, ToastRegion.
 * Re-exported from the package root (src/index.ts). Toast keeps the portal `_ds_bundle.js` props
 * (tone, title, message, onClose). The sonner-based app toaster lives in `@trident/ui/app`.
 * Component CSS is src/feedback/styles.css (joined into dist/styles.css by the build).
 */
export { Alert, type AlertProps } from './Alert'
export { FlashBanner, flashTone, type Flash, type FlashBannerProps } from './FlashBanner'
export { Toast, ToastRegion, type ToastProps, type ToastRegionProps } from './Toast'
