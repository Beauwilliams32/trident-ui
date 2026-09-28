/**
 * Render-time type for polymorphic `as` props. Internal; not re-exported.
 *
 * @react-three/fiber 9 augments the global `JSX.IntrinsicElements` (e.g. `line`, `mesh`), so once it
 * is in the same TypeScript program, JSX over a bare `ElementType` resolves its props to `never`.
 * Components keep the public `as?: ElementType` prop and narrow to this at the render site: only
 * tags and components that accept ordinary HTML attributes and an HTMLElement ref.
 */
import type { ElementType, HTMLAttributes, RefAttributes } from 'react'

export type HtmlTag = ElementType<HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement>>
