import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { db, migrate, run, get, all, transaction } from './index.js';
import {
  SETTINGS, CATEGORIES, MENU_ITEMS, FACILITIES, EXPERIENCES, EVENT_SPACES, OFFERS,
  GALLERY, TESTIMONIALS, GUESTS, ROOMS
} from './seed-data.js';
import { hashPassword } from '../lib/auth.js';
import { calculateQuote } from '../lib/pricing.js';

const today = new Date();
today.setUTCHours(0, 0, 0, 0);

function iso(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(n) {
  const d = new Date(today);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
}

function createdDate(checkIn, offset) {
  const d = new Date(`${checkIn}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - offset);
  const now = new Date();
  const cap = new Date(now.getTime() - 2 * 86400000);
  return iso(d > cap ? cap : d);
}

const BOOKING_PLAN = [
  { guest: 0, category: 'presidential-suite', checkIn: -4, checkOut: 1, status: 'checked_in', payment: 'paid', method: 'demo_card', adults: 2, children: 0, rooms: 1, breakfast: 'full_board', transfer: 'roundtrip', services: ['celebration', 'spa_credit'], requests: 'Please arrange a private dinner on the terrace on the second evening. Vegetarian menu for one guest.' },
  { guest: 1, category: 'executive-suite', checkIn: -2, checkOut: 2, status: 'checked_in', payment: 'paid', method: 'demo_card', adults: 2, children: 0, rooms: 1, breakfast: 'breakfast', transfer: 'pickup', services: ['late_checkout'], requests: 'Extra pillows and a quiet room away from the lift, please.' },
  { guest: 2, category: 'deluxe-room', checkIn: -3, checkOut: 1, status: 'checked_in', payment: 'paid', method: 'demo_card', adults: 1, children: 0, rooms: 1, breakfast: 'breakfast', transfer: 'none', services: ['spa_credit'], requests: 'Spa appointment preferred in the late afternoon.' },
  { guest: 3, category: 'junior-suite', checkIn: -6, checkOut: -3, status: 'checked_out', payment: 'paid', method: 'demo_card', adults: 2, children: 0, rooms: 1, breakfast: 'half_board', transfer: 'none', services: [], requests: '' },
  { guest: 6, category: 'standard-room', checkIn: 0, checkOut: 2, status: 'confirmed', payment: 'pending', method: 'pay_at_hotel', adults: 2, children: 0, rooms: 1, breakfast: 'breakfast', transfer: 'none', services: [], requests: 'Arriving late, around 23:30.' },
  { guest: 7, category: 'family-room', checkIn: 0, checkOut: 3, status: 'confirmed', payment: 'paid', method: 'demo_card', adults: 2, children: 2, rooms: 1, breakfast: 'half_board', transfer: 'pickup', services: ['celebration'], requests: 'Twin beds for the children and a cot for our youngest. A birthday cake on the first evening would be wonderful.' },
  { guest: 8, category: 'superior-room', checkIn: 3, checkOut: 6, status: 'confirmed', payment: 'paid', method: 'demo_card', adults: 2, children: 0, rooms: 1, breakfast: 'breakfast', transfer: 'none', services: [], requests: 'High floor with a garden view if possible.' },
  { guest: 9, category: 'penthouse-suite', checkIn: 5, checkOut: 8, status: 'confirmed', payment: 'paid', method: 'demo_card', adults: 2, children: 0, rooms: 1, breakfast: 'breakfast', transfer: 'roundtrip', services: ['celebration', 'spa_credit'], requests: 'Champagne alternative — we do not drink alcohol. Sparkling juice and fresh flowers on arrival.' },
  { guest: 10, category: 'business-class-room', checkIn: 7, checkOut: 10, status: 'confirmed', payment: 'pending', method: 'pay_at_checkout', adults: 1, children: 0, rooms: 1, breakfast: 'breakfast', transfer: 'pickup', services: ['valet'], requests: 'Quiet room with a desk facing the window. Printing required on the second morning.' },
  { guest: 11, category: 'deluxe-room', checkIn: 12, checkOut: 15, status: 'confirmed', payment: 'paid', method: 'demo_card', adults: 3, children: 0, rooms: 2, breakfast: 'breakfast', transfer: 'none', services: [], requests: 'Two adjoining rooms if available. One guest is celebrating a birthday.' },
  { guest: 12, category: 'executive-room', checkIn: 21, checkOut: 24, status: 'confirmed', payment: 'paid', method: 'demo_card', adults: 2, children: 0, rooms: 1, breakfast: 'breakfast', transfer: 'none', services: [], requests: '' },
  { guest: 13, category: 'junior-suite', checkIn: 2, checkOut: 4, status: 'confirmed', payment: 'paid', method: 'demo_card', adults: 2, children: 1, rooms: 1, breakfast: 'breakfast', transfer: 'none', services: ['late_checkout'], requests: 'A cot for our one-year-old and a quiet room.' },
  { guest: 14, category: 'family-room', checkIn: 15, checkOut: 18, status: 'confirmed', payment: 'paid', method: 'demo_card', adults: 2, children: 2, rooms: 1, breakfast: 'half_board', transfer: 'none', services: [], requests: 'Kids’ Club registration on arrival.' },
  { guest: 15, category: 'standard-room', checkIn: 4, checkOut: 7, status: 'cancelled', payment: 'refunded', method: 'demo_card', adults: 2, children: 0, rooms: 1, breakfast: 'none', transfer: 'none', services: [], requests: '' },
  { guest: 16, category: 'superior-room', checkIn: 10, checkOut: 13, status: 'cancelled', payment: 'refunded', method: 'demo_card', adults: 1, children: 0, rooms: 1, breakfast: 'breakfast', transfer: 'none', services: [], requests: '' },
  { guest: 17, category: 'deluxe-room', checkIn: 30, checkOut: 33, status: 'pending', payment: 'pending', method: 'pay_at_hotel', adults: 2, children: 0, rooms: 1, breakfast: 'breakfast', transfer: 'none', services: [], requests: 'Requesting a room away from the street.' },
  { guest: 18, category: 'standard-room', checkIn: 35, checkOut: 37, status: 'pending', payment: 'pending', method: 'pay_at_checkout', adults: 1, children: 0, rooms: 1, breakfast: 'none', transfer: 'none', services: [], requests: '' },
  { guest: 19, category: 'business-class-room', checkIn: -12, checkOut: -9, status: 'checked_out', payment: 'paid', method: 'demo_card', adults: 1, children: 0, rooms: 1, breakfast: 'breakfast', transfer: 'roundtrip', services: [], requests: '' },
  { guest: 4, category: 'accessible-room', checkIn: -25, checkOut: -22, status: 'checked_out', payment: 'paid', method: 'demo_card', adults: 2, children: 0, rooms: 1, breakfast: 'breakfast', transfer: 'pickup', services: [], requests: 'Step-free access required; please confirm the roll-in shower.' },
  { guest: 5, category: 'accessible-room', checkIn: 9, checkOut: 14, status: 'confirmed', payment: 'paid', method: 'demo_card', adults: 2, children: 0, rooms: 1, breakfast: 'breakfast', transfer: 'pickup', services: [], requests: 'Accessible transfer vehicle requested.' },
  { guest: 0, category: 'executive-suite', checkIn: 18, checkOut: 22, status: 'confirmed', payment: 'paid', method: 'demo_card', adults: 2, children: 0, rooms: 1, breakfast: 'breakfast', transfer: 'roundtrip', services: ['spa_credit'], requests: 'A repeat guest — please provide the usual pillow selection.' },
  { guest: 1, category: 'penthouse-suite', checkIn: 40, checkOut: 43, status: 'pending', payment: 'pending', method: 'pay_at_hotel', adults: 2, children: 0, rooms: 1, breakfast: 'breakfast', transfer: 'none', services: [], requests: '' },
  { guest: 2, category: 'standard-room', checkIn: -1, checkOut: 0, status: 'checked_out', payment: 'paid', method: 'demo_card', adults: 1, children: 0, rooms: 1, breakfast: 'breakfast', transfer: 'none', services: [], requests: '' },
  { guest: 3, category: 'superior-room', checkIn: -8, checkOut: -5, status: 'checked_out', payment: 'paid', method: 'demo_card', adults: 2, children: 0, rooms: 1, breakfast: 'none', transfer: 'none', services: [], requests: '' },
  { guest: 4, category: 'executive-room', checkIn: 25, checkOut: 28, status: 'confirmed', payment: 'paid', method: 'demo_card', adults: 2, children: 0, rooms: 1, breakfast: 'breakfast', transfer: 'none', services: [], requests: '' }
];

export function resetData() {
  const tables = ['booking_rooms', 'bookings', 'guests', 'rooms', 'room_categories', 'offers', 'facilities', 'experiences', 'event_spaces', 'menu_items', 'testimonials', 'gallery', 'enquiries', 'contact_messages', 'admin_users', 'settings'];
  for (const table of tables) {
    try { run(`DELETE FROM ${table}`); } catch { /* table may not exist yet */ }
  }
  try { run("DELETE FROM sqlite_sequence"); } catch { /* no autoincrement rows */ }
}

export function seedDatabase() {
  transaction(() => {
    for (const [key, value] of Object.entries(SETTINGS)) {
      run('INSERT INTO settings (key, value) VALUES (?, ?)', [key, String(value)]);
    }

    run('INSERT INTO admin_users (name, email, password_hash) VALUES (?, ?, ?)', [
      'Aurelia Manager', 'admin@grandaurelia.com', hashPassword('Aurelia@2026')
    ]);

    const categoryIds = {};
    for (const c of CATEGORIES) {
      const result = run(
        `INSERT INTO room_categories
        (slug, name, tagline, description, long_description, size_sqm, max_adults, max_children, bed_type, bathroom, view, price, amenities, images, cover_image, featured, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.slug, c.name, c.tagline, c.description, c.long_description, c.size_sqm, c.max_adults, c.max_children,
          c.bed_type, c.bathroom, c.view, c.price, JSON.stringify(c.amenities), JSON.stringify(c.images), c.cover_image, c.featured, c.sort_order]
      );
      categoryIds[c.slug] = Number(result.lastInsertRowid);
    }

    for (const r of ROOMS) {
      run('INSERT INTO rooms (room_number, category_id, floor, status) VALUES (?, ?, ?, ?)', [
        r.number, categoryIds[r.category], r.floor, 'available'
      ]);
    }

    for (const g of GUESTS) {
      run('INSERT INTO guests (first_name, last_name, email, phone, nationality, vip) VALUES (?, ?, ?, ?, ?, ?)', [
        g.first_name, g.last_name, g.email, g.phone, g.nationality, g.vip
      ]);
    }

    for (const item of MENU_ITEMS) {
      run('INSERT INTO menu_items (name, description, category, price, image, dietary, featured, room_service, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        item.name, item.description, item.category, item.price, item.image, JSON.stringify(item.dietary), item.featured || 0, item.room_service ?? 1, 1, MENU_ITEMS.indexOf(item)
      ]);
    }

    for (const f of FACILITIES) {
      run('INSERT INTO facilities (slug, name, category, icon, short_description, description, image, features, hours, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        f.slug, f.name, f.category, f.icon, f.short_description, f.description, f.image, JSON.stringify(f.features), f.hours, f.sort_order, 1
      ]);
    }

    for (const e of EXPERIENCES) {
      run('INSERT INTO experiences (slug, title, description, long_description, image, price, price_label, duration, includes, category, featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        e.slug, e.title, e.description, e.long_description, e.image, e.price, e.price_label, e.duration, JSON.stringify(e.includes), e.category, e.featured, e.sort_order
      ]);
    }

    for (const s of EVENT_SPACES) {
      run('INSERT INTO event_spaces (slug, name, type, description, image, capacity_theatre, capacity_banquet, capacity_reception, area_sqm, price_from, setups, features, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        s.slug, s.name, s.type, s.description, s.image, s.capacity_theatre, s.capacity_banquet, s.capacity_reception, s.area_sqm, s.price_from, JSON.stringify(s.setups), JSON.stringify(s.features), EVENT_SPACES.indexOf(s)
      ]);
    }

    const published = addDays(1);
    for (const o of OFFERS) {
      run('INSERT INTO offers (slug, title, subtitle, description, discount_label, discount_percent, promo_code, valid_from, valid_to, conditions, image, featured, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        o.slug, o.title, o.subtitle, o.description, o.discount_label, o.discount_percent, o.promo_code, published, addDays(365), o.conditions, o.image, o.featured, 1, o.sort_order
      ]);
    }

    for (const t of TESTIMONIALS) {
      run('INSERT INTO testimonials (name, location, stay, quote, rating, featured) VALUES (?, ?, ?, ?, ?, ?)', [
        t.name, t.location, t.stay, t.quote, t.rating, 1
      ]);
    }

    for (const g of GALLERY) {
      run('INSERT INTO gallery (title, category, image, sort_order) VALUES (?, ?, ?, ?)', [
        g.title, g.category, g.image, GALLERY.indexOf(g)
      ]);
    }

    const roomRows = all('SELECT r.*, c.slug AS category_slug FROM rooms r JOIN room_categories c ON c.id = r.category_id');
    const roomIntervals = new Map();

    function roomFree(roomId, checkIn, checkOut) {
      const intervals = roomIntervals.get(roomId) || [];
      return !intervals.some((i) => i.checkIn < checkOut && i.checkOut > checkIn);
    }

    function assignRooms(categorySlug, checkIn, checkOut, count) {
      const candidates = roomRows.filter((r) => r.category_slug === categorySlug && roomFree(r.id, checkIn, checkOut));
      const chosen = candidates.slice(0, count);
      for (const room of chosen) {
        const intervals = roomIntervals.get(room.id) || [];
        intervals.push({ checkIn, checkOut });
        roomIntervals.set(room.id, intervals);
      }
      return chosen;
    }

    const bookingStart = new Date(`${addDays(-180)}T00:00:00Z`);
    BOOKING_PLAN.forEach((plan, index) => {
      const category = CATEGORIES.find((c) => c.slug === plan.category);
      const guest = GUESTS[plan.guest];
      const checkIn = addDays(plan.checkIn);
      const checkOut = addDays(plan.checkOut);
      const chosen = assignRooms(plan.category, checkIn, checkOut, plan.rooms);
      if (chosen.length < plan.rooms) return;

      const quote = calculateQuote({
        category,
        checkIn,
        checkOut,
        adults: plan.adults,
        children: plan.children,
        rooms: plan.rooms,
        breakfastPlan: plan.breakfast,
        transfer: plan.transfer,
        services: plan.services,
        promoCode: plan.promo || '',
        settings: SETTINGS
      });

      const ref = `GA-${String(2026)}${String(index + 1).padStart(3, '0')}`;
      const createdAt = createdDate(checkIn, 14 + index);
      const result = run(
        `INSERT INTO bookings
        (reference, guest_id, guest_name, email, phone, nationality, check_in, check_out, adults, children, rooms_count,
         category_id, special_requests, breakfast_plan, airport_transfer, services, room_total, extra_guest_total,
         breakfast_total, services_total, discount_total, service_charge, tax_total, total, promo_code,
         payment_method, payment_status, booking_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ref, plan.guest + 1, `${guest.first_name} ${guest.last_name}`, guest.email, guest.phone, guest.nationality,
          checkIn, checkOut, plan.adults, plan.children, plan.rooms, categoryIds[plan.category], plan.requests,
          plan.breakfast, plan.transfer, JSON.stringify(plan.services), quote.roomTotal, quote.extraGuestTotal,
          quote.breakfastTotal, quote.servicesTotal, quote.discountTotal, quote.serviceCharge, quote.taxTotal,
          quote.total, plan.promo || null, plan.method, plan.payment, plan.status, createdAt]
      );

      for (const room of chosen) {
        run('INSERT INTO booking_rooms (booking_id, room_id, category_id, rate) VALUES (?, ?, ?, ?)', [
          Number(result.lastInsertRowid), room.id, categoryIds[plan.category], category.price
        ]);
      }
    });

    // A couple of rooms are out of service for planned maintenance.
    run("UPDATE rooms SET status = 'maintenance', notes = 'Bathroom refurbishment' WHERE room_number IN ('106', '404')");

    // Reflect the current housekeeping state in the room board.
    const occupied = all("SELECT DISTINCT br.room_id FROM booking_rooms br JOIN bookings b ON b.id = br.booking_id WHERE b.booking_status = 'checked_in'");
    for (const row of occupied) {
      run("UPDATE rooms SET status = 'occupied' WHERE id = ? AND status != 'maintenance'", [row.room_id]);
    }
    const reserved = all("SELECT DISTINCT br.room_id FROM booking_rooms br JOIN bookings b ON b.id = br.booking_id WHERE b.booking_status = 'confirmed' AND b.check_in = ?", [addDays(0)]);
    for (const row of reserved) {
      run("UPDATE rooms SET status = 'reserved' WHERE id = ? AND status = 'available'", [row.room_id]);
    }

    // A small set of realistic enquiries and guest requests for the demo inbox.
    const enquiries = [
      ['event', 'Nadia Suleman', 'nadia.suleman@example.com', '+92 300 555 1122', 'Wedding reception — 400 guests', 'We are interested in the Grand Aurelia Ballroom for a wedding reception in late February. Could you share availability and a sample menu?', JSON.stringify({ venue: 'grand-aurelia-ballroom', date: addDays(95), guests: 400 })],
      ['event', 'Hassan Raza', 'hassan.raza@example.com', '+92 321 444 8899', 'Two-day leadership conference', 'Looking for a conference space for 180 delegates with breakout rooms and overnight accommodation.', JSON.stringify({ venue: 'meridian-conference-centre', date: addDays(48), guests: 180 })],
      ['contact', 'Ayesha Malik', 'ayesha.malik@example.com', '+92 333 222 4455', 'Anniversary dinner', 'I would like to arrange a surprise anniversary dinner at The Observatory. Could you call me to discuss?', JSON.stringify({})],
      ['contact', 'Michael Osei', 'michael.osei@example.com', '+233 24 555 0198', 'Accessibility enquiry', 'Our daughter uses a wheelchair. Could you confirm the accessible room has a roll-in shower and step-free access to the pool?', JSON.stringify({})],
      ['experience', 'Sana Iqbal', 'sana.iqbal@example.com', '+92 345 777 1212', 'Honeymoon Escape', 'We would like to book the Honeymoon Escape for the first week of December. Please advise on availability.', JSON.stringify({ experience: 'honeymoon-escape', date: addDays(33) })],
      ['guest-service', 'Omar Farooq', 'omar.farooq@example.com', '+971 50 123 4567', 'Airport transfer', 'Please arrange a pickup from Islamabad International at 14:20 tomorrow. Flight EK614.', JSON.stringify({ service: 'Airport transfer', room: '802', priority: 'High' })],
      ['guest-service', 'Amelia Hart', 'amelia.hart@example.com', '+44 7700 900123', 'Private dining request', 'We would love a private dinner on the terrace on Friday evening, vegetarian menu for one guest.', JSON.stringify({ service: 'Private dining', room: '1001', priority: 'Normal' })]
    ];
    for (const e of enquiries) {
      run('INSERT INTO enquiries (type, name, email, phone, subject, message, details, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        ...e, e[0] === 'guest-service' ? 'in_progress' : 'new', addDays(-Math.floor(Math.random() * 6) - 1)
      ]);
    }

    const messages = [
      ['Imran Sheikh', 'imran.sheikh@example.com', '+92 300 888 2121', 'Corporate rate enquiry', 'Could you share your corporate rates for 2027? We typically require 30 room nights per month.', 'new'],
      ['Laura Bennett', 'laura.bennett@example.com', '+44 7700 900456', 'Press visit', 'I am writing for Condé Nast Traveller. Would the hotel be available for a review visit in January?', 'read'],
      ['Bilal Ahmed', 'bilal.ahmed@example.com', '+92 321 456 7890', 'Lost item', 'I believe I left a leather notebook in the lobby on Sunday. Could you check with lost and found?', 'replied']
    ];
    for (const m of messages) {
      run('INSERT INTO contact_messages (name, email, phone, subject, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        ...m, addDays(-Math.floor(Math.random() * 8) - 1)
      ]);
    }
  });
}

export function ensureSeeded() {
  migrate();
  const count = get('SELECT COUNT(*) AS n FROM room_categories');
  if (!count || count.n === 0) {
    seedDatabase();
    return true;
  }
  return false;
}

export function resetAndSeed() {
  migrate();
  resetData();
  seedDatabase();
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  resetAndSeed();
  const stats = {
    rooms: get('SELECT COUNT(*) AS n FROM rooms').n,
    categories: get('SELECT COUNT(*) AS n FROM room_categories').n,
    guests: get('SELECT COUNT(*) AS n FROM guests').n,
    bookings: get('SELECT COUNT(*) AS n FROM bookings').n,
    menu: get('SELECT COUNT(*) AS n FROM menu_items').n,
    offers: get('SELECT COUNT(*) AS n FROM offers').n
  };
  console.log('Grand Aurelia demo data seeded:', stats);
}
