import type { ReactElement } from 'react'

/** One gallery entry. The integrator's gallery renders every example in every theme and scheme. */
export interface GalleryExample {
  /** Component name, e.g. "Badge". */
  component: string
  /** Short variant title, e.g. "Tones". */
  name: string
  render: () => ReactElement
}
