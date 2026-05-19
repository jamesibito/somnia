import type { SoundscapeDef } from '../context/AudioProvider'
import type { FieldConcept } from '../context/FieldConceptProvider'

export const SOUNDSCAPES: SoundscapeDef[] = [
  {
    id: 'light-rainstorm',
    name: 'Light Rainstorm',
    tagline: 'Soft rain with distant thunder',
    layers: [
      { id: 'rain', label: 'Rain', default: 0.72 },
      { id: 'thunder', label: 'Thunder', default: 0.3 },
      { id: 'wind', label: 'Wind', default: 0.18 },
    ],
  },
  {
    id: 'cedar-forest',
    name: 'Cedar Forest',
    tagline: 'Wind through tall pines',
    layers: [
      { id: 'wind', label: 'Wind', default: 0.6 },
      { id: 'rain', label: 'Light drizzle', default: 0.22 },
      { id: 'drone', label: 'Forest hum', default: 0.35 },
    ],
  },
  {
    id: 'slow-tide',
    name: 'Slow Tide',
    tagline: 'Long ocean swells at night',
    layers: [
      { id: 'tide', label: 'Waves', default: 0.7 },
      { id: 'wind', label: 'Sea breeze', default: 0.3 },
      { id: 'drone', label: 'Deep', default: 0.25 },
    ],
  },
  {
    id: 'hearth',
    name: 'Hearth',
    tagline: 'A low fire, almost out',
    layers: [
      { id: 'fire', label: 'Fire', default: 0.66 },
      { id: 'wind', label: 'Draft', default: 0.2 },
      { id: 'drone', label: 'Warmth', default: 0.22 },
    ],
  },
  {
    id: 'static-bloom',
    name: 'Static Bloom',
    tagline: 'Pure noise, slowly breathing',
    layers: [
      { id: 'rain', label: 'White', default: 0.5 },
      { id: 'drone', label: 'Sub', default: 0.3 },
    ],
  },
  {
    id: 'deep-drift',
    name: 'Deep Drift',
    tagline: 'A weightless low drone',
    layers: [
      { id: 'drone', label: 'Drone', default: 0.6 },
      { id: 'tide', label: 'Distant tide', default: 0.28 },
    ],
  },
  {
    id: 'fairy-forest',
    name: 'Fairy Forest',
    tagline: 'Crickets, and a harp somewhere in the dark',
    layers: [
      { id: 'crickets', label: 'Crickets', default: 0.5 },
      { id: 'harp', label: 'Harp', default: 0.42 },
      { id: 'wind', label: 'Leaves', default: 0.24 },
      { id: 'drone', label: 'Glow', default: 0.26 },
    ],
  },
  {
    id: 'underwater',
    name: 'Underwater',
    tagline: 'Submerged, slow, and very far down',
    layers: [
      { id: 'water', label: 'Water', default: 0.62 },
      { id: 'bubbles', label: 'Bubbles', default: 0.4 },
      { id: 'drone', label: 'Pressure', default: 0.34 },
    ],
  },
]

export function getSoundscape(id: string) {
  return SOUNDSCAPES.find(s => s.id === id)
}

/**
 * Per-soundscape visual identity. b1–b3 tint the AtmosphereLayer blobs;
 * `tint` is the base colour for the GenerativeField motes + library accent.
 * All kept within the dreamy indigo family — distinct moods, one brand.
 */
export interface SoundscapePalette {
  b1: string; b2: string; b3: string; tint: string
  /** the soundscape's particle identity (Pass C.2) */
  concept: FieldConcept
}

export const SOUNDSCAPE_PALETTES: Record<string, SoundscapePalette> = {
  'light-rainstorm': { b1: 'rgba(120,140,255,0.5)',  b2: 'rgba(86,84,210,0.46)',  b3: 'rgba(150,170,245,0.3)',  tint: '#A9B8F5', concept: 'motes' },
  'cedar-forest':    { b1: 'rgba(110,160,205,0.46)', b2: 'rgba(86,120,175,0.46)', b3: 'rgba(150,180,210,0.28)', tint: '#9DC2D8', concept: 'fireflies' },
  'slow-tide':       { b1: 'rgba(86,150,235,0.5)',   b2: 'rgba(64,98,200,0.5)',   b3: 'rgba(150,195,240,0.3)',  tint: '#8FBEF0', concept: 'bubbles' },
  'hearth':          { b1: 'rgba(208,128,150,0.42)', b2: 'rgba(150,86,150,0.42)', b3: 'rgba(225,170,140,0.26)', tint: '#E2A88F', concept: 'embers' },
  'static-bloom':    { b1: 'rgba(155,118,255,0.5)',  b2: 'rgba(98,72,200,0.46)',  b3: 'rgba(181,168,232,0.3)',  tint: '#BEB0FF', concept: 'starfield' },
  'deep-drift':      { b1: 'rgba(120,84,220,0.46)',  b2: 'rgba(74,52,165,0.5)',   b3: 'rgba(140,116,222,0.26)', tint: '#9B7CE8', concept: 'constellation' },
  'fairy-forest':    { b1: 'rgba(150,120,235,0.46)', b2: 'rgba(110,90,205,0.46)', b3: 'rgba(176,150,240,0.28)', tint: '#C7B0F2', concept: 'fairies' },
  'underwater':      { b1: 'rgba(54,120,210,0.5)',   b2: 'rgba(40,80,175,0.52)',  b3: 'rgba(96,168,225,0.3)',   tint: '#74C0E8', concept: 'bubbles' },
}

export function getPalette(id: string | undefined): SoundscapePalette {
  return (id && SOUNDSCAPE_PALETTES[id]) || SOUNDSCAPE_PALETTES['static-bloom']
}
