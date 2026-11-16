import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { cx } from '../actions/internal'

export interface Step {
  label: ReactNode
  /** One line under the label. */
  description?: ReactNode
}

export type StepStatus = 'complete' | 'current' | 'upcoming'

export interface StepperProps {
  steps: ReadonlyArray<Step>
  /** Zero-based index of the step the person is on. Earlier steps are complete, later ones upcoming. */
  current: number
  /** Names the list ("Checkout progress"). Required. */
  label: string
  orientation?: 'horizontal' | 'vertical'
  /** Screen-reader words for each status, in the page's language. */
  statusLabels?: Partial<Record<StepStatus, string>>
  className?: string
}

const DEFAULT_STATUS: Record<StepStatus, string> = { complete: 'Completed', current: 'Current step', upcoming: 'Not started' }

/**
 * Progress through a flow (spec §7 P1 Stepper): an ordered list where each step is a number or a
 * check mark, its label and an optional line. State is never colour alone: a completed step shows a
 * check and every step carries its status in screen-reader text; the current one is `aria-current="step"`.
 * It shows where you are; it does not navigate (use Tabs for peer views, links for pages).
 */
export function Stepper({ steps, current, label, orientation = 'horizontal', statusLabels, className }: StepperProps) {
  const words = { ...DEFAULT_STATUS, ...statusLabels }
  return (
    <ol className={cx('ui-stepper', className)} aria-label={label} data-orientation={orientation}>
      {steps.map((step, i) => {
        const status: StepStatus = i < current ? 'complete' : i === current ? 'current' : 'upcoming'
        return (
          <li key={i} className="ui-step" data-status={status} aria-current={status === 'current' ? 'step' : undefined}>
            <span className="ui-step__marker" aria-hidden="true">
              {status === 'complete' ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : i + 1}
            </span>
            <span className="ui-step__text">
              <span className="ui-visually-hidden">{`${words[status]}: `}</span>
              <span className="ui-step__label">{step.label}</span>
              {step.description ? <span className="ui-step__description">{step.description}</span> : null}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
