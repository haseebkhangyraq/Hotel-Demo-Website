export const SETTINGS = {
  hotel_name: 'Grand Aurelia Hotel & Resort',
  short_name: 'Grand Aurelia',
  tagline: 'An Extraordinary Stay. An Unforgettable Experience.',
  star_rating: '5',
  phone: '+92 51 111 273 582',
  whatsapp: '+92 300 847 2150',
  whatsapp_digits: '923008472150',
  email: 'reservations@grandaurelia.com',
  address: '1 Aurelia Boulevard, Margalla Hills',
  city: 'Islamabad',
  country: 'Pakistan',
  maps_url: 'https://www.google.com/maps/search/?api=1&query=Margalla+Hills+Islamabad',
  checkin_time: '15:00',
  checkout_time: '12:00',
  currency: 'PKR',
  tax_rate: '16',
  service_charge_rate: '5',
  extra_adult_charge: '3500',
  extra_child_charge: '1500',
  breakfast_price: '2200',
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  established: '2018',
  footer_note: 'A fictional hotel created for demonstration purposes. All bookings, payments and guest details are simulated.'
};

export const CATEGORIES = [
  {
    slug: 'standard-room',
    name: 'Standard Room',
    tagline: 'Refined simplicity, beautifully considered.',
    description:
      'A calm, light-filled retreat with a tailored king bed or twin configuration, a generous rain shower and every quiet comfort you need for an effortless stay.',
    long_description:
      'Our Standard Rooms are an exercise in restraint and comfort. Warm oak joinery, hand-finished plaster walls and soft ivory linens create a serene space overlooking the hotel courtyard. A considered work area, bespoke tea service and blackout drapery make this an easy choice for both short city visits and restful stopovers. Every detail, from the reading lights to the pillow menu, has been chosen with your ease in mind.',
    size_sqm: 32,
    max_adults: 2,
    max_children: 1,
    bed_type: 'King or twin beds',
    bathroom: 'Marble bathroom with rain shower',
    view: 'Courtyard or city view',
    price: 18000,
    amenities: [
      'High-speed Wi-Fi', '43" smart TV', 'Individual climate control', 'Work desk', 'In-room safe',
      'Tea & coffee station', 'Daily housekeeping', 'Rain shower', 'Complimentary water', '24-hour room service'
    ],
    images: ['/images/room-01.jpg', '/images/room-02.jpg', '/images/bath-01.jpg', '/images/room-11.jpg'],
    cover_image: '/images/room-01.jpg',
    featured: 1,
    sort_order: 1
  },
  {
    slug: 'superior-room',
    name: 'Superior Room',
    tagline: 'More space. More light. More Aurelia.',
    description:
      'An elevated room with premium bedding, a curated minibar and a private balcony framing the city skyline or our tranquil gardens.',
    long_description:
      'The Superior Room offers a little more room to breathe. Wake to soft morning light through floor-to-ceiling windows, linger over a freshly pulled espresso, and unwind in a bathroom dressed in Calacatta marble. An expanded seating nook, premium 400-thread-count linens and a thoughtful minibar make every return feel like a welcome. Choose a garden outlook for stillness, or a city view for the quiet energy of Islamabad at dusk.',
    size_sqm: 40,
    max_adults: 2,
    max_children: 2,
    bed_type: 'King bed or twin beds',
    bathroom: 'Stone bathroom with rain shower & bath',
    view: 'City or garden view',
    price: 25000,
    amenities: [
      'High-speed Wi-Fi', '50" smart TV', 'Premium bedding', 'Private balcony', 'Minibar',
      'Nespresso machine', 'Bathrobes & slippers', 'Evening turndown', 'In-room safe', 'Daily housekeeping'
    ],
    images: ['/images/room-03.jpg', '/images/room-04.jpg', '/images/bath-02.jpg', '/images/room-12.jpg'],
    cover_image: '/images/room-03.jpg',
    featured: 1,
    sort_order: 2
  },
  {
    slug: 'deluxe-room',
    name: 'Deluxe Room',
    tagline: 'An elegant address for a slower pace.',
    description:
      'Generously proportioned and beautifully appointed, with a separate sitting area, scenic views and a deep soaking tub for unhurried evenings.',
    long_description:
      'Designed for guests who appreciate the luxury of space, the Deluxe Room pairs a sumptuous sleeping chamber with a separate sitting salon. Botanical textiles, warm brass detailing and curated art give the room a quietly residential feel. Floor-to-ceiling windows open to the Margalla Hills or the glittering city below. At the end of the day, draw a bath, choose a record from the in-room collection, and let the city fade.',
    size_sqm: 52,
    max_adults: 2,
    max_children: 2,
    bed_type: 'King bed',
    bathroom: 'Marble bathroom with soaking tub & rain shower',
    view: 'Margalla Hills or city skyline',
    price: 35000,
    amenities: [
      'High-speed Wi-Fi', '55" smart TV', 'Separate sitting area', 'Scenic views', 'Deep soaking tub',
      'Nespresso machine', 'Premium minibar', 'Bathrobes & slippers', 'Evening turndown', 'Pillow menu'
    ],
    images: ['/images/room-05.jpg', '/images/room-06.jpg', '/images/bath-03.jpg', '/images/room-13.jpg'],
    cover_image: '/images/room-05.jpg',
    featured: 1,
    sort_order: 3
  },
  {
    slug: 'business-class-room',
    name: 'Business Class Room',
    tagline: 'Where work feels beautifully effortless.',
    description:
      'A dedicated workspace, ergonomic comfort and executive services designed for the modern traveller who expects more from a business stay.',
    long_description:
      'The Business Class Room is a considered sanctuary for working journeys. A hand-crafted oak desk, ergonomic seating and complimentary high-speed connectivity set the tone, while a Nespresso machine and premium minibar keep long days in balance. Guests enjoy priority access to our Business Centre, complimentary pressing of two garments, and a quiet executive breakfast each morning. Everything is arranged so you can focus on what brought you here.',
    size_sqm: 46,
    max_adults: 2,
    max_children: 1,
    bed_type: 'King bed',
    bathroom: 'Marble bathroom with rain shower',
    view: 'City view',
    price: 40000,
    amenities: [
      '1 Gbps Wi-Fi', 'Dedicated workstation', 'Ergonomic chair', 'Executive amenities', 'Business Centre access',
      'Complimentary pressing (2 items)', 'Nespresso machine', 'Premium minibar', 'Smart TV', 'Priority check-in'
    ],
    images: ['/images/room-07.jpg', '/images/room-08.jpg', '/images/bath-04.jpg', '/images/room-14.jpg'],
    cover_image: '/images/room-07.jpg',
    featured: 1,
    sort_order: 4
  },
  {
    slug: 'executive-room',
    name: 'Executive Room',
    tagline: 'A private club, with a room attached.',
    description:
      'Premium accommodation with exclusive access to the Aurelia Executive Lounge, private check-in and a dedicated guest services team.',
    long_description:
      'The Executive Room combines a beautifully scaled bedroom with the privileges of our private Executive Lounge. Begin the day with an intimate à la carte breakfast, return for afternoon tea, and end with evening canapés and curated cocktails as the sun sets over the hills. A dedicated guest relations manager is on hand to arrange everything from restaurant reservations to a last-minute tailor. Quiet luxury, effortlessly delivered.',
    size_sqm: 55,
    max_adults: 3,
    max_children: 2,
    bed_type: 'King bed',
    bathroom: 'Marble bathroom with soaking tub & rain shower',
    view: 'Margalla Hills view',
    price: 48000,
    amenities: [
      'Executive Lounge access', 'Private check-in', 'Daily breakfast in lounge', 'Evening cocktails & canapés',
      'Dedicated guest relations', 'High-speed Wi-Fi', 'Nespresso machine', 'Premium minibar',
      'Bathrobes & slippers', 'Evening turndown'
    ],
    images: ['/images/room-09.jpg', '/images/room-10.jpg', '/images/bath-01.jpg', '/images/room-15.jpg'],
    cover_image: '/images/room-09.jpg',
    featured: 1,
    sort_order: 5
  },
  {
    slug: 'junior-suite',
    name: 'Junior Suite',
    tagline: 'A suite of one’s own.',
    description:
      'A graceful suite with a separate sitting area, a dressing room and a deep marble bathroom — an intimate introduction to suite life.',
    long_description:
      'The Junior Suite is designed as a private apartment in miniature. A light-filled sitting room with a curated library and writing desk flows into a serene bedroom dressed in ivory and champagne. The dressing room and marble bathroom, complete with a deep soaking tub, bring a sense of ceremony to everyday rituals. Ideal for longer stays, quiet celebrations, or simply the pleasure of more space.',
    size_sqm: 68,
    max_adults: 3,
    max_children: 2,
    bed_type: 'King bed',
    bathroom: 'Marble bathroom with soaking tub, rain shower & twin vanities',
    view: 'Garden or city view',
    price: 55000,
    amenities: [
      'Separate sitting area', 'Walk-in dressing room', 'Deep soaking tub', 'Twin vanities', 'Nespresso machine',
      'Premium minibar', '55" smart TV', 'Bathrobes & slippers', 'Evening turndown', 'Pillow menu'
    ],
    images: ['/images/room-11.jpg', '/images/room-12.jpg', '/images/bath-02.jpg', '/images/room-16.jpg'],
    cover_image: '/images/room-11.jpg',
    featured: 1,
    sort_order: 6
  },
  {
    slug: 'executive-suite',
    name: 'Executive Suite',
    tagline: 'Room to entertain. Space to retreat.',
    description:
      'A refined one-bedroom suite with a separate living room, dining for four, Executive Lounge privileges and discreet butler service.',
    long_description:
      'The Executive Suite is conceived for guests who travel with a certain rhythm. A generous living room, dining table for four and separate study create an easy flow between work and rest. The bedroom is a hushed haven of soft linens and hand-finished textures, while the marble bathroom offers a soaking tub and twin vanities. Executive Lounge access, daily pressing and a dedicated butler complete the experience.',
    size_sqm: 92,
    max_adults: 3,
    max_children: 2,
    bed_type: 'King bed',
    bathroom: 'Marble bathroom with soaking tub, rain shower & twin vanities',
    view: 'Panoramic city view',
    price: 75000,
    amenities: [
      'Separate living room', 'Dining for four', 'Executive Lounge access', 'Daily butler service',
      'Complimentary pressing', 'Nespresso machine', 'Premium minibar', '65" smart TV',
      'Bathrobes & slippers', 'Priority airport transfer'
    ],
    images: ['/images/room-13.jpg', '/images/room-14.jpg', '/images/bath-03.jpg', '/images/room-17.jpg'],
    cover_image: '/images/room-13.jpg',
    featured: 1,
    sort_order: 7
  },
  {
    slug: 'family-room',
    name: 'Family Room',
    tagline: 'A little room for everyone.',
    description:
      'A warm, spacious family retreat with flexible bedding, child-friendly amenities and thoughtful touches for the youngest guests.',
    long_description:
      'Our Family Rooms are designed around the way families actually travel. A generous main bedroom connects to a snug children’s alcove with two single beds, while a separate seating area offers space for stories, games or a quiet cup of tea. Little guests are welcomed with their own bathrobes, bedtime milk and a carefully chosen activity kit. Connecting rooms are available on request, and our team can arrange cots, high chairs and babysitting.',
    size_sqm: 60,
    max_adults: 4,
    max_children: 3,
    bed_type: 'King bed + two single beds',
    bathroom: 'Family bathroom with bath & rain shower',
    view: 'Garden view',
    price: 45000,
    amenities: [
      'Connecting room available', 'Children’s activity kit', 'Cots & high chairs on request', 'Games console',
      'Kids’ bathrobes & slippers', 'Family dining', 'High-speed Wi-Fi', 'Minibar', 'Smart TV', 'Babysitting on request'
    ],
    images: ['/images/room-15.jpg', '/images/room-16.jpg', '/images/bath-04.jpg', '/images/room-18.jpg'],
    cover_image: '/images/room-15.jpg',
    featured: 1,
    sort_order: 8
  },
  {
    slug: 'accessible-room',
    name: 'Accessible Room',
    tagline: 'Luxury should feel effortless for everyone.',
    description:
      'A thoughtfully designed, step-free room with an accessible bathroom, lowered fixtures and generous circulation space.',
    long_description:
      'Every detail of our Accessible Rooms has been considered in partnership with accessibility specialists. From the step-free entrance and wide doorways to the roll-in shower with grab rails and lowered wardrobe rails, the room is designed to make independence feel natural. Visual alarms, a vibrating pillow and accessible controls are provided as standard. Our team is always happy to discuss individual requirements before your arrival.',
    size_sqm: 42,
    max_adults: 2,
    max_children: 1,
    bed_type: 'King bed with transfer space',
    bathroom: 'Accessible bathroom with roll-in shower & grab rails',
    view: 'Courtyard view',
    price: 22000,
    amenities: [
      'Step-free access', 'Wide doorways', 'Roll-in shower', 'Grab rails', 'Lowered fixtures & wardrobe rails',
      'Visual alarm & vibrating pillow', 'Accessible parking nearby', 'High-speed Wi-Fi', 'Smart TV', '24-hour assistance'
    ],
    images: ['/images/room-17.jpg', '/images/room-18.jpg', '/images/bath-01.jpg', '/images/room-01.jpg'],
    cover_image: '/images/room-17.jpg',
    featured: 0,
    sort_order: 9
  },
  {
    slug: 'penthouse-suite',
    name: 'Penthouse Suite',
    tagline: 'The city, at your feet.',
    description:
      'A spectacular rooftop residence with a private terrace, plunge pool, panoramic views and the discreet service of a private butler.',
    long_description:
      'Occupying the top floor of Grand Aurelia, the Penthouse Suite is less a room than a private residence in the sky. A wraparound terrace with a heated plunge pool opens to uninterrupted views of the Margalla Hills. Inside, a double-height living salon, hand-selected art and a private dining room create a setting for unforgettable evenings. A dedicated butler, chauffeured car and private chef on request are all part of the experience.',
    size_sqm: 165,
    max_adults: 4,
    max_children: 2,
    bed_type: 'Super king bed',
    bathroom: 'Spa bathroom with soaking tub, rain shower, sauna & twin vanities',
    view: 'Panoramic Margalla Hills & city view',
    price: 120000,
    amenities: [
      'Private rooftop terrace', 'Heated plunge pool', 'Private butler', 'Chauffeured car', 'Private dining room',
      'Sauna', '65" smart TV', 'B&O sound system', 'Premium minibar', 'Private elevator access'
    ],
    images: ['/images/room-09.jpg', '/images/room-14.jpg', '/images/bath-02.jpg', '/images/room-17.jpg'],
    cover_image: '/images/room-09.jpg',
    featured: 1,
    sort_order: 10
  },
  {
    slug: 'presidential-suite',
    name: 'Presidential Suite',
    tagline: 'The most extraordinary address in the city.',
    description:
      'Our flagship residence: a grand living room, private dining for ten, a study, spa bathroom and a dedicated team on call around the clock.',
    long_description:
      'The Presidential Suite is the fullest expression of Grand Aurelia. A grand salon with a working fireplace and art from Pakistan’s foremost contemporary artists opens onto a private dining room for ten. The master bedroom is a serene sanctuary with a dressing room and a spa bathroom finished in book-matched marble. A private study, gym and kitchen complete the residence. A dedicated butler, private chef and chauffeured Mercedes are available throughout your stay.',
    size_sqm: 240,
    max_adults: 4,
    max_children: 2,
    bed_type: 'Super king bed + guest bedroom',
    bathroom: 'Spa bathroom with soaking tub, steam room, rain shower & twin vanities',
    view: 'Panoramic city & hills view',
    price: 180000,
    amenities: [
      'Grand living room', 'Private dining for ten', 'Private study', 'Guest bedroom', 'Dedicated butler & chef',
      'Chauffeured Mercedes', 'Steam room', 'Private gym', 'Grand piano', 'Private elevator & entrance'
    ],
    images: ['/images/room-18.jpg', '/images/room-09.jpg', '/images/bath-03.jpg', '/images/room-16.jpg'],
    cover_image: '/images/room-18.jpg',
    featured: 1,
    sort_order: 11
  }
];

export const MENU_ITEMS = [
  { name: 'Aurelia Sunrise Breakfast', description: 'Free-range eggs, smoked salmon, avocado, sourdough and a seasonal fruit plate.', category: 'Breakfast', price: 3500, image: '/images/food-02.jpg', dietary: ['Signature'], featured: 1 },
  { name: 'Golden Croissant & Preserves', description: 'Twice-baked butter croissant with house-made apricot and rose preserves.', category: 'Breakfast', price: 1200, image: '/images/food-05.jpg', dietary: ['Vegetarian'], featured: 0 },
  { name: 'Black Truffle Arancini', description: 'Crisp saffron risotto spheres, black truffle, aged parmesan and chive aioli.', category: 'Starters', price: 2400, image: '/images/food-01.jpg', dietary: ['Vegetarian'], featured: 1 },
  { name: 'Crispy Prawn Tempura', description: 'Tiger prawns, light yuzu batter, sesame and a warm ponzu dip.', category: 'Starters', price: 3200, image: '/images/food-35.jpg', dietary: ['Seafood'], featured: 0 },
  { name: 'Roasted Pumpkin Velouté', description: 'Silky local pumpkin, brown butter, toasted seeds and a swirl of crème fraîche.', category: 'Soups', price: 1800, image: '/images/food-07.jpg', dietary: ['Vegetarian', 'Gluten-free'], featured: 0 },
  { name: 'Thai Tom Yum', description: 'Lemongrass, galangal, lime leaf and tiger prawns in a fragrant coconut broth.', category: 'Soups', price: 2100, image: '/images/food-06.jpg', dietary: ['Spicy', 'Seafood'], featured: 0 },
  { name: 'Aurelia Garden Salad', description: 'Heirloom tomatoes, cucumber, pomegranate, herbs and a lemon-sumac dressing.', category: 'Salads', price: 1900, image: '/images/food-08.jpg', dietary: ['Vegan', 'Gluten-free'], featured: 0 },
  { name: 'Classic Caesar', description: 'Baby gem, aged parmesan, sourdough croutons and a silken anchovy dressing.', category: 'Salads', price: 2200, image: '/images/food-09.jpg', dietary: ['Classic'], featured: 0 },
  { name: 'Herb-Crusted Rack of Lamb', description: 'Grass-fed lamb, rosemary jus, pommes purée and buttered seasonal greens.', category: 'Continental', price: 7800, image: '/images/food-10.jpg', dietary: ["Chef's Signature"], featured: 1 },
  { name: 'Pan-Seared Sea Bass', description: 'Line-caught sea bass, cauliflower velvet, capers and brown butter.', category: 'Continental', price: 6200, image: '/images/food-17.jpg', dietary: ['Gluten-free'], featured: 0 },
  { name: 'Chicken Dum Biryani', description: 'Aged basmati, saffron, slow-cooked chicken and a cool mint raita.', category: 'Pakistani', price: 3200, image: '/images/food-18.jpg', dietary: ['Halal', 'Signature'], featured: 1 },
  { name: 'Charcoal Seekh Kebab', description: 'Hand-minced beef, warm spices, charred onion and tamarind chutney.', category: 'Pakistani', price: 2900, image: '/images/food-20.jpg', dietary: ['Halal'], featured: 0 },
  { name: 'Chilli Garlic Prawns', description: 'Wok-tossed prawns, bird’s eye chilli, garlic and spring onion.', category: 'Chinese', price: 4200, image: '/images/food-16.jpg', dietary: ['Spicy', 'Seafood'], featured: 0 },
  { name: 'Golden Egg Fried Rice', description: 'Jasmine rice, farm eggs, garden peas and a whisper of sesame.', category: 'Chinese', price: 2600, image: '/images/food-33.jpg', dietary: ['Vegetarian'], featured: 0 },
  { name: 'Truffle Tagliatelle', description: 'House-made ribbons, black truffle cream and 24-month Parmigiano Reggiano.', category: 'Italian', price: 3800, image: '/images/food-13.jpg', dietary: ['Vegetarian', 'Signature'], featured: 1 },
  { name: 'Margherita di Bufala', description: 'San Marzano tomato, buffalo mozzarella, basil and a 48-hour dough.', category: 'Italian', price: 2800, image: '/images/food-12.jpg', dietary: ['Vegetarian'], featured: 0 },
  { name: 'Wagyu Tenderloin', description: 'A5 wagyu, bone marrow crust, smoked potato and a red wine reduction.', category: 'Main Courses', price: 14500, image: '/images/food-38.jpg', dietary: ["Chef's Signature"], featured: 1 },
  { name: 'Rosemary Roasted Chicken', description: 'Corn-fed chicken, wild mushrooms, thyme jus and truffled mash.', category: 'Main Courses', price: 4800, image: '/images/food-37.jpg', dietary: ['Gluten-free'], featured: 0 },
  { name: 'Aurelia Mixed Grill', description: 'Chargrilled lamb chops, chicken tikka, seekh kebab and mint chutney.', category: 'BBQ', price: 6900, image: '/images/food-21.jpg', dietary: ['Halal', 'Signature'], featured: 1 },
  { name: 'Smoked Beef Short Ribs', description: 'Twelve-hour smoked ribs, burnt honey glaze and pickled slaw.', category: 'BBQ', price: 6200, image: '/images/food-39.jpg', dietary: ['Smoked'], featured: 0 },
  { name: 'Grilled Atlantic Salmon', description: 'Charred lemon, asparagus, dill hollandaise and crushed potatoes.', category: 'Seafood', price: 5800, image: '/images/food-17.jpg', dietary: ['Gluten-free'], featured: 0 },
  { name: 'Oysters Rockefeller', description: 'Half dozen rock oysters, spinach, pernod butter and sourdough crumb.', category: 'Seafood', price: 6800, image: '/images/food-36.jpg', dietary: ['Seafood', 'Signature'], featured: 1 },
  { name: 'Valrhona Chocolate Fondant', description: 'Warm dark chocolate, salted caramel centre and vanilla bean ice cream.', category: 'Desserts', price: 2200, image: '/images/food-23.jpg', dietary: ['Vegetarian'], featured: 1 },
  { name: 'New York Cheesecake', description: 'Silken baked cheesecake, rose petal jam and pistachio crumb.', category: 'Desserts', price: 1800, image: '/images/food-24.jpg', dietary: ['Vegetarian'], featured: 0 },
  { name: 'Aurelia Signature Mocktail', description: 'Lychee, white tea, jasmine and a hint of pink peppercorn.', category: 'Beverages', price: 1400, image: '/images/food-28.jpg', dietary: ['Non-alcoholic'], featured: 1 },
  { name: 'Fresh Citrus Press', description: 'Hand-pressed grapefruit, orange and lime with mountain mineral water.', category: 'Beverages', price: 900, image: '/images/food-29.jpg', dietary: ['Vegan'], featured: 0 },
  { name: 'Single-Origin Espresso', description: 'Seasonal Pakistani-roasted beans, pulled to order.', category: 'Coffee & Tea', price: 700, image: '/images/food-25.jpg', dietary: ['Vegan'], featured: 0 },
  { name: 'Kashmiri Pink Tea', description: 'Slow-brewed green tea, milk, cardamom and crushed pistachio.', category: 'Coffee & Tea', price: 800, image: '/images/food-26.jpg', dietary: ['Vegetarian'], featured: 1 },
  { name: 'Midnight Club Sandwich', description: 'Roast chicken, smoked bacon, egg, tomato and truffle fries.', category: 'Room Service', price: 2600, image: '/images/food-31.jpg', dietary: ['24-hour'], featured: 0 },
  { name: 'Comfort Bowl', description: 'Warm quinoa, roasted vegetables, avocado, herbs and lemon tahini.', category: 'Room Service', price: 2200, image: '/images/food-40.jpg', dietary: ['Vegan', 'Gluten-free'], featured: 0 }
];

export const FACILITIES = [
  {
    slug: 'infinity-pool',
    name: 'Infinity Pool & Poolside',
    category: 'Wellness & Leisure',
    icon: 'waves',
    short_description: 'A 30-metre infinity pool suspended above the gardens, with private cabanas and a poolside grill.',
    description:
      'Our signature infinity pool appears to spill into the Margalla Hills, its still surface catching the light from dawn until dusk. Private cabanas are dressed with linen, cold towels and a dedicated attendant. An indoor lap pool offers year-round swimming, while the poolside grill serves light lunches, fresh juices and frozen treats. Adults-only hours are observed each morning, and families are warmly welcomed throughout the rest of the day.',
    image: '/images/pool-01.jpg',
    features: ['30m heated infinity pool', 'Indoor lap pool', 'Private cabanas', 'Poolside grill & juice bar', 'Adults-only hours 7–9am', 'Dedicated pool attendants'],
    hours: 'Daily · 06:00 – 22:00',
    sort_order: 1
  },
  {
    slug: 'aurelia-spa',
    name: 'Aurelia Spa & Wellness',
    category: 'Wellness & Leisure',
    icon: 'flower-2',
    short_description: 'A 1,200 sqm sanctuary of hammams, treatment suites, sauna and steam rooms inspired by the Himalayas.',
    description:
      'Aurelia Spa is a quiet world of warm stone, candlelight and the scent of cedar. Our rituals draw on the healing traditions of the Himalayas and the subcontinent, interpreted with contemporary technique. Choose from signature massages, rose and sandalwood body treatments, hammam ceremonies and results-led facials. The spa includes a thermal suite with sauna and steam room, a relaxation lounge and three private couples’ suites.',
    image: '/images/spa-01.jpg',
    features: ['8 treatment suites', 'Traditional hammam', 'Sauna & steam room', 'Couples’ spa suite', 'Wellness packages', 'Pilates & yoga studio'],
    hours: 'Daily · 09:00 – 21:00',
    sort_order: 2
  },
  {
    slug: 'fitness-centre',
    name: 'Fitness Centre',
    category: 'Wellness & Leisure',
    icon: 'dumbbell',
    short_description: 'Technogym-equipped strength and cardio studio with personal trainers and sunrise yoga on the terrace.',
    description:
      'Our light-filled fitness centre is equipped with the latest Technogym cardio and strength equipment, a functional training zone and a dedicated stretching studio. Certified personal trainers are available for private sessions, and a programme of sunrise yoga, breathwork and mobility classes runs throughout the week. Guests have complimentary 24-hour access with their room key.',
    image: '/images/gym-01.jpg',
    features: ['Technogym equipment', 'Functional training zone', 'Certified personal trainers', 'Sunrise yoga terrace', '24-hour access', 'Complimentary towels & water'],
    hours: 'Open 24 hours · trainers 06:00 – 21:00',
    sort_order: 3
  },
  {
    slug: 'business-centre',
    name: 'Business Centre & Executive Lounge',
    category: 'Business',
    icon: 'briefcase',
    short_description: 'Private workstations, meeting pods, printing and secretarial support, plus our members’ Executive Lounge.',
    description:
      'Designed for those who need to stay connected, our Business Centre offers private workstations, video-ready meeting pods, high-speed printing and discreet secretarial support. The adjoining Executive Lounge is an elegant retreat for lounge-access guests, serving all-day refreshments, afternoon tea and evening canapés. Dedicated event coordinators can arrange everything from a last-minute board meeting to a full-day conference.',
    image: '/images/event-03.jpg',
    features: ['Private workstations', 'Video-ready meeting pods', 'Printing & secretarial support', 'Executive Lounge access', '1 Gbps Wi-Fi', 'Dedicated event coordinators'],
    hours: 'Daily · 07:00 – 22:00',
    sort_order: 4
  },
  {
    slug: 'concierge-transfers',
    name: 'Concierge & Airport Transfers',
    category: 'Guest Services',
    icon: 'bell-ring',
    short_description: 'A 24-hour concierge team, chauffeured airport transfers and a fleet of luxury cars at your disposal.',
    description:
      'Our concierge team is the quiet force behind an effortless stay. From restaurant reservations and private guides to theatre tickets, floral arrangements and last-minute gifts, nothing is too small to arrange. Chauffeured airport transfers in our Mercedes fleet can be booked at any hour, and a selection of luxury cars is available for daily hire with an experienced driver.',
    image: '/images/resort-02.jpg',
    features: ['24-hour concierge', 'Chauffeured airport transfers', 'Luxury car hire with driver', 'Private guides & tours', 'Restaurant reservations', 'Parcel & gift services'],
    hours: 'Concierge · 24 hours',
    sort_order: 5
  },
  {
    slug: 'dining-rooftop',
    name: 'Dining & Rooftop Lounge',
    category: 'Dining',
    icon: 'utensils-crossed',
    short_description: 'Five distinctive dining rooms, from all-day dining at Noor to sunset cocktails at the rooftop Observatory.',
    description:
      'Grand Aurelia is a destination for the city’s most discerning diners. Noor, our all-day dining room, celebrates the markets of Pakistan with a generous breakfast and seasonal à la carte menu. AURUM offers contemporary continental cuisine and an intimate chef’s table. Saffron & Smoke is our charcoal grill, while The Observatory rooftop lounge is the address for sundowners and small plates with a view. In-room dining is available around the clock.',
    image: '/images/dining-02.jpg',
    features: ['Noor all-day dining', 'AURUM fine dining', 'Saffron & Smoke grill', 'The Observatory rooftop', '24-hour in-room dining', 'Private dining rooms'],
    hours: 'Noor 06:30 – 23:00 · Observatory 17:00 – 01:00',
    sort_order: 6
  },
  {
    slug: 'family-kids',
    name: 'Family & Kids’ Club',
    category: 'Guest Services',
    icon: 'baby',
    short_description: 'A supervised kids’ club, family pool hours, cots and a thoughtful welcome for our youngest guests.',
    description:
      'We believe luxury should be joyful for every generation. The Aurelia Kids’ Club offers supervised creative play, storytelling and garden adventures for children aged 3–12, while a teen lounge provides games, films and a quiet study corner. Family pool hours, children’s menus, cots, high chairs and trusted babysitting can all be arranged through your butler or the concierge.',
    image: '/images/pool-05.jpg',
    features: ['Supervised kids’ club', 'Teen lounge & games', 'Family pool hours', 'Cots & high chairs', 'Babysitting on request', 'Children’s menus'],
    hours: 'Daily · 09:00 – 19:00',
    sort_order: 7
  },
  {
    slug: 'meetings-celebrations',
    name: 'Meetings & Celebrations',
    category: 'Events',
    icon: 'users',
    short_description: 'Five flexible venues, from an intimate boardroom to the 720 sqm Grand Aurelia Ballroom.',
    description:
      'From a discreet board meeting for eight to a wedding for 800, our event team brings precision and warmth to every occasion. Five distinct venues include the column-free Grand Aurelia Ballroom, the garden-facing Noor Banquet Hall and the light-filled Meridian Conference Centre. Our chefs create bespoke menus, while a dedicated planner manages every technical and stylistic detail.',
    image: '/images/event-01.jpg',
    features: ['5 event venues', 'Up to 800 guests', 'Bespoke menus', 'Dedicated event planner', 'Full AV & production', 'Bridal suite'],
    hours: 'Event team · 08:00 – 22:00',
    sort_order: 8
  },
  {
    slug: 'gardens-prayer',
    name: 'Gardens & Prayer Room',
    category: 'Guest Services',
    icon: 'trees',
    short_description: 'Three acres of scented gardens, a quiet prayer room and a shaded reading terrace overlooking the hills.',
    description:
      'Beyond the lobby, three acres of landscaped gardens offer a rare stillness in the heart of the city. Frangipani, jasmine and old rose frame winding paths, secluded benches and a reflecting pool. A beautifully appointed prayer room is open to all guests, with separate ablution facilities, and a shaded reading terrace invites an unhurried afternoon with a book and a pot of tea.',
    image: '/images/garden-01.jpg',
    features: ['3 acres of gardens', 'Reflecting pool', 'Prayer room & ablution', 'Reading terrace', 'Garden tours', 'Seasonal floral displays'],
    hours: 'Gardens · 24 hours · Prayer room · 24 hours',
    sort_order: 9
  },
  {
    slug: 'accessibility-safety',
    name: 'Accessibility & Guest Safety',
    category: 'Guest Services',
    icon: 'accessibility',
    short_description: 'Step-free access, accessible rooms, 24-hour security and a team trained to make every stay effortless.',
    description:
      'We are committed to welcoming every guest with thoughtfulness and dignity. The hotel offers step-free access throughout public areas, two purpose-designed accessible rooms, accessible parking and lifts with lowered controls. Our 24-hour security team, in-room safes, CCTV in public areas and discreet emergency protocols ensure peace of mind. Please tell us how we can support your stay before you arrive.',
    image: '/images/room-17.jpg',
    features: ['Step-free public areas', '2 accessible rooms', 'Accessible parking', 'Lowered lift controls', '24-hour security', 'In-room safes'],
    hours: 'Guest assistance · 24 hours',
    sort_order: 10
  }
];

export const EXPERIENCES = [
  { slug: 'romantic-getaway', title: 'Romantic Getaway', category: 'Couples', description: 'An intimate escape for two, with a candlelit dinner, rose-petal turndown and a private breakfast terrace.', long_description: 'Arrive to chilled sparkling juice and a bouquet of English roses. As evening falls, a candlelit dinner for two is served on your private terrace, followed by a rose-petal turndown and artisan chocolates. Wake to breakfast in bed and a late check-out at 14:00.', image: '/images/exp-romance.jpg', price: 85000, price_label: 'per couple · 1 night', duration: '2 days / 1 night', includes: ['Deluxe Room or above', 'Candlelit dinner for two', 'Rose-petal turndown', 'Breakfast in bed', 'Late check-out at 14:00'], featured: 1, sort_order: 1 },
  { slug: 'honeymoon-escape', title: 'Honeymoon Escape', category: 'Couples', description: 'A three-day beginning to a lifetime together, with a spa ritual, private dining and a chauffeured mountain drive.', long_description: 'Celebrate the first days of marriage with a suite dressed in white orchids, a couples’ spa ritual and dinner under the stars. A chauffeured drive into the Margalla Hills ends with a private picnic prepared by our chef. Every moment is quietly arranged, so you can simply be together.', image: '/images/exp-honeymoon.jpg', price: 165000, price_label: 'per couple · 2 nights', duration: '3 days / 2 nights', includes: ['Junior Suite', 'Couples’ spa ritual', 'Private starlit dinner', 'Chauffeured Margalla drive', 'Daily breakfast', 'Airport transfers'], featured: 1, sort_order: 2 },
  { slug: 'family-vacation', title: 'Family Vacation', category: 'Family', description: 'A generous family stay with kids’ club access, a garden picnic and a movie night under the stars.', long_description: 'Designed for families who want space to play and time to reconnect. Our Family Room includes a welcome kit for younger guests, daily breakfast and access to the Kids’ Club. A private garden picnic and an outdoor movie night complete a stay that everyone will remember.', image: '/images/exp-family.jpg', price: 125000, price_label: 'family of four · 2 nights', duration: '3 days / 2 nights', includes: ['Family Room', 'Daily breakfast for four', 'Kids’ Club access', 'Garden picnic', 'Outdoor movie night', 'Late check-out'], featured: 1, sort_order: 3 },
  { slug: 'margalla-excursion', title: 'Margalla Hills Excursion', category: 'Adventure', description: 'A guided sunrise hike through the Margalla Hills, followed by a champagne breakfast at a private viewpoint.', long_description: 'Our naturalist leads a gentle sunrise trail through the protected Margalla Hills, pausing for birdlife, wildflowers and stories of the landscape. At a private viewpoint, a breakfast of warm breads, local honey and fresh fruit is laid out against the waking city.', image: '/images/exp-mountain.jpg', price: 45000, price_label: 'per person', duration: '6 hours', includes: ['Private naturalist guide', 'Sunrise trail', 'Breakfast at a private viewpoint', 'Hotel transfers', 'Walking poles & water'], featured: 1, sort_order: 4 },
  { slug: 'city-discovery', title: 'City Discovery', category: 'Culture', description: 'A curated half-day tour of Islamabad’s galleries, gardens and hidden architectural gems, with a private guide.', long_description: 'Discover a side of Islamabad that guidebooks miss. Your private guide leads you through the Faisal Mosque, the Pakistan Monument, a working artist’s studio and the city’s most beautiful gardens, ending with tea at a restored heritage residence.', image: '/images/exp-city.jpg', price: 18000, price_label: 'per person', duration: '5 hours', includes: ['Private guide', 'Air-conditioned car', 'Monument & mosque visits', 'Artist studio visit', 'Afternoon tea'], featured: 0, sort_order: 5 },
  { slug: 'vip-curated', title: 'The VIP Curators', category: 'Signature', description: 'A fully bespoke day shaped around your passions, from private art collections to a helicopter journey over the hills.', long_description: 'Tell us what moves you, and our concierge will compose a day unlike any other. Private access to a collector’s home, a helicopter journey over the Margalla Hills, a closed-door shopping experience with a leading designer — this is access, quietly arranged.', image: '/images/exp-vip.jpg', price: 250000, price_label: 'per couple', duration: 'Bespoke · full day', includes: ['Dedicated experience curator', 'Private chauffeured car', 'Bespoke itinerary', 'Private dining', 'Helicopter option on request'], featured: 1, sort_order: 6 },
  { slug: 'private-dining', title: 'Chef’s Table Privé', category: 'Dining', description: 'An eight-course tasting menu served in the kitchen garden, hosted by Executive Chef Zara Qureshi.', long_description: 'Join our Executive Chef in the kitchen garden for an intimate eight-course menu built around the season’s finest produce. Each course is paired with rare teas or artisanal non-alcoholic ferments, and the evening ends with a hand-written recipe to take home.', image: '/images/exp-dining.jpg', price: 35000, price_label: 'per couple', duration: '3 hours', includes: ['8-course tasting menu', 'Chef-hosted experience', 'Tea & ferment pairings', 'Kitchen garden tour', 'Signed recipe card'], featured: 1, sort_order: 7 },
  { slug: 'spa-retreat', title: 'Himalayan Spa Retreat', category: 'Wellness', description: 'A full-day wellness journey with two signature rituals, a private hammam and a nourishing lunch.', long_description: 'Begin with a guided breathwork session, followed by a 90-minute Himalayan stone massage and a traditional hammam ceremony. A nourishing lunch is served in the spa conservatory, and the afternoon is yours in the thermal suite and relaxation lounge.', image: '/images/exp-spa.jpg', price: 55000, price_label: 'per person', duration: 'Full day', includes: ['Breathwork session', '90-minute stone massage', 'Traditional hammam', 'Spa lunch', 'Thermal suite access'], featured: 0, sort_order: 8 },
  { slug: 'weekend-escape', title: 'Weekend Escape', category: 'Couples', description: 'Two unhurried days of poolside cabanas, rooftop sundowners and a late Sunday checkout.', long_description: 'Leave the week behind with a Friday arrival and a guaranteed 16:00 checkout on Sunday. A poolside cabana is reserved for you each day, and sunset cocktails at The Observatory are on us.', image: '/images/exp-weekend.jpg', price: 95000, price_label: 'per couple · 2 nights', duration: '3 days / 2 nights', includes: ['Deluxe Room', 'Daily breakfast', 'Poolside cabana', 'Sunset cocktails', 'Guaranteed 16:00 checkout'], featured: 1, sort_order: 9 },
  { slug: 'luxury-staycation', title: 'Luxury Staycation', category: 'Signature', description: 'A three-night residence-style stay with daily spa credit, in-room dining and a private city itinerary.', long_description: 'A stay designed for those who want to disappear without leaving the city. Three nights in a suite, daily breakfast, a generous spa credit and a private itinerary of galleries and gardens — with your car and driver on call throughout.', image: '/images/exp-staycation.jpg', price: 135000, price_label: 'per couple · 3 nights', duration: '4 days / 3 nights', includes: ['Junior Suite', 'Daily breakfast', 'PKR 20,000 spa credit', 'Private car & driver', 'In-room dining credit'], featured: 1, sort_order: 10 }
];

export const EVENT_SPACES = [
  { slug: 'grand-aurelia-ballroom', name: 'The Grand Aurelia Ballroom', type: 'Weddings & Galas', description: 'Our crowning venue: a column-free ballroom with crystal chandeliers, a private bridal suite and space for up to 800 guests.', image: '/images/wedding-01.jpg', capacity_theatre: 600, capacity_banquet: 450, capacity_reception: 800, area_sqm: 720, price_from: 850000, setups: ['Banquet rounds', 'Theatre', 'Cocktail reception', 'Dance floor'], features: ['Column-free', 'Private bridal suite', 'Crystal chandeliers', 'Full AV production', 'Dedicated event planner', 'Valet parking'] },
  { slug: 'noor-banquet-hall', name: 'Noor Banquet Hall', type: 'Weddings & Celebrations', description: 'An elegant, garden-facing hall with warm ivory interiors and a private terrace, ideal for intimate weddings and celebrations.', image: '/images/wedding-02.jpg', capacity_theatre: 300, capacity_banquet: 260, capacity_reception: 420, area_sqm: 480, price_from: 450000, setups: ['Banquet rounds', 'Theatre', 'Cocktail reception'], features: ['Garden terrace', 'Bespoke menus', 'Bridal room', 'Natural daylight', 'Dedicated planner', 'Valet parking'] },
  { slug: 'meridian-conference-centre', name: 'Meridian Conference Centre', type: 'Conferences', description: 'A light-filled, fully equipped conference centre with divisible rooms, a registration foyer and dedicated breakout spaces.', image: '/images/event-01.jpg', capacity_theatre: 350, capacity_banquet: 220, capacity_reception: 400, area_sqm: 520, price_from: 375000, setups: ['Theatre', 'Classroom', 'U-shape', 'Banquet rounds'], features: ['Divisible rooms', 'Registration foyer', '4K projection', 'Simultaneous translation', 'Breakout rooms', 'Technical support'] },
  { slug: 'executive-boardroom', name: 'The Executive Boardroom', type: 'Meetings', description: 'A discreet, wood-panelled boardroom for up to 24 guests, with integrated video conferencing and private butler service.', image: '/images/event-03.jpg', capacity_theatre: 24, capacity_banquet: 18, capacity_reception: 40, area_sqm: 85, price_from: 125000, setups: ['Boardroom', 'U-shape', 'Theatre'], features: ['Video conferencing', '86" presentation screen', 'Private butler', 'Confidential access', 'Stationery & printing', 'Working lunch'] },
  { slug: 'garden-pavilion', name: 'The Garden Pavilion', type: 'Outdoor Events', description: 'A romantic open-air pavilion beneath ancient trees, with a reflecting pool and space for 300 guests under the stars.', image: '/images/wedding-04.jpg', capacity_theatre: 180, capacity_banquet: 150, capacity_reception: 300, area_sqm: 900, price_from: 300000, setups: ['Banquet rounds', 'Cocktail reception', 'Ceremony seating'], features: ['Open-air pavilion', 'Reflecting pool', 'Fairy-light canopy', 'Live music permitted', 'Weather contingency', 'Garden bar'] }
];

export const OFFERS = [
  { slug: 'weekend-escape', title: 'The Weekend Escape', subtitle: 'Two nights of unhurried luxury', description: 'Arrive on Friday, leave the week behind. Includes daily breakfast, a poolside cabana and a guaranteed 16:00 Sunday checkout.', discount_label: '10% off', discount_percent: 10, promo_code: 'WEEKEND10', image: '/images/exp-weekend.jpg', featured: 1, sort_order: 1, conditions: 'Minimum two-night stay. Friday or Saturday arrival. Subject to availability.' },
  { slug: 'luxury-staycation', title: 'Luxury Staycation', subtitle: 'The city, without leaving it', description: 'A three-night suite escape with daily breakfast, PKR 20,000 spa credit and a private car and driver for the duration of your stay.', discount_label: '15% off suites', discount_percent: 15, promo_code: 'STAYCATION15', image: '/images/room-14.jpg', featured: 1, sort_order: 2, conditions: 'Minimum three-night stay in a suite. Advance reservation required.' },
  { slug: 'honeymoon-package', title: 'Honeymoon in the Hills', subtitle: 'A beginning, beautifully staged', description: 'A suite dressed in orchids, a couples’ spa ritual, private starlit dinner and a chauffeured Margalla Hills drive.', discount_label: '12% off', discount_percent: 12, promo_code: 'HONEYMOON12', image: '/images/exp-honeymoon.jpg', featured: 1, sort_order: 3, conditions: 'Valid for stays within six months of your wedding date. Minimum two nights.' },
  { slug: 'family-stay', title: 'Family Time', subtitle: 'Space for every generation', description: 'Family Room with daily breakfast, Kids’ Club access, a garden picnic and late checkout for the whole family.', discount_label: '10% off', discount_percent: 10, promo_code: 'FAMILY10', image: '/images/exp-family.jpg', featured: 1, sort_order: 4, conditions: 'Minimum two-night stay. Up to two adults and two children.' },
  { slug: 'business-traveller', title: 'The Business Traveller', subtitle: 'Work, beautifully considered', description: 'Business Class Room with executive breakfast, two garments pressed daily, Business Centre access and flexible checkout.', discount_label: '8% off', discount_percent: 8, promo_code: 'BUSINESS8', image: '/images/event-03.jpg', featured: 0, sort_order: 5, conditions: 'Valid on Business Class Rooms and above. Flexible 14:00 checkout subject to availability.' },
  { slug: 'early-booking', title: 'Book Ahead', subtitle: 'The reward for foresight', description: 'Reserve at least 30 days in advance and enjoy 15% off our best available rate, with complimentary breakfast.', discount_label: '15% off', discount_percent: 15, promo_code: 'EARLY15', image: '/images/resort-01.jpg', featured: 0, sort_order: 6, conditions: 'Book 30 days or more before arrival. Minimum three nights. Non-refundable.' },
  { slug: 'extended-stay', title: 'The Extended Stay', subtitle: 'Settle in for longer', description: 'Stay five nights or more and receive 20% off, daily breakfast and a complimentary airport transfer.', discount_label: '20% off', discount_percent: 20, promo_code: 'EXTENDED20', image: '/images/room-09.jpg', featured: 0, sort_order: 7, conditions: 'Minimum five-night stay. One complimentary return airport transfer.' },
  { slug: 'suite-escape', title: 'The Suite Escape', subtitle: 'An address above the ordinary', description: 'Three nights or more in a suite with 25% off, daily breakfast and a private butler throughout your stay.', discount_label: '25% off suites', discount_percent: 25, promo_code: 'SUITE25', image: '/images/exp-staycation.jpg', featured: 1, sort_order: 8, conditions: 'Minimum three nights in a Junior Suite or above. Subject to availability.' }
];

export const GALLERY = [
  { title: 'Grand Aurelia at dusk', category: 'Exterior', image: '/images/hero-main.jpg' },
  { title: 'The arrival court', category: 'Exterior', image: '/images/resort-01.jpg' },
  { title: 'The Aurelia lobby', category: 'Lobby', image: '/images/resort-02.jpg' },
  { title: 'A quiet corner of the lobby', category: 'Lobby', image: '/images/dining-03.jpg' },
  { title: 'Standard Room', category: 'Rooms', image: '/images/room-01.jpg' },
  { title: 'Superior Room', category: 'Rooms', image: '/images/room-03.jpg' },
  { title: 'Deluxe Room', category: 'Deluxe Rooms', image: '/images/room-05.jpg' },
  { title: 'Deluxe sitting area', category: 'Deluxe Rooms', image: '/images/room-06.jpg' },
  { title: 'Junior Suite', category: 'Suites', image: '/images/room-11.jpg' },
  { title: 'Executive Suite', category: 'Suites', image: '/images/room-13.jpg' },
  { title: 'Presidential Suite salon', category: 'Presidential Suite', image: '/images/room-18.jpg' },
  { title: 'The Presidential bathroom', category: 'Presidential Suite', image: '/images/bath-03.jpg' },
  { title: 'The infinity pool', category: 'Pool', image: '/images/pool-01.jpg' },
  { title: 'Poolside cabanas', category: 'Pool', image: '/images/pool-02.jpg' },
  { title: 'Indoor lap pool', category: 'Pool', image: '/images/pool-03.jpg' },
  { title: 'Aurelia Spa', category: 'Spa', image: '/images/spa-01.jpg' },
  { title: 'The hammam', category: 'Spa', image: '/images/spa-02.jpg' },
  { title: 'Noor all-day dining', category: 'Dining', image: '/images/dining-02.jpg' },
  { title: 'AURUM fine dining', category: 'Dining', image: '/images/dining-01.jpg' },
  { title: 'The Observatory rooftop', category: 'Dining', image: '/images/bar-01.jpg' },
  { title: 'Meridian Conference Centre', category: 'Conference Halls', image: '/images/event-01.jpg' },
  { title: 'The Executive Boardroom', category: 'Conference Halls', image: '/images/event-03.jpg' },
  { title: 'The Grand Aurelia Ballroom', category: 'Weddings', image: '/images/wedding-01.jpg' },
  { title: 'Noor Banquet Hall', category: 'Weddings', image: '/images/wedding-02.jpg' },
  { title: 'The Garden Pavilion', category: 'Weddings', image: '/images/wedding-04.jpg' },
  { title: 'The scented gardens', category: 'Gardens', image: '/images/garden-01.jpg' },
  { title: 'The reflecting pool', category: 'Gardens', image: '/images/garden-02.jpg' },
  { title: 'Morning in the gardens', category: 'Gardens', image: '/images/garden-03.jpg' },
  { title: 'The Margalla Hills', category: 'Exterior', image: '/images/exp-mountain.jpg' },
  { title: 'The rooftop pool at sunset', category: 'Pool', image: '/images/pool-04.jpg' }
];

export const TESTIMONIALS = [
  { name: 'Amelia Hart', location: 'London, United Kingdom', stay: 'Presidential Suite · October 2026', quote: 'Grand Aurelia understands something rare: true luxury is quiet. Every need was anticipated before we knew to ask. The Presidential Suite is one of the most beautiful hotel rooms I have ever stayed in.', rating: 5 },
  { name: 'Omar Farooq', location: 'Dubai, United Arab Emirates', stay: 'Executive Suite · September 2026', quote: 'I travel to Islamabad monthly and have finally found my home. The Executive Lounge team remembers how I take my tea. That is the whole story.', rating: 5 },
  { name: 'Sofia Marchetti', location: 'Milan, Italy', stay: 'Deluxe Room · August 2026', quote: 'The spa alone is worth the journey. I came for two nights and stayed for five. The gardens at dawn are extraordinary.', rating: 5 },
  { name: 'Daniel & Priya Mehta', location: 'Mumbai, India', stay: 'Honeymoon Escape · July 2026', quote: 'From the orchids in our suite to the private dinner under the stars, our honeymoon was flawless. The team treated every moment as if it mattered personally.', rating: 5 },
  { name: 'Hana Yamada', location: 'Tokyo, Japan', stay: 'Junior Suite · June 2026', quote: 'The design is restrained and deeply considered, and the staff are warm without ever being intrusive. Breakfast at Noor is a ritual I still think about.', rating: 5 },
  { name: 'James Whitmore', location: 'Sydney, Australia', stay: 'Penthouse Suite · May 2026', quote: 'We hosted a small celebration in the Penthouse and it was perfection. The view, the service, the food — all of it felt effortless. We are already planning our return.', rating: 5 }
];

export const GUESTS = [
  { first_name: 'Amelia', last_name: 'Hart', email: 'amelia.hart@example.com', phone: '+44 7700 900123', nationality: 'United Kingdom', vip: 1 },
  { first_name: 'Omar', last_name: 'Farooq', email: 'omar.farooq@example.com', phone: '+971 50 123 4567', nationality: 'United Arab Emirates', vip: 1 },
  { first_name: 'Sofia', last_name: 'Marchetti', email: 'sofia.marchetti@example.com', phone: '+39 333 456 7890', nationality: 'Italy', vip: 0 },
  { first_name: 'Daniel', last_name: 'Mehta', email: 'daniel.mehta@example.com', phone: '+91 98200 12345', nationality: 'India', vip: 0 },
  { first_name: 'Hana', last_name: 'Yamada', email: 'hana.yamada@example.com', phone: '+81 90 1234 5678', nationality: 'Japan', vip: 1 },
  { first_name: 'James', last_name: 'Whitmore', email: 'james.whitmore@example.com', phone: '+61 412 345 678', nationality: 'Australia', vip: 0 },
  { first_name: 'Fatima', last_name: 'Khan', email: 'fatima.khan@example.com', phone: '+92 300 111 2233', nationality: 'Pakistan', vip: 1 },
  { first_name: 'Alexander', last_name: 'Reid', email: 'alex.reid@example.com', phone: '+1 415 555 0132', nationality: 'United States', vip: 0 },
  { first_name: 'Mei', last_name: 'Chen', email: 'mei.chen@example.com', phone: '+86 138 0013 8000', nationality: 'China', vip: 0 },
  { first_name: 'Lucas', last_name: 'Bernard', email: 'lucas.bernard@example.com', phone: '+33 6 12 34 56 78', nationality: 'France', vip: 0 },
  { first_name: 'Aisha', last_name: 'Rahman', email: 'aisha.rahman@example.com', phone: '+880 171 123 4567', nationality: 'Bangladesh', vip: 0 },
  { first_name: 'William', last_name: 'Carter', email: 'william.carter@example.com', phone: '+1 212 555 0187', nationality: 'United States', vip: 1 },
  { first_name: 'Elena', last_name: 'Petrova', email: 'elena.petrova@example.com', phone: '+7 916 123 4567', nationality: 'Russia', vip: 0 },
  { first_name: 'Bilal', last_name: 'Ahmed', email: 'bilal.ahmed@example.com', phone: '+92 321 456 7890', nationality: 'Pakistan', vip: 0 },
  { first_name: 'Charlotte', last_name: 'Dubois', email: 'charlotte.dubois@example.com', phone: '+33 7 98 76 54 32', nationality: 'France', vip: 0 },
  { first_name: 'Rajiv', last_name: 'Sharma', email: 'rajiv.sharma@example.com', phone: '+91 98100 22334', nationality: 'India', vip: 0 },
  { first_name: 'Sarah', last_name: 'Al-Mansouri', email: 'sarah.almansouri@example.com', phone: '+966 50 987 6543', nationality: 'Saudi Arabia', vip: 1 },
  { first_name: 'Thomas', last_name: 'Müller', email: 'thomas.mueller@example.com', phone: '+49 151 23456789', nationality: 'Germany', vip: 0 },
  { first_name: 'Zara', last_name: 'Hussain', email: 'zara.hussain@example.com', phone: '+92 333 765 4321', nationality: 'Pakistan', vip: 0 },
  { first_name: 'Grace', last_name: 'Kim', email: 'grace.kim@example.com', phone: '+82 10 1234 5678', nationality: 'South Korea', vip: 0 }
];

export const ROOMS = [
  { number: '101', category: 'standard-room', floor: 1 },
  { number: '102', category: 'standard-room', floor: 1 },
  { number: '103', category: 'standard-room', floor: 1 },
  { number: '104', category: 'standard-room', floor: 1 },
  { number: '105', category: 'standard-room', floor: 1 },
  { number: '106', category: 'standard-room', floor: 1 },
  { number: '108', category: 'accessible-room', floor: 1 },
  { number: '109', category: 'accessible-room', floor: 1 },
  { number: '201', category: 'superior-room', floor: 2 },
  { number: '202', category: 'superior-room', floor: 2 },
  { number: '203', category: 'superior-room', floor: 2 },
  { number: '204', category: 'superior-room', floor: 2 },
  { number: '205', category: 'superior-room', floor: 2 },
  { number: '301', category: 'deluxe-room', floor: 3 },
  { number: '302', category: 'deluxe-room', floor: 3 },
  { number: '303', category: 'deluxe-room', floor: 3 },
  { number: '304', category: 'deluxe-room', floor: 3 },
  { number: '305', category: 'deluxe-room', floor: 3 },
  { number: '401', category: 'business-class-room', floor: 4 },
  { number: '402', category: 'business-class-room', floor: 4 },
  { number: '403', category: 'business-class-room', floor: 4 },
  { number: '404', category: 'business-class-room', floor: 4 },
  { number: '501', category: 'executive-room', floor: 5 },
  { number: '502', category: 'executive-room', floor: 5 },
  { number: '503', category: 'executive-room', floor: 5 },
  { number: '504', category: 'executive-room', floor: 5 },
  { number: '601', category: 'junior-suite', floor: 6 },
  { number: '602', category: 'junior-suite', floor: 6 },
  { number: '603', category: 'junior-suite', floor: 6 },
  { number: '604', category: 'junior-suite', floor: 6 },
  { number: '701', category: 'family-room', floor: 7 },
  { number: '702', category: 'family-room', floor: 7 },
  { number: '703', category: 'family-room', floor: 7 },
  { number: '704', category: 'family-room', floor: 7 },
  { number: '801', category: 'executive-suite', floor: 8 },
  { number: '802', category: 'executive-suite', floor: 8 },
  { number: '803', category: 'executive-suite', floor: 8 },
  { number: '901', category: 'penthouse-suite', floor: 9 },
  { number: '902', category: 'penthouse-suite', floor: 9 },
  { number: '1001', category: 'presidential-suite', floor: 10 }
];
