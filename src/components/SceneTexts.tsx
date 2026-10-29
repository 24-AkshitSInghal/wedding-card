import type { CSSProperties, ReactNode } from 'react'
import type { WeddingConfig, WeddingEvent } from '../config/wedding'
import {
  addToCalendar,
  canAddToCalendar,
  coupleNames,
  eventUid,
  familyNames,
  field,
  formatDate,
  formatTime,
  joinNames,
  langFor,
  opensInNewTab,
  safeUrl,
  weddingDateLine,
} from '../lib/format'
import { CalendarIcon, Henna, PinIcon, Rule } from './Ornaments'
import { SplitText } from './SplitText'

/*
 * The painted scenes are decorative (aria-hidden) and their links are pointer-only;
 * `ScreenReaderInvitation` at the bottom carries the same content for assistive tech and
 * keyboard users, independent of where the guest has scrolled.
 */

interface BlockProps {
  top: number
  width?: number
  children: ReactNode
}

/** Text block positioned inside the frame. `.reveal` children are faded in by the timeline. */
function TextBlock({ top, width, children }: BlockProps) {
  return (
    <div className="scene-text" data-d="0" data-role="text" style={{ '--top': top, '--tw': width ?? 74 } as CSSProperties}>
      {children}
    </div>
  )
}

/** A line that may be a placeholder (dimmed) or hidden entirely. */
function Line({ value, placeholder, cfg, className }: { value?: string; placeholder: string; cfg: WeddingConfig; className: string }) {
  const text = field(value, placeholder, cfg)
  if (text === null) return null
  const isPlaceholder = !(value ?? '').trim()
  return <p className={`reveal ${className}${isPlaceholder ? ' is-placeholder' : ''}`}>{text}</p>
}

function eventTime(ev: WeddingEvent) {
  if (!ev.time.trim()) return ''
  const suffix = ev.timeSuffix === undefined ? 'onwards' : ev.timeSuffix.trim()
  return suffix ? `${formatTime(ev.time)} ${suffix}` : formatTime(ev.time)
}

export function CoupleText({ cfg, top }: { cfg: WeddingConfig; top: number }) {
  const [bride, groom] = coupleNames(cfg)
  return (
    <TextBlock top={top} width={60}>
      <p className="reveal t-caps">{cfg.coupleLead}</p>
      {(bride || groom) && (
        <p className="t-names gilt">
          {bride && <SplitText className="nm" text={bride} />}
          {bride && groom && (
            <span className="amp">
              <span className="ch">&amp;</span>
            </span>
          )}
          {groom && <SplitText className="nm" text={groom} />}
        </p>
      )}
      <p className="reveal t-invite">{cfg.coupleInvite}</p>
      <Line value={weddingDateLine(cfg)} placeholder="Wedding Date" cfg={cfg} className="t-date" />
      <Line value={cfg.location} placeholder="Venue" cfg={cfg} className="t-location" />
    </TextBlock>
  )
}

function parentsLine(prefix: string, value: string, who: string, cfg: WeddingConfig) {
  const text = field(value, `${who}'s Parents`, cfg)
  if (text === null) return null
  return { text: `(${prefix} ${text})`, placeholder: !value.trim() }
}

export function BlessingText({ cfg, top }: { cfg: WeddingConfig; top: number }) {
  const [shortBride, shortGroom] = coupleNames(cfg)
  const bride = cfg.bride.fullName.trim() || shortBride
  const groom = cfg.groom.fullName.trim() || shortGroom
  const bp = parentsLine(cfg.brideParentsPrefix, cfg.bride.parents, 'Bride', cfg)
  const gp = parentsLine(cfg.groomParentsPrefix, cfg.groom.parents, 'Groom', cfg)
  return (
    <TextBlock top={top} width={82}>
      {cfg.invocation.trim() && (
        <p className="reveal t-invocation" lang={langFor(cfg.invocation)}>
          {cfg.invocation}
        </p>
      )}
      <p className="reveal t-message">{cfg.invitationMessage}</p>
      {bride && (
        <p className="t-fullname gilt">
          <SplitText text={bride} />
        </p>
      )}
      {bp && <p className={`reveal t-parents${bp.placeholder ? ' is-placeholder' : ''}`}>{bp.text}</p>}
      {bride && groom && (
        <p className="t-and gilt">
          <span className="ch">&amp;</span>
        </p>
      )}
      {groom && (
        <p className="t-fullname gilt">
          <SplitText text={groom} />
        </p>
      )}
      {gp && <p className={`reveal t-parents${gp.placeholder ? ' is-placeholder' : ''}`}>{gp.text}</p>}
    </TextBlock>
  )
}

export function EventText({ cfg, ev, uid, top, henna }: { cfg: WeddingConfig; ev: WeddingEvent; uid: string; top: number; henna?: boolean }) {
  const time = eventTime(ev)
  const venue = field(ev.venue, 'Venue', cfg)
  const showCalendar = canAddToCalendar(ev, cfg)
  const map = safeUrl(ev.mapUrl)
  return (
    <TextBlock top={top} width={62}>
      {henna && <Henna />}
      <p className="t-event-title gilt">
        <SplitText text={ev.title} />
      </p>
      <Line value={ev.date.trim() ? formatDate(ev.date) : ''} placeholder="Date" cfg={cfg} className="t-event-date" />
      <Line value={time} placeholder="Time" cfg={cfg} className="t-event-time" />
      {venue !== null && <p className="reveal t-venue-label">Venue</p>}
      <Line value={ev.venue} placeholder="Venue" cfg={cfg} className="t-venue" />
      {ev.address?.trim() && <p className="reveal t-address">{ev.address}</p>}
      {(map || showCalendar) && (
        <p className="reveal t-actions">
          {map && (
            <a className="t-link" href={map} target="_blank" rel="noopener noreferrer" tabIndex={-1}>
              <PinIcon />
              View venue
            </a>
          )}
          {showCalendar && (
            <button type="button" className="t-link" tabIndex={-1} onClick={() => addToCalendar(ev, cfg, uid)}>
              <CalendarIcon />
              Add to calendar
            </button>
          )}
        </p>
      )}
      {henna && <Henna flip />}
    </TextBlock>
  )
}

export function ClosingText({ cfg, top }: { cfg: WeddingConfig; top: number }) {
  const rsvp = safeUrl(cfg.rsvp.url)
  const [bf, gf] = familyNames(cfg)
  return (
    <TextBlock top={top}>
      <p className="reveal t-with-love">{cfg.closing.lead}</p>
      {(bf || gf) && (
        <p className="t-families gilt">
          {bf && <SplitText className="fam" text={bf} />}
          {bf && gf && ' '}
          {gf && <SplitText className="fam" text={bf ? `& ${gf}` : gf} />}
        </p>
      )}
      <Rule />
      <p className="reveal t-closing-msg">{cfg.closing.message}</p>
      {cfg.closing.blessing.trim() && <p className="reveal t-blessing">{cfg.closing.blessing}</p>}
      {rsvp && (
        <p className="reveal t-rsvp">
          <a
            className="rsvp-seal"
            href={rsvp}
            tabIndex={-1}
            {...(opensInNewTab(rsvp) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {cfg.rsvp.label}
          </a>
        </p>
      )}
    </TextBlock>
  )
}

/**
 * The whole invitation as plain, ordered, semantic HTML. It is visually hidden, but its
 * links and buttons appear as a small chip when focused, so keyboard guests can use them.
 */
export function ScreenReaderInvitation({ cfg }: { cfg: WeddingConfig }) {
  const [bride, groom] = coupleNames(cfg)
  const [bf, gf] = familyNames(cfg)
  const date = weddingDateLine(cfg)
  const rsvp = safeUrl(cfg.rsvp.url)
  // Placeholders are for the person editing the invitation, not for screen-reader guests.
  const real = (v: string | null) => (v && !v.startsWith('[') ? v : null)
  const bp = parentsLine(cfg.brideParentsPrefix, cfg.bride.parents, 'Bride', cfg)
  const gp = parentsLine(cfg.groomParentsPrefix, cfg.groom.parents, 'Groom', cfg)
  const families = joinNames(real(bf), real(gf))
  return (
    <main className="sr-invitation">
      <h1>{joinNames(real(bride), real(groom)) || 'Wedding invitation'}</h1>
      <p>{cfg.coupleLead}</p>
      <p>{cfg.coupleInvite}</p>
      {date && <p>{date}</p>}
      {cfg.location.trim() && <p>{cfg.location}</p>}

      <section>
        {cfg.invocation.trim() && <p lang={langFor(cfg.invocation)}>{cfg.invocation}</p>}
        <p>{cfg.invitationMessage}</p>
        {(cfg.bride.fullName.trim() || real(bride)) && (
          <p>
            {cfg.bride.fullName.trim() || real(bride)} {bp && !bp.placeholder ? bp.text : ''}
          </p>
        )}
        {(cfg.groom.fullName.trim() || real(groom)) && (
          <p>
            {cfg.groom.fullName.trim() || real(groom)} {gp && !gp.placeholder ? gp.text : ''}
          </p>
        )}
      </section>

      {cfg.events.map((ev, i) => {
        const map = safeUrl(ev.mapUrl)
        return (
          <section key={eventUid(ev, i)}>
            <h2>{ev.title}</h2>
            {ev.date.trim() && <p>{formatDate(ev.date)}</p>}
            {ev.time.trim() && <p>{eventTime(ev)}</p>}
            {ev.venue.trim() && <p>Venue: {ev.venue}</p>}
            {ev.address?.trim() && <p>{ev.address}</p>}
            {map && (
              <a href={map} target="_blank" rel="noopener noreferrer">
                View venue for {ev.title}
              </a>
            )}
            {canAddToCalendar(ev, cfg) && (
              <button type="button" onClick={() => addToCalendar(ev, cfg, eventUid(ev, i))}>
                Add {ev.title} to calendar
              </button>
            )}
          </section>
        )
      })}

      <section>
        <h2>{cfg.closing.lead}</h2>
        {families && <p>{families}</p>}
        <p>{cfg.closing.message}</p>
        {cfg.closing.blessing.trim() && <p>{cfg.closing.blessing}</p>}
        {rsvp && (
          <a href={rsvp} {...(opensInNewTab(rsvp) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {cfg.rsvp.label}
          </a>
        )}
      </section>
    </main>
  )
}
