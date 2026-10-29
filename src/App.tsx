import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Particles } from './components/Particles'
import type { ParticlesHandle } from './components/Particles'
import { Scene } from './components/Scene'
import { ScreenReaderInvitation } from './components/SceneTexts'
import { SoundToggle } from './components/SoundToggle'
import { wedding } from './config/wedding'
import { createPreloader, isLiteDevice, whenLoaded } from './engine/preload'
import { buildScenes } from './engine/schedule'
import { buildTimeline } from './engine/timeline'
import { initials } from './lib/format'
import './styles/text.css'
import './styles/scenes.css'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

/** Only the gateway loads with the page; everything else streams in once it is on screen. */
const EAGER_SCENES = 1

/** `?reduce-motion` previews the reduced-motion experience without changing OS settings. */
const FORCE_REDUCE = new URLSearchParams(window.location.search).has('reduce-motion')
const REDUCE_QUERY = FORCE_REDUCE ? 'all' : '(prefers-reduced-motion: reduce)'
const MOTION_QUERY = FORCE_REDUCE ? 'not all' : '(prefers-reduced-motion: no-preference)'

export default function App() {
  const { scenes, total } = useMemo(() => buildScenes(wedding), [])
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const bloomRef = useRef<HTMLDivElement>(null)
  const particles = useRef<ParticlesHandle>(null)
  const [ready, setReady] = useState(false)
  const [lite, setLite] = useState(isLiteDevice)
  const [reduced, setReduced] = useState(() => window.matchMedia(REDUCE_QUERY).matches)
  const [b, g] = initials(wedding)

  // If the device struggles once the gateway is on screen, fall back to the lighter look.
  useEffect(() => {
    if (!ready || lite) return
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
  }, [ready, lite])

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

      // Never leave the guest stranded partway through a short transition: settle in the
      // direction they were scrolling, or at the nearer end if that one is too far. Long
      // transitions (the gateway) are left wherever the guest stops.
      const snapTo = (p: number, self?: ScrollTrigger) => {
        const T = p * total
        for (const s of scenes) {
          if (s.enterDur && T > s.start && T < s.restAt) {
            if (s.enterDur > 1.5) return p
            const ahead = s.restAt + 0.02
            const behind = Math.max(0, s.start - 0.02)
            const forward = (self?.direction ?? 1) > 0
            const preferred = forward ? ahead : behind
            const target = Math.abs(preferred - T) <= 0.7 ? preferred : Math.abs(ahead - T) < Math.abs(behind - T) ? ahead : behind
            return target / total
          }
        }
        return p
      }

      const st = ScrollTrigger.create({
        trigger: trackRef.current,
        start: 'top top',
        end: 'bottom bottom',
        animation: tl,
        scrub: m ? 0.85 : 0.3,
        invalidateOnRefresh: true,
        onUpdate: (self) => particles.current?.nudge(self.getVelocity()),
        snap: m
          ? { snapTo: (p: number) => snapTo(p, st), duration: { min: 0.3, max: 0.9 }, delay: 0.25, ease: 'power1.inOut', inertia: false }
          : undefined,
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
      if (import.meta.env.DEV) {
        // Test hook: jump the scene to a timeline position (in scroll units) and render it now.
        const go = (T: number) => {
          window.scrollTo(0, (T / total) * (st.end - st.start))
          tl.time(T)
          return tl.time()
        }
        Object.assign(window, { __invite: { tl, st, scenes, total, ScrollTrigger }, __go: go })
      }
      return () => {
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
    <div ref={rootRef} className={`invite${ready ? ' is-ready' : ''}${lite ? ' is-lite' : ''}${reduced ? ' is-reduced' : ''}`}>
      <div ref={trackRef} className="scroll-track" style={{ height: `${(total + 1) * 100}vh` } as CSSProperties} />

      {/* The painting. Its words are repeated, in order, by ScreenReaderInvitation below. */}
      <div className="stage" aria-hidden="true">
        {scenes.map((scene, i) => (
          <Scene key={scene.id} scene={scene} index={i} cfg={wedding} eager={i < EAGER_SCENES} />
        ))}
        <div className="wing-shade left" />
        <div className="wing-shade right" />
      </div>
      <ScreenReaderInvitation cfg={wedding} />

      <div ref={bloomRef} className="bloom" />
      {!reduced && <Particles ref={particles} lite={lite} />}
      <div className="grain" />

      {wedding.audio.src.trim() && ready && <SoundToggle src={wedding.audio.src} title={wedding.audio.title} />}

      <div className="veil" role="status" aria-hidden={ready}>
        <span className="sr-only">Opening the invitation…</span>
        <div className="veil-mark" aria-hidden="true">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="44" pathLength={1} />
            <circle cx="50" cy="50" r="38" pathLength={1} />
          </svg>
          <span>
            {b}
            <i>&amp;</i>
            {g}
          </span>
        </div>
      </div>
    </div>
  )
}
