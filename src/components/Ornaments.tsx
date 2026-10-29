import type { CSSProperties } from 'react'

/* Hand-drawn SVG ornaments. Every stroked path uses pathLength=1 so the timeline
   can "draw" it by animating stroke-dashoffset from 1 to 0. */

const petal = 'M0 -7 C -4 -14, -2 -20, 0 -23 C 2 -20, 4 -14, 0 -7 Z'

function HennaHalf() {
  return (
    <g>
      <path pathLength={1} d="M143 40 C 128 40, 121 30, 105 32 C 91 34, 87 46, 73 46 C 61 46, 55 38, 47 38" />
      <path pathLength={1} d="M47 38 C 38 38, 34 30, 40 26 C 45 23, 51 28, 46 31" />
      <path pathLength={1} d="M105 32 C 101 22, 108 16, 115 17 C 113 24, 110 28, 105 32 Z" />
      <path pathLength={1} d="M108 27 C 109 23, 111 21, 113 20" />
      <path pathLength={1} d="M87 42 C 82 51, 88 58, 95 58 C 94 52, 92 46, 87 42 Z" />
      <path pathLength={1} d="M121 37 C 112 45, 116 55, 125 53 C 131 51, 129 43, 121 37 Z" />
      <path pathLength={1} d="M121 42 C 118 46, 120 50, 124 49" />
      <path pathLength={1} d="M73 46 C 70 54, 64 58, 58 57" />
      <path pathLength={1} d="M66 44 C 64 36, 70 31, 76 33" />
      <circle className="dot" cx="124" cy="46" r="1.4" />
      <circle className="dot" cx="58" cy="57" r="1.3" />
      <circle className="dot" cx="52" cy="57.5" r="1.1" />
      <circle className="dot" cx="46.5" cy="57" r="0.9" />
      <circle className="dot" cx="36" cy="33" r="1.1" />
      <circle className="dot" cx="31" cy="36" r="0.9" />
      <circle className="dot" cx="96" cy="26" r="1.2" />
      <circle className="dot" cx="92" cy="22" r="0.9" />
    </g>
  )
}

/** Mehendi-style ornament that is drawn around the Mehendi title, like henna being applied. */
export function Henna({ flip = false }: { flip?: boolean }) {
  return (
    <svg className={`henna${flip ? ' henna--flip' : ''}`} viewBox="0 0 320 70" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <HennaHalf />
        <g transform="translate(320 0) scale(-1 1)">
          <HennaHalf />
        </g>
        <g transform="translate(160 40)">
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} pathLength={1} d={petal} transform={`rotate(${i * 45})`} />
          ))}
          <circle className="dot" r="4" />
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2
            return <circle key={i} className="dot" cx={Math.cos(a) * 27} cy={Math.sin(a) * 27} r="1" />
          })}
        </g>
      </g>
    </svg>
  )
}

/** A divider rule with a small lotus at its centre. */
export function Rule({ className = 'ornament-rule' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 14" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
        <path pathLength={1} d="M4 7 H 64" />
        <path pathLength={1} d="M156 7 H 96" />
        <path pathLength={1} d="M80 1.5 C 76 4, 76 10, 80 12.5 C 84 10, 84 4, 80 1.5 Z" />
        <path pathLength={1} d="M80 12 C 74 12, 70 9, 68 6 C 72 6, 77 8, 80 12" />
        <path pathLength={1} d="M80 12 C 86 12, 90 9, 92 6 C 88 6, 83 8, 80 12" />
      </g>
      <g fill="currentColor">
        <circle cx="66" cy="7" r="1.1" />
        <circle cx="94" cy="7" r="1.1" />
        <circle cx="2" cy="7" r="0.9" />
        <circle cx="158" cy="7" r="0.9" />
      </g>
    </svg>
  )
}

/** Scalloped (cusped) medallion that frames the closing emblem. */
export function Medallion({ children }: { children?: React.ReactNode }) {
  const lobes = 14
  const scallop = (r: number, bulge: number) => {
    let d = ''
    for (let i = 0; i <= lobes; i++) {
      const a = (i / lobes) * Math.PI * 2 - Math.PI / 2
      const x = 100 + Math.cos(a) * r
      const y = 100 + Math.sin(a) * r
      if (i === 0) {
        d += `M${x.toFixed(2)} ${y.toFixed(2)}`
        continue
      }
      const am = a - Math.PI / lobes
      const cx = 100 + Math.cos(am) * r * bulge
      const cy = 100 + Math.sin(am) * r * bulge
      d += ` Q${cx.toFixed(2)} ${cy.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`
    }
    return d + ' Z'
  }
  return (
    <div className="medallion" data-d="0">
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <radialGradient id="med-fill" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#a8383a" />
            <stop offset="100%" stopColor="#6e1a1d" />
          </radialGradient>
          <linearGradient id="med-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff2cf" />
            <stop offset="55%" stopColor="#e2b86e" />
            <stop offset="100%" stopColor="#b88a43" />
          </linearGradient>
        </defs>
        <path className="med-fill" d={scallop(90, 1.13)} fill="url(#med-fill)" />
        <g fill="none" stroke="url(#med-gold)" strokeLinejoin="round">
          <path pathLength={1} d={scallop(93, 1.13)} strokeWidth="3.2" />
          <path pathLength={1} d={scallop(84, 1.12)} strokeWidth="1" />
          <path pathLength={1} d={scallop(79, 1.1)} strokeWidth="0.6" />
        </g>
        <g fill="#e7c27c">
          {Array.from({ length: lobes }, (_, i) => {
            const a = (i / lobes) * Math.PI * 2 - Math.PI / 2
            return <circle key={i} className="dot" cx={100 + Math.cos(a) * 99} cy={100 + Math.sin(a) * 99} r="1.6" />
          })}
        </g>
      </svg>
      <div className="medallion-inner">{children}</div>
    </div>
  )
}

/** Pair of painted bijna fans, a motif from the formal invitation page of the reference. */
export function Fans() {
  const fan = (
    <g>
      <path d="M50 50 L 6 34 A 46 46 0 0 1 94 34 Z" fill="#2c5d45" />
      <path d="M50 50 L 6 34 A 46 46 0 0 1 94 34 Z" fill="none" stroke="#e7c27c" strokeWidth="1.6" />
      {Array.from({ length: 11 }, (_, i) => {
        const a = Math.PI + 0.33 + (i / 10) * (Math.PI - 0.66)
        return (
          <line
            key={i}
            x1="50"
            y1="50"
            x2={50 + Math.cos(a) * 44}
            y2={50 + Math.sin(a) * 44}
            stroke="#e7c27c"
            strokeWidth="0.8"
          />
        )
      })}
      <path d="M50 50 L 38 62 L 50 70 L 62 62 Z" fill="#e7c27c" />
      <circle cx="50" cy="50" r="3" fill="#b3202a" />
    </g>
  )
  return (
    <div className="fans" data-d="0.2" aria-hidden="true">
      <svg viewBox="0 0 170 90">
        <g transform="translate(0 6) rotate(-12 50 50)">{fan}</g>
        <g transform="translate(66 18) rotate(10 50 50)">{fan}</g>
      </svg>
    </div>
  )
}

/** Strings of warm lights swagged across the top of the Garba arch. */
export function FairyLights() {
  const strings = [
    { y0: 8, sag: 30, count: 15 },
    { y0: 16, sag: 22, count: 13 },
  ]
  return (
    <div className="fairy-lights" data-d="0.15" aria-hidden="true">
      <svg viewBox="0 0 100 50" preserveAspectRatio="none">
        {strings.map((s, si) => {
          const pts = Array.from({ length: s.count }, (_, i) => {
            const t = (i + 0.5) / s.count
            const x = 4 + t * 92
            const y = s.y0 + 4 * s.sag * t * (1 - t) * 0.5
            return { x, y }
          })
          return (
            <g key={si}>
              <path
                d={`M4 ${s.y0} Q 50 ${s.y0 + s.sag} 96 ${s.y0}`}
                fill="none"
                stroke="rgb(60 30 10 / 0.55)"
                strokeWidth="0.25"
                vectorEffect="non-scaling-stroke"
              />
              {pts.map((p, i) => (
                <g key={i} className="bulb" style={{ '--i': i + si * 7 } as CSSProperties}>
                  <ellipse cx={p.x} cy={p.y + 0.9} rx="1.9" ry="3.4" fill="rgb(255 210 120 / 0.22)" />
                  <ellipse cx={p.x} cy={p.y + 0.9} rx="0.55" ry="1.05" fill="#fff1c4" />
                </g>
              ))}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/** Two white doves crossing the dusk sky above the gateway. */
export function Doves() {
  const dove = (
    <svg viewBox="0 0 40 24">
      <path d="M4 14 C 10 12, 16 12, 22 13 C 26 12, 30 11, 33 12 C 31 13.5, 29 14.5, 26 15 C 20 17, 11 17, 4 14 Z" fill="#f4ecdc" />
      <path d="M33 12 L 37 11.4 L 33.4 13 Z" fill="#c9a26a" />
      <g className="wing">
        <path d="M14 13.5 C 14 6, 20 1.5, 27 1 C 23 5, 21 9, 20 13.5 Z" fill="#fbf5e9" />
      </g>
      <path d="M4 14 L 0 11.5 L 1 15.5 Z" fill="#efe4d0" />
    </svg>
  )
  return (
    <div className="doves" aria-hidden="true">
      <div className="dove dove--a">{dove}</div>
      <div className="dove dove--b">{dove}</div>
    </div>
  )
}

export function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 21.5 C 12 21.5, 5 14.2, 5 9.4 A 7 7 0 0 1 19 9.4 C 19 14.2, 12 21.5, 12 21.5 Z" />
      <circle cx="12" cy="9.4" r="2.4" />
    </svg>
  )
}

export function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
      <path d="M3.5 9.5 H 20.5 M8 3 V 6.5 M16 3 V 6.5" />
      <path d="M12 12.2 L 12.9 14.1 L 15 14.3 L 13.4 15.6 L 13.9 17.6 L 12 16.5 L 10.1 17.6 L 10.6 15.6 L 9 14.3 L 11.1 14.1 Z" />
    </svg>
  )
}
