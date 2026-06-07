# Copy Refresh: About Me & What's Next — Design

**Date:** 2026-06-07
**Scope:** Text-only changes to `index.html` and `projects.html`. No HTML structure, CSS, or JS changes.

## Problem

The About Me section (`index.html`) and the "What's next?" section (`projects.html`) were written from a job-seeker perspective ("aspiring developer", "secure an entry-level developer position"). Luke is now a Full Stack Software Engineer at Encon Pharma (see `experience.html`). The copy is also long-winded (~80–90 words per section).

## Decisions

- **Tone:** Confident professional — first-person, warm but assured. Drops the exclamation-mark enthusiasm.
- **Career angle:** Growing in current role at Encon Pharma, toward senior engineering.
- **Qualifications:** Generalised — continuous learning driven by the work; no named certifications.
- **Length:** ~45–55 words per section.

## Changes

### 1. Tagline — `index.html` line 38

`Software and Web Developer` → `Full Stack Software Engineer` (matches footer and experience page).

### 2. About Me — `index.html` lines 53–60

Replace paragraph with:

> I'm a full stack software engineer at Encon Pharma, where I build software that helps pharmacies streamline and automate their day-to-day operations. I work across the stack — from backend services and data flows to the interfaces people actually use — and I care most about building things that genuinely make someone's day easier. Outside of work, I take on freelance web projects for local businesses and keep exploring whatever interesting technology comes next.

### 3. What's next? — `projects.html` lines 284–295

**Career:**

> I'm building my career at Encon Pharma, working across the stack on software that pharmacies rely on every day. My focus now is going deeper — owning larger systems end to end, sharpening my architecture instincts, and growing toward senior engineering.

**Qualifications:**

> The best learning I do is driven by what I'm building. Working across backend services, data, and infrastructure means there's always something to go deeper on — cloud platforms, infrastructure as code, better ways to model and move data. I follow my curiosity where the work leads, and pick up formal credentials when they genuinely add something.

**Prospects:**

> Looking ahead, I want to keep building software with visible, real-world impact — tools that quietly remove friction from people's working days. Healthcare tech has shown me what well-built software can do in a high-stakes environment, and that's a standard I want to carry into everything I make.

## Out of Scope

- Section headings (Career / Qualifications / Prospects) stay as-is.
- No layout, styling, or markup changes.
- Other pages (experience, contact) unchanged.

## Testing

Visual check of both pages in a browser — text renders within existing glass cards without layout issues.
