const digits = (s: string) => s.replace(/[^\d]/g, '');

/** WhatsApp click-to-chat link. Assumes Indian numbers if no country code is given. */
export function whatsappLink(number: string, text: string): string {
  let d = digits(number);
  if (d.length === 10) d = `91${d}`;
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}

export function whatsappShareLink(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function telLink(number: string): string {
  const d = digits(number);
  return `tel:${d.length === 10 ? `+91${d}` : `+${d}`}`;
}

export function instagramLink(handle: string): string {
  if (handle.startsWith('http')) return handle;
  return `https://instagram.com/${handle.replace(/^@/, '')}`;
}

export function mapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function plotUrl(id: string): string {
  return `${window.location.origin}/plots/${id}`;
}
