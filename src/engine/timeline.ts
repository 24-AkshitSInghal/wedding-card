import gsap from 'gsap'
import type { SceneModel } from './schedule'
import { depth, qa, TRANSITIONS } from './transitions'
import type { Ctx, RT } from './transitions'

export interface Engine {
  tl: gsap.core.Timeline
  rts: RT[]
}

interface Options {
  root: HTMLElement
  scenes: SceneModel[]
  m: number
  bloom: HTMLElement
}

/**
 * Builds one master timeline for the whole invitation. Its duration is measured in
 * scroll units (viewport heights), so ScrollTrigger can scrub it 1:1 with the page.
 */
export function buildTimeline({ root, scenes, m, bloom }: Options): Engine {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
  const rts: RT[] = scenes.map((model, i) => ({ model, el: root.querySelector<HTMLElement>(`[data-scene="${i}"]`)! }))
  const stage = root.querySelector<HTMLElement>('.stage')!
  const frame = () => root.querySelector<HTMLElement>('.frame')!.clientWidth
  const ctx: Ctx = { tl, m, W: () => stage.clientWidth, H: () => stage.clientHeight, FW: frame, bloom }
  const { H, FW } = ctx

  // Anchor the timeline's length so the last scene can rest before the page ends.
  const total = scenes[scenes.length - 1].end
  tl.set({}, {}, total)

  rts.forEach((s, i) => {
    const { model } = s
    if (i > 0) TRANSITIONS[model.enter](ctx, rts[i - 1], s, model.start, model.enterDur)
    if (i === 0) return

    /* Typography: characters and lines reveal as the scene settles, then fade as it leaves. */
    const text = s.el.querySelector<HTMLElement>('.scene-text')
    if (text) {
      const chars = qa(text, '.ch')
      const lines = qa(text, '.reveal')
      const strokes = qa(text, 'svg path[pathLength]')
      const dots = qa(text, 'svg .dot')
      const at = model.restAt - Math.min(0.45, model.enterDur * 0.35)
      tl.set([...chars, ...lines], { opacity: 0 }, model.start)
      tl.set(strokes, { strokeDasharray: 1, strokeDashoffset: 1 }, model.start)
      tl.set(dots, { opacity: 0 }, model.start)
      tl.fromTo(chars, { opacity: 0, y: 6 * m }, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out', stagger: 0.011, immediateRender: false }, at)
      tl.fromTo(lines, { opacity: 0, y: 9 * m }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: 0.045, immediateRender: false }, at + 0.12)
      tl.fromTo(strokes, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.75, ease: 'power1.inOut', stagger: 0.012, immediateRender: false }, at)
      tl.fromTo(dots, { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.008, immediateRender: false }, at + 0.35)
      if (i < rts.length - 1) {
        tl.fromTo([...chars, ...lines, ...dots], { opacity: 1 }, { opacity: 0, duration: 0.22, ease: 'power1.in', immediateRender: false }, model.exitAt)
        tl.fromTo(strokes, { strokeDashoffset: 0 }, { strokeDashoffset: 1, duration: 0.3, immediateRender: false }, model.exitAt)
      }
    }

    /* Gentle parallax while the guest reads: near layers drift more than far ones. */
    const hold = model.exitAt - model.restAt
    if (m && hold > 0) {
      for (const l of qa(s.el, '.layer[data-d]')) {
        const d = depth(l)
        const inner = l.querySelector<HTMLElement>('.layer-inner')
        if (!inner || !d) continue
        tl.fromTo(inner, { y: 0 }, { y: () => -d * H() * 0.035, duration: hold + model.enterDur * 0.2, immediateRender: false }, model.restAt)
      }
    }

    /* Emblems settle into place. */
    for (const e of qa(s.el, '.role-emblem .art')) {
      tl.set(e, { opacity: 0 }, model.start)
      tl.fromTo(e, { opacity: 0, scale: 0.88 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out', immediateRender: false }, model.restAt - 0.6)
    }

    /* The elephant takes a last few steps and comes to rest. */
    for (const w of qa(s.el, '.role-walker')) {
      if (!m) continue
      const inner = w.querySelector<HTMLElement>('.layer-inner')!
      const art = w.querySelector<HTMLElement>('.art')!
      tl.fromTo(inner, { x: 0 }, { x: () => FW() * 0.05, duration: hold * 0.55, ease: 'power1.out', immediateRender: false }, model.restAt)
      tl.fromTo(art, { y: 0, rotation: 0 }, { y: () => -H() * 0.004, rotation: -0.35, duration: (hold * 0.55) / 4, repeat: 3, yoyo: true, ease: 'sine.inOut', immediateRender: false }, model.restAt)
    }

    /* Light: rays strengthen through the hold (Haldi's golden courtyard, Hasta Melap's calm). */
    const rays = s.el.querySelector<HTMLElement>('.rays')
    if (rays) {
      tl.fromTo(rays, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power1.inOut', immediateRender: false }, model.restAt - 0.5)
      if (i < rts.length - 1) tl.fromTo(rays, { opacity: 1 }, { opacity: 0, duration: 0.4, immediateRender: false }, model.exitAt)
    }

    /* Festive string lights switch on one by one. */
    const bulbs = qa(s.el, '.bulb')
    if (bulbs.length) {
      tl.set(bulbs, { opacity: 0 }, model.start)
      tl.fromTo(bulbs, { opacity: 0 }, { opacity: 1, duration: 0.12, stagger: { each: 0.025, from: 'random' }, immediateRender: false }, model.restAt - 0.4)
    }

    /* Closing card: the gilt border draws itself in from the corners. */
    const border = s.el.querySelector<HTMLElement>('.frame-border')
    if (border) {
      const across = qa(border, '.fb-top, .fb-bottom')
      const down = qa(border, '.fb-left, .fb-right')
      const flourish = qa(border, 'path[pathLength]')
      const dots = qa(border, '.dot')
      tl.set(across, { scaleX: 0 }, model.start)
      tl.set(down, { scaleY: 0 }, model.start)
      tl.set(flourish, { strokeDasharray: 1, strokeDashoffset: 1 }, model.start)
      tl.set(dots, { opacity: 0 }, model.start)
      tl.fromTo(flourish, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, stagger: 0.015, ease: 'power1.inOut', immediateRender: false }, model.restAt - 0.55)
      tl.fromTo(across, { scaleX: 0 }, { scaleX: 1, duration: 0.85, ease: 'power2.inOut', immediateRender: false }, model.restAt - 0.25)
      tl.fromTo(down, { scaleY: 0 }, { scaleY: 1, duration: 0.85, ease: 'power2.inOut', immediateRender: false }, model.restAt - 0.25)
      tl.fromTo(dots, { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.03, immediateRender: false }, model.restAt + 0.4)
    }

    /* Closing medallion: the frame is drawn, the emblem and a final glow appear. */
    const med = s.el.querySelector<HTMLElement>('.medallion')
    if (med) {
      const paths = qa(med, 'path[pathLength]')
      const fill = med.querySelector('.med-fill')
      const inner = med.querySelector<HTMLElement>('.medallion-inner')
      const dots = qa(med, '.dot')
      const glow = s.el.querySelector<HTMLElement>('.final-glow')
      tl.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 }, model.start)
      tl.set([fill, inner, ...dots], { opacity: 0 }, model.start)
      tl.fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, stagger: 0.12, ease: 'power1.inOut', immediateRender: false }, model.restAt - 0.4)
      tl.fromTo(fill, { opacity: 0 }, { opacity: 1, duration: 0.5, immediateRender: false }, model.restAt - 0.1)
      tl.fromTo(dots, { opacity: 0 }, { opacity: 1, duration: 0.15, stagger: 0.03, immediateRender: false }, model.restAt + 0.2)
      tl.fromTo(inner, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out', immediateRender: false }, model.restAt + 0.1)
      if (glow) tl.fromTo(glow, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power1.inOut', immediateRender: false }, model.exitAt - 0.8)
    }
  })

  return { tl, rts }
}
