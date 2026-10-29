import type { CSSProperties } from 'react'
import type { LayerDef } from '../config/scenes'
import { ART_PARTS, artUrl, zForDepth } from '../lib/art'

interface Props {
  def: LayerDef
  /** Critical scenes load immediately; later scenes are filled in by the preloader. */
  eager: boolean
}

export function Layer({ def, eager }: Props) {
  const url = artUrl(def.src)
  const part = ART_PARTS[def.src]
  const classes = [
    'layer',
    def.anchor ?? 'bottom',
    def.wing && 'wing',
    def.narrow && 'narrow',
    def.ambient && `amb-${def.ambient}`,
    def.role && `role-${def.role}`,
  ]
    .filter(Boolean)
    .join(' ')

  const style = {
    '--w': def.w,
    '--wh': def.wh ?? 0,
    '--x': def.x ?? 0,
    '--y': def.y ?? 0,
    '--yh': def.yh ?? 0,
    '--z': zForDepth(def.d),
    '--delay': `${def.delay ?? 0}s`,
  } as CSSProperties

  return (
    <div className={classes} data-d={def.d} data-x={def.x ?? 0} data-role={def.role} style={style}>
      <div className="layer-inner">
        <div className={def.flip ? 'art flip' : 'art'}>
          <img
            src={eager ? url : undefined}
            data-src={eager ? undefined : url}
            alt=""
            draggable={false}
            decoding="async"
            style={part?.base ? { clipPath: part.base } : undefined}
          />
          {part && (
            <img
              className={`part part--${part.motion}`}
              src={eager ? url : undefined}
              data-src={eager ? undefined : url}
              alt=""
              draggable={false}
              decoding="async"
              style={{ clipPath: part.clip, transformOrigin: part.origin }}
            />
          )}
          {def.glint && (
            <span
              className="glint"
              data-mask={eager ? undefined : url}
              style={eager ? ({ '--mask': `url(${url})` } as CSSProperties) : undefined}
            />
          )}
        </div>
      </div>
    </div>
  )
}
