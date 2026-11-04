import express from 'express';
import session from 'express-session';
import compression from 'compression';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureSeeded } from './src/db/seed.js';
import { getSettings } from './src/db/index.js';
import { formatPKR } from './src/lib/pricing.js';
import { dateLabel, shortDate } from './src/lib/hotel.js';
import publicRoutes from './src/routes/public.js';
import adminRoutes from './src/routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const seeded = ensureSeeded();
if (seeded) console.log('✓ Demo database created and populated');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');

app.use(compression());
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '7d' }));

app.use('/vendor/gsap', express.static(path.join(__dirname, 'node_modules/gsap/dist')));
app.use('/vendor/swiper', express.static(path.join(__dirname, 'node_modules/swiper')));
app.use('/vendor/lucide', express.static(path.join(__dirname, 'node_modules/lucide/dist/umd')));
app.use('/vendor/chart', express.static(path.join(__dirname, 'node_modules/chart.js/dist')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'grand-aurelia-demo-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 8 }
}));

app.use((req, res, next) => {
  const settings = getSettings();
  res.locals.settings = settings;
  res.locals.currentPath = req.path;
  res.locals.money = formatPKR;
  res.locals.dateLabel = dateLabel;
  res.locals.shortDate = shortDate;
  res.locals.flash = req.session.flash || null;
  if (req.session.flash) delete req.session.flash;
  res.locals.query = req.query;
  res.locals.title = 'Grand Aurelia Hotel & Resort';
  res.locals.metaDescription = settings.tagline || 'An extraordinary stay in the heart of Islamabad.';
  next();
});

app.use('/admin', adminRoutes);
app.use('/', publicRoutes);

app.use((req, res) => {
  res.status(404).render('404', {
    page: '404',
    bodyClass: 'page-404',
    title: 'Page not found — Grand Aurelia'
  });
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  res.status(500).render('500', {
    page: '500',
    bodyClass: 'page-500',
    title: 'Something went wrong — Grand Aurelia'
  });
});

app.listen(PORT, () => {
  console.log('\n  GRAND AURELIA HOTEL & RESORT');
  console.log(`  Website  →  http://localhost:${PORT}`);
  console.log(`  Admin    →  http://localhost:${PORT}/admin`);
  console.log('  Demo login: admin@grandaurelia.com / Aurelia@2026\n');
});
