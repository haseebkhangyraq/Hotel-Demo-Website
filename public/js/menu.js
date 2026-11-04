/* =========================================================
   GRAND AURELIA — DINING MENU
   Filtering, searching and the dish detail modal.
   ========================================================= */
(function () {
  'use strict';

  const grid = document.getElementById('menuGrid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('[data-menu-card]'));
  const filterButtons = Array.from(document.querySelectorAll('[data-menu-filter]'));
  const searchInput = document.getElementById('menuSearch');
  const countNode = document.getElementById('menuCount');
  const categoryLabel = document.getElementById('menuCategoryLabel');
  const emptyState = document.getElementById('menuEmpty');
  const resetButton = document.querySelector('[data-menu-reset]');

  const modal = document.getElementById('menuModal');
  const modalTitle = document.getElementById('menuModalTitle');
  const modalCategory = document.getElementById('menuModalCategory');
  const modalDescription = document.getElementById('menuModalDescription');
  const modalPrice = document.getElementById('menuModalPrice');
  const modalDiet = document.getElementById('menuModalDiet');
  const modalImage = document.getElementById('menuModalImage');
  const modalService = document.getElementById('menuModalService');

  let activeCategory = 'all';
  let activeSearch = '';
  let lastFocused = null;

  const normalise = (text) => String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  function cardMatches(card) {
    const category = card.getAttribute('data-category') || '';
    if (activeCategory !== 'all' && category !== activeCategory) return false;
    if (!activeSearch) return true;
    const haystack = normalise([
      card.getAttribute('data-name'),
      card.getAttribute('data-category'),
      card.getAttribute('data-description'),
      (card.getAttribute('data-dietary') || '').replace(/\|/g, ' ')
    ].join(' '));
    return activeSearch.split(' ').every((term) => haystack.includes(term));
  }

  function applyFilters() {
    let visible = 0;
    cards.forEach((card) => {
      const show = cardMatches(card);
      card.hidden = !show;
      card.setAttribute('aria-hidden', show ? 'false' : 'true');
      if (show) visible += 1;
    });

    if (countNode) countNode.textContent = visible;
    if (categoryLabel) {
      categoryLabel.textContent = activeCategory === 'all'
        ? (activeSearch ? 'matching your search' : 'the full menu')
        : activeCategory;
    }
    if (emptyState) emptyState.hidden = visible !== 0;

    filterButtons.forEach((button) => {
      const selected = button.getAttribute('data-menu-filter') === activeCategory;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.getAttribute('data-menu-filter') || 'all';
      applyFilters();
    });
  });

  if (searchInput) {
    let timer;
    searchInput.addEventListener('input', () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        activeSearch = normalise(searchInput.value);
        applyFilters();
      }, 120);
    });

    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        searchInput.value = '';
        activeSearch = '';
        applyFilters();
      }
    });
  }

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      activeCategory = 'all';
      activeSearch = '';
      if (searchInput) searchInput.value = '';
      applyFilters();
    });
  }

  /* ---------------------------------------------------------
     Dish detail modal
     --------------------------------------------------------- */
  function openModal(card) {
    if (!modal) return;
    lastFocused = document.activeElement;

    const name = card.getAttribute('data-name') || 'Dish';
    const category = card.getAttribute('data-category') || 'From the kitchen';
    const description = card.getAttribute('data-description') || '';
    const price = card.getAttribute('data-price') || '';
    const image = card.getAttribute('data-image') || '';
    const dietary = (card.getAttribute('data-dietary') || '').split('|').filter(Boolean);
    const roomService = card.getAttribute('data-room-service') === 'true';

    if (modalTitle) modalTitle.textContent = name;
    if (modalCategory) modalCategory.textContent = category;
    if (modalDescription) modalDescription.textContent = description;
    if (modalPrice) modalPrice.textContent = price;
    if (modalImage) {
      modalImage.src = image;
      modalImage.alt = name;
    }

    if (modalDiet) {
      modalDiet.innerHTML = '';
      dietary.forEach((label) => {
        const pill = document.createElement('span');
        pill.textContent = label;
        modalDiet.appendChild(pill);
      });
    }

    if (modalService) {
      modalService.textContent = roomService
        ? 'Available for in-room dining, 24 hours · dial 0'
        : 'Available in our dining rooms · ask your server';
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');

    const closeButton = modal.querySelector('.modal-close');
    if (closeButton) closeButton.focus({ preventScroll: true });
    if (window.Aurelia && window.Aurelia.refreshIcons) window.Aurelia.refreshIcons();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus({ preventScroll: true });
    }
  }

  grid.addEventListener('click', (event) => {
    const card = event.target.closest('[data-menu-card]');
    if (card) openModal(card);
  });

  grid.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('[data-menu-card]');
    if (!card) return;
    event.preventDefault();
    openModal(card);
  });

  if (modal) {
    modal.querySelectorAll('[data-menu-close]').forEach((node) => {
      node.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }

  applyFilters();
})();
