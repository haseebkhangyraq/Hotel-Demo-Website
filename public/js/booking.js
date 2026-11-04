/* =========================================================
   GRAND AURELIA — RESERVATION ENGINE
   Client-side availability, live pricing and demo checkout.
   ========================================================= */
(function () {
  'use strict';

  const dataNode = document.getElementById('bookingData');
  const form = document.getElementById('bookingForm');
  if (!dataNode || !form) return;

  let payload;
  try {
    payload = JSON.parse(dataNode.textContent || '{}');
  } catch (error) {
    console.error('Unable to read booking data', error);
    return;
  }

  const $ = (selector, scope) => (scope || document).querySelector(selector);
  const $$ = (selector, scope) => Array.from((scope || document).querySelectorAll(selector));
  const on = (element, event, handler) => { if (element) element.addEventListener(event, handler); };

  const roomsList = $('#bookingRoomsList');
  const roomCountLabel = $('#roomCountLabel');
  const roomDatesLabel = $('#roomDatesLabel');
  const stayNights = $('#stayNights');
  const bookingError = $('#bookingError');
  const submitButton = $('#bookingSubmit');
  const promoInput = $('#promoCode');
  const promoMessage = $('#promoMessage');
  const applyPromoButton = $('#applyPromo');
  const cardFields = $('#cardFields');

  const state = {
    promo: (payload.promos && document.querySelector('input[name="promoCode"]'))
      ? String(new URLSearchParams(window.location.search).get('promo') || '').trim().toUpperCase()
      : '',
    quote: null,
    category: null,
    availabilityToken: 0,
    quoteToken: 0,
    submitting: false,
    renderedSlug: payload.selectedSlug || ''
  };

  if (promoInput && state.promo) promoInput.value = state.promo;

  /* ---------------------------------------------------------
     Helpers
     --------------------------------------------------------- */
  function money(value) {
    return 'PKR ' + Math.round(Number(value) || 0).toLocaleString('en-PK');
  }

  function parseDate(value) {
    if (!value) return null;
    const parts = String(value).split('-').map(Number);
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function addDays(date, amount) {
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    next.setDate(next.getDate() + amount);
    return next;
  }

  function shortDate(value) {
    const date = parseDate(value);
    if (!date) return '—';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function longDate(value) {
    const date = parseDate(value);
    if (!date) return '—';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function nightsBetween(checkIn, checkOut) {
    const a = parseDate(checkIn);
    const b = parseDate(checkOut);
    if (!a || !b) return 0;
    return Math.max(0, Math.round((b - a) / 86400000));
  }

  function value(name) {
    const field = form.elements[name];
    if (!field) return '';
    if (field instanceof RadioNodeList || (field.length && !field.tagName)) {
      const checked = form.querySelector(`[name="${name}"]:checked`);
      return checked ? checked.value : '';
    }
    return field.value;
  }

  function checkedValues(name) {
    return $$(`input[name="${name}"]:checked`, form).map((input) => input.value);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || min));
  }

  function fieldWrap(name) {
    const input = form.querySelector(`[name="${name}"]`);
    return input ? input.closest('.field') : null;
  }

  function clearErrors() {
    $$('.field.has-error', form).forEach((field) => field.classList.remove('has-error'));
    $$('.field-error', form).forEach((node) => { node.textContent = ''; });
    if (bookingError) { bookingError.textContent = ''; bookingError.classList.remove('is-visible'); }
    const termsError = form.querySelector('[data-error-for="terms"]');
    if (termsError) termsError.textContent = '';
  }

  function setError(name, message) {
    const field = fieldWrap(name);
    if (field) {
      field.classList.add('has-error');
      const error = field.querySelector('.field-error');
      if (error) error.textContent = message;
      return true;
    }
    if (name === 'terms') {
      const termsError = form.querySelector('[data-error-for="terms"]');
      if (termsError) termsError.textContent = message;
      return true;
    }
    showFormError(message);
    return false;
  }

  function showFormError(message) {
    if (!bookingError) return;
    bookingError.textContent = message;
    bookingError.classList.add('is-visible');
    bookingError.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function setLoading(element, loading, message) {
    if (!element) return;
    if (loading) {
      element.dataset.previousHtml = element.innerHTML;
      element.innerHTML = `<div class="booking-loading"><span class="dots"><i></i><i></i><i></i></span>${message || 'Checking availability…'}</div>`;
    } else if (element.dataset.previousHtml) {
      element.innerHTML = element.dataset.previousHtml;
      delete element.dataset.previousHtml;
    }
  }

  function toast(message, type) {
    if (window.Aurelia && typeof window.Aurelia.toast === 'function') {
      window.Aurelia.toast(message, type);
    }
  }

  /* ---------------------------------------------------------
     Dates & party size
     --------------------------------------------------------- */
  function syncDateLimits() {
    const checkInInput = $('#bookingCheckin');
    const checkOutInput = $('#bookingCheckout');
    if (!checkInInput || !checkOutInput) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minimum = formatISO(today);
    checkInInput.min = minimum;

    const checkIn = parseDate(checkInInput.value) || today;
    const nextDay = formatISO(addDays(checkIn, 1));
    checkOutInput.min = nextDay;

    if (!checkOutInput.value || checkOutInput.value <= checkInInput.value) {
      checkOutInput.value = nextDay;
    }
  }

  function dateErrors() {
    const checkIn = value('checkIn');
    const checkOut = value('checkOut');
    const nights = nightsBetween(checkIn, checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let valid = true;

    if (!checkIn) {
      setError('checkIn', 'Please choose an arrival date.');
      valid = false;
    } else if (parseDate(checkIn) < today) {
      setError('checkIn', 'Arrival cannot be in the past.');
      valid = false;
    }

    if (!checkOut) {
      setError('checkOut', 'Please choose a departure date.');
      valid = false;
    } else if (nights <= 0) {
      setError('checkOut', 'Departure must be after arrival.');
      valid = false;
    } else if (nights > 30) {
      setError('checkOut', 'For stays over 30 nights, please contact reservations.');
      valid = false;
    }

    return valid;
  }

  /* ---------------------------------------------------------
     Room availability
     --------------------------------------------------------- */
  function roomOption(category, selectedSlug, roomsCount) {
    const available = Number(category.availableRooms) || 0;
    const isUnavailable = !category.isAvailable || available < roomsCount;
    const label = document.createElement('label');
    label.className = 'booking-room-option' + (isUnavailable ? ' is-unavailable' : '') + (category.slug === selectedSlug ? ' is-selected' : '');
    label.setAttribute('data-room-option', '');
    label.setAttribute('data-slug', category.slug);
    label.setAttribute('data-price', category.price);
    label.setAttribute('data-name', category.name);
    label.setAttribute('data-image', category.coverImage);
    label.setAttribute('data-available', available);

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'categorySlug';
    input.value = category.slug;
    input.checked = category.slug === selectedSlug;
    input.disabled = isUnavailable;
    label.appendChild(input);

    const image = document.createElement('img');
    image.src = category.coverImage;
    image.alt = category.name;
    image.loading = 'lazy';
    label.appendChild(image);

    const copy = document.createElement('div');
    const title = document.createElement('h4');
    title.textContent = category.name;
    copy.appendChild(title);
    const tagline = document.createElement('p');
    tagline.textContent = category.tagline || '';
    copy.appendChild(tagline);

    const meta = document.createElement('div');
    meta.className = 'room-option-meta';
    [category.size + ' m²', category.bed, `Up to ${category.maxAdults + category.maxChildren} guests`].forEach((text) => {
      const span = document.createElement('span');
      span.textContent = text;
      meta.appendChild(span);
    });
    copy.appendChild(meta);
    label.appendChild(copy);

    const price = document.createElement('div');
    price.className = 'room-option-price';
    const strong = document.createElement('strong');
    strong.textContent = money(category.price);
    price.appendChild(strong);
    const small = document.createElement('small');
    small.textContent = 'per night';
    price.appendChild(small);
    const count = document.createElement('span');
    count.className = 'avail-count';
    count.textContent = available ? `${available} room${available === 1 ? '' : 's'} left` : 'Fully booked';
    price.appendChild(count);
    label.appendChild(price);

    return label;
  }

  function renderRooms(categories) {
    if (!roomsList) return;
    const roomsCount = clamp(value('rooms'), 1, 4);
    const previousSlug = state.renderedSlug || value('categorySlug');
    const available = categories.filter((cat) => cat.isAvailable && Number(cat.availableRooms) >= roomsCount);
    let selectedSlug = categories.some((cat) => cat.slug === previousSlug && cat.isAvailable && Number(cat.availableRooms) >= roomsCount)
      ? previousSlug
      : (available[0] ? available[0].slug : '');

    roomsList.innerHTML = '';
    categories.forEach((category) => {
      roomsList.appendChild(roomOption(category, selectedSlug, roomsCount));
    });

    state.renderedSlug = selectedSlug;
    if (roomCountLabel) roomCountLabel.textContent = `${available.length} available`;

    if (!available.length) {
      const empty = document.createElement('div');
      empty.className = 'booking-empty';
      empty.textContent = 'No rooms are available for these dates and party size. Please adjust your stay or speak with reservations.';
      roomsList.appendChild(empty);
    }

    if (selectedSlug) {
      refreshQuote();
    } else {
      renderEmptySummary();
    }
  }

  async function refreshAvailability() {
    if (!dateErrors()) {
      renderEmptySummary();
      return;
    }

    const token = ++state.availabilityToken;
    const checkIn = value('checkIn');
    const checkOut = value('checkOut');
    const adults = clamp(value('adults'), 1, 6);
    const children = clamp(value('children'), 0, 4);
    const rooms = clamp(value('rooms'), 1, 4);

    if (roomDatesLabel) roomDatesLabel.textContent = `${shortDate(checkIn)} – ${shortDate(checkOut)}`;
    if (stayNights) stayNights.textContent = nightsBetween(checkIn, checkOut);

    setLoading(roomsList, true, 'Checking live availability…');

    try {
      const params = new URLSearchParams({
        checkin: checkIn,
        checkout: checkOut,
        adults,
        children,
        rooms
      });
      const response = await fetch(`/api/availability?${params.toString()}`, {
        headers: { Accept: 'application/json' }
      });
      const result = await response.json().catch(() => ({}));
      if (token !== state.availabilityToken) return;
      if (!response.ok) throw new Error(result.error || 'Unable to check availability.');
      renderRooms(result.categories || []);
    } catch (error) {
      if (token !== state.availabilityToken) return;
      roomsList.innerHTML = '';
      const failure = document.createElement('div');
      failure.className = 'booking-empty';
      failure.textContent = error.message || 'We could not check availability. Please try again.';
      roomsList.appendChild(failure);
      renderEmptySummary();
      toast(error.message || 'Unable to check availability.', 'error');
    }
  }

  /* ---------------------------------------------------------
     Live pricing
     --------------------------------------------------------- */
  function currentCategory() {
    const slug = value('categorySlug');
    if (!slug) return null;
    return (payload.categories || []).find((cat) => cat.slug === slug) || null;
  }

  function renderSummaryRoom(category) {
    const container = $('#summaryRoom');
    if (!container) return;
    if (!category) {
      container.innerHTML = '<div><h4>Select a room</h4><p>Choose from the list to see live pricing.</p></div>';
      return;
    }
    container.innerHTML = '';
    const image = document.createElement('img');
    image.src = category.coverImage;
    image.alt = category.name;
    container.appendChild(image);
    const copy = document.createElement('div');
    const title = document.createElement('h4');
    title.textContent = category.name;
    copy.appendChild(title);
    const meta = document.createElement('p');
    meta.innerHTML = `${category.size} m² · ${escapeValue(category.bed)}<br>${escapeValue(category.view)}`;
    copy.appendChild(meta);
    container.appendChild(copy);
  }

  function escapeValue(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function summaryLine(label, amount, className) {
    return `<div class="summary-line${className ? ' ' + className : ''}"><span>${label}</span><span>${amount}</span></div>`;
  }

  function renderSummary(quote, category) {
    state.quote = quote;
    state.category = category;

    const summaryCheckin = $('#summaryCheckin');
    const summaryCheckout = $('#summaryCheckout');
    const summaryGuests = $('#summaryGuests');
    const summaryNights = $('#summaryNights');
    const summaryLines = $('#summaryLines');
    const summaryTotal = $('#summaryTotal');
    const summaryStatus = $('#summaryStatus');

    const adults = clamp(value('adults'), 1, 6);
    const children = clamp(value('children'), 0, 4);

    if (summaryCheckin) summaryCheckin.textContent = shortDate(value('checkIn'));
    if (summaryCheckout) summaryCheckout.textContent = shortDate(value('checkOut'));
    if (summaryGuests) {
      summaryGuests.textContent = `${adults} adult${adults === 1 ? '' : 's'}${children ? `, ${children} child${children === 1 ? '' : 'ren'}` : ''}`;
    }
    if (summaryNights) summaryNights.textContent = quote.nights;
    if (stayNights) stayNights.textContent = quote.nights;

    renderSummaryRoom(category);

    if (summaryLines) {
      let html = summaryLine(`Room (${quote.nights} night${quote.nights === 1 ? '' : 's'})`, money(quote.roomTotal));
      if (quote.extraGuestTotal > 0) html += summaryLine('Extra guests', money(quote.extraGuestTotal));
      if (quote.breakfastTotal > 0) html += summaryLine('Dining plan', money(quote.breakfastTotal));
      if (quote.servicesTotal > 0) html += summaryLine('Extras &amp; transfer', money(quote.servicesTotal));
      if (quote.discountTotal > 0) html += summaryLine('Promotional discount', `− ${money(quote.discountTotal)}`, 'discount');
      html += summaryLine('Service charge', money(quote.serviceCharge));
      html += summaryLine('GST', money(quote.taxTotal));
      html += summaryLine('Total', money(quote.total), 'total');
      summaryLines.innerHTML = html;
    }

    if (summaryTotal) summaryTotal.textContent = money(quote.total);
    if (summaryStatus) {
      summaryStatus.textContent = quote.promo
        ? `${quote.promo.code} applied · live pricing`
        : 'Live pricing · updated as you choose';
    }
  }

  function renderEmptySummary() {
    const summaryLines = $('#summaryLines');
    const summaryTotal = $('#summaryTotal');
    const summaryNights = $('#summaryNights');
    if (summaryLines) summaryLines.innerHTML = '<div class="summary-line"><span>Select a room to see pricing</span><span>—</span></div>';
    if (summaryTotal) summaryTotal.textContent = '—';
    if (summaryNights) summaryNights.textContent = nightsBetween(value('checkIn'), value('checkOut'));
  }

  async function refreshQuote() {
    const category = currentCategory();
    if (!category) {
      renderEmptySummary();
      renderSummaryRoom(null);
      return;
    }
    if (!dateErrors()) return;

    const token = ++state.quoteToken;
    const quotePayload = {
      categorySlug: category.slug,
      checkIn: value('checkIn'),
      checkOut: value('checkOut'),
      adults: clamp(value('adults'), 1, 6),
      children: clamp(value('children'), 0, 4),
      rooms: clamp(value('rooms'), 1, 4),
      breakfastPlan: value('breakfastPlan') || 'none',
      transfer: value('transfer') || 'none',
      services: checkedValues('services'),
      promoCode: state.promo
    };

    if (promoMessage && !state.promo && !state.promoError) {
      promoMessage.style.color = '';
      promoMessage.textContent = 'Try WEEKEND10 or AURELIA10.';
    }

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(quotePayload)
      });
      const result = await response.json().catch(() => ({}));
      if (token !== state.quoteToken) return;
      if (!response.ok || !result.quote) throw new Error(result.error || result.message || 'Unable to calculate pricing.');

      const quote = result.quote;
      const promoError = (quote.errors || []).find((message) => /promotional code|minimum stay|suite stays/i.test(message));
      if (promoError && state.promo) {
        state.promo = '';
        state.promoError = promoError;
        if (promoInput) promoInput.value = '';
        if (promoMessage) {
          promoMessage.textContent = promoError;
          promoMessage.style.color = '#E0A797';
        }
        renderSummary(quote, category);
        return;
      }

      if (state.promo && promoMessage) {
        promoMessage.style.color = '';
        promoMessage.textContent = `Code ${state.promo} applied — ${quote.promo ? quote.promo.label : 'discount applied'}.`;
      }

      renderSummary(quote, category);
    } catch (error) {
      if (token !== state.quoteToken) return;
      renderEmptySummary();
    }
  }

  function applyPromo() {
    if (!promoInput) return;
    const code = String(promoInput.value || '').trim().toUpperCase();
    state.promo = code;
    state.promoError = '';
    if (promoInput) promoInput.value = code;
    if (!code) {
      if (promoMessage) {
        promoMessage.style.color = '';
        promoMessage.textContent = 'Enter a code to see your saving.';
      }
      refreshQuote();
      return;
    }
    if (!dateErrors()) return;
    if (!value('categorySlug')) {
      if (promoMessage) {
        promoMessage.style.color = '';
        promoMessage.textContent = 'Choose a room first, then apply your code.';
      }
      return;
    }
    refreshQuote();
  }

  /* ---------------------------------------------------------
     Visual state
     --------------------------------------------------------- */
  function syncOptionCards() {
    $$('.breakfast-option', form).forEach((label) => {
      const input = label.querySelector('input');
      label.classList.toggle('is-selected', Boolean(input && input.checked));
    });
    $$('[data-check-card]', form).forEach((label) => {
      const input = label.querySelector('input');
      label.classList.toggle('is-selected', Boolean(input && input.checked));
    });
    $$('[data-payment-option]', form).forEach((label) => {
      const input = label.querySelector('input');
      label.classList.toggle('is-selected', Boolean(input && input.checked));
    });
    $$('.booking-room-option', form).forEach((label) => {
      const input = label.querySelector('input');
      const selected = Boolean(input && input.checked);
      label.classList.toggle('is-selected', selected);
      if (input) state.renderedSlug = selected ? input.value : state.renderedSlug;
    });
  }

  function syncPayment() {
    const method = value('paymentMethod');
    const isCard = method === 'demo_card';
    if (cardFields) cardFields.classList.toggle('is-visible', isCard);
    ['cardNumber', 'cardExpiry', 'cardCvc'].forEach((name) => {
      const field = form.elements[name];
      if (!field) return;
      field.required = isCard;
      if (!isCard) {
        const wrap = field.closest('.field');
        if (wrap) {
          wrap.classList.remove('has-error');
          const error = wrap.querySelector('.field-error');
          if (error) error.textContent = '';
        }
      }
    });
  }

  function syncRoomsSelection() {
    state.renderedSlug = value('categorySlug') || state.renderedSlug;
    syncOptionCards();
    refreshQuote();
  }

  /* ---------------------------------------------------------
     Step indicator
     --------------------------------------------------------- */
  function initSteps() {
    const steps = $$('.booking-hero-step');
    const cards = $$('.booking-step-card');
    if (!steps.length || !cards.length) return;

    const setActive = (index) => {
      steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = cards.indexOf(entry.target);
            if (index >= 0) setActive(index);
          }
        });
      }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });
      cards.forEach((card) => observer.observe(card));
    }

    on(form, 'focusin', (event) => {
      const card = event.target.closest('.booking-step-card');
      if (!card) return;
      const index = cards.indexOf(card);
      if (index >= 0) setActive(index);
    });
  }

  /* ---------------------------------------------------------
     Formatting for payment fields
     --------------------------------------------------------- */
  function initCardFormatting() {
    const cardNumber = $('#cardNumber');
    const cardExpiry = $('#cardExpiry');
    const cardCvc = $('#cardCvc');

    on(cardNumber, 'input', () => {
      const digits = cardNumber.value.replace(/\D/g, '').slice(0, 16);
      cardNumber.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    });

    on(cardExpiry, 'input', () => {
      const digits = cardExpiry.value.replace(/\D/g, '').slice(0, 4);
      cardExpiry.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    });

    on(cardCvc, 'input', () => {
      cardCvc.value = cardCvc.value.replace(/\D/g, '').slice(0, 4);
    });
  }

  /* ---------------------------------------------------------
     Submit
     --------------------------------------------------------- */
  function validateGuestDetails() {
    let valid = true;
    const firstName = String(value('firstName')).trim();
    const lastName = String(value('lastName')).trim();
    const email = String(value('email')).trim();
    const phone = String(value('phone')).trim();
    const nationality = String(value('nationality')).trim();

    if (firstName.length < 2) { setError('firstName', 'Please enter your first name.'); valid = false; }
    if (lastName.length < 2) { setError('lastName', 'Please enter your last name.'); valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('email', 'Please enter a valid email address.'); valid = false; }
    if (phone.replace(/\D/g, '').length < 7) { setError('phone', 'Please enter a valid phone number.'); valid = false; }
    if (nationality.length < 2) { setError('nationality', 'Please enter your nationality.'); valid = false; }

    return valid;
  }

  function validateCard() {
    if (value('paymentMethod') !== 'demo_card') return true;
    let valid = true;
    const digits = String(value('cardNumber')).replace(/\s/g, '');
    if (!/^\d{16}$/.test(digits)) { setError('cardNumber', 'Enter the 16-digit demo card number.'); valid = false; }
    if (!/^\d{2}\s?\/\s?\d{2}$/.test(String(value('cardExpiry')))) {
      setError('cardExpiry', 'Use MM/YY format.');
      valid = false;
    } else {
      const [month, year] = String(value('cardExpiry')).split('/').map((part) => Number(part.trim()));
      const now = new Date();
      const expiry = new Date(2000 + year, month, 0, 23, 59, 59);
      if (month < 1 || month > 12 || expiry < now) {
        setError('cardExpiry', 'Please use a future expiry date.');
        valid = false;
      }
    }
    if (!/^\d{3,4}$/.test(String(value('cardCvc')))) { setError('cardCvc', 'Enter the 3 or 4 digit CVV.'); valid = false; }
    return valid;
  }

  function bookingPayload() {
    return {
      checkIn: value('checkIn'),
      checkOut: value('checkOut'),
      adults: clamp(value('adults'), 1, 6),
      children: clamp(value('children'), 0, 4),
      rooms: clamp(value('rooms'), 1, 4),
      categorySlug: value('categorySlug'),
      breakfastPlan: value('breakfastPlan') || 'none',
      transfer: value('transfer') || 'none',
      services: checkedValues('services'),
      promoCode: state.promo,
      firstName: String(value('firstName')).trim(),
      lastName: String(value('lastName')).trim(),
      email: String(value('email')).trim(),
      phone: String(value('phone')).trim(),
      nationality: String(value('nationality')).trim(),
      specialRequests: String(value('specialRequests')).trim(),
      paymentMethod: value('paymentMethod'),
      cardNumber: String(value('cardNumber')).replace(/\s/g, ''),
      cardExpiry: String(value('cardExpiry')),
      cardCvc: String(value('cardCvc'))
    };
  }

  async function submitBooking(event) {
    event.preventDefault();
    if (state.submitting) return;

    clearErrors();
    let valid = dateErrors();
    if (!value('categorySlug')) {
      showFormError('Please choose a room or suite before confirming.');
      valid = false;
    }
    if (!validateGuestDetails()) valid = false;
    if (!validateCard()) valid = false;

    const terms = $('#bookingTerms');
    if (terms && !terms.checked) {
      setError('terms', 'Please agree to the booking terms and privacy policy.');
      valid = false;
    }

    if (!valid) {
      const firstError = $('.field.has-error', form);
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    state.submitting = true;
    const label = $('.btn-label', submitButton);
    const originalLabel = label ? label.textContent : submitButton.innerHTML;
    submitButton.disabled = true;
    if (label) label.textContent = 'Confirming…';
    else submitButton.innerHTML = 'Confirming…';

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(bookingPayload())
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.ok === false) {
        const errors = result.errors || {};
        const keys = Object.keys(errors);
        if (keys.length) {
          keys.forEach((key) => {
            if (['category', 'paymentMethod', 'terms', 'checkIn', 'checkOut'].includes(key)) {
              if (key === 'checkIn' || key === 'checkOut') setError(key, errors[key]);
              else showFormError(errors[key]);
            } else if (['firstName', 'lastName', 'email', 'phone', 'nationality', 'cardNumber', 'cardExpiry', 'cardCvc'].includes(key)) {
              setError(key, errors[key]);
            } else {
              showFormError(errors[key]);
            }
          });
        } else {
          showFormError(result.message || 'We could not confirm your reservation. Please try again.');
        }

        if (response.status === 409) {
          toast(result.message || 'Those rooms are no longer available.', 'error');
          refreshAvailability();
        } else {
          toast(result.message || 'Please check the highlighted fields.', 'error');
        }
        return;
      }

      if (result.redirect) {
        state.quote = result.quote || state.quote;
        const summaryStatus = $('#summaryStatus');
        if (summaryStatus) summaryStatus.textContent = 'Reservation confirmed · taking you to your confirmation…';
        window.location.href = result.redirect;
        return;
      }

      showFormError('Your reservation was created, but we could not open the confirmation. Please contact reservations with your reference.');
    } catch (error) {
      showFormError(error.message || 'Something went wrong while confirming your booking. Please try again.');
      toast('We could not reach the reservations service. Please try again.', 'error');
    } finally {
      state.submitting = false;
      submitButton.disabled = false;
      if (label) label.textContent = originalLabel;
      else submitButton.innerHTML = originalLabel;
      if (window.Aurelia && window.Aurelia.refreshIcons) window.Aurelia.refreshIcons();
    }
  }

  /* ---------------------------------------------------------
     Debounce helper
     --------------------------------------------------------- */
  function debounce(fn, wait) {
    let timer;
    return function debounced(...args) {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn.apply(this, args), wait);
    };
  }

  const debouncedAvailability = debounce(refreshAvailability, 320);
  const debouncedQuote = debounce(refreshQuote, 260);

  /* ---------------------------------------------------------
     Events
     --------------------------------------------------------- */
  syncDateLimits();
  syncOptionCards();
  syncPayment();
  initCardFormatting();
  initSteps();

  on(form, 'change', (event) => {
    const target = event.target;
    if (!target || !target.name) return;
    syncOptionCards();

    if (['checkIn', 'checkOut', 'adults', 'children', 'rooms'].includes(target.name)) {
      if (target.name === 'checkIn') syncDateLimits();
      debouncedAvailability();
      debouncedQuote();
      return;
    }

    if (target.name === 'categorySlug') {
      syncRoomsSelection();
      return;
    }

    if (target.name === 'paymentMethod') {
      syncPayment();
      return;
    }

    if (['breakfastPlan', 'transfer', 'services'].includes(target.name)) {
      debouncedQuote();
    }
  });

  on(form, 'input', (event) => {
    const target = event.target;
    if (!target) return;
    if (['checkIn', 'checkOut', 'adults', 'children', 'rooms'].includes(target.name)) {
      debouncedQuote();
    }
  });

  on(roomsList, 'change', (event) => {
    if (event.target && event.target.name === 'categorySlug') {
      syncRoomsSelection();
    }
  });

  on(applyPromoButton, 'click', applyPromo);
  on(promoInput, 'keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyPromo();
    }
  });

  on(form, 'submit', submitBooking);

  on(window, 'pageshow', (event) => {
    if (event.persisted) {
      state.submitting = false;
      submitButton.disabled = false;
    }
  });

  // Initial sync with the server-rendered state.
  refreshAvailability();
})();
