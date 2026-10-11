import { useRef } from 'react'

/**
 * Focus return for overlays opened without a Radix Trigger (controlled dialogs, the command
 * palette, a dialog opened from a menu item). Radix returns focus to its Trigger; with none, focus
 * would fall to <body>. This remembers what had focus when the overlay opened and restores it on
 * close (spec §9: "Escape closes overlays and returns focus").
 */
export function useReturnFocus(hasTrigger: boolean) {
  const returnTo = useRef<HTMLElement | null>(null)
  return {
    onOpenAutoFocus: () => {
      const active = document.activeElement
      returnTo.current = active instanceof HTMLElement && active !== document.body ? active : null
    },
    onCloseAutoFocus: (event: Event) => {
      if (hasTrigger || !returnTo.current?.isConnected) return
      event.preventDefault()
      returnTo.current.focus()
      returnTo.current = null
    },
  }
}
