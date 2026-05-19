# Soundscape audio loops

The hybrid engine (`src/audio/engine.ts`) prefers a recorded loop per
textural layer and **falls back to procedural synthesis** when the file is
absent — so the app is fully playable with this directory empty.

## Expected files (drop in to auto-upgrade that layer)

Each as `<name>.ogg` (Opus, primary) **and** `<name>.m4a` (AAC, Safari
fallback). Seamless loops, ~20–40s, normalized, gentle.

`rain` · `thunder` · `wind` · `tide` · `fire` · `crickets` · `harp` ·
`bubbles` · `water`

(`drone` is always procedural — no file needed.)

## Licensing

Status: **placeholder / synth-only.** Final pass swaps in Pixabay-licensed
loops (free, no attribution) — pending a user-supplied Pixabay API key.
Wikimedia Commons CC0 sourcing was attempted but too sparse/low-quality.

When loops are added, record each file's source + license here.
