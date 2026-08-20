---
name: "Sara Kim — Soft Atlas"
description: "A quiet personal atlas printed in soft green ink."
colors:
  atlas-paper: "#e8ead8"
  atlas-ocean: "#dfe4cf"
  atlas-ink: "#334434"
  atlas-ink-soft: "#5d694f"
  atlas-sage: "#758064"
  atlas-land: "#dfe4cf"
  atlas-line: "#394e38"
  atlas-cream: "#f8f4e7"
typography:
  display:
    fontFamily: "Instrument Serif, Cormorant Garamond, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(3.25rem, 5.7vw, 5.75rem)"
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "clamp(1.55rem, 2.25vw, 2.15rem)"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "0.66rem–0.78rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.04em"
rounded:
  marker: "999px"
spacing:
  page-gutter: "clamp(1.25rem, 4vw, 4rem)"
  section: "clamp(5rem, 10vw, 9rem)"
components:
  atlas-marker:
    backgroundColor: "transparent"
    ringColor: "{colors.atlas-sage}"
    centerColor: "{colors.atlas-ink-soft}"
    rounded: "{rounded.marker}"
    size: "0.625rem"
  atlas-tooltip:
    backgroundColor: "{colors.atlas-cream}"
    textColor: "{colors.atlas-ink}"
    padding: "0.8rem 0.9rem"
---

# Design System: Sara Kim — Soft Atlas

## Overview

**Creative North Star: “Soft Atlas”**

Soft Atlas feels like a world map printed directly onto the page of a contemporary literary magazine. It uses a near-monochrome green vocabulary, flat light, calm motion, fine geographic contours, and expansive negative space. It borrows the measured paper-and-sage character of the `sarakim928` essay page without copying that site's composition.

The visual system is quiet but not austere: Instrument Serif supplies a narrow, high-contrast editorial voice for the largest homepage language, while the incumbent Geist sans remains the practical voice for navigation, supporting copy, metadata, and labels. Cormorant Garamond provides Cyrillic coverage within rotating greetings. The globe uses a procedural, non-repeating risograph grain clipped to land, with darker country contours for legibility.

**Key characteristics:**

- Paper-green page and globe ocean behave as one continuous surface.
- Near-paper land, deep green outlines, and sage registration markers form a compact palette.
- Typography carries hierarchy; cards, shadows, glows, and chrome are avoided.
- One oversized globe deliberately exceeds its bounded visual frame.
- Motion is slow, interruptible, and never required for comprehension.

## Colors

The palette is anchored to the measured colors of the supplied essay reference and tightened into map-specific roles.

### Primary

- **Atlas Paper** (`#e8ead8`): page background; the continuous paper field.
- **Atlas Ocean** (`#dfe4cf`): a near-paper sage tint that keeps the sphere legible over open water.
- **Atlas Ink** (`#334434`): primary text and focus indicators.

### Secondary

- **Printed Sage** (`#758064`): editorial headings and secondary land tone.
- **Atlas Land** (`#dfe4cf`): unfilled geography continuous with the ocean field.
- **Contour Green** (`#394e38`): defined but desaturated country boundaries.

### Neutral

- **Soft Ink** (`#5d694f`): body copy and metadata on paper.
- **Archive Cream** (`#f8f4e7`): marker faces and selected annotations.

### Named Rules

**The Printed-Into-the-Page Rule.** The globe surface and page surface must remain visually continuous. No blue ocean, atmosphere halo, enclosing card, or widget background.

**The One-Ink Rule.** New homepage color roles stay within paper, sage, deep green ink, and archive cream.

## Typography

**Display Font:** Instrument Serif (with Cormorant Garamond for Cyrillic, then Iowan Old Style and Georgia fallbacks)  
**Body Font:** Geist (with Arial and sans-serif fallbacks)  
**Label Font:** Geist

**Character:** Instrument Serif gives the hero the expressive, high-contrast tension of an editorial publication. Geist stays deliberately anonymous and functional for introductory support copy, navigation, geography, dates, annotations, and controls. The display serif remains scoped to the homepage rather than imposed across the blog.

### Hierarchy

- **Display** (400, `clamp(3.25rem, 5.7vw, 5.75rem)`, 0.94; mobile from `2.8rem`): homepage greeting and primary editorial statement.
- **Intro** (400, `clamp(1.55rem, 2.25vw, 2.15rem)`, 1.23): the lead supporting statement.
- **Supporting body** (400, `0.92rem–1.16rem`, 1.65–1.75): biography and context, kept near 65 characters per line.
- **Label** (400–500, `0.66rem–0.78rem`, up to `0.04em` tracking): map instructions, place types, and metadata.
- **Annotation** (400, `1.28rem`, 1.1): a selected place name only.
- **Section title** (500, `clamp(1.35rem, 2vw, 1.65rem)`): occasional editorial section headings.

### Named Rules

**The Two-Voice Rule.** Serif speaks personally; sans-serif orients and labels.

## Layout

Desktop uses a split first viewport: personal introduction on the left and an oversized globe on the right. A dedicated, invisible-edged globe viewport reveals roughly 55–65% of the sphere and crops the rest inside the composition, independent of the browser edge. The globe never sits in a card. Its renderer is anchored inside that bounded frame and capped at a deliberate maximum size so wider viewports do not reveal the full sphere.

Below `760px`, content becomes sequential: introduction first, globe second. The mobile sphere remains larger than its available frame and is cropped deliberately rather than scaled down into a conventional thumbnail. Horizontal page scrolling is never permitted.

## Elevation & Depth

The system is flat by default. Depth comes from the sphere's form, layered geographic marks, and overlap—not shadows. Globe lighting stays ambient and matte; annotations use opaque paper rather than floating glass.

## Shapes

The dominant form is the globe itself. Geographic outlines are hairline and markers are tiny circles. Rounded rectangles are not a page-building primitive; the only fully rounded recurring form is the physical marker dot.

## Components

### Navigation

The homepage intentionally has no persistent top navigation. Its opening composition begins directly with Sara's greeting and atlas, without template chrome competing for attention.

### Atlas Globe

- **Surface:** matte Atlas Ocean sphere with restrained dark-sage procedural grain clipped to land and defined Contour Green borders; never a hex, tiled, or halftone pattern.
- **Motion:** extremely slow idle rotation; direct dragging suspends rotation; zoom and pan are disabled.
- **Crop:** deliberately oversized and clipped inside a dedicated, invisible-edged globe viewport.
- **Caption:** a small Geist annotation follows an SVG text path just outside the globe's lower visible circumference; the crop reserves space for it, and it never intercepts globe interaction.
- **Fallback:** the location index remains usable if WebGL is unavailable.

### Atlas Marker

- **Shape:** a true geographic anchor, hairline leader, and tiny transparent registration mark with a printed-sage ring and deep-sage centre.
- **State:** hover expands the hairline ring once; selection quietly deepens the mark and updates the archive annotation.
- **Tooltip:** opaque cream, square-to-soft corners, quiet sans-serif place name and metadata.
- **Behavior:** screen-space `displayOffset` values separate dense clusters without changing latitude/longitude; isolated markers use short stems. No pulse, radar ring, chunky pin, or glow.

## Do's and Don'ts

### Do:

- **Do** keep the map readable through tonal contrast instead of glossy light.
- **Do** let geography and type create the page's visual interest.
- **Do** keep marker data independent from the rendering component.
- **Do** preserve touch dragging and reduced-motion behavior.

### Don't:

- **Don't** introduce blue oceans, neon, atmosphere glow, cyber grids, or conventional NASA imagery.
- **Don't** wrap the globe or annotation in a visible card system.
- **Don't** add full-page grain, distressed paper filters, animated grain, or decorative shader noise outside the land mask.
- **Don't** make unfinished memory destinations look like working links.
