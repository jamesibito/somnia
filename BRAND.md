# Somnia — Brand (v1, locked enough to build)

Lightweight lock from the direction explorations. Revisit/expand in a later pass.

## Essence
Sleep tracking, meditations, and white noise. Dark, dreamy, modern. Luxury and
technology in service of rest. The product should feel like something you'd
want to be *inside* at 11pm — not a dashboard, an atmosphere.

**Tagline:** *Rest, deliberately.*

## Direction — "Pure Indigo"
Chosen over Soft Minimalism, Glassmorphism, Cinematic, Bento, and 12+ palette
variants through 5 rounds of feedback with target users.

- **Monochrome dreamy bath.** Lavender on deep purple. Hierarchy comes from
  opacity, size, and weight — not from a contrast color.
- **Atmosphere, not chrome.** Drifting blurred color, soft grain, breathing
  elements. Hairline dividers, not heavy cards.

## Palette (tokens in `src/index.css`)
| Token | Hex | Use |
|---|---|---|
| `--color-bg` | `#0E0824` | Primary canvas |
| `--color-bg-deep` | `#0A0420` | Deeper surfaces, splash |
| `--color-surface` | `#160F30` | Cards, sheets |
| `--color-accent` | `#B5A8E8` | Primary lavender accent |
| `--color-accent-bright` | `#C9BBF5` | Emphasis, active |
| `--color-text` | `#EAE2FF` | Body |
| `--color-text-muted` | `#9B92C4` | Secondary |
| `--color-warn` | `#E8B8C0` | **System/alerts ONLY**, <5% surface |
| `--color-positive` | `#9FE8C4` | Success confirmations only |

The single contrast-color concession: a soft rose `--color-warn` is reserved
strictly for system alerts and destructive confirmations. Everyday hierarchy
never uses it.

## Type
- **Fraunces** (variable, optical sizing) — display, numerals, titles
- **Inter** — UI, body, labels
- **JetBrains Mono** — metadata, timecodes, technical labels
- **No italic on primary headlines** (user feedback). Italic is reserved for
  *media titles* — soundscape names, meditation titles — where it reads as
  "track title," not decoration.
- Numerals always `font-variant-numeric: tabular-nums`.

## Motion
- Ease-out only. Durations 200 / 400 / 800ms.
- Background gradients drift (24–40s loops). UI never overshoots.
- One signature: the spiral mark rotates slowly (~32s) on splash and the
  "begin" confirmation only.
- Everything respects `prefers-reduced-motion`.

## Sound
- **Hybrid Web Audio** (revised from procedural-only). Textural layers prefer
  recorded loops for realism (rain, fire, tide, wind, thunder, crickets, harp,
  bubbles, water); tonal beds (`drone`) stay procedural. Rationale: recorded
  texture is far more immersive *and* cheaper at runtime (buffer playback vs.
  real-time DSP); the reactive analyser + convolution-reverb graph is identical
  either way.
- **Graceful degradation:** every textural layer falls back to its original
  procedural synthesis if a clip is missing, so the app is always fully
  playable with zero audio files and auto-upgrades when loops are added.
- Loops are lazy-loaded per soundscape, `.ogg` (Opus) + `.m4a` (AAC) fallback.
  *(Current loops = CC0 placeholders; final pass swaps to Pixabay-licensed.)*
- UI is silent by default (a sleep app respects silence). Optional cues later.

## Personalization (future)
Dusk Rose (warm) and Moonstone (cold) parked as opt-in themes — not defaults.
