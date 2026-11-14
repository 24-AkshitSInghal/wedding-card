import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { StoryChapter, WeddingConfig } from '../config/wedding'
import { canSaveTheDate, langFor, saveTheDate, timeUntil, weddingDateLine, weddingStart } from '../lib/format'
import { celebrate } from '../lib/celebrate'
import { t } from '../lib/i18n'
import { CalendarIcon, Rule } from './Ornaments'
import { TextBlock } from './SceneTexts'
import { SplitText } from './SplitText'

/* Text for the sections around the ceremonies: countdown, story and the welcomes. */

const pad = (n: number) => String(n).padStart(2, '0')

/** Ticks once a second until the wedding begins. */
function Countdown({ target }: { target: Date }) {
  const [left, setLeft] = useState(() => timeUntil(target))
  useEffect(() => {
    const id = window.setInterval(() => setLeft(timeUntil(target)), 1000)
    return () => window.clearInterval(id)
  }, [target])
  if (left.done) return <p className="reveal t-invite">{t('foreverBegun')}</p>
  const units: [number, string][] = [
    [left.days, t('days')],
    [left.hours, t('hours')],
    [left.minutes, t('minutes')],
    [left.seconds, t('seconds')],
  ]
  return (
    <div className="reveal countdown">
      {units.map(([n, label], i) => (
        <span key={label} className="cd-unit">
          <span className="cd-num">{i === 0 ? n : pad(n)}</span>
          <span className="cd-label">{label}</span>
        </span>
      ))}
    </div>
  )
}

/** Share of the foil to scratch away before the card reveals itself completely. */
const REVEAL_AT = 0.3

/** Gold foil the guest scratches away with a finger (or mouse) to reveal what is beneath. */
function ScratchCard({ label, children }: { label: string; children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const wrap = wrapRef.current!
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let scratched = false
    let done = false
    let strokes = 0
    let last: { x: number; y: number } | null = null
    let active = false
    let pointerId = -1

    const paint = () => {
      if (scratched) return
      const { width, height } = wrap.getBoundingClientRect()
      if (!width) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      const foil = ctx.createLinearGradient(0, 0, width, height)
      foil.addColorStop(0, '#b8893f')
      foil.addColorStop(0.35, '#f3d68f')
      foil.addColorStop(0.55, '#d4a552')
      foil.addColorStop(0.8, '#f6e2a8')
      foil.addColorStop(1, '#a87a35')
      ctx.fillStyle = foil
      ctx.fillRect(0, 0, width, height)
      // Fine engraved diagonal hatching and a few sparkles, like printed foil.
      ctx.strokeStyle = 'rgba(120, 80, 30, 0.12)'
      ctx.lineWidth = 1
      for (let x = -height; x < width; x += 6) {
        ctx.beginPath()
        ctx.moveTo(x, height)
        ctx.lineTo(x + height, 0)
        ctx.stroke()
      }
      ctx.fillStyle = 'rgba(255, 252, 235, 0.85)'
      for (let i = 0; i < 18; i++) {
        ctx.beginPath()
        ctx.arc(((i * 53) % 97) / 97 * width, ((i * 31) % 89) / 89 * height, 0.9 + (i % 3) * 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = '#5a3610'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `600 ${Math.max(11, Math.round(height * 0.2))}px Cinzel, 'Tiro Devanagari Hindi', Georgia, serif`
      ctx.fillText(/[a-z]/i.test(label) ? label.toUpperCase() : label, width / 2, height / 2)
    }
    paint()
    document.fonts?.ready.then(paint)
    const ro = new ResizeObserver(paint)
    ro.observe(wrap)

    // Maps a screen position onto the foil's own drawing size (robust to CSS zoom).
    const point = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect()
      const w = canvas.width / dpr()
      const h = canvas.height / dpr()
      return { x: ((clientX - r.left) / r.width) * w, y: ((clientY - r.top) / r.height) * h }
    }
    const dpr = () => Math.min(window.devicePixelRatio || 1, 2)
    const scratchAt = (clientX: number, clientY: number) => {
      const p = point(clientX, clientY)
      // A fingertip-sized brush.
      const radius = Math.max(16, (canvas.height / dpr()) * 0.24)
      ctx.globalCompositeOperation = 'destination-out'
      // Fully opaque, so each stroke removes the foil completely (the hatching left a faint colour).
      ctx.strokeStyle = '#000'
      ctx.lineCap = 'round'
      ctx.lineWidth = radius * 2
      ctx.beginPath()
      ctx.moveTo(last?.x ?? p.x, last?.y ?? p.y)
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
      last = p
      scratched = true
      if (++strokes % 5 === 0) check()
    }
    const cleared = () => {
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
      let clear = 0
      let total = 0
      for (let i = 3; i < data.length; i += 4 * 24) {
        total++
        if (data[i] < 40) clear++
      }
      return clear / total
    }
    // Once about a third of the foil is gone, the rest falls away by itself with a burst
    // of glitter and confetti, and a shower of petals across the scene.
    const reveal = () => {
      if (done) return
      done = true
      setRevealed(true)
      navigator.vibrate?.(35)
      celebrate(wrap, document.querySelector('.is-lite') !== null)
      window.dispatchEvent(new CustomEvent('invite:celebrate'))
    }
    const check = () => {
      if (!done && cleared() >= REVEAL_AT) reveal()
    }
    const begin = (x: number, y: number) => {
      active = true
      last = null
      scratchAt(x, y)
    }
    const end = () => {
      if (!active) return
      active = false
      last = null
      check()
    }

    /* Mouse and pen (and touch where pointer events are reliable). The pointer is tracked
       by id rather than by pointer capture, which some phones do not keep for touch. */
    const onPointerDown = (e: PointerEvent) => {
      if (done || (e.pointerType === 'mouse' && e.button !== 0)) return
      e.preventDefault() // no text selection or image drag from the press
      pointerId = e.pointerId
      try {
        canvas.setPointerCapture(e.pointerId)
      } catch {
        // Not essential: moves are matched by pointer id.
      }
      begin(e.clientX, e.clientY)
    }
    const onPointerMove = (e: PointerEvent) => {
      if (done || !active || e.pointerId !== pointerId) return
      e.preventDefault()
      scratchAt(e.clientX, e.clientY)
    }
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId === pointerId) end()
    }
    /* Touch events as well: on phones the browser may cancel the pointer stream to scroll or
       zoom, but touchmove keeps arriving, and blocking its default keeps the page still.
       Scratching the same spot twice is harmless. */
    const onTouchStart = (e: TouchEvent) => {
      if (done) return
      e.preventDefault()
      const t = e.touches[0]
      if (!active) begin(t.clientX, t.clientY)
    }
    const onTouchMove = (e: TouchEvent) => {
      if (done) return
      e.preventDefault()
      const t = e.touches[0]
      if (!active) begin(t.clientX, t.clientY)
      else scratchAt(t.clientX, t.clientY)
    }
    const touchOpts = { passive: false } as const
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    canvas.addEventListener('touchstart', onTouchStart, touchOpts)
    canvas.addEventListener('touchmove', onTouchMove, touchOpts)
    canvas.addEventListener('touchend', end)
    canvas.addEventListener('touchcancel', end)
    return () => {
      ro.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', end)
      canvas.removeEventListener('touchcancel', end)
    }
  }, [label])

  return (
    <div ref={wrapRef} className={`reveal scratch${revealed ? ' is-revealed' : ''}`}>
      <div className="scratch-under">{children}</div>
      <canvas ref={canvasRef} className="scratch-foil" />
    </div>
  )
}

export function CountdownText({ cfg, top }: { cfg: WeddingConfig; top: number }) {
  const [target] = useState(() => weddingStart(cfg))
  const date = weddingDateLine(cfg)
  return (
    <TextBlock top={top} width={80}>
      {cfg.countdown.mantra.trim() && (
        <p className="reveal t-mantra" lang={langFor(cfg.countdown.mantra)}>
          {cfg.countdown.mantra}
        </p>
      )}
      <p className="t-countdown-title gilt">
        <SplitText text={cfg.countdown.title} />
      </p>
      {target && <Countdown target={target} />}
      {date && (
        <ScratchCard label={cfg.countdown.scratchLabel}>
          <span className="scratch-kicker">{t('saveTheDate')}</span>
          <span className="scratch-date">{date}</span>
        </ScratchCard>
      )}
      {canSaveTheDate(cfg) && (
        <p className="reveal t-actions">
          <button type="button" className="t-link" tabIndex={-1} onClick={() => saveTheDate(cfg)}>
            <CalendarIcon />
            {t('addToCalendar')}
          </button>
        </p>
      )}
    </TextBlock>
  )
}

export function StoryText({ cfg, chapters, intro, top }: { cfg: WeddingConfig; chapters: StoryChapter[]; intro?: boolean; top: number }) {
  return (
    <TextBlock top={top} width={66}>
      {intro && (
        <>
          <p className="t-event-title t-story-title gilt">
            <SplitText text={cfg.story.title} />
          </p>
          <Rule />
          {cfg.story.intro.trim() && <p className="reveal t-story-intro">{cfg.story.intro}</p>}
          <Rule />
        </>
      )}
      {chapters.map((c) => (
        <div key={c.title} className="chapter">
          <p className="t-chapter-title gilt">
            <SplitText text={c.title} />
          </p>
          <p className="reveal t-chapter-text">{c.text}</p>
        </div>
      ))}
      {!intro && <Rule />}
    </TextBlock>
  )
}

export function LittleHeartsText({ cfg, top }: { cfg: WeddingConfig; top: number }) {
  const { title, names, message } = cfg.littleHearts
  // English names joined with "&" go one per line; other joins (e.g. "एवं") stay on one line.
  const parts = names.split(/\s+&\s+/).map((n) => n.trim()).filter(Boolean)
  return (
    <TextBlock top={top} width={78}>
      <p className="reveal t-caps">{title}</p>
      {parts.length > 0 && (
        <p className="t-little-names gilt">
          {parts.map((n, i) => (
            <span key={n}>
              {i > 0 && (
                <span className="amp">
                  <span className="ch">&amp;</span>
                </span>
              )}
              <SplitText className="nm" text={n} />
            </span>
          ))}
        </p>
      )}
      {message.map((m) => (
        <p key={m} className="reveal t-little-msg">
          {m}
        </p>
      ))}
    </TextBlock>
  )
}

export function FamilyWelcomeText({ cfg, part, top }: { cfg: WeddingConfig; part: 'hearty' | 'special'; top: number }) {
  const { heartyTitle, hearty, specialTitle, special } = cfg.welcome
  const [title, names] = part === 'hearty' ? [heartyTitle, hearty] : [specialTitle, special]
  return (
    <TextBlock top={top} width={88}>
      <p className="t-welcome-title gilt">
        <SplitText text={title} />
      </p>
      <Rule />
      <ul className="reveal name-list">
        {names.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <Rule />
    </TextBlock>
  )
}

/** The same sections for the screen-reader version of the invitation. */
export function ScreenReaderSections({ cfg, part }: { cfg: WeddingConfig; part: 'before-events' | 'after-events' }) {
  if (part === 'before-events') {
    const target = weddingStart(cfg)
    return (
      <>
        {cfg.countdown.show && target && (
          <section>
            {cfg.countdown.mantra.trim() && <p lang={langFor(cfg.countdown.mantra)}>{cfg.countdown.mantra}</p>}
            <h2>{cfg.countdown.title}</h2>
            <p>{weddingDateLine(cfg)}</p>
            <button type="button" onClick={() => saveTheDate(cfg)}>
              {t('addToCalendar')}
            </button>
          </section>
        )}
        {cfg.story.chapters.length > 0 && (
          <section>
            <h2>{cfg.story.title}</h2>
            <p>{cfg.story.intro}</p>
            {cfg.story.chapters.map((c) => (
              <p key={c.title}>
                {c.title}: {c.text}
              </p>
            ))}
          </section>
        )}
      </>
    )
  }
  const { littleHearts: lh, welcome } = cfg
  return (
    <>
      {(lh.names.trim() || lh.message.length > 0) && (
        <section>
          <h2>{lh.title}</h2>
          {lh.names.trim() && <p>{lh.names}</p>}
          {lh.message.map((m) => (
            <p key={m}>{m}</p>
          ))}
        </section>
      )}
      {welcome.hearty.length > 0 && (
        <section>
          <h2>{welcome.heartyTitle}</h2>
          <ul>
            {welcome.hearty.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>
      )}
      {welcome.special.length > 0 && (
        <section>
          <h2>{welcome.specialTitle}</h2>
          <ul>
            {welcome.special.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
