import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

export interface ParticlesHandle {
  /** Petal colours for the scene in view. */
  setColors(colors: string[]): void
  /** Scroll velocity in px/s, so petals lag behind a fast scroll. */
  nudge(velocity: number): void
}

interface Props {
  lite: boolean
}

interface P {
  x: number
  y: number
  z: number // 0.4 (far) … 1.3 (near)
  vx: number
  vy: number
  rot: number
  vr: number
  phase: number
  color: number
  kind: 'petal' | 'dust'
}

const FPS = 30

/** Drifting petals and fine gold dust, drawn on one canvas at a capped frame rate. */
export const Particles = forwardRef<ParticlesHandle, Props>(function Particles({ lite }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const colors = useRef<string[]>(['#e48aa6', '#f3c1cf', '#c2416b', '#fff1e6'])
  const sprites = useRef<HTMLCanvasElement[]>([])
  const push = useRef(0)

  useImperativeHandle(ref, () => ({
    setColors(next) {
      if (next.join() === colors.current.join()) return
      colors.current = next
      sprites.current = next.map(makePetal)
    },
    nudge(v) {
      push.current = Math.max(-2400, Math.min(2400, v))
    },
  }))

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    sprites.current = colors.current.map(makePetal)
    const dust = makeDust()
    let w = 0
    let h = 0
    let dpr = 1
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const area = Math.min(1, (window.innerWidth * window.innerHeight) / (1400 * 900))
    const petalCount = Math.round((lite ? 10 : 18) + (lite ? 6 : 14) * area)
    const dustCount = Math.round((lite ? 14 : 26) + 20 * area)
    const spawn = (kind: P['kind'], anywhere: boolean): P => ({
      kind,
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : kind === 'petal' ? -20 : h + 10,
      z: 0.4 + Math.random() * 0.9,
      vx: (Math.random() - 0.5) * 12,
      vy: kind === 'petal' ? 14 + Math.random() * 18 : -(3 + Math.random() * 6),
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 1.6,
      phase: Math.random() * Math.PI * 2,
      color: Math.floor(Math.random() * 4),
    })
    const ps: P[] = [
      ...Array.from({ length: petalCount }, () => spawn('petal', true)),
      ...Array.from({ length: dustCount }, () => spawn('dust', true)),
    ]

    let raf = 0
    let last = performance.now()
    let acc = 0
    let lag = 0
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      acc += now - last
      last = now
      if (acc < 1000 / FPS) return
      const dt = Math.min(acc, 100) / 1000
      acc = 0
      // Scroll makes the air move: petals are carried upward against a downward scroll.
      lag += (push.current * 0.05 - lag) * 0.12
      push.current *= 0.9
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const t = now / 1000
      for (const p of ps) {
        const sway = Math.sin(t * 0.8 + p.phase) * (p.kind === 'petal' ? 18 : 6)
        p.x += (p.vx + sway * 0.6) * dt * p.z
        p.y += (p.vy - lag * (p.kind === 'petal' ? 1 : 0.4)) * dt * p.z
        p.rot += p.vr * dt
        if (p.kind === 'petal' && (p.y > h + 30 || p.y < -60)) Object.assign(p, spawn('petal', false), p.y < -60 ? { y: h + 20 } : {})
        if (p.kind === 'dust' && (p.y < -10 || p.y > h + 20)) Object.assign(p, spawn('dust', false))
        if (p.x < -30) p.x = w + 20
        if (p.x > w + 30) p.x = -20
        if (p.kind === 'petal') {
          const sprite = sprites.current[p.color % sprites.current.length]
          const s = 7 + 7 * p.z
          ctx.save()
          ctx.globalAlpha = 0.55 + 0.4 * Math.min(1, p.z)
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rot)
          // Fake the tumble of a petal by squashing it on one axis.
          ctx.scale(1, 0.45 + 0.55 * Math.abs(Math.sin(t * 1.3 + p.phase)))
          ctx.drawImage(sprite, -s / 2, -s / 2, s, s)
          ctx.restore()
        } else {
          const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.7 + p.phase))
          const s = 3 + 5 * p.z
          ctx.globalAlpha = tw * 0.8
          ctx.drawImage(dust, p.x - s / 2, p.y - s / 2, s, s)
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

function makePetal(color: string) {
  const c = document.createElement('canvas')
  c.width = c.height = 32
  const g = c.getContext('2d')!
  g.translate(16, 16)
  const grad = g.createRadialGradient(-3, -4, 1, 0, 0, 14)
  grad.addColorStop(0, '#ffffff')
  grad.addColorStop(0.25, color)
  grad.addColorStop(1, color)
  g.fillStyle = grad
  g.globalAlpha = 0.95
  g.beginPath()
  g.moveTo(0, -13)
  g.bezierCurveTo(10, -9, 11, 6, 0, 13)
  g.bezierCurveTo(-11, 6, -10, -9, 0, -13)
  g.fill()
  g.globalAlpha = 0.25
  g.strokeStyle = '#ffffff'
  g.lineWidth = 0.8
  g.beginPath()
  g.moveTo(0, -10)
  g.quadraticCurveTo(1.5, 0, 0, 11)
  g.stroke()
  return c
}

function makeDust() {
  const c = document.createElement('canvas')
  c.width = c.height = 16
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(8, 8, 0, 8, 8, 8)
  grad.addColorStop(0, 'rgba(255,240,200,1)')
  grad.addColorStop(0.35, 'rgba(240,200,120,0.6)')
  grad.addColorStop(1, 'rgba(240,200,120,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 16, 16)
  return c
}
