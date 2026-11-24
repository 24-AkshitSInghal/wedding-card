/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE ROYAL WEDDING: the shape of a card's words.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Each card's words live in its own folder, src/cards/<card>/ (en.ts for English,
 *  hi.ts for Hindi). The `CARD` setting picks which card a build shows; it defaults
 *  to "primary". See README.md for running two cards as two sites.
 *
 *  • Replace the placeholder names, families and event details in en.ts.
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
 *    a wa.me/… WhatsApp link or a mailto: link all work). `rsvp.contacts`
 *    are listed in the closing as tap-to-call numbers.
 *  • Background music only appears when `audio.src` points at a file you
 *    have the rights to use (put it in /public/audio/). It starts with the
 *    guest's first tap or swipe; the button in the corner mutes it.
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
  /** Optional home town, added after the parents' line, e.g. "Muzaffarnagar, U.P.". */
  city?: string
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
  /** Optional one-line description under the title, e.g. "Welcoming our prince with love." */
  note?: string
}

export interface RsvpContact {
  name: string
  phone: string
}

export interface StoryChapter {
  title: string
  text: string
}

export interface WeddingConfig {
  bride: Person
  groom: Person
  /** Optional override for the dates line under the couple, e.g. "26th – 28th January, 2027".
   *  Leave "" to build it automatically from the event dates. */
  weddingDate: string
  /** Optional line under the date in the couple reveal (city or main venue). */
  location: string
  /** Optional hashtag shown under the date, e.g. "#ForeverCalledSV". */
  hashtag: string
  /** Optional sacred invocation above the formal invitation, e.g. "॥ Shri Ganeshaya Namah ॥". "" hides it. */
  invocation: string
  /** Optional translation shown under the invocation. */
  invocationMeaning: string
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
  rsvp: { url: string; label: string; contacts: RsvpContact[] }
  audio: { src: string; title: string }
  /** IANA timezone the event times are in (used for calendar entries), e.g. "Asia/Kolkata". */
  timezone: string
  /** Public address the invitation will be hosted at, e.g. "https://our-wedding.com".
   *  Lets WhatsApp show the preview picture when the link is shared. */
  siteUrl: string
  showPlaceholders: boolean
  /** Whose family sends this card: their side is named first ("Sparsh & Vani") and signs
   *  the closing. Defaults to "bride". */
  hostSide?: 'bride' | 'groom'
  /** Shows a small "Swipe up" hint at the foot of every page between the opening and the
   *  closing, so guests know there is more to see. Defaults to off. */
  pageHint?: boolean
  /** Moves the words on the venue page down (positive) or up (negative), as a fraction of
   *  the page's height, e.g. 0.05. Defaults to 0. */
  venueTextShift?: number
  /** Adjusts one day's schedule page, keyed by that day's date. `shift` moves its words up
   *  (negative) or down as a fraction of the page's height; `scale` sets them a little
   *  smaller (e.g. 0.85) when a busy day needs the room. Days not listed are unchanged. */
  dayText?: Record<string, { shift?: number; scale?: number }>
  events: WeddingEvent[]
  /** Live countdown to the wedding, with a scratch card that reveals the date. Set `show: false` to hide. */
  countdown: {
    show: boolean
    mantra: string
    title: string
    scratchLabel: string
    /** The event the countdown runs to (its `id`); defaults to the earliest event. */
    eventId?: string
  }
  /** A single line shown on its own slide after the schedule, e.g. "Under the stars". "" hides
   *  that slide, unless `eveningVerse` fills it. */
  eveningLine: string
  /** Optional lines for the evening slide (under `eveningLine`, or on their own when it is ""):
   *  a heading, a sentence and a small footer, e.g. "Moonlight & Matrimony 🌙" /
   *  "Under the moonlight…" / "Vani & Sparsh | 12.12.2026". */
  eveningVerse?: { title: string; text: string; footer: string }
  /** "Our Story": an introduction and chapters (three to a slide). */
  story: { title: string; intro: string; chapters: StoryChapter[] }
  /** A welcome from the little ones of the family. Leave `names` empty to hide. */
  littleHearts: { title: string; names: string; message: string[] }
  /** Family welcome lists. Empty lists are hidden. */
  welcome: { heartyTitle: string; hearty: string[]; specialTitle: string; special: string[] }
}
