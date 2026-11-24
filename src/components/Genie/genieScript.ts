/** Where the genie hovers on each page (as a fraction of the viewport) and what it says there. */
export interface GenieStop {
  x: number;
  y: number;
  tips: string[];
}

const stops: Record<string, GenieStop> = {
  home: {
    x: 0.84,
    y: 0.2,
    tips: [
      'Hello! I’m your Plot Genie ✨ Tap me and I’ll take you anywhere!',
      'Looking for a plot? Hit “Explore Plots” and I’ll fly you there!',
      'Psst… scroll down to see the featured plots 👇',
    ],
  },
  plots: {
    x: 0.9,
    y: 0.62,
    tips: [
      'Use the filters to find plots within your budget 💰',
      'Tap any plot card to see photos, price and the map!',
      'Want the cheapest first? Tap me and choose “Cheapest first”.',
    ],
  },
  detail: {
    x: 0.9,
    y: 0.68,
    tips: [
      'Ooh, nice pick! 🌟 Swipe through the photos.',
      'Like this one? Chat on WhatsApp with one tap!',
      'Share this plot with your family using the Share button 📤',
    ],
  },
  about: {
    x: 0.06,
    y: 0.6,
    tips: [
      'This is the person behind every plot here 🤝',
      'Follow on Instagram for new plots before anyone else!',
    ],
  },
  lost: {
    x: 0.5,
    y: 0.25,
    tips: ['Oops, even I can’t find this page! Tap me to fly home 🏠'],
  },
};

export function stopFor(pathname: string): GenieStop {
  if (pathname === '/') return stops.home;
  if (pathname === '/plots') return stops.plots;
  if (pathname.startsWith('/plots/')) return stops.detail;
  if (pathname === '/about') return stops.about;
  return stops.lost;
}
