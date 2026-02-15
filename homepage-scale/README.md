# Homepage Scale Issue (Feels “Zoomed In”)

The homepage can feel “zoomed in” when typography and vertical spacing are too large for a given viewport. The only reliable way to discuss this with developers is to compare **computed CSS** at the **same effective viewport/breakpoint** (not just screenshots).

This folder documents:
- what’s happening (in developer terms),
- the exact measured deltas between `hometruth.io` and this codebase,
- the recommended fixes (with specific files/classes to change),
- how to verify the change.

## What You’re Seeing In The Screenshots

The two screenshots are almost certainly taken at **different responsive breakpoints**:
- Screenshot A shows a **desktop header** (inline nav + CTA).
- Screenshot B shows a **burger menu** (mobile/tablet header).

That generally means the effective CSS viewport width differed (window size and/or browser zoom). In Tailwind, typography and spacing often jump at `lg` (default `1024px`).

Important: the “which one is bigger?” answer can **flip by breakpoint**:
- At desktop widths (`lg+`), this repo ramps the hero to `lg:text-5xl` and forces very large `py`, so it can be larger than `hometruth.io`.
- At burger-menu widths (around ~`875px` CSS width, typical of a ~`1750px` retina screenshot), `hometruth.io` can be larger than this repo.

## Measured Deltas (Computed CSS)

Measured on **2026-02-15** via `scripts/measure-homepage-scale.js` at fixed viewports.

Outputs:
- `.context/hometruth-live-scale.json`
- `.context/manama-local-scale.json`

### Hero: “Make smarter decisions with HomeTruth”

Viewport `875x820` (useful proxy for “~1750px wide on retina” screenshots):
- `hometruth.io`
  - `h1` font-size: **36px**
  - hero padding-top / padding-bottom: **48px / 48px**
  - "Ask HomeTruth" heading: **48px**
- this repo (local)
  - `h1` font-size: **30px**
  - hero padding-top / padding-bottom: **96px / 96px**
  - "Ask HomeTruth" heading: **20px**

Viewport `1440x900` (desktop):
- `hometruth.io`
  - `h1` font-size: **36px**
  - `h1` line-height: **40px**
  - hero section padding-top / padding-bottom: **48px / 48px**
- this repo (local)
  - `h1` font-size: **48px**
  - `h1` line-height: **48px**
  - hero section padding-top / padding-bottom: **128px / 128px**

## Root Cause In This Codebase

There are two main contributors:

1. **Homepage overrides Banner padding to be huge**
- `app/page.tsx` passes:
  - `className="!py-24 lg:!py-32"` which forces **96px** vertical padding (base) and **128px** at `lg+`.

2. **Hero typography ramps up at `lg`**
- `app/globals.css` defines `.type-hero` as:
  - `text-3xl lg:text-5xl` which becomes **48px** at `lg+`.

Supporting detail:
- `components/banner.tsx` also has a large default:
  - `py-16 lg:py-24` (64px / 96px), even before the homepage override.

## Suggested Fix (Designer-Friendly Targets)

Pick a target first:
- If the goal is “make this repo feel closer to `hometruth.io` on desktop”, reduce the desktop hero ramp and vertical padding here.
- If the goal is “make `hometruth.io` feel closer to this repo at burger-menu widths”, reduce typography/spacing in the `hometruth.io` codebase at that breakpoint.

For this repo specifically (desktop `lg+`):
- Desktop hero title size target: **~36px** (Tailwind `text-4xl`) instead of **48px** (`text-5xl`)
- Hero vertical padding target: **~48px** top/bottom (Tailwind `py-12`) instead of **96–128px** (`py-24`/`py-32`)

### Recommended Implementation (Minimal / Low Risk)

1. Reduce homepage hero padding
- File: `app/page.tsx`
- Change the `Banner` `className` from `!py-24 lg:!py-32` to something closer to `py-12 lg:py-12` (or remove the override entirely and rely on `components/banner.tsx` defaults).

2. Reduce hero typography ramp at `lg`
- File: `app/globals.css`
- Update `.type-hero` from `text-3xl lg:text-5xl` to a smaller desktop step, e.g. `text-3xl lg:text-4xl`.

### Alternative Implementation (Systemic)

If multiple pages reuse `Banner` and all of them feel “too big”, consider adjusting defaults:
- File: `components/banner.tsx`
- Reduce the default `py-16 lg:py-24` to a smaller baseline.

Do this only if you confirm the smaller spacing is desired across all Banner usage, not just the homepage.

## How To Verify

1. Run the local dev server:
```bash
npm run dev
```

2. Re-measure:
```bash
node scripts/measure-homepage-scale.js --url http://127.0.0.1:3010 --out .context/manama-local-scale.json
node scripts/measure-homepage-scale.js --url https://hometruth.io --out .context/hometruth-live-scale.json
```

3. Compare these key numbers at `desktop_1440`:
- hero title font-size
- hero padding-top/padding-bottom
And compare at `mid_875` if you’re debugging a burger-menu screenshot:
- hero title font-size
- "Ask HomeTruth" heading font-size

## Related Files

- Measurement script: `scripts/measure-homepage-scale.js`
- Homepage: `app/page.tsx`
- Banner component: `components/banner.tsx`
- Typography utilities: `app/globals.css`
