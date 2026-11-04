# GRAND AURELIA HOTEL & RESORT

A premium hotel website and interactive reservation demo for the fictional five-star **Grand Aurelia Hotel & Resort**, Islamabad — a warmer, quieter kind of luxury above the Margalla Hills.

The project is a self-contained Node.js application: server-rendered pages, a SQLite database that seeds itself on first run, a working booking engine, a demo AI concierge, and a full admin dashboard that reads and writes the same database.

---

## 1. Quick start

```bash
npm install       # install dependencies (no native modules required)
npm run dev       # start with watch mode at http://localhost:3000
```

- **Website:** <http://localhost:3000>
- **Admin dashboard:** <http://localhost:3000/admin>

The SQLite database (`data/aurelia.db`) is created and seeded automatically the first time the server starts. If it does not exist or is empty, `ensureSeeded()` runs the schema and fills it with demo data.

Additional scripts:

```bash
npm start             # start without watch mode
npm run seed          # drop and re-seed the demo database
node scripts/cleanup-demo.mjs   # remove test bookings made while playing with the flow
```

> **Node version:** requires Node.js 22+ (built on 24). The database uses Node's built-in `node:sqlite` (`DatabaseSync`) — no native module installation.
> **No external services:** fonts load from Google Fonts; every image is served locally from `public/images`.

## 2. Demo credentials

| Area | Email | Password |
| --- | --- | --- |
| Admin | `admin@grandaurelia.com` | `Aurelia@2026` |

Guest-facing flows (booking, menus, forms, concierge) need no login. Everything is a demonstration: no real payment, no tracking, no real guest data.

## 3. What is inside

### Public website
- **Homepage** — cinematic hero with availability bar, hotel highlights, welcome, featured rooms slider (Swiper), experiences mosaic, facilities, dining preview, offers, wellness, events, testimonials, gallery, map/location, contact dark block, footer journal form.
- **Rooms** — 11 categories with live availability badges, filters (category, party size, view, sort), and full detail pages with galleries, amenities, related rooms and a mini enquiry form.
- **Booking engine** — 4-step reservation flow:
  1. Dates & guests with server-side availability
  2. Room selection with stock counts
  3. Extras — breakfast plans, airport transfers, celebratory extras
  4. Details & demo payment (card fields validated client-side, cash or pay-at-checkout options)
- **Confirmation page** — printable summary with booking reference, pricing breakdown and arrival guide, persisted to SQLite.
- **Dining** — 30-dish menu with category filters, live search, dietary labels (vegan, gluten-free, halal…) and a full sample menu download (`.txt`).
- **Facilities** — 10 facility collections with hours, feature lists and child attractions.
- **Experiences** — curated city/adventure/heritage experiences with capacity-aware enquiry modals.
- **Events** — 5 event spaces with capacity tables, package cards and an event enquiry form.
- **Offers** — 8 active packages with copyable promo codes that work in the booking engine.
- **Gallery** — filterable masonry grid with a keyboard-friendly lightbox.
- **Guest services** — express check-in / check-out demos, service request modals, all writing to the admin inbox.
- **About / Privacy / Terms / Contact** — all content pages complete.
- **Aurelia AI concierge** — floating assistant with suggested prompts, typing animation and clearly labelled *demo* responses (`/api/concierge` returns real hotel data; wiring a live LLM later only requires swapping the responder).

### Admin dashboard (`/admin`)
- Chart.js overview — 6-month revenue & reservations combo chart plus room-mix doughnut.
- Reservations — searchable list, detail page with arrival guide, status actions (confirm, check in, check out, cancel), payment status toggles.
- Rooms board — 40 rooms with inline status control, add/edit modals, room detail with upcoming reservations.
- Categories, guests, offers, facilities, dining menu — full CRUD-style edit forms.
- Enquiries & messages inbox — status management for guest-service requests, event/experience enquiries, newsletter sign-ups and contact messages.
- Settings — hotel brand/contact values, tax and service-charge rates, check-in/out times, gallery hero, plus a self-service password change.

## 4. Booking engine rules

Currency is **PKR**, seeded values are realistic for a five-star Islamabad hotel. The pricing model (`src/lib/pricing.js`):

- 5% service charge on the discounted subtotal
- 16% sales tax on subtotal + service charge
- Extra adult **PKR 3,500 / night**, extra child **PKR 1,500 / night**
- Breakfast plans — Continental **2,200** · Gourmet **4,800** · Full board **7,500**
- Airport transfers — arrival **6,500**, round trip **12,000**
- Promo codes mapped to the offers (e.g. `WEEKEND10`, `AURELIA10`) with minimum-stay rules surfaced as friendly errors
- Double-booking protection — a category cannot oversell its available-room stock for overlapping dates

Booking API payloads use camelCase keys: `checkIn`, `checkOut`, `adults`, `children`, `rooms`, `categorySlug`, `breakfastPlan`, `transfer`, `services[]`, `promoCode`, contact fields and payment fields. Payments are simulated: `demo_card` marks the booking `paid`, other methods stay `pending`.

## 5. Project structure

```
├── server.js                 Express app, session, static/vendor serving, errors
├── src/
│   ├── db/
│   │   ├── index.js          node:sqlite helpers (all/get/run) + readSettings
│   │   ├── schema.sql        Tables: settings, categories, rooms, guests, bookings,
│   │   │                     payments, enquiries, contact_messages, offers,
│   │   │                     facilities, experiences, menu_items, gallery_items
│   │   ├── seed-data.js      Realistic seed content (categories, rooms, menu, offers…)
│   │   └── seed.js           ensureSeeded() + reset logic
│   ├── lib/
│   │   ├── pricing.js        quote maths, promo codes, PKR formatting
│   │   ├── bookings.js       validation + booking creation
│   │   ├── hotel.js          hotel queries, stats, date labels
│   │   └── auth.js           scrypt password hashing + demo credentials
│   └── routes/
│       ├── public.js         Every public page + public JSON APIs
│       └── admin.js          Admin pages, actions, chart payload
├── views/
│   ├── partials/             head / nav / footer (opens & closes <main>)
│   ├── index.ejs … 500.ejs   Public pages (EJS)
│   └── admin/                Admin layout + CRUD templates
├── public/
│   ├── css/
│   │   ├── main.css          Tokens, chrome, forms, modals, concierge
│   │   ├── home.css          Homepage section layouts
│   │   ├── pages.css         Inner pages, booking, gallery, print styles
│   │   ├── responsive.css    Public-site breakpoints (1400→400px)
│   │   └── admin.css         Admin design system + breakpoints
│   ├── js/
│   │   ├── main.js           Scroll reveals, sliders, menus, modals, AJAX forms, concierge
│   │   ├── booking.js        Reservation flow (availability → quote → payment)
│   │   ├── confirmation.js   Print + icon refresh
│   │   ├── menu.js           Dining filters, search, dish modal
│   │   ├── admin.js          Sidebar, flash, confirms, toggles
│   │   └── admin-dashboard.js Chart.js dashboards
│   └── images/               117 locally stored Unsplash photos (~28 MB)
├── data/                     SQLite database (created at runtime)
└── scripts/                  fetch-images.mjs, cleanup-demo.mjs
```

Vendor libraries (GSAP, Swiper, Lucide, Chart.js) are installed with npm and served from `/vendor/…` — nothing is loaded from a CDN at runtime.

## 6. Public API reference

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/availability?checkin&checkout&adults&children&rooms` | Availability per category for dates |
| POST | `/api/quote` | Live pricing for a selection |
| POST | `/api/bookings` | Create reservation, returns reference |
| POST | `/api/enquiries` | Event/experience enquiries |
| POST | `/api/contact` | Contact form |
| POST | `/api/guest-services` | Express check-in/out & service requests |
| POST | `/api/newsletter` | Journal subscription |
| GET | `/api/concierge` | Structured hotel data for the demo assistant |

## 7. Design system

- **Palette** — warm ivory `#F8F5EF`, champagne gold `#C5A46D`, midnight navy `#14212B`, charcoal `#252525`, white.
- **Type** — Playfair Display & Cormorant Garamond for display type; Inter & Manrope for body and interface copy (Google Fonts).
- **Identity** — the Aurelia "A" monogram is a hand-drawn SVG used in the header, preloader, concierge and admin login.
- **Motion** — GSAP + ScrollTrigger reveals, Swiper sliders, hover micro-interactions; the `js-motion` class is applied only when the visitor has not requested reduced motion, and CSS honours `prefers-reduced-motion` as well.
- **Components** — glassmorphic booking bar, editorial section headings with `em` accents, hairline dividers, quiet gold accents — no neon glows or cheap gradients.

## 8. Troubleshooting

**Port 3000 is busy** — set another port: `set PORT=3010 && npm run dev` (PowerShell: `$env:PORT=3010; npm run dev`), then visit that port.

**Database looks empty or corrupted** — delete `data/aurelia.db` (or run `npm run seed`) and restart the server; it re-seeds itself in under a second.

**Vendor assets 404** — run `npm install` again; the `/vendor/…` routes map straight into `node_modules`.

**Bad image paths** — every image ships in `public/images`; if anything is missing, re-run `node scripts/fetch-images.mjs` (internet required) or remove the file reference.

**Admin cannot log in** — use `admin@grandaurelia.com` / `Aurelia@2026`. Sessions are in-memory; a server restart signs you out.

**Booking flow error toasts** — check the browser console; the flow depends on `/api/…` endpoints which require the database to exist.

**Browser cache during development** — static styles/scripts are version-bumped with `?v=` tags; if you edit assets and do not see changes, hard-refresh (Ctrl+F5).

## 9. Notes on the demo

Every call-to-action works: buttons submit validated forms, modals open, promo codes discount, the AI answers within its prepared dataset, and the admin edits live rows. No section is a placeholder — but **this is a demonstration**, clearly labelled on the booking page, the admin login, the concierge and the footer. No real payments, no personal data outside your own local database.

© 2026 Grand Aurelia Hotel & Resort — fictional brand, built for demonstration.
