# Projects Filterable Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the projects-page accordion with a filterable card grid and a modal detail view, reusing the existing fullscreen lightbox.

**Architecture:** Project data stays as hidden, structured `<article>` markup in `projects.html`. A new `initProjects()` in `scripts.js` reads it to render grid cards, wires category filter pills, and opens a single shared modal populated per project. The existing image lightbox is refactored so both the (removed) galleries and the new modal can call one `openLightbox(images, index)` opener.

**Tech Stack:** Vanilla HTML/CSS/JS. No framework, no build step, no test runner — verification is manual in the browser. Spec: `docs/superpowers/specs/2026-05-26-projects-filterable-grid-design.md`.

---

## Verification note

There is no automated test harness and the spec forbids adding one. "Verify" steps mean: open `projects.html` in a browser (e.g. VS Code Live Server) and confirm the described behavior, plus an open DevTools console with **no errors**. Check desktop (~1440px), tablet (~900px), and mobile (~390px) widths where noted.

## File Structure

- **`projects.html`** — Modify. Replace the `<ul class="accordion">` block with: a `.project-filters` bar, an empty `#project-grid`, and a hidden `.project-source` list of `<article class="project">` entries (migrated from the accordion). The modal element is created in JS.
- **`javascript/scripts.js`** — Modify. Remove `initAccordion()`. Split the lightbox out of `initGalleries()` into a reusable `initLightbox()` exposing module-scoped `openLightbox`. Add `initProjects()`. Update the `DOMContentLoaded` handler.
- **`css/stylesheet.css`** — Modify. Add `.project-filters`, `.project-grid`, `.project-card`, `.project-modal`, and `.is-hidden` rules built on the existing `--glass-*` tokens. Remove the `.accordion*` rules.

## Data contract (used across tasks)

Each project source entry:

```html
<article class="project" data-category="Web Development" data-title="Factor IT — Technology Solutions">
  <img class="project-thumb" src="assets/projects/factorit/home.png" alt="Factor IT home page">
  <ul class="project-tools"><li>HTML5</li><li>CSS3</li><li>JavaScript</li><li>WordPress</li></ul>
  <div class="project-description"><!-- existing paragraph(s), carried over verbatim --></div>
  <ul class="project-links">
    <li><a href="https://factorit.co.uk" target="_blank" rel="noopener" data-kind="live">Live site</a></li>
  </ul>
  <template class="project-gallery">
    <img src="assets/projects/factorit/home.png" alt="Factor IT home">
    <img src="assets/projects/factorit/blog.png" alt="Factor IT blog">
    <!-- remaining screenshots, carried over from the current gallery <template> -->
  </template>
</article>
```

`data-category` MUST be exactly one of: `Software Development`, `Web Development`, `Scripting`, `Data Warehousing`.

---

## Task 1: Refactor the lightbox into a reusable opener

**Files:**
- Modify: `javascript/scripts.js` (the `initGalleries` function and the `DOMContentLoaded` handler)

- [ ] **Step 1: Add a module-scoped opener variable and `initLightbox()`**

Near the top of `scripts.js` (after the `featuredProjects` array), add:

```js
// ===== Reusable fullscreen image lightbox =====
// Set by initLightbox(); call openLightbox(images, index) where images is
// [{ src, alt }]. Shared by project galleries and the project modal.
let openLightbox = null;

function initLightbox() {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML = `
        <div class="lightbox-backdrop"></div>
        <button type="button" class="lightbox-close" aria-label="Close gallery"><i class="fas fa-times"></i></button>
        <button type="button" class="lightbox-nav lightbox-prev" aria-label="Previous image"><i class="fas fa-chevron-left"></i></button>
        <figure class="lightbox-stage"><img class="lightbox-image" src="" alt=""></figure>
        <button type="button" class="lightbox-nav lightbox-next" aria-label="Next image"><i class="fas fa-chevron-right"></i></button>
        <div class="lightbox-thumbs"></div>
    `;
    document.body.appendChild(lightbox);

    const lbImage = lightbox.querySelector('.lightbox-image');
    const lbThumbs = lightbox.querySelector('.lightbox-thumbs');
    let currentSet = [];
    let currentIndex = 0;

    function renderThumbs() {
        lbThumbs.replaceChildren(...currentSet.map((item, i) => {
            const t = document.createElement('button');
            t.type = 'button';
            t.className = 'lightbox-thumb' + (i === currentIndex ? ' active' : '');
            t.innerHTML = `<img src="${item.src}" alt="">`;
            t.addEventListener('click', () => show(i));
            return t;
        }));
    }
    function show(index) {
        const count = currentSet.length;
        currentIndex = (index + count) % count;
        const item = currentSet[currentIndex];
        lbImage.src = item.src;
        lbImage.alt = item.alt;
        lbThumbs.querySelectorAll('.lightbox-thumb').forEach((t, i) => t.classList.toggle('active', i === currentIndex));
        lightbox.classList.toggle('single', count < 2);
    }
    function close() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    openLightbox = function (images, index) {
        currentSet = images;
        renderThumbs();
        show(index || 0);
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    lightbox.querySelector('.lightbox-close').addEventListener('click', close);
    lightbox.querySelector('.lightbox-backdrop').addEventListener('click', close);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => show(currentIndex - 1));
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => show(currentIndex + 1));
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(currentIndex - 1);
        if (e.key === 'ArrowRight') show(currentIndex + 1);
    });
}
```

- [ ] **Step 2: Reduce `initGalleries()` to wiring only**

Replace the entire existing `initGalleries` function body so it no longer builds its own lightbox — it calls `openLightbox`:

```js
function initGalleries() {
    const galleries = document.querySelectorAll('.gallery');
    galleries.forEach((gallery) => {
        const template = gallery.querySelector('template');
        const imgs = template ? Array.from(template.content.querySelectorAll('img')) : [];
        const set = imgs.map((img) => ({ src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' }));
        if (!set.length) return;
        const count = gallery.querySelector('.gallery-count');
        if (count) count.textContent = set.length > 1 ? ` ${set.length}` : '';
        const hero = gallery.querySelector('.gallery-hero');
        if (hero) hero.addEventListener('click', () => openLightbox(set, 0));
    });
}
```

- [ ] **Step 3: Update the `DOMContentLoaded` handler to init the lightbox first**

```js
document.addEventListener('DOMContentLoaded', () => {
    initSlider();
    initLightbox();
    initGalleries();
    initAccordion();
});
```

- [ ] **Step 4: Verify no regression**

Run: `node --check javascript/scripts.js` → Expected: no output (exit 0).
Open `projects.html`, expand an accordion item, click a project image. Expected: fullscreen lightbox still opens, prev/next/thumbs/Esc all still work. Console: no errors.

- [ ] **Step 5: Commit**

```bash
git add javascript/scripts.js
git commit -m "refactor: extract reusable openLightbox from initGalleries"
```

---

## Task 2: Migrate accordion content into hidden source markup + page scaffold

**Files:**
- Modify: `projects.html` (replace the `<ul class="accordion"> … </ul>` block)

- [ ] **Step 1: Add the filter bar, empty grid, and source container**

Replace the opening of the accordion block. The new structure inside `.wrapper`, after the `<h1>Projects</h1>`:

```html
<div class="project-filters">
  <button type="button" class="filter-pill active" data-filter="all">All</button>
  <button type="button" class="filter-pill" data-filter="Software Development">Software Development</button>
  <button type="button" class="filter-pill" data-filter="Web Development">Web Development</button>
  <button type="button" class="filter-pill" data-filter="Scripting">Scripting</button>
  <button type="button" class="filter-pill" data-filter="Data Warehousing">Data Warehousing</button>
</div>

<div id="project-grid" class="project-grid"></div>

<div class="project-source">
  <!-- one <article class="project"> per project — see Step 2 -->
</div>
```

- [ ] **Step 2: Convert each accordion `.content-section` into a `<article class="project">`**

For all 9 projects, map the current accordion markup into the data contract. Carry the **description paragraphs and gallery `<template>` images over verbatim** from the existing markup — do not rewrite copy. Worked example (Factor IT) is shown in the Data contract section above. Category/title/links/thumbnail mapping for all 9:

| Title | data-category | Thumbnail (`project-thumb`) | Links |
|---|---|---|---|
| Dynamic eLearning Program Powered by AI | Software Development | `assets/projects/EmployeeCoach_Preview.png` | GitHub: `https://github.com/Pro-Developer-Luke/EmployeeCoach-Major-Project` |
| Shift & Rota Management Program | Software Development | (current section's hero image) | GitHub: `https://github.com/Pro-Developer-Luke/Rota-Management-System` |
| Factor IT — Technology Solutions | Web Development | `assets/projects/factorit/home.png` | Live: `https://factorit.co.uk` |
| ReelSteelScrapmen | Web Development | `assets/projects/reelsteelscrapmen/home.png` | Live: `https://www.reelsteelscrapmen.co.uk/` |
| Clearwater Accountancy Website | Web Development | `assets/projects/clearwater/home.png` | Live: `http://clearwater-accounting.co.uk/` |
| Gaming News Website | Web Development | (current section's hero image) | GitHub: `https://github.com/Pro-Developer-Luke/Gaming-News-Website` |
| Digit Recognition Program | Scripting | (current section's hero image) | GitHub: `https://github.com/Pro-Developer-Luke/AI-Digit-Recognition` |
| Predicting House Sale Prices | Scripting | (current section's hero image) | GitHub: (current section's link) |
| Bookstore Chain Data Warehouse | Data Warehousing | (current section's hero image) | GitHub: (current section's link) |

For `data-kind`: use `live` for website links (globe icon) and `github` for GitHub links. `project-tools` `<li>` items come from each section's existing Technologies list.

- [ ] **Step 3: Delete the old accordion markup**

Remove the entire former `<ul class="accordion"> … </ul>` (checkboxes, labels, `.content`, `.content-section`, `.gallery`/`.gallery-hero` blocks). The image data now lives only in each article's `template.project-gallery`. Leave the aspirations `next-section` (Career/Qualifications/Prospects) untouched.

- [ ] **Step 4: Verify structure loads**

Open `projects.html`. Expected at this stage: the filter pills show; the grid is empty (JS not written yet); the source list is visible but unstyled (that's fine — Task 3 hides it). Console: no errors. The aspirations section below is unchanged.

- [ ] **Step 5: Commit**

```bash
git add projects.html
git commit -m "refactor: migrate accordion projects into hidden source markup + grid scaffold"
```

---

## Task 3: Render cards and hide the source (`initProjects`)

**Files:**
- Modify: `javascript/scripts.js`

- [ ] **Step 1: Add `initProjects()` (card rendering portion)**

```js
// ===== Projects: filterable grid + modal (projects page) =====
function initProjects() {
    const grid = document.getElementById('project-grid');
    const source = document.querySelector('.project-source');
    if (!grid || !source) return;

    const articles = Array.from(source.querySelectorAll('.project'));

    articles.forEach((article) => {
        const thumb = article.querySelector('.project-thumb');
        const tools = Array.from(article.querySelectorAll('.project-tools li')).map((li) => li.textContent.trim());

        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'project-card';
        card.dataset.category = article.dataset.category;
        card.innerHTML = `
            <span class="project-card-thumb" style="background-image:url('${thumb.getAttribute('src')}')"></span>
            <span class="project-card-body">
                <span class="project-card-title">${article.dataset.title}</span>
                <span class="project-card-chips">${tools.map((t) => `<span class="chip">${t}</span>`).join('')}</span>
            </span>`;
        card.addEventListener('click', () => openProjectModal(article));
        grid.appendChild(card);
    });

    source.classList.add('is-hidden');

    initProjectFilters(grid);
}
```

- [ ] **Step 2: Add a temporary `openProjectModal` stub (real version in Task 6) and the filter init stub**

So the file parses and clicks don't error before Task 5/6:

```js
function openProjectModal(article) {
    console.log('open project:', article.dataset.title); // replaced in Task 6
}
```

- [ ] **Step 3: Call `initProjects()` on load**

```js
document.addEventListener('DOMContentLoaded', () => {
    initSlider();
    initLightbox();
    initGalleries();
    initProjects();
});
```

(Note: `initAccordion()` is removed here — its function is deleted in Task 8.)

- [ ] **Step 4: Verify cards render**

Run: `node --check javascript/scripts.js` → Expected: exit 0.
Open `projects.html`. Expected: 9 unstyled cards appear in the grid, each showing thumbnail + title + tech text; the raw source list is gone (hidden). Clicking a card logs its title to the console. No errors.

- [ ] **Step 5: Commit**

```bash
git add javascript/scripts.js
git commit -m "feat: render project cards from source markup"
```

---

## Task 4: Filtering (`initProjectFilters`)

**Files:**
- Modify: `javascript/scripts.js`

- [ ] **Step 1: Add `initProjectFilters()`**

```js
function initProjectFilters(grid) {
    const filters = document.querySelector('.project-filters');
    if (!filters) return;
    filters.addEventListener('click', (e) => {
        const pill = e.target.closest('.filter-pill');
        if (!pill) return;
        filters.querySelectorAll('.filter-pill').forEach((p) => p.classList.toggle('active', p === pill));
        const filter = pill.dataset.filter;
        grid.querySelectorAll('.project-card').forEach((card) => {
            const visible = filter === 'all' || card.dataset.category === filter;
            card.classList.toggle('is-hidden', !visible);
        });
    });
}
```

- [ ] **Step 2: Verify filtering**

Run: `node --check javascript/scripts.js` → Expected: exit 0.
Open `projects.html`. Expected: clicking "Web Development" shows only the 4 web projects and highlights that pill; "All" restores all 9. No errors.

- [ ] **Step 3: Commit**

```bash
git add javascript/scripts.js
git commit -m "feat: filter project cards by category"
```

---

## Task 5: Card + filter + grid styling

**Files:**
- Modify: `css/stylesheet.css`

- [ ] **Step 1: Add grid, filter, and card styles**

Add near the old accordion rules (which are removed in Task 8):

```css
  .is-hidden { display: none !important; }

  .project-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 0 0 24px;
  }
  .filter-pill {
    font: inherit;
    font-size: 0.9rem;
    padding: 7px 16px;
    border-radius: 20px;
    color: var(--text-muted);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    cursor: pointer;
    transition: border-color .2s ease, color .2s ease, background .2s ease;
  }
  .filter-pill:hover { border-color: var(--glass-border-hover); color: var(--text); }
  .filter-pill.active { background: var(--accent); border-color: var(--accent); color: #1a1a1a; font-weight: 600; }

  .project-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    width: 100%;
  }
  .project-card {
    display: flex;
    flex-direction: column;
    text-align: left;
    padding: 0;
    overflow: hidden;
    cursor: pointer;
    color: var(--text);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-radius: var(--glass-radius);
    box-shadow: var(--glass-shadow);
    transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
  }
  .project-card:hover {
    border-color: var(--glass-border-hover);
    box-shadow: var(--glass-shadow-hover);
    transform: translateY(-2px);
  }
  .project-card-thumb {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    background-size: cover;
    background-position: center;
  }
  .project-card-body { padding: 12px 14px 14px; }
  .project-card-title { display: block; font-size: 1rem; font-weight: 500; margin-bottom: 10px; }
  .project-card-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .project-card-chips .chip {
    font-size: 0.7rem;
    padding: 2px 9px;
    border-radius: 10px;
    color: var(--text-muted);
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid var(--hairline);
  }
```

- [ ] **Step 2: Add responsive breakpoints**

Inside the existing mobile/tablet `@media` blocks (match the file's existing breakpoints near `.techstack` responsive rules), add:

```css
  /* ~900px and below */
  .project-grid { grid-template-columns: repeat(2, 1fr); }
  /* ~600px and below */
  .project-grid { grid-template-columns: 1fr; }
```

Place each line in the matching existing `@media (max-width: …)` block rather than creating new ones, following the file's current breakpoint structure.

- [ ] **Step 3: Verify card styling**

Open `projects.html`. Expected: frosted cards in a 3-column grid, thumbnails filling the top, titles + chips below, warm-edge lift on hover, active filter pill orange. Resize to ~900px → 2 columns; ~390px → 1 column; pills wrap. No errors.

- [ ] **Step 4: Commit**

```bash
git add css/stylesheet.css
git commit -m "style: project grid, filter pills, and cards"
```

---

## Task 6: Project modal — markup, populate, open/close

**Files:**
- Modify: `javascript/scripts.js` (replace the `openProjectModal` stub; add modal creation)

- [ ] **Step 1: Create the modal once inside `initProjects()`**

Add at the end of `initProjects()` (before its closing brace, after `initProjectFilters(grid)`):

```js
    ensureProjectModal();
```

And add these module-scoped helpers:

```js
let projectModal = null;

function ensureProjectModal() {
    if (projectModal) return;
    projectModal = document.createElement('div');
    projectModal.className = 'project-modal';
    projectModal.setAttribute('aria-hidden', 'true');
    projectModal.innerHTML = `
        <div class="project-modal-backdrop"></div>
        <div class="project-modal-panel" role="dialog" aria-modal="true">
            <button type="button" class="project-modal-close" aria-label="Close">&times;</button>
            <div class="project-modal-media">
                <img class="project-modal-hero" src="" alt="">
                <div class="project-modal-thumbs"></div>
            </div>
            <div class="project-modal-info">
                <h2 class="project-modal-title"></h2>
                <div class="project-modal-desc"></div>
                <div class="project-modal-tools"></div>
                <div class="project-modal-links"></div>
            </div>
        </div>`;
    document.body.appendChild(projectModal);

    const close = () => {
        projectModal.classList.remove('open');
        projectModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };
    projectModal.querySelector('.project-modal-close').addEventListener('click', close);
    projectModal.querySelector('.project-modal-backdrop').addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && projectModal.classList.contains('open')) close();
    });
}
```

- [ ] **Step 2: Replace the `openProjectModal` stub with the real implementation**

```js
function openProjectModal(article) {
    ensureProjectModal();

    const images = Array.from(article.querySelector('.project-gallery').content.querySelectorAll('img'))
        .map((img) => ({ src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' }));
    const tools = Array.from(article.querySelectorAll('.project-tools li')).map((li) => li.textContent.trim());

    projectModal.querySelector('.project-modal-title').textContent = article.dataset.title;
    projectModal.querySelector('.project-modal-desc').innerHTML = article.querySelector('.project-description').innerHTML;
    projectModal.querySelector('.project-modal-tools').innerHTML =
        tools.map((t) => `<span class="chip">${t}</span>`).join('');
    projectModal.querySelector('.project-modal-links').innerHTML =
        article.querySelector('.project-links').innerHTML;

    const hero = projectModal.querySelector('.project-modal-hero');
    const thumbs = projectModal.querySelector('.project-modal-thumbs');
    let active = 0;
    const renderHero = () => {
        hero.src = images[active].src;
        hero.alt = images[active].alt;
        thumbs.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', i === active));
    };
    thumbs.replaceChildren(...images.map((img, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.innerHTML = `<img src="${img.src}" alt="">`;
        b.addEventListener('click', () => { active = i; renderHero(); });
        return b;
    }));
    thumbs.classList.toggle('single', images.length < 2);
    renderHero();
    hero.onclick = () => openLightbox(images, active); // reuse fullscreen lightbox

    projectModal.classList.add('open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}
```

- [ ] **Step 3: Verify modal behavior (unstyled)**

Run: `node --check javascript/scripts.js` → Expected: exit 0.
Open `projects.html`, click a card. Expected: a modal element becomes visible (likely unstyled/overlapping until Task 7) containing the title, description, tech chips, links, hero image + thumbnails. Clicking the hero opens the fullscreen lightbox. ×, Esc, and backdrop close the modal. Body scroll locks while open. No errors.

- [ ] **Step 4: Commit**

```bash
git add javascript/scripts.js
git commit -m "feat: project detail modal with gallery, reusing lightbox"
```

---

## Task 7: Modal styling

**Files:**
- Modify: `css/stylesheet.css`

- [ ] **Step 1: Add modal styles**

```css
  .project-modal { position: fixed; inset: 0; z-index: 1000; display: none; }
  .project-modal.open { display: block; }
  .project-modal-backdrop {
    position: absolute; inset: 0;
    background: rgba(5, 5, 8, 0.6);
    backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  }
  .project-modal-panel {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: min(900px, 92vw); max-height: 88vh; overflow: auto;
    display: flex; gap: 20px; padding: 22px;
    background: rgba(18, 18, 24, 0.92);
    backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-radius: var(--glass-radius);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
  }
  .project-modal-close {
    position: absolute; top: 10px; right: 14px;
    background: none; border: none; color: var(--text-muted);
    font-size: 1.6rem; line-height: 1; cursor: pointer;
  }
  .project-modal-close:hover { color: var(--accent); }
  .project-modal-media { flex: 1 1 50%; min-width: 0; }
  .project-modal-hero { width: 100%; border-radius: 8px; cursor: zoom-in; display: block; }
  .project-modal-thumbs { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
  .project-modal-thumbs.single { display: none; }
  .project-modal-thumbs button { width: 54px; height: 40px; padding: 0; border-radius: 5px; overflow: hidden; cursor: pointer; border: 1px solid var(--glass-border); background: none; }
  .project-modal-thumbs button.active { border-color: var(--accent); }
  .project-modal-thumbs img { width: 100%; height: 100%; object-fit: cover; }
  .project-modal-info { flex: 1 1 50%; min-width: 0; color: var(--text); }
  .project-modal-title { color: var(--accent); margin: 0 0 12px; }
  .project-modal-desc { font-size: 0.92rem; line-height: 1.55; color: var(--text-muted); }
  .project-modal-tools { display: flex; flex-wrap: wrap; gap: 6px; margin: 16px 0; }
  .project-modal-tools .chip { font-size: 0.72rem; padding: 3px 10px; border-radius: 10px; background: rgba(255,255,255,0.08); border: 1px solid var(--hairline); color: var(--text-muted); }
  .project-modal-links { display: flex; gap: 14px; }
  .project-modal-links a { color: var(--accent); font-size: 1.3rem; }

  @media (max-width: 700px) {
    .project-modal-panel { flex-direction: column; }
  }
```

- [ ] **Step 2: Verify modal styling**

Open `projects.html`, click each kind of card. Expected: centered glass panel over a dimmed/blurred backdrop; image gallery one side, write-up + chips + links the other; close button top-right; stacks vertically below ~700px; long descriptions scroll inside the panel. Hero click → fullscreen lightbox. No errors. Check ~390px mobile.

- [ ] **Step 3: Commit**

```bash
git add css/stylesheet.css
git commit -m "style: project detail modal"
```

---

## Task 8: Remove dead accordion code

**Files:**
- Modify: `javascript/scripts.js` (delete `initAccordion`)
- Modify: `css/stylesheet.css` (delete `.accordion*` rules)

- [ ] **Step 1: Delete `initAccordion()`**

Remove the entire `initAccordion` function from `scripts.js`. Confirm it is no longer referenced in the `DOMContentLoaded` handler (it was already removed in Task 3).

- [ ] **Step 2: Delete the accordion CSS**

Remove all `.accordion`, `.accordion li`, `.accordion label`, `.accordion .content`, `.accordion input[type="checkbox"] …`, and `.content-section` rules from `stylesheet.css` that are no longer used. (Keep any rule still referenced by the aspirations `next-section`, if shared — verify with a search for each selector before deleting.)

- [ ] **Step 3: Verify nothing broke**

Run: `node --check javascript/scripts.js` → Expected: exit 0.
Search: confirm no remaining `accordion` references in `projects.html` or `scripts.js`. Open `projects.html`: grid, filtering, modal, and lightbox all still work; the aspirations section still renders correctly. No errors.

- [ ] **Step 4: Commit**

```bash
git add javascript/scripts.js css/stylesheet.css
git commit -m "chore: remove dead accordion code"
```

---

## Self-Review (completed)

- **Spec coverage:** filterable grid (Tasks 3–5) ✓; category filter tabs (Task 4) ✓; modal detail (Tasks 6–7) ✓; gallery-in-modal reusing lightbox (Tasks 1, 6) ✓; HTML-as-data source (Task 2) ✓; aspirations section untouched (Tasks 2, 8) ✓; glass tokens reused (Tasks 5, 7) ✓; accordion removed (Tasks 2, 8) ✓; responsive (Tasks 5, 7) ✓.
- **Placeholders:** the `openProjectModal` stub in Task 3 is intentional and explicitly replaced in Task 6. Description/gallery "carried over verbatim" references existing in-file content, not a TODO.
- **Type/name consistency:** `openLightbox(images, index)` defined in Task 1, used in Tasks 1 & 6; `initProjects`/`initProjectFilters`/`openProjectModal`/`ensureProjectModal` and the `.project-*` / `.filter-pill` / `.is-hidden` class names match across HTML, JS, and CSS tasks.

## Open items deferred to implementation

- No-JS fallback: accepted (grid requires JS, consistent with slider/lightbox). The `.project-source` is only hidden by JS, so with JS off the raw entries remain readable.
- Tech chips are text (not icons), per the spec default.
