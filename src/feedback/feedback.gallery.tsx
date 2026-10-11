/**
 * Gallery stories for the feedback group (spec §10.6). Not exported from the package entry; the
 * integrator's gallery imports `examples` from each src/<group>/*.gallery.tsx.
 */
import type { GalleryExample } from '../display/gallery-types'
import { Alert } from './Alert'
import { FlashBanner } from './FlashBanner'
import { Toast, ToastRegion } from './Toast'

export type { GalleryExample }

const noop = () => {}

export const examples: GalleryExample[] = [
  {
    component: 'Alert',
    name: 'Tones',
    description: 'Inline messages: errors are role=alert, the rest role=status. A visible title, or a hidden “Error:” prefix, carries the tone in text.',
    render: () => (
      <div style={{ display: 'grid', gap: 12 }}>
        <Alert tone="info" title="Heads up">
          Scheduling uses your portal time zone.
        </Alert>
        <Alert tone="success" title="Saved">
          Your profile is up to date.
        </Alert>
        <Alert tone="warning" onDismiss={noop}>
          Instagram needs to be reconnected within 7 days.
        </Alert>
        <Alert tone="error" title="Payment failed" actions={<a href="#billing">Update card</a>}>
          The card on file was declined.
        </Alert>
        <Alert tone="info" live={false} icon={false}>
          Static note with no live role and no icon.
        </Alert>
      </div>
    ),
  },
  {
    component: 'FlashBanner',
    name: 'nil_flash and portal shapes',
    description: 'The page-level result of a POST-redirect, rendered on the server from the flash cookie. Errors take focus so they are heard.',
    render: () => (
      <div style={{ display: 'grid', gap: 12 }}>
        <FlashBanner flash={{ type: 'success', message: 'Profile saved.' }} />
        <FlashBanner flash={{ type: 'error', message: 'Add a title, an HTTPS portfolio link, and a description.' }} focusOnMount={false} />
        <FlashBanner tone="info">Password reset link sent.</FlashBanner>
      </div>
    ),
  },
  {
    component: 'Toast',
    name: 'Tones in a static stack',
    description: 'Transient confirmations. Auto-dismiss pauses on hover and focus and never applies to errors, which stay until dismissed.',
    render: () => (
      <ToastRegion label="Notifications (gallery)" style={{ position: 'static', width: '100%' }}>
        <Toast tone="success" title="Published" message="Posted to Instagram and Facebook." onClose={noop} />
        <Toast tone="info" title="Queued" message="Your video is rendering locally." />
        <Toast tone="warning" message="Two posts are waiting for review." onClose={noop} />
        <Toast tone="error" title="Upload failed" message="The file is larger than 500 MB." onClose={noop} />
      </ToastRegion>
    ),
  },
  {
    component: 'Alert',
    name: 'Right to left, with a Toast (dir="rtl")',
    description: 'The tone edge, icon and dismiss button move to the other side; nothing is hard-coded to left or right.',
    render: () => (
      <div dir="rtl" lang="ar" style={{ display: 'grid', gap: 12 }}>
        <Alert tone="success" title="تم الحفظ" onDismiss={noop} dismissLabel="إغلاق">
          تم تحديث ملفك الشخصي.
        </Alert>
        <ToastRegion label="الإشعارات" style={{ position: 'static', width: '100%' }}>
          <Toast tone="info" title="تم النشر" message="تم نشر المنشور على إنستغرام." onClose={noop} closeLabel="إغلاق" />
        </ToastRegion>
      </div>
    ),
  },
]
