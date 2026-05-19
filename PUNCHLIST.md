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

## Known-good (don't regress)
- The loop is consequential (W1), the clock + night passage (W2), reactive
  atmosphere / breath / now-playing / generative field (W3). All CSS-var
  driven, reduced-motion safe, no heavy deps.
