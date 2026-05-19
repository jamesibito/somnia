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

## Pass C — Per-soundscape visuals + colour (later)
- Distinct atmosphere/particle palette per soundscape (rain vs tide vs fire vs
  drone); phase-driven colour shifts.

## Pass D — Ship the skins/themes (later)
- Wire real Dusk Rose + Moonstone personalization themes (Profile theme picker
  currently shows them as "soon" placeholders).

## Known-good (don't regress)
- The loop is consequential (W1), the clock + night passage (W2), reactive
  atmosphere / breath / now-playing / generative field (W3). All CSS-var
  driven, reduced-motion safe, no heavy deps.
