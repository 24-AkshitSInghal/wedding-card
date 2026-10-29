import { BLESSING, CLOSING, COUPLE, HOLD, OPENING, presetFor } from '../config/scenes'
import type { ScenePreset, TransitionType } from '../config/scenes'
import type { WeddingConfig, WeddingEvent } from '../config/wedding'

export type SceneKind = 'opening' | 'couple' | 'blessing' | 'event' | 'closing'

export interface SceneModel {
  id: string
  kind: SceneKind
  preset: ScenePreset
  event?: WeddingEvent
  eventIndex?: number
  /* Timeline positions in scroll units (1 unit = one viewport height of scrolling). */
  start: number // the enter transition begins
  restAt: number // the scene is fully composed
  exitAt: number // the next scene's transition begins
  end: number // the scene is fully gone
  enter: TransitionType
  enterDur: number
}

/** Scroll that remains after the closing settles, so the end is not a hard stop. */
const TAIL = 0.35

export function buildScenes(cfg: WeddingConfig): { scenes: SceneModel[]; total: number } {
  const raw: { id: string; kind: SceneKind; preset: ScenePreset; hold: number; event?: WeddingEvent; eventIndex?: number }[] = [
    { id: 'opening', kind: 'opening', preset: OPENING, hold: HOLD.opening },
    { id: 'couple', kind: 'couple', preset: COUPLE, hold: HOLD.couple },
    { id: 'blessing', kind: 'blessing', preset: BLESSING, hold: HOLD.blessing },
    ...cfg.events.map((event, i) => ({
      id: `event-${i}-${event.id}`,
      kind: 'event' as const,
      preset: presetFor(event.scene, i),
      hold: HOLD.event,
      event,
      eventIndex: i,
    })),
    { id: 'closing', kind: 'closing', preset: CLOSING, hold: HOLD.closing },
  ]

  const scenes: SceneModel[] = []
  let t = 0
  raw.forEach((r, i) => {
    // The opening has no enter transition; it is simply there when the page loads.
    const enterDur = i === 0 ? 0 : r.preset.enterDur
    // Procession needs an elephant to walk; if a scene lacks one, fall back to a truck.
    const enter = r.preset.enter === 'procession' && !r.preset.layers.some((l) => l.role === 'walker') ? 'truck' : r.preset.enter
    const start = t
    const restAt = start + enterDur
    const exitAt = restAt + r.hold
    scenes.push({ ...r, start, restAt, exitAt, end: exitAt, enter, enterDur })
    t = exitAt
  })
  // A scene stays rendered until the next one has fully settled. After a truck the new
  // colour finishes sweeping across the wide-screen wings, so the old scene lingers a beat.
  for (let i = 0; i < scenes.length - 1; i++) {
    const next = scenes[i + 1]
    scenes[i].end = next.restAt + (next.enter === 'truck' ? next.enterDur * 0.3 : 0)
  }
  const last = scenes[scenes.length - 1]
  last.end = last.exitAt + TAIL
  return { scenes, total: last.end }
}
