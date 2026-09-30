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
    render: () => (
      <ToastRegion label="Notifications (gallery)" style={{ position: 'static', width: '100%' }}>
        <Toast tone="success" title="Published" message="Posted to Instagram and Facebook." onClose={noop} />
        <Toast tone="info" title="Queued" message="Your video is rendering locally." />
        <Toast tone="warning" message="Two posts are waiting for review." onClose={noop} />
        <Toast tone="error" title="Upload failed" message="The file is larger than 500 MB." onClose={noop} />
      </ToastRegion>
    ),
  },
]
