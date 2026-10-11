/** Gallery examples for the layout group (see src/a11y/a11y.gallery.tsx for the contract). */
import type { GalleryExample } from '../a11y/a11y.gallery'
import { Cluster } from './Cluster'
import { Container } from './Container'
import { Grid } from './Grid'
import { Section } from './Section'
import { Stack } from './Stack'

export const group = 'layout'

const Box = ({ children }: { children: string }) => <div className="ui-gallery-box">{children}</div>

export const examples: GalleryExample[] = [
  {
    id: 'container',
    title: 'Container sizes',
    description: 'Centres content at a fixed maximum width: prose (68ch) for reading, marketing (1080px) and app (1280px).',
    render: () => (
      <Stack gap={2}>
        <Container size="prose">
          <Box>prose (68ch)</Box>
        </Container>
        <Container>
          <Box>marketing (1080px)</Box>
        </Container>
        <Container size="app">
          <Box>app (1280px)</Box>
        </Container>
      </Stack>
    ),
  },
  {
    id: 'stack',
    title: 'Stack',
    description: 'Vertical rhythm with one gap token between children. Renders any element, here a list.',
    render: () => (
      <Stack gap={3} as="ul" aria-label="Stack example">
        <li>One</li>
        <li>Two</li>
        <li>Three</li>
      </Stack>
    ),
  },
  {
    id: 'cluster',
    title: 'Cluster',
    description: 'A wrapping row for toolbars, tags and button groups, with justify and align options.',
    render: () => (
      <Cluster gap={2} justify="between">
        <Box>Left</Box>
        <Cluster gap={2}>
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
        </Cluster>
      </Cluster>
    ),
  },
  {
    id: 'grid',
    title: 'Grid: 3 columns and auto-fit',
    description: 'Fixed columns that collapse on phones, or auto-fit tracks with a minimum width.',
    render: () => (
      <Stack gap={6}>
        <Grid columns={3}>
          <Box>1</Box>
          <Box>2</Box>
          <Box>3</Box>
        </Grid>
        <Grid min="sm" gap={4}>
          <Box>auto</Box>
          <Box>fit</Box>
          <Box>min</Box>
          <Box>220px</Box>
        </Grid>
      </Stack>
    ),
  },
  {
    id: 'section',
    title: 'Section tones',
    description: 'Page bands with vertical padding and a background tone: the page bg, the alternate bg-2, or the solid surface.',
    render: () => (
      // A neutral frame in the page colour, so each band reads against the same backdrop (G16:
      // inside the bg-2 example card, "default" and "alt" looked identical).
      <div className="g-tone-frame">
        <Section space="sm" aria-label="Default band">
          <Box>default (bg)</Box>
        </Section>
        <Section space="sm" tone="alt" aria-label="Alt band">
          <Box>alt (bg-2)</Box>
        </Section>
        <Section space="sm" tone="surface" aria-label="Surface band">
          <Box>surface</Box>
        </Section>
      </div>
    ),
  },
]
