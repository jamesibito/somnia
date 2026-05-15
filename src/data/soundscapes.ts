import type { SoundscapeDef } from '../context/AudioProvider'

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
]

export function getSoundscape(id: string) {
  return SOUNDSCAPES.find(s => s.id === id)
}
