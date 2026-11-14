import type { WeddingConfig, WeddingEvent } from '../config/wedding'
import { getLang } from './i18n'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** "2027-01-26" → parts, or null for anything that is not a real calendar date. */
function parseDate(iso: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!match) return null
  const [y, m, d] = [+match[1], +match[2], +match[3]]
  if (m < 1 || m > 12 || d < 1 || new Date(Date.UTC(y, m - 1, d)).getUTCDate() !== d) return null
  return { y, m, d }
}

/** "19:00" → parts, or null when it is not a valid 24-hour time. */
function parseTime(hhmm: string): { h: number; m: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim())
  if (!match) return null
  const [h, m] = [+match[1], +match[2]]
  return h <= 23 && m <= 59 ? { h, m } : null
}

export function ordinal(n: number): string {
  const s = n % 100
  if (s >= 11 && s <= 13) return `${n}th`
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`
}

const MONTHS_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर']

/** "2027-01-26" → "26th January, 2027" (or "26 जनवरी 2027"). Anything else is shown as written. */
export function formatDate(iso: string): string {
  const p = parseDate(iso)
  if (!p) return iso.trim()
  if (getLang() === 'hi') return `${p.d} ${MONTHS_HI[p.m - 1]} ${p.y}`
  return `${ordinal(p.d)} ${MONTHS[p.m - 1]}, ${p.y}`
}

/** "19:00" → "7:00 PM". Anything else is shown exactly as written. */
export function formatTime(hhmm: string): string {
  const t = parseTime(hhmm)
  if (!t) return hhmm.trim()
  if (getLang() === 'hi') {
    // Hindi names the part of the day: सुबह, दोपहर, शाम, रात — "शाम 7:00 बजे".
    const part = t.h >= 4 && t.h < 12 ? 'सुबह' : t.h < 16 && t.h >= 12 ? 'दोपहर' : t.h >= 16 && t.h < 20 ? 'शाम' : 'रात'
    return `${part} ${((t.h + 11) % 12) + 1}:${String(t.m).padStart(2, '0')} बजे`
  }
  return `${((t.h + 11) % 12) + 1}:${String(t.m).padStart(2, '0')} ${t.h >= 12 ? 'PM' : 'AM'}`
}

/** Builds "26th, 27th & 28th January, 2027" from the event dates. */
export function weddingDateLine(cfg: WeddingConfig): string {
  if (cfg.weddingDate.trim()) return cfg.weddingDate.trim()
  const dates = [...new Set(cfg.events.map((e) => e.date.trim()).filter((d) => parseDate(d)))].sort()
  if (!dates.length) return ''
  const parsed = dates.map((d) => parseDate(d)!)
  const sameMonth = parsed.every((p) => p.m === parsed[0].m && p.y === parsed[0].y)
  if (!sameMonth) return `${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}`
  const days = parsed.map((p) => ordinal(p.d))
  const list = days.length > 1 ? `${days.slice(0, -1).join(', ')} & ${days[days.length - 1]}` : days[0]
  return `${list} ${MONTHS[parsed[0].m - 1]}, ${parsed[0].y}`
}

/* ── Placeholders & names ─────────────────────────────────────────────────── */

/** Returns the value, a bracketed placeholder (when enabled) or null (hide the line). */
export function field(value: string | undefined, placeholder: string, cfg: WeddingConfig): string | null {
  const v = (value ?? '').trim()
  if (v) return v
  return cfg.showPlaceholders ? `[${placeholder}]` : null
}

/** The couple's names as they should appear (real, placeholder, or null when hidden). */
/** The couple in the order this card names them: the hosting family's side first. */
export function partners(cfg: WeddingConfig) {
  const bride = { person: cfg.bride, prefix: cfg.brideParentsPrefix, role: 'Bride' }
  const groom = { person: cfg.groom, prefix: cfg.groomParentsPrefix, role: 'Groom' }
  return cfg.hostSide === 'groom' ? [groom, bride] : [bride, groom]
}

/** Short names, hosting side first. */
export function coupleNames(cfg: WeddingConfig): [string | null, string | null] {
  const [a, b] = partners(cfg)
  return [field(a.person.name, `${a.role} Name`, cfg), field(b.person.name, `${b.role} Name`, cfg)]
}

/** Family names, hosting side first. */
export function familyNames(cfg: WeddingConfig): [string | null, string | null] {
  const [a, b] = partners(cfg)
  return [field(a.person.family, `${a.role} Family`, cfg), field(b.person.family, `${b.role} Family`, cfg)]
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEKDAYS_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार']

/** The day of the week: "Tuesday" / "मंगलवार". */
export function weekday(iso: string): string {
  const p = parseDate(iso)
  if (!p) return ''
  const wd = new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay()
  return (getLang() === 'hi' ? WEEKDAYS_HI : WEEKDAYS)[wd]
}

/** A run of days as a short span: "8–11 December", or "12 December" for one day. */
export function daySpan(isos: string[]): string {
  const ps = [...new Set(isos)].map(parseDate).filter((p) => !!p).sort((a, b) => Date.UTC(a.y, a.m - 1, a.d) - Date.UTC(b.y, b.m - 1, b.d))
  if (!ps.length) return ''
  const month = (p: (typeof ps)[number]) => (getLang() === 'hi' ? MONTHS_HI : MONTHS)[p.m - 1]
  const [a, z] = [ps[0], ps[ps.length - 1]]
  if (a === z) return `${a.d} ${month(a)}`
  if (a.m === z.m && a.y === z.y) return `${a.d}–${z.d} ${month(a)}`
  return `${a.d} ${month(a)} - ${z.d} ${month(z)}`
}

/** Joins whichever of two names exist with an ampersand. */
export function joinNames(a: string | null, b: string | null): string {
  return [a, b].filter(Boolean).join(' & ')
}

export function initials(cfg: WeddingConfig): [string, string] {
  const first = (s: string | null) => (s ?? '').replace(/^\[/, '').trim()[0]?.toUpperCase() ?? ''
  const [b, g] = coupleNames(cfg)
  return [first(b), first(g)]
}

/* ── Links ────────────────────────────────────────────────────────────────── */

/**
 * Accepts https/http, mailto: and tel: links, and adds https:// to bare hosts such as
 * "wa.me/91…" or "maps.app.goo.gl/…". Returns null for anything else, which hides the action.
 */
export function safeUrl(raw: string): string | null {
  const v = raw.trim()
  if (!v) return null
  if (/^(https?:|mailto:|tel:)/i.test(v)) return v
  if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(v)) return `https://${v}`
  if (import.meta.env.DEV) console.warn(`[invitation] Ignoring link that is not http(s), mailto: or tel: "${v}"`)
  return null
}

export const opensInNewTab = (url: string) => /^https?:/i.test(url)

/** "9412583551" → "tel:+919412583551" (10-digit numbers are taken as Indian mobiles). */
export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '')
  return `tel:${/^\d{10}$/.test(digits) ? `+91${digits}` : digits}`
}

/* ── Calendar ─────────────────────────────────────────────────────────────── */

/** Unique per event even if two events share an id. */
export const eventUid = (ev: WeddingEvent, index: number) => `${index}-${ev.id}`

/** UTC offset in minutes of an IANA zone on a given day ("Asia/Kolkata" → 330). */
function zoneOffsetMinutes(timeZone: string, utcGuess: Date): number {
  try {
    const name = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
      .formatToParts(utcGuess)
      .find((p) => p.type === 'timeZoneName')?.value
    const match = /GMT([+-])(\d{2}):?(\d{2})?/.exec(name ?? '')
    if (!match) return 0
    return (match[1] === '-' ? -1 : 1) * (+match[2] * 60 + +(match[3] ?? 0))
  } catch {
    if (import.meta.env.DEV) console.warn(`[invitation] Unknown timezone "${timeZone}", calendar times use UTC`)
    return 0
  }
}

function eventWindow(ev: WeddingEvent, cfg: WeddingConfig): { start: Date; end: Date } | null {
  const d = parseDate(ev.date)
  const t = parseTime(ev.time)
  if (!d || !t) return null
  // Wall-clock time in the wedding's timezone, converted to an instant (DST-aware).
  const naive = Date.UTC(d.y, d.m - 1, d.d, t.h, t.m)
  const start = new Date(naive - zoneOffsetMinutes(cfg.timezone, new Date(naive)) * 60_000)
  const end = new Date(start.getTime() + (ev.durationHours ?? 4) * 3600_000)
  return { start, end }
}

/** True only when the event has a real date, time and venue. */
export function canAddToCalendar(ev: WeddingEvent, cfg: WeddingConfig): boolean {
  return !!eventWindow(ev, cfg) && !!ev.venue.trim()
}

function toUtcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function summary(ev: WeddingEvent, cfg: WeddingConfig) {
  const [a, b] = partners(cfg)
  const couple = joinNames(a.person.name.trim() || null, b.person.name.trim() || null)
  return couple ? `${ev.title} · ${couple}` : ev.title
}

export function googleCalendarUrl(ev: WeddingEvent, cfg: WeddingConfig): string | null {
  const w = eventWindow(ev, cfg)
  if (!w) return null
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: summary(ev, cfg),
    dates: `${toUtcStamp(w.start)}/${toUtcStamp(w.end)}`,
    location: [ev.venue, ev.address].filter(Boolean).join(', '),
    ctz: cfg.timezone,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

/** RFC 5545 line folding: content lines may be at most 75 octets. */
function fold(line: string): string {
  const enc = new TextEncoder()
  const out: string[] = []
  let cur = ''
  for (const ch of line) {
    const limit = out.length ? 74 : 75 // continuation lines start with a space
    if (enc.encode(cur + ch).length > limit) {
      out.push(cur)
      cur = ch
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out.join('\r\n ')
}

export function icsFile(ev: WeddingEvent, cfg: WeddingConfig, uid: string): string | null {
  const w = eventWindow(ev, cfg)
  if (!w) return null
  const esc = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\r?\n/g, '\\n')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Royal Wedding Invitation//EN',
    'BEGIN:VEVENT',
    `UID:${uid}-${toUtcStamp(w.start)}@royal-wedding`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(w.start)}`,
    `DTEND:${toUtcStamp(w.end)}`,
    `SUMMARY:${esc(summary(ev, cfg))}`,
    `LOCATION:${esc([ev.venue, ev.address].filter(Boolean).join(', '))}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}

/**
 * iPhones and iPads (including the WhatsApp / Instagram in-app browsers) open a
 * text/calendar data URL straight into Calendar; everyone else gets Google Calendar.
 */
export function addToCalendar(ev: WeddingEvent, cfg: WeddingConfig, uid: string) {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (ios) {
    const ics = icsFile(ev, cfg, uid)
    if (ics) window.location.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
    return
  }
  const url = googleCalendarUrl(ev, cfg)
  if (url) window.open(url, '_blank', 'noopener')
}

/** Text written in Devanagari should be announced with a Hindi voice. */
export function langFor(text: string): string | undefined {
  return /[ऀ-ॣ०-ॿ]/.test(text) ? 'hi' : undefined
}

/* ── The wedding day as a whole (countdown, whole-day calendar entry) ─────── */

/** When the celebrations begin: the earliest dated event, at its time if one is set,
 *  otherwise at the start of that day, in the wedding's timezone. */
/** The events the countdown and "save the date" consider: the chosen one, else all. */
function keyEvents(cfg: WeddingConfig) {
  const chosen = cfg.events.filter((e) => e.id === cfg.countdown.eventId)
  return chosen.length ? chosen : cfg.events
}

export function weddingStart(cfg: WeddingConfig): Date | null {
  const dated = keyEvents(cfg)
    .map((e) => ({ d: parseDate(e.date), t: parseTime(e.time) }))
    .filter((x): x is { d: NonNullable<typeof x.d>; t: ReturnType<typeof parseTime> } => !!x.d)
    .sort((a, b) => Date.UTC(a.d.y, a.d.m - 1, a.d.d, a.t?.h ?? 0, a.t?.m ?? 0) - Date.UTC(b.d.y, b.d.m - 1, b.d.d, b.t?.h ?? 0, b.t?.m ?? 0))
  const first = dated[0]
  if (!first) return null
  const naive = Date.UTC(first.d.y, first.d.m - 1, first.d.d, first.t?.h ?? 0, first.t?.m ?? 0)
  return new Date(naive - zoneOffsetMinutes(cfg.timezone, new Date(naive)) * 60_000)
}

/** Whole days, hours, minutes and seconds until `target` (all zero once it has passed). */
export function timeUntil(target: Date, now = Date.now()) {
  const s = Math.max(0, Math.floor((target.getTime() - now) / 1000))
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60, done: s === 0 }
}

/** The first event's date, for a whole-day "save the date" entry. */
function weddingDay(cfg: WeddingConfig) {
  const days = keyEvents(cfg).map((e) => parseDate(e.date)).filter((d) => !!d).sort((a, b) => Date.UTC(a!.y, a!.m - 1, a!.d) - Date.UTC(b!.y, b!.m - 1, b!.d))
  return days[0] ?? null
}

export const canSaveTheDate = (cfg: WeddingConfig) => !!weddingDay(cfg)

/** Adds the wedding day (all day) to the guest's calendar. */
export function saveTheDate(cfg: WeddingConfig) {
  const d = weddingDay(cfg)
  if (!d) return
  const ymd = (date: Date) => date.toISOString().slice(0, 10).replace(/-/g, '')
  const start = new Date(Date.UTC(d.y, d.m - 1, d.d))
  const end = new Date(start.getTime() + 86_400_000)
  const [a, b] = partners(cfg)
  const couple = joinNames(a.person.name.trim() || null, b.person.name.trim() || null)
  const title = couple ? `Wedding of ${couple}` : 'Wedding celebration'
  const venue = keyEvents(cfg).find((e) => e.venue.trim())?.venue ?? ''
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (ios) {
    const esc = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`)
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Royal Wedding Invitation//EN',
      'BEGIN:VEVENT',
      `UID:wedding-${ymd(start)}@royal-wedding`,
      `DTSTAMP:${toUtcStamp(new Date())}`,
      `DTSTART;VALUE=DATE:${ymd(start)}`,
      `DTEND;VALUE=DATE:${ymd(end)}`,
      fold(`SUMMARY:${esc(title)}`),
      ...(venue ? [fold(`LOCATION:${esc(venue)}`)] : []),
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n') + '\r\n'
    window.location.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
    return
  }
  const params = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${ymd(start)}/${ymd(end)}`, ctz: cfg.timezone })
  if (venue) params.set('location', venue)
  window.open(`https://calendar.google.com/calendar/render?${params}`, '_blank', 'noopener')
}
