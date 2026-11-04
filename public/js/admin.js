/* =========================================================
   GRAND AURELIA — ADMIN INTERACTIONS
   ========================================================= */
(function () {
  'use strict';

  const $ = (selector, scope) => (scope || document).querySelector(selector);
  const $$ = (selector, scope) => Array.from((scope || document).querySelectorAll(selector));
  const on = (element, event, handler) => { if (element) element.addEventListener(event, handler); };

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ nameAttr: 'data-lucide', attrs: { class: 'lucide' } });
    }
  }

  /* ---------------------------------------------------------
     Off-canvas sidebar
     --------------------------------------------------------- */
  const sidebar = $('#adminSidebar');
  const overlay = $('#adminOverlay');
  const menuToggle = $('#adminMenuToggle');

  function setSidebar(open) {
    if (!sidebar) return;
    sidebar.classList.toggle('is-open', open);
    document.body.classList.toggle('admin-nav-open', open);
    if (overlay) {
      overlay.classList.toggle('is-visible', open);
      overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    }
    if (menuToggle) menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  on(menuToggle, 'click', () => setSidebar(!sidebar.classList.contains('is-open')));
  on(overlay, 'click', () => setSidebar(false));

  $$('.admin-nav a, .admin-sidebar-foot a').forEach((link) => {
    on(link, 'click', () => {
      if (window.matchMedia('(max-width: 1024px)').matches) setSidebar(false);
    });
  });

  on(document, 'keydown', (event) => {
    if (event.key === 'Escape') setSidebar(false);
  });

  /* ---------------------------------------------------------
     Flash messages
     --------------------------------------------------------- */
  $$('[data-dismiss-flash]').forEach((button) => {
    on(button, 'click', () => {
      const flash = button.closest('.admin-flash');
      if (!flash) return;
      flash.style.transition = 'opacity .25s ease, transform .25s ease';
      flash.style.opacity = '0';
      flash.style.transform = 'translateY(-4px)';
      window.setTimeout(() => flash.remove(), 260);
    });
  });

  window.setTimeout(() => {
    $$('.admin-flash').forEach((flash) => {
      flash.style.transition = 'opacity .5s ease, transform .5s ease';
      flash.style.opacity = '0';
      flash.style.transform = 'translateY(-4px)';
      window.setTimeout(() => flash.remove(), 520);
    });
  }, 7000);

  /* ---------------------------------------------------------
     Confirmations for destructive actions
     --------------------------------------------------------- */
  $$('form[data-confirm]').forEach((form) => {
    on(form, 'submit', (event) => {
      const message = form.getAttribute('data-confirm') || 'Are you sure you want to continue?';
      if (!window.confirm(message)) {
        event.preventDefault();
      }
    });
  });

  /* ---------------------------------------------------------
     Auto-submit selects (room status, enquiry status)
     --------------------------------------------------------- */
  $$('[data-auto-submit]').forEach((select) => {
    on(select, 'change', () => {
      const form = select.closest('form');
      if (!form) return;
      if (typeof form.requestSubmit === 'function') form.requestSubmit();
      else form.submit();
    });
  });

  /* ---------------------------------------------------------
     Password visibility
     --------------------------------------------------------- */
  const passwordToggle = $('#passwordToggle');
  on(passwordToggle, 'click', () => {
    const input = $('#loginPassword');
    if (!input) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    passwordToggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    passwordToggle.innerHTML = `<i data-lucide="${show ? 'eye-off' : 'eye'}"></i>`;
    refreshIcons();
  });

  /* ---------------------------------------------------------
     Small niceties
     --------------------------------------------------------- */
  // Keep the admin sidebar clear of the mobile keyboard when focus leaves.
  on(window, 'resize', () => {
    if (window.innerWidth > 1024) setSidebar(false);
  });

  // Prevent double submits on forms that change data.
  $$('form').forEach((form) => {
    on(form, 'submit', (event) => {
      if (event.defaultPrevented) return;
      const button = form.querySelector('button[type="submit"]');
      if (button && !button.disabled) {
        window.setTimeout(() => { button.disabled = true; }, 0);
        window.setTimeout(() => { button.disabled = false; }, 5000);
      }
    });
  });

  refreshIcons();
})();
