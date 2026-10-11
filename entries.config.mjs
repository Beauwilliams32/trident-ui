/** Library entry points (one per JS subpath export). Shared by vite.config.ts and tsup.config.ts. */
export const ENTRIES = {
  index: 'src/index.ts',
  server: 'src/server/index.ts',
  islands: 'src/islands/index.ts',
  'motion-lite': 'src/motion-lite/index.ts',
  motion: 'src/motion/index.ts',
  app: 'src/app/index.ts',
  marketing: 'src/marketing/index.ts',
  three: 'src/three/index.ts',
}

/** Never bundled: peers (required and optional) and runtime dependencies. */
export const EXTERNAL = /^(react|react-dom|three|@react-three\/[^/]+|motion|@radix-ui\/[^/]+|cmdk|sonner|lucide-react)(\/.*)?$/
