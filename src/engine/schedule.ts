import { BLESSING, CLOSING, COUNTDOWN, COUPLE, FAMILY_WELCOME, HOLD, LITTLE_HEARTS, OPENING, presetFor, STORY_INTRO, STORY_ONE, STORY_TWO } from '../config/scenes'
import type { ScenePreset, TransitionType } from '../config/scenes'
import type { StoryChapter, WeddingConfig, WeddingEvent } from '../config/wedding'

export type SceneKind = 'opening' | 'couple' | 'blessing' | 'countdown' | 'story' | 'event' | 'little' | 'welcome' | 'closing'

export interface SceneModel {
  id: string
  kind: SceneKind
  preset: ScenePreset
  event?: WeddingEvent
  eventIndex?: number
  /** For story scenes: the chapters shown, and whether the introduction leads. */
  chapters?: StoryChapter[]
  intro?: boolean
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
  type Raw = Pick<SceneModel, 'id' | 'kind' | 'preset' | 'event' | 'eventIndex' | 'chapters' | 'intro'> & { hold: number }
  // The story opens with its title and introduction on their own slide, then the chapters
  // follow two to a slide so the words can stay large.
  const { chapters } = cfg.story
  const pairs: StoryChapter[][] = []
  for (let i = 0; i < chapters.length; i += 2) pairs.push(chapters.slice(i, i + 2))
  const chapterLooks = [STORY_ONE, STORY_TWO]
  const story: Raw[] = chapters.length || cfg.story.intro.trim()
    ? [
        { id: 'story-intro', kind: 'story', preset: STORY_INTRO, hold: HOLD.story, chapters: [], intro: true },
        ...pairs.map((pair, i) => ({
          id: `story-${i + 1}`,
          kind: 'story' as const,
          preset: chapterLooks[i % chapterLooks.length],
          hold: HOLD.story,
          chapters: pair,
        })),
      ]
    : []
  const little = cfg.littleHearts
  const { welcome } = cfg

  const raw: Raw[] = [
    { id: 'opening', kind: 'opening', preset: OPENING, hold: HOLD.opening },
    { id: 'couple', kind: 'couple', preset: COUPLE, hold: HOLD.couple },
    ...(cfg.countdown.show ? [{ id: 'countdown', kind: 'countdown' as const, preset: COUNTDOWN, hold: HOLD.countdown }] : []),
    ...story,
    { id: 'blessing', kind: 'blessing', preset: BLESSING, hold: HOLD.blessing },
    ...cfg.events.map((event, i) => ({
      id: `event-${i}-${event.id}`,
      kind: 'event' as const,
      preset: presetFor(event.scene, i),
      hold: HOLD.event,
      event,
      eventIndex: i,
    })),
    ...(little.names.trim() || little.message.length
      ? [{ id: 'little', kind: 'little' as const, preset: LITTLE_HEARTS, hold: HOLD.welcome }]
      : []),
    ...(welcome.hearty.length || welcome.special.length
      ? [{ id: 'welcome', kind: 'welcome' as const, preset: FAMILY_WELCOME, hold: HOLD.welcome }]
      : []),
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
