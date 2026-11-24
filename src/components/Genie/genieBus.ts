/** Tiny event bus so any page can make the genie react. */
export type GenieMood = 'spin' | 'cheer' | 'say';

export interface GenieEvent {
  mood: GenieMood;
  message?: string;
}

const EVENT = 'plotgenie:genie';

export function genie(mood: GenieMood, message?: string) {
  window.dispatchEvent(new CustomEvent<GenieEvent>(EVENT, { detail: { mood, message } }));
}

export function onGenie(handler: (e: GenieEvent) => void) {
  const fn = (e: Event) => handler((e as CustomEvent<GenieEvent>).detail);
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}
