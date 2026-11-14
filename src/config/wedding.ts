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
  events: WeddingEvent[]
  /** Live countdown to the wedding, with a scratch card that reveals the date. Set `show: false` to hide. */
  countdown: { show: boolean; mantra: string; title: string; scratchLabel: string }
  /** A single line shown on its own slide after the schedule, e.g. "Under the stars". "" hides that slide. */
  eveningLine: string
  /** "Our Story": an introduction and chapters (three to a slide). */
  story: { title: string; intro: string; chapters: StoryChapter[] }
  /** A welcome from the little ones of the family. Leave `names` empty to hide. */
  littleHearts: { title: string; names: string; message: string[] }
  /** Family welcome lists. Empty lists are hidden. */
  welcome: { heartyTitle: string; hearty: string[]; specialTitle: string; special: string[] }
}

export const wedding: WeddingConfig = {
  bride: {
    name: 'Vani',
    fullName: '',
    family: 'Bansal Family',
    parents: 'Mrs. Renuka Bansal & Mr. Anil Kumar Bansal',
    city: 'Muzaffarnagar, U.P.',
  },
  groom: {
    name: 'Sparsh',
    fullName: '',
    family: 'Gupta Family',
    parents: 'Mrs. Anisha Gupta & Mr. Deepak Gupta',
    city: 'Muzaffarnagar, U.P.',
  },
  weddingDate: 'Saturday, 12th December 2026',
  location: 'Moolchand Resorts, Muzaffarnagar',
  hashtag: '#ForeverCalledSV',
  invocation: '',
  invocationMeaning: '',
  coupleLead: 'You are invited to celebrate love',
  coupleInvite: 'Two hearts, one beautiful beginning',
  invitationMessage:
    'With the divine blessings of Smt. Rajdulari Bansal and Late Shri Ishwar Dayal Bansal Ji. With immense joy and the blessings of our elders, we invite you to grace the wedding celebration of our beloved daughter',
  brideParentsPrefix: 'Daughter of',
  groomParentsPrefix: 'Son of',
  closing: {
    lead: 'With Love',
    message: 'Join us for an evening of love, laughter and celebration!',
    blessing: '',
  },
  rsvp: {
    url: '',
    label: 'Kindly RSVP',
    contacts: [
      { name: 'Ishwar Dayal and Sons, Muzaffarnagar', phone: '9412583551' },
      { name: 'Manik Traders, Muzaffarnagar', phone: '8445093059' },
      { name: 'Ishwar Dayal Anil Kumar, Dehradun', phone: '8909554143' },
    ],
  },
  audio: { src: '/audio/wedding-song.mp3', title: '' },
  timezone: 'Asia/Kolkata',
  siteUrl: '',
  showPlaceholders: true,
  events: [
    {
      id: 'baraat',
      scene: 'baraat',
      title: 'Baraat Swagat',
      note: 'Welcoming our prince with love',
      date: '2026-12-12',
      time: '19:00',
      venue: 'Moolchand Resorts',
      address: '8th km stone, Meerut Road, Bahadarpur, Muzaffarnagar, U.P.',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Moolchand+Resorts+Meerut+Road+Bahadarpur+Muzaffarnagar',
    },
    {
      id: 'dinner',
      scene: 'hasta-melap',
      title: 'Dinner',
      note: 'A feast of love, joy and togetherness',
      date: '2026-12-12',
      time: '19:30',
      venue: 'Moolchand Resorts',
      address: '8th km stone, Meerut Road, Bahadarpur, Muzaffarnagar, U.P.',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Moolchand+Resorts+Meerut+Road+Bahadarpur+Muzaffarnagar',
    },
  ],
  eveningLine: 'Under the stars',
  countdown: {
    show: true,
    // "Ganesh Ji ka mantra" from the card; change it to the exact words you want.
    mantra: '॥ ॐ श्री गणेशाय नमः ॥',
    title: 'Until two souls become one',
    scratchLabel: 'Scratch to reveal',
  },
  story: {
    title: 'Our Story',
    intro:
      'Some love stories are written in the stars. Ours began with a single glance across a crowded room and has only grown more beautiful with every passing season.',
    chapters: [
      { title: 'The Meeting', text: 'Two families met, and two hearts quietly recognised each other.' },
      { title: 'The Knowing', text: 'Slow conversations turned into the certainty of finding the right person.' },
      { title: 'The Promise', text: 'With blessings all around, a connection became a forever promise.' },
    ],
  },
  littleHearts: {
    title: 'Our Little Hearts Welcome You',
    names: 'Gauvangi & Shridha',
    message: [
      'Tiny hands, cheerful smiles, and lots of love to make you feel special!',
      'Dear guests, your presence means the world to us. With happy hearts and warm smiles, we welcome you to the wedding celebration of Vani and Sparsh.',
      'Your love, blessings and presence will make our celebration even more beautiful!',
    ],
  },
  welcome: {
    heartyTitle: 'Hearty Welcome By',
    hearty: ['Renuka - Anil Kumar Bansal', 'Prerna - Sushil Bansal', 'Mansi - Praveen Bansal', 'Sakshi - Manik Bansal'],
    specialTitle: 'Special Invitation From',
    special: ['Vandana - Alok Ji', 'Akshita - Sparsh Ji', 'Avish', 'Pranav', 'Paridhi', 'Aryan', 'Lakshay', 'Aarushi'],
  },
}
