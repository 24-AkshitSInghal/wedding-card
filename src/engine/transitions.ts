import type { TransitionType } from '../config/scenes'
import type { SceneModel } from './schedule'

/** A scene's model plus its DOM root. */
export interface RT {
  model: SceneModel
  el: HTMLElement
}

export interface Ctx {
  tl: gsap.core.Timeline
  /** Motion multiplier: 1 normally, 0 when the visitor prefers reduced motion. */
  m: number
  W: () => number
  H: () => number
  /** Width of the portrait frame (one arch spacing in the colonnade). */
  FW: () => number
  bloom: HTMLElement
}

type Vars = gsap.TweenVars
type TransitionFn = (ctx: Ctx, from: RT, to: RT, t: number, dur: number) => void

export const qa = (root: Element, sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel))
export const bgOf = (s: RT) => s.el.querySelector<HTMLElement>('.scene-bg')!
export const depth = (el: HTMLElement) => parseFloat(el.dataset.d ?? '0') || 0
const side = (el: HTMLElement) => Math.sign(parseFloat(el.dataset.x ?? '0') || 0)
const role = (el: HTMLElement) => el.dataset.role ?? ''
const isTop = (el: HTMLElement) => el.classList.contains('top')

/** Everything in the scene that takes part in camera moves (layers, ornaments, text). */
export function movers(s: RT, { text = true } = {}) {
  return qa(s.el, '[data-d]').filter((el) => role(el) !== 'bg' && (text || role(el) !== 'text'))
}

/** Tween from → to starting at `at`, without touching the element before then. */
function ft(ctx: Ctx, el: gsap.TweenTarget, from: Vars, to: Vars, at: number, dur: number, ease = 'power2.inOut') {
  ctx.tl.fromTo(el, from, { ...to, duration: Math.max(dur, 0.001), ease, immediateRender: false }, at)
}

/** Like ft, but the incoming element is placed at `from` the moment its scene appears,
 *  so a tween that starts late does not show the element at rest first. */
function enter(ctx: Ctx, s: RT, el: gsap.TweenTarget, from: Vars, to: Vars, at: number, dur: number, ease = 'power2.inOut') {
  if (at > s.model.start) ctx.tl.set(el, from, s.model.start)
  ft(ctx, el, from, to, at, dur, ease)
}

/** The motion-free fallback every transition degrades to. */
function crossfade(ctx: Ctx, from: RT, to: RT, t: number, dur: number) {
  // A gentle dip rather than a double exposure: the old scene leaves before the new one arrives.
  ft(ctx, movers(from, { text: false }), { opacity: 1 }, { opacity: 0 }, t, dur * 0.45, 'power1.inOut')
  enter(ctx, to, bgOf(to), { opacity: 0 }, { opacity: 1 }, t + dur * 0.15, dur * 0.7, 'power1.inOut')
  enter(ctx, to, movers(to, { text: false }), { opacity: 0 }, { opacity: 1 }, t + dur * 0.4, dur * 0.6, 'power1.inOut')
}

/* ── Opening: doors swing open, the camera pushes through the doorway ────── */
const gate: TransitionFn = (ctx, from, to, t, dur) => {
  const { m, H, FW } = ctx
  const T = (f: number) => t + f * dur
  const el = from.el
  const gateEl = el.querySelector<HTMLElement>('.gate')!
  const doors = qa(el, '.door')
  const ui = qa(el, '.plaque, .scroll-hint, .doves')

  ft(ctx, ui, { opacity: 1 }, { opacity: 0 }, T(0), dur * 0.1, 'power1.out')
  ft(ctx, el.querySelector('.gate-inside'), { opacity: 0 }, { opacity: 1 }, T(0.04), dur * 0.4, 'power1.out')

  if (m) {
    // Doors swing out toward the guest on their outer hinges.
    ft(ctx, doors[0], { rotationY: 0 }, { rotationY: -100 }, T(0.03), dur * 0.5, 'power2.inOut')
    ft(ctx, doors[1], { rotationY: 0 }, { rotationY: 100 }, T(0.03), dur * 0.5, 'power2.inOut')
    ft(ctx, qa(el, '.door-shade'), { opacity: 0 }, { opacity: 0.7 }, T(0.03), dur * 0.5, 'power1.in')

    // Camera dolly: bring the doorway to the centre of the screen and push in.
    ft(ctx, gateEl, { scale: 1, y: 0 }, { scale: 2.7, y: () => -H() * 0.282 }, T(0.3), dur * 0.62, 'power2.in')
    for (const l of movers(from, { text: false })) {
      if (l === gateEl) continue
      const d = depth(l)
      const s = side(l)
      if (isTop(l)) {
        ft(ctx, l, { x: 0, y: 0 }, { x: () => s * FW() * 0.5, y: () => -H() * (0.5 + 0.3 * d) }, T(0.2), dur * 0.6, 'power2.in')
      } else if (s) {
        ft(ctx, l, { x: 0, scale: 1 }, { x: () => s * FW() * (0.75 + 0.6 * d), scale: 1.5 }, T(0.22), dur * 0.66, 'power2.in')
      } else {
        ft(ctx, l, { y: 0, scale: 1 }, { y: () => H() * 0.45, scale: 1.5 }, T(0.22), dur * 0.62, 'power2.in')
      }
    }
    ft(ctx, bgOf(from), { scale: 1 }, { scale: 1.35 }, T(0.3), dur * 0.62, 'power2.in')
    // The palace inside eases back to rest as we arrive.
    enter(ctx, to, movers(to, { text: false }).filter((l) => role(l) !== 'emblem'), { scale: 1.22 }, { scale: 1 }, T(0.5), dur * 0.5, 'power2.out')
  }

  // The opening fades away element by element (never via the scene root, which would
  // flatten its stacking order beneath the scene it is revealing).
  ft(ctx, [bgOf(from), ...movers(from, { text: false })], { opacity: 1 }, { opacity: 0 }, T(0.62), dur * 0.3, 'power1.inOut')
}

/* ── Crane: the camera descends from the couple to the palace terraces ───── */
const crane: TransitionFn = (ctx, from, to, t, dur) => {
  if (!ctx.m) return crossfade(ctx, from, to, t, dur)
  const { H } = ctx
  enter(ctx, to, bgOf(to), { opacity: 0 }, { opacity: 1 }, t, dur, 'power1.inOut')
  // Rising layers fade before their (flat, normally off-screen) lower edges come into view.
  for (const l of movers(from)) {
    const k = 1 + 0.45 * depth(l)
    ft(ctx, l, { y: 0 }, { y: () => -H() * 0.7 * k }, t, dur, 'power2.in')
    ft(ctx, l, { opacity: 1 }, { opacity: 0 }, t + dur * 0.1, dur * 0.45, 'power1.in')
  }
  for (const l of movers(to)) {
    const k = 1 + 0.45 * depth(l)
    enter(ctx, to, l, { y: () => H() * k }, { y: 0 }, t, dur)
  }
}

/* ── Truck: slide along the colonnade to the next arch ───────────────────── */
const truck: TransitionFn = (ctx, from, to, t, dur) => {
  if (!ctx.m) return crossfade(ctx, from, to, t, dur)
  const { FW, W, H } = ctx
  // The new colour belongs to the incoming arch: its edge rides behind the arch's left
  // pillar, then (on wide screens) sweeps on across the neighbouring arches.
  const archW = () => Math.max(FW(), H() * 0.5)
  const pillar = (offset: () => number) => () => `inset(0px 0px 0px ${Math.max(0, W() / 2 + offset() - archW() * 0.445)}px)`
  const rest = () => 0
  enter(ctx, to, bgOf(to), { clipPath: pillar(FW) }, { clipPath: pillar(rest) }, t, dur, 'power2.inOut')
  ft(ctx, bgOf(to), { clipPath: pillar(rest) }, { clipPath: 'inset(0px 0px 0px 0px)' }, t + dur, dur * 0.25, 'power1.out')
  for (const l of movers(from)) {
    const k = 1 + 0.6 * depth(l)
    ft(ctx, l, { x: 0 }, { x: () => -FW() * k }, t, dur, 'power2.inOut')
  }
  for (const l of movers(to)) {
    const k = 1 + 0.6 * depth(l)
    enter(ctx, to, l, { x: () => FW() * k }, { x: 0 }, t, dur, 'power2.inOut')
  }
}

/* ── Iris: colour blooms from the centre, the wings part, pavilions rise ── */
const iris: TransitionFn = (ctx, from, to, t, dur) => {
  if (!ctx.m) return crossfade(ctx, from, to, t, dur)
  const { FW, H } = ctx
  enter(ctx, to, bgOf(to), { clipPath: 'circle(0% at 50% 42%)' }, { clipPath: 'circle(82% at 50% 42%)' }, t, dur * 0.85, 'power2.inOut')
  const toHasArch = !!to.el.querySelector('.role-arch')
  for (const l of movers(from, { text: false })) {
    const d = depth(l)
    const s = side(l)
    if (role(l) === 'arch' && toHasArch) continue
    if (s) ft(ctx, l, { x: 0, opacity: 1 }, { x: () => s * FW() * 0.6 * (1 + d), opacity: 0 }, t, dur * 0.7, 'power2.in')
    else ft(ctx, l, { y: 0, opacity: 1 }, { y: () => (isTop(l) ? -1 : 1) * H() * 0.3, opacity: 0 }, t, dur * 0.6, 'power2.in')
  }
  for (const l of movers(to, { text: false })) {
    const d = depth(l)
    const s = side(l)
    if (role(l) === 'arch') {
      enter(ctx, to, l, { opacity: 0 }, { opacity: 1 }, t, dur * 0.3, 'none')
    } else if (isTop(l)) {
      enter(ctx, to, l, { y: () => -H() * 0.35 * (1 + d) }, { y: 0 }, t + dur * 0.3, dur * 0.7, 'power3.out')
    } else {
      const lift = s ? 0.55 : 0.32
      enter(ctx, to, l, { y: () => H() * lift * (1 + d) }, { y: 0 }, t + dur * (0.2 + 0.1 * (1 - d)), dur * 0.7, 'power3.out')
    }
  }
}

/* ── Procession: the elephant walks the new colour in from the left ──────── */
const procession: TransitionFn = (ctx, from, to, t, dur) => {
  if (!ctx.m) return crossfade(ctx, from, to, t, dur)
  const { FW, H } = ctx
  // A feathered banner of colour (see .scene-bg mask in scenes.css) sweeps in behind the elephant.
  const banner = (x: string) => ({ maskPosition: `${x} 0%`, webkitMaskPosition: `${x} 0%` })
  enter(ctx, to, bgOf(to), banner('100%'), banner('0%'), t, dur * 0.9, 'power1.inOut')
  const toHasArch = !!to.el.querySelector('.role-arch')
  for (const l of movers(from, { text: false })) {
    if (role(l) === 'arch' && toHasArch) continue
    ft(ctx, l, { opacity: 1, x: 0 }, { opacity: 0, x: () => FW() * 0.12 * (1 + depth(l)) }, t + dur * 0.05, dur * 0.55, 'power1.in')
  }
  for (const l of movers(to, { text: false })) {
    const x = parseFloat(l.dataset.x ?? '0') || 0
    if (role(l) === 'walker') {
      enter(ctx, to, l, { x: () => -FW() * 1.15 }, { x: 0 }, t, dur, 'power1.out')
      const art = l.querySelector<HTMLElement>('.art')!
      // Scroll-linked gait: the elephant only walks while the guest scrolls.
      ft(ctx, art, { y: 0, rotation: 0 }, { y: () => -H() * 0.006, rotation: -0.5, repeat: 9, yoyo: true }, t, dur / 10, 'sine.inOut')
    } else if (role(l) === 'arch') {
      enter(ctx, to, l, { opacity: 0 }, { opacity: 1 }, t, dur * 0.25, 'none')
    } else if (role(l) === 'garland') {
      enter(ctx, to, l, { y: () => -H() * 0.25, opacity: 0 }, { y: 0, opacity: 1 }, t + dur * 0.2, dur * 0.6, 'power2.out')
    } else {
      // Revealed as the banner of colour sweeps past it.
      const at = t + dur * (0.12 + 0.5 * ((x + 50) / 100))
      enter(ctx, to, l, { opacity: 0, y: () => H() * 0.04 }, { opacity: 1, y: 0 }, at, dur * 0.4, 'power2.out')
    }
  }
}

/* ── Curtain: garlands drop, the camera moves toward the floral mandap ──── */
const curtain: TransitionFn = (ctx, from, to, t, dur) => {
  if (!ctx.m) return crossfade(ctx, from, to, t, dur)
  const { FW, H } = ctx
  enter(ctx, to, bgOf(to), { opacity: 0 }, { opacity: 1 }, t + dur * 0.15, dur * 0.45, 'power1.inOut')
  const toHasArch = !!to.el.querySelector('.role-arch')
  for (const l of movers(from, { text: false })) {
    if (role(l) === 'arch' && toHasArch) continue
    ft(ctx, l, { opacity: 1, scale: 1 }, { opacity: 0, scale: 1.08 }, t + dur * 0.05, dur * 0.5, 'power1.in')
  }
  for (const l of movers(to, { text: false })) {
    const d = depth(l)
    const s = side(l)
    switch (role(l)) {
      case 'garland':
        enter(ctx, to, l, { y: () => -H() * 0.7 }, { y: 0 }, t, dur * 0.5, 'power2.out')
        break
      case 'arch':
        enter(ctx, to, l, { opacity: 0 }, { opacity: 1 }, t, dur * 0.3, 'none')
        break
      case 'mandap':
        enter(ctx, to, l, { scale: 0.74, y: () => H() * 0.06, opacity: 0 }, { scale: 1, y: 0, opacity: 1 }, t + dur * 0.25, dur * 0.75, 'power2.out')
        break
      default:
        if (s) enter(ctx, to, l, { x: () => s * FW() * 0.45 * (1 + d), opacity: 0 }, { x: 0, opacity: 1 }, t + dur * 0.3, dur * 0.7, 'power2.out')
        else enter(ctx, to, l, { y: () => H() * 0.2, opacity: 0 }, { y: 0, opacity: 1 }, t + dur * 0.35, dur * 0.65, 'power2.out')
    }
  }
}

/* ── Bloom: soft golden light dissolves into the sacred ceremony ─────────── */
const bloom: TransitionFn = (ctx, from, to, t, dur) => {
  const { m } = ctx
  ft(ctx, ctx.bloom, { opacity: 0 }, { opacity: 0.9 }, t, dur * 0.45, 'power2.in')
  ft(ctx, ctx.bloom, { opacity: 0.9 }, { opacity: 0 }, t + dur * 0.5, dur * 0.5, 'power2.out')
  ft(ctx, movers(from, { text: false }), { opacity: 1 }, { opacity: 0 }, t + dur * 0.3, dur * 0.2, 'none')
  enter(ctx, to, bgOf(to), { opacity: 0 }, { opacity: 1 }, t + dur * 0.35, dur * 0.15, 'none')
  enter(ctx, to, movers(to, { text: false }), { opacity: 0 }, { opacity: 1 }, t + dur * 0.4, dur * 0.2, 'none')
  if (m) {
    for (const l of movers(to, { text: false })) {
      const k = 1 + 0.07 * (1 + depth(l))
      enter(ctx, to, l, { scale: k }, { scale: 1 }, t + dur * 0.4, dur * 0.6, 'power2.out')
    }
  }
}

/* ── Lift: the last scene lifts away like a page, revealing the blessing ── */
const lift: TransitionFn = (ctx, from, to, t, dur) => {
  if (!ctx.m) {
    // The closing sits beneath the previous scene, so its ground must fade away too.
    ft(ctx, bgOf(from), { opacity: 1 }, { opacity: 0 }, t + dur * 0.15, dur * 0.6, 'power1.inOut')
    return crossfade(ctx, from, to, t, dur)
  }
  const { H } = ctx
  // The whole scene lifts as one painted page, so nothing peels away from its edge.
  ft(ctx, [bgOf(from), ...movers(from)], { y: 0 }, { y: () => -H() * 1.04 }, t, dur, 'power2.inOut')
  for (const l of movers(to, { text: false })) {
    enter(ctx, to, l, { scale: 1.06, y: () => H() * 0.06 * (1 + depth(l)) }, { scale: 1, y: 0 }, t + dur * 0.1, dur * 0.9, 'power2.out')
  }
}

export const TRANSITIONS: Record<TransitionType, TransitionFn> = { gate, crane, truck, iris, procession, curtain, bloom, lift }
