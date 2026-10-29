/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE ROYAL WEDDING — everything personal lives in this one file.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  • Replace the placeholder names, families and event details below.
 *  • Leave a field as "" if it is not known yet. While `showPlaceholders` is
 *    true the invitation shows a bracketed placeholder ("[Venue]") so nothing
 *    is forgotten; set it to false before sharing and empty lines disappear.
 *  • Events can be renamed, reordered, added or removed freely. `scene` picks
 *    the illustrated setting (see SceneKey) — any event can use any scene.
 *  • Dates are ISO "YYYY-MM-DD", times are 24h "HH:MM" in the wedding's
 *    `timezone`. They are formatted automatically ("26th January, 2027",
 *    "7:00 PM onwards") and power the optional "Add to calendar" link.
 *  • Event `id`s should be unique (they name the calendar entries).
 *  • "View venue" only appears when a real `mapUrl` is given.
 *  • The RSVP action only appears when `rsvp.url` is given (a form link,
 *    a wa.me/… WhatsApp link or a mailto: link all work).
 *  • Background music only appears when `audio.src` points at a file you
 *    have the rights to use (put it in /public/audio/). It never autoplays.
 */

export type SceneKey =
  | 'mehendi'
  | 'haldi'
  | 'garba'
  | 'sangeet'
  | 'baraat'
  | 'varmala'
  | 'hasta-melap'

export interface Person {
  /** Short name used in the couple reveal and monogram, e.g. "Aanya". */
  name: string
  /** Full name used in the formal invitation, e.g. "Aanya Mehta". Falls back to `name`. */
  fullName: string
  /** Family name used in the closing, e.g. "Mehta". */
  family: string
  /** Parents' line, e.g. "Shri Rajesh & Smt. Meera Mehta". */
  parents: string
}

export interface WeddingEvent {
  id: string
  scene: SceneKey
  title: string
  /** "YYYY-MM-DD" */
  date: string
  /** "HH:MM" 24-hour */
  time: string
  /** Shown after the time. Set "" to hide. */
  timeSuffix?: string
  venue: string
  /** Optional second line under the venue (address / city). */
  address?: string
  /** Real Google/Apple Maps link. Leave "" to hide "View venue". */
  mapUrl: string
  /** Used for calendar entries only. Defaults to 4. */
  durationHours?: number
}

export interface WeddingConfig {
  bride: Person
  groom: Person
  /** Optional override for the dates line under the couple, e.g. "26th – 28th January, 2027".
   *  Leave "" to build it automatically from the event dates. */
  weddingDate: string
  /** Optional line under the date in the couple reveal (city or main venue). */
  location: string
  /** Optional sacred invocation above the formal invitation, e.g. "॥ Shri Ganeshaya Namah ॥". "" hides it. */
  invocation: string
  coupleLead: string
  coupleInvite: string
  invitationMessage: string
  /** Shown before the parents' line, e.g. "Daughter of" / "Son of". */
  brideParentsPrefix: string
  groomParentsPrefix: string
  closing: {
    lead: string
    message: string
    blessing: string
  }
  rsvp: { url: string; label: string }
  audio: { src: string; title: string }
  /** IANA timezone the event times are in (used for calendar entries), e.g. "Asia/Kolkata". */
  timezone: string
  /** Public address the invitation will be hosted at, e.g. "https://our-wedding.com".
   *  Lets WhatsApp show the preview picture when the link is shared. */
  siteUrl: string
  showPlaceholders: boolean
  events: WeddingEvent[]
}

export const wedding: WeddingConfig = {
  bride: {
    name: '',
    fullName: '',
    family: '',
    parents: '',
  },
  groom: {
    name: '',
    fullName: '',
    family: '',
    parents: '',
  },
  weddingDate: '',
  location: '',
  invocation: '',
  coupleLead: 'Together with their families',
  coupleInvite: 'joyfully invite you to celebrate their wedding',
  invitationMessage:
    'With the blessings of our elders and the love of our families, we invite you to join us in celebrating this beautiful beginning.',
  brideParentsPrefix: 'Daughter of',
  groomParentsPrefix: 'Son of',
  closing: {
    lead: 'With Love',
    message: 'We look forward to celebrating with you.',
    blessing: 'Your presence is our greatest blessing.',
  },
  rsvp: { url: '', label: 'Kindly RSVP' },
  audio: { src: '', title: '' },
  timezone: 'Asia/Kolkata',
  siteUrl: '',
  showPlaceholders: true,
  events: [
    { id: 'mehendi', scene: 'mehendi', title: 'Mehendi Ki Shaam', date: '', time: '', venue: '', mapUrl: '' },
    { id: 'haldi', scene: 'haldi', title: 'Mandap Muhurat & Haldi', date: '', time: '', venue: '', mapUrl: '' },
    { id: 'garba', scene: 'garba', title: 'Garba Utsav', date: '', time: '', venue: '', mapUrl: '' },
    { id: 'baraat', scene: 'baraat', title: 'Baraat Swagat', date: '', time: '', venue: '', mapUrl: '' },
    { id: 'varmala', scene: 'varmala', title: 'Varmala', date: '', time: '', venue: '', mapUrl: '' },
    { id: 'hasta-melap', scene: 'hasta-melap', title: 'Hasta Melap', date: '', time: '', venue: '', mapUrl: '' },
  ],
}
