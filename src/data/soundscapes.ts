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
  // Soundscapes intentionally break the monochrome rule — each leans into a
  // hue that matches the audio's vibe (more overt than the rest of the app).
  'light-rainstorm': { b1: 'rgba(96,128,235,0.55)',  b2: 'rgba(70,96,200,0.5)',   b3: 'rgba(150,178,245,0.32)', tint: '#9FB6F2', concept: 'rain' },
  'cedar-forest':    { b1: 'rgba(70,150,120,0.5)',   b2: 'rgba(54,118,98,0.5)',   b3: 'rgba(120,190,150,0.3)',  tint: '#8FD8B0', concept: 'fireflies' },
  'slow-tide':       { b1: 'rgba(40,130,200,0.55)',  b2: 'rgba(30,90,175,0.55)',  b3: 'rgba(110,185,225,0.32)', tint: '#6FC4E8', concept: 'bubbles' },
  'hearth':          { b1: 'rgba(230,130,70,0.5)',   b2: 'rgba(190,80,70,0.48)',  b3: 'rgba(240,175,110,0.3)',  tint: '#F0A867', concept: 'embers' },
  'static-bloom':    { b1: 'rgba(155,118,255,0.5)',  b2: 'rgba(98,72,200,0.46)',  b3: 'rgba(181,168,232,0.3)',  tint: '#BEB0FF', concept: 'starfield' },
  'deep-drift':      { b1: 'rgba(140,80,235,0.52)',  b2: 'rgba(92,52,185,0.55)',  b3: 'rgba(160,120,240,0.3)',  tint: '#A878F0', concept: 'constellation' },
  'fairy-forest':    { b1: 'rgba(200,110,230,0.5)',  b2: 'rgba(150,80,210,0.5)',  b3: 'rgba(225,150,240,0.3)',  tint: '#E0A8F2', concept: 'fairies' },
  'underwater':      { b1: 'rgba(40,160,210,0.55)',  b2: 'rgba(30,110,190,0.55)', b3: 'rgba(90,200,225,0.32)',  tint: '#5CC8E0', concept: 'bubbles' },
}

export function getPalette(id: string | undefined): SoundscapePalette {
  return (id && SOUNDSCAPE_PALETTES[id]) || SOUNDSCAPE_PALETTES['static-bloom']
}
