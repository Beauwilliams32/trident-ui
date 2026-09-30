import { useEffect, useMemo } from 'react'
import { CanvasTexture, Vector2, Vector3, type Texture } from 'three'
import { intToRgb, parseCssColor } from '../colors'
import { stateText, statusCards, type StatusCard } from '../statusCards'
import type { StatusOrbitCardsProps } from '../types'
import { useTokenColor } from '../useTokenColor'
import { INNER_RING, OrbitRing, OUTER_RING } from './OrbitRing'

/* Card shader from hero-3d.js FS_CARD: a rounded glass card with a rim, the label texture
 * composited over it, and desaturation for anything not lit. */
export const CARD_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

export const CARD_FRAGMENT = /* glsl */ `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uHasTex;
uniform float uRadius;
uniform float uAlpha;
uniform vec2 uSize;
uniform vec3 uTint;
uniform float uTintMix;
uniform float uMuted;
uniform vec3 uRim;
float rrect(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main() {
  vec2 p = (vUv - 0.5) * uSize;
  float d = rrect(p, uSize * 0.5, uRadius);
  float s = 0.014;
  float shape = 1.0 - smoothstep(-s, s, d);
  float rim = (1.0 - smoothstep(0.0, 0.045, abs(d + 0.03))) * 0.7;
  float sheen = 0.8 + 0.2 * smoothstep(0.0, 1.0, vUv.x * 0.6 + vUv.y * 0.4);
  vec3 col = mix(vec3(1.0), uTint, uTintMix) * sheen;
  float alpha = 0.68;
  vec4 tex = uHasTex > 0.5 ? texture2D(uTex, vUv) : vec4(0.0);
  col = col * (1.0 - tex.a) + tex.rgb;
  alpha = alpha + tex.a * (1.0 - alpha);
  col += uRim * rim;
  float grey = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, vec3(grey), uMuted * 0.75);
  gl_FragColor = vec4(col, shape * alpha * uAlpha);
}`

export const CARD_SIZE: [number, number] = [0.96, 0.6]

const RIM_LIVE = Object.freeze([0.2, 0.85, 0.55] as const)
const RIM_WORKFLOW = Object.freeze([0.78, 0.66, 1.0] as const)
const RIM_OFF = Object.freeze([0.7, 0.7, 0.7] as const)

/** Visual parameters per state. Only 'live' gets the green rim and full alpha among platforms. */
export function cardLook(card: StatusCard, accent: number) {
  const lit = card.state === 'live' || card.state === 'workflow'
  return {
    tint: card.state === 'workflow' ? accent : (parseCssColor(card.color) ?? accent),
    tintMix: card.state === 'workflow' ? 0.32 : 0.09,
    muted: lit ? 0 : 1,
    alpha: lit ? 1 : 0.45,
    rim: card.state === 'live' ? RIM_LIVE : card.state === 'workflow' ? RIM_WORKFLOW : RIM_OFF,
  }
}

function fontStack(): string {
  if (typeof document === 'undefined') return 'ui-sans-serif, system-ui, sans-serif'
  const v = getComputedStyle(document.documentElement).getPropertyValue('--ui-font-body').trim()
  return v || 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'
}

/** Label texture (canvas 2D, no troika). The same text is in the DOM list. */
function labelTexture(card: StatusCard, accentCss: string): Texture | null {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = 384
  c.height = 240
  const ctx = c.getContext('2d')
  if (!ctx) return null
  const hasLine = card.state === 'live' || card.state === 'pending'
  const y = hasLine ? 100 : 122
  const font = fontStack()
  if (card.state === 'workflow') {
    ctx.fillStyle = accentCss
    ctx.fillRect(38, y - 14, 28, 28)
  } else {
    ctx.beginPath()
    ctx.arc(52, y, 15, 0, Math.PI * 2)
    ctx.fillStyle = card.state === 'live' ? card.color : '#9ca3af'
    ctx.fill()
  }
  ctx.fillStyle = card.state === 'workflow' ? '#5b21b6' : card.state === 'live' ? '#111827' : '#4b5563'
  ctx.font = `800 42px ${font}`
  ctx.textBaseline = 'middle'
  ctx.fillText(card.label, 84, y + 2)
  if (hasLine) {
    ctx.font = `700 28px ${font}`
    ctx.fillStyle = card.state === 'live' ? '#047857' : '#6b7280'
    ctx.fillText(stateText(card.state), 84, 160)
  }
  const tex = new CanvasTexture(c)
  tex.premultiplyAlpha = true
  return tex
}

const toCss = (n: number) => `#${n.toString(16).padStart(6, '0')}`

function StatusCardMesh({ card }: { card: StatusCard }) {
  const accent = useTokenColor('accent-1')
  const look = cardLook(card, accent)
  const tex = useMemo(() => labelTexture(card, toCss(accent)), [card, accent])
  useEffect(() => () => tex?.dispose(), [tex])
  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uHasTex: { value: tex ? 1 : 0 },
      uRadius: { value: 0.14 },
      uAlpha: { value: look.alpha },
      uSize: { value: new Vector2(...CARD_SIZE) },
      uTint: { value: new Vector3(...intToRgb(look.tint)) },
      uTintMix: { value: look.tintMix },
      uMuted: { value: look.muted },
      uRim: { value: new Vector3(...look.rim) },
    }),
    [tex, look.alpha, look.tint, look.tintMix, look.muted, look.rim],
  )
  return (
    <mesh renderOrder={1}>
      <planeGeometry args={CARD_SIZE} />
      <shaderMaterial vertexShader={CARD_VERTEX} fragmentShader={CARD_FRAGMENT} uniforms={uniforms} transparent depthWrite={false} />
    </mesh>
  )
}

/**
 * The hero's status cards on two rings. Lit only for `live: true` platform items; the fallback
 * list never lights anything (statusCards() enforces both, and is unit-tested).
 */
export function StatusOrbitCards({ items, animate = true, tightness = 1 }: StatusOrbitCardsProps) {
  const cards = useMemo(() => statusCards(items), [items])
  const inner = cards.filter((_, i) => i % 2 === 0)
  const outer = cards.filter((_, i) => i % 2 === 1)
  return (
    <>
      <OrbitRing {...INNER_RING} animate={animate} tightness={tightness}>
        {inner.map((c) => (
          <StatusCardMesh key={c.key} card={c} />
        ))}
      </OrbitRing>
      <OrbitRing {...OUTER_RING} animate={animate} tightness={tightness}>
        {outer.map((c) => (
          <StatusCardMesh key={c.key} card={c} />
        ))}
      </OrbitRing>
    </>
  )
}
