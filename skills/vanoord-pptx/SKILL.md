---
name: vanoord-pptx
description: Create PowerPoint presentations in the Van Oord corporate style. Use this whenever the user asks for a Van Oord deck, a presentation for Van Oord, a slide deck for Van Oord, or any PowerPoint that needs to use Van Oord branding, Van Oord template, Van Oord fonts, Van Oord colors, or the Van Oord corporate identity. Also trigger for phrases like "make a Van Oord presentation", "Van Oord slides", "deck in Van Oord style", "branded deck for Van Oord", "use our Van Oord template", or any request that implies the output is intended for internal Van Oord audiences, Van Oord management, Van Oord IT, or Van Oord stakeholders. Use even when the user does not mention PowerPoint explicitly but asks for a presentation, deck, or slides for Van Oord.
---

# Van Oord PPTX skill

## Purpose

Produce `.pptx` decks that inherit Van Oord's slide masters, layouts, fonts, logo, and color scheme from the bundled template. Content is supplied by the user. The skill enforces brand consistency and a compositional style proven on prior Van Oord decks.

## Always start here

1. Read `assets/vanoord_template.pptx` as the starting Presentation object in python-pptx. Never build from a blank deck.
2. Copy the template to an output path before editing so the source stays clean.
3. Ask the user for 1-3 clarifying questions before generating the deck unless the request is fully specified: audience, tone, depth, number of slides, whether a specific layout is required. Skip this only if the user has already given explicit direction.
4. If the user has supplied content (outline, bullets, tables, data), use exactly that content. Do not invent domain facts or numbers. If values are missing, flag them and ask or label as "illustrative".

## Brand specification

Extracted directly from the template and must not be overridden unless the user asks explicitly.

| Dimension | Value |
|---|---|
| Slide size | 13.333 x 7.5 inches (16:9 widescreen) |
| Major font (headings) | Arial Black |
| Minor font (body) | Arial |
| Monospace for code or identifiers | Consolas |
| Accent 1 (primary navy) | `#253A79` |
| Accent 2 (signal orange) | `#FF8702` |
| Accent 3 (steel blue) | `#A8B0C9` |
| Accent 4 (amber) | `#FFA43F` |
| Light fill | `#F2F2F2` |
| Dark text | `#262626` |
| Supporting navy shades used in practice | `#1C4B8A`, `#2460A7` |

Prefer the theme's built-in color references (ACCENT_1, ACCENT_2, etc.) when setting fills, so if Van Oord updates the theme, the deck tracks.

## Available layouts

23 layouts live in the template. Pick the one closest to your slide's intent. Full catalogue in `references/layouts.md`. Quick picks:

| Layout index | Name | Use for |
|---|---|---|
| 1 | Title Slide | Opening slide, title, author, date |
| 2 | TEXT ONLY | Pure narrative, no visual |
| 3 | AGENDA | Agenda or chapter overview |
| 10 | CHAPTER/SUMMARY | Section divider |
| 12 | CUSTOM (EMPTY SLIDE) | Any bespoke layout built with shapes. Preferred when composing dense content or tables |
| 13 | TEXT + GRAPH | Narrative with chart |
| 15 / 16 | GRAPHS WITH ICONS 2X / 4X | Metric cards with icons |
| 17 | GRAPH COMPARE | Before/after or A/B |
| 18 | TEXT + TABLE | Narrative with table |
| 19 | TABLE | Full-slide table |
| 20 | CONTACT SHEET | Closing contact slide |

Read `references/layouts.md` when picking a layout for the first time in a session.

## Composition rules

These patterns came from building the IT Roadshow deck and work reliably in this template.

### Title and subtitle

Every content slide starts with a title at the top. Keep it short and declarative. Subtitle is one line, explains the "so what".

- Title: Arial Black or Arial Bold, 22-28pt, color `#253A79`.
- Subtitle: Arial, 12-14pt, color `#555555`.
- Place title near y = 374000 EMU, subtitle near y = 672000 EMU. Width matches the layout's title placeholder (8.7 million EMU).

### Dense detail slides (tables, data, schema)

For anything that requires object names, field names, identifiers, or structured comparisons: use layout 12 CUSTOM (EMPTY SLIDE) and build the grid with rectangles, not the native PPTX table. You get:

- Consistent cell padding
- Per-cell font overrides (monospace for table names and keys, bold for foreign keys, orange for primary keys)
- Zebra striping
- Exact column widths

Use the `grid` helper in `scripts/vanoord_helpers.py`.

### Anchor callouts

If one object on the slide is the anchor (the thing everything else refers to), color it `#FF8702` with white bold text. This matches the pattern "Business Application is the anchor record" used elsewhere in Van Oord decks.

### Bottom strips

Reserve the bottom ~4-5% of the slide for a one-line key message. Fill navy or orange, white text, Arial 10-11pt. This is the "say this out loud" line.

### Arrows and flow

For horizontal flow diagrams use `MSO_SHAPE.RIGHT_ARROW`. For vertical use `MSO_SHAPE.DOWN_ARROW`. Fill with `#FF8702` or a mid-grey `#888888`. Never use arrows inside tables.

### What to avoid

- Plain title-plus-bullets slides. Every slide needs at least one visual element: icon, chart, colored shape, table, or image.
- Accent lines or underlines under titles. The template does not use them and they read as AI-generated.
- Blue by default. Use the palette's orange for emphasis, navy for structure.
- Centered body text. Left-align everything except titles and one-line key messages.
- Inventing data. If you don't have the value, use "TBD" and tell the user in the summary.

## Working procedure

```text
1. Clarify (if needed) -> 1-3 targeted questions via AskUserQuestion
2. Copy assets/vanoord_template.pptx to the output folder
3. Plan the slide list with the user (title + one-line purpose per slide)
4. For each slide: pick layout, write content, add visual element
5. Render to PDF via LibreOffice, convert first and last slide to JPG, inspect
6. Fix issues, rerender, inspect again
7. Deliver the .pptx with a computer:// link and a short summary
```

Always do step 5 and 6. The LibreOffice render reveals spacing, overflow, and contrast bugs that python-pptx will happily accept.

## Helper script

`scripts/vanoord_helpers.py` provides:

- `load_template(output_path)` copies the template and returns a Presentation object
- `add_title(slide, title, subtitle=None)` places the brand-styled title block
- `text_box(slide, left, top, w, h, text, **opts)` is the universal text-block builder used across all Van Oord decks (zebra tables, KPI cards, headers). Supports font, size, bold, color, fill, alignment, padding, border.
- `grid(slide, left, top, w, h, headers, rows, **opts)` renders a dense table with zebra rows, monospace cells where flagged, navy header row.
- `bottom_strip(slide, text, color='navy'|'orange')` adds the one-line key message.
- `save_and_render(prs, output_path)` saves and runs LibreOffice to produce a PDF for QA.

Use these instead of reimplementing each time. The patterns in the helpers came from the IT Roadshow deck and were battle-tested.

## Composition inspiration

The original Van Oord IT Roadshow deck is the reference for tone and composition, not content. When in doubt about "how would Van Oord usually do this", pattern-match against the following slide archetypes seen in prior decks:

| Archetype | Typical layout | What it shows |
|---|---|---|
| Opening | Title Slide or CHAPTER/SUMMARY | Title, author, date, no clutter |
| Reality vs vision | 2x2 grid on CUSTOM layout | Current state left, target state right, bold headers |
| Phased plan | 4 columns of bullets on CUSTOM | One column per phase, navy headers, 3-5 bullets each |
| Persona | 2-column layout on CUSTOM | Persona name + quote on left, "today vs tomorrow" pairs on right |
| Data contract or schema | Full-slide table on CUSTOM via grid() | Object, field, type, source, key |
| Worked example | 2x2 system boxes on CUSTOM | One box per source system with PK in orange, FK in navy bold |
| Closing | CONTACT SHEET or TEXT ONLY | Short action statement |

Do not copy text from prior decks. Copy structure, colors, typography, and spacing.

## Error handling and guardrails

- If `assets/vanoord_template.pptx` is missing or corrupt, stop and tell the user. Do not fall back to a blank deck.
- If the user asks for content that conflicts with Van Oord brand (different colors, different fonts), confirm once. If they still want it, comply but note that the deck no longer matches the Van Oord corporate style.
- If a slide's content does not fit the chosen layout, prefer switching to layout 12 CUSTOM and building with shapes. Do not squeeze.

## Handoff to the user

Final message always includes:

- A computer:// link to the `.pptx`
- A bullet list of any values that are illustrative or TBD
- A reliability score as a percentage
- The single most useful next step

This matches user preference for structured, dense delivery.
