// ===== Timeline staggered entrance (experience page) =====
document.addEventListener('DOMContentLoaded', () => {
    const timelineItems = document.querySelectorAll('.timeline-itemED, .timeline-itemEX');
    timelineItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 200}ms`;
    });
});

// ===== Scroll-to-top button =====
const toTop = document.querySelector('.to-top');
if (toTop) {
    window.addEventListener('scroll', () => {
        toTop.classList.toggle('active', window.pageYOffset > 500);
    });
}

// ===== Featured projects slider (data-driven) =====
// To add / reorder a featured project, edit this array. No markup changes needed.
const featuredProjects = [
    { title: 'Factor IT — Technology Solutions', image: 'assets/projects/factorit/home.png',            tools: ['html5', 'css3', 'javascript', 'wordpress'], link: 'projects.html' },
    { title: 'ReelSteelScrapmen',                image: 'assets/projects/reelsteelscrapmen/home.png',    tools: ['html5', 'css3', 'javascript'],              link: 'projects.html' },
    { title: 'Clearwater Accountancy Website',   image: 'assets/projects/clearwater/home.png',           tools: ['html5', 'css3', 'javascript'],              link: 'projects.html' },
    { title: 'AI Powered eLearning Application', image: 'assets/projects/EmployeeCoach_thumbnail.jpg',    tools: ['csharp', 'sql'],                            link: 'projects.html' },
    { title: 'Gaming Related News Website',      image: 'assets/projects/Gamingnews_thumbnail.JPG',      tools: ['html5', 'css3', 'javascript', 'php', 'react'], link: 'projects.html' },
    { title: 'Shift Rotation Management Program', image: 'assets/projects/GoodLife_thumbnail.png',       tools: ['csharp', 'sql'],                            link: 'projects.html' },
];

function initSlider() {
    const root = document.getElementById('slider');
    if (!root || !featuredProjects.length) return;

    let current = 0;

    const viewport = document.createElement('div');
    viewport.className = 'slider-viewport';

    const track = document.createElement('div');
    track.className = 'slider-track';
    viewport.appendChild(track);

    featuredProjects.forEach((p) => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.style.backgroundImage = `url('${p.image}')`;
        slide.addEventListener('click', () => { window.location.href = p.link; });

        const overlay = document.createElement('div');
        overlay.className = 'slide-overlay';

        const title = document.createElement('h2');
        title.textContent = p.title;

        const cta = document.createElement('p');
        cta.textContent = 'Click to view more';

        const tools = document.createElement('div');
        tools.className = 'tools';
        p.tools.forEach((t) => {
            const img = document.createElement('img');
            img.src = `assets/tools/${t}.svg`;
            img.alt = t;
            tools.appendChild(img);
        });

        overlay.append(title, cta, tools);
        slide.appendChild(overlay);
        track.appendChild(slide);
    });

    const bullets = document.createElement('div');
    bullets.className = 'slider-bullets';

    const dots = featuredProjects.map((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'slider-bullet';
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        bullets.appendChild(dot);
        return dot;
    });

    const makeArrow = (dir, symbol, label) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `slider-arrow slider-arrow-${dir}`;
        btn.innerHTML = `<i class="fas fa-chevron-${symbol}"></i>`;
        btn.setAttribute('aria-label', label);
        btn.addEventListener('click', () => goTo(dir === 'prev' ? current - 1 : current + 1));
        return btn;
    };

    function goTo(index) {
        const count = featuredProjects.length;
        current = (index + count) % count;
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    viewport.append(
        makeArrow('prev', 'left', 'Previous project'),
        makeArrow('next', 'right', 'Next project')
    );
    root.replaceChildren(viewport, bullets);
    goTo(0);
}

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

// ===== Image gallery lightbox (projects page) =====
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

// ===== Projects: filterable grid + modal (projects page) =====
function initProjects() {
    const grid = document.getElementById('project-grid');
    const source = document.querySelector('.project-source');
    if (!grid || !source) return;

    const articles = Array.from(source.querySelectorAll('.project'));

    articles.forEach((article) => {
        const thumb = article.querySelector('.project-thumb');
        if (!thumb) return; // markup contract requires a thumbnail; skip defensively
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
    ensureProjectModal();
}

let projectModal = null;

function ensureProjectModal() {
    if (projectModal) return;
    projectModal = document.createElement('div');
    projectModal.className = 'project-modal';
    projectModal.setAttribute('aria-hidden', 'true');
    projectModal.innerHTML = `
        <div class="project-modal-backdrop"></div>
        <div class="project-modal-panel" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
            <button type="button" class="project-modal-close" aria-label="Close">&times;</button>
            <div class="project-modal-media">
                <img class="project-modal-hero" src="" alt="">
                <div class="project-modal-thumbs"></div>
            </div>
            <div class="project-modal-info">
                <h2 class="project-modal-title" id="project-modal-title"></h2>
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

function openProjectModal(article) {
    ensureProjectModal();

    const galleryTemplate = article.querySelector('.project-gallery');
    const images = galleryTemplate
        ? Array.from(galleryTemplate.content.querySelectorAll('img'))
              .map((img) => ({ src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' }))
        : [];
    const tools = Array.from(article.querySelectorAll('.project-tools li')).map((li) => li.textContent.trim());
    const descEl = article.querySelector('.project-description');
    const linksEl = article.querySelector('.project-links');

    projectModal.querySelector('.project-modal-title').textContent = article.dataset.title || '';
    projectModal.querySelector('.project-modal-desc').innerHTML = descEl ? descEl.innerHTML : '';
    projectModal.querySelector('.project-modal-tools').innerHTML =
        tools.map((t) => `<span class="chip">${t}</span>`).join('');
    projectModal.querySelector('.project-modal-links').innerHTML = linksEl ? linksEl.innerHTML : '';

    const media = projectModal.querySelector('.project-modal-media');
    const hero = projectModal.querySelector('.project-modal-hero');
    const thumbs = projectModal.querySelector('.project-modal-thumbs');

    if (images.length) {
        media.style.display = '';
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
        hero.onclick = () => openLightbox(images, active); // overwritten each open (single-slot) — intended
    } else {
        media.style.display = 'none';
    }

    projectModal.classList.add('open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

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

// ===== Accordion smooth open/close (projects page) =====
// CSS keeps a 9999px no-JS fallback; here we animate max-height to the panel's
// real height so it opens and closes at a constant, intuitive pace.
function initAccordion() {
    const checkboxes = document.querySelectorAll('.accordion input[type="checkbox"]');
    if (!checkboxes.length) return;

    checkboxes.forEach((checkbox) => {
        const li = checkbox.closest('li');
        const content = li && li.querySelector('.content');
        if (!content) return;

        // Once fully open, drop the cap so late-loading images and responsive
        // reflow can grow the panel without clipping.
        content.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'max-height' && checkbox.checked) {
                content.style.maxHeight = 'none';
            }
        });

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                // Pin the current height first, then collapse next frame so the
                // browser has a concrete start value to animate from.
                content.style.maxHeight = content.scrollHeight + 'px';
                requestAnimationFrame(() => { content.style.maxHeight = '0px'; });
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initSlider();
    initLightbox();
    initGalleries();
    initProjects();
});
