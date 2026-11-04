import express from 'express';
import {
  all, get, run, transaction, getSettings, setSetting
} from '../db/index.js';
import { verifyPassword, hashPassword } from '../lib/auth.js';
import {
  dashboardStats, monthlyRevenue, categoryBookingMix, getCategories, getCategoryById, getCategoryBySlug,
  getOffers, getFacilities, getMenuItems, getEventSpaces, dateLabel, shortDate, parseJson
} from '../lib/hotel.js';
import { formatPKR, EXTRA_SERVICES, BREAKFAST_PLANS, TRANSFER_OPTIONS } from '../lib/pricing.js';

const router = express.Router();

function requireAdmin(req, res, next) {
  if (!req.session.adminId) return res.redirect('/admin/login');
  res.locals.admin = { id: req.session.adminId, name: req.session.adminName };
  next();
}

function flash(req, type, message) {
  req.session.flash = { type, message };
}

function money(value) {
  return formatPKR(value);
}

router.get('/login', (req, res) => {
  if (req.session.adminId) return res.redirect('/admin');
  res.render('admin/login', { page: 'admin-login', bodyClass: 'page-admin-login', error: null });
});

router.post('/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const admin = get('SELECT * FROM admin_users WHERE lower(email) = ?', [email]);
  if (!admin || !verifyPassword(password, admin.password_hash)) {
    return res.status(401).render('admin/login', {
      page: 'admin-login',
      bodyClass: 'page-admin-login',
      error: 'Those credentials do not match our records. Please try again.'
    });
  }
  req.session.adminId = admin.id;
  req.session.adminName = admin.name;
  res.redirect('/admin');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

router.use(requireAdmin);

router.get('/', (req, res) => {
  const stats = dashboardStats();
  const recent = all(`SELECT b.*, c.name AS category_name FROM bookings b
    JOIN room_categories c ON c.id = b.category_id
    ORDER BY b.created_at DESC, b.id DESC LIMIT 8`);
  const arrivals = all(`SELECT b.*, c.name AS category_name FROM bookings b
    JOIN room_categories c ON c.id = b.category_id
    WHERE b.check_in = ? AND b.booking_status IN ('confirmed','checked_in')
    ORDER BY b.check_in`, [stats.today]);
  const departures = all(`SELECT b.*, c.name AS category_name FROM bookings b
    JOIN room_categories c ON c.id = b.category_id
    WHERE b.check_out = ? AND b.booking_status IN ('confirmed','checked_in','checked_out')
    ORDER BY b.check_out`, [stats.today]);
  const months = monthlyRevenue();
  const mix = categoryBookingMix();
  const roomBoard = all(`SELECT r.*, c.name AS category_name FROM rooms r
    JOIN room_categories c ON c.id = r.category_id ORDER BY r.room_number LIMIT 40`);

  const labels = [];
  const revenueSeries = [];
  const bookingSeries = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    labels.push(d.toLocaleDateString('en-GB', { month: 'short' }));
    const row = months.find((m) => m.month === key);
    revenueSeries.push(row ? Math.round(row.revenue / 1000) : 0);
    bookingSeries.push(row ? row.bookings : 0);
  }

  res.render('admin/dashboard', {
    page: 'admin-dashboard',
    bodyClass: 'page-admin',
    title: 'Overview',
    stats,
    recent,
    arrivals,
    departures,
    roomBoard,
    chart: {
      labels,
      revenue: revenueSeries,
      bookings: bookingSeries,
      mixLabels: mix.map((m) => m.name),
      mixData: mix.map((m) => m.bookings)
    },
    dateLabel,
    money
  });
});

router.get('/bookings', (req, res) => {
  const status = req.query.status || 'all';
  const q = String(req.query.q || '').trim();
  let where = [];
  const params = [];
  if (status !== 'all') {
    where.push('b.booking_status = ?');
    params.push(status);
  }
  if (q) {
    where.push('(b.reference LIKE ? OR b.guest_name LIKE ? OR b.email LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const bookings = all(
    `SELECT b.*, c.name AS category_name FROM bookings b
     JOIN room_categories c ON c.id = b.category_id
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY b.check_in DESC, b.id DESC`,
    params
  );
  const counts = {
    all: get('SELECT COUNT(*) AS n FROM bookings').n,
    confirmed: get("SELECT COUNT(*) AS n FROM bookings WHERE booking_status = 'confirmed'").n,
    pending: get("SELECT COUNT(*) AS n FROM bookings WHERE booking_status = 'pending'").n,
    checked_in: get("SELECT COUNT(*) AS n FROM bookings WHERE booking_status = 'checked_in'").n,
    checked_out: get("SELECT COUNT(*) AS n FROM bookings WHERE booking_status = 'checked_out'").n,
    cancelled: get("SELECT COUNT(*) AS n FROM bookings WHERE booking_status = 'cancelled'").n
  };
  res.render('admin/bookings', {
    page: 'admin-bookings', bodyClass: 'page-admin', title: 'Reservations',
    bookings, status, q, counts, dateLabel, money
  });
});

router.get('/bookings/:id', (req, res, next) => {
  const booking = get('SELECT b.*, c.name AS category_name, c.cover_image, c.price AS category_price FROM bookings b JOIN room_categories c ON c.id = b.category_id WHERE b.id = ?', [Number(req.params.id)]);
  if (!booking) return next();
  const rooms = all('SELECT br.*, r.room_number, r.floor FROM booking_rooms br JOIN rooms r ON r.id = br.room_id WHERE br.booking_id = ?', [booking.id]);
  const guest = booking.guest_id ? get('SELECT * FROM guests WHERE id = ?', [booking.guest_id]) : null;
  const history = all('SELECT * FROM bookings WHERE guest_id = ? AND id != ? ORDER BY check_in DESC LIMIT 6', [booking.guest_id || 0, booking.id]);
  const services = EXTRA_SERVICES.filter((s) => parseJson(booking.services, []).includes(s.id));
  res.render('admin/booking-detail', {
    page: 'admin-bookings', bodyClass: 'page-admin', title: `Reservation ${booking.reference}`,
    booking, rooms, guest, history, services, dateLabel, money,
    breakfast: BREAKFAST_PLANS[booking.breakfast_plan] || BREAKFAST_PLANS.none,
    transfer: TRANSFER_OPTIONS[booking.airport_transfer] || TRANSFER_OPTIONS.none
  });
});

router.post('/bookings/:id/status', (req, res) => {
  const booking = get('SELECT * FROM bookings WHERE id = ?', [Number(req.params.id)]);
  if (!booking) return res.redirect('/admin/bookings');
  const action = String(req.body.action);
  const allowed = {
    confirm: { to: 'confirmed', from: ['pending'] },
    cancel: { to: 'cancelled', from: ['pending', 'confirmed'] },
    checkin: { to: 'checked_in', from: ['confirmed'] },
    checkout: { to: 'checked_out', from: ['checked_in'] }
  };
  const rule = allowed[action];
  if (!rule) {
    flash(req, 'error', 'That action is not recognised.');
    return res.redirect(`/admin/bookings/${booking.id}`);
  }
  if (!rule.from.includes(booking.booking_status)) {
    flash(req, 'error', `This reservation cannot be ${action === 'checkin' ? 'checked in' : action === 'checkout' ? 'checked out' : action + 'ed'} from its current status.`);
    return res.redirect(`/admin/bookings/${booking.id}`);
  }

  transaction(() => {
    run('UPDATE bookings SET booking_status = ? WHERE id = ?', [rule.to, booking.id]);
    if (action === 'checkin') {
      run("UPDATE booking_rooms SET room_id = room_id WHERE booking_id = ?", [booking.id]);
      const rooms = all('SELECT room_id FROM booking_rooms WHERE booking_id = ?', [booking.id]);
      for (const r of rooms) run("UPDATE rooms SET status = 'occupied' WHERE id = ?", [r.room_id]);
    }
    if (action === 'checkout') {
      const rooms = all('SELECT room_id FROM booking_rooms WHERE booking_id = ?', [booking.id]);
      for (const r of rooms) run("UPDATE rooms SET status = 'available' WHERE id = ? AND status = 'occupied'", [r.room_id]);
      if (booking.payment_status === 'pending') run("UPDATE bookings SET payment_status = 'paid' WHERE id = ?", [booking.id]);
    }
    if (action === 'cancel') {
      const rooms = all('SELECT room_id FROM booking_rooms WHERE booking_id = ?', [booking.id]);
      for (const r of rooms) run("UPDATE rooms SET status = 'available' WHERE id = ? AND status IN ('occupied','reserved')", [r.room_id]);
      if (booking.payment_status === 'paid') run("UPDATE bookings SET payment_status = 'refunded' WHERE id = ?", [booking.id]);
    }
  });
  flash(req, 'success', `Reservation ${booking.reference} updated.`);
  res.redirect(`/admin/bookings/${booking.id}`);
});

router.post('/bookings/:id/payment', (req, res) => {
  const booking = get('SELECT * FROM bookings WHERE id = ?', [Number(req.params.id)]);
  if (!booking) return res.redirect('/admin/bookings');
  const status = ['paid', 'pending', 'refunded'].includes(req.body.payment_status) ? req.body.payment_status : 'pending';
  run('UPDATE bookings SET payment_status = ? WHERE id = ?', [status, booking.id]);
  flash(req, 'success', `Payment status for ${booking.reference} set to ${status}.`);
  res.redirect(`/admin/bookings/${booking.id}`);
});

router.get('/rooms', (req, res) => {
  const status = req.query.status || 'all';
  const filter = status === 'all' ? '' : 'WHERE r.status = ?';
  const rooms = all(
    `SELECT r.*, c.name AS category_name, c.price FROM rooms r
     JOIN room_categories c ON c.id = r.category_id ${filter}
     ORDER BY r.room_number`,
    status === 'all' ? [] : [status]
  );
  const categories = getCategories();
  const counts = {
    all: get('SELECT COUNT(*) AS n FROM rooms').n,
    available: get("SELECT COUNT(*) AS n FROM rooms WHERE status = 'available'").n,
    occupied: get("SELECT COUNT(*) AS n FROM rooms WHERE status = 'occupied'").n,
    reserved: get("SELECT COUNT(*) AS n FROM rooms WHERE status = 'reserved'").n,
    maintenance: get("SELECT COUNT(*) AS n FROM rooms WHERE status = 'maintenance'").n
  };
  res.render('admin/rooms', {
    page: 'admin-rooms', bodyClass: 'page-admin', title: 'Rooms & Suites',
    rooms, categories, counts, status, money
  });
});

router.post('/rooms', (req, res) => {
  const number = String(req.body.room_number || '').trim();
  const categoryId = Number(req.body.category_id);
  const floor = Number(req.body.floor) || 1;
  const status = ['available', 'occupied', 'reserved', 'maintenance'].includes(req.body.status) ? req.body.status : 'available';
  if (!number || !categoryId) {
    flash(req, 'error', 'A room number and category are required.');
    return res.redirect('/admin/rooms');
  }
  if (get('SELECT id FROM rooms WHERE room_number = ?', [number])) {
    flash(req, 'error', `Room ${number} already exists.`);
    return res.redirect('/admin/rooms');
  }
  run('INSERT INTO rooms (room_number, category_id, floor, status, notes) VALUES (?, ?, ?, ?, ?)', [
    number, categoryId, floor, status, String(req.body.notes || '')
  ]);
  flash(req, 'success', `Room ${number} added to the inventory.`);
  res.redirect('/admin/rooms');
});

router.get('/rooms/:id', (req, res, next) => {
  const room = get(
    `SELECT r.*, c.name AS category_name FROM rooms r JOIN room_categories c ON c.id = r.category_id WHERE r.id = ?`,
    [Number(req.params.id)]
  );
  if (!room) return next();
  const history = all(
    `SELECT b.reference, b.guest_name, b.check_in, b.check_out, b.booking_status
     FROM booking_rooms br JOIN bookings b ON b.id = br.booking_id
     WHERE br.room_id = ? ORDER BY b.check_in DESC LIMIT 10`, [room.id]
  );
  res.render('admin/room-detail', {
    page: 'admin-rooms', bodyClass: 'page-admin', title: `Room ${room.room_number}`,
    room, categories: getCategories(), history, dateLabel
  });
});

router.post('/rooms/:id', (req, res) => {
  const room = get('SELECT * FROM rooms WHERE id = ?', [Number(req.params.id)]);
  if (!room) return res.redirect('/admin/rooms');
  const status = ['available', 'occupied', 'reserved', 'maintenance'].includes(req.body.status) ? req.body.status : room.status;
  run('UPDATE rooms SET category_id = ?, floor = ?, status = ?, notes = ? WHERE id = ?', [
    Number(req.body.category_id) || room.category_id, Number(req.body.floor) || room.floor, status,
    String(req.body.notes || ''), room.id
  ]);
  flash(req, 'success', `Room ${room.room_number} updated.`);
  res.redirect(`/admin/rooms/${room.id}`);
});

router.post('/rooms/:id/status', (req, res) => {
  const room = get('SELECT * FROM rooms WHERE id = ?', [Number(req.params.id)]);
  if (room && ['available', 'occupied', 'reserved', 'maintenance'].includes(req.body.status)) {
    run('UPDATE rooms SET status = ? WHERE id = ?', [req.body.status, room.id]);
    flash(req, 'success', `Room ${room.room_number} marked ${req.body.status}.`);
  }
  res.redirect('/admin/rooms');
});

router.get('/categories', (req, res) => {
  const categories = all(`SELECT c.*,
      (SELECT COUNT(*) FROM rooms r WHERE r.category_id = c.id) AS room_count
    FROM room_categories c ORDER BY c.sort_order`);
  res.render('admin/categories', {
    page: 'admin-categories', bodyClass: 'page-admin', title: 'Room Categories',
    categories, money
  });
});

router.post('/categories/:id', (req, res) => {
  const id = Number(req.params.id);
  const cat = get('SELECT * FROM room_categories WHERE id = ?', [id]);
  if (!cat) return res.redirect('/admin/categories');
  run(`UPDATE room_categories SET price = ?, size_sqm = ?, max_adults = ?, max_children = ?, featured = ?, name = ?, tagline = ? WHERE id = ?`, [
    Math.max(0, Number(req.body.price) || cat.price),
    Math.max(1, Number(req.body.size_sqm) || cat.size_sqm),
    Math.max(1, Number(req.body.max_adults) || cat.max_adults),
    Math.max(0, Number(req.body.max_children) || cat.max_children),
    req.body.featured ? 1 : 0,
    String(req.body.name || cat.name),
    String(req.body.tagline || cat.tagline),
    id
  ]);
  flash(req, 'success', `${cat.name} updated. New rates apply to future reservations.`);
  res.redirect('/admin/categories');
});

router.get('/guests', (req, res) => {
  const q = String(req.query.q || '').trim();
  const guests = all(
    `SELECT g.*,
      (SELECT COUNT(*) FROM bookings b WHERE b.guest_id = g.id AND b.booking_status != 'cancelled') AS stays,
      (SELECT COALESCE(SUM(b.total),0) FROM bookings b WHERE b.guest_id = g.id AND b.booking_status != 'cancelled') AS spend,
      (SELECT MAX(b.check_in) FROM bookings b WHERE b.guest_id = g.id) AS last_stay
     FROM guests g
     ${q ? 'WHERE g.first_name LIKE ? OR g.last_name LIKE ? OR g.email LIKE ?' : ''}
     ORDER BY g.vip DESC, g.first_name`,
    q ? [`%${q}%`, `%${q}%`, `%${q}%`] : []
  );
  res.render('admin/guests', {
    page: 'admin-guests', bodyClass: 'page-admin', title: 'Guests',
    guests, q, money, dateLabel
  });
});

router.get('/guests/:id', (req, res, next) => {
  const guest = get('SELECT * FROM guests WHERE id = ?', [Number(req.params.id)]);
  if (!guest) return next();
  const bookings = all('SELECT * FROM bookings WHERE guest_id = ? ORDER BY check_in DESC', [guest.id]);
  res.render('admin/guest-detail', {
    page: 'admin-guests', bodyClass: 'page-admin', title: `${guest.first_name} ${guest.last_name}`,
    guest, bookings, money, dateLabel
  });
});

router.post('/guests/:id', (req, res) => {
  const guest = get('SELECT * FROM guests WHERE id = ?', [Number(req.params.id)]);
  if (!guest) return res.redirect('/admin/guests');
  run('UPDATE guests SET first_name = ?, last_name = ?, email = ?, phone = ?, nationality = ?, vip = ? WHERE id = ?', [
    String(req.body.first_name || guest.first_name).trim(),
    String(req.body.last_name || guest.last_name).trim(),
    String(req.body.email || guest.email).trim(),
    String(req.body.phone || guest.phone || ''),
    String(req.body.nationality || guest.nationality || ''),
    req.body.vip ? 1 : 0,
    guest.id
  ]);
  flash(req, 'success', 'Guest profile updated.');
  res.redirect(`/admin/guests/${guest.id}`);
});

router.get('/offers', (req, res) => {
  res.render('admin/offers', {
    page: 'admin-offers', bodyClass: 'page-admin', title: 'Offers & Packages',
    offers: getOffers(false), money
  });
});

router.get('/offers/new', (req, res) => {
  res.render('admin/offer-form', {
    page: 'admin-offers', bodyClass: 'page-admin', title: 'New Offer', offer: null
  });
});

router.get('/offers/:id', (req, res, next) => {
  const offer = get('SELECT * FROM offers WHERE id = ?', [Number(req.params.id)]);
  if (!offer) return next();
  res.render('admin/offer-form', {
    page: 'admin-offers', bodyClass: 'page-admin', title: 'Edit Offer', offer
  });
});

router.post('/offers', (req, res) => {
  const b = req.body;
  if (!String(b.title || '').trim()) {
    flash(req, 'error', 'An offer title is required.');
    return res.redirect('/admin/offers/new');
  }
  const slug = String(b.slug || b.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  run(`INSERT INTO offers (slug, title, subtitle, description, discount_label, discount_percent, promo_code, valid_from, valid_to, conditions, image, featured, active, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    slug, String(b.title), String(b.subtitle || ''), String(b.description || ''),
    String(b.discount_label || ''), Number(b.discount_percent) || 0, String(b.promo_code || '').toUpperCase() || null,
    b.valid_from || null, b.valid_to || null, String(b.conditions || ''), String(b.image || '/images/exp-weekend.jpg'),
    b.featured ? 1 : 0, b.active ? 1 : 0, Number(b.sort_order) || 0
  ]);
  flash(req, 'success', 'Offer created.');
  res.redirect('/admin/offers');
});

router.post('/offers/:id', (req, res) => {
  const offer = get('SELECT * FROM offers WHERE id = ?', [Number(req.params.id)]);
  if (!offer) return res.redirect('/admin/offers');
  const b = req.body;
  run(`UPDATE offers SET title = ?, subtitle = ?, description = ?, discount_label = ?, discount_percent = ?, promo_code = ?, valid_from = ?, valid_to = ?, conditions = ?, image = ?, featured = ?, active = ?, sort_order = ? WHERE id = ?`, [
    String(b.title || offer.title), String(b.subtitle || ''), String(b.description || ''),
    String(b.discount_label || ''), Number(b.discount_percent) || 0, String(b.promo_code || '').toUpperCase() || null,
    b.valid_from || null, b.valid_to || null, String(b.conditions || ''), String(b.image || offer.image),
    b.featured ? 1 : 0, b.active ? 1 : 0, Number(b.sort_order) || 0, offer.id
  ]);
  flash(req, 'success', 'Offer updated.');
  res.redirect('/admin/offers');
});

router.post('/offers/:id/delete', (req, res) => {
  run('DELETE FROM offers WHERE id = ?', [Number(req.params.id)]);
  flash(req, 'success', 'Offer removed.');
  res.redirect('/admin/offers');
});

router.get('/facilities', (req, res) => {
  res.render('admin/facilities', {
    page: 'admin-facilities', bodyClass: 'page-admin', title: 'Facilities',
    facilities: getFacilities()
  });
});

router.post('/facilities/:id', (req, res) => {
  const f = get('SELECT * FROM facilities WHERE id = ?', [Number(req.params.id)]);
  if (!f) return res.redirect('/admin/facilities');
  run('UPDATE facilities SET name = ?, category = ?, short_description = ?, description = ?, hours = ?, active = ? WHERE id = ?', [
    String(req.body.name || f.name), String(req.body.category || f.category),
    String(req.body.short_description || f.short_description), String(req.body.description || f.description),
    String(req.body.hours || f.hours), req.body.active ? 1 : 0, f.id
  ]);
  flash(req, 'success', `${f.name} updated.`);
  res.redirect('/admin/facilities');
});

router.get('/dining', (req, res) => {
  const category = req.query.category || 'all';
  const items = all(
    `SELECT * FROM menu_items ${category === 'all' ? '' : 'WHERE category = ?'} ORDER BY category, sort_order`,
    category === 'all' ? [] : [category]
  );
  const categories = all('SELECT DISTINCT category FROM menu_items ORDER BY category').map((r) => r.category);
  res.render('admin/dining', {
    page: 'admin-dining', bodyClass: 'page-admin', title: 'Dining Menu',
    items, categories, category, money
  });
});

router.get('/dining/new', (req, res) => {
  res.render('admin/menu-form', {
    page: 'admin-dining', bodyClass: 'page-admin', title: 'New Menu Item', item: null,
    categories: ['Breakfast', 'Starters', 'Soups', 'Salads', 'Continental', 'Pakistani', 'Chinese', 'Italian', 'Main Courses', 'BBQ', 'Seafood', 'Desserts', 'Beverages', 'Coffee & Tea', 'Room Service']
  });
});

router.get('/dining/:id', (req, res, next) => {
  const item = get('SELECT * FROM menu_items WHERE id = ?', [Number(req.params.id)]);
  if (!item) return next();
  res.render('admin/menu-form', {
    page: 'admin-dining', bodyClass: 'page-admin', title: 'Edit Menu Item', item,
    categories: ['Breakfast', 'Starters', 'Soups', 'Salads', 'Continental', 'Pakistani', 'Chinese', 'Italian', 'Main Courses', 'BBQ', 'Seafood', 'Desserts', 'Beverages', 'Coffee & Tea', 'Room Service']
  });
});

router.post('/dining', (req, res) => {
  const b = req.body;
  if (!b.name || !b.category) {
    flash(req, 'error', 'A dish name and category are required.');
    return res.redirect('/admin/dining/new');
  }
  run('INSERT INTO menu_items (name, description, category, price, image, dietary, featured, room_service, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
    String(b.name), String(b.description || ''), String(b.category), Number(b.price) || 0,
    String(b.image || '/images/food-01.jpg'),
    JSON.stringify(String(b.dietary || '').split(',').map((s) => s.trim()).filter(Boolean)),
    b.featured ? 1 : 0, b.room_service ? 1 : 0, b.active ? 1 : 0, Number(b.sort_order) || 0
  ]);
  flash(req, 'success', 'Menu item added.');
  res.redirect('/admin/dining');
});

router.post('/dining/:id', (req, res) => {
  const item = get('SELECT * FROM menu_items WHERE id = ?', [Number(req.params.id)]);
  if (!item) return res.redirect('/admin/dining');
  const b = req.body;
  run('UPDATE menu_items SET name = ?, description = ?, category = ?, price = ?, image = ?, dietary = ?, featured = ?, room_service = ?, active = ?, sort_order = ? WHERE id = ?', [
    String(b.name || item.name), String(b.description || ''), String(b.category || item.category),
    Number(b.price) || 0, String(b.image || item.image),
    JSON.stringify(String(b.dietary || '').split(',').map((s) => s.trim()).filter(Boolean)),
    b.featured ? 1 : 0, b.room_service ? 1 : 0, b.active ? 1 : 0, Number(b.sort_order) || 0, item.id
  ]);
  flash(req, 'success', 'Menu item updated.');
  res.redirect('/admin/dining');
});

router.post('/dining/:id/delete', (req, res) => {
  run('DELETE FROM menu_items WHERE id = ?', [Number(req.params.id)]);
  flash(req, 'success', 'Menu item removed.');
  res.redirect('/admin/dining');
});

router.get('/enquiries', (req, res) => {
  const type = req.query.type || 'all';
  const enquiries = all(
    `SELECT * FROM enquiries ${type === 'all' ? '' : 'WHERE type = ?'} ORDER BY created_at DESC, id DESC`,
    type === 'all' ? [] : [type]
  );
  const counts = {
    all: get('SELECT COUNT(*) AS n FROM enquiries').n,
    event: get("SELECT COUNT(*) AS n FROM enquiries WHERE type = 'event'").n,
    experience: get("SELECT COUNT(*) AS n FROM enquiries WHERE type = 'experience'").n,
    'guest-service': get("SELECT COUNT(*) AS n FROM enquiries WHERE type = 'guest-service'").n,
    contact: get("SELECT COUNT(*) AS n FROM enquiries WHERE type = 'contact'").n,
    newsletter: get("SELECT COUNT(*) AS n FROM enquiries WHERE type = 'newsletter'").n
  };
  res.render('admin/enquiries', {
    page: 'admin-enquiries', bodyClass: 'page-admin', title: 'Enquiries & Requests',
    enquiries, type, counts, dateLabel, parseJson
  });
});

router.post('/enquiries/:id/status', (req, res) => {
  const status = ['new', 'read', 'in_progress', 'resolved'].includes(req.body.status) ? req.body.status : 'read';
  run('UPDATE enquiries SET status = ? WHERE id = ?', [status, Number(req.params.id)]);
  flash(req, 'success', 'Enquiry status updated.');
  res.redirect(req.get('referer') || '/admin/enquiries');
});

router.get('/messages', (req, res) => {
  const messages = all('SELECT * FROM contact_messages ORDER BY created_at DESC, id DESC');
  res.render('admin/messages', {
    page: 'admin-messages', bodyClass: 'page-admin', title: 'Contact Messages',
    messages, dateLabel
  });
});

router.post('/messages/:id/status', (req, res) => {
  const status = ['new', 'read', 'replied'].includes(req.body.status) ? req.body.status : 'read';
  run('UPDATE contact_messages SET status = ? WHERE id = ?', [status, Number(req.params.id)]);
  flash(req, 'success', 'Message updated.');
  res.redirect('/admin/messages');
});

router.get('/settings', (req, res) => {
  const settings = getSettings();
  res.render('admin/settings', {
    page: 'admin-settings', bodyClass: 'page-admin', title: 'Settings',
    settings, admin: res.locals.admin
  });
});

router.post('/settings', (req, res) => {
  const allowed = [
    'hotel_name', 'short_name', 'tagline', 'star_rating', 'phone', 'whatsapp', 'whatsapp_digits', 'email',
    'address', 'city', 'country', 'maps_url', 'checkin_time', 'checkout_time', 'currency', 'tax_rate',
    'service_charge_rate', 'extra_adult_charge', 'extra_child_charge', 'breakfast_price', 'facebook',
    'instagram', 'established', 'footer_note'
  ];
  for (const key of allowed) {
    if (req.body[key] !== undefined) setSetting(key, String(req.body[key]).slice(0, 500));
  }
  flash(req, 'success', 'Hotel settings saved. Changes are live across the website.');
  res.redirect('/admin/settings');
});

router.post('/settings/password', (req, res) => {
  const current = String(req.body.current_password || '');
  const next = String(req.body.new_password || '');
  const admin = get('SELECT * FROM admin_users WHERE id = ?', [req.session.adminId]);
  if (!admin || !verifyPassword(current, admin.password_hash)) {
    flash(req, 'error', 'Your current password is incorrect.');
    return res.redirect('/admin/settings');
  }
  if (next.length < 8) {
    flash(req, 'error', 'The new password must be at least 8 characters.');
    return res.redirect('/admin/settings');
  }
  run('UPDATE admin_users SET password_hash = ? WHERE id = ?', [hashPassword(next), admin.id]);
  flash(req, 'success', 'Administrator password updated.');
  res.redirect('/admin/settings');
});

export default router;
