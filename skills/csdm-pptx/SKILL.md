---
name: csdm-pptx
description: Create a PowerPoint slide that visualises CSDM v5 objects and relationships in the Van Oord visual convention. Use whenever the user wants to draw, model, diagram, visualise, or sketch a CSDM model, CSDM view, CSDM slice, service model, or product and service data model, or names two or more CSDM objects (Business Application, Business Capability, Information Object, Service Instance, Application Service, Technology Management Service or Offering, Business Offering, Business Service, Service Catalog, Dynamic CI Group, SDLC Component, Planning Item, Product Idea, Service Delivery System) together with a relationship such as consumes, hosts, realizes, references, packages, delivered by, offers, provides, listed in. Trigger on "draw this as CSDM", "put in the CSDM model", "CSDM view", "CSDM diagram", "CSDM picture". Use even without an explicit PowerPoint mention.
---

# CSDM v5 PowerPoint Visualiser

## What this skill does

Produces a standalone .pptx file with a single slide that renders the CSDM v5
domain canvas in the Van Oord colour scheme and places the objects, roles and
relationships the user asks for at their canonical positions. The user
describes the model in natural language; the skill:

1. Parses the description into a structured spec.
2. Invokes `scripts/render_csdm.py` with that spec and the bundled
   `assets/csdm_model.json` catalog.
3. Returns the .pptx in the outputs folder.

The renderer is deterministic. Every canonical object always appears in the
same domain with the same colour and coordinate. Users cannot accidentally
place Business Application in Service Delivery.

## When to use

Trigger whenever the user mentions CSDM objects and wants them on a slide or
in a picture, even indirectly. Examples:

| User says | Trigger? |
|---|---|
| "Draw a CSDM view showing BA consumes IO" | Yes |
| "Put Service Instance, Business Application and Tech Mgmt Service on a slide" | Yes |
| "Model this in CSDM: Business Offering packages Business Service, which is delivered by a Service Instance" | Yes |
| "Give me the full CSDM v5 core model" | Yes, with all objects |
| "Explain what a Business Capability is" | No, this is a definition question |
| "Create a Van Oord HLD" | No, use the van-oord-hld skill |

## Workflow

Follow these steps in order.

### Step 1. Inventory the catalog

Before parsing the user's description, read the canonical catalog so you know
exactly which object names and synonyms are recognised.

```bash
python3 scripts/render_csdm.py --dump-catalog
```

This prints every canonical domain, object and role with its synonyms. Do not
skip this. Users routinely use abbreviations (BA, IO, SI, BC, TMO) and the
catalog is the single source of truth.

### Step 2. Extract objects, roles and relationships

From the user's natural-language description, extract three lists.

**Objects**: every noun phrase that names a CSDM element. Normalise each one
to a canonical catalog name. If a noun phrase is ambiguous, ask one
clarifying question; do not guess silently. If a noun phrase is not in the
catalog, either (a) ask the user if it maps to a known object, or (b) add it
via `custom_objects` in the spec with an explicit domain and position.

**Roles**: person titles such as "Digital Product Owner", "Service Instance
Owner". Only include them if the user explicitly wants them shown.

**Relationships**: every verb or preposition that connects two objects.
Map to the closest standard label from this list:

| Verb in description | Standard label |
|---|---|
| hosts, runs, carries | hosts |
| consumes, uses, depends on | consumes |
| provides, exposes | provides |
| realizes, implements a capability | realizes |
| references, reads, writes, touches | references |
| packages, bundles, wraps | packages |
| offers, catalogs | offers |
| delivered by, fulfilled by | delivered by |
| listed in, published in | listed in |
| refines, elaborates | refines |
| monitors, observes | monitors |

If none of these fit, keep the user's original verb as the label.

### Step 3. Build the spec JSON

Produce a JSON object matching the schema in
`scripts/render_csdm.py` (docstring at the top of the file). Minimal shape:

```json
{
  "title": "<what the user is modelling>",
  "subtitle": "<optional>",
  "objects":  ["<canonical name>", ...],
  "roles":    ["<canonical name>", ...],
  "relationships": [
    {"from": "...", "to": "...", "label": "...", "style": "straight|bent|curved"}
  ],
  "hide_empty_domains": false,
  "show_domain_labels": true
}
```

Guidelines:

- Default `hide_empty_domains` to `false`. Keeping every domain visible is
  what makes a CSDM picture recognisable as CSDM. Only set it to `true` when
  the user explicitly asks for a cropped or minimal view, or when you need
  to reclaim slide space for a dense model.
- Default `show_domain_labels` to `true`.
- Only set `style` on a relationship when geometry demands it; otherwise omit
  and the renderer picks a sensible default.
- If the user lists two or more objects without explicit relationships, you
  may still call the renderer — `auto_relationships` defaults to `true` and
  fills in any standard relationships that exist between the drawn objects.
- When a model has many custom objects (20 or more), prefer
  `hide_empty_domains: true` plus `domain_overrides` to enlarge the domains
  that are actually used. This avoids the cramped-look of stuffing everything
  into canonical domain boxes.

### Dense layouts: `domain_overrides`

When the canonical domain regions are too small for the number of objects,
resize them in the spec:

```json
"domain_overrides": {
  "design_planning": {
    "region": {"x": 7.0, "y": 0.80, "w": 6.00, "h": 2.30, "shape": "roundRect"},
    "label_position": {"x": 7.0, "y": 0.45, "w": 2.0, "h": 0.30,
                       "anchor": "outside_left"}
  },
  "service_delivery": {
    "region": {"x": 0.30, "y": 3.30, "w": 7.00, "h": 2.40, "shape": "roundRect"},
    "label_position": {"x": 0.30, "y": 3.00, "w": 2.0, "h": 0.30,
                       "anchor": "outside_left"}
  }
}
```

Overriding the region does NOT move the canonical objects (they still sit at
the catalog positions unless you also pass them as `custom_objects`). Use the
overrides together with `custom_objects` whose positions fit the new region.

### Connector anchoring

Connectors are bound to their source and target shapes via
`begin_connect`/`end_connect`, so arrows track shape positions and render
without free-floating endpoints. You do not need to configure anything for
this — it always happens.

Save the spec as `spec.json` in the outputs folder so it can be re-rendered
and audited later.

### Step 4. Render

```bash
python3 scripts/render_csdm.py \
    /absolute/path/to/outputs/spec.json \
    /absolute/path/to/outputs/csdm_view.pptx
```

The renderer prints a JSON summary of what was drawn and any warnings
(e.g., relationships skipped because one side was not in the spec). Surface
these to the user if non-empty.

### Step 5. Visual QA

Convert the slide to an image and verify.

```bash
soffice --headless --convert-to pdf csdm_view.pptx
pdftoppm -jpeg -r 150 csdm_view.pdf slide
ls -1 "$PWD"/slide-*.jpg
```

Open `slide-1.jpg` and inspect:

- All named objects present and legible.
- Each object is inside its domain's coloured region.
- Arrows connect the right objects and have the correct labels.
- No overlapping labels that obscure each other. If arrows cross messily,
  re-render with `style: "bent"` on offending relationships.

If any of the above fails, adjust the spec and re-render.

### Step 6. Present

Return a computer:// link to the .pptx and a one-sentence summary of what was
drawn. Keep the postamble short; let the user open the deck themselves.

## Domain colour reference

| Domain | Fill |
|---|---|
| Build & Integration | #FC7786 (pink) |
| Service Delivery | #F19714 (orange) |
| Design & Planning | #24C2CE (teal) |
| Ideation & Strategy | #FFDE1D (yellow) |
| Service Consumption | #54C45E (green) with #86ED78 Catalog band |
| Manage Portfolio | white ellipse (centre hub) |
| Foundation | grey bar (bottom) |

These are baked into the catalog. Never override them.

## Objects outside the catalog

If the user wants an object that CSDM v5 does not define, add it via
`custom_objects`. Pick the domain whose fill colour best matches the object's
nature (e.g., a new "Feature Flag Service" goes in `build_integration`).

```json
"custom_objects": [
  {"name": "Feature Flag Service", "domain": "build_integration",
   "position": {"x": 5.0, "y": 2.3, "w": 1.1, "h": 0.4},
   "fill": "FFFFFF"}
]
```

Warn the user when you do this so they can decide whether the object really
belongs in that domain.

## Failure modes and how to handle them

| Symptom | Cause | Fix |
|---|---|---|
| `Unknown CSDM names: ...` error | User used a term not in catalog | Ask user to map to a known object, or add via `custom_objects` |
| Arrows overlap the object they originate from | Two objects are too close together | Add `"style": "bent"` to the relationship |
| Domain labels are cut off | You added a custom object that overlaps a label | Move the custom object or hide the label |
| `Skipping relationship X -> Y` warning | One side of the relationship was not in `objects` | Add the missing object or drop the relationship |
| Image looks washed out | Default colours were overridden | Remove any `fill` overrides in the spec |

## Reliability notes

- The catalog positions were extracted from the Van Oord CSDM visualisation
  examples deck (slide 2). They are accurate to the source but the original
  domain bounding boxes are artistic, so some canonical objects sit slightly
  outside their coloured region. This is intentional and preserved to match
  the reference.
- Connector routing uses side-pair heuristics (left/right/top/bottom nearest
  edges). It works well for most relationships but may route oddly for
  objects that are nearly coaxial. Use `"style": "bent"` to work around.
- The role icon is a blue circle with initials. It is a schematic stand-in
  for the Microsoft-style person silhouettes used in the source deck.
