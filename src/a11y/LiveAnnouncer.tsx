import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { devWarnOnce } from './internal'

export type Politeness = 'polite' | 'assertive'
export type Announce = (message: string, politeness?: Politeness) => void

const AnnouncerContext = createContext<Announce | null>(null)

export interface LiveAnnouncerProps {
  children?: ReactNode
  /** Milliseconds after which an announcement is cleared from the region. Default 7000; 0 keeps it. */
  clearAfter?: number
}

/**
 * Renders one polite and one assertive live region (both present in the SSR markup, empty) and
 * provides `useAnnouncer()` to its subtree. Mount it once near the root of the app.
 *
 * Each announcement first empties its region, then writes the message on the next tick, so the
 * same message said twice is still read twice.
 */
export function LiveAnnouncer({ children, clearAfter = 7000 }: LiveAnnouncerProps) {
  const [polite, setPolite] = useState('')
  const [assertive, setAssertive] = useState('')
  const timers = useRef<Record<Politeness, ReturnType<typeof setTimeout>[]>>({ polite: [], assertive: [] })

  useEffect(() => {
    const t = timers.current
    return () => {
      for (const id of [...t.polite, ...t.assertive]) clearTimeout(id)
    }
  }, [])

  const announce = useCallback<Announce>(
    (message, politeness = 'polite') => {
      const set = politeness === 'assertive' ? setAssertive : setPolite
      const own = timers.current[politeness]
      for (const id of own.splice(0)) clearTimeout(id)
      set('')
      own.push(setTimeout(() => set(message), 50))
      if (clearAfter > 0) own.push(setTimeout(() => set(''), 50 + clearAfter))
    },
    [clearAfter],
  )

  const value = useMemo(() => announce, [announce])

  return (
    <AnnouncerContext.Provider value={value}>
      {children}
      <div className="ui-visually-hidden" aria-live="polite" aria-atomic="true" data-ui-live="polite">
        {polite}
      </div>
      <div className="ui-visually-hidden" aria-live="assertive" aria-atomic="true" data-ui-live="assertive">
        {assertive}
      </div>
    </AnnouncerContext.Provider>
  )
}

const noop: Announce = () => {
  devWarnOnce('announcer-missing', 'useAnnouncer() was called outside <LiveAnnouncer>; the message was not announced.')
}

/** Returns `announce(message, politeness?)`. Outside a LiveAnnouncer it is a no-op (dev warning). */
export function useAnnouncer(): Announce {
  return useContext(AnnouncerContext) ?? noop
}
