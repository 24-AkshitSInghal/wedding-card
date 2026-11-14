import type { RsvpContact, StoryChapter, WeddingConfig, WeddingEvent } from '../config/wedding'

export type Lang = 'en' | 'hi'

/** The words of the invitation in another language. Missing entries fall back to English. */
export interface WeddingOverrides {
  bride?: Partial<WeddingConfig['bride']>
  groom?: Partial<WeddingConfig['groom']>
  weddingDate?: string
  location?: string
  coupleLead?: string
  coupleInvite?: string
  invitationMessage?: string
  brideParentsPrefix?: string
  groomParentsPrefix?: string
  closing?: Partial<WeddingConfig['closing']>
  rsvp?: { label?: string; contacts?: Partial<RsvpContact>[] }
  /** Keyed by event id. */
  events?: Record<string, Partial<Pick<WeddingEvent, 'title' | 'note' | 'venue' | 'address' | 'timeSuffix'>>>
  countdown?: Partial<Pick<WeddingConfig['countdown'], 'title' | 'scratchLabel' | 'mantra'>>
  eveningLine?: string
  story?: { title?: string; intro?: string; chapters?: StoryChapter[] }
  littleHearts?: Partial<WeddingConfig['littleHearts']>
  welcome?: Partial<WeddingConfig['welcome']>
}

/** The invitation's own labels (not wedding content). */
const UI = {
  en: {
    venue: 'Venue',
    venues: 'Venues',
    viewVenue: 'View venue',
    addToCalendar: 'Add to calendar',
    scrollToEnter: 'Scroll to enter',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    saveTheDate: 'Save the date',
    rsvp: 'RSVP',
    onwards: 'onwards',
    foreverBegun: 'Forever has begun',
    opening: 'Opening the invitation…',
    tapToOpen: 'Tap to open',
    switchTo: 'हिन्दी',
    switchLabel: 'हिन्दी में पढ़ें (Read in Hindi)',
  },
  hi: {
    venue: 'स्थान',
    venues: 'आयोजन स्थल',
    viewVenue: 'स्थान देखें',
    addToCalendar: 'कैलेंडर में जोड़ें',
    scrollToEnter: 'प्रवेश हेतु स्क्रॉल करें',
    days: 'दिन',
    hours: 'घंटे',
    minutes: 'मिनट',
    seconds: 'सेकंड',
    saveTheDate: 'शुभ तिथि',
    rsvp: 'संपर्क सूत्र',
    onwards: 'से',
    foreverBegun: 'अनंत का आरंभ हो चुका है',
    opening: 'निमंत्रण खुल रहा है…',
    tapToOpen: 'खोलने के लिए स्पर्श करें',
    switchTo: 'English',
    switchLabel: 'Read in English (अंग्रेज़ी में पढ़ें)',
  },
} satisfies Record<Lang, Record<string, string>>

let current: Lang = 'en'

/** Set once per render of the invitation; the formatting helpers read it. */
export function setLang(lang: Lang) {
  current = lang
}
export const getLang = () => current
export const t = (key: keyof (typeof UI)['en']) => UI[current][key]

/** `?lang=hi` wins, then the guest's last choice. */
export function initialLang(): Lang {
  const param = new URLSearchParams(window.location.search).get('lang')
  if (param === 'hi' || param === 'en') return param
  try {
    const saved = window.localStorage.getItem('invite-lang')
    if (saved === 'hi' || saved === 'en') return saved
  } catch {
    /* storage may be unavailable (private mode) */
  }
  return 'en'
}

export function rememberLang(lang: Lang) {
  try {
    window.localStorage.setItem('invite-lang', lang)
  } catch {
    /* ignore */
  }
  const url = new URL(window.location.href)
  url.searchParams.set('lang', lang)
  window.history.replaceState(null, '', url)
}

const pick = <T,>(over: T | undefined, base: T): T => (over === undefined || over === '' ? base : over)

/** The wedding config with another language's words laid over it. */
export function localize(cfg: WeddingConfig, over: WeddingOverrides | null): WeddingConfig {
  if (!over) return cfg
  return {
    ...cfg,
    bride: { ...cfg.bride, ...over.bride },
    groom: { ...cfg.groom, ...over.groom },
    weddingDate: pick(over.weddingDate, cfg.weddingDate),
    location: pick(over.location, cfg.location),
    coupleLead: pick(over.coupleLead, cfg.coupleLead),
    coupleInvite: pick(over.coupleInvite, cfg.coupleInvite),
    invitationMessage: pick(over.invitationMessage, cfg.invitationMessage),
    brideParentsPrefix: pick(over.brideParentsPrefix, cfg.brideParentsPrefix),
    groomParentsPrefix: pick(over.groomParentsPrefix, cfg.groomParentsPrefix),
    closing: { ...cfg.closing, ...over.closing },
    rsvp: {
      ...cfg.rsvp,
      label: pick(over.rsvp?.label, cfg.rsvp.label),
      contacts: cfg.rsvp.contacts.map((c, i) => ({ ...c, ...over.rsvp?.contacts?.[i], phone: c.phone })),
    },
    events: cfg.events.map((e) => ({ ...e, ...over.events?.[e.id] })),
    countdown: { ...cfg.countdown, ...over.countdown },
    eveningLine: pick(over.eveningLine, cfg.eveningLine),
    story: {
      title: pick(over.story?.title, cfg.story.title),
      intro: pick(over.story?.intro, cfg.story.intro),
      chapters: over.story?.chapters?.length ? over.story.chapters : cfg.story.chapters,
    },
    littleHearts: { ...cfg.littleHearts, ...over.littleHearts },
    welcome: { ...cfg.welcome, ...over.welcome },
  }
}
