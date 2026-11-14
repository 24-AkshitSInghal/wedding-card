import gsap from 'gsap'
import { Observer } from 'gsap/Observer'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Particles } from './components/Particles'
import type { ParticlesHandle } from './components/Particles'
import { Scene } from './components/Scene'
import { ScreenReaderInvitation } from './components/SceneTexts'
import { ScreenReaderSections } from './components/SectionTexts'
import { wedding, weddingHi } from './config/card'
import { createPreloader, isLiteDevice, whenLoaded } from './engine/preload'
import { buildScenes } from './engine/schedule'
import { buildTimeline } from './engine/timeline'
import { artUrl } from './lib/art'
import { localize, t } from './lib/i18n'
import { music } from './lib/music'
import type { Lang } from './lib/i18n'
import './styles/text.css'
import './styles/scenes.css'

gsap.registerPlugin(ScrollTrigger, Observer, ScrollToPlugin)
ScrollTrigger.config({ ignoreMobileResize: true })

/** Only the gateway loads with the page; everything else streams in once it is on screen. */
const EAGER_SCENES = 1

/** `?reduce-motion` previews the reduced-motion experience without changing OS settings. */
const FORCE_REDUCE = new URLSearchParams(window.location.search).has('reduce-motion')
const REDUCE_QUERY = FORCE_REDUCE ? 'all' : '(prefers-reduced-motion: reduce)'
const MOTION_QUERY = FORCE_REDUCE ? 'not all' : '(prefers-reduced-motion: no-preference)'

interface Props {
  lang: Lang
  onToggleLang: () => void
}

export default function App({ lang, onToggleLang }: Props) {
  const cfg = useMemo(() => localize(wedding, lang === 'hi' ? weddingHi : null), [lang])
  const { scenes, total } = useMemo(() => buildScenes(cfg), [cfg])
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const bloomRef = useRef<HTMLDivElement>(null)
  const particles = useRef<ParticlesHandle>(null)
  const [ready, setReady] = useState(false)
  // The guest opens the invitation with a tap, which is what lets the song play from the
  // very start (browsers allow sound only after a tap). Asked once per visit.
  const [opened, setOpened] = useState(music.opened)
  const shown = ready && opened
  const [lite, setLite] = useState(isLiteDevice)
  const [reduced, setReduced] = useState(() => window.matchMedia(REDUCE_QUERY).matches)

  // Once loaded, try to start the song straight away; where the browser allows it, the
  // invitation opens without the tap.
  useEffect(() => {
    if (!ready || opened) return
    let live = true
    void music.play().then((ok) => {
      if (ok && live) {
        music.markOpened()
        setOpened(true)
      }
    })
    return () => {
      live = false
    }
  }, [ready, opened])
  const open = () => {
    void music.play()
    music.markOpened()
    setOpened(true)
  }

  // The scratch card's reveal sends a shower of petals across the whole scene.
  useEffect(() => {
    const shower = () => particles.current?.burst(28)
    window.addEventListener('invite:celebrate', shower)
    return () => window.removeEventListener('invite:celebrate', shower)
  }, [])

  // If the device struggles once the gateway is on screen, fall back to the lighter look.
  useEffect(() => {
    if (!shown || lite) return
    const deltas: number[] = []
    const start = performance.now()
    let last = 0
    let raf = 0
    const tick = (t: number) => {
      if (last) deltas.push(t - last)
      last = t
      if (t - start < 4000) {
        raf = requestAnimationFrame(tick)
        return
      }
      // Background tabs barely tick, so only judge a page that was actually being drawn.
      if (document.visibilityState !== 'visible' || deltas.length < 40) return
      const median = [...deltas].sort((a, b) => a - b)[deltas.length >> 1]
      if (median > 26) setLite(true)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [shown, lite])

  // Follow the guest's motion preference if it changes while the page is open.
  useEffect(() => {
    const mq = window.matchMedia(REDUCE_QUERY)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useLayoutEffect(() => {
    const root = rootRef.current!
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    const preloader = createPreloader(root)
    const firstImages = Array.from(root.querySelectorAll<HTMLImageElement>('[data-scene="0"] img[src]'))
    let idleTimer = 0
    let loaded = false
    let current = 0
    whenLoaded(firstImages, 5000).then(() => {
      loaded = true
      setReady(true)
      preloader.around(current)
      idleTimer = window.setTimeout(() => preloader.idle(), 1800)
    })

    const mm = gsap.matchMedia()
    // matchMedia only runs the callback while at least one condition matches, so both are listed.
    mm.add({ reduce: REDUCE_QUERY, motion: MOTION_QUERY }, (c) => {
      const m = c.conditions?.reduce ? 0 : 1
      const { tl, rts } = buildTimeline({ root, scenes, m, bloom: bloomRef.current! })

      const visible: boolean[] = rts.map(() => false)
      let shown = -1
      const sync = () => {
        const time = tl.time()
        let latest = 0
        rts.forEach((s, i) => {
          const vis = time >= s.model.start - 1e-3 && time <= s.model.end + 1e-3
          if (vis !== visible[i]) {
            visible[i] = vis
            s.el.classList.toggle('is-off', !vis)
            s.el.classList.toggle('is-active', vis)
          }
          if (time >= s.model.start) latest = i
        })
        // The language switch belongs to the threshold of the palace.
        root.classList.toggle('at-start', time < scenes[0].exitAt + 0.15)
        if (latest !== shown) {
          // Scrolling forward into a scene greets it with a shower of its flowers.
          const arriving = shown >= 0 && latest > shown
          shown = current = latest
          // Hold back later scenes until the gateway itself has arrived.
          if (loaded) preloader.around(current)
          const { air, shower } = scenes[current].preset
          particles.current?.setMood(air)
          if (arriving && shower) particles.current?.burst(shower)
        }
      }
      tl.eventCallback('onUpdate', sync)

      const st = ScrollTrigger.create({
        trigger: trackRef.current,
        start: 'top top',
        end: 'bottom bottom',
        animation: tl,
        // The glide itself is eased, so the scene follows the scroll directly (no lag).
        scrub: m ? 0.12 : true,
        invalidateOnRefresh: true,
        onUpdate: (self) => particles.current?.nudge(self.getVelocity()),
      })
      // Created inside matchMedia after the page has loaded, the trigger is not measured
      // automatically; measure it now so scroll maps onto the timeline from the start.
      st.refresh()

      // The track is measured in viewport heights, so a rotation or window resize changes
      // what a scroll pixel means. Keep the guest at the same point in the story instead.
      let savedProgress = 0
      const onRefreshInit = () => {
        savedProgress = st.progress
      }
      const onRefresh = () => {
        const y = st.start + savedProgress * (st.end - st.start)
        if (Math.abs(window.scrollY - y) > 2) window.scrollTo(0, y)
      }
      ScrollTrigger.addEventListener('refreshInit', onRefreshInit)
      ScrollTrigger.addEventListener('refresh', onRefresh)
      tl.progress(st.progress)
      sync()

      /* Checkpoints: every swipe, wheel flick or arrow key glides to the next (or previous)
         scene and comes to rest once its words have appeared. */
      const stops = scenes.map((s, i) =>
        i === 0 ? 0 : s.kind === 'closing' ? s.exitAt : Math.min(s.restAt + 0.5, s.exitAt - 0.05),
      )
      const span = () => st.end - st.start
      const timeAt = () => ((window.scrollY - st.start) / span()) * total
      let glideTween: gsap.core.Tween | null = null
      let heading: number | null = null
      let quietUntil = 0
      let swipeUsed = false
      const glide = (dir: 1 | -1, redirect = false) => {
        if (glideTween && !redirect) return
        if (!glideTween && performance.now() < quietUntil) return
        // A fresh swipe during a glide carries on from where that glide was heading.
        const T = glideTween && heading !== null ? heading : timeAt()
        const target = dir > 0 ? stops.find((x) => x > T + 0.05) : [...stops].reverse().find((x) => x < T - 0.05)
        if (target === undefined) return
        glideTween?.kill()
        heading = target
        const distance = Math.abs(target - timeAt())
        glideTween = gsap.to(window, {
          scrollTo: { y: st.start + (target / total) * span(), autoKill: false },
          duration: m ? Math.min(2.4, 0.9 + distance * 0.45) : 0.6,
          // Moves the moment the finger does, then settles gently into the checkpoint.
          ease: 'power2.out',
          onComplete: () => {
            glideTween = null
            heading = null
            // Swallow the tail of a trackpad's momentum so one flick moves one scene.
            quietUntil = performance.now() + 220
          },
        })
      }
      const isTouch = (o: Observer) => !!o.event && o.event.type.startsWith('touch')
      const observer = Observer.create({
        target: window,
        type: 'wheel,touch',
        wheelSpeed: -1,
        tolerance: 6,
        dragMinimum: 4,
        preventDefault: true,
        ignore: '.scratch, .lang-toggle, .sound-toggle, .sr-invitation',
        onPress: () => {
          swipeUsed = false
        },
        // A touch swipe moves one scene per gesture; a new swipe may redirect a glide.
        onUp: (o) => {
          if (isTouch(o)) {
            if (swipeUsed) return
            swipeUsed = true
            glide(1, true)
          } else glide(1)
        },
        onDown: (o) => {
          if (isTouch(o)) {
            if (swipeUsed) return
            swipeUsed = true
            glide(-1, true)
          } else glide(-1)
        },
      })
      const onKey = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLElement && e.target.closest('.sr-invitation, button, a')) return
        if (['ArrowDown', 'PageDown', ' '].includes(e.key)) glide(1)
        else if (['ArrowUp', 'PageUp'].includes(e.key)) glide(-1)
        else return
        e.preventDefault()
      }
      window.addEventListener('keydown', onKey)
      if (import.meta.env.DEV) {
        // Test hook: jump the scene to a timeline position (in scroll units) and render it now.
        const go = (T: number) => {
          window.scrollTo(0, (T / total) * (st.end - st.start))
          tl.time(T)
          return tl.time()
        }
        Object.assign(window, { __invite: { tl, st, scenes, total, ScrollTrigger, stops, glide, gsap }, __go: go })
      }
      return () => {
        observer.kill()
        glideTween?.kill()
        window.removeEventListener('keydown', onKey)
        ScrollTrigger.removeEventListener('refreshInit', onRefreshInit)
        ScrollTrigger.removeEventListener('refresh', onRefresh)
        st.kill()
      }
    })

    return () => {
      window.clearTimeout(idleTimer)
      mm.revert()
    }
  }, [scenes, total])

  return (
    <div
      ref={rootRef}
      lang={lang}
      className={`invite lang-${lang} at-start${shown ? ' is-ready' : ''}${ready && !opened ? ' is-waiting' : ''}${lite ? ' is-lite' : ''}${reduced ? ' is-reduced' : ''}`}
    >
      <div ref={trackRef} className="scroll-track" style={{ height: `${(total + 1) * 100}vh` } as CSSProperties} />

      {/* The painting. Its words are repeated, in order, by ScreenReaderInvitation below. */}
      <div className="stage" aria-hidden="true">
        {scenes.map((scene, i) => (
          <Scene key={scene.id} scene={scene} index={i} cfg={cfg} eager={i < EAGER_SCENES} />
        ))}
        <div className="wing-shade left" />
        <div className="wing-shade right" />
      </div>
      <ScreenReaderInvitation
        cfg={cfg}
        beforeEvents={<ScreenReaderSections cfg={cfg} part="before-events" />}
        afterEvents={<ScreenReaderSections cfg={cfg} part="after-events" />}
      />

      <button type="button" className="lang-toggle" onClick={onToggleLang} aria-label={t('switchLabel')} lang={lang === 'hi' ? 'en' : 'hi'}>
        {t('switchTo')}
      </button>

      <div ref={bloomRef} className="bloom" />
      {!reduced && <Particles ref={particles} lite={lite} />}
      <div className="grain" />

      <div className="veil" role="status" aria-hidden={shown}>
        <span className="sr-only">{t('opening')}</span>
        <div className="veil-mark" aria-hidden="true">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="48" pathLength={1} />
          </svg>
          <img src={artUrl('monogram')} alt="" draggable={false} />
        </div>
        {ready && !opened && (
          <button type="button" className="veil-open" onClick={open} autoFocus>
            {t('tapToOpen')}
          </button>
        )}
      </div>
    </div>
  )
}
