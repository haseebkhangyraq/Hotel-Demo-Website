export const EXTRA_SERVICES = [
  {
    id: 'airport_pickup',
    name: 'Private airport pickup',
    description: 'Chauffeured luxury sedan from Islamabad International Airport.',
    price: 6500
  },
  {
    id: 'airport_dropoff',
    name: 'Private airport drop-off',
    description: 'A calm, chauffeured transfer for your journey home.',
    price: 6500
  },
  {
    id: 'spa_credit',
    name: 'Spa credit for two',
    description: 'PKR 10,000 credit towards any Aurelia Spa ritual.',
    price: 8000
  },
  {
    id: 'late_checkout',
    name: 'Guaranteed late check-out',
    description: 'Relax until 16:00 on your departure day.',
    price: 4500
  },
  {
    id: 'celebration',
    name: 'Celebration in your room',
    description: 'Seasonal flowers, artisan chocolates and chilled sparkling juice.',
    price: 9500
  },
  {
    id: 'valet',
    name: 'Valet parking',
    description: 'Secure, covered valet parking for the duration of your stay.',
    price: 2500
  }
];

export const BREAKFAST_PLANS = {
  none: { label: 'Room only', price: 0, description: 'No dining plan included.' },
  breakfast: { label: 'Breakfast', price: 2200, description: 'Daily breakfast at Noor, our all-day dining room.' },
  half_board: { label: 'Half board', price: 4800, description: 'Daily breakfast and dinner at any signature restaurant.' },
  full_board: { label: 'Full board', price: 7500, description: 'Breakfast, lunch and dinner, including in-room dining.' }
};

export const TRANSFER_OPTIONS = {
  none: { label: 'No transfer required', price: 0 },
  pickup: { label: 'Airport pickup', price: 6500 },
  roundtrip: { label: 'Return airport transfer', price: 12000 }
};

export const PROMO_CODES = {
  WEEKEND10: { percent: 10, minNights: 1, label: 'Weekend Escape — 10% off' },
  STAYCATION15: { percent: 15, minNights: 2, label: 'Luxury Staycation — 15% off' },
  HONEYMOON12: { percent: 12, minNights: 2, label: 'Honeymoon — 12% off' },
  FAMILY10: { percent: 10, minNights: 2, label: 'Family Stay — 10% off' },
  BUSINESS8: { percent: 8, minNights: 1, label: 'Business Traveller — 8% off' },
  EARLY15: { percent: 15, minNights: 3, label: 'Early Booking — 15% off' },
  EXTENDED20: { percent: 20, minNights: 5, label: 'Extended Stay — 20% off' },
  SUITE25: { percent: 25, minNights: 3, suiteOnly: true, label: 'Suite Escape — 25% off' },
  AURELIA10: { percent: 10, minNights: 1, label: 'Welcome to Aurelia — 10% off' }
};

export const suiteSlugs = ['junior-suite', 'executive-suite', 'presidential-suite', 'penthouse-suite'];

export function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(`${checkIn}T00:00:00Z`);
  const b = new Date(`${checkOut}T00:00:00Z`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  return Math.round((b - a) / 86400000);
}

export function calculateQuote({
  category,
  checkIn,
  checkOut,
  adults = 2,
  children = 0,
  rooms = 1,
  breakfastPlan = 'none',
  transfer = 'none',
  services = [],
  promoCode = '',
  settings = {}
}) {
  const nights = nightsBetween(checkIn, checkOut);
  const roomsCount = Math.max(1, Number(rooms) || 1);
  const adultCount = Math.max(1, Number(adults) || 1);
  const childCount = Math.max(0, Number(children) || 0);
  const rate = Number(category?.price || 0);

  const errors = [];
  if (!category) errors.push('Please choose a room or suite.');
  if (nights <= 0) errors.push('Check-out must be after check-in.');
  if (nights > 30) errors.push('For stays longer than 30 nights, please contact our reservations team.');
  if (category && adultCount > category.max_adults * roomsCount) {
    errors.push(`${category.name} accommodates a maximum of ${category.max_adults} adults per room.`);
  }
  if (category && childCount > category.max_children * roomsCount) {
    errors.push(`${category.name} accommodates a maximum of ${category.max_children} children per room.`);
  }

  const roomTotal = rate * Math.max(0, nights) * roomsCount;
  const includedAdults = roomsCount * 2;
  const extraAdults = Math.max(0, adultCount - includedAdults);
  const extraChildren = Math.max(0, childCount - roomsCount * 2);
  const extraAdultCharge = Number(settings.extra_adult_charge || 3500);
  const extraChildCharge = Number(settings.extra_child_charge || 1500);
  const extraGuestTotal = Math.max(0, nights) * (extraAdults * extraAdultCharge + extraChildren * extraChildCharge);

  const plan = BREAKFAST_PLANS[breakfastPlan] || BREAKFAST_PLANS.none;
  const breakfastTotal = Math.max(0, nights) * (adultCount * plan.price + childCount * plan.price * 0.5);

  const transferOption = TRANSFER_OPTIONS[transfer] || TRANSFER_OPTIONS.none;
  const selectedServices = EXTRA_SERVICES.filter((s) => Array.isArray(services) && services.includes(s.id));
  const servicesTotal = selectedServices.reduce((sum, s) => sum + s.price, 0) + transferOption.price;

  const subtotal = roomTotal + extraGuestTotal + breakfastTotal + servicesTotal;
  const serviceRate = Number(settings.service_charge_rate || 5);
  const taxRate = Number(settings.tax_rate || 16);

  let promo = null;
  const code = String(promoCode || '').trim().toUpperCase();
  if (code) {
    const found = PROMO_CODES[code];
    const suiteEligible = !found?.suiteOnly || suiteSlugs.includes(category?.slug);
    if (!found) {
      errors.push('That promotional code is not recognised.');
    } else if (nights < found.minNights) {
      errors.push(`${code} requires a minimum stay of ${found.minNights} nights.`);
    } else if (!suiteEligible) {
      errors.push(`${code} is valid on suite stays only.`);
    } else {
      promo = { code, ...found };
    }
  }

  const discountTotal = promo ? Math.round((roomTotal + extraGuestTotal + breakfastTotal) * (promo.percent / 100)) : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountTotal);
  const serviceCharge = Math.round(discountedSubtotal * (serviceRate / 100));
  const taxTotal = Math.round((discountedSubtotal + serviceCharge) * (taxRate / 100));
  const total = discountedSubtotal + serviceCharge + taxTotal;

  return {
    nights: Math.max(0, nights),
    rooms: roomsCount,
    rate,
    roomTotal,
    extraGuestTotal,
    breakfastTotal,
    servicesTotal,
    discountTotal,
    serviceCharge,
    taxTotal,
    total,
    subtotal,
    promo,
    errors,
    includedAdults,
    extraAdults,
    extraChildren,
    breakfastPlan: plan,
    transfer: transferOption,
    selectedServices,
    adults: adultCount,
    children: childCount
  };
}

export function formatPKR(value) {
  return `PKR ${Math.round(Number(value) || 0).toLocaleString('en-PK')}`;
}
