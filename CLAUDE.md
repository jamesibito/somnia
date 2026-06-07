# Somnia Prototype — Claude Instructions

## Project
React 19 + TypeScript + Vite. Portfolio prototype of a sleep / meditation /
white-noise app. Fixed 390×844 phone-frame demo (iPhone 14 Pro dimensions).
Brand direction: **Pure Indigo** — a monochrome lavender-on-deep-purple "atmosphere"
rather than a dashboard.

Repo: `github.com/jamesibito/somnia`. Deployed: not yet.

**No Tailwind.** Styling is CSS custom properties in `src/index.css` + inline
`style={{}}` objects. This was a deliberate call — see DECISIONS.md.

## Versioning
This project uses a **pass-based** versioning model, not semver. Each pass is a
themed batch of work (Pass A = bugs, Pass B = visual identity, Pass C = soundscape
visuals, etc.). Versions shown in the colophon are coarse (v0.1 → v0.4 over the
course of all passes).

**Current pass:** Pass G (refine — player compression, meditation redesign).
**Current version label:** `SOMNIA · v0.4 · CONCEPT` (in Profile colophon).

When wrapping a meaningful batch of work, bump the version label and update
`PUNCHLIST.md` with what landed.

## Git workflow — ALWAYS follow this

### Before writing any code
1. `git branch --show-current` — confirm starting point
2. `git checkout -b pass-<letter>-<theme>` (e.g. `pass-h-onboarding-rewrite`)
3. **Never commit directly to `main`.** Main is the archived stable point.

### While working
- Logically grouped commits. Don't batch everything into one giant commit.
- Commit prefix conventions used in this repo:
  - `feat(audio):`, `feat(ui):`, `feat(loop):`, `feat(time):`, `feat(visual):`
  - `feat(atmosphere):`, `feat(theme):`, `feat(brand):`, `feat(polish):`
  - `fix(nav):`, `fix(polish):`
  - `merge(<branch>):` for the merge commit when landing a pass to main

### Wrapping a pass
1. `npx tsc -b --noEmit` — fix all errors before presenting
2. Optionally `npm run build` for a full build check
3. Update `PUNCHLIST.md` with what landed
4. Tell the user what branch you're on and what changed (bullet list)
5. **Stop and wait for approval — do not merge to main unless asked**

### Merging to main (only after user approves)
1. `git checkout main`
2. `git merge <pass-branch> --no-ff -m "merge(<pass-branch>): <theme>..."`
3. `git push origin main`
4. Feature branches are kept (don't delete) — they're snapshots of each pass

## Code standards
- TypeScript strict — fix all unused import / TS errors before presenting
- No `console.log` left in committed code
- Inline `style={{}}` is fine and preferred for this project (no Tailwind)
- All animation respects `prefers-reduced-motion` AND the in-app
  `data-reduced-motion` attribute on `.phone-shell` (set by `prefs.reducedMotion`)
- Particle / canvas work: single rAF per component, pause on `document.hidden`,
  cap DPR at 2, one CSS-var writer per var

## File structure
```
src/
├─ App.tsx               — router + provider tree
├─ index.css             — design tokens (CSS vars) + global styles + keyframes
├─ main.tsx              — entry
├─ audio/
│  └─ engine.ts          — hybrid Web Audio engine (sampleLayer pattern)
├─ components/
│  ├─ AtmosphereLayer.tsx       — 3 blurred drifting blobs + grain + amp reactivity
│  ├─ GenerativeField.tsx       — canvas particle field (13 concepts, incl. waves-legacy + waterfall)
│  ├─ FieldConceptSwitcher.tsx  — dev-only concept audition (gated by import.meta.env.DEV)
│  ├─ NowPlayingDot.tsx         — persistent now-playing pill in PhoneFrame
│  ├─ PhoneFrame.tsx            — the 390×844 device-frame chrome
│  ├─ SpiralMark.tsx            — the logo glyph
│  ├─ TabBar.tsx                — bottom nav
│  ├─ TimeCompression.tsx       — night→morning passage overlay
│  ├─ Wordmark.tsx              — "Somnia" wordmark vector
│  └─ ui.tsx                    — Screen, TopBar, Eyebrow, Display, BigNumber, StageBar
├─ context/
│  ├─ AudioProvider.tsx         — play/pause/levels, sleep timer
│  ├─ ClockProvider.tsx         — simulated clock (phase: evening→morning)
│  ├─ FieldConceptProvider.tsx  — dev override for particle concepts (localStorage)
│  ├─ JournalProvider.tsx       — dream journal entries (localStorage)
│  ├─ PlanProvider.tsx          — prefs + derived plan (localStorage: somnia.prefs.v1)
│  └─ SessionProvider.tsx       — logged nights (localStorage: somnia.sessions.v1)
├─ data/
│  ├─ content.ts                — meditations, user info, seeded session backfill
│  └─ soundscapes.ts            — 9 soundscapes + palettes + concept mapping
├─ screens/                     — all 15 routed screens
└─ utils/
   ├─ insight.ts                — deriveInsight, deriveStreak (per-morning analysis)
   ├─ score.ts                  — deterministic sleep score from session draft
   └─ sessions.ts               — mergedSessions(history) — real + seeded backfill
public/
└─ audio/                       — .ogg + .m4a per layer (engine auto-loads)
```

## Design tokens (CSS vars, `src/index.css`)
Pure Indigo (default):
- `--color-bg: #0E0824` · `--color-bg-deep: #0A0420`
- `--color-surface: #160F30`
- `--color-accent: #B5A8E8` · `--color-accent-bright: #C9BBF5` · `--color-accent-dim`
- `--color-text: #EAE2FF` · `--color-text-muted: #9B92C4` · `--color-text-faint`
- `--color-hair` (hairlines) · `--color-warn` (system alerts ONLY)

Moonstone (`[data-theme="moon"]` on `<html>`) — cooler version of the same tokens.

## CSS custom-property motion contract
One owner per variable (don't violate):
- `--amp` (AtmosphereLayer rAF reader → engine.getAmplitude)
- `--breath` (MeditatePlayer / NightMode orb writers)
- `--night-progress` (TimeCompression overlay only)
All defaulted to `0` on `.phone-shell`.

## Audio engine pattern (`src/audio/engine.ts`)
Hybrid: every textural layer is built via `sampleLayer(name, opts, fallback)` —
it prefers `/public/audio/<name>.ogg` then `.m4a`, falls back to procedural synth.
- Adding a new layer: add to `LayerId` union, write a `buildX` procedural fallback,
  register in `BUILDERS` + `SEND` records.
- `drone` was procedural-only; in Pass G it became `sampleLayer('drone', …, buildDrone)`.
- `getAmplitude()` taps the bus *passively* (analyser sink, never routed onward).

## Demo defaults
- User: `Maya` (see `src/data/content.ts:USER`)
- Date label: `Thu · 16 May`
- Notional clock phase transitions: Tonight=evening, NightMode begin=winding-down,
  TimeCompression=asleep→dawn, GoodMorning=morning.
- Status bar time is driven by `useClock().clockLabel` (NOT wall-clock).

## Audio assets — Pixabay CC0
Working: rain, thunder, wind, fire, crickets, harp, bubbles, fairy, drone.
**Still synth-only:** `tide.ogg` (Slow Tide), `water.ogg` (Underwater) — needs sourcing.
Source MP3s are kept out of git (large); only `.ogg` + `.m4a` are tracked.

## Common gotchas
- `.phone-shell` is the scoping element — atmosphere/field/breath all attach here
- `.screen` is `overflow: hidden`; scrollable content lives in `.screen-body`
  (added in Pass F to fix the backdrop-cuts-off bug)
- Soundscape palettes intentionally break the monochrome rule — each commits hard
  to its environment hue (see DECISIONS.md)
- 4 layer cap per soundscape in the player (UI shows them inline)
- React 19 StrictMode: any timer/rAF that mounts twice in dev needs a cancel ref;
  the existing `cancelled` pattern in MeditatePlayer is the template
