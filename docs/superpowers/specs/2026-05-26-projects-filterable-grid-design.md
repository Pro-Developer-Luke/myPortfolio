# Projects Page — Filterable Card Grid + Modal

**Date:** 2026-05-26
**Status:** Draft → for review
**Scope:** Replace the collapsible accordion on `projects.html` with a filterable card grid and a modal detail view. No change to the aspirations section or site-wide styling.

## Goal

The projects page currently hides every project behind a four-item accordion — you can only see category titles until you expand one, and the expand/collapse animation has been a recurring source of bugs. Replace it with a **filterable card grid**: all projects visible as cards at a glance, category **filter tabs** to narrow the list, and a **modal overlay** for the full detail of any one project. Keep the existing dark/orange frosted-glass identity.

## Non-goals

- No change to the "Career / Qualifications / Prospects" aspirations section below the projects.
- No change to the global design tokens, nav, footer, or other pages.
- No new fonts, build tooling, or dependencies.
- No new project content — this migrates the existing 9 projects' copy, images, tech, and links into the new structure.
- No separate per-project detail pages (the modal is the detail view).

## Content inventory (what gets migrated)

9 projects across 4 categories:

- **Software Development** — *Dynamic eLearning Program Powered by AI* (GitHub); *Shift & Rota Management Program* (GitHub)
- **Web Development** — *Factor IT — Technology Solutions* (live); *ReelSteelScrapmen* (live); *Clearwater Accountancy Website* (live + GitHub); *Gaming News Website* (GitHub)
- **Scripting** — *Digit Recognition Program* (GitHub); *Predicting House Sale Prices* (GitHub)
- **Data Warehousing** — *Bookstore Chain Data Warehouse* (GitHub)

Each project already has: a title, one or more screenshots, a description paragraph, a technologies list, and one or more live/GitHub links.

## Architecture

Three files change: `projects.html`, `javascript/scripts.js`, `css/stylesheet.css`. The accordion markup, the accordion CSS, and the `initAccordion()` JS are removed.

### Where project data lives — HTML-as-data

Each project stays as **structured, hidden markup in `projects.html`**; JS reads it to build the cards and populate the modal. Chosen over a JS data array because the descriptions are long paragraphs (awkward as JS strings) and because the existing galleries/lightbox already read their image lists from `<template>` elements in the DOM — this keeps one consistent pattern. Adding a project later = pasting one HTML block, no JS edit.

Proposed per-project source element:

```html
<article class="project" data-category="Web Development" data-title="Factor IT — Technology Solutions">
  <img class="project-thumb" src="assets/projects/factorit/home.png" alt="Factor IT home page">
  <ul class="project-tools"><li>HTML5</li><li>CSS3</li><li>JavaScript</li><li>WordPress</li></ul>
  <div class="project-description"> ... existing paragraph(s) ... </div>
  <ul class="project-links">
    <li><a href="https://factorit.co.uk" target="_blank" data-kind="live">Live site</a></li>
  </ul>
  <template class="project-gallery">
    <img src="assets/projects/factorit/home.png" alt="…">
    <img src="assets/projects/factorit/blog.png" alt="…">
    <!-- remaining screenshots -->
  </template>
</article>
```

The container holding these `<article>`s is hidden (`display:none` via a JS-added class) once JS takes over.

### Components

- **`projects.html`**
  - A **filter bar**: `All` (active by default) + one pill per category (`Software Development`, `Web Development`, `Scripting`, `Data Warehousing`).
  - An empty `.project-grid` that JS fills with cards.
  - The hidden `.project-source` list of `<article class="project">` entries above.
  - One shared `.project-modal` container (created in JS or present in markup, hidden by default).

- **`javascript/scripts.js`** — new `initProjects()`, called from the existing `DOMContentLoaded` handler alongside `initSlider()`/`initGalleries()`:
  1. Read each `.project` article → build a card (`thumbnail · title · tech chips`) and append to `.project-grid`. Cards carry their category for filtering and a reference/index back to their source article.
  2. Wire the filter pills: clicking a pill sets it active and shows only matching cards (cards toggle a hidden class with a short opacity/transform transition). `All` shows everything.
  3. Wire card click → open the modal populated from that project's source: gallery (hero + thumbnail strip), title, description, tech list, links. Closes on ×, Esc, and backdrop click; locks body scroll while open (matching the lightbox).
  4. Inside the modal, clicking a gallery image opens the **existing fullscreen lightbox** for zoom — the lightbox is reused, not replaced.

- **`css/stylesheet.css`** — new rules for `.project-filters`/pills, `.project-grid`, `.project-card` (built on `--glass-*` tokens, with the restrained warm-edge hover), and `.project-modal`. Remove the `.accordion*` rules.

### Data flow

`DOMContentLoaded → initProjects()` reads the hidden source → renders cards → hides the source. Filter clicks mutate card visibility only. Card click reads the corresponding source article and fills the modal. No persistent state beyond the active filter and the currently open project.

## Styling

- **Filter pills:** rounded, glass border at rest; active pill is solid `--accent` orange with dark text.
- **Grid:** `repeat(3, 1fr)` desktop → 2 columns tablet (~900px) → 1 column mobile (~390px); filter pills wrap.
- **Cards:** frosted glass (`--glass-bg`, `--glass-border`, `--glass-shadow`), thumbnail on top, title + tech chips below; hover = restrained warm-edge (`--glass-border-hover` + neutral shadow + `-2px` lift), consistent with the rest of the site.
- **Modal:** centered panel over a dimmed, blurred backdrop; image gallery one side, write-up + tech + links the other; stacks vertically on mobile.

## Testing

- Manual visual pass at desktop (1440px), tablet (~900px), mobile (~390px).
- Filter switching: each category shows the correct subset; `All` restores everything; active pill styling tracks selection.
- Modal: opens with correct content per card; closes via ×, Esc, and backdrop; body scroll locks/unlocks; gallery image → fullscreen lightbox works and returns cleanly.
- All 9 projects render with correct title, thumbnail, chips, description, links, and gallery images.
- Keyboard/focus: modal is reachable and dismissible by keyboard; focus returns sensibly on close.

## Open questions

- **No-JS fallback:** like the slider and lightbox, the grid requires JS to render. Default plan is to accept this (consistent with the page). If a readable no-JS fallback is wanted, leave the `.project-source` articles visible by default and have JS hide them only after building the grid — decide during implementation; leaning toward accepting the JS requirement for simplicity.
- **Tech chips vs icons on the card:** spec assumes small text chips on the card face (e.g. "HTML5", "WordPress"). Could instead reuse the `assets/tools/*.svg` icons. Will start with text chips for legibility at small size; revisit if they feel heavy.
