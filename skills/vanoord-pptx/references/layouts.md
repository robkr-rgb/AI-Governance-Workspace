# Van Oord template, slide layouts catalogue

23 layouts, exported from the Van Oord corporate template. Listed with index (use in python-pptx as `prs.slide_layouts[i]`), name, number of placeholders, and when to pick it.

| i | Name | Placeholders | Use when |
|---|---|---|---|
| 0 | LOGO | 1 | Logo-only slide. Rare. Section breaks or cover variants |
| 1 | Title Slide | 6 | Deck opener, title plus author and date |
| 2 | TEXT ONLY | 7 | Narrative slide with no visual, use sparingly |
| 3 | AGENDA | 28 | Agenda or full chapter overview with many items |
| 4 | PHOTO + TEXT (S) | 8 | Small photo with text. Good for persona-style slides |
| 5 | PHOTO + TEXT (M) | 8 | Medium photo with text |
| 6 | PHOTO + TEXT (L) | 8 | Large photo with text, narrative weight on photo |
| 7 | TWO PHOTOS + TEXT | 11 | Before/after photos, or two-asset comparison |
| 8 | AFBEELDING | 9 | Full-slide image |
| 9 | PHOTO W/ QUOTE | 8 | Photo with pull quote overlay |
| 10 | CHAPTER/SUMMARY | 7 | Section divider. Dark background is acceptable here |
| 11 | PHOTO W/ BLUE FRAME | 10 | Framed photo in Van Oord navy |
| 12 | CUSTOM (EMPTY SLIDE) | 6 | Any dense or bespoke content. Preferred for tables, schema slides, 2x2 grids, worked examples. Most flexible layout |
| 13 | TEXT + GRAPH | 8 | Narrative with a chart |
| 14 | GRAPH | 7 | Full-slide chart |
| 15 | GRAPHS WITH ICONS 2X | 10 | Two KPI / metric cards with icons |
| 16 | GRAPHS WITH ICONS 4X | 14 | Four KPI / metric cards with icons |
| 17 | GRAPH COMPARE | 12 | Before/after, A/B side-by-side |
| 18 | TEXT + TABLE | 8 | Narrative with a table beside it |
| 19 | TABLE | 7 | Full-slide native PPTX table. For dense custom tables prefer layout 12 + `grid()` helper |
| 20 | CONTACT SHEET | 23 | Closing contact slide |
| 21 | 1_PHOTO + TEXT (M) | 9 | Alternate single-photo layout |
| 22 | 1_TEXT ONLY | 6 | Alternate text-only layout |

## Decision tree

1. Is it the deck's cover? -> 1
2. Is it a section divider? -> 10
3. Is it the closing contact slide? -> 20
4. Is it an agenda? -> 3
5. Is it a single KPI set (2 or 4 cards)? -> 15 or 16
6. Is it a full-slide chart? -> 14
7. Is it a full-slide image? -> 8
8. Everything else that has any structure, table, schema, grid, or bespoke composition -> 12 CUSTOM, then build with shapes using the `vanoord_helpers.py` utilities.

## Why CUSTOM (12) so often

The layouts with many placeholders (TEXT + GRAPH, GRAPHS WITH ICONS, etc.) constrain placement and sizing. For decks where precision matters (field-level schema, worked examples, dense comparisons), that constraint fights you. Layout 12 is empty, the brand master handles fonts and colors, and the helper functions produce consistent styling.

## Placeholder inspection

To see placeholder indexes and types for a specific layout, run:

```python
from pptx import Presentation
prs = Presentation('assets/vanoord_template.pptx')
layout = prs.slide_layouts[12]
for ph in layout.placeholders:
    print(ph.placeholder_format.idx, ph.placeholder_format.type, ph.name)
```
