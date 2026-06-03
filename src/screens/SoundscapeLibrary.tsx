import { Screen, Eyebrow, Display } from '../components/ui'
import TabBar from '../components/TabBar'
import SpiralMark from '../components/SpiralMark'
import SelectorGrid from '../components/SoundscapeSelector'

/**
 * Soundscape library — condensed living-field tile selector. (The A/B/C layout
 * exploration lives at /selector-test for later user testing.)
 */
export default function SoundscapeLibrary() {
  return (
    <>
      <Screen tabSafe>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <SpiralMark size={20} color="var(--color-text)" strokeWidth={1.4} />
          <Eyebrow>Soundscapes</Eyebrow>
        </header>

        <Display size={32} style={{ marginBottom: 6 }}>Sound</Display>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 26 }}>
          Step into one and the room takes its colour. Every layer is yours to mix.
        </p>

        <SelectorGrid variant="tiles" />
      </Screen>
      <TabBar />
    </>
  )
}
