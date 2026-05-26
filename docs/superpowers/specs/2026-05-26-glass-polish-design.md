# Glass Polish — Portfolio Visual Refresh

**Date:** 2026-05-26
**Status:** Draft → for review
**Scope:** Visual polish + targeted layout tweaks. No content or page changes.

## Goal

Keep the site recognizably the same — same pages, same content, same dark/orange identity — but make the "glass" actually glass. Today every panel is a flat `rgba(0,0,0,0.x)` over a background photo; there is no blur, no edge highlight, and the heavy white 2–3px borders compete with the photography below them.

Visual direction chosen during brainstorm: **Subtle Frost** — soft backdrop blur, low-saturation tint, thin semi-transparent borders, gentle elevation shadow. Lets photography and project thumbnails carry the color while the chrome recedes.

## Non-goals

- No HTML restructuring.
- No new pages, new sections, or removed content.
- No change to the background image.
- No change to the experience-page timeline accent colors (green/blue dots) — they read as semantic markers and stay.
- No new dependencies, fonts, or build tooling.
- No JavaScript changes (existing `scripts.js` untouched).

## Architecture

One file changes: `css/stylesheet.css`. The change is a refactor, not a rewrite — existing selectors stay valid so nothing breaks elsewhere.

### Design tokens

Introduce CSS custom properties at `:root` so the recipe is defined once:

```css
:root {
  --glass-bg: rgba(15, 15, 20, 0.45);
  --glass-border: rgba(255, 255, 255, 0.12);
  --glass-border-hover: rgba(255, 151, 77, 0.45);
  --glass-radius: 14px;
  --glass-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  --glass-shadow-hover: 0 8px 28px rgba(255, 151, 77, 0.18), 0 8px 24px rgba(0, 0, 0, 0.35);

  --accent: #ff974d;
  --accent-soft: rgba(255, 151, 77, 0.7);
  --text: #fff;
  --text-muted: rgba(255, 255, 255, 0.7);
  --hairline: rgba(255, 255, 255, 0.15);
}
```

Every existing rule that hard-codes `rgba(0, 0, 0, 0.x)` panel backgrounds or `solid 2px #fff` borders is rewritten to use these tokens.

### The shared panel recipe

Applied uniformly to: `.navbar`, `.techstack`, `#slides`, `form`, `.accordion li`, `.next-section`, `.timeline-itemED`, `.timeline-itemEX`, footer cards.

```css
background: var(--glass-bg);
backdrop-filter: blur(18px) saturate(140%);
-webkit-backdrop-filter: blur(18px) saturate(140%);
border: 1px solid var(--glass-border);
border-radius: var(--glass-radius);
box-shadow: var(--glass-shadow);
transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease;
```

Hover state where it makes sense (cards, slider, techstack items, accordion):

```css
border-color: var(--glass-border-hover);
box-shadow: var(--glass-shadow-hover);
```

No transform on hover for the big stationary panels (nav, techstack container) — only on interactive cards (slider, timeline items, accordion items). Translate-y of `-2px` for the lift.

### Fallback

For browsers without `backdrop-filter` (older Firefox before 103, some legacy Safari):

```css
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  :root { --glass-bg: rgba(10, 10, 14, 0.85); }
}
```

The panel just becomes more opaque so it still reads as a deliberate dark card rather than something half-broken.

## Specific tweaks

### Headshot / avatar borders

Currently `solid 2px #fff` or `solid 3px #fff`. Hard white compete with the photo behind. Change to:

- Resting: `border: 2px solid rgba(255, 255, 255, 0.5)` with `box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.04)` (soft halo).
- Active nav avatar (`#active`): keeps orange ring but as `border: 2px solid var(--accent)` plus `box-shadow: 0 0 0 4px rgba(255, 151, 77, 0.18)` for the glow.

### Intro-section divider

`#divider` currently `background-color: white; width: 1.5px`. Change to `background-color: var(--hairline); width: 1px`.

### "Finger Paint" decorative font

Keep the font on `.preslideinfo p` — it's a personality marker. Soften it:

- Drop font-size from default to `15px`.
- Color from `#ff974d` to `var(--accent-soft)`.

### Techstack hover

Currently inert. Each `.techstack-item` gains:

```css
transition: transform 200ms ease, filter 200ms ease;
```

On hover: `transform: scale(1.06); filter: drop-shadow(0 4px 12px rgba(255, 151, 77, 0.35))`.

### Project slider overlay

`.slide-content` today goes from `opacity: 0` to `opacity: 0.9` with a solid black background — feels like a slab dropping in. Change to:

- `background: rgba(10, 10, 14, 0.6)`.
- `backdrop-filter: blur(8px) saturate(140%)`.
- Transition `opacity 250ms ease`.

`#slides` itself gets the standard glass recipe. The big white 3px border becomes the glass border, with the orange variant on hover.

### Form inputs (contact page)

- `form` container: standard glass recipe (replacing the current `rgba(0,0,0,0.3)` + solid white border).
- Inputs keep border-bottom-only style, but the line is `rgba(255, 255, 255, 0.25)` at rest, `var(--accent)` on hover/focus. Transition `border-color 200ms ease` (replaces the current `.5s` jump).
- Textarea border becomes `1px solid var(--glass-border)` at rest, `var(--accent)` on focus.
- Submit button keeps the slide-fill orange hover effect (it works), but the base border becomes `1px solid var(--glass-border)` and a subtle inner highlight `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08)` is added so it reads as a button at rest.

### To-Top button

Keep orange. Add `box-shadow: 0 6px 20px rgba(255, 151, 77, 0.35)` so it floats. The icon's black circle inside keeps existing styling.

### Accordion items (projects page)

Currently `rgba(0, 0, 0, 0.8)` + solid 2px white border. Switch to glass recipe. The `+/−` indicator and content area stay structurally identical.

### Timeline items (experience page)

The colored dots (green for education, blue for experience) and their hover glows stay as-is — they're semantic, not decorative. The card background switches from the current `#fff` (which is actually opaque white — fights everything) and the `rgba(0,0,0,0.8)` even/odd variants to the standard glass recipe uniformly. This fixes the visual inconsistency where even items had a dark card and odd items had a white card.

The dots' `::before` `box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.8)` (which forms a dark ring around each dot) is updated to `0 0 0 4px var(--glass-bg)` so the ring blends with the card background instead of showing as a hard black ring against a translucent panel.

### Footer

Footer stays solid `black` background (it's the page-end, no glass needed) but the `h2` accent color stays orange. No structural change.

## Page-by-page checklist

- **index.html** — nav, intro sections (no panel today, may add a subtle glass wrap around `.intro-section` text — TBD during implementation), techstack panel, slider, footer.
- **projects.html** — nav, accordion items, next-section cards, footer.
- **experience.html** — nav, timeline cards (both columns), footer.
- **contact.html** — nav, form, contact-items (icons keep their solid white circle border for now — readable, on-brand), footer.

## Testing

- Manual visual pass on each page at desktop (1440px), tablet (~900px), mobile (~390px).
- Verify hover states on slider, techstack, accordion, timeline, form.
- Verify `backdrop-filter` fallback by toggling the `@supports` block off in DevTools and confirming the site is still readable.
- Verify the orange accent color hasn't lost contrast anywhere (especially `--accent-soft` on the Finger Paint text — should still be legible on a dark photo background).

## Open questions

None blocking. Items I'll decide during implementation and flag in the PR/diff:

- Whether `.intro-section` text columns get their own glass wrap or stay as floating text over the backdrop. Will try with no wrap first (less is more) and add only if the text feels lost.

---

## Addendum (2026-05-26): project content + gallery + slider work

Added mid-session alongside the glass polish. Same dark/orange identity, same frosted styling applied to all new components.

### Project image swaps + new projects (projects.html)

New screenshot folders exist under `assets/projects/`: `clearwater/` (4), `factorit/` (5), `reelsteelscrapmen/` (3).

- **Clearwater** (exists): hero becomes `clearwater/home.png`; remaining shots feed the lightbox.
- **Factor IT** (new): add to Web Development accordion. Latest client — tailored technology solutions company in Yorkshire (web design, telephony, managed IT services, connectivity, infrastructure management). Stack: HTML5, CSS3, JavaScript, WordPress. Live link: `https://factorit.co.uk`. Hero `factorit/home.png`.
- **ReelSteelScrapmen** (new): add to Web Development accordion. Scrap metal collection, Bradford/West Yorkshire (commercial/domestic/industrial/personal). Stack: HTML5, CSS3, JavaScript. Live link: `https://www.reelsteelscrapmen.co.uk/`. Hero `reelsteelscrapmen/home.png`.
- New `assets/tools/wordpress.svg` icon added (WordPress brand mark) to match existing SVG tool icons.

### Expandable gallery / lightbox (projects.html + scripts.js)

Each project keeps one hero image. A corner overlay badge (`fa-expand` + screenshot count when >1) sits on the hero. Clicking opens a single shared lightbox appended to `<body>`: full-size image on a dimmed frosted backdrop, prev/next arrows, thumbnail strip, close button. Esc and backdrop click close. Reusable: JS reads each gallery's image list from the DOM, so adding images needs no JS changes. Single-image projects still get a click-to-enlarge view (badge shows just the expand icon).

### Featured slider recode (index.html + scripts.js)

Rebuild the hardcoded 4-radio-input slider as a data-driven JS slider. A `featuredProjects` array (`{ title, image, tools[], link }`) renders slides + bullets dynamically; transition, hover overlay, bullet navigation, and click-to-projects behaviour are preserved. Adding/reordering a featured project becomes a one-line array edit. Now carries 6 projects (existing 4 + Factor IT + ReelSteelScrapmen).

### Testing additions

- Lightbox: open/close (button, Esc, backdrop), prev/next wrap-around, thumbnail jump, single-image case.
- Slider: renders all 6, bullets track active slide, hover overlay + click-through still work, responsive widths.
