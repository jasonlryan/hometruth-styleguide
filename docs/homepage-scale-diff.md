# Homepage Scale Diff (Measured)

This repo includes a script to measure computed typography + spacing on the homepage at fixed viewports, so we can compare "feels zoomed in" issues with real numbers (instead of eyeballing screenshots).

Measured on **2026-02-15** using `scripts/measure-homepage-scale.js`.

## What The Two Screenshots Are Showing (Developer Explanation)

The key visual clue is the header:

- Screenshot 1 shows a **desktop nav** (links like "About Us" + a CTA button).
- Screenshot 2 shows a **burger menu** (mobile/tablet layout).

That almost always means the screenshots were taken at **different effective CSS viewport widths**, typically because:

- the window width is smaller, or
- the browser is zoomed in (which reduces CSS px width and can trigger mobile breakpoints).

So part of the “everything is too big / zoomed in” feeling can be a breakpoint issue: at `lg` and up (Tailwind default `lg` is **1024px**), typography and vertical padding often jump.

Important: if you compare two screenshots taken at different effective viewport widths, the conclusion about “which site is bigger” can flip. Always compare computed CSS at the same breakpoint.

## Measured Numbers (hometruth.io vs this repo)

Run:

```bash
node scripts/measure-homepage-scale.js --url https://hometruth.io --out .context/hometruth-live-scale.json
node scripts/measure-homepage-scale.js --url http://127.0.0.1:3010 --out .context/manama-local-scale.json
```

### Hero: "Make smarter decisions with HomeTruth"

Viewport: `875x820` (common when you see a ~1750px wide screenshot on a retina display)

- `hometruth.io`
  - Hero title font-size: **36px**
  - Hero section padding-top/bottom: **48px / 48px**
- This repo (local)
  - Hero title font-size: **30px**
  - Hero section padding-top/bottom: **96px / 96px**

Viewport: `1440x900` (desktop)

- `hometruth.io`
  - Hero title font-size: **36px**
  - Hero title line-height: **40px**
  - Hero section padding-top/bottom: **48px / 48px**
- This repo (local)
  - Hero title font-size: **48px**
  - Hero title line-height: **48px**
  - Hero section padding-top/bottom: **128px / 128px**

### "Ask HomeTruth" Heading

Viewport: `875x820`

- `hometruth.io`: **48px**
- This repo (local): **20px**

Viewport: `1440x900`

- `hometruth.io`: **48px**
- This repo (local): **24px**

## Where These Sizes Come From In This Repo

- Hero font sizes are driven by `.type-hero` in `app/globals.css`.
  - Current: `text-3xl lg:text-5xl` (30px at small, 48px at `lg`+).
- Hero vertical spacing is driven by:
  - `components/banner.tsx` default section padding: `py-16 lg:py-24` (64px / 96px)
  - plus the homepage override in `app/page.tsx`: `className="!py-24 lg:!py-32"` (96px / 128px)

So on large screens, the homepage is explicitly opting into **very large vertical padding** and a **large hero type ramp**.

## Designer-Friendly Change Targets (If The Goal Is “Less Zoomed In”)

If you want the hero to behave closer to `hometruth.io` (based on the 2026-02-15 measurement above), the practical targets are:

- Hero title: ~`36px` at desktop (Tailwind `text-4xl`) instead of `48px` (`text-5xl`)
- Hero section padding: ~`48px` top/bottom (Tailwind `py-12`) instead of `96-128px` (`py-24/py-32`)

Concrete places to tweak:

- `app/page.tsx`: reduce/remove `Banner` `className="!py-24 lg:!py-32"`.
- `components/banner.tsx`: change the default `py-16 lg:py-24` if you want the smaller scale everywhere Banner is used.
- `app/globals.css`: adjust `.type-hero` (and optionally `.type-body-lg`) so desktop typography doesn’t jump as hard at `lg`.
