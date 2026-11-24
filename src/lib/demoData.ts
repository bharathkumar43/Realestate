import type { AgentProfile, Plot } from './types';

/** Generates a pleasant landscape illustration so demo plots have "photos" without external files. */
export function sceneImage(seed: number, variant = 0): string {
  const skies = [
    ['#fde68a', '#fb923c'],
    ['#bae6fd', '#e0f2fe'],
    ['#c4b5fd', '#fbcfe8'],
    ['#a5f3fc', '#fef9c3'],
  ];
  const lands = ['#65a30d', '#4d7c0f', '#84cc16', '#a16207', '#15803d'];
  const s = skies[(seed + variant) % skies.length];
  const l1 = lands[(seed * 3 + variant) % lands.length];
  const l2 = lands[(seed + variant + 2) % lands.length];
  const sunX = 120 + ((seed * 97 + variant * 53) % 560);
  const posts = Array.from({ length: 9 }, (_, i) => {
    const x = 180 + i * 55;
    return `<rect x="${x}" y="330" width="6" height="40" rx="2" fill="#78350f"/>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s[1]}"/><stop offset="1" stop-color="${s[0]}"/></linearGradient></defs>
<rect width="800" height="500" fill="url(#s)"/>
<circle cx="${sunX}" cy="110" r="46" fill="#fff7ed" opacity="0.9"/>
<path d="M0 260 Q 200 ${190 + variant * 15} 400 250 T 800 230 V500 H0Z" fill="${l2}" opacity="0.7"/>
<path d="M0 320 Q 250 270 520 310 T 800 300 V500 H0Z" fill="${l1}"/>
<path d="M170 345 L 670 345" stroke="#78350f" stroke-width="4"/>
<path d="M170 360 L 670 360" stroke="#78350f" stroke-width="4"/>
${posts}
<path d="M0 430 Q 400 400 800 440 V500 H0Z" fill="#a16207" opacity="0.55"/>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const imgs = (seed: number, n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: `demo-img-${seed}-${i}`,
    storage_path: '',
    sort_order: i,
    is_cover: i === 0,
    url: sceneImage(seed, i),
  }));

const day = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

export const demoPlots: Plot[] = [
  {
    id: 'demo-1',
    title: 'East-Facing Corner Plot near ORR',
    location: 'Shamshabad',
    city: 'Hyderabad',
    area_value: 200,
    area_unit: 'sqyd',
    price: 6400000,
    price_negotiable: true,
    facing: 'East',
    approval: 'HMDA Approved',
    description:
      'Corner plot in a gated layout, 5 minutes from the Outer Ring Road and 15 minutes from the airport. 40 ft and 30 ft roads on two sides, underground drainage, avenue plantation and street lights are complete. Clear title, ready for registration.',
    latitude: 17.2403,
    longitude: 78.4294,
    status: 'available',
    featured: true,
    created_at: day(2),
    images: imgs(1, 4),
  },
  {
    id: 'demo-2',
    title: 'Villa Plot in Gated Community',
    location: 'Kollur',
    city: 'Hyderabad',
    area_value: 267,
    area_unit: 'sqyd',
    price: 11200000,
    price_negotiable: false,
    facing: 'North',
    approval: 'HMDA + RERA',
    description:
      'Premium villa plot with clubhouse, swimming pool, and 24/7 security. Close to the Financial District and schools. Bank loans available from all major banks.',
    latitude: 17.4489,
    longitude: 78.2533,
    status: 'available',
    featured: true,
    created_at: day(5),
    images: imgs(2, 3),
  },
  {
    id: 'demo-3',
    title: 'Budget Plot for Investment',
    location: 'Sadashivpet',
    city: 'Sangareddy',
    area_value: 150,
    area_unit: 'sqyd',
    price: 1650000,
    price_negotiable: true,
    facing: 'West',
    approval: 'DTCP Approved',
    description:
      'Affordable DTCP-approved open plot on the Mumbai highway corridor, close to the upcoming industrial zone. Good appreciation potential. Easy EMI options available.',
    latitude: 17.6181,
    longitude: 77.9533,
    status: 'available',
    featured: true,
    created_at: day(8),
    images: imgs(3, 3),
  },
  {
    id: 'demo-4',
    title: 'Farm Land with Bore Well',
    location: 'Chevella',
    city: 'Rangareddy',
    area_value: 2,
    area_unit: 'acre',
    price: 18000000,
    price_negotiable: true,
    facing: 'North-East',
    approval: 'Patta Land',
    description:
      'Two acres of fertile farm land with a working bore well and electricity connection. Mango and guava trees on the boundary. Black-top road access, perfect for a weekend farmhouse.',
    latitude: 17.3067,
    longitude: 78.1353,
    status: 'reserved',
    featured: false,
    created_at: day(12),
    images: imgs(4, 3),
  },
  {
    id: 'demo-5',
    title: 'Residential Plot near Metro',
    location: 'Miyapur',
    city: 'Hyderabad',
    area_value: 1800,
    area_unit: 'sqft',
    price: 9000000,
    price_negotiable: false,
    facing: 'South',
    approval: 'GHMC Approved',
    description:
      'Plot in a fully developed residential colony, 800 m from Miyapur metro station. Water, power, and sewage connections available. Ideal for building an independent house.',
    latitude: 17.4968,
    longitude: 78.3614,
    status: 'sold',
    featured: false,
    created_at: day(20),
    images: imgs(5, 2),
  },
  {
    id: 'demo-6',
    title: 'Open Plot with Lake View',
    location: 'Tukkuguda',
    city: 'Hyderabad',
    area_value: 240,
    area_unit: 'sqyd',
    price: 5280000,
    price_negotiable: true,
    facing: 'East',
    approval: 'HMDA Approved',
    description:
      'Peaceful lake-facing plot near the Srisailam highway with quick access to the airport and Fab City. The layout has a children’s park and a compound wall.',
    latitude: 17.2042,
    longitude: 78.4806,
    status: 'available',
    featured: false,
    created_at: day(25),
    images: imgs(6, 3),
  },
];

export const demoProfile: AgentProfile = {
  name: 'Ravi Kumar',
  tagline: 'Trusted plots, clear titles, honest prices.',
  phone: '9876543210',
  whatsapp: '9876543210',
  instagram: 'yourhandle',
  email: 'you@example.com',
  bio: 'I help families and investors find the right plot, from budget investment plots to premium villa plots. Every property I list is personally verified for clear title and approvals. Message me on WhatsApp for site visits any day of the week.',
  experience_years: 8,
  plots_sold: 120,
  photo_url: '',
  photo_path: '',
};
