# Somnia — wrap-up punch list

Final polish before pausing the project. Split into focused passes (not one go).
Each pass = its own commit(s), typecheck + preview verify, push.

## Decisions
- **Italics: keep, scoped to the media/dream-title register only** (soundscape
  names, meditation titles, dream-journal titles, "Rest, deliberately."). They
  carry the brand's literary warmth and look good there. Headlines/UI labels
  stay upright (done in Pass 2). Action: audit + remove any stray italics
  outside that register; otherwise keep.

## Pass A — Believability + bugs  ✅ done (commit + push)
- [x] Floating-navbar / opacity bleed: TabBar now opaque behind icons
      (gradient solid to 76% + 14px backdrop blur, minHeight 84). Verified
      no content bleed on Tonight/Profile.
- [x] Dead-end interaction sweep — Profile fully wired: bedtime/nightly-goal
      steppers write real prefs (persist, feed the loop); Export = real JSON
      Blob download; Delete = two-tap confirm → real session reset; Privacy &
      theme-soon → transient toast; streak is now live (deriveStreak).
- [x] Stray-italics audit: kept italics in the media/dream-title + journal
      voice register; de-italicized 3 interactive affordances (GoodMorning
      "Remember a dream?" card, MeditatePlayer completion CTAs).
- [x] Believability nit: Profile streak/bedtime were static USER.* → now
      live from prefs + merged sessions (consistent with Tonight).

### Pass A — remaining nits noticed (carry to later passes)
- NightMode "{soundscape} is playing." italic sentence — borderline, left as
  dreamy voice; revisit if it reads off.
- Theme picker still shows Dusk/Moonstone as "Soon" (intended → Pass D).

## Pass B — Visual identity evolution  ✅ done (commit + push)
- [x] Refined shared primitives (Eyebrow tighter/fainter tracking; BigNumber
      tighter optical tracking + baseline) → propagates to every screen.
- [x] Recomposed the hero (Tonight): headline is now the clear focal point
      (size 40, tighter, cleaner accent — dropped the web-ish underline);
      secondary "shaped for" recedes; the score signature dominates the
      Last-night block; quieter legend; consistent 28/32/16 section rhythm.
- [x] Full zero-dead-ends sweep folded in (Alarm cyclers, Meditate toast).
- Note: this was a focused editorial pass, not a full restyle. Deeper
  type-scale tokenization left for a future pass if desired.

## Pass C — Per-soundscape visuals + colour  ✅ done (commit + push)
- [x] SOUNDSCAPE_PALETTES map (6 in-family but distinct moods); AtmosphereLayer
      gains a `colors` override, GenerativeField gains `tint` + `density` knobs.
- [x] Soundscape player: atmosphere + motes now palette-match the soundscape
      (verified Slow Tide cool-blue vs Hearth warm-dusk).
- [x] Library: each card's icon accent derives from its soundscape palette.
- [x] Phase colour: Tonight now uses the clock's atmosphere variant
      (evening→calm, dawn/morning→dawn).
- [x] Fixed Pass-B visibility regression (Eyebrow/legend/timestamps were too
      faint on the dashboard → back to readable `--color-text-muted`).
- [x] Profile colophon: full logo lockup, "A brand & app concept by James
      Ibitoye", origin line, Portfolio + Source links, SOMNIA · v0.3 · CONCEPT.

## Pass C.1 — Particle ideation  ✅ ideation done (branch: pass-c1-particle-ideation)
- [x] `GenerativeField` now carries a selectable `concept` (4 in-brand
      treatments): **motes** (current baseline), **dust** (sparse/calmest),
      **starfield** (tiny twinkling night-sky), **constellation** (sparse
      nodes + faint proximity links, amplitude-brightened — the "designed"
      signature). All share the single-rAF / sprite / reduced-motion /
      tab-hidden / DPR scaffolding; default stays `motes` so prod is
      unchanged.
- [x] `FieldConceptProvider` (localStorage-persisted) + dev-only
      `FieldConceptSwitcher` (gated by `import.meta.env.DEV`, verified
      tree-shaken from `npm run build`). Existing call sites untouched.
- [x] Verified live on Tonight: all 4 render distinctly, no console errors,
      typecheck clean, prod build excludes the switcher.

## Pass C.2 — Per-soundscape particle identity  ✅ (branch: pass-c2-c3-soundscape-identity)
- [x] 4 new concepts added: **embers** (Hearth), **fireflies** (Cedar
      Forest), **bubbles** (Slow Tide + Underwater), **fairies** (Fairy
      Forest). Plus motes/dust/starfield/constellation. Shared scaffolding.
- [x] `concept` added to `SOUNDSCAPE_PALETTES`; `GenerativeField` takes a
      `concept` prop. Precedence: dev override ?? per-soundscape ?? 'motes'.
      Switcher gained an "auto" chip (clears override → per-soundscape).
- [x] Map: rain→motes, cedar→fireflies, tide→bubbles, hearth→embers,
      static→starfield, deep-drift→constellation, fairy→fairies,
      underwater→bubbles(blue).

## Pass C.3 — Hybrid audio + 2 new soundscapes  ✅
- [x] `engine.ts` is now graceful-hybrid: `sampleLayer(name, opts, synth)`
      prefers `/audio/<name>.ogg|.m4a`, **falls back to the original
      procedural synth** if absent. Zero-regression: full synth today,
      auto-upgrades when loops are dropped in. `drone` stays synth.
- [x] New synth fallbacks authored: crickets, harp, bubbles, water.
- [x] New soundscapes: **Fairy Forest** (crickets+harp+leaves+glow,
      fairies particles) and **Underwater** (water+bubbles+pressure,
      lowpass character, blue bubbles). Palettes added.
- [x] `BRAND.md` Sound section revised to the hybrid rationale.
- [ ] **TODO (user-reminded): swap CC0 placeholders → Pixabay loops.**
      Needs a user-supplied Pixabay API key. CC0 sourcing from Commons was
      too sparse/low-quality; engine runs on synth until loops are added.

### Pass C-merge  ✅ done
- C.1 + C.2 + C.3 fast-forward merged to `main` (027af60 → a50dbbe), pushed.
  Feature branches preserved.

## Pass D — Personalization themes  ✅ (merged to main)
- [x] Moonstone (cold) `--color-*` token block in `index.css`, scoped
      `[data-theme="moon"]`; Pure Indigo stays `:root`. (Dusk Rose was
      built then cut in Pass E — warm tones fought the night mood.)
- [x] `theme` added to PlanProvider prefs (persisted); effect swaps
      `data-theme` on `<html>` so it applies app-wide + survives reloads.
- [x] Profile picker activated (no more "Soon"); selection from prefs,
      verified live — themes recolor every screen and persist on nav.
- [x] Folded-in particle tuning: dust less faint, fireflies denser +
      always-alive breathing glow.

## Pass E — Polish (visual punch + side-by-side themes)  ✅ (merged to main)
- [x] Rain particles type for Light Rainstorm (real falling streaks, not motes).
- [x] Bolder per-soundscape palettes — first attempt at breaking the purple
      monotony (revised harder in Pass G).
- [x] SpiralMark gains a subtle glow + slow ~6s breath on splash and while a
      soundscape plays. Stopped rotating (per feedback).
- [x] `/compare.html` static page — two iframes side-by-side
      (`?theme=indigo` vs `?theme=moon`, `?embed=1` suppresses dev switcher).
      Linked from Profile colophon. URL `?theme=` param wins over stored pref.

## Pass F — Cosmic, waves, audio, accessibility  ✅ (merged to main)
- [x] **Cosmic** concept for Deep Drift — black void, tiny yellow stars, ~10%
      shooting-star particles with bright head + tail gradient.
- [x] **Waves** concept for Slow Tide — rolling sine curves drawn across width
      via canvas path.
- [x] `.screen-body` inner scroll layer — fixes backdrop cutting off on
      scrollable screens. Atmosphere + field sit outside the scroll layer.
- [x] **Reduce motion** as a real persisted toggle. `prefs.reducedMotion`
      writes `data-reduced-motion` to `.phone-shell`; CSS rule mirrors the
      `prefers-reduced-motion` media query block.
- [x] SoundscapePlayer compressed (first attempt — refined further in Pass G).
- [x] MeditatePlayer redesigned (first attempt — refined further in Pass G).
- [x] Stage legend icons replace numbers on Last Night ("🌑 Deep · ✦ REM · ◌ Light").
- [x] **Pixabay CC0 audio loops** — `rain · thunder · wind · fire · crickets ·
      harp · bubbles · fairy · drone`. Engine still hybrid; falls back to synth
      for `tide` + `water` (unsourced).
- [x] Fairy Forest: replaced procedural `drone` "Glow" with a real `fairy`
      layer ("Shimmer") backed by `fairy_soundscape_base.mp3`. Engine gains
      `fairy` LayerId + `buildFairy()` procedural fallback.
- [x] SoundscapeLibrary cards: SVG icon per soundscape (CloudRain / Leaf /
      Waves / Flame / Radio / Moon / Sparkles / Droplets) replaces the `01/02`
      number. Italic removed from card titles.

## Pass G — Refine (player, meditation, palettes, audio mix)  ✅ (on branch `pass-g-refine`, pushed)
- [x] **dust** locked as default particle concept on hero screens (Tonight,
      GoodMorning). Per-soundscape concepts still apply inside their soundscape.
- [x] `prefs.fieldDensity: 'off' | 'subtle' | 'standard'` — 3-chip segment
      control in Profile › Appearance. Density baseline maps to 0 / 48 / 96
      particles. Reduce-motion still wins (skips field regardless).
- [x] **SoundscapePlayer compressed** — orb 180→140px, rings tightened,
      SpiralMark 56→44px, layer faders now have label inline with slider
      (saves ~48px). 4 layers fit on one screen without scrolling.
- [x] **MeditatePlayer redesigned** — the orb IS the experience now. 180px main
      orb + ambient glow + breathing ring border. Phase label + live breath
      count (1,2,3,4…) inside the orb. Glow + ring intensity shift with phase.
      Chapter segment bars + play button shrunk to thin strip at bottom — no
      more "static-bars-at-bottom" dead-end feel.
- [x] **Bolder palettes redux** — each soundscape now commits HARD to its hue.
      Light Rainstorm steel blue, Cedar deep green, Slow Tide ocean teal,
      Hearth ember orange, Fairy Forest magenta, Underwater teal-cyan,
      Deep Drift near-void black. Zero purple bleed-through.
- [x] **Audio: drone gets a file fallback** — `wind_drone.mp3` → `drone.ogg/m4a`;
      engine now uses `sampleLayer('drone', ..., buildDrone)`. Cedar/Fairy/
      Static/Deep Drift/Hearth all benefit.
- [x] **Audio: richer fairy mix** — `fairy.ogg` rebuilt as `fairy_soundscape_base`
      + `fairy_fly` + `fairy_fly2` layered at 0.38/0.28 volume, looped to 57s.
- [x] **Profile copy rewritten** — "Off by default — silence is the respectful
      default" → "Subtle feedback sounds for interactions"; "Nothing is sold,
      ever" → "No account, no sync, no servers"; etc.
- [x] **Version bumped** v0.3 → v0.4 in colophon.
- [x] **Source MP3s out of git** (rain.mp3 was 23MB) — only `.ogg` + `.m4a`
      tracked. README documents the unused/extra Pixabay files for future use.
- [x] SoundscapeLibrary: SVG icons replace numbers, italic off card titles.
- [x] Italic removed from SoundscapePlayer title.

### Pass G — open / not done
- [ ] **Source `tide.ogg` + `water.ogg`** — Slow Tide + Underwater still on
      synth fallback.
- [ ] `fairy_harp_ascending.mp3` is unused (alternate harp; could be a
      `harp-2` layer or just stay archived).
- [ ] iOS Safari real-device test (m4a fallback exists but never verified).

## Known-good (don't regress)
- The loop is consequential (W1), the clock + night passage (W2), reactive
  atmosphere / breath / now-playing / generative field (W3). All CSS-var
  driven, reduced-motion safe, no heavy deps.
- Player fits on one screen without scrolling (Pass G).
- Meditation feels like a meditation (Pass G).
- Each soundscape feels like its own place visually (Pass G).
- Hybrid audio: app fully playable with zero files; auto-upgrades as files arrive.

## Next-pass candidates (not started)
See `DECISIONS.md` for context behind earlier calls. Candidates worth considering:
- **Pass H — Case study site.** Probably the next move — see end of
  CLAUDE.md / the summary section. Diminishing returns on prototype polish.
- **Polish-only:** source the missing tide/water audio; iOS Safari sweep;
  Sleep/Hypnogram visual upgrade; Onboarding compression.
- **One Tier-C moment:** WebGL volumetric nebula as a single hero scene
  somewhere (NightMode intro? case-study landing?). Only worth the deps if it
  earns the hero moment.
