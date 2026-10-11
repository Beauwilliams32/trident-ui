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
import { Gallery } from './Gallery'
import { groups } from './registry'
import { readLocation } from './url'

if (Object.keys(themeStyles).length < 12) throw new Error('gallery: theme stylesheets missing')

const at = readLocation(window.location.search, window.location.hash)
const theme = isThemeName(at.theme) ? at.theme : 'fleet'
const motion = at.motion

// The server sets these in production (spec §2.1); the gallery does it before first paint.
const root = document.documentElement
root.dataset.theme = theme
root.dataset.scheme = THEME_SCHEMES[theme]
// "paused" is the persistent Pause-motion control; "reduced" comes from the OS/browser media query.
setMotionPaused(motion === 'paused')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Gallery groups={groups} theme={theme} motion={motion} only={at.group} />
  </StrictMode>,
)

// motion-lite's static-markup examples need the one boot call (see motion-lite.gallery.tsx).
requestAnimationFrame(() => {
  initMotion()
  void document.fonts.ready.then(() => root.setAttribute('data-gallery-ready', ''))
})
