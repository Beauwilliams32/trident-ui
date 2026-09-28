/// <reference types="vite/client" />
import '../fonts/fonts.css'
import '../dist/tokens.css'
import '../dist/styles.css'
import './gallery.css'
import { themeStyles } from './themes'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initMotion, setMotionPaused } from '../src/motion-lite'
import { isThemeName, THEME_SCHEMES } from '../src/server/themes'
import { Gallery, type MotionState } from './Gallery'
import { groups } from './registry'

if (Object.keys(themeStyles).length < 12) throw new Error('gallery: theme stylesheets missing')

const params = new URLSearchParams(window.location.search)
const themeParam = params.get('theme') ?? 'fleet'
const theme = isThemeName(themeParam) ? themeParam : 'fleet'
const motionParam = params.get('motion')
const motion: MotionState = motionParam === 'reduced' || motionParam === 'paused' ? motionParam : 'on'

// The server sets these in production (spec §2.1); the gallery does it before first paint.
const root = document.documentElement
root.dataset.theme = theme
root.dataset.scheme = THEME_SCHEMES[theme]
// "paused" is the persistent Pause-motion control; "reduced" comes from the OS/browser media query.
setMotionPaused(motion === 'paused')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Gallery groups={groups} theme={theme} motion={motion} only={params.get('group')} />
  </StrictMode>,
)

// motion-lite's static-markup examples need the one boot call (see motion-lite.gallery.tsx).
requestAnimationFrame(() => {
  initMotion()
  void document.fonts.ready.then(() => root.setAttribute('data-gallery-ready', ''))
})
