---
name: 1992 Land
description: Giá Trị Kiến Tạo Lòng Tin. Môi giới BĐS HCMC, dựng như một tờ lịch con nước trên nền navy.
colors:
  navy-950: "#071121"
  navy-900: "#0D1E38"
  navy-800: "#0F2040"
  navy-600: "#192F52"
  navy-100: "#D0D9EA"
  navy-50: "#EEF2F8"
  gold-300: "#E8C978"
  gold-100: "#F8EDD2"
  gold-900: "#63491A"
  sand: "#F8F5F0"
  ink: "#18181B"
  hairline-gold: "rgb(232 201 120 / 0.3)"
  hairline-navy: "rgb(13 30 56 / 0.15)"
typography:
  display:
    fontFamily: "Archivo, sans-serif"
    fontSize: "7.5rem"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 75"
  headline:
    fontFamily: "Archivo, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 75"
  label:
    fontFamily: "Archivo, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    letterSpacing: "0.025em"
    fontVariation: "'wdth' 75"
  body:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  numeric:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    fontFeature: "tnum"
rounded:
  none: "0px"
spacing:
  section-y: "64px"
  section-y-lg: "80px"
  row-y: "16px"
  gutter: "16px"
components:
  button-primary:
    backgroundColor: "{colors.gold-300}"
    textColor: "{colors.navy-950}"
    rounded: "{rounded.none}"
    padding: "12px 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.gold-100}"
  ruled-row:
    textColor: "#ffffff"
    padding: "16px 0"
  data-panel:
    backgroundColor: "{colors.sand}"
    textColor: "{colors.navy-900}"
    rounded: "{rounded.none}"
    padding: "20px 32px"
  input-field:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    height: "48px"
---

# Design System: 1992 Land

## Overview

**Creative North Star: "Lịch con nước"**

The site reads like a tide calendar pinned to a navy wall. Every page sits on a drenched navy ground that deepens section by section (navy-950, 900, 800), and every fact (location, scale, price, payment schedule) is a ruled row with a hairline gold rule, the way a tide table lists hours. Gold is the sun on that water: used for headings, numerals, rules and the single action color. Sand paper appears only where data must be read as data.

The voice is calm and plain, matching a broker who stands behind his name. Headings are condensed uppercase Archivo, large and short; body is Be Vietnam Pro for Vietnamese diacritics at comfortable size; numbers are Inter with tabular figures. Corners are square. Depth is tonal, never shadowed.

**Key Characteristics:**
- Navy-drenched pages stepping darker or lighter per section; no white page bodies on landing and home surfaces.
- Facts in hairline-ruled rows, not icon-card grids.
- One action color (gold-300) with navy-950 text.
- Square corners, no shadows, no nested cards.
- Sand panels (#F8F5F0) only for tabular or numeric data.

## Colors

Deep navy ground, one warm gold voice, sand paper for data. Values defined in `app/globals.css` `@theme`.

### Primary
- **Tide Gold** (gold-300): headings, row labels, numerals on navy, hairline rules (at 30% alpha), focus ring on navy, the scroll gauge, and the primary button fill.
- **Pale Foam Gold** (gold-100): button hover, secondary emphasis text on navy.

### Secondary
- **Deep Harbor Navy** (navy-950, navy-900, navy-800): page and section grounds, header, lead band. navy-600 appears as secondary text on sand.

### Neutral
- **Sand Paper** (sand): data panels only (payment tide, price list).
- **Mist Navy** (navy-100, navy-50): secondary and body text on navy.
- **Ink** (ink): text in form fields.
- **Burnt Gold** (gold-900): price figures on sand panels.

### Named Rules
**The Gold-Is-The-Sun Rule.** Gold carries headings, numbers, rules and the one action. Never use it as a large fill other than the button.
**The Sand-For-Data Rule.** Sand surfaces hold only ruled data (schedules, prices). Prose and imagery stay on navy.

## Typography

**Display Font:** Archivo variable, width axis fixed at 75 (narrow), uppercase (loaded in `components/maia/ui.tsx` as `maiaHead` with `NARROW`)
**Body Font:** Be Vietnam Pro (var --font-sans)
**Numeric Font:** Inter (var --font-numeric), tabular-nums

**Character:** A signage-grade narrow caps voice over a humane Vietnamese text face; numerals in their own tabular face so columns align.

### Hierarchy
- **Display** (800, 3.5rem mobile / 6rem sm / 7.5rem lg, 0.92): page H1, home H1 reaches 8rem at xl.
- **Headline** (800, 2.25rem / 3rem / 3.75rem, 1.02, text-balance, gold-300): section H2, one line, standalone, no sub-label.
- **Label** (700, 1.125rem, 0.025em tracking, uppercase, gold-300): row keys (`dt`) and year labels.
- **Body** (400, 1rem to 1.125rem, 1.625): max 65ch prose.
- **Numeric** (700, 1.125 to 1.25rem, tabular-nums, Inter): prices, percentages.

### Named Rules
**The Narrow Caps Rule.** Archivo narrow uppercase is for headings and row keys only; running text never uses it.
**The Tabular Rule.** Any figure that sits in a column or row uses Inter with tabular-nums.

## Layout

Single column content in `max-w-6xl` (landing) or `max-w-7xl` (home, header) with 16/24/32px gutters at base/sm/lg. Sections use 64px vertical padding, 80px at lg. Section grounds alternate by depth, not by white and grey bands. Key/value facts use a two-column grid (11rem key, flexible value) from sm up, stacked below. Hero images bleed full width with a bottom-anchored title; aspect 4:5 on mobile, 16:9 at sm, ~2.2:1 at lg. A 3px gold "water gauge" (`.maia-gauge`) runs the right viewport edge and fills with scroll where scroll-timeline is supported. Touch targets are at least 48px (44px for header nav). Mobile first.

## Elevation & Depth

Flat. No box-shadows in the shipped landing and home surfaces. Depth is tonal: darker navy sections step against lighter ones, sand panels lift data against navy, and 1px hairlines separate rows. The only gradients are legibility scrims over photography (navy-950 to transparent under titles and captions).

### Named Rules
**The Flat-Tide Rule.** Separate with a hairline or a tonal step, never a shadow or a card within a card.

## Shapes

Square. Buttons, inputs, panels, images and the gauge have no radius; the 0.5rem and 0.75rem radius tokens in globals.css exist only for the internal dashboard's shadcn primitives. Form language is horizontal rules, full-width rows, and bars (payment bars are 16px tall rectangles in navy-800 on a 10% navy track).

## Components

### Buttons
- **Shape:** square (0px), min-height 48px.
- **Primary:** gold-300 fill, navy-950 text, 15px semibold, padding 12px 24px; used for every conversion action (CtaLink, header "Nhận tư vấn", lead submit). The CtaLink leads with a small calendar-check line icon.
- **Hover / Focus:** fill shifts to gold-100 over 200ms; focus is a 2px ring with offset in navy-950. Global focus outline turns gold-300 inside navy containers.
- **Text link action:** gold-300 semibold with arrow, hover shifts to gold-100 or white.

### Ruled Rows (signature)
- `Row` and `Ruled` render a 1px gold-300 at 30% top border, 16px vertical padding, narrow-caps gold key on the left and white text on the right. On the home page the latest-project row uses the same grammar as a full-width link.

### Data Panels
- Sand fill, navy-900 text, navy-900 at 15% row dividers, square. Payment rows are a three-column grid (year label, proportional bar, tabular percentage). Prices right-aligned in gold-900 Inter bold.

### Inputs / Fields
- White fill, ink text, 48px high, square, neutral-500 placeholder. Focus is a 2px gold-300 ring. Lead band lays form out in four columns at lg, stacked on mobile; success replaces the form with a translucent white panel; errors appear as an alert line.

### Navigation
- Fixed header, navy-950 with a gold 30% bottom hairline. Links 14px medium white, hover and active gold-300 (active is semibold with aria-current). Mobile uses a 48px hamburger and a full-width navy-950 drop panel with hairline-separated links and a full-width gold button.

## Do's and Don'ts

### Do:
- **Do** present facts as hairline-ruled key/value rows with Archivo narrow caps keys.
- **Do** put the dark ground under every section and step navy-950, 900, 800 for rhythm.
- **Do** use gold-300 for headings, numerals, and the one action; navy-950 text on gold.
- **Do** use Inter tabular-nums for every price, percentage and year figure.
- **Do** keep corners square and depth tonal.
- **Do** keep disclaimers (reference price, non-guaranteed revenue) in 14px navy-100 beneath the data they qualify.

### Don't:
- **Don't** put icon-card grids or oversized stat strips where a ruled row would do.
- **Don't** use sand surfaces for prose or imagery.
- **Don't** add shadows, rounded cards, nested cards, or decorative gradients.
- **Don't** put gold body text on sand; use burnt gold (gold-900) there.
- **Don't** set Archivo narrow caps on running text.

## Not canonized

Build carries these; they are defects or drift, not rules: `--font-display` (Fraunces) declared in globals.css but not used by the shipped surfaces; body background and text hard-coded (#F8F5F0, #1A1A1A) rather than token-referenced; `maiaSerif` (Cormorant) export kept only for the Thanh Phú landing; small hero captions and eyebrow-like "Mới nhất" row key on home is a row label, not a kicker pattern to extend; the stock dark scrollbar colors (#6D7E9A) and 3px radius.
