import { get, run, all, transaction, getSettings } from '../db/index.js';
import { calculateQuote, nightsBetween, EXTRA_SERVICES, TRANSFER_OPTIONS, BREAKFAST_PLANS } from './pricing.js';
import { availableRoomsForCategory, getCategoryBySlug, getCategoryById, parseJson } from './hotel.js';
import { reference } from './auth.js';

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
}

function validPhone(phone) {
  return String(phone || '').replace(/[^\d]/g, '').length >= 7;
}

export function validateBookingInput(body) {
  const errors = {};
  const checkIn = String(body.checkIn || '').slice(0, 10);
  const checkOut = String(body.checkOut || '').slice(0, 10);
  const nights = nightsBetween(checkIn, checkOut);

  if (!body.firstName || String(body.firstName).trim().length < 2) errors.firstName = 'Please enter your first name.';
  if (!body.lastName || String(body.lastName).trim().length < 2) errors.lastName = 'Please enter your last name.';
  if (!validEmail(body.email)) errors.email = 'Please enter a valid email address.';
  if (!validPhone(body.phone)) errors.phone = 'Please enter a valid phone number.';
  if (!body.nationality || String(body.nationality).trim().length < 2) errors.nationality = 'Please enter your nationality.';
  if (!checkIn) errors.checkIn = 'Please choose an arrival date.';
  if (!checkOut) errors.checkOut = 'Please choose a departure date.';
  if (nights <= 0) errors.checkOut = 'Departure must be after arrival.';
  if (nights > 30) errors.checkOut = 'For stays over 30 nights, please contact reservations.';

  const checkInDate = new Date(`${checkIn}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (checkInDate < today) errors.checkIn = 'Arrival cannot be in the past.';

  const adults = Number(body.adults);
  const children = Number(body.children);
  const rooms = Number(body.rooms);
  if (!Number.isInteger(adults) || adults < 1 || adults > 20) errors.adults = 'Please select between 1 and 20 adults.';
  if (!Number.isInteger(children) || children < 0 || children > 12) errors.children = 'Please select between 0 and 12 children.';
  if (!Number.isInteger(rooms) || rooms < 1 || rooms > 5) errors.rooms = 'Please select between 1 and 5 rooms.';

  if (!['cash_at_hotel', 'demo_card', 'pay_at_checkout'].includes(body.paymentMethod)) {
    errors.paymentMethod = 'Please select a payment method.';
  }
  if (body.paymentMethod === 'demo_card') {
    const digits = String(body.cardNumber || '').replace(/\s/g, '');
    if (!/^\d{16}$/.test(digits)) errors.cardNumber = 'Enter the 16-digit demo card number.';
    if (!/^\d{2}\s?\/\s?\d{2}$/.test(String(body.cardExpiry || ''))) errors.cardExpiry = 'Use MM/YY format.';
    if (!/^\d{3,4}$/.test(String(body.cardCvc || ''))) errors.cardCvc = 'Enter the 3 or 4 digit CVV.';
  }

  return { errors, checkIn, checkOut, nights, adults, children, rooms };
}

export function createBooking(body) {
  const input = validateBookingInput(body);
  if (Object.keys(input.errors).length) {
    return { ok: false, status: 400, errors: input.errors, message: 'Please check the highlighted fields.' };
  }

  const category = body.categoryId
    ? getCategoryById(Number(body.categoryId))
    : getCategoryBySlug(body.categorySlug);
  if (!category) {
    return { ok: false, status: 400, errors: { category: 'Please select a room or suite.' }, message: 'Please select a room or suite.' };
  }

  const settings = getSettings();
  const serviceIds = Array.isArray(body.services) ? body.services.filter((id) => EXTRA_SERVICES.some((s) => s.id === id)) : [];
  const breakfastPlan = BREAKFAST_PLANS[body.breakfastPlan] ? body.breakfastPlan : 'none';
  const transfer = TRANSFER_OPTIONS[body.transfer] ? body.transfer : 'none';

  const quote = calculateQuote({
    category,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: input.adults,
    children: input.children,
    rooms: input.rooms,
    breakfastPlan,
    transfer,
    services: serviceIds,
    promoCode: body.promoCode || '',
    settings
  });

  if (quote.errors.length) {
    return { ok: false, status: 400, errors: { category: quote.errors[0] }, message: quote.errors[0] };
  }

  const available = availableRoomsForCategory(category.id, input.checkIn, input.checkOut);
  if (available.length < input.rooms) {
    return {
      ok: false,
      status: 409,
      errors: { category: `Only ${available.length} ${category.name}${available.length === 1 ? '' : 's'} remain for these dates.` },
      message: `We are sorry — only ${available.length} room${available.length === 1 ? '' : 's'} of this category remain for your dates.`
    };
  }

  const confirmed = body.paymentMethod === 'demo_card';
  const guestName = `${String(body.firstName).trim()} ${String(body.lastName).trim()}`;
  const ref = reference();

  try {
    const result = transaction(() => {
      // Re-check inside the transaction to prevent double-booking under concurrency.
      const stillAvailable = availableRoomsForCategory(category.id, input.checkIn, input.checkOut);
      if (stillAvailable.length < input.rooms) {
        throw new Error('SOLD_OUT');
      }

      let guest = get('SELECT * FROM guests WHERE lower(email) = lower(?)', [String(body.email).trim()]);
      let guestId;
      if (guest) {
        guestId = guest.id;
        run('UPDATE guests SET first_name = ?, last_name = ?, phone = ?, nationality = ? WHERE id = ?', [
          String(body.firstName).trim(), String(body.lastName).trim(), String(body.phone).trim(), String(body.nationality).trim(), guest.id
        ]);
      } else {
        const guestResult = run('INSERT INTO guests (first_name, last_name, email, phone, nationality, vip) VALUES (?, ?, ?, ?, ?, 0)', [
          String(body.firstName).trim(), String(body.lastName).trim(), String(body.email).trim(), String(body.phone).trim(), String(body.nationality).trim()
        ]);
        guestId = Number(guestResult.lastInsertRowid);
      }

      const bookingResult = run(
        `INSERT INTO bookings
        (reference, guest_id, guest_name, email, phone, nationality, check_in, check_out, adults, children, rooms_count,
         category_id, special_requests, breakfast_plan, airport_transfer, services, room_total, extra_guest_total,
         breakfast_total, services_total, discount_total, service_charge, tax_total, total, promo_code,
         payment_method, payment_status, booking_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ref, guestId, guestName, String(body.email).trim(), String(body.phone).trim(), String(body.nationality).trim(),
          input.checkIn, input.checkOut, input.adults, input.children, input.rooms, category.id,
          String(body.specialRequests || '').slice(0, 1000), breakfastPlan, transfer, JSON.stringify(serviceIds),
          quote.roomTotal, quote.extraGuestTotal, quote.breakfastTotal, quote.servicesTotal, quote.discountTotal,
          quote.serviceCharge, quote.taxTotal, quote.total, quote.promo?.code || null,
          body.paymentMethod, confirmed ? 'paid' : 'pending', 'confirmed']
      );
      const bookingId = Number(bookingResult.lastInsertRowid);

      const assigned = stillAvailable.slice(0, input.rooms);
      for (const room of assigned) {
        run('INSERT INTO booking_rooms (booking_id, room_id, category_id, rate) VALUES (?, ?, ?, ?)', [
          bookingId, room.id, category.id, category.price
        ]);
      }

      const today = new Date().toISOString().slice(0, 10);
      if (input.checkIn <= today) {
        for (const room of assigned) {
          run("UPDATE rooms SET status = 'reserved' WHERE id = ? AND status = 'available'", [room.id]);
        }
      }

      return { id: bookingId, reference: ref, roomNumbers: assigned.map((r) => r.room_number) };
    });

    return {
      ok: true,
      reference: result.reference,
      roomNumbers: result.roomNumbers,
      quote,
      redirect: `/booking/confirmation/${result.reference}`
    };
  } catch (error) {
    if (error.message === 'SOLD_OUT') {
      return {
        ok: false,
        status: 409,
        errors: { category: 'Those rooms were just reserved by another guest.' },
        message: 'Those rooms were just reserved by another guest. Please choose another room or dates.'
      };
    }
    throw error;
  }
}

export function getGuestBookingHistory(email) {
  return all('SELECT * FROM bookings WHERE lower(email) = lower(?) ORDER BY check_in DESC', [email]);
}

export function bookingServices(booking) {
  const ids = parseJson(booking.services, []);
  return EXTRA_SERVICES.filter((s) => ids.includes(s.id));
}
