# Somnia — Changelog

Versioned from **v1.0** (the first real, built release). Earlier work was tracked
as passes A–G in `PUNCHLIST.md`; the Figma-only concept from ~2021 is prehistory.
Keep this updated each release.

## v1.3 — 2026-06-07
### Soundscape visuals
- **Slow Tide reworked.** The old "waves" field was thin sine-curve wire-lines —
  it read as a diagram, not water. New `waves` draws **layered, depth-shaded
  swells**: each band is a filled sine crest with a soft gradient body fading
  downward and a brighter crest highlight, far swells dimmer/slower/higher and
  near swells brighter/faster/lower. Foam still rides the surface.
- The original is **banked as `waves-legacy`** — not deleted, still selectable in
  the dev concept switcher, so the look can be reverted instantly.
- **New "Waterfall" soundscape** (9th): teal palette (#4ACCE8), layers
  Cascade / Spray / Deep, and a new canvas `waterfall` concept — a dense sheet of
  near-vertical falling water columns plus rising mist at the base.
- Faster rain everywhere (vy 12–21 → 30–52, longer streaks) so it reads as real
  rainfall, not a slow drift.

### Design decisions & rationale
- **Filled swells over wire-lines:** volume reads as water; a single bright line
  reads as an oscilloscope. The vertical gradient gives each swell a body, and the
  depth mapping (amplitude/brightness by screen-Y) fakes parallax cheaply — no
  extra particles, just a per-band scalar.
- **Bank, don't delete:** the owner explicitly wanted the old look kept in case the
  new one isn't liked. Keeping it as a real concept (vs. a git-only snapshot) makes
  it switchable live, zero-cost to compare.
- **Waterfall reuses existing audio layers** (water + rain-as-spray + drone) rather
  than sourcing new samples — ships today, sounds like rushing water, and the
  hybrid engine still prefers recorded samples if we add them later.

### Tradeoffs
- Filled swells redraw the sine path twice per band (fill + crest stroke). With ~6
  bands and a coarse step (W/8) it's negligible, but more work than the one-pass
  line. Accepted for the visual gain.
- Waterfall "Spray" is the rain layer re-labelled; against a real field recording
  it's a stand-in. Flagged for a later Pixabay swap alongside tide/water.

### Open questions
- Is the new Slow Tide too busy behind the player at default density? Left at the
  same 0.36 budget; easy to dial if it competes with the orb.
- Waterfall mist is very faint at default density — intentional (background), but
  worth a look on a real phone.

## v1.2 — 2026-06-03
### Player
- Re-laid-out: soundscape title pinned top, mixer pinned bottom, and the hero
  (orb + transport) is one group that **expands to fill** the space between —
  much more breathing room, no dead whitespace.
- Mixer is **click-to-minimize** now (default normal; collapses to its header for
  max hero space). Removed the fuzzy orb grain; kept the soundscape-tinted pulses.
- Sleep timer **glows in the soundscape colour** and can be turned **Off**.
### Meditation
- Chapter label no longer overlaps the orb; progress bar is visible and
  **tap-to-scrub**; **rewind / fast-forward 15s**; added a calming ambient glow.
### Copy
- Tonight streak line de-corny'd; onboarding "build" → "choose your first soundscape".

## v1.1 — 2026-06-03
### Audio
- Faders work properly 0–100% now: per-layer loudness **ceilings** (wind can never
  roar; shrill/high layers cap around half), a **hard-zero at 0%** (no asymptotic
  tail — fixes "slider at 0 but I still hear it"), and per-layer **EQ** (highs
  rolled off bright layers, sub-rumble trimmed on low ones).
- Default **master volume** 0.82 → 0.5; **wind** defaults cut across all soundscapes.
- Meditations: **rewind / fast-forward 15s**.
### Player
- **Mixer** is a frosted glass card that scrolls internally and can **expand** into
  a full sheet (tap MIXER ⌃). **Save mix** stores your default preset per soundscape.
- **Sleep timer** can be turned **off**, and glows in the soundscape colour.
- Hero **orb pulses** tint to the soundscape and carry a faint grain; title + blurb
  shifted up so the layout breathes.
### Brand
- **Cinzel** font loaded so the SOMNIA wordmark renders correctly.
- Profile colophon: **v1.1**, no "concept" tag; origin reads "Branding & Marketing
  course brand project".

## v1.0 — 2026-06-03
- Experience-quality uplift: soundscape **selector** rebuilt as living-field tiles;
  player **faders** redrawn (glow + % readout); **faster, more real rain**; **real
  guided-meditation audio** wired into the meditation player.

## v0.4 and earlier — passes A–G
- The pre-uplift prototype: brand identity, the hybrid soundscape engine, the
  sleep loop, meditation, dream journal, and profile. See `PUNCHLIST.md` for the
  pass-by-pass log.
