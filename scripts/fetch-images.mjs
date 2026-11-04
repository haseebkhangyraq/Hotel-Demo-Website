import fs from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve('public/images');
await fs.mkdir(OUT, { recursive: true });

const img = (id, w = 1400) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=78`;

const manifest = {
  'hero-main.jpg': img('1566073771259-6a8506099945', 2200),
  'hero-dusk.jpg': img('1564501049412-61c2a3083791', 2200),
  'hero-pool.jpg': img('1520250497591-112f2f40a3f4', 2000),
  'resort-01.jpg': img('1542314831-068cd1dbfeeb', 1800),
  'resort-02.jpg': img('1571003123894-1f0594d2b5d9', 1600),
  'resort-03.jpg': img('1584132967334-10e028bd69f7', 1600),
  'resort-04.jpg': img('1564501049412-61c2a3083791', 1600),

  'room-01.jpg': img('1551882547-ff40c63fe5fa'),
  'room-02.jpg': img('1582719478250-c89cae4dc85b'),
  'room-03.jpg': img('1590490360182-c33d57733427'),
  'room-04.jpg': img('1611892440504-42a792e24d32'),
  'room-05.jpg': img('1578683010236-d716f9a3f461'),
  'room-06.jpg': img('1596394516093-501ba68a0ba6'),
  'room-07.jpg': img('1595576508898-0ad5c879a061'),
  'room-08.jpg': img('1631049307264-da0ec9d70304'),
  'room-09.jpg': img('1615460549969-36fa19521a4f'),
  'room-10.jpg': img('1566665797739-1674de7a421a'),
  'room-11.jpg': img('1560448204-e02f11c3d0e2'),
  'room-12.jpg': img('1560185007-cde436f6a4d0'),
  'room-13.jpg': img('1615874959474-d609969a20ed'),
  'room-14.jpg': img('1600607687939-ce8a6c25118c'),
  'room-15.jpg': img('1600566753086-00f18fb6b3ea'),
  'room-16.jpg': img('1616486338812-3dadae4b4ace'),
  'room-17.jpg': img('1618221195710-dd6b41faaea6'),
  'room-18.jpg': img('1616594039964-ae9021a400a0'),
  'bath-01.jpg': img('1618773928121-c32242e63f39'),
  'bath-02.jpg': img('1620626011761-996317b8d101'),
  'bath-03.jpg': img('1552321554-5fefe8c9ef14'),
  'bath-04.jpg': img('1584622650111-993a426fbf0a'),

  'pool-01.jpg': img('1520250497591-112f2f40a3f4'),
  'pool-02.jpg': img('1540541338287-41700207dee6'),
  'pool-03.jpg': img('1573843981267-be1999ff37cd'),
  'pool-04.jpg': img('1584132967334-10e028bd69f7'),
  'pool-05.jpg': img('1572331165267-854da2b10ccc'),
  'pool-06.jpg': img('1613977257363-707ba9348227'),

  'spa-01.jpg': img('1540555700478-4be289fbecef'),
  'spa-02.jpg': img('1544161515-4ab6ce6db874'),
  'spa-03.jpg': img('1570172619644-dfd03ed5d881'),
  'spa-04.jpg': img('1600334089648-b0d9d3028eb2'),

  'gym-01.jpg': img('1534438327276-14e5300c3a48'),
  'gym-02.jpg': img('1571902943202-507ec2618e8f'),
  'gym-03.jpg': img('1540497077202-7c8a3999166f'),

  'dining-01.jpg': img('1517248135467-4c7edcad34c4'),
  'dining-02.jpg': img('1552566626-52f8b828add9'),
  'dining-03.jpg': img('1559339352-11d035aa65de'),
  'dining-04.jpg': img('1550966871-3ed3cdb5ed0c'),
  'dining-05.jpg': img('1424847651672-bf20a4b0982b'),
  'dining-06.jpg': img('1466978913421-dad2ebd01d17'),
  'dining-07.jpg': img('1481833761820-0509d3217039'),
  'bar-01.jpg': img('1514933651103-005eec06c04b'),
  'bar-02.jpg': img('1470337458703-46ad1756a187'),

  'food-01.jpg': img('1414235077428-338989a2e8c0', 1000),
  'food-02.jpg': img('1533089860892-a7c6f0a88666', 1000),
  'food-03.jpg': img('1567620905732-2d1ec7ab7445', 1000),
  'food-04.jpg': img('1608039829572-78524f79c4c7', 1000),
  'food-05.jpg': img('1555507036-ab1f4038808a', 1000),
  'food-06.jpg': img('1547592166-23ac45744acd', 1000),
  'food-07.jpg': img('1476718406336-bb5a9690ee2a', 1000),
  'food-08.jpg': img('1546069901-ba9599a7e63c', 1000),
  'food-09.jpg': img('1550304943-4f24f54ddde9', 1000),
  'food-10.jpg': img('1544025162-d76694265947', 1000),
  'food-11.jpg': img('1568901346375-23c9450c58cd', 1000),
  'food-12.jpg': img('1565299624946-b28f40a0ae38', 1000),
  'food-13.jpg': img('1563379926898-05f4575a45d8', 1000),
  'food-14.jpg': img('1473093295043-cdd812d0e601', 1000),
  'food-15.jpg': img('1579871494447-9811cf80d66c', 1000),
  'food-16.jpg': img('1559737558-2f5a35f4523b', 1000),
  'food-17.jpg': img('1519708227418-c8fd9a32b7a2', 1000),
  'food-18.jpg': img('1563379091339-03b21ab4a4f8', 1000),
  'food-19.jpg': img('1585937421612-70a008356fbe', 1000),
  'food-20.jpg': img('1529042410759-befb1204b468', 1000),
  'food-21.jpg': img('1555939594-58d7cb561ad1', 1000),
  'food-22.jpg': img('1578985545062-69928b1d9587', 1000),
  'food-23.jpg': img('1606313564200-e75d5e30476c', 1000),
  'food-24.jpg': img('1533134242443-d4fd215305ad', 1000),
  'food-25.jpg': img('1495474472287-4d71bcdd2085', 1000),
  'food-26.jpg': img('1544787219-7f47ccb76574', 1000),
  'food-27.jpg': img('1514362545857-3bc16c4c7d1b', 1000),
  'food-28.jpg': img('1536935338788-846bb9981813', 1000),
  'food-29.jpg': img('1600271886742-f049cd451bba', 1000),
  'food-30.jpg': img('1490474418585-ba9bad8fd0ea', 1000),
  'food-31.jpg': img('1528735602780-2552fd46c7af', 1000),
  'food-32.jpg': img('1563245372-f21724e3856d', 1000),
  'food-33.jpg': img('1603133872878-684f208fb84b', 1000),
  'food-34.jpg': img('1569718212165-3a8278d5f624', 1000),
  'food-35.jpg': img('1565680018434-b513d5e5fd47', 1000),
  'food-36.jpg': img('1606739998004-061d3cdbf9d9', 1000),
  'food-37.jpg': img('1504674900247-0877df9cc836', 1000),
  'food-38.jpg': img('1551218808-94e220e084d2', 1000),
  'food-39.jpg': img('1559847844-5315695dadae', 1000),
  'food-40.jpg': img('1540189549336-e6e99c3679fe', 1000),

  'event-01.jpg': img('1511578314322-379afb476865'),
  'event-02.jpg': img('1540575467063-178a50c2df87'),
  'event-03.jpg': img('1505373877841-8d25f7d46678'),
  'event-04.jpg': img('1431540015161-0bf868a2d407'),
  'event-05.jpg': img('1528605248644-14dd04022da1'),

  'wedding-01.jpg': img('1519167758481-83f550bb49b3'),
  'wedding-02.jpg': img('1464366400600-7168b8af9bc3'),
  'wedding-03.jpg': img('1478146896981-b80fe463b330'),
  'wedding-04.jpg': img('1519225421980-715cb0215aed'),

  'exp-romance.jpg': img('1529156069898-49953e39b3ac'),
  'exp-honeymoon.jpg': img('1507525428034-b723cf961d3e'),
  'exp-family.jpg': img('1500530855697-b586d89ba3ee'),
  'exp-mountain.jpg': img('1464822759023-fed622ff2c3b'),
  'exp-city.jpg': img('1476514525535-07fb3b4ae5f1'),
  'exp-vip.jpg': img('1414235077428-338989a2e8c0'),
  'exp-dining.jpg': img('1504674900247-0877df9cc836'),
  'exp-spa.jpg': img('1540555700478-4be289fbecef'),
  'exp-weekend.jpg': img('1571896349842-33c89424de2d'),
  'exp-staycation.jpg': img('1582719478250-c89cae4dc85b'),
  'exp-balloon.jpg': img('1507608616759-54f48f0af0ee'),
  'exp-hike.jpg': img('1551632811-561732d1e306'),

  'garden-01.jpg': img('1585320806297-9794b3e4eeae'),
  'garden-02.jpg': img('1416879595882-3373a0480b5b'),
  'garden-03.jpg': img('1558904541-efa843a96f01'),
  'garden-04.jpg': img('1470770841072-f978cf4d019e'),
  'garden-05.jpg': img('1441974231531-c6227db76b6e')
};

const entries = Object.entries(manifest);
const results = { ok: [], failed: [] };
let cursor = 0;

async function worker() {
  while (cursor < entries.length) {
    const [name, url] = entries[cursor++];
    const dest = path.join(OUT, name);
    try {
      const existing = await fs.stat(dest).catch(() => null);
      if (existing && existing.size > 5000) { results.ok.push(name); continue; }
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(res.status);
      const type = res.headers.get('content-type') || '';
      if (!type.includes('image')) throw new Error('not image: ' + type);
      const buf = Buffer.from(await res.arrayBuffer());
      await fs.writeFile(dest, buf);
      results.ok.push(name);
    } catch (e) {
      results.failed.push(`${name}: ${e.message}`);
    }
  }
}

await Promise.all(Array.from({ length: 8 }, () => worker()));
console.log(`Downloaded ${results.ok.length}/${entries.length}`);
if (results.failed.length) console.log('FAILED:\n' + results.failed.join('\n'));
