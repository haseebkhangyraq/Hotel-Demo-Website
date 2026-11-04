import { all, get, getSettings } from '../db/index.js';
import { calculateQuote, nightsBetween } from './pricing.js';

export function parseJson(value, fallback = []) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function enrichCategory(row) {
  if (!row) return row;
  return {
    ...row,
    amenities: parseJson(row.amenities, []),
    images: parseJson(row.images, [row.cover_image])
  };
}

export function getCategories() {
  return all('SELECT * FROM room_categories ORDER BY sort_order').map(enrichCategory);
}

export function getCategoryBySlug(slug) {
  return enrichCategory(get('SELECT * FROM room_categories WHERE slug = ?', [slug]));
}

export function getCategoryById(id) {
  return enrichCategory(get('SELECT * FROM room_categories WHERE id = ?', [id]));
}

export function getRoomCounts() {
  const rows = all('SELECT category_id, COUNT(*) AS total FROM rooms GROUP BY category_id');
  return Object.fromEntries(rows.map((r) => [r.category_id, r.total]));
}

export function bookedRoomIds(categoryId, checkIn, checkOut) {
  return all(
    `SELECT DISTINCT br.room_id
     FROM booking_rooms br
     JOIN bookings b ON b.id = br.booking_id
     WHERE br.category_id = ?
       AND b.booking_status != 'cancelled'
       AND b.check_in < ? AND b.check_out > ?`,
    [categoryId, checkOut, checkIn]
  ).map((r) => r.room_id);
}

export function availableRoomsForCategory(categoryId, checkIn, checkOut) {
  const inserted = bookedRoomIds(categoryId, checkIn, checkOut);
  const rooms = all("SELECT * FROM rooms WHERE category_id = ? AND status != 'maintenance' ORDER BY room_number", [categoryId]);
  return rooms.filter((r) => !inserted.includes(r.id));
}

export function availability({ checkIn, checkOut, rooms = 1, adults = 2, children = 0, settings = getSettings() }) {
  const categories = getCategories();
  const nights = nightsBetween(checkIn, checkOut);
  const validDates = nights > 0;

  return categories.map((cat) => {
    const availableRooms = validDates ? availableRoomsForCategory(cat.id, checkIn, checkOut) : [];
    const quote = calculateQuote({
      category: cat,
      checkIn,
      checkOut,
      adults,
      children,
      rooms,
      breakfastPlan: 'none',
      transfer: 'none',
      services: [],
      promoCode: '',
      settings
    });
    return {
      ...cat,
      availableRooms: availableRooms.length,
      requestedRooms: Number(rooms),
      isAvailable: validDates && availableRooms.length >= Number(rooms) && quote.errors.length === 0,
      quote,
      nights,
      fromTotal: quote.total
    };
  });
}

export function featuredCategories(limit = 6) {
  return all('SELECT * FROM room_categories WHERE featured = 1 ORDER BY sort_order LIMIT ?', [limit]).map(enrichCategory);
}

export function getFacilities() {
  return all('SELECT * FROM facilities WHERE active = 1 ORDER BY sort_order').map((f) => ({
    ...f,
    features: parseJson(f.features, [])
  }));
}

export function getMenuItems(includeInactive = false) {
  const where = includeInactive ? '' : 'WHERE active = 1';
  return all(`SELECT * FROM menu_items ${where} ORDER BY sort_order, id`).map((m) => ({
    ...m,
    dietary: parseJson(m.dietary, [])
  }));
}

export function getExperiences() {
  return all('SELECT * FROM experiences ORDER BY sort_order').map((e) => ({
    ...e,
    includes: parseJson(e.includes, [])
  }));
}

export function getEventSpaces() {
  return all('SELECT * FROM event_spaces ORDER BY sort_order').map((s) => ({
    ...s,
    setups: parseJson(s.setups, []),
    features: parseJson(s.features, [])
  }));
}

export function getOffers(onlyActive = true) {
  const where = onlyActive ? 'WHERE active = 1' : '';
  return all(`SELECT * FROM offers ${where} ORDER BY featured DESC, sort_order`).map((o) => ({ ...o }));
}

export function getTestimonials() {
  return all('SELECT * FROM testimonials WHERE featured = 1 ORDER BY id');
}

export function getGallery() {
  return all('SELECT * FROM gallery ORDER BY sort_order');
}

export function getBookingByReference(reference) {
  const booking = get('SELECT * FROM bookings WHERE reference = ?', [reference]);
  if (!booking) return null;
  const rooms = all(
    `SELECT br.*, r.room_number, r.floor, c.name AS category_name, c.slug AS category_slug, c.cover_image
     FROM booking_rooms br
     JOIN rooms r ON r.id = br.room_id
     JOIN room_categories c ON c.id = br.category_id
     WHERE br.booking_id = ?`,
    [booking.id]
  );
  const category = getCategoryById(booking.category_id);
  return {
    ...booking,
    rooms,
    category,
    services: parseJson(booking.services, [])
  };
}

export function getRoomById(id) {
  return get(
    `SELECT r.*, c.name AS category_name, c.slug AS category_slug, c.price, c.cover_image
     FROM rooms r JOIN room_categories c ON c.id = r.category_id WHERE r.id = ?`,
    [id]
  );
}

export function dashboardStats() {
  const today = new Date().toISOString().slice(0, 10);
  const roomCounts = get(`SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available,
      SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) AS occupied,
      SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) AS reserved,
      SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) AS maintenance
    FROM rooms`);

  const bookings = get(`SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN booking_status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
      SUM(CASE WHEN booking_status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN booking_status = 'checked_in' THEN 1 ELSE 0 END) AS checked_in,
      SUM(CASE WHEN booking_status = 'checked_out' THEN 1 ELSE 0 END) AS checked_out,
      SUM(CASE WHEN booking_status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
    FROM bookings`);

  const revenue = get("SELECT COALESCE(SUM(total), 0) AS revenue, COALESCE(SUM(CASE WHEN payment_status = 'pending' THEN total ELSE 0 END), 0) AS outstanding FROM bookings WHERE booking_status != 'cancelled'");
  const checkIns = get("SELECT COUNT(*) AS n FROM bookings WHERE check_in = ? AND booking_status IN ('confirmed','checked_in')", [today]);
  const checkOuts = get("SELECT COUNT(*) AS n FROM bookings WHERE check_out = ? AND booking_status IN ('confirmed','checked_in','checked_out')", [today]);
  const guests = get('SELECT COUNT(*) AS n FROM guests');
  const occupancyBase = Math.max(1, (roomCounts.total || 0) - (roomCounts.maintenance || 0));
  const occupancyRate = Math.round(((roomCounts.occupied || 0) / occupancyBase) * 1000) / 10;

  return {
    rooms: roomCounts.total || 0,
    available: roomCounts.available || 0,
    occupied: roomCounts.occupied || 0,
    reserved: roomCounts.reserved || 0,
    maintenance: roomCounts.maintenance || 0,
    bookings: bookings.total || 0,
    confirmed: bookings.confirmed || 0,
    pendingBookings: bookings.pending || 0,
    checkedIn: bookings.checked_in || 0,
    checkedOut: bookings.checked_out || 0,
    cancelled: bookings.cancelled || 0,
    revenue: revenue.revenue || 0,
    outstanding: revenue.outstanding || 0,
    todayCheckIns: checkIns.n || 0,
    todayCheckOuts: checkOuts.n || 0,
    guests: guests.n || 0,
    occupancyRate,
    today
  };
}

export function monthlyRevenue() {
  const rows = all(`SELECT substr(created_at, 1, 7) AS month, COUNT(*) AS bookings, COALESCE(SUM(total), 0) AS revenue
    FROM bookings WHERE booking_status != 'cancelled'
    GROUP BY month ORDER BY month`);
  return rows;
}

export function categoryBookingMix() {
  return all(`SELECT c.name, COUNT(b.id) AS bookings, COALESCE(SUM(b.total),0) AS revenue
    FROM room_categories c
    LEFT JOIN bookings b ON b.category_id = c.id AND b.booking_status != 'cancelled'
    GROUP BY c.id ORDER BY bookings DESC`);
}

export function pickDefaultDates() {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  const end = new Date(start);
  end.setDate(end.getDate() + 3);
  return {
    checkIn: start.toISOString().slice(0, 10),
    checkOut: end.toISOString().slice(0, 10)
  };
}

export function dateLabel(value) {
  if (!value) return '';
  const d = new Date(`${value}T00:00:00`);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function shortDate(value) {
  if (!value) return '';
  const d = new Date(`${value}T00:00:00`);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}
