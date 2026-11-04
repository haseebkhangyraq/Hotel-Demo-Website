PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS room_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  size_sqm INTEGER NOT NULL,
  max_adults INTEGER NOT NULL,
  max_children INTEGER NOT NULL,
  bed_type TEXT NOT NULL,
  bathroom TEXT NOT NULL,
  view TEXT NOT NULL,
  price INTEGER NOT NULL,
  amenities TEXT NOT NULL,
  images TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  featured INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_number TEXT UNIQUE NOT NULL,
  category_id INTEGER NOT NULL REFERENCES room_categories(id) ON DELETE CASCADE,
  floor INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  nationality TEXT,
  vip INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT UNIQUE NOT NULL,
  guest_id INTEGER REFERENCES guests(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  nationality TEXT,
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  adults INTEGER NOT NULL,
  children INTEGER DEFAULT 0,
  rooms_count INTEGER NOT NULL,
  category_id INTEGER NOT NULL REFERENCES room_categories(id),
  special_requests TEXT,
  breakfast_plan TEXT DEFAULT 'none',
  airport_transfer TEXT DEFAULT 'none',
  services TEXT DEFAULT '[]',
  room_total INTEGER NOT NULL,
  extra_guest_total INTEGER DEFAULT 0,
  breakfast_total INTEGER DEFAULT 0,
  services_total INTEGER DEFAULT 0,
  discount_total INTEGER DEFAULT 0,
  service_charge INTEGER DEFAULT 0,
  tax_total INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  promo_code TEXT,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  booking_status TEXT DEFAULT 'confirmed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking_rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  room_id INTEGER NOT NULL REFERENCES rooms(id),
  category_id INTEGER NOT NULL REFERENCES room_categories(id),
  rate INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS offers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_label TEXT NOT NULL,
  discount_percent INTEGER DEFAULT 0,
  promo_code TEXT,
  valid_from TEXT,
  valid_to TEXT,
  conditions TEXT,
  image TEXT NOT NULL,
  featured INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS facilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT DEFAULT 'sparkles',
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  features TEXT DEFAULT '[]',
  hours TEXT,
  sort_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS experiences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  image TEXT NOT NULL,
  price INTEGER NOT NULL,
  price_label TEXT DEFAULT 'per couple',
  duration TEXT NOT NULL,
  includes TEXT DEFAULT '[]',
  category TEXT NOT NULL,
  featured INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS event_spaces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  capacity_theatre INTEGER,
  capacity_banquet INTEGER,
  capacity_reception INTEGER,
  area_sqm INTEGER,
  price_from INTEGER,
  setups TEXT DEFAULT '[]',
  features TEXT DEFAULT '[]',
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  image TEXT NOT NULL,
  dietary TEXT DEFAULT '[]',
  featured INTEGER DEFAULT 0,
  room_service INTEGER DEFAULT 1,
  active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  stay TEXT,
  quote TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  featured INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  details TEXT DEFAULT '{}',
  status TEXT DEFAULT 'new',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_booking_rooms_booking ON booking_rooms(booking_id);
CREATE INDEX IF NOT EXISTS idx_rooms_category ON rooms(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category);
