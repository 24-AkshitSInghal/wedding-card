import type { CSSProperties } from 'react'
import type { WeddingConfig } from '../config/wedding'
import type { SceneModel } from '../engine/schedule'
import { eventUid, initials } from '../lib/format'
import { Gateway } from './Gateway'
import { artUrl } from '../lib/art'
import { Layer } from './Layer'
import { Doves, FairyLights, Fans, FrameBorder, Medallion } from './Ornaments'
import { BlessingText, ClosingText, CoupleText, EventText } from './SceneTexts'

interface Props {
  scene: SceneModel
  index: number
  cfg: WeddingConfig
  /** Scenes needed for the first impression load right away. */
  eager: boolean
}

export function Scene({ scene, index, cfg, eager }: Props) {
  const { preset } = scene
  const extras = new Set(preset.extras ?? [])
  const pal = preset.palette
  const style = {
    '--c-center': pal.center,
    '--c-mid': pal.mid,
    '--c-edge': pal.edge,
    '--ink': pal.ink,
    '--scrim': pal.scrim ?? 0.16,
  } as CSSProperties
  const [i1, i2] = initials(cfg)

  return (
    <section
      className={`scene scene--${scene.kind} is-off`}
      data-scene={index}
      data-id={scene.id}
      data-enter={scene.enter}
      style={style}
    >
      <div className="scene-bg" data-role="bg" />
      {extras.has('rays') && <div className="rays" />}

      <div className="frame">
        {preset.layers.map((def, i) => (
          <Layer key={i} def={def} eager={eager} />
        ))}

        {scene.kind === 'opening' && (
          <>
            <Gateway initials={[i1, i2]} />
            <Doves />
            <div className="scroll-hint" aria-hidden="true">
              <span>Scroll to enter</span>
              <i />
            </div>
          </>
        )}

        {extras.has('border') && <FrameBorder />}
        {extras.has('fan') && <Fans />}
        {extras.has('fairy-lights') && <FairyLights />}
        {extras.has('medallion') && <div className="final-glow" />}
        {extras.has('medallion') && (
          <Medallion>
            <img className="medallion-emblem" data-src={artUrl('emblem_buta')} alt="" draggable={false} />
            <span className="medallion-initials">
              {i1}
              <span className="amp">&amp;</span>
              {i2}
            </span>
          </Medallion>
        )}

        {scene.kind === 'couple' && <CoupleText cfg={cfg} top={preset.textTop} />}
        {scene.kind === 'blessing' && <BlessingText cfg={cfg} top={preset.textTop} />}
        {scene.kind === 'event' && scene.event && (
          <EventText
            cfg={cfg}
            ev={scene.event}
            uid={eventUid(scene.event, scene.eventIndex ?? 0)}
            top={preset.textTop}
            henna={extras.has('henna')}
          />
        )}
        {scene.kind === 'closing' && <ClosingText cfg={cfg} top={preset.textTop} />}
      </div>
    </section>
  )
}
