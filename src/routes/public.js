import express from 'express';
import {
  getCategories, getCategoryBySlug, availability, featuredCategories, getFacilities, getMenuItems,
  getExperiences, getEventSpaces, getOffers, getTestimonials, getGallery, getBookingByReference,
  pickDefaultDates, dateLabel, shortDate
} from '../lib/hotel.js';
import { getSettings as readSettings } from '../db/index.js';
import { calculateQuote, EXTRA_SERVICES, BREAKFAST_PLANS, TRANSFER_OPTIONS, PROMO_CODES, formatPKR, nightsBetween } from '../lib/pricing.js';
import { createBooking } from '../lib/bookings.js';
import { run, get, all } from '../db/index.js';

const router = express.Router();

function queryDates(req) {
  const defaults = pickDefaultDates();
  const checkIn = req.query.checkin || defaults.checkIn;
  const checkOut = req.query.checkout || defaults.checkOut;
  return {
    checkIn,
    checkOut,
    adults: Number(req.query.adults) || 2,
    children: Number(req.query.children) || 0,
    rooms: Number(req.query.rooms) || 1
  };
}

router.get('/', (req, res) => {
  const settings = readSettings();
  const dates = pickDefaultDates();
  const rooms = featuredCategories(6);
  const availabilityData = availability({ ...dates, adults: 2, children: 0, rooms: 1, settings });
  const availMap = Object.fromEntries(availabilityData.map((c) => [c.slug, c.availableRooms]));
  const experiences = getExperiences();
  const facilities = getFacilities();
  const menu = getMenuItems();
  const offers = getOffers();
  const gallery = getGallery();

  res.render('index', {
    page: 'home',
    bodyClass: 'page-home',
    heroImage: '/images/hero-main.jpg',
    rooms: rooms.map((r) => ({ ...r, availableRooms: availMap[r.slug] || 0 })),
    experiences: experiences.filter((e) => e.featured).slice(0, 4),
    facilities,
    menuPreview: menu.filter((m) => m.featured).slice(0, 6),
    offers: offers.slice(0, 3),
    testimonials: getTestimonials(),
    gallery: gallery.slice(0, 8),
    events: getEventSpaces().slice(0, 3),
    dates,
    dateLabel,
    shortDate
  });
});

router.get('/rooms', (req, res) => {
  const settings = readSettings();
  const dates = queryDates(req);
  const requestedSlug = req.query.category || '';
  const maxGuests = Number(req.query.guests) || 0;
  const viewFilter = req.query.view || '';
  const sort = req.query.sort || 'recommended';
  const availabilityData = availability({ ...dates, adults: dates.adults, children: dates.children, rooms: dates.rooms, settings });

  let rooms = availabilityData;
  if (requestedSlug) rooms = rooms.filter((r) => r.slug === requestedSlug);
  if (maxGuests) rooms = rooms.filter((r) => r.max_adults + r.max_children >= maxGuests);
  if (viewFilter) rooms = rooms.filter((r) => r.view.toLowerCase().includes(viewFilter.toLowerCase()));

  if (sort === 'price-asc') rooms = [...rooms].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') rooms = [...rooms].sort((a, b) => b.price - a.price);
  if (sort === 'size') rooms = [...rooms].sort((a, b) => b.size_sqm - a.size_sqm);

  res.render('rooms', {
    page: 'rooms',
    bodyClass: 'page-rooms',
    rooms,
    dates,
    filters: { category: requestedSlug, guests: maxGuests, view: viewFilter, sort },
    categories: getCategories(),
    nights: nightsBetween(dates.checkIn, dates.checkOut),
    dateLabel,
    shortDate
  });
});

router.get('/rooms/:slug', (req, res, next) => {
  const category = getCategoryBySlug(req.params.slug);
  if (!category) return next();
  const settings = readSettings();
  const dates = queryDates(req);
  const avail = availability({ ...dates, adults: 2, children: 0, rooms: 1, settings }).find((c) => c.id === category.id);
  const categories = getCategories().filter((c) => c.id !== category.id);
  const similar = categories
    .map((c) => ({ ...c, distance: Math.abs(c.price - category.price) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);
  const relatedExperiences = getExperiences().filter((e) => e.featured).slice(0, 3);
  const roomNumbers = all('SELECT room_number FROM rooms WHERE category_id = ? ORDER BY room_number', [category.id]);

  res.render('room-detail', {
    page: 'rooms',
    bodyClass: 'page-room-detail',
    category,
    availableRooms: avail?.availableRooms || 0,
    roomNumbers,
    similar,
    experiences: relatedExperiences,
    dates,
    nights: nightsBetween(dates.checkIn, dates.checkOut),
    dateLabel
  });
});

router.get('/booking', (req, res) => {
  const settings = readSettings();
  const dates = queryDates(req);
  const categories = availability({ ...dates, adults: dates.adults, children: dates.children, rooms: dates.rooms, settings });
  const selectedSlug = req.query.room || '';
  const selectedCategory = selectedSlug ? categories.find((c) => c.slug === selectedSlug) : null;
  const offers = getOffers();
  res.render('booking', {
    page: 'booking',
    bodyClass: 'page-booking',
    categories,
    dates,
    selectedSlug,
    selectedCategory,
    extras: EXTRA_SERVICES,
    breakfastPlans: BREAKFAST_PLANS,
    transfers: TRANSFER_OPTIONS,
    promos: PROMO_CODES,
    offers,
    dateLabel
  });
});

router.get('/booking/confirmation/:reference', (req, res, next) => {
  const booking = getBookingByReference(req.params.reference);
  if (!booking) return next();
  res.render('booking-confirmation', {
    page: 'booking',
    bodyClass: 'page-confirmation',
    booking,
    dateLabel,
    services: EXTRA_SERVICES,
    breakfastPlans: BREAKFAST_PLANS,
    transfers: TRANSFER_OPTIONS
  });
});

router.get('/dining', (req, res) => {
  const menu = getMenuItems();
  const categories = [...new Set(menu.map((m) => m.category))];
  res.render('dining', {
    page: 'dining',
    bodyClass: 'page-dining',
    menu,
    categories,
    featured: menu.filter((m) => m.featured)
  });
});

router.get('/dining/menu/download', (req, res) => {
  const menu = getMenuItems();
  const categories = [...new Set(menu.map((m) => m.category))];
  const settings = readSettings();
  const lines = [
    'GRAND AURELIA HOTEL & RESORT',
    'A Culinary Menu',
    '========================================',
    '',
    settings.address + ', ' + settings.city + ', ' + settings.country,
    settings.phone + '  ·  ' + settings.email,
    '',
    'A NOTE FROM OUR KITCHEN',
    'Our menus follow the seasons and the markets. Please speak with your server about allergies or preferences — every dish can be adapted with pleasure.',
    ''
  ];
  for (const cat of categories) {
    lines.push('----------------------------------------');
    lines.push(cat.toUpperCase());
    lines.push('----------------------------------------');
    for (const item of menu.filter((m) => m.category === cat)) {
      lines.push(`${item.name}  ·  ${formatPKR(item.price)}`);
      lines.push(`  ${item.description}`);
      if (item.dietary.length) lines.push(`  ${item.dietary.join(' · ')}`);
      lines.push('');
    }
  }
  lines.push('========================================');
  lines.push('Prices are in Pakistani Rupees and exclusive of applicable taxes.');
  lines.push('Room service is available 24 hours. Dial 0 from your room.');
  lines.push('Grand Aurelia Hotel & Resort · ' + settings.phone);
  const content = lines.join('\r\n');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="grand-aurelia-menu.txt"');
  res.send(content);
});

router.get('/facilities', (req, res) => {
  const facilities = getFacilities();
  const categories = [...new Set(facilities.map((f) => f.category))];
  res.render('facilities', {
    page: 'facilities',
    bodyClass: 'page-facilities',
    facilities,
    categories,
    services: [
      { name: '24-hour reception', icon: 'concierge-bell' },
      { name: 'Concierge', icon: 'bell-ring' },
      { name: 'Airport transfers', icon: 'plane' },
      { name: 'Valet parking', icon: 'car-front' },
      { name: 'Laundry & pressing', icon: 'shirt' },
      { name: '24-hour room service', icon: 'utensils' },
      { name: 'Daily housekeeping', icon: 'sparkles' },
      { name: '24-hour security', icon: 'shield-check' },
      { name: 'Luggage storage', icon: 'briefcase' },
      { name: 'Kids’ facilities', icon: 'baby' },
      { name: 'Gift shop', icon: 'gift' },
      { name: 'Rooftop lounge', icon: 'martini' },
      { name: 'Garden', icon: 'trees' },
      { name: 'Prayer room', icon: 'moon' },
      { name: 'Accessible facilities', icon: 'accessibility' },
      { name: 'High-speed Wi-Fi', icon: 'wifi' }
    ]
  });
});

router.get('/experiences', (req, res) => {
  const experiences = getExperiences();
  res.render('experiences', {
    page: 'experiences',
    bodyClass: 'page-experiences',
    experiences,
    categories: [...new Set(experiences.map((e) => e.category))]
  });
});

router.get('/events', (req, res) => {
  res.render('events', {
    page: 'events',
    bodyClass: 'page-events',
    spaces: getEventSpaces(),
    packages: [
      { name: 'The Essential Meeting', price: 18500, unit: 'per delegate', description: 'Day delegate package with meeting room, two refreshments and a working lunch.', includes: ['Meeting room hire', 'Morning & afternoon refreshments', 'Working lunch', 'AV & Wi-Fi', 'Stationery'] },
      { name: 'The Grand Wedding', price: 1250000, unit: 'from, per event', description: 'A full wedding journey with ballroom, bespoke menu, bridal suite and dedicated planning.', includes: ['Grand Aurelia Ballroom', 'Bespoke five-course menu', 'Bridal suite for two nights', 'Floral styling', 'Dedicated wedding planner', 'Complimentary valet'] },
      { name: 'The Executive Retreat', price: 245000, unit: 'per day', description: 'A private boardroom, butler service and a curated working lunch for up to 24 guests.', includes: ['Executive Boardroom', 'Private butler', 'Barista service', 'Working lunch', 'AV support', 'Confidential access'] }
    ],
    dateLabel
  });
});

router.get('/offers', (req, res) => {
  res.render('offers', {
    page: 'offers',
    bodyClass: 'page-offers',
    offers: getOffers(),
    dateLabel
  });
});

router.get('/gallery', (req, res) => {
  const gallery = getGallery();
  res.render('gallery', {
    page: 'gallery',
    bodyClass: 'page-gallery',
    gallery,
    categories: [...new Set(gallery.map((g) => g.category))]
  });
});

router.get('/guest-services', (req, res) => {
  const settings = readSettings();
  res.render('guest-services', {
    page: 'guest-services',
    bodyClass: 'page-guest-services',
    settings,
    services: [
      { id: 'housekeeping', title: 'Housekeeping', icon: 'sparkles', description: 'Extra towels, linen changes, turndown or a quiet hour to clean.' },
      { id: 'laundry', title: 'Laundry & Pressing', icon: 'shirt', description: 'Same-day pressing and dry cleaning, collected from your room.' },
      { id: 'room-service', title: 'In-Room Dining', icon: 'utensils', description: 'Something from the kitchen, day or night — available 24 hours.' },
      { id: 'concierge', title: 'Concierge', icon: 'bell-ring', description: 'Reservations, tickets, guides, flowers or a thoughtful surprise.' },
      { id: 'airport-transfer', title: 'Airport Transfer', icon: 'plane', description: 'A chauffeured Mercedes to or from Islamabad International.' },
      { id: 'maintenance', title: 'Room Maintenance', icon: 'wrench', description: 'Tell us what needs attention and we will be there shortly.' }
    ]
  });
});

router.get('/contact', (req, res) => {
  res.render('contact', {
    page: 'contact',
    bodyClass: 'page-contact'
  });
});

router.get('/about', (req, res) => {
  res.render('about', { page: 'about', bodyClass: 'page-about' });
});

router.get('/privacy', (req, res) => {
  res.render('privacy', { page: 'privacy', bodyClass: 'page-legal' });
});

router.get('/terms', (req, res) => {
  res.render('terms', { page: 'terms', bodyClass: 'page-legal' });
});

router.get('/api/availability', (req, res) => {
  const settings = readSettings();
  const dates = queryDates(req);
  const nights = nightsBetween(dates.checkIn, dates.checkOut);
  if (nights <= 0) return res.status(400).json({ error: 'Please choose a valid date range.' });
  const categories = availability({ ...dates, settings }).map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    tagline: c.tagline,
    price: c.price,
    coverImage: c.cover_image,
    size: c.size_sqm,
    bed: c.bed_type,
    maxAdults: c.max_adults,
    maxChildren: c.max_children,
    availableRooms: c.availableRooms,
    isAvailable: c.isAvailable,
    total: c.quote.total,
    errors: c.quote.errors
  }));
  res.json({ nights, checkIn: dates.checkIn, checkOut: dates.checkOut, adults: dates.adults, children: dates.children, rooms: dates.rooms, categories });
});

router.post('/api/quote', (req, res) => {
  const body = req.body || {};
  const category = getCategoryBySlug(body.categorySlug);
  if (!category) return res.status(400).json({ error: 'Room not found.' });
  const settings = readSettings();
  const extras = Array.isArray(body.services) ? body.services : [];
  const quote = calculateQuote({
    category,
    checkIn: body.checkIn,
    checkOut: body.checkOut,
    adults: Number(body.adults) || 1,
    children: Number(body.children) || 0,
    rooms: Number(body.rooms) || 1,
    breakfastPlan: body.breakfastPlan || 'none',
    transfer: body.transfer || 'none',
    services: extras,
    promoCode: body.promoCode || '',
    settings
  });
  res.json({ quote, category: { name: category.name, slug: category.slug, price: category.price } });
});

router.post('/api/bookings', (req, res) => {
  try {
    const result = createBooking(req.body || {});
    if (!result.ok) return res.status(result.status || 400).json(result);
    res.status(201).json(result);
  } catch (error) {
    console.error('Booking error', error);
    res.status(500).json({ ok: false, message: 'Something went wrong while confirming your booking. Please try again.' });
  }
});

router.post('/api/enquiries', (req, res) => {
  const body = req.body || {};
  const type = ['event', 'experience', 'offer'].includes(body.type) ? body.type : 'event';
  if (!body.name || !body.email || !body.message) {
    return res.status(400).json({ ok: false, message: 'Please provide your name, email and a short message.' });
  }
  run(
    'INSERT INTO enquiries (type, name, email, phone, subject, message, details, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [type, String(body.name).slice(0, 120), String(body.email).slice(0, 160), String(body.phone || '').slice(0, 60),
      String(body.subject || 'General enquiry').slice(0, 200), String(body.message).slice(0, 2000),
      JSON.stringify(body.details || {}), 'new']
  );
  res.status(201).json({ ok: true, message: 'Thank you. Our team will be in touch within 24 hours.' });
});

router.post('/api/contact', (req, res) => {
  const body = req.body || {};
  if (!body.name || !body.email || !body.message) {
    return res.status(400).json({ ok: false, message: 'Please provide your name, email and a message.' });
  }
  run(
    'INSERT INTO contact_messages (name, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, ?)',
    [String(body.name).slice(0, 120), String(body.email).slice(0, 160), String(body.phone || '').slice(0, 60),
      String(body.subject || 'Website enquiry').slice(0, 200), String(body.message).slice(0, 2000), 'new']
  );
  res.status(201).json({ ok: true, message: 'Your message has reached our reservations team. We will reply shortly.' });
});

router.post('/api/guest-services', (req, res) => {
  const body = req.body || {};
  const mode = body.mode || 'request';
  const service = body.service || (mode === 'checkin' ? 'Express check-in' : mode === 'checkout' ? 'Express check-out' : 'Guest service');
  const roomNumber = body.roomNumber || (mode === 'checkin' ? 'Pre-arrival' : '');
  if (!body.name || !service || (mode !== 'checkin' && !roomNumber)) {
    return res.status(400).json({ ok: false, message: 'Please provide your name, room number and request.' });
  }
  const booking = body.bookingReference
    ? get('SELECT reference, guest_name, check_in, check_out FROM bookings WHERE reference = ?', [String(body.bookingReference).trim().toUpperCase()])
    : null;
  const details = {
    service,
    room: roomNumber,
    bookingReference: body.bookingReference || null,
    bookingFound: Boolean(booking),
    preferredTime: body.preferredTime || null,
    priority: body.priority || (mode === 'checkout' ? 'Departure' : mode === 'checkin' ? 'Arrival' : 'Normal'),
    mode
  };
  run(
    'INSERT INTO enquiries (type, name, email, phone, subject, message, details, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ['guest-service', String(body.name).slice(0, 120), String(body.email || 'guest@grandaurelia.com').slice(0, 160),
      String(body.phone || '').slice(0, 60), String(service).slice(0, 140), String(body.message || '').slice(0, 2000),
      JSON.stringify(details), 'new']
  );
  res.status(201).json({
    ok: true,
    booking,
    message: booking
      ? `Thank you, ${booking.guest_name}. We have found booking ${booking.reference} and your request is with our team.`
      : 'Thank you. Your request is with our team and we will confirm shortly.'
  });
});

router.post('/api/newsletter', (req, res) => {
  const email = String(req.body?.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, message: 'Please enter a valid email address.' });
  }
  run(
    'INSERT INTO enquiries (type, name, email, phone, subject, message, details, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ['newsletter', 'Newsletter subscriber', email, '', 'Journal subscription', 'Subscribed to the Grand Aurelia Journal.', JSON.stringify({ source: 'website' }), 'new']
  );
  res.status(201).json({ ok: true, message: 'Welcome to the Journal. Your first letter will arrive soon.' });
});

router.get('/api/concierge', (req, res) => {
  const settings = readSettings();
  const categories = getCategories();
  const facilities = getFacilities();
  const menu = getMenuItems();
  const offers = getOffers();
  const exp = getExperiences();
  res.json({
    hotel: settings,
    rooms: categories.map((c) => ({
      name: c.name, slug: c.slug, price: c.price, size: c.size_sqm, bed: c.bed_type,
      occupancy: c.max_adults + c.max_children, description: c.description
    })),
    facilities: facilities.map((f) => ({ name: f.name, description: f.short_description, hours: f.hours })),
    menuHighlights: menu.filter((m) => m.featured).map((m) => ({ name: m.name, price: m.price, category: m.category })),
    offers: offers.slice(0, 4).map((o) => ({ title: o.title, discount: o.discount_label, code: o.promo_code })),
    experiences: exp.slice(0, 4).map((e) => ({ title: e.title, duration: e.duration, price: e.price })),
    hours: { checkIn: settings.checkin_time, checkOut: settings.checkout_time }
  });
});

export default router;
