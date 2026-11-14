import {
  BLESSING,
  CLOSING,
  COUNTDOWN,
  COUPLE,
  FAMILY_SPECIAL,
  FAMILY_WELCOME,
  HOLD,
  LITTLE_HEARTS,
  OPENING,
  presetFor,
  STORY_INTRO,
  STORY_ONE,
  STORY_TWO,
} from '../config/scenes'
import type { ScenePreset, TransitionType } from '../config/scenes'
import type { StoryChapter, WeddingConfig, WeddingEvent } from '../config/wedding'

export type SceneKind =
  | 'opening'
  | 'couple'
  | 'blessing'
  | 'countdown'
  | 'story'
  | 'venue'
  | 'schedule'
  | 'evening'
  | 'little'
  | 'welcome'
  | 'closing'

export interface SceneModel {
  id: string
  kind: SceneKind
  preset: ScenePreset
  /** For a schedule slide: the events it lists (one day's, or all when there is one day). */
  events?: WeddingEvent[]
  /** For a schedule slide: true when the wedding spans several days (each gets a slide). */
  multiDay?: boolean
  /** For story scenes: the chapters shown, and whether the introduction leads. */
  chapters?: StoryChapter[]
  intro?: boolean
  /** For welcome scenes: which of the two family lists is shown. */
  part?: 'hearty' | 'special'
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
  type Raw = Pick<SceneModel, 'id' | 'kind' | 'preset' | 'events' | 'multiDay' | 'chapters' | 'intro' | 'part'> & { hold: number }
  // The story opens with its title and introduction on their own slide, then the chapters
  // follow three to a slide so the words can stay large.
  const { chapters } = cfg.story
  const pairs: StoryChapter[][] = []
  for (let i = 0; i < chapters.length; i += 3) pairs.push(chapters.slice(i, i + 3))
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
  const [first, second] = cfg.events
  // Events grouped by day, in the order the days first appear.
  const days: WeddingEvent[][] = []
  for (const ev of cfg.events) {
    const day = days.find((d) => d[0].date === ev.date)
    if (day) day.push(ev)
    else days.push([ev])
  }
  const little = cfg.littleHearts
  const { welcome } = cfg

  const raw: Raw[] = [
    { id: 'opening', kind: 'opening', preset: OPENING, hold: HOLD.opening },
    { id: 'couple', kind: 'couple', preset: COUPLE, hold: HOLD.couple },
    ...(cfg.countdown.show ? [{ id: 'countdown', kind: 'countdown' as const, preset: COUNTDOWN, hold: HOLD.countdown }] : []),
    ...story,
    // The venue (or venues) has a slide of its own; the schedule slides list only the times.
    ...(first?.venue.trim() ? [{ id: 'venue', kind: 'venue' as const, preset: STORY_TWO, hold: HOLD.story }] : []),
    { id: 'blessing', kind: 'blessing', preset: BLESSING, hold: HOLD.blessing },
    // One slide for the whole schedule when it is a single day; otherwise one slide per day,
    // each painted as the scene of that day's first event.
    ...days.map((events, i) => ({
      id: days.length > 1 ? `day-${i + 1}` : 'schedule',
      kind: 'schedule' as const,
      preset: presetFor(events[0].scene, i),
      hold: HOLD.event,
      events,
      multiDay: days.length > 1,
    })),
    // A single line rests on the second event's scene, e.g. "Under the stars".
    ...(cfg.eveningLine.trim()
      ? [{ id: 'evening', kind: 'evening' as const, preset: presetFor(second?.scene ?? 'hasta-melap', 1), hold: HOLD.event }]
      : []),
    ...(little.names.trim() || little.message.length
      ? [{ id: 'little', kind: 'little' as const, preset: LITTLE_HEARTS, hold: HOLD.welcome }]
      : []),
    // Each family list gets its own slide so every name sits on its own line, large.
    ...(welcome.hearty.length
      ? [{ id: 'welcome-hearty', kind: 'welcome' as const, preset: FAMILY_WELCOME, hold: HOLD.welcome, part: 'hearty' as const }]
      : []),
    ...(welcome.special.length
      ? [{ id: 'welcome-special', kind: 'welcome' as const, preset: FAMILY_SPECIAL, hold: HOLD.welcome, part: 'special' as const }]
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
