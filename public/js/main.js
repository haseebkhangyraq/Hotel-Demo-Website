/* =========================================================
   GRAND AURELIA — PUBLIC SITE BEHAVIOUR
   ========================================================= */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, scope) => (scope || document).querySelector(selector);
  const $$ = (selector, scope) => Array.from((scope || document).querySelectorAll(selector));
  const on = (element, event, handler) => { if (element) element.addEventListener(event, handler); };

  /* ---------------------------------------------------------
     Utilities
     --------------------------------------------------------- */
  function createToastStack() {
    let stack = $('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      stack.setAttribute('aria-live', 'polite');
      document.body.appendChild(stack);
    }
    return stack;
  }

  function icon(name) {
    return `<i data-lucide="${name}"></i>`;
  }

  function refreshIcons(root) {
    if (window.lucide) window.lucide.createIcons({ nameAttr: 'data-lucide', attrs: { class: 'lucide' } });
    if (root && window.lucide && root.querySelectorAll) {
      // createIcons works document-wide; this call keeps the signature useful for future scoping.
    }
  }

  function toast(message, type) {
    const stack = createToastStack();
    const node = document.createElement('div');
    node.className = `toast ${type || 'success'}`;
    node.innerHTML = `${icon(type === 'error' ? 'alert-circle' : 'check-circle')}<span>${escapeHtml(message)}</span>`;
    stack.appendChild(node);
    refreshIcons();
    setTimeout(() => {
      node.style.opacity = '0';
      node.style.transform = 'translateY(8px)';
      node.style.transition = 'opacity .4s, transform .4s';
      setTimeout(() => node.remove(), 420);
    }, 4200);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function money(value) {
    return 'PKR ' + Math.round(Number(value) || 0).toLocaleString('en-PK');
  }

  function shortDate(value) {
    if (!value) return '';
    const d = new Date(value + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }

  function longDate(value) {
    if (!value) return '';
    const d = new Date(value + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
  }

  window.Aurelia = { toast: toast, money: money, refreshIcons: refreshIcons };

  /* ---------------------------------------------------------
     Preloader
     --------------------------------------------------------- */
  const preloader = $('#preloader');
  let preloaderDone = false;
  function hidePreloader() {
    if (!preloader || preloaderDone) return;
    preloaderDone = true;
    preloader.classList.add('is-done');
    setTimeout(() => { preloader.style.display = 'none'; }, 950);
    startHeroAnimation();
  }
  window.addEventListener('load', () => setTimeout(hidePreloader, 220));
  setTimeout(hidePreloader, 2800);

  /* ---------------------------------------------------------
     Lucide
     --------------------------------------------------------- */
  refreshIcons();

  /* ---------------------------------------------------------
     Header + mobile menu + back to top
     --------------------------------------------------------- */
  const header = $('[data-header]');
  const backToTop = $('#backToTop');
  const conciergeFab = $('#conciergeOpen');

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (backToTop) backToTop.classList.toggle('is-visible', y > 700);
    if (conciergeFab) conciergeFab.classList.toggle('is-away', y < 320);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  on(backToTop, 'click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  const mobileMenu = $('#mobileMenu');
  const menuToggle = $('#menuToggle');
  const mobileClose = $('#mobileClose');

  function setMobileMenu(open) {
    if (!mobileMenu) return;
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('no-scroll', open);
    if (menuToggle) menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) setTimeout(() => mobileClose && mobileClose.focus(), 220);
  }
  on(menuToggle, 'click', () => setMobileMenu(true));
  on(mobileClose, 'click', () => setMobileMenu(false));
  $$('.mobile-nav a').forEach((link) => link.addEventListener('click', () => setMobileMenu(false)));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMobileMenu(false);
      closeLightbox();
      closeEnquiryModal();
      closeConcierge();
    }
  });

  /* ---------------------------------------------------------
     Reveals, parallax, counters
     --------------------------------------------------------- */
  const hasMotion = !reduceMotion && document.documentElement.classList.contains('js-motion') && typeof window.gsap !== 'undefined';
  let scrollTriggerReady = false;

  if (hasMotion) {
    try {
      gsap.registerPlugin(ScrollTrigger);
      scrollTriggerReady = true;
    } catch (e) {
      scrollTriggerReady = false;
    }
  }

  if (scrollTriggerReady) {
    $$('[data-reveal]').forEach((element) => {
      const kind = element.getAttribute('data-reveal') || 'fade-up';
      const delay = parseFloat(element.getAttribute('data-reveal-delay') || '0');
      const from = { opacity: 0, duration: 1, ease: 'power3.out', delay: delay };
      if (kind === 'fade-up') from.y = 38;
      if (kind === 'image') { from.clipPath = 'inset(0 0 100% 0)'; from.y = 0; from.duration = 1.25; }
      if (kind === 'stagger' && element.children.length) {
        gsap.set(element, { opacity: 1 });
        gsap.set(element.children, { opacity: 0, y: 30 });
        ScrollTrigger.create({
          trigger: element, start: 'top 86%', once: true,
          onEnter: () => gsap.to(element.children, { opacity: 1, y: 0, duration: .9, stagger: .09, ease: 'power3.out', delay: delay })
        });
        return;
      }
      gsap.set(element, { opacity: 1 });
      ScrollTrigger.create({
        trigger: element, start: 'top 88%', once: true,
        onEnter: () => gsap.from(element, from)
      });
    });

    $$('[data-parallax]').forEach((element) => {
      const amount = parseFloat(element.getAttribute('data-parallax')) || .15;
      gsap.to(element, {
        yPercent: amount * 100,
        ease: 'none',
        scrollTrigger: { trigger: element.closest('section') || element, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  } else {
    $$('[data-reveal]').forEach((element) => { element.style.opacity = '1'; element.style.transform = 'none'; element.style.clipPath = 'none'; });
  }

  function startHeroAnimation() {
    if (!hasMotion || !scrollTriggerReady) return;
    const lines = $$('.hero-title .reveal-line > span');
    if (lines.length) {
      gsap.to(lines, { y: 0, duration: 1.25, ease: 'power4.out', stagger: .11, delay: .1 });
    }
    const fades = $$('[data-hero-fade]');
    if (fades.length) {
      gsap.from(fades, { opacity: 0, y: 22, duration: 1, ease: 'power3.out', stagger: .1, delay: .55 });
    }
    const widget = $('#heroBooking');
    if (widget) gsap.from(widget, { opacity: 0, y: 30, duration: 1, ease: 'power3.out', delay: 1 });
  }

  // Counters
  const counters = $$('[data-count]');
  if (counters.length) {
    const runCounter = (element) => {
      if (element.dataset.counted) return;
      element.dataset.counted = 'true';
      const target = Number(element.getAttribute('data-count')) || 0;
      if (reduceMotion) { element.textContent = target; return; }
      const duration = 1500;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) { runCounter(entry.target); observer.unobserve(entry.target); } });
      }, { threshold: .4 });
      counters.forEach((counter) => observer.observe(counter));
    } else {
      counters.forEach(runCounter);
    }
  }

  /* ---------------------------------------------------------
     Swipers
     --------------------------------------------------------- */
  function initSwipers() {
    if (typeof window.Swiper === 'undefined') return;

    const roomsEl = $('#roomsSwiper');
    if (roomsEl) {
      const total = roomsEl.querySelectorAll('.swiper-slide').length;
      const count = $('#roomsCount');
      const progress = $('#roomsProgress');
      const pad = (n) => String(n).padStart(2, '0');
      const swiper = new Swiper(roomsEl, {
        slidesPerView: 1.15,
        spaceBetween: 24,
        speed: 850,
        grabCursor: true,
        breakpoints: {
          560: { slidesPerView: 1.6, spaceBetween: 26 },
          860: { slidesPerView: 2.2, spaceBetween: 30 },
          1180: { slidesPerView: 3.15, spaceBetween: 34 }
        },
        on: {
          init(instance) { update(instance); },
          slideChange(instance) { update(instance); },
          resize(instance) { update(instance); }
        }
      });
      function update(instance) {
        if (count) count.textContent = `${pad(instance.realIndex + 1)} / ${pad(total)}`;
        if (progress) {
          const maxIndex = Math.max(1, total - instance.params.slidesPerView);
          const ratio = Math.min(1, (instance.realIndex + 1) / maxIndex);
          progress.style.width = `${Math.max(12, ratio * 100)}%`;
        }
      }
      on($('#roomsNext'), 'click', () => swiper.slideNext());
      on($('#roomsPrev'), 'click', () => swiper.slidePrev());
    }

    const testimonialEl = $('#testimonialSwiper');
    if (testimonialEl) {
      const count = $('#testimonialCount');
      const total = testimonialEl.querySelectorAll('.swiper-slide').length;
      const swiper = new Swiper(testimonialEl, {
        slidesPerView: 1,
        speed: 900,
        loop: total > 2,
        autoplay: reduceMotion ? false : { delay: 7000, disableOnInteraction: false },
        on: {
          init(instance) { update(instance); },
          slideChange(instance) { update(instance); }
        }
      });
      function update(instance) {
        if (count) count.textContent = `${String(instance.realIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
      }
      on($('#testimonialNext'), 'click', () => swiper.slideNext());
      on($('#testimonialPrev'), 'click', () => swiper.slidePrev());
    }
  }
  initSwipers();

  /* ---------------------------------------------------------
     Homepage facility selector
     --------------------------------------------------------- */
  const facilityItems = $$('[data-facility]');
  const facilityImages = $$('[data-facility-image]');
  const facilityCaption = $('#facilityCaption');
  function selectFacility(index) {
    facilityItems.forEach((item) => {
      const active = item.getAttribute('data-facility') === String(index);
      item.classList.toggle('is-active', active);
      const trigger = $('.facility-trigger', item);
      if (trigger) trigger.setAttribute('aria-expanded', active ? 'true' : 'false');
    });
    facilityImages.forEach((img) => img.classList.toggle('is-active', img.getAttribute('data-facility-image') === String(index)));
    const activeItem = facilityItems.find((item) => item.getAttribute('data-facility') === String(index));
    if (facilityCaption && activeItem) {
      facilityCaption.innerHTML = `${icon('clock')} ${escapeHtml(activeItem.getAttribute('data-hours') || 'Open daily')}`;
      refreshIcons();
    }
  }
  facilityItems.forEach((item) => {
    const trigger = $('.facility-trigger', item);
    on(trigger, 'click', () => selectFacility(item.getAttribute('data-facility')));
    on(trigger, 'mouseenter', () => selectFacility(item.getAttribute('data-facility')));
  });

  /* ---------------------------------------------------------
     FAQ accordion
     --------------------------------------------------------- */
  $$('[data-faq-list] .faq-q').forEach((button) => {
    on(button, 'click', () => {
      const item = button.closest('.faq-item');
      const list = button.closest('[data-faq-list]');
      const wasOpen = item.classList.contains('is-open');
      $$('.faq-item', list).forEach((entry) => {
        entry.classList.remove('is-open');
        const q = $('.faq-q', entry);
        if (q) q.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------------------------------------------------------
     Copy promotional codes
     --------------------------------------------------------- */
  $$('[data-copy]').forEach((button) => {
    on(button, 'click', async () => {
      const code = button.getAttribute('data-copy');
      try {
        await navigator.clipboard.writeText(code);
        toast(`Code ${code} copied to your clipboard.`);
        const original = button.innerHTML;
        button.innerHTML = icon('check');
        refreshIcons();
        setTimeout(() => { button.innerHTML = original; refreshIcons(); }, 1800);
      } catch (e) {
        toast(`Your code is ${code}.`, 'success');
      }
    });
  });

  /* ---------------------------------------------------------
     Filters (gallery + experiences)
     --------------------------------------------------------- */
  function setupFilter({ buttonSelector, itemSelector, activeClass, countSelector, labelSelector, emptySelector, resetSelector, noun }) {
    const buttons = $$(buttonSelector);
    const items = $$(itemSelector);
    if (!buttons.length || !items.length) return;
    const count = countSelector ? $(countSelector) : null;
    const label = labelSelector ? $(labelSelector) : null;
    const empty = emptySelector ? $(emptySelector) : null;

    function apply(value) {
      let visible = 0;
      items.forEach((item) => {
        const match = value === 'all' || item.getAttribute('data-category') === value;
        item.style.display = match ? '' : 'none';
        if (match) visible += 1;
      });
      buttons.forEach((button) => {
        const isActive = button.getAttribute(buttonSelector.includes('gallery') ? 'data-gallery-filter' : 'data-exp-filter') === value;
        button.classList.toggle(activeClass || 'is-active', isActive);
      });
      if (count) count.textContent = visible;
      if (label) label.textContent = value === 'all' ? `the full ${noun}` : value.toLowerCase();
      if (empty) empty.hidden = visible !== 0;
    }

    buttons.forEach((button) => {
      on(button, 'click', () => {
        const attr = button.hasAttribute('data-gallery-filter') ? 'data-gallery-filter' : 'data-exp-filter';
        apply(button.getAttribute(attr));
      });
    });
    on(resetSelector ? $(resetSelector) : null, 'click', () => apply('all'));
  }

  setupFilter({
    buttonSelector: '[data-gallery-filter]', itemSelector: '[data-gallery-item]',
    countSelector: '#galleryCount', labelSelector: '#galleryCategoryLabel',
    emptySelector: '#galleryEmpty', resetSelector: '[data-gallery-reset]', noun: 'collection'
  });
  setupFilter({
    buttonSelector: '[data-exp-filter]', itemSelector: '[data-exp-card]',
    emptySelector: null, resetSelector: null, noun: 'collection'
  });

  /* ---------------------------------------------------------
     Lightbox
     --------------------------------------------------------- */
  let lightbox = null;
  let lightboxItems = [];
  let lightboxIndex = 0;
  let lastFocused = null;

  function buildLightbox() {
    const node = document.createElement('div');
    node.className = 'lightbox';
    node.id = 'lightbox';
    node.setAttribute('role', 'dialog');
    node.setAttribute('aria-modal', 'true');
    node.setAttribute('aria-label', 'Photograph viewer');
    node.innerHTML = `
      <div class="lightbox-head">
        <span class="lightbox-counter" data-lightbox-counter></span>
        <span class="lightbox-title" data-lightbox-title></span>
        <button type="button" class="lightbox-close" data-lightbox-close aria-label="Close viewer">${icon('x')}</button>
      </div>
      <div class="lightbox-stage">
        <button type="button" class="lightbox-nav" data-lightbox-prev aria-label="Previous photograph">${icon('chevron-left')}</button>
        <div class="lightbox-image-wrap"><img data-lightbox-image src="" alt=""></div>
        <button type="button" class="lightbox-nav" data-lightbox-next aria-label="Next photograph">${icon('chevron-right')}</button>
      </div>
      <div class="lightbox-caption" data-lightbox-caption></div>
      <div class="lightbox-thumbs" data-lightbox-thumbs></div>`;
    document.body.appendChild(node);
    refreshIcons();
    on($('[data-lightbox-close]', node), 'click', closeLightbox);
    on($('[data-lightbox-prev]', node), 'click', () => stepLightbox(-1));
    on($('[data-lightbox-next]', node), 'click', () => stepLightbox(1));
    node.addEventListener('click', (event) => {
      if (event.target === node || event.target.classList.contains('lightbox-stage')) closeLightbox();
    });
    return node;
  }

  function openLightbox(group, index) {
    if (!lightbox) lightbox = buildLightbox();
    lightboxItems = $$(`[data-lightbox-group="${group}"]`).map((button) => ({
      src: button.getAttribute('data-full') || $('img', button)?.src || '',
      caption: button.getAttribute('data-caption') || '',
      alt: $('img', button)?.alt || button.getAttribute('data-caption') || ''
    }));
    if (!lightboxItems.length) return;
    lightboxIndex = index;
    lastFocused = document.activeElement;
    renderLightbox();
    lightbox.classList.add('is-open');
    document.body.classList.add('no-scroll');
    setTimeout(() => $('[data-lightbox-close]', lightbox).focus(), 80);
  }

  function renderLightbox() {
    if (!lightbox) return;
    const item = lightboxItems[lightboxIndex];
    const img = $('[data-lightbox-image]', lightbox);
    img.src = item.src;
    img.alt = item.alt;
    $('[data-lightbox-title]', lightbox).textContent = item.caption;
    $('[data-lightbox-caption]', lightbox).textContent = `${item.caption} · ${lightboxIndex + 1} of ${lightboxItems.length}`;
    $('[data-lightbox-counter]', lightbox).textContent = `${String(lightboxIndex + 1).padStart(2, '0')} / ${String(lightboxItems.length).padStart(2, '0')}`;
    const thumbs = $('[data-lightbox-thumbs]', lightbox);
    thumbs.innerHTML = lightboxItems.map((entry, i) => `<button type="button" class="${i === lightboxIndex ? 'is-active' : ''}" data-thumb="${i}" aria-label="View photograph ${i + 1}"><img src="${escapeHtml(entry.src)}" alt=""></button>`).join('');
    $$('[data-thumb]', thumbs).forEach((button) => {
      on(button, 'click', () => { lightboxIndex = Number(button.getAttribute('data-thumb')); renderLightbox(); });
    });
    thumbs.querySelector('.is-active')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }

  function stepLightbox(direction) {
    if (!lightboxItems.length) return;
    lightboxIndex = (lightboxIndex + direction + lightboxItems.length) % lightboxItems.length;
    renderLightbox();
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  document.addEventListener('keydown', (event) => {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowRight') stepLightbox(1);
    if (event.key === 'ArrowLeft') stepLightbox(-1);
  });

  $$('[data-lightbox-group]').forEach((button, index, all) => {
    on(button, 'click', () => {
      const group = button.getAttribute('data-lightbox-group');
      const groupItems = all.filter((entry) => entry.getAttribute('data-lightbox-group') === group);
      openLightbox(group, Math.max(0, groupItems.indexOf(button)));
    });
  });

  /* ---------------------------------------------------------
     Generic modal helpers
     --------------------------------------------------------- */
  function createModal(id, html) {
    let modal = document.getElementById(id);
    if (modal) modal.remove();
    modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = id;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `<div class="modal-backdrop" data-modal-close></div><div class="modal-panel">${html}</div>`;
    document.body.appendChild(modal);
    refreshIcons();
    $$('[data-modal-close]', modal).forEach((node) => on(node, 'click', () => closeModal(id)));
    return modal;
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    const focusable = modal.querySelector('input, select, textarea, button');
    if (focusable) setTimeout(() => focusable.focus(), 160);
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  function enquiryModal() {
    return document.getElementById('enquiryModal');
  }

  function openEnquiry(options) {
    const opts = options || {};
    let modal = enquiryModal();
    if (!modal) {
      modal = createModal('enquiryModal', `
        <button type="button" class="modal-close" data-modal-close aria-label="Close">${icon('x')}</button>
        <span class="modal-eyebrow">${icon('sparkles')} A note to Aurelia</span>
        <h2 class="modal-title" id="enquiryModalTitle">Tell us a little</h2>
        <p class="modal-lede" data-enquiry-lede>Our team will reply within one working day.</p>
        <form data-smart-enquiry novalidate>
          <input type="hidden" name="type" value="experience">
          <input type="hidden" name="subject" value="Experience enquiry">
          <div class="form-grid">
            <div class="field"><label for="enqName">Your name</label><input id="enqName" name="name" required autocomplete="name"><span class="field-error"></span></div>
            <div class="field"><label for="enqEmail">Email</label><input id="enqEmail" name="email" type="email" required autocomplete="email"><span class="field-error"></span></div>
            <div class="field"><label for="enqPhone">Phone <span style="text-transform:none;letter-spacing:0;">(optional)</span></label><input id="enqPhone" name="phone" autocomplete="tel"><span class="field-error"></span></div>
            <div class="field span-2"><label for="enqMessage">Your message</label><textarea id="enqMessage" name="message" rows="4" required></textarea><span class="field-error"></span></div>
          </div>
          <button class="btn btn-gold btn-block mt-3" type="submit">Send Enquiry ${icon('arrow-right')}</button>
          <p class="form-status" data-status aria-live="polite"></p>
        </form>`);
      const form = $('[data-smart-enquiry]', modal);
      on(form, 'submit', (event) => {
        event.preventDefault();
        submitEnquiryForm(form, opts);
      });
    }
    modal.querySelector('[name="type"]').value = opts.type || 'experience';
    modal.querySelector('[name="subject"]').value = opts.subject || 'Experience enquiry';
    $('#enquiryModalTitle', modal).textContent = opts.title || 'Enquire about this experience';
    $('[data-enquiry-lede]', modal).textContent = opts.lede || 'Share your dates and wishes. Our team will write back within one working day.';
    form.dataset.details = opts.details || '';
    openModal('enquiryModal');
  }

  async function submitEnquiryForm(form, opts) {
    const data = new FormData(form);
    const status = $('[data-status]', form);
    const submit = $('button[type="submit"]', form);
    clearFieldErrors(form);
    const payload = Object.fromEntries(data.entries());
    let valid = true;
    if (!payload.name || payload.name.trim().length < 2) { setFieldError(form, 'name', 'Please enter your name.'); valid = false; }
    if (!validEmail(payload.email)) { setFieldError(form, 'email', 'Please enter a valid email address.'); valid = false; }
    if (!payload.message || payload.message.trim().length < 5) { setFieldError(form, 'message', 'Please add a short message.'); valid = false; }
    if (!valid) return;

    if (submit) { submit.disabled = true; submit.dataset.label = submit.innerHTML; submit.innerHTML = 'Sending…'; }
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, details: (opts && opts.details) ? { item: opts.details } : {} })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || 'We could not send that just now.');
      if (status) { status.textContent = result.message; status.classList.add('is-visible', 'success'); }
      form.reset();
      toast(result.message, 'success');
      setTimeout(() => closeModal('enquiryModal'), 1600);
    } catch (error) {
      if (status) { status.textContent = error.message; status.classList.add('is-visible', 'error'); }
      toast(error.message, 'error');
    } finally {
      if (submit) { submit.disabled = false; submit.innerHTML = submit.dataset.label || 'Send Enquiry'; refreshIcons(); }
    }
  }

  function openServiceModal(service) {
    const modal = createModal('serviceModal', `
      <button type="button" class="modal-close" data-modal-close aria-label="Close">${icon('x')}</button>
      <span class="modal-eyebrow">${icon('concierge-bell')} Guest services</span>
      <h2 class="modal-title">${escapeHtml(service)}</h2>
      <p class="modal-lede">Tell us where you are and when you would like us. This request is a demonstration and is saved in the hotel inbox.</p>
      <form data-smart-service novalidate>
        <input type="hidden" name="service" value="${escapeHtml(service)}">
        <div class="form-grid">
          <div class="field"><label for="svcName">Your name</label><input id="svcName" name="name" required autocomplete="name"><span class="field-error"></span></div>
          <div class="field"><label for="svcRoom">Room number</label><input id="svcRoom" name="roomNumber" required placeholder="e.g. 304"><span class="field-error"></span></div>
          <div class="field"><label for="svcEmail">Email <span style="text-transform:none;letter-spacing:0;">(optional)</span></label><input id="svcEmail" name="email" type="email" autocomplete="email"><span class="field-error"></span></div>
          <div class="field"><label for="svcTime">Preferred time <span style="text-transform:none;letter-spacing:0;">(optional)</span></label><input id="svcTime" name="preferredTime" type="time"><span class="field-error"></span></div>
          <div class="field span-2"><label for="svcMessage">Anything we should know?</label><textarea id="svcMessage" name="message" rows="3" placeholder="Optional details"></textarea><span class="field-error"></span></div>
        </div>
        <button class="btn btn-gold btn-block mt-3" type="submit">Send Request ${icon('arrow-right')}</button>
        <p class="form-status" data-status aria-live="polite"></p>
      </form>`);
    const form = $('[data-smart-service]', modal);
    on(form, 'submit', async (event) => {
      event.preventDefault();
      clearFieldErrors(form);
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.service = service;
      payload.mode = 'request';
      payload.priority = 'Normal';
      let valid = true;
      if (!payload.name || payload.name.trim().length < 2) { setFieldError(form, 'name', 'Please enter your name.'); valid = false; }
      if (!payload.roomNumber) { setFieldError(form, 'roomNumber', 'Please enter your room number.'); valid = false; }
      if (!valid) return;
      await sendServiceRequest(form, payload, 'serviceModal');
    });
    openModal('serviceModal');
  }

  async function sendServiceRequest(form, payload, modalId) {
    const status = $('[data-status]', form);
    const submit = $('button[type="submit"]', form);
    if (submit) { submit.disabled = true; submit.dataset.label = submit.innerHTML; submit.innerHTML = 'Sending…'; }
    try {
      const response = await fetch('/api/guest-services', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || 'We could not send that request.');
      if (status) { status.textContent = result.message; status.classList.add('is-visible', 'success'); }
      form.reset();
      toast(result.message, 'success');
      setTimeout(() => closeModal(modalId), 1800);
    } catch (error) {
      if (status) { status.textContent = error.message; status.classList.add('is-visible', 'error'); }
      toast(error.message, 'error');
    } finally {
      if (submit) { submit.disabled = false; submit.innerHTML = submit.dataset.label || 'Send'; refreshIcons(); }
    }
  }

  function closeEnquiryModal() {
    closeModal('enquiryModal');
    closeModal('serviceModal');
  }

  $$('[data-enquiry]').forEach((button) => {
    on(button, 'click', () => openEnquiry({
      type: button.getAttribute('data-enquiry-type') || 'experience',
      subject: button.getAttribute('data-enquiry-subject') || 'Experience enquiry',
      title: button.getAttribute('data-enquiry-subject') || 'Enquire with us',
      details: button.getAttribute('data-enquiry-details') || ''
    }));
  });

  $$('[data-service-request]').forEach((button) => {
    on(button, 'click', () => openServiceModal(button.getAttribute('data-service') || 'Guest service'));
  });

  /* ---------------------------------------------------------
     Contact + newsletter + enquiry + guest service forms
     --------------------------------------------------------- */
  function clearFieldErrors(form) {
    $$('.field-error', form).forEach((el) => { el.textContent = ''; });
    $$('.is-invalid', form).forEach((el) => el.classList.remove('is-invalid'));
    $$('.has-error', form).forEach((el) => el.classList.remove('has-error'));
    $$('[data-status]', form).forEach((el) => { el.classList.remove('is-visible', 'error', 'success'); el.textContent = ''; });
  }

  function setFieldError(form, name, message) {
    const field = form.querySelector(`[name="${name}"]`);
    if (field) {
      field.classList.add('is-invalid');
      const wrapper = field.closest('.field');
      if (wrapper) wrapper.classList.add('has-error');
      const error = wrapper?.querySelector('.field-error');
      if (error) error.textContent = message;
    }
    const generic = form.querySelector('[data-error-for="' + name + '"]');
    if (generic) generic.textContent = message;
  }

  function setFormStatus(form, message, state) {
    const status = $('[data-status]', form);
    if (!status) return;
    status.textContent = message;
    status.classList.add('is-visible', state || 'success');
  }

  function serialize(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  async function postJSON(url, payload) {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    let result = {};
    try { result = await response.json(); } catch (e) { result = { ok: false, message: 'Unexpected server response.' }; }
    if (!response.ok || result.ok === false) throw new Error(result.message || 'Something went wrong. Please try again.');
    return result;
  }

  $$('[data-ajax-contact]').forEach((form) => {
    on(form, 'submit', async (event) => {
      event.preventDefault();
      clearFieldErrors(form);
      const data = serialize(form);
      let valid = true;
      if (!data.name || data.name.trim().length < 2) { setFieldError(form, 'name', 'Please enter your name.'); valid = false; }
      if (!validEmail(data.email)) { setFieldError(form, 'email', 'Please enter a valid email address.'); valid = false; }
      if (!data.message || data.message.trim().length < 5) { setFieldError(form, 'message', 'Please add a short message.'); valid = false; }
      if (!valid) return;
      const button = $('button[type="submit"]', form);
      if (button) { button.disabled = true; button.dataset.label = button.innerHTML; button.innerHTML = 'Sending…'; }
      try {
        const result = await postJSON('/api/contact', data);
        setFormStatus(form, result.message, 'success');
        toast(result.message, 'success');
        form.reset();
      } catch (error) {
        setFormStatus(form, error.message, 'error');
        toast(error.message, 'error');
      } finally {
        if (button) { button.disabled = false; button.innerHTML = button.dataset.label || 'Send'; refreshIcons(); }
      }
    });
  });

  $$('[data-ajax-enquiry]').forEach((form) => {
    on(form, 'submit', async (event) => {
      event.preventDefault();
      clearFieldErrors(form);
      const data = serialize(form);
      let valid = true;
      if (!data.name || data.name.trim().length < 2) { setFieldError(form, 'name', 'Please enter your name.'); valid = false; }
      if (!validEmail(data.email)) { setFieldError(form, 'email', 'Please enter a valid email address.'); valid = false; }
      if (!data.message || data.message.trim().length < 5) { setFieldError(form, 'message', 'Please tell us a little about the occasion.'); valid = false; }
      if (!valid) return;
      const details = { ...data };
      delete details.name; delete details.email; delete details.phone; delete details.message;
      const payload = {
        type: form.getAttribute('data-enquiry-type') || 'event',
        name: data.name, email: data.email, phone: data.phone || '',
        subject: data.space || data.eventType || 'Event enquiry',
        message: data.message, details
      };
      const button = $('button[type="submit"]', form);
      if (button) { button.disabled = true; button.dataset.label = button.innerHTML; button.innerHTML = 'Sending…'; }
      try {
        const result = await postJSON('/api/enquiries', payload);
        setFormStatus(form, result.message, 'success');
        toast(result.message, 'success');
        form.reset();
      } catch (error) {
        setFormStatus(form, error.message, 'error');
        toast(error.message, 'error');
      } finally {
        if (button) { button.disabled = false; button.innerHTML = button.dataset.label || 'Send'; refreshIcons(); }
      }
    });
  });

  $$('[data-ajax-guest-service]').forEach((form) => {
    on(form, 'submit', async (event) => {
      event.preventDefault();
      clearFieldErrors(form);
      const data = serialize(form);
      const mode = form.getAttribute('data-mode') || 'request';
      let valid = true;
      if (!data.name || data.name.trim().length < 2) { setFieldError(form, 'name', 'Please enter your name.'); valid = false; }
      if (!data.bookingReference) { setFieldError(form, 'bookingReference', 'Please enter your booking reference.'); valid = false; }
      if (mode === 'checkout' && !data.roomNumber) { setFieldError(form, 'roomNumber', 'Please enter your room number.'); valid = false; }
      if (!valid) return;
      const payload = {
        ...data,
        service: mode === 'checkin' ? 'Express check-in' : mode === 'checkout' ? 'Express check-out' : 'Guest service',
        mode,
        priority: mode === 'checkout' ? 'Departure' : 'Arrival',
        message: data.message || (mode === 'checkin' ? 'Guest has begun express check-in.' : 'Guest has requested express check-out.')
      };
      await sendServiceRequest(form, payload, null);
    });
  });

  const newsletter = $('#newsletterForm');
  on(newsletter, 'submit', async (event) => {
    event.preventDefault();
    const form = newsletter;
    clearFieldErrors(form);
    const email = $('input[name="email"]', form).value;
    if (!validEmail(email)) {
      setFormStatus(form, 'Please enter a valid email address.', 'error');
      return;
    }
    const button = $('button[type="submit"]', form);
    if (button) button.disabled = true;
    try {
      const result = await postJSON('/api/newsletter', { email });
      setFormStatus(form, result.message, 'success');
      toast(result.message, 'success');
      form.reset();
    } catch (error) {
      setFormStatus(form, error.message, 'error');
      toast(error.message, 'error');
    } finally {
      if (button) button.disabled = false;
    }
  });

  /* ---------------------------------------------------------
     Events / experiences prefill
     --------------------------------------------------------- */
  $$('[data-space-select]').forEach((button) => {
    on(button, 'click', () => {
      const select = $('#eventSpace');
      const name = button.getAttribute('data-space-select');
      if (select && name) {
        const match = Array.from(select.options).find((option) => option.textContent.trim() === name || option.value === name);
        if (match) select.value = match.value;
      }
      const message = $('#eventMessage');
      if (message && !message.value) message.value = `We are interested in ${name}. Please could you share availability and a proposal?`;
      const target = $('#eventName');
      setTimeout(() => target && target.focus({ preventScroll: false }), 450);
    });
  });

  /* ---------------------------------------------------------
     Hero booking date logic
     --------------------------------------------------------- */
  const heroCheckin = $('#heroCheckin');
  const heroCheckout = $('#heroCheckout');
  if (heroCheckin && heroCheckout) {
    const sync = () => {
      if (!heroCheckin.value) return;
      const next = new Date(heroCheckin.value + 'T00:00:00');
      next.setDate(next.getDate() + 1);
      const min = next.toISOString().slice(0, 10);
      heroCheckout.min = min;
      if (!heroCheckout.value || heroCheckout.value < min) heroCheckout.value = min;
    };
    on(heroCheckin, 'change', sync);
    sync();
  }

  /* ---------------------------------------------------------
     Auto-submit selects (public pages)
     --------------------------------------------------------- */
  $$('[data-auto-submit]').forEach((select) => {
    on(select, 'change', () => select.form && select.form.submit());
  });

  /* ---------------------------------------------------------
     Concierge demo
     --------------------------------------------------------- */
  const conciergeOpenBtn = $('#conciergeOpen');
  const conciergePanel = $('#conciergePanel');
  const conciergeBackdrop = $('#conciergeBackdrop');
  const conciergeMessages = $('#conciergeMessages');
  const conciergeForm = $('#conciergeForm');
  const conciergeInput = $('#conciergeInput');
  let conciergeData = null;
  let conciergeBusy = false;

  async function loadConciergeData() {
    if (conciergeData) return conciergeData;
    try {
      const response = await fetch('/api/concierge');
      conciergeData = await response.json();
    } catch (e) {
      conciergeData = null;
    }
    return conciergeData;
  }

  function openConcierge() {
    if (!conciergePanel) return;
    conciergePanel.classList.add('is-open');
    conciergePanel.setAttribute('aria-hidden', 'false');
    if (conciergeBackdrop) { conciergeBackdrop.hidden = false; conciergeBackdrop.classList.add('is-open'); }
    if (conciergeOpenBtn) conciergeOpenBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
    loadConciergeData();
    setTimeout(() => conciergeInput && conciergeInput.focus(), 300);
  }

  function closeConcierge() {
    if (!conciergePanel) return;
    conciergePanel.classList.remove('is-open');
    conciergePanel.setAttribute('aria-hidden', 'true');
    if (conciergeBackdrop) { conciergeBackdrop.classList.remove('is-open'); setTimeout(() => { if (!conciergeBackdrop.classList.contains('is-open')) conciergeBackdrop.hidden = true; }, 400); }
    if (conciergeOpenBtn) conciergeOpenBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }

  on(conciergeOpenBtn, 'click', () => {
    if (conciergePanel && conciergePanel.classList.contains('is-open')) closeConcierge();
    else openConcierge();
  });
  on($('#conciergeClose'), 'click', closeConcierge);
  on(conciergeBackdrop, 'click', closeConcierge);

  function addChatMessage(role, html) {
    if (!conciergeMessages) return;
    const wrap = document.createElement('div');
    wrap.className = `chat-message ${role}`;
    wrap.innerHTML = `<div class="chat-avatar">${role === 'user' ? 'You' : 'A'}</div><div class="chat-bubble">${html}</div>`;
    conciergeMessages.appendChild(wrap);
    conciergeMessages.scrollTop = conciergeMessages.scrollHeight;
  }

  function showTyping() {
    if (!conciergeMessages) return null;
    const wrap = document.createElement('div');
    wrap.className = 'chat-message bot';
    wrap.dataset.typing = 'true';
    wrap.innerHTML = `<div class="chat-avatar">A</div><div class="chat-bubble"><span class="chat-typing"><span></span><span></span><span></span></span></div>`;
    conciergeMessages.appendChild(wrap);
    conciergeMessages.scrollTop = conciergeMessages.scrollHeight;
    return wrap;
  }

  function conciergeReply(text) {
    const q = String(text || '').toLowerCase();
    const data = conciergeData || {};
    const hotel = data.hotel || {};
    const roomList = (data.rooms || []).slice(0, 11);

    if (/hello|hi\b|good (morning|afternoon|evening)|salaam|assalam/.test(q)) {
      return `Good evening. It is a pleasure to welcome you to <strong>Grand Aurelia</strong>. I can help with rooms, dining, the spa, events or practical questions about your stay. What would you like to know?`;
    }
    if (/price|rate|cost|how much|expensive|budget|tariff/.test(q) && /room|suite|stay|night/.test(q) || /room prices|room rates/.test(q)) {
      const lines = roomList.slice(0, 6).map((room) => `<li><strong>${escapeHtml(room.name)}</strong> — ${money(room.price)} per night</li>`).join('');
      return `<p>Our rooms begin at ${money(roomList[roomList.length - 1]?.price || 0)} and rise to the Presidential Suite. A selection:</p><ul>${lines}</ul><p><a href="/rooms">View all eleven categories</a> or <a href="/booking">check live availability</a>.</p>`;
    }
    if (/room|suite|bed|accommodat|family|honeymoon suite|presidential|penthouse/.test(q)) {
      const found = roomList.filter((room) => room.name.toLowerCase().includes(q.replace(/rooms?|suite/g, '').trim())).slice(0, 3);
      const picks = found.length ? found : roomList.slice(0, 3);
      const lines = picks.map((room) => `<li><strong>${escapeHtml(room.name)}</strong> — ${room.size} m², ${escapeHtml(room.bed)} · ${money(room.price)}</li>`).join('');
      return `<p>I would suggest one of these, depending on the occasion:</p><ul>${lines}</ul><p>Every rate includes Wi-Fi, the gardens and the pool. <a href="/rooms">Explore Rooms &amp; Suites</a> or <a href="/booking">reserve your stay</a>.</p>`;
    }
    if (/pool|swim|spa|massage|hammam|sauna|wellness|gym|fitness|yoga/.test(q)) {
      const relevant = (data.facilities || []).filter((facility) => /pool|spa|fitness|wellness|yoga|hammam/i.test(facility.name + ' ' + facility.description)).slice(0, 4);
      if (relevant.length) {
        const lines = relevant.map((facility) => `<li><strong>${escapeHtml(facility.name)}</strong> — ${escapeHtml(facility.description)}${facility.hours ? ` <em>(${escapeHtml(facility.hours)})</em>` : ''}</li>`).join('');
        return `<p>Yes — the hotel has a 30-metre infinity pool, a Himalayan spa and a fitness studio.</p><ul>${lines}</ul><p><a href="/facilities">See all facilities</a> or ask me about treatments.</p>`;
      }
      return `Our Aurelia Spa is a 1,200 sqm sanctuary with eight treatment suites, a traditional hammam and a candlelit relaxation lounge. The infinity pool is open from 06:00 to 22:00. <a href="/facilities#aurelia-spa">Discover the spa</a>.`;
    }
    if (/dining|restaurant|menu|eat|food|breakfast|dinner|restaurant|in-room|room service|chef/.test(q)) {
      const highlights = (data.menuHighlights || []).slice(0, 4).map((item) => `<li><strong>${escapeHtml(item.name)}</strong> — ${money(item.price)} <em>(${escapeHtml(item.category)})</em></li>`).join('');
      return `<p>We have five dining rooms, from Noor’s all-day table to AURUM’s tasting menu. In-room dining is available around the clock.</p>${highlights ? `<ul>${highlights}</ul>` : ''}<p><a href="/dining">Explore the full menu</a> or <a href="/guest-services">order to your room</a>.</p>`;
    }
    if (/wedding|event|meeting|conference|banquet|party|ballroom|celebrat/.test(q)) {
      return `<p>Our five venues range from the Executive Boardroom for eight to the Grand Aurelia Ballroom for 800 guests. A dedicated planner will look after menus, styling and timing.</p><p><a href="/events">Explore meetings &amp; events</a> or <a href="/events#enquiry">send an enquiry</a>.</p>`;
    }
    if (/offer|promo|discount|package|deal|code/.test(q)) {
      const offers = (data.offers || []).slice(0, 4).map((offer) => `<li><strong>${escapeHtml(offer.title)}</strong> — ${escapeHtml(offer.discount)}${offer.code ? ` · code <strong>${escapeHtml(offer.code)}</strong>` : ''}</li>`).join('');
      return `<p>A few current invitations:</p><ul>${offers}</ul><p>Promotional codes can be applied on the <a href="/booking">reservation page</a>. <a href="/offers">See all offers</a>.</p>`;
    }
    if (/check.?in|check.?out|arrival|departure|late checkout|early/.test(q)) {
      return `<p>Check-in is from <strong>${escapeHtml(hotel.checkin_time || '15:00')}</strong> and check-out is by <strong>${escapeHtml(hotel.checkout_time || '12:00')}</strong>. Early arrival and guaranteed late check-out can be arranged, subject to availability — late check-out is offered as an extra when booking.</p><p><a href="/guest-services">Guest services</a> · <a href="/booking">Reserve</a></p>`;
    }
    if (/wifi|wi-fi|internet|parking|car|valet|airport|transfer|taxi/.test(q)) {
      return `<p>High-speed Wi-Fi is complimentary throughout the hotel. Covered valet parking is available, and we offer chauffeured airport transfers from Islamabad International (about 40 minutes).</p><p>Transfers can be added to your reservation, or arranged through <a href="/guest-services">Guest Services</a>.</p>`;
    }
    if (/where|location|address|direction|map|airport|city|margalla/.test(q)) {
      return `<p>We are at <strong>${escapeHtml(hotel.address || '1 Aurelia Boulevard, Margalla Hills')}, ${escapeHtml(hotel.city || 'Islamabad')}</strong> — twelve minutes from the diplomatic quarter and forty minutes from the airport.</p><p><a href="${escapeHtml(hotel.maps_url || '#')}" target="_blank" rel="noopener">Open in Maps</a> · <a href="/contact">Contact us</a></p>`;
    }
    if (/contact|phone|call|email|whatsapp|speak|human|reception/.test(q)) {
      return `<p>Our reservations team is available 24 hours.</p><ul><li>Telephone: <a href="tel:${escapeHtml(String(hotel.phone || '').replace(/[^+\\d]/g, ''))}">${escapeHtml(hotel.phone || '')}</a></li><li>Email: <a href="mailto:${escapeHtml(hotel.email || '')}">${escapeHtml(hotel.email || '')}</a></li><li>WhatsApp: ${escapeHtml(hotel.whatsapp || '')}</li></ul><p><a href="/contact">Write to us</a></p>`;
    }
    if (/book|reserv|availability|available|stay|night|date/.test(q)) {
      return `<p>I can point you in the right direction. The booking engine shows live availability for your dates, with a transparent price breakdown before you confirm.</p><p><a href="/booking">Begin a reservation</a> — or tell me your dates and I will suggest a room.</p>`;
    }
    if (/thank|thanks|lovely|great|perfect/.test(q)) {
      return `It is entirely my pleasure. If there is anything else — a table, a treatment, a car — I am here.`;
    }
    return `<p>I am a demonstration concierge, so my answers are prepared rather than generated. I can help with <strong>rooms and rates</strong>, <strong>dining</strong>, <strong>the spa and facilities</strong>, <strong>events</strong>, <strong>offers</strong> and <strong>practical details</strong>.</p><p>For anything specific, our team is on <a href="/contact">the contact page</a> or by telephone, day and night.</p>`;
  }

  async function askConcierge(text) {
    if (!text || conciergeBusy) return;
    conciergeBusy = true;
    addChatMessage('user', escapeHtml(text));
    if (conciergeInput) conciergeInput.value = '';
    const typing = showTyping();
    await loadConciergeData();
    await new Promise((resolve) => setTimeout(resolve, reduceMotion ? 150 : 900));
    if (typing) typing.remove();
    addChatMessage('bot', conciergeReply(text) + '<p class="chat-note">Demo assistant · prepared answers, not a live AI service.</p>');
    conciergeBusy = false;
  }

  on(conciergeForm, 'submit', (event) => {
    event.preventDefault();
    askConcierge(conciergeInput ? conciergeInput.value.trim() : '');
  });

  $$('#conciergeSuggestions button').forEach((button) => {
    on(button, 'click', () => askConcierge(button.textContent.trim()));
  });

  on($('#conciergeReset'), 'click', () => {
    if (!conciergeMessages) return;
    conciergeMessages.innerHTML = `<div class="chat-message bot"><div class="chat-avatar">A</div><div class="chat-bubble"><p>Good evening. I am Aurelia, your digital concierge. I can help with rooms, dining, facilities, spa rituals and reservations.</p><p class="chat-note">This is a demo assistant with carefully prepared answers.</p></div></div>`;
    toast('The conversation has been reset.', 'success');
  });

  /* ---------------------------------------------------------
     Cursor (fine pointers only)
     --------------------------------------------------------- */
  const cursor = $('#cursorDot');
  if (cursor && window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
    document.body.classList.add('has-cursor');
    let cursorX = -100;
    let cursorY = -100;
    let raf = null;
    document.addEventListener('mousemove', (event) => {
      cursorX = event.clientX;
      cursorY = event.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
          raf = null;
        });
      }
    });
    $$('a, button, [data-lightbox-group], input, select, textarea').forEach((element) => {
      element.addEventListener('mouseenter', () => { cursor.style.width = '16px'; cursor.style.height = '16px'; cursor.style.opacity = '.55'; });
      element.addEventListener('mouseleave', () => { cursor.style.width = '6px'; cursor.style.height = '6px'; cursor.style.opacity = ''; });
    });
  }

  /* ---------------------------------------------------------
     Ending: re-run icons after dynamic content
     --------------------------------------------------------- */
  window.addEventListener('load', () => setTimeout(refreshIcons, 80));
})();
