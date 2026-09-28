/**
 * Count-ups (spec §6.1, §6.3 rule 9). Only ONE real quantity counts (isCountable): "2022-2023",
 * "1-800-555-0100", "Q4 2025" or "v2.1.3" render static unless the caller opts in. The target is
 * always the value the server or props supplied; the animation never invents a number.
 * Reduced motion or Pause: the final value is written and no requestAnimationFrame starts.
 */
import { motionOff, tokenNumber } from './env'
import { subscribeMotion } from './pause'

export interface NumberSpec {
  prefix: string
  value: number
  decimals: number
  grouped: boolean
  suffix: string
}

const NUM_RE = /^([^\d-]*?)(-?\d[\d,]*)(\.\d+)?(.*)$/s

export function parseNumber(text: unknown): NumberSpec | null {
  const m = NUM_RE.exec(String(text ?? '').trim())
  if (!m) return null
  const whole = (m[2] ?? '').replace(/,/g, '')
  const dec = m[3] ? m[3].slice(1) : ''
  const value = Number(whole + (dec ? '.' + dec : ''))
  if (!Number.isFinite(value)) return null
  return { prefix: m[1] ?? '', value, decimals: dec.length, grouped: (m[2] ?? '').includes(','), suffix: m[4] ?? '' }
}

const COUNTABLE_RE = /^(?:[$€£]|US\$)?-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:%|×|x|[kKmMbB]\+?|\+|\/(?:mo|yr|wk|day|hr))?$/

/** Is this text one real quantity? `optIn` true forces (if it parses), false forbids. */
export function isCountable(text: unknown, optIn?: boolean): boolean {
  if (optIn === false) return false
  const raw = String(text ?? '').trim()
  if (!raw || !parseNumber(raw)) return false
  return optIn === true || COUNTABLE_RE.test(raw)
}

export function formatNumber(n: number, spec: NumberSpec): string {
  const [whole = '0', frac] = Math.abs(n).toFixed(spec.decimals).split('.')
  const w = spec.grouped ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : whole
  return spec.prefix + (n < 0 ? '-' : '') + w + (frac ? '.' + frac : '') + spec.suffix
}

export interface CountUpOptions {
  /** The final text; defaults to the element's current text (what the server rendered). */
  value?: string | number
  /** Milliseconds; defaults to --ui-dur-count (1100ms). */
  duration?: number
  /** Force (true) or forbid (false) counting; default is the isCountable guard. */
  countable?: boolean
  /** Called with each frame's text instead of writing textContent. */
  write?: (text: string) => void
}

/** Count `el` from 0 to its value once. Returns a cancel function that leaves the final value. */
export function countUp(el: Element | null, opts: CountUpOptions = {}): () => void {
  const text = opts.value != null ? String(opts.value) : String(el?.textContent ?? '')
  const write = opts.write ?? ((t: string) => el && (el.textContent = t))
  const attr = el?.getAttribute('data-countable')
  const optIn = opts.countable ?? (attr === 'true' || attr === '' ? true : attr === 'false' ? false : undefined)
  const spec = isCountable(text, optIn) ? parseNumber(text) : null
  const done = () => write(text)
  if (!spec || motionOff() || typeof requestAnimationFrame !== 'function' || typeof performance === 'undefined') {
    done()
    return () => {}
  }
  const duration = opts.duration ?? tokenNumber('--ui-dur-count', 1100)
  const start = performance.now()
  let raf = 0
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / duration)
    if (p >= 1 || motionOff()) {
      raf = 0
      done()
      return
    }
    write(formatNumber(spec.value * (1 - Math.pow(1 - p, 3)), spec))
    raf = requestAnimationFrame(tick)
  }
  write(formatNumber(0, spec))
  raf = requestAnimationFrame(tick)
  return () => {
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    done()
  }
}

/**
 * Count up an element the first time 40% of it is visible. Without IntersectionObserver, or with
 * motion off, the final value stays and nothing is scheduled. Returns a cleanup function.
 */
export function countUpWhenVisible(el: Element, opts: CountUpOptions = {}): () => void {
  const text = opts.value != null ? String(opts.value) : String(el.textContent ?? '')
  const spec = isCountable(text, opts.countable) ? parseNumber(text) : null
  if (!spec || motionOff() || typeof IntersectionObserver !== 'function') return () => {}
  const write = opts.write ?? ((t: string) => (el.textContent = t))
  let stop: (() => void) | null = null
  const local = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      local.disconnect()
      stop = countUp(el, { ...opts, value: text, countable: true, write })
    },
    { threshold: 0.4 },
  )
  const finish = () => {
    local.disconnect()
    unsubscribe()
    if (stop) stop()
    write(text)
  }
  // Pausing before the element is seen must not leave it at 0.
  const unsubscribe = subscribeMotion((isPaused) => isPaused && finish())
  write(formatNumber(0, spec))
  local.observe(el)
  return finish
}
