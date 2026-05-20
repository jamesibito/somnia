# Soundscape audio loops

The hybrid engine (`src/audio/engine.ts`) prefers a recorded loop per
textural layer and **falls back to procedural synthesis** when the file is
absent — so the app is fully playable with this directory empty.

## Expected files (drop in to auto-upgrade that layer)

Each as `<name>.ogg` (Opus, primary) **and** `<name>.m4a` (AAC, Safari fallback).
Seamless loops, ~30–90s, normalized, gentle.

`rain` · `thunder` · `wind` · `tide` · `fire` · `crickets` · `harp` · `fairy` ·
`bubbles` · `water` · `drone` · `seagulls`

## Current status

| Layer    | OGG | M4A | Source(s)                       | Notes                              |
|----------|-----|-----|---------------------------------|------------------------------------|
| rain     | ✓   | ✓   | rain.mp3                        | Pixabay CC0, trimmed 90s           |
| thunder  | ✓   | ✓   | thunder.mp3                     | Pixabay CC0, trimmed 90s           |
| wind     | ✓   | ✓   | wind_passingbreeze.mp3          | Pixabay CC0                        |
| fire     | ✓   | ✓   | fire.mp3                        | Pixabay CC0                        |
| crickets | ✓   | ✓   | crickets.mp3                    | Pixabay CC0                        |
| harp     | ✓   | ✓   | fairy_harp_phaser.mp3           | Pixabay CC0 — phaser texture       |
| fairy    | ✓   | ✓   | fairy_soundscape_base + 2 flies | Pixabay CC0 mix, looped to 57s     |
| bubbles  | ✓   | ✓   | bubbles.mp3                     | Pixabay CC0                        |
| tide     | ✓   | ✓   | waves_base + sloshing + shore   | Pixabay CC0 mix, 60s seamless loop |
| water    | ✓   | ✓   | underwater_ambience.mp3         | Pixabay CC0, trimmed 90s           |
| drone    | ✓   | ✓   | wind_drone.mp3                  | Pixabay CC0 (also has synth fallback) |
| seagulls | ✓   | ✓   | seagulls_soft.mp3               | Pixabay CC0, looped to 60s         |

## Source files (kept locally, not committed)

Source MP3s live in this directory for reproducibility but are gitignored
(see repo `.gitignore`). Only the converted `.ogg` and `.m4a` are tracked.

Unused sources kept on disk for future remixes:
- `fairy_harp_ascending.mp3` — alternate harp; could replace phaser version

## Conversion commands

OGG (primary): `ffmpeg -i source.mp3 -c:a libvorbis -q:a 6 -ar 44100 name.ogg`
M4A (fallback): `ffmpeg -i source.mp3 -c:a aac -b:a 128k -ar 44100 name.m4a`

For long sources, add `-t 90` (or similar) to trim.
For mixes: `-filter_complex "[0:a]volume=1[a0];[1:a]volume=0.5[a1];[a0][a1]amix=inputs=2:duration=first"`
For short sources to loop: `-stream_loop -1 -t 60` before `-i`.

Source: Pixabay (free, no attribution required): https://pixabay.com/sound-effects/
