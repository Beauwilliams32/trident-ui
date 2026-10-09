# Depth Line

Approved fleet direction, 2026-10-07. The generated concept board is a visual reference;
`depth-line.mjs` is the vector source of the three-rail mark. Use its `depthLineMark()` function
with the product's existing `accent-1` and `accent-2` theme colors. The studio defaults are
teal and cyan. The app name stays as live text in Space Grotesk; do not bake words into an icon.

The contour illustration is a quiet background for public marketing heroes and link previews.
It carries no information. Do not put it on auth, money, legal, admin, or client surfaces.
The foreground text and controls must remain legible without it. On mobile, keep the contour
low contrast and outside the text's reading path. There is no animation.

The mark's 64x64 viewBox has a 6px minimum rail width and deliberate spacing. Raster favicons
come from the SVG at 16, 32 and 48px; inspect those sizes before release. Every product keeps
its own accent pair from `tokens.json`, so adopting Depth Line does not re-palette the fleet.
