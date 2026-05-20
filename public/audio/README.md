# Soundscape audio loops

The hybrid engine (`src/audio/engine.ts`) prefers a recorded loop per
textural layer and **falls back to procedural synthesis** when the file is
absent — so the app is fully playable with this directory empty.

## Expected files (drop in to auto-upgrade that layer)

Each as `<name>.ogg` (Opus, primary) **and** `<name>.m4a` (AAC, Safari fallback).
Seamless loops, ~20–40s, normalized, gentle.

`rain` · `thunder` · `wind` · `tide` · `fire` · `crickets` · `harp` · `fairy` ·
`bubbles` · `water`

(`drone` is always procedural — no file needed.)

## Current status

| Layer    | OGG | M4A | Source file                  | Notes                        |
|----------|-----|-----|------------------------------|------------------------------|
| rain     | ✓   | ✓   | rain.mp3                     | Pixabay CC0                  |
| thunder  | ✓   | ✓   | thunder.mp3                  | Pixabay CC0                  |
| wind     | ✓   | ✓   | wind_passingbreeze.mp3       | Pixabay CC0                  |
| fire     | ✓   | ✓   | fire.mp3                     | Pixabay CC0                  |
| crickets | ✓   | ✓   | crickets.mp3                 | Pixabay CC0                  |
| harp     | ✓   | ✓   | fairy_harp_phaser.mp3        | Pixabay CC0; phaser texture  |
| fairy    | ✓   | ✓   | fairy_soundscape_base.mp3    | Pixabay CC0; Fairy Forest shimmer layer |
| bubbles  | ✓   | ✓   | bubbles.mp3                  | Pixabay CC0                  |
| tide     | ✗   | ✗   | —                            | Still needs sourcing (Slow Tide) |
| water    | ✗   | ✗   | —                            | Still needs sourcing (Underwater) |
| drone    | —   | —   | always procedural            | No file needed               |

## Unused Pixabay files (kept for future use)

- `wind_drone.mp3` — extra wind texture; drone layer is always procedural
- `fairy_harp_ascending.mp3` — alternate harp; could swap with phaser version
- `fairy_fly.mp3`, `fairy_fly2.mp3` — fairy wing flutter; could add as extra layer
- `fairy_dream.mp3` — dreamy ambient pad; converted to `dream.ogg` / `dream.m4a`

## Still needed

- `tide.ogg` — ocean wave loops for Slow Tide soundscape
- `water.ogg` — underwater stream/bubbling for Underwater soundscape

Source: Pixabay (free, no attribution required): https://pixabay.com/sound-effects/
