import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { Flora, ParticleMood } from '../config/scenes'

export interface ParticlesHandle {
  /** What drifts through the air in the scene in view. */
  setMood(mood: ParticleMood): void
  /** Scroll velocity in px/s, so petals lag behind a fast scroll. */
  nudge(velocity: number): void
  /** A shower of extra petals from above (doors opening, a ceremony arriving). */
  burst(count: number): void
}

interface Props {
  lite: boolean
}

interface P {
  kind: 'flora' | 'dust' | 'mote'
  sprite: string
  x: number
  y: number
  /** Depth: 0.4 (far) … 1 … 1.8 (passing right in front of the guest). */
  z: number
  vx: number
  vy: number
  rot: number
  vr: number
  phase: number
  /** Burst petals fall once and are not recycled. */
  temp: boolean
}

const SPRITE = 48
const SOFT = 14

const DEFAULT_MOOD: ParticleMood = {
  flora: [{ kind: 'petal', colors: ['#e48aa6', '#f3c1cf', '#c2416b'], weight: 1 }],
  motes: false,
  speed: 1,
}

/** Petals, blossoms, marigold petals, leaves, gold dust and fireflies on one canvas. */
export const Particles = forwardRef<ParticlesHandle, Props>(function Particles({ lite }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mood = useRef<ParticleMood>(DEFAULT_MOOD)
  const push = useRef(0)
  const bursts = useRef(0)

  useImperativeHandle(ref, () => ({
    setMood(next) {
      mood.current = next
    },
    nudge(v) {
      push.current = Math.max(-2400, Math.min(2400, v))
    },
    burst(n) {
      bursts.current += n
    },
  }))

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const sharp = new Map<string, HTMLCanvasElement>()
    const soft = new Map<string, HTMLCanvasElement>()
    const sprite = (key: string, near: boolean) => {
      const cache = near ? soft : sharp
      let c = cache.get(key)
      if (!c) {
        const [kind, color] = key.split('|') as [Flora, string]
        c = drawFlora(kind, color, near ? SOFT : SPRITE)
        cache.set(key, c)
      }
      return c
    }
    const dust = makeGlow(16, 'rgba(255,240,200,1)', 'rgba(240,200,120,0.6)')
    const mote = makeGlow(32, 'rgba(255,236,170,1)', 'rgba(255,190,90,0.45)')

    let w = 0
    let h = 0
    let dpr = 1
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.25 : 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const pickFlora = () => {
      const list = mood.current.flora
      let r = Math.random() * list.reduce((a, f) => a + f.weight, 0)
      const f = list.find((x) => (r -= x.weight) <= 0) ?? list[0]
      return `${f.kind}|${f.colors[Math.floor(Math.random() * f.colors.length)]}`
    }

    const spawn = (kind: P['kind'], where: 'anywhere' | 'top' | 'bottom' | 'burst'): P => {
      const near = kind === 'flora' && Math.random() < 0.12
      const z = near ? 1.3 + Math.random() * 0.5 : 0.4 + Math.random() * 0.8
      const y =
        where === 'anywhere' ? Math.random() * h
        : where === 'top' ? -30
        : where === 'bottom' ? h + 20
        : -20 - Math.random() * h * 0.35
      return {
        kind,
        sprite: kind === 'flora' ? pickFlora() : '',
        x: Math.random() * w,
        y,
        z,
        vx: (Math.random() - 0.5) * (kind === 'mote' ? 18 : 12),
        vy:
          kind === 'flora' ? (16 + Math.random() * 20) * (where === 'burst' ? 1.5 : 1)
          : kind === 'dust' ? -(3 + Math.random() * 6)
          : (Math.random() - 0.5) * 10,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 1.8,
        phase: Math.random() * Math.PI * 2,
        temp: where === 'burst',
      }
    }

    const area = Math.min(1, (window.innerWidth * window.innerHeight) / (1400 * 900))
    const floraCount = Math.round((lite ? 12 : 22) + (lite ? 6 : 14) * area)
    const dustCount = Math.round((lite ? 16 : 30) + 16 * area)
    const moteCount = lite ? 8 : 14
    const ps: P[] = [
      ...Array.from({ length: floraCount }, () => spawn('flora', 'anywhere')),
      ...Array.from({ length: dustCount }, () => spawn('dust', 'anywhere')),
      ...Array.from({ length: moteCount }, () => spawn('mote', 'anywhere')),
    ]

    const frameMs = 1000 / (lite ? 30 : 60)
    let raf = 0
    let last = performance.now()
    let acc = 0
    let lag = 0
    let speed = 1
    let moteAlpha = 0
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      acc += now - last
      last = now
      if (acc < frameMs) return
      const dt = Math.min(acc, 100) / 1000
      acc = 0

      // Moods change gently: speed and fireflies ease toward the new scene's values.
      speed += (mood.current.speed - speed) * 0.04
      moteAlpha += ((mood.current.motes ? 1 : 0) - moteAlpha) * 0.03
      // Scroll moves the air: petals are carried upward against a downward scroll.
      lag += (push.current * 0.05 - lag) * 0.12
      push.current *= 0.9

      if (bursts.current > 0) {
        const n = Math.min(bursts.current, lite ? 14 : 28)
        bursts.current = 0
        if (ps.filter((p) => p.temp).length < 60) for (let i = 0; i < n; i++) ps.push(spawn('flora', 'burst'))
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const t = now / 1000
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        const k = speed * p.z
        if (p.kind === 'mote') {
          p.x += (p.vx + Math.sin(t * 0.6 + p.phase) * 14) * dt * speed
          p.y += (p.vy + Math.cos(t * 0.5 + p.phase) * 10 - lag * 0.2) * dt * speed
        } else {
          const sway = Math.sin(t * 0.8 + p.phase) * (p.kind === 'flora' ? 20 : 6)
          p.x += (p.vx + sway * 0.6) * dt * k
          p.y += (p.vy - lag * (p.kind === 'flora' ? 1 : 0.4)) * dt * k
        }
        p.rot += p.vr * dt * speed

        const out = p.y > h + 40 || p.y < -h * 0.4 - 40
        if (out || (p.kind === 'mote' && (p.y < -20 || p.y > h + 20))) {
          if (p.temp && p.y > h + 40) {
            ps.splice(i, 1)
            continue
          }
          if (!p.temp) Object.assign(p, spawn(p.kind, p.kind === 'dust' ? 'bottom' : p.kind === 'mote' ? 'anywhere' : p.y < 0 ? 'bottom' : 'top'))
          continue
        }
        if (p.x < -40) p.x = w + 30
        if (p.x > w + 40) p.x = -30

        if (p.kind === 'flora') {
          const near = p.z > 1.25
          const s = near ? 20 + 18 * (p.z - 1.3) * 2 : 7 + 8 * p.z
          ctx.save()
          ctx.globalAlpha = near ? 0.55 : 0.6 + 0.35 * Math.min(1, p.z)
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rot)
          // The tumble of a falling petal: squash it on one axis as it turns.
          ctx.scale(1, 0.45 + 0.55 * Math.abs(Math.sin(t * 1.3 + p.phase)))
          ctx.drawImage(sprite(p.sprite, near), -s / 2, -s / 2, s, s)
          ctx.restore()
        } else if (p.kind === 'dust') {
          const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.7 + p.phase))
          const s = 3 + 5 * p.z
          ctx.globalAlpha = tw * 0.8
          ctx.drawImage(dust, p.x - s / 2, p.y - s / 2, s, s)
        } else if (moteAlpha > 0.02) {
          // Fireflies: slow drift with a soft breathing glow.
          const pulse = 0.3 + 0.7 * Math.pow(Math.abs(Math.sin(t * 0.9 + p.phase)), 2)
          const s = 10 + 12 * p.z
          ctx.globalAlpha = pulse * moteAlpha * 0.9
          ctx.drawImage(mote, p.x - s / 2, p.y - s / 2, s, s)
        }
      }
      ctx.globalAlpha = 1
    }
    const start = () => {
      cancelAnimationFrame(raf)
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const onVis = () => (document.hidden ? cancelAnimationFrame(raf) : start())
    document.addEventListener('visibilitychange', onVis)
    start()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [lite])

  return <canvas ref={canvasRef} className="particles" aria-hidden="true" />
})

/** Paints one small piece of flora, centred, into a square canvas of `size` px. */
function drawFlora(kind: Flora, color: string, size: number) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  g.translate(size / 2, size / 2)
  g.scale(size / 32, size / 32)
  const shade = (stop: string) => {
    const grad = g.createRadialGradient(-3, -5, 1, 0, 0, 15)
    grad.addColorStop(0, stop)
    grad.addColorStop(0.3, color)
    grad.addColorStop(1, color)
    return grad
  }
  if (kind === 'petal') {
    // A rose petal: broad, slightly cupped, with a soft notch at the top.
    g.fillStyle = shade('#ffffff')
    g.beginPath()
    g.moveTo(0, 13)
    g.bezierCurveTo(-12, 6, -11, -9, -4, -12)
    g.quadraticCurveTo(0, -9, 4, -12)
    g.bezierCurveTo(11, -9, 12, 6, 0, 13)
    g.fill()
    g.globalAlpha = 0.25
    g.strokeStyle = '#ffffff'
    g.lineWidth = 0.8
    g.beginPath()
    g.moveTo(0, 10)
    g.quadraticCurveTo(1.5, 0, 0, -8)
    g.stroke()
  } else if (kind === 'marigold') {
    // A ruffled marigold petal.
    g.fillStyle = shade('#fff2b0')
    g.beginPath()
    g.moveTo(0, 13)
    g.bezierCurveTo(-7, 8, -8, -6, -6, -11)
    g.lineTo(-3, -9)
    g.lineTo(0, -13)
    g.lineTo(3, -9)
    g.lineTo(6, -11)
    g.bezierCurveTo(8, -6, 7, 8, 0, 13)
    g.fill()
  } else if (kind === 'blossom') {
    // A five-petalled jasmine or cherry blossom with a golden heart.
    g.fillStyle = shade('#ffffff')
    for (let i = 0; i < 5; i++) {
      g.save()
      g.rotate((i / 5) * Math.PI * 2)
      g.beginPath()
      g.ellipse(0, -7.5, 4.6, 7, 0, 0, Math.PI * 2)
      g.fill()
      g.restore()
    }
    g.fillStyle = '#e8b63c'
    g.beginPath()
    g.arc(0, 0, 2.6, 0, Math.PI * 2)
    g.fill()
  } else {
    // A small leaf.
    g.fillStyle = shade('#cfe3b0')
    g.beginPath()
    g.moveTo(0, 13)
    g.bezierCurveTo(-9, 4, -7, -8, 0, -13)
    g.bezierCurveTo(7, -8, 9, 4, 0, 13)
    g.fill()
    g.globalAlpha = 0.35
    g.strokeStyle = '#f4f8e8'
    g.lineWidth = 0.7
    g.beginPath()
    g.moveTo(0, 11)
    g.lineTo(0, -10)
    g.stroke()
  }
  return c
}

function makeGlow(size: number, core: string, mid: string) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const r = size / 2
  const grad = g.createRadialGradient(r, r, 0, r, r, r)
  grad.addColorStop(0, core)
  grad.addColorStop(0.3, mid)
  grad.addColorStop(1, 'rgba(240,200,120,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return c
}
