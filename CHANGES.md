# NEXUS Spectacle — creative pass

Drop the `src/` folder from this zip into your project (it mirrors your
existing structure, so files just overwrite/merge in place).

## New sections (added to `App.tsx`)
- **ColorStudio** (`src/sections/ColorStudio.tsx`) — interactive finish
  picker. Four swatches (Onyx / Glacier / Moss / Dusk) live-recolor the
  glasses illustration and its HUD accent. This is the "signature" moment.
- **Comparison** (`src/sections/Comparison.tsx`) — a real spec table (built
  on your existing shadcn `Table`) pitting NEXUS against a smartphone and
  legacy AR glasses.
- **Testimonials** (`src/sections/Testimonials.tsx`) — three early-wearer
  quotes with initials-avatars (no photos required, so nothing to source or
  license).
- **FAQ** (`src/sections/FAQ.tsx`) — five questions on your existing
  `Accordion` component.

## Fixed / upgraded
- `Demo` is now enabled in `App.tsx` (it was commented out) and its
  "Processing" / "Connected" tabs no longer point at a missing
  `.mp4` — they use small inline SVG animations (a live waveform, animated
  signal rings) instead.
- `Features`, `Experience`, and `Specs` previously pointed at
  `/images/hero-spectacle.jpg`, `/images/ar-display.jpg`, and
  `/images/tech-specs.jpg`, none of which exist in the repo, so they were
  rendering as broken images. They're replaced with:
  - `src/components/GlassesIllustration.tsx` — an original SVG illustration
    of the frame (recolorable, animated HUD dot), used across Features,
    Specs, and the Demo/Studio sections.
  - A hand-built first-person AR HUD viewport in `Experience` (CSS + SVG —
    heart rate, turn-by-turn, connectivity readouts).
  - A labeled "exploded view" diagram in `Specs` using the illustration
    plus callouts for the hinge, chip, sensor, and audio driver.
- `Navigation` now links to `#compare` and `#faq` alongside the existing
  anchors.

## Why no photos/stock video?
Rather than hotlink stock photography of unknown license/rights (which also
tends to break over time), everything visual is either your existing
Three.js `NeuralNetwork` scene or original vector/CSS work that ships with
the code and renders instantly, in the site's own palette, at any size.
If you'd rather use real product photography/video once you have it, every
`GlassesIllustration` usage is a drop-in `<img>`/`<video>` replacement point.
