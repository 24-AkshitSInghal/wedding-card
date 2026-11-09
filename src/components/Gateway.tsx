import type { CSSProperties } from 'react'
import { artUrl, zForDepth } from '../lib/art'

/** Doorway opening measured from gate_frame.webp's alpha (fractions of the image). */
const HOLE = { left: 0.3167, top: 0.5531, right: 0.6833, bottom: 1 }
const BLEED = 0.004


/**
 * The palace gateway: carved frame, the two door leaves that swing open on scroll,
 * and the warm interior glimpsed through the doorway.
 */
export function Gateway() {
  const style = {
    '--w': 0,
    '--wh': 0.545,
    '--x': 0,
    '--y': 0,
    '--yh': 0,
    '--z': zForDepth(0),
    '--hole-l': `${(HOLE.left - BLEED) * 100}%`,
    '--hole-t': `${(HOLE.top - BLEED) * 100}%`,
    '--hole-w': `${(HOLE.right - HOLE.left + BLEED * 2) * 100}%`,
    '--hole-h': `${(HOLE.bottom - HOLE.top + BLEED) * 100}%`,
    '--gate-mask': `url(${artUrl('gate_frame')})`,
  } as CSSProperties

  return (
    <div className="layer bottom gate" data-d="0" data-role="gate" style={style}>
      <div className="gate-doorway">
        <div className="gate-inside" />
        {/* Warm light from the palace leaking through the seam of the closed doors. */}
        <span className="gate-seam" />
        <div className="gate-doors">
          <div className="door door--l">
            <img src={artUrl('door_left')} alt="" draggable={false} />
            <span className="door-shade" />
          </div>
          <div className="door door--r">
            <img src={artUrl('door_right')} alt="" draggable={false} />
            <span className="door-shade" />
          </div>
        </div>
        {/* The couple's monogram hung as a seal across the closed doors. */}
        <div className="plaque" aria-hidden="true">
          <svg className="plaque-seal" viewBox="0 0 100 100">
            <defs>
              <radialGradient id="seal-fill" cx="50%" cy="45%" r="60%">
                <stop offset="0%" stopColor="#9e3036" />
                <stop offset="100%" stopColor="#5e1519" />
              </radialGradient>
            </defs>
            <path
              d="M50 3 C 58 12, 70 10, 76 16 C 82 22, 80 32, 89 38 C 97 44, 97 56, 89 62 C 80 68, 82 78, 76 84 C 70 90, 58 88, 50 97 C 42 88, 30 90, 24 84 C 18 78, 20 68, 11 62 C 3 56, 3 44, 11 38 C 20 32, 18 22, 24 16 C 30 10, 42 12, 50 3 Z"
              fill="url(#seal-fill)"
              stroke="#e7c27c"
              strokeWidth="1.6"
            />
          </svg>
          <img src={artUrl('monogram')} alt="" draggable={false} />
        </div>
      </div>
      <img className="gate-img" src={artUrl('gate_frame')} alt="" draggable={false} />
      {/* A marigold toran hung across the entrance, as for every wedding doorway. */}
      <img className="gate-toran" src={artUrl('marigold_toran')} alt="" draggable={false} />
    </div>
  )
}
