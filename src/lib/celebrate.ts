/**
 * A short burst of gold glitter and confetti that bursts out from an element and falls,
 * drawn on a temporary full-screen canvas that removes itself when the pieces have gone.
 */
const COLORS = ['#f7dc94', '#e7c27c', '#fff4d6', '#d4a55a', '#c2414a', '#e7a1a6', '#f2a516']

interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rot: number
  spin: number
  color: string
  kind: 'confetti' | 'glitter'
  phase: number
}

export function celebrate(from: HTMLElement, lite = false) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const r = from.getBoundingClientRect()
  const canvas = document.createElement('canvas')
  canvas.className = 'celebrate-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const W = window.innerWidth
  const H = window.innerHeight
  canvas.width = W * dpr
  canvas.height = H * dpr
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  const pieces: Piece[] = []
  const count = lite ? 60 : 130
  for (let i = 0; i < count; i++) {
    const glitter = i % 3 === 0
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.15
    const speed = (glitter ? 5 : 7) + Math.random() * 7
    pieces.push({
      x: r.left + r.width * (0.2 + Math.random() * 0.6),
      y: r.top + r.height * (0.3 + Math.random() * 0.4),
      vx: Math.cos(angle) * speed * 0.9,
      vy: Math.sin(angle) * speed,
      size: glitter ? 1.4 + Math.random() * 2 : 5 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.35,
      color: glitter ? COLORS[Math.floor(Math.random() * 3)] : COLORS[Math.floor(Math.random() * COLORS.length)],
      kind: glitter ? 'glitter' : 'confetti',
      phase: Math.random() * Math.PI * 2,
    })
  }

  const start = performance.now()
  const LIFE = 2600
  let last = start
  const frame = (now: number) => {
    const dt = Math.min(2.5, (now - last) / 16.67)
    last = now
    const age = now - start
    const fade = age > LIFE - 700 ? Math.max(0, (LIFE - age) / 700) : 1
    ctx.clearRect(0, 0, W, H)
    for (const p of pieces) {
      p.vy += 0.22 * dt
      p.vx *= 0.985 ** dt
      p.vy *= 0.985 ** dt
      p.x += p.vx * dt + Math.sin(age / 260 + p.phase) * 0.6 * dt
      p.y += p.vy * dt
      p.rot += p.spin * dt
      ctx.globalAlpha = fade
      if (p.kind === 'glitter') {
        // Twinkling star of light.
        const tw = 0.5 + 0.5 * Math.sin(age / 90 + p.phase)
        ctx.globalAlpha = fade * (0.35 + 0.65 * tw)
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 6
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (0.7 + tw * 0.5), 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      } else {
        // A paper strip turning over as it falls.
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.scale(1, Math.cos(age / 140 + p.phase))
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        ctx.restore()
      }
    }
    if (age < LIFE) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}
