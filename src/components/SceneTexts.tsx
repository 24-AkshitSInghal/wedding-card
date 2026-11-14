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
  telHref,
} from '../lib/format'
import { artUrl } from '../lib/art'
import { t } from '../lib/i18n'
import { CalendarIcon, Henna, PinIcon, Rule } from './Ornaments'
import { SplitText } from './SplitText'

/*
 * The painted scenes are decorative (aria-hidden) and their links are pointer-only;
 * `ScreenReaderInvitation` at the bottom carries the same content for assistive tech and
 * keyboard users, independent of where the guest has scrolled.
 */

interface BlockProps {
  /** Vertical centre of the block as a fraction of the frame's height. */
  top: number
  width?: number
  children: ReactNode
}

/** Text block centred on a line inside the frame. `.reveal` children are faded in by the timeline. */
export function TextBlock({ top, width, children }: BlockProps) {
  return (
    <div className="scene-text" data-d="0" data-role="text" style={{ '--mid': top, '--tw': width ?? 74 } as CSSProperties}>
      <div className="scene-text-inner">{children}</div>
    </div>
  )
}

/** A line that may be a placeholder (dimmed) or hidden entirely. */
export function Line({ value, placeholder, cfg, className }: { value?: string; placeholder: string; cfg: WeddingConfig; className: string }) {
  const text = field(value, placeholder, cfg)
  if (text === null) return null
  const isPlaceholder = !(value ?? '').trim()
  return <p className={`reveal ${className}${isPlaceholder ? ' is-placeholder' : ''}`}>{text}</p>
}

function eventTime(ev: WeddingEvent) {
  if (!ev.time.trim()) return ''
  const suffix = ev.timeSuffix === undefined ? t('onwards') : ev.timeSuffix.trim()
  return suffix ? `${formatTime(ev.time)} ${suffix}` : formatTime(ev.time)
}

export function CoupleText({ cfg, top }: { cfg: WeddingConfig; top: number }) {
  const [bride, groom] = coupleNames(cfg)
  return (
    <TextBlock top={top} width={72}>
      <p className="reveal t-caps">{cfg.coupleLead}</p>
      {(bride || groom) && (
        <p className="t-names gilt shine">
          {bride && <SplitText className="nm" text={bride} />}
          {bride && groom && (
            <span className="amp">
              <span className="ch" style={{ '--i': bride.length } as CSSProperties}>
                &amp;
              </span>
            </span>
          )}
          {groom && <SplitText className="nm" text={groom} start={bride ? bride.length + 1 : 0} />}
        </p>
      )}
      <p className="reveal t-invite">{cfg.coupleInvite}</p>
      {cfg.hashtag.trim() && <p className="reveal t-hashtag">{cfg.hashtag}</p>}
    </TextBlock>
  )
}

function parentsLine(prefix: string, value: string, who: string, cfg: WeddingConfig, city = '') {
  const text = field(value, `${who}'s Parents`, cfg)
  if (text === null) return null
  const from = city.trim() ? `, ${city.trim()}` : ''
  return { text: `(${prefix} ${text}${from})`, placeholder: !value.trim() }
}

export function BlessingText({ cfg, top }: { cfg: WeddingConfig; top: number }) {
  const [shortBride, shortGroom] = coupleNames(cfg)
  const bride = cfg.bride.fullName.trim() || shortBride
  const groom = cfg.groom.fullName.trim() || shortGroom
  const bp = parentsLine(cfg.brideParentsPrefix, cfg.bride.parents, 'Bride', cfg, cfg.bride.city)
  const gp = parentsLine(cfg.groomParentsPrefix, cfg.groom.parents, 'Groom', cfg, cfg.groom.city)
  return (
    <TextBlock top={top} width={82}>
      {/* Shri Ganesh heads the formal invitation, as on every traditional card. */}
      <div className="reveal blessing-ganesha">
        <img data-src={artUrl('ganesha')} alt="" draggable={false} />
      </div>
      {cfg.invocation.trim() && (
        <p className="reveal t-invocation" lang={langFor(cfg.invocation)}>
          {cfg.invocation}
        </p>
      )}
      {cfg.invocation.trim() && cfg.invocationMeaning.trim() && (
        <p className="reveal t-invocation-meaning">{cfg.invocationMeaning}</p>
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

/** The venue on a slide of its own: name, address and a link to the map. */
export function VenueText({ cfg, ev, top }: { cfg: WeddingConfig; ev: WeddingEvent; top: number }) {
  const map = safeUrl(ev.mapUrl)
  return (
    <TextBlock top={top} width={76}>
      <p className="t-event-title gilt">
        <SplitText text={t('venue')} />
      </p>
      <Rule />
      <Line value={ev.venue} placeholder="Venue" cfg={cfg} className="t-venue t-venue--big" />
      {ev.address?.trim() && <p className="reveal t-address">{ev.address}</p>}
      {map && (
        <p className="reveal t-actions">
          <a className="t-link" href={map} target="_blank" rel="noopener noreferrer" tabIndex={-1}>
            <PinIcon />
            {t('viewVenue')}
          </a>
        </p>
      )}
      <Rule />
    </TextBlock>
  )
}

/** Every event on one slide: the date once, then each title with its time. */
export function ScheduleText({ cfg, top, henna }: { cfg: WeddingConfig; top: number; henna?: boolean }) {
  const first = cfg.events[0]
  const showCalendar = first && canAddToCalendar(first, cfg)
  return (
    <TextBlock top={top} width={76}>
      {henna && <Henna />}
      {first && <Line value={first.date.trim() ? formatDate(first.date) : ''} placeholder="Date" cfg={cfg} className="t-event-date" />}
      {cfg.events.map((ev, i) => (
        <div key={eventUid(ev, i)} className="schedule-item">
          {i > 0 && <Rule />}
          <p className="t-event-title gilt">
            <SplitText text={ev.title} />
          </p>
          {ev.note?.trim() && <p className="reveal t-event-note">{ev.note}</p>}
          <Line value={eventTime(ev)} placeholder="Time" cfg={cfg} className="t-event-time" />
        </div>
      ))}
      {showCalendar && (
        <p className="reveal t-actions">
          <button type="button" className="t-link" tabIndex={-1} onClick={() => addToCalendar(first, cfg, eventUid(first, 0))}>
            <CalendarIcon />
            {t('addToCalendar')}
          </button>
        </p>
      )}
      {henna && <Henna flip />}
    </TextBlock>
  )
}

/** A single line resting on its own scene. */
export function EveningText({ cfg, top }: { cfg: WeddingConfig; top: number }) {
  return (
    <TextBlock top={top} width={80}>
      <Rule />
      <p className="t-evening gilt">
        <SplitText text={cfg.eveningLine} />
      </p>
      <Rule />
    </TextBlock>
  )
}

export function ClosingText({ cfg, top }: { cfg: WeddingConfig; top: number }) {
  const rsvp = safeUrl(cfg.rsvp.url)
  const [bf, gf] = familyNames(cfg)
  return (
    <TextBlock top={top} width={84}>
      <p className="reveal t-with-love">{cfg.closing.lead}</p>
      {/* Signed by the hosting family. */}
      {(bf || gf) && (
        <p className="t-families gilt">
          <SplitText className="fam" text={(bf || gf) as string} />
        </p>
      )}
      <Rule />
      <p className="reveal t-closing-msg">{cfg.closing.message}</p>
      {cfg.closing.blessing.trim() && <p className="reveal t-blessing">{cfg.closing.blessing}</p>}
      {cfg.rsvp.contacts.length > 0 && (
        <div className="reveal t-contacts">
          <p className="t-contacts-label">{t('rsvp')}</p>
          {cfg.rsvp.contacts.map((c) => (
            <a key={c.phone} className="t-contact" href={telHref(c.phone)} tabIndex={-1}>
              <span>{c.name}</span>
              <span className="t-phone">{c.phone}</span>
            </a>
          ))}
        </div>
      )}
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
export function ScreenReaderInvitation({
  cfg,
  beforeEvents,
  afterEvents,
}: {
  cfg: WeddingConfig
  beforeEvents?: ReactNode
  afterEvents?: ReactNode
}) {
  const [bride, groom] = coupleNames(cfg)
  const [bf, gf] = familyNames(cfg)
  const rsvp = safeUrl(cfg.rsvp.url)
  // Placeholders are for the person editing the invitation, not for screen-reader guests.
  const real = (v: string | null) => (v && !v.startsWith('[') ? v : null)
  const bp = parentsLine(cfg.brideParentsPrefix, cfg.bride.parents, 'Bride', cfg, cfg.bride.city)
  const gp = parentsLine(cfg.groomParentsPrefix, cfg.groom.parents, 'Groom', cfg, cfg.groom.city)
  const families = real(bf) || real(gf)
  return (
    <main className="sr-invitation">
      <h1>{joinNames(real(bride), real(groom)) || 'Wedding invitation'}</h1>
      <p>{cfg.coupleLead}</p>
      <p>{cfg.coupleInvite}</p>
      {cfg.hashtag.trim() && <p>{cfg.hashtag}</p>}

      <section>
        {cfg.invocation.trim() && <p lang={langFor(cfg.invocation)}>{cfg.invocation}</p>}
        {cfg.invocation.trim() && cfg.invocationMeaning.trim() && <p>{cfg.invocationMeaning}</p>}
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

      {beforeEvents}

      {cfg.events.map((ev, i) => {
        const map = safeUrl(ev.mapUrl)
        return (
          <section key={eventUid(ev, i)}>
            <h2>{ev.title}</h2>
            {ev.note?.trim() && <p>{ev.note}</p>}
            {ev.date.trim() && <p>{formatDate(ev.date)}</p>}
            {ev.time.trim() && <p>{eventTime(ev)}</p>}
            {ev.venue.trim() && (
              <p>
                {t('venue')}: {ev.venue}
              </p>
            )}
            {ev.address?.trim() && <p>{ev.address}</p>}
            {map && (
              <a href={map} target="_blank" rel="noopener noreferrer">
                {t('viewVenue')} - {ev.title}
              </a>
            )}
            {canAddToCalendar(ev, cfg) && (
              <button type="button" onClick={() => addToCalendar(ev, cfg, eventUid(ev, i))}>
                {t('addToCalendar')} - {ev.title}
              </button>
            )}
          </section>
        )
      })}

      {afterEvents}

      <section>
        <h2>{cfg.closing.lead}</h2>
        {families && <p>{families}</p>}
        <p>{cfg.closing.message}</p>
        {cfg.closing.blessing.trim() && <p>{cfg.closing.blessing}</p>}
        {cfg.rsvp.contacts.map((c) => (
          <a key={c.phone} href={telHref(c.phone)}>
            {t('rsvp')}: {c.name}, {c.phone}
          </a>
        ))}
        {rsvp && (
          <a href={rsvp} {...(opensInNewTab(rsvp) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {cfg.rsvp.label}
          </a>
        )}
      </section>
    </main>
  )
}
