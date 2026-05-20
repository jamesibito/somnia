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
      { id: 'seagulls', label: 'Gulls', default: 0.18 },
      { id: 'wind', label: 'Sea breeze', default: 0.28 },
      { id: 'drone', label: 'Deep', default: 0.22 },
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
      { id: 'fairy', label: 'Shimmer', default: 0.32 },
      { id: 'wind', label: 'Leaves', default: 0.22 },
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
  // Each palette commits hard to its environment — no purple bleed-through.
  'light-rainstorm': { b1: 'rgba(28,58,160,0.82)',   b2: 'rgba(18,40,120,0.78)',  b3: 'rgba(70,110,210,0.45)', tint: '#7AA2F0', concept: 'rain' },
  'cedar-forest':    { b1: 'rgba(14,80,52,0.82)',    b2: 'rgba(10,58,38,0.78)',   b3: 'rgba(50,130,80,0.45)',  tint: '#5EC98A', concept: 'fireflies' },
  'slow-tide':       { b1: 'rgba(12,96,148,0.82)',   b2: 'rgba(8,68,118,0.78)',   b3: 'rgba(40,148,200,0.45)', tint: '#38B8E0', concept: 'waves' },
  'hearth':          { b1: 'rgba(190,72,18,0.82)',   b2: 'rgba(150,44,12,0.78)',  b3: 'rgba(224,120,48,0.48)', tint: '#F08840', concept: 'embers' },
  'static-bloom':    { b1: 'rgba(118,80,255,0.68)',  b2: 'rgba(78,50,210,0.64)',  b3: 'rgba(170,148,255,0.38)', tint: '#C4B0FF', concept: 'starfield' },
  'deep-drift':      { b1: 'rgba(4,2,18,0.97)',      b2: 'rgba(8,4,36,0.94)',     b3: 'rgba(30,14,80,0.28)',   tint: '#FFE066', concept: 'cosmic' },
  'fairy-forest':    { b1: 'rgba(168,48,210,0.72)',  b2: 'rgba(120,28,178,0.68)', b3: 'rgba(210,110,240,0.38)', tint: '#E890FF', concept: 'fairies' },
  'underwater':      { b1: 'rgba(14,118,158,0.82)',  b2: 'rgba(8,84,130,0.78)',   b3: 'rgba(50,178,210,0.42)', tint: '#30C0DE', concept: 'bubbles' },
}

export function getPalette(id: string | undefined): SoundscapePalette {
  return (id && SOUNDSCAPE_PALETTES[id]) || SOUNDSCAPE_PALETTES['static-bloom']
}
