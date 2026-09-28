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
    render: () => (
      <div>
        <Section space="sm" aria-label="Default band">
          <Box>default</Box>
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
