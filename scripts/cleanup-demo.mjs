/* One-off cleanup: removes demo bookings created while testing the booking engine.
   Run with:  node scripts/cleanup-demo.mjs   */
import { all, run } from '../src/db/index.js';

const rows = all("SELECT id, reference, guest_name, email FROM bookings");
const targets = rows.filter(
  (r) => !r.reference.startsWith('GA-2026') && (/@example\.com$/i.test(r.email) || /test/i.test(r.guest_name))
);

for (const row of targets) {
  try { run('DELETE FROM payments WHERE booking_id=?', [row.id]); } catch { /* payments table may not exist */ }
  run('DELETE FROM bookings WHERE id=?', [row.id]);
}

const [{ c }] = all('SELECT COUNT(*) AS c FROM bookings');
console.log(`Removed ${targets.length} test bookings. ${c} bookings remaining.`);
