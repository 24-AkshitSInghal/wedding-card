import type { CSSProperties } from 'react'
import type { WeddingConfig } from '../config/wedding'
import type { SceneModel } from '../engine/schedule'
import { t } from '../lib/i18n'
import { Gateway } from './Gateway'
import { artUrl } from '../lib/art'
import { Layer } from './Layer'
import { Doves, FairyLights, Fans, FrameBorder, Medallion } from './Ornaments'
import { BlessingText, ClosingText, CoupleText, EveningText, ScheduleText, VenueText } from './SceneTexts'
import { CountdownText, FamilyWelcomeText, LittleHeartsText, StoryText } from './SectionTexts'

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
            <Gateway />
            <Doves />
            <div className="scroll-hint" aria-hidden="true">
              <span>{t('scrollToEnter')}</span>
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
            <img className="medallion-mono" data-src={artUrl('monogram')} alt="" draggable={false} />
          </Medallion>
        )}

        {scene.kind === 'couple' && <CoupleText cfg={cfg} top={preset.textMid} />}
        {scene.kind === 'blessing' && <BlessingText cfg={cfg} top={preset.textMid} />}
        {scene.kind === 'venue' && scene.event && <VenueText cfg={cfg} ev={scene.event} top={preset.textMid} />}
        {scene.kind === 'schedule' && <ScheduleText cfg={cfg} top={preset.textMid} henna={extras.has('henna')} />}
        {scene.kind === 'evening' && <EveningText cfg={cfg} top={preset.textMid} />}
        {scene.kind === 'countdown' && <CountdownText cfg={cfg} top={preset.textMid} />}
        {scene.kind === 'story' && <StoryText cfg={cfg} chapters={scene.chapters ?? []} intro={scene.intro} top={preset.textMid} />}
        {scene.kind === 'little' && <LittleHeartsText cfg={cfg} top={preset.textMid} />}
        {scene.kind === 'welcome' && <FamilyWelcomeText cfg={cfg} part={scene.part ?? 'hearty'} top={preset.textMid} />}
        {scene.kind === 'closing' && <ClosingText cfg={cfg} top={preset.textMid} />}
      </div>
    </section>
  )
}
