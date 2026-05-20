# Somnia — Design Decisions & Learning Log

A running record of the calls that shaped this project — what we picked, what we
considered and rejected, and what we learned along the way. Updated as decisions
land. New entries on top.

---

## D-27 · Pass H+ — Text contrast bump for readability
**Picked:** Bumped `--color-text-muted` (#9B92C4 → #AEA5D2) and `--color-text-faint`
(#6B6494 → #877FB2) in both Pure Indigo and Moonstone themes.
**Why:** Owner feedback that small text felt unreadable, especially the colophon
copy and "Shaped for…" hero subline. Old `--color-text-faint` was below WCAG AA
for small body text against `--color-bg`.
**Trade-off:** Slightly less "ethereal mood" hierarchy, but legibility wins. The
brand still feels indigo-bathed; the contrast just clears the bar.

## D-26 · Pass H+ — Waves get foam particles, cosmic gets the void back
**Picked:** Two field tweaks:
- **Waves:** hybrid of ~4 sine-curve wave lines + ~30 small foam dots drifting
  rightward with the current. Foam gives the field actual visible motion the
  static sine curves couldn't carry alone.
- **Cosmic:** density 2.2 → 0.7 (211 particles → ~67), shooting-star ratio 10%
  → 4% (rarer = more impactful), 18% of stars now "big" (brighter, 1.4–2.8px) to
  carry the void without crowding.
**Rejected:** Plain sine-only waves (felt flat, "oscilloscope" was the owner's
read). 211-particle cosmic (looked like a sparkle texture, not a void).
**Learning:** A particle concept fails when it loses its METAPHOR. Waves need
foam to read as water. A void needs emptiness to read as void. Density is part
of meaning, not just texture.

## D-25 · Pass H+ — Player breathability over aggressive compression
**Picked:** Reverted Pass G's aggressive player shrink. Orb back to 170px
(was 140; original 180), SpiralMark 52 (was 44, original 56), play button 68
(was 62, original 72), padding 54/26/32 (was 48/24/28). Kept the inline
label-beside-slider layer format because it earned its space-savings.
**Why:** Owner feedback — the orb felt cramped and the controls felt
proportionally small to the screen. The fix-it goal was "fit on one screen
without scrolling," not "shrink everything." Inline sliders saved ~96px on a
4-layer player, which alone fixes the overflow.
**Learning:** When solving a fit problem, find the ONE element that's
disproportionate to the goal. Don't shrink everything by a uniform 30%.

## D-24 · Pass G+ — Slow Tide gains a fourth layer (Gulls)
**Picked:** Added a `seagulls` LayerId with `buildSeagulls()` procedural fallback,
slotted in as Slow Tide's 4th layer at a deliberately quiet 0.18 default.
Layers now: Waves · Gulls · Sea breeze · Deep.
**Rejected:** Replacing an existing layer (e.g. dropping `drone`'s "Deep"). The
soundscape lost a layer to gain one — net zero.
**Why a 4th, not a swap:** Gulls are *occasional* in nature, not a constant
texture. They want to live alongside the constant tide bed, not replace any of
the existing fixtures. The 4-layer cap fits in the Pass-G-compressed player
without scroll. The procedural fallback (sparse downward-glide cries every
4–9s) cleanly degrades when the file's absent.
**Learning:** Adding a layer earns its place when it adds a *time signature* the
existing layers can't (gulls are punctuation, not background).

## D-23 · Pass G — Bolder per-soundscape palettes (more atmospheric shift)
**Picked:** Aggressively hue-shifted palettes that commit hard to each soundscape's
environment — rain = steel blue, hearth = ember orange, fairy = magenta, underwater
= teal. Zero purple bleed-through.
**Why:** Previous palettes shared too much lavender undertone — they all read as
"slightly different shade of Somnia." User couldn't *feel* the soundscape switch.
The brand stays Pure Indigo *outside* the soundscape; inside, immersion wins.
**Trade-off:** Breaks brand-monochrome inside the player. Intentional — the player
IS the soundscape, not the brand surface.

## D-22 · Pass G — Meditation IS the orb
**Picked:** Hero breathing orb dominates the screen — phase label + live breath
count inside it. Chapter segment bars + play button shrink to thin strip at bottom.
**Rejected:** Earlier layout had segment-bar chapter markers near the orb. Read as
podcast-player chapters, not meditation. Felt like a media UI, not an experience.
**Learning:** The bigger the central element, the more the surrounding UI should
recede. Don't let the controls compete with the practice.

## D-21 · Pass G — Single brand particle: dust
**Picked:** `dust` as the default particle concept for hero screens (Tonight,
GoodMorning). Per-soundscape concepts (cosmic, waves, embers, fireflies, …) still
apply *inside* their soundscape. Density is a user pref (off / subtle / standard).
**Rejected:** `motes` (too generic, screensavery); `constellation` (interesting
"sleep-map" angle but adds visual noise on dense screens); `starfield` (too static).
**Why dust:** liminal, breathy, doesn't compete with content. The atmosphere
gradient is doing the heavy emotional lifting; the field's job is presence, not
spectacle.

## D-20 · Pass F — Reduced motion as a real persisted toggle
**Picked:** `prefs.reducedMotion: boolean` in PlanProvider, drives a
`data-reduced-motion` attribute on `.phone-shell` + a CSS rule that mirrors the
`prefers-reduced-motion: reduce` media query.
**Why:** The OS-level media query can't be programmatically toggled. Building it
into the app makes accessibility *visible* and recoverable — the user can opt in
without changing OS settings.

## D-19 · Pass F — `.screen-body` scrollable inner layer
**Picked:** `.screen` becomes `overflow: hidden`; a new `.screen-body` inside is
`position: absolute; inset: 0; overflow-y: auto`. Atmosphere + field sit outside
the scroll layer so they stay full-bleed.
**Bug it fixed:** Atmosphere blobs and particle field scrolled with the content,
cutting off the backdrop near the top on long pages (Profile, Sleep, JournalCompose).
**Learning:** Fixed backdrops behind scrollable content always need a separate
scroll layer — even on a phone where you don't think about it.

## D-18 · Pass F — Cosmic + Waves added as concept-specific particle types
**Picked:** New canvas particle types: `cosmic` (tiny stars + 10% shooting stars
with trails) for Deep Drift, `waves` (sine curves rolling across width) for Slow
Tide. Both use the existing single-rAF / sprite scaffolding.
**Why:** These soundscapes had personality the generic concepts couldn't carry.
Cosmic needed depth/void + occasional motion; waves needed actual wave geometry.
**Caveat:** Each new concept adds branches to the draw loop. Worth it for the two
soundscapes that needed it — adding more should be resisted unless they earn it.

## D-17 · Pass F — Pixabay CC0 loops over procedural-only
**Picked:** Hybrid engine: `sampleLayer(name, opts, fallback)` prefers
`/audio/<name>.ogg` then `.m4a`, falls back to the original procedural builder.
Loops sourced from Pixabay (CC0, free, no attribution).
**Rejected:** Wikimedia Commons (too sparse / low-quality); procedural-only (less
immersive); custom recording (out of scope for a portfolio prototype).
**Engineering win:** Zero regression — the engine still runs on full synth if files
are missing. Adding a file auto-upgrades that layer. The reactive analyser tap +
reverb graph is identical either way.

## D-16 · Pass E — Soundscape colour breaks brand monochrome
**Picked:** Each soundscape commits to its own hue palette in
`SOUNDSCAPE_PALETTES` — overt, not subtle.
**Rejected:** Keeping everything in the indigo family (too samey, soundscapes
felt interchangeable).
**Brand rule:** Pure Indigo outside the soundscape; the soundscape is the
deliberate exception. This is the only place in the app that breaks monochrome.

## D-15 · Pass D — Moonstone yes, Dusk Rose no
**Picked:** Two themes: Pure Indigo (default) + Moonstone (cooler indigo variant).
**Rejected:** Dusk Rose was built then cut — warm tones fought the night-time mood.
Sleep is cold. Warm colour at 11pm reads as morning/sunset, not rest.
**Learning:** Personalization isn't free choice. It's "two correct moods for the
same job."

## D-14 · Pass C — Per-soundscape particle identity
**Picked:** Each soundscape declares a `concept` in its palette
(rain→rain, hearth→embers, cedar→fireflies, etc.). GenerativeField precedence:
`override (dev) ?? per-soundscape ?? 'dust'`.
**Why:** Particles are an identity feature — rain falling for Light Rainstorm,
embers rising for Hearth. Universal "motes everywhere" wasted the moment.

## D-13 · Pass C.1 — FieldConceptSwitcher gated to dev only
**Picked:** `import.meta.env.DEV` gate; verified tree-shaken from prod build.
**Why:** Dev override is useful for auditioning concepts at any soundscape during
design iteration — but shipping all 11 concepts to users would be overwhelming
and pull focus from the content.

## D-12 · Pass W3 — CSS-var driven motion, no per-frame React re-renders
**Picked:** Amplitude / breath / night-progress flow through CSS custom properties
on `.phone-shell`. Each has one writer (single-owner rule).
**Rejected:** Putting amplitude in `AudioProvider` state (per-frame re-render
storm); using a state library (over-engineering for one number).
**Result:** Reactive atmosphere with zero React re-renders per frame. Trivial to
audit performance.

## D-11 · Pass W3 — Audio analyser as a passive tap
**Picked:** `analyser = ctx.createAnalyser()`, `busInput.connect(analyser)` — a
sink only, never routed onward. Cannot alter audio.
**Why:** Reactivity must not change what the user hears. A/B audio with/without
the analyser must be byte-identical.

## D-10 · Pass W2 — Simulated clock, not wall-clock
**Picked:** `ClockProvider` is event-driven (`evening`/`winding-down`/`asleep`/
`dawn`/`morning`). Status bar reads `useClock().clockLabel`. Time advances only
at the 3 transition events.
**Rejected:** Wall-clock (demo would look different at 3pm vs 3am — bad for a
portfolio piece a recruiter opens at random times).
**Learning:** Demos need *legible* time, not real time.

## D-9 · Pass W2 — TimeCompression as a felt night passage
**Picked:** ~6s eased rAF sequence (atmosphere deep→dawn, hour counter accelerating,
orb fades, audio fades out). Replaces an instant `navigate('/morning')`.
**Why:** "Skip to morning" was the most contrived moment in the loop. Now it's a
mini-cinematic that earns the morning state.

## D-8 · Pass W1 — Consequence: night I ran produces the morning I earn
**Picked:** `SessionProvider` records the actual choices; `score.ts` is
deterministic (no `Math.random`); `mergedSessions()` blends real logs with a seeded
backfill. Curated strong night seeded as the most recent if history is empty.
**Why:** The whole prototype was reading from a fixed seed (`SESSIONS[29]`) — every
GoodMorning was score 94 regardless of choices. Loop felt fake.
**Trade-off — seeded strong first night:** A recruiter opening the link sees a
polished dashboard, not an empty state. Once they run a Night themselves, their
real session takes over. Demo-friendly *and* honest.

## D-7 · Pass A — Italics scoped to media-title register only
**Picked:** Italic stays for *track-title* uses (soundscape names, meditation
titles, dream-journal titles, "Rest, deliberately."). UI labels and headlines
upright.
**Rejected:** Italic-by-default for serif headlines (felt floral / decorative).
**Why:** Italic carries the brand's literary warmth where it reads as "the name
of a thing." Outside that, it just feels affected.

## D-6 · No Three.js / R3F (Tier C deferred)
**Picked:** Tier A (reactive existing-stack atmosphere) + Tier B (one hand-rolled
2D canvas field). No WebGL shader scene.
**Rejected:** True WebGL volumetric nebula (Tier C) — would add 80–150kb gzipped,
shader code to maintain, mobile-GPU risk inside a fixed 390×844 frame.
**When Tier C earns the cost:** If/when the case-study site needs a hero moment.
For "de-risk + ship a portfolio piece," Tier A+B clears the bar.

## D-5 · No Tailwind — inline styles + CSS custom properties
**Picked:** CSS vars in `src/index.css` + inline `style={{}}` objects.
**Rejected:** Tailwind (which the sibling Blackboard project uses).
**Why:** Somnia's design is dynamic — colours, sizes, and motion driven by data
(soundscape palettes, amplitude, phase). Tailwind's utility classes don't compose
well with runtime values. Inline style is honest about it.
**Trade-off:** Slightly more verbose; no automatic dark-mode variant system.
Accepted — the project is dark-mode only.

## D-4 · Pure Indigo over Soft Min / Glass / Cinematic / Bento
**Picked:** Pure Indigo direction (monochrome lavender bath on deep purple).
**Rejected through 5 rounds of feedback:** Soft Minimalism (too neutral, no mood);
Glassmorphism (already dated); Cinematic (too dramatic for nightly use); Bento
(grids feel like dashboards — wrong for "atmosphere").
**Learning:** A sleep app should feel like a *place* you go, not a *tool* you use.

## D-3 · Localized state, no backend
**Picked:** Everything in `localStorage` (`somnia.prefs.v1`, `somnia.sessions.v1`).
**Why:** This is a prototype; a server adds nothing to the demo and complicates
deployment. Local also makes "your data lives on your device" honest copy.

## D-2 · Fixed 390×844 phone frame, not responsive
**Picked:** `PhoneFrame.tsx` renders a hard-coded device chrome at iPhone 14 Pro
dimensions. App content is sized for that one viewport.
**Why:** Demo legibility. A responsive layout would force every choice through
3 breakpoints; the prototype's job is to show one perfect screen, not to be a
production app. Recruiters open this on desktop — the phone frame frames it.

## D-1 · React 19 + Vite + TypeScript, no framework on top
**Picked:** Plain React Router. No Next, no Remix, no state library.
**Why:** The app is ~5,900 LOC across 39 files. A framework adds opinions we
don't need (SSR, file-based routing, server components). Vite is fast, React 19
hooks are enough.
