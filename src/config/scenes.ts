/**
 * Art direction for every scene: palette, illustrated layers, depth and how the
 * scene enters. Wedding *content* lives in wedding.ts; this file is the stage.
 *
 * Layer geometry is expressed in frame units: the portrait frame is 100 units
 * wide (on phones that is the screen width; elsewhere a centred 9:16 window).
 *   w      width in units (wh: minimum width as a fraction of frame height)
 *   x      horizontal offset of the layer's centre from the frame centre
 *   y      offset from the anchor edge (bottom/top) in units
 *   yh     for anchor 'bottom-at': the layer's bottom sits at this fraction of the frame height
 *   d      depth  -1 far … 0 architecture … 1 nearest foreground (drives parallax)
 */

export type TransitionType =
  | 'gate' // palace doors swing open, camera dollies through the doorway
  | 'crane' // camera cranes down: old scene rises away, new architecture rises into view
  | 'truck' // camera trucks sideways along the colonnade of arches
  | 'iris' // colour blooms outward from the centre, wings part, structures rise
  | 'procession' // the elephant walks the new colour in from the left
  | 'curtain' // garlands drop like a curtain, camera dollies toward the mandap
  | 'bloom' // a wash of soft golden light dissolves into the sacred scene
  | 'lift' // the last scene lifts away like a page, revealing the closing

/** Idle motion: sway/swing hang from the top; breeze bends foliage from its base. */
export type Ambient = 'sway' | 'sway-slow' | 'breathe' | 'breeze' | 'swing' | 'flicker' | 'drift'

export type LayerRole = 'arch' | 'walker' | 'garland' | 'mandap' | 'emblem' | 'peacock'

export interface LayerDef {
  src: string
  w: number
  wh?: number
  x?: number
  y?: number
  yh?: number
  anchor?: 'bottom' | 'top' | 'bottom-at'
  d: number
  flip?: boolean
  ambient?: Ambient
  role?: LayerRole
  /** Only on wide screens (desktop wings). */
  wing?: boolean
  /** Hidden on wide screens. */
  narrow?: boolean
  delay?: number
  glint?: boolean
}

export interface Palette {
  center: string
  mid: string
  edge: string
  /** Text colour on this background. */
  ink: string
  /** Strength of the shade behind the text (raise it for light grounds). Default 0.16. */
  scrim?: number
}

/** What drifts through the air of a scene (drawn by components/Particles.tsx). */
export type Flora = 'petal' | 'blossom' | 'marigold' | 'leaf'
export interface ParticleMood {
  flora: { kind: Flora; colors: string[]; weight: number }[]
  /** Fireflies drifting and glowing. */
  motes: boolean
  /** 1 = normal drift; lower settles the air. */
  speed: number
}

export type Extra = 'henna' | 'rays' | 'fairy-lights' | 'fan' | 'medallion' | 'border'

export interface ScenePreset {
  palette: Palette
  air: ParticleMood
  /** Petals showered from above as the scene arrives (0 for none). */
  shower?: number
  enter: TransitionType
  enterDur: number
  layers: LayerDef[]
  extras?: Extra[]
  /** Top of the text block as a fraction of frame height. */
  textTop: number
}

const ARCH: LayerDef = { src: 'arch_event', w: 100, wh: 0.5, anchor: 'top', y: 0, d: 0, role: 'arch', glint: true }
const BALUSTRADE: LayerDef = { src: 'balustrade', w: 128, anchor: 'bottom', y: -2, d: 0.35 }
/** Neighbouring arches of the colonnade, seen on wide screens only. */
const COLONNADE: LayerDef[] = [
  { ...ARCH, x: -100, wing: true, role: undefined, glint: false },
  { ...ARCH, x: 100, wing: true, role: undefined, glint: false },
  { ...BALUSTRADE, x: -126, wing: true },
  { ...BALUSTRADE, x: 126, wing: true },
]

const ROSE = ['#b3202a', '#d2414a', '#8e1622', '#e7a1a6']
const PINK = ['#e48aa6', '#f3c1cf', '#c2416b']
const BLOSSOM = ['#fff6ee', '#f8d3dc', '#f1a9bd']
const JASMINE = ['#fffaf0', '#f6ecd8']
const MARIGOLD = ['#f2a516', '#e8800e', '#ffcf4a', '#d9650c']
const LEAF = ['#7f9a4a', '#5e7f3a', '#a3b86a']

const air = (flora: ParticleMood['flora'], motes = false, speed = 1): ParticleMood => ({ flora, motes, speed })

export const OPENING: ScenePreset = {
  // A wine-red palace night.
  palette: { center: '#8a2830', mid: '#55141a', edge: '#1f0608', ink: '#f3e4c3' },
  air: air([{ kind: 'blossom', colors: BLOSSOM, weight: 3 }, { kind: 'petal', colors: PINK, weight: 2 }], true),
  enter: 'gate',
  enterDur: 0,
  textTop: 0.62,
  layers: [
    { src: 'garden_side', w: 84, x: -142, anchor: 'bottom', y: 0, d: 0.1, wing: true },
    { src: 'garden_side', w: 84, x: 142, anchor: 'bottom', y: 0, d: 0.1, flip: true, wing: true },
    { src: 'garden_side', w: 76, x: -72, anchor: 'bottom', y: 0, d: 0.25, wing: true },
    { src: 'garden_side', w: 76, x: 72, anchor: 'bottom', y: 0, d: 0.25, flip: true, wing: true },
    { src: 'garden_side', w: 50, x: -40, anchor: 'bottom', y: 0, d: 0.55, ambient: 'breeze' },
    { src: 'garden_side', w: 50, x: 40, anchor: 'bottom', y: 0, d: 0.55, flip: true, ambient: 'breeze', delay: -4 },
    { src: 'blossom_branch', w: 70, x: -30, anchor: 'top', y: -4, d: 0.75, ambient: 'sway' },
    { src: 'blossom_branch', w: 62, x: 34, anchor: 'top', y: -2, d: 0.8, flip: true, ambient: 'sway', delay: -3 },
    { src: 'red_flower_bush', w: 128, anchor: 'bottom', y: -13, d: 0.9, ambient: 'breeze', delay: -2 },
  ],
}

export const COUPLE: ScenePreset = {
  palette: { center: '#ad433b', mid: '#93302b', edge: '#561414', ink: '#f6e6c4' },
  air: air([{ kind: 'petal', colors: ROSE, weight: 3 }, { kind: 'blossom', colors: JASMINE, weight: 1 }]),
  shower: 26,
  enter: 'gate',
  enterDur: 2.0,
  textTop: 0.218,
  extras: [],
  layers: [
    // Through the gateway: the couple framed by the palace's carved arch, terraces beyond.
    { src: 'palace_terrace', w: 120, x: -95, anchor: 'bottom', y: 4, d: -0.3, wing: true },
    { src: 'palace_terrace', w: 120, x: 95, anchor: 'bottom', y: 4, d: -0.3, wing: true, flip: true },
    ...COLONNADE.slice(0, 2),
    ARCH,
    { src: 'cypress_pair', w: 20, x: -42, anchor: 'bottom', y: 12, d: -0.15, ambient: 'breeze' },
    { src: 'flowering_tree', w: 26, x: 41, anchor: 'bottom', y: 4, d: 0.05, ambient: 'breeze', delay: -3 },
    { src: 'chhatri_large', w: 38, x: -33, anchor: 'bottom', y: 2, d: 0.05 },
    { src: 'peacock_standing', w: 24, x: -38, anchor: 'bottom', y: -2, d: 0.3, ambient: 'breathe', role: 'peacock', glint: true },
    { src: 'wisteria_hanging', w: 42, x: -34, anchor: 'top', y: -3, d: 0.45, ambient: 'sway' },
    { src: 'vine_hanging', w: 26, x: 40, anchor: 'top', y: -2, d: 0.4, ambient: 'sway', delay: -2 },
    { src: 'banana_leaves', w: 42, x: 35, anchor: 'bottom', y: -8, d: 0.6, ambient: 'sway-slow' },
    { src: 'red_flower_bush', w: 124, anchor: 'bottom', y: -17, d: 0.85, ambient: 'breeze' },
    { src: 'emblem_buta', w: 19, anchor: 'top', y: 0, yh: 0.045, d: 0, role: 'emblem', glint: true },
  ],
}

export const BLESSING: ScenePreset = {
  palette: { center: '#a83c36', mid: '#8c2b28', edge: '#4f1212', ink: '#f6e6c4' },
  air: air([{ kind: 'petal', colors: ROSE, weight: 3 }, { kind: 'leaf', colors: LEAF, weight: 1 }]),
  enter: 'crane',
  enterDur: 1.0,
  textTop: 0.035,
  extras: ['fan'],
  layers: [
    { src: 'palace_terrace', w: 125, x: -110, anchor: 'bottom', y: 2, d: -0.2, wing: true },
    { src: 'palace_terrace', w: 125, x: 110, anchor: 'bottom', y: 2, d: -0.2, wing: true, flip: true },
    { src: 'palace_terrace', w: 128, anchor: 'bottom', y: -24, d: 0 },
    { src: 'peacock_lookback', w: 22, x: 12, anchor: 'bottom', y: 2, d: 0.15, ambient: 'breathe', role: 'peacock', glint: true },
    { src: 'peacock_standing', w: 28, x: 32, anchor: 'bottom', y: -10, d: 0.35, flip: true, ambient: 'breathe', delay: -2.5, role: 'peacock', glint: true },
    { src: 'banana_leaves', w: 44, x: -36, anchor: 'bottom', y: -10, d: 0.65, ambient: 'sway-slow' },
    { src: 'red_flower_bush', w: 140, anchor: 'bottom', y: -18, d: 0.9, ambient: 'breeze' },
  ],
}

/** Event scenes. Any event can use any of these via `scene` in wedding.ts. */
export const EVENT_SCENES: Record<string, ScenePreset> = {
  mehendi: {
    palette: { center: '#7d6d1d', mid: '#64520f', edge: '#2f2604', ink: '#f6e8c0' },
    air: air([{ kind: 'blossom', colors: PINK, weight: 2 }, { kind: 'leaf', colors: LEAF, weight: 2 }]),
    shower: 12,
    enter: 'truck',
    enterDur: 1.0,
    textTop: 0.27,
    extras: ['henna'],
    layers: [
      ...COLONNADE,
      ARCH,
      { src: 'vine_hanging', w: 24, x: -33, anchor: 'top', y: 9, d: 0.2, ambient: 'sway' },
      { src: 'vine_hanging', w: 22, x: 34, anchor: 'top', y: 10, d: 0.2, flip: true, ambient: 'sway', delay: -2.2 },
      { src: 'cypress_pair', w: 22, x: -40, anchor: 'bottom', y: 20, d: -0.1, ambient: 'breeze' },
      { src: 'chhatri_large', w: 44, x: 31, anchor: 'bottom', y: 14, d: 0.05 },
      { src: 'peacock_standing', w: 28, x: 23, anchor: 'bottom', y: 9, d: 0.3, flip: true, ambient: 'breathe', role: 'peacock', glint: true },
      BALUSTRADE,
      { src: 'banana_leaves', w: 56, x: -30, anchor: 'bottom', y: -2, d: 0.6, ambient: 'sway-slow' },
    ],
  },
  haldi: {
    palette: { center: '#b8771c', mid: '#a06210', edge: '#5e3404', ink: '#fff3d6', scrim: 0.34 },
    air: air([{ kind: 'marigold', colors: MARIGOLD, weight: 4 }, { kind: 'leaf', colors: LEAF, weight: 1 }]),
    shower: 20,
    enter: 'truck',
    enterDur: 1.0,
    textTop: 0.27,
    extras: ['rays'],
    layers: [
      ...COLONNADE,
      ARCH,
      { src: 'marigold_toran', w: 86, anchor: 'top', y: 12, d: 0.25, ambient: 'sway-slow', role: 'garland' },
      { src: 'cypress_pair', w: 22, x: 41, anchor: 'bottom', y: 20, d: -0.1, ambient: 'breeze' },
      { src: 'haldi_pavilion', w: 58, x: -21, anchor: 'bottom', y: 10, d: 0.1 },
      BALUSTRADE,
      { src: 'banana_leaves', w: 48, x: 32, anchor: 'bottom', y: -2, d: 0.6, flip: true, ambient: 'sway-slow' },
    ],
  },
  garba: {
    palette: { center: '#c2561e', mid: '#a84214', edge: '#5c1f05', ink: '#fff3dc', scrim: 0.28 },
    air: air([{ kind: 'marigold', colors: MARIGOLD, weight: 2 }, { kind: 'petal', colors: ROSE, weight: 1 }], true),
    shower: 12,
    enter: 'iris',
    enterDur: 1.0,
    textTop: 0.28,
    extras: ['fairy-lights'],
    layers: [
      ...COLONNADE,
      ARCH,
      { src: 'lantern_hanging', w: 9, x: -30, anchor: 'top', y: 8, d: 0.25, ambient: 'swing' },
      { src: 'lantern_hanging', w: 7.5, x: -20, anchor: 'top', y: 3, d: 0.2, ambient: 'swing', delay: -1.3 },
      { src: 'lantern_hanging', w: 7.5, x: 20, anchor: 'top', y: 3, d: 0.2, ambient: 'swing', delay: -2.1 },
      { src: 'lantern_hanging', w: 9, x: 30, anchor: 'top', y: 8, d: 0.25, ambient: 'swing', delay: -0.6 },
      { src: 'chhatri_slim', w: 22, x: -38, anchor: 'bottom', y: 14, d: 0.1 },
      { src: 'chhatri_slim', w: 22, x: 38, anchor: 'bottom', y: 14, d: 0.1, flip: true },
      BALUSTRADE,
      { src: 'banana_leaves', w: 46, x: -34, anchor: 'bottom', y: -3, d: 0.6, ambient: 'sway-slow' },
      { src: 'banana_leaves', w: 46, x: 34, anchor: 'bottom', y: -3, d: 0.6, flip: true, ambient: 'sway-slow', delay: -3 },
      { src: 'dandiya_pair', w: 18, x: 0, anchor: 'bottom', y: 4, d: 0.7 },
    ],
  },
  baraat: {
    palette: { center: '#b43a66', mid: '#992650', edge: '#4f0b27', ink: '#fbe7d4' },
    air: air([{ kind: 'petal', colors: PINK, weight: 3 }, { kind: 'marigold', colors: MARIGOLD, weight: 1 }]),
    shower: 18,
    enter: 'procession',
    enterDur: 1.15,
    textTop: 0.235,
    layers: [
      ...COLONNADE,
      ARCH,
      { src: 'jasmine_strings', w: 58, anchor: 'top', y: -26, d: 0.2, ambient: 'sway-slow', role: 'garland' },
      { src: 'chhatri_large', w: 36, x: 36, anchor: 'bottom', y: 6, d: -0.05 },
      { src: 'chhatra_umbrella', w: 19, x: -38, anchor: 'bottom', y: 12, d: 0.3, ambient: 'sway', delay: -1 },
      { src: 'chhatra_umbrella', w: 18, x: 24, anchor: 'bottom', y: 14, d: 0.3, ambient: 'sway', delay: -2.4 },
      BALUSTRADE,
      { src: 'elephant_royal', w: 68, x: -26, anchor: 'bottom', y: -2, d: 0.45, ambient: 'breathe', delay: -3, role: 'walker' },
      { src: 'horse_white', w: 34, x: 35, anchor: 'bottom', y: -3, d: 0.5, ambient: 'breathe', delay: -1.7 },
      { src: 'banana_leaves', w: 40, x: -42, anchor: 'bottom', y: -6, d: 0.85, ambient: 'sway-slow' },
    ],
  },
  varmala: {
    palette: { center: '#ab3a40', mid: '#8d272d', edge: '#4a0f13', ink: '#f8e7c8' },
    air: air([{ kind: 'petal', colors: ROSE, weight: 4 }, { kind: 'blossom', colors: JASMINE, weight: 2 }]),
    shower: 30,
    enter: 'curtain',
    enterDur: 1.1,
    textTop: 0.255,
    layers: [
      ...COLONNADE,
      ARCH,
      { src: 'cypress_pair', w: 22, x: -40, anchor: 'bottom', y: 22, d: -0.1, ambient: 'breeze' },
      { src: 'cypress_pair', w: 22, x: 40, anchor: 'bottom', y: 22, d: -0.1, flip: true, ambient: 'breeze', delay: -3 },
      { src: 'mandap_floral', w: 62, anchor: 'bottom', y: 10, d: 0.1, role: 'mandap' },
      { src: 'jasmine_strings', w: 62, anchor: 'top', y: -26, d: 0.3, ambient: 'sway-slow', role: 'garland' },
      { src: 'brass_urn', w: 20, x: -36, anchor: 'bottom', y: 6, d: 0.55 },
      { src: 'brass_urn', w: 20, x: 36, anchor: 'bottom', y: 6, d: 0.55, flip: true },
      { src: 'banana_leaves', w: 40, x: -40, anchor: 'bottom', y: -6, d: 0.8, ambient: 'sway-slow' },
      { src: 'red_flower_bush', w: 130, anchor: 'bottom', y: -10, d: 0.92, ambient: 'breeze' },
    ],
  },
  'hasta-melap': {
    palette: { center: '#3c7a2a', mid: '#2a5a1b', edge: '#0f2a0a', ink: '#f6ead0' },
    air: air([{ kind: 'blossom', colors: JASMINE, weight: 3 }, { kind: 'petal', colors: ROSE, weight: 2 }], true, 0.8),
    shower: 18,
    enter: 'bloom',
    enterDur: 1.0,
    textTop: 0.225,
    extras: ['rays'],
    layers: [
      ...COLONNADE,
      ARCH,
      { src: 'rose_garland', w: 80, anchor: 'top', y: 7, d: 0.25, ambient: 'sway-slow', role: 'garland' },
      { src: 'lantern_hanging', w: 7.5, x: 31, anchor: 'top', y: 8, d: 0.3, ambient: 'swing' },
      { src: 'lantern_hanging', w: 8.5, x: 38, anchor: 'top', y: 16, d: 0.3, ambient: 'swing', delay: -1.6 },
      { src: 'lantern_hanging', w: 7.5, x: -34, anchor: 'top', y: 12, d: 0.3, ambient: 'swing', delay: -0.9 },
      { src: 'chhatri_large', w: 42, x: 34, anchor: 'bottom', y: 30, d: -0.05 },
      { src: 'brass_urn', w: 22, x: -34, anchor: 'bottom', y: 28, d: 0.2 },
      { src: 'courtyard', w: 140, anchor: 'bottom', y: -2, d: 0.5 },
    ],
  },
}
EVENT_SCENES.sangeet = EVENT_SCENES.garba

/* ── Sections beyond the ceremonies (countdown, story, welcomes) ───────────────
 * Same palace, lighter foliage: these scenes carry more words, so the art stays low. */

/** Golden courtyard for the countdown and scratch card. */
export const COUNTDOWN: ScenePreset = {
  palette: { center: '#b8771c', mid: '#a06210', edge: '#5e3404', ink: '#fff3d6', scrim: 0.34 },
  air: air([{ kind: 'marigold', colors: MARIGOLD, weight: 3 }, { kind: 'petal', colors: ROSE, weight: 1 }]),
  shower: 14,
  enter: 'truck',
  enterDur: 1.0,
  textTop: 0.28,
  extras: ['rays'],
  layers: [
    ...COLONNADE,
    ARCH,
    { src: 'marigold_toran', w: 86, anchor: 'top', y: 12, d: 0.25, ambient: 'sway-slow', role: 'garland' },
    BALUSTRADE,
    { src: 'brass_urn', w: 17, x: -37, anchor: 'bottom', y: 4, d: 0.5 },
    { src: 'brass_urn', w: 17, x: 37, anchor: 'bottom', y: 4, d: 0.5, flip: true },
    { src: 'banana_leaves', w: 30, x: -44, anchor: 'bottom', y: -8, d: 0.8, ambient: 'sway-slow' },
    { src: 'banana_leaves', w: 30, x: 44, anchor: 'bottom', y: -8, d: 0.8, flip: true, ambient: 'sway-slow', delay: -2 },
  ],
}

/** Our Story opens in a deep emerald garden, two peacocks keeping watch. */
export const STORY_INTRO: ScenePreset = {
  palette: { center: '#3c7a2a', mid: '#2a5a1b', edge: '#0f2a0a', ink: '#f6ead0', scrim: 0.2 },
  air: air([{ kind: 'blossom', colors: JASMINE, weight: 2 }, { kind: 'leaf', colors: LEAF, weight: 2 }], true, 0.8),
  shower: 10,
  enter: 'curtain',
  enterDur: 1.0,
  textTop: 0.25,
  layers: [
    ...COLONNADE,
    ARCH,
    { src: 'rose_garland', w: 80, anchor: 'top', y: 7, d: 0.25, ambient: 'sway-slow', role: 'garland' },
    BALUSTRADE,
    { src: 'peacock_standing', w: 20, x: -36, anchor: 'bottom', y: -2, d: 0.45, ambient: 'breathe', role: 'peacock', glint: true },
    { src: 'peacock_standing', w: 20, x: 36, anchor: 'bottom', y: -2, d: 0.45, flip: true, ambient: 'breathe', delay: -2.4, role: 'peacock', glint: true },
  ],
}

/** Our Story, part one: the emerald-olive garden with its peacock. */
export const STORY_ONE: ScenePreset = {
  palette: { center: '#7d6d1d', mid: '#64520f', edge: '#2f2604', ink: '#f6e8c0', scrim: 0.22 },
  air: air([{ kind: 'blossom', colors: PINK, weight: 2 }, { kind: 'leaf', colors: LEAF, weight: 2 }]),
  enter: 'truck',
  enterDur: 1.0,
  textTop: 0.26,
  layers: [
    ...COLONNADE,
    ARCH,
    { src: 'vine_hanging', w: 22, x: -36, anchor: 'top', y: -6, d: 0.25, ambient: 'sway', role: 'garland' },
    { src: 'vine_hanging', w: 20, x: 37, anchor: 'top', y: -6, d: 0.25, flip: true, ambient: 'sway', delay: -2.2, role: 'garland' },
    BALUSTRADE,
    { src: 'peacock_standing', w: 20, x: 36, anchor: 'bottom', y: -2, d: 0.45, flip: true, ambient: 'breathe', role: 'peacock', glint: true },
    { src: 'banana_leaves', w: 34, x: -40, anchor: 'bottom', y: -8, d: 0.7, ambient: 'sway-slow' },
  ],
}

/** Our Story, part two: lanterns and string lights for the promise. */
export const STORY_TWO: ScenePreset = {
  palette: { center: '#c2561e', mid: '#a84214', edge: '#5c1f05', ink: '#fff3dc', scrim: 0.3 },
  air: air([{ kind: 'petal', colors: ROSE, weight: 2 }, { kind: 'marigold', colors: MARIGOLD, weight: 1 }], true),
  shower: 10,
  enter: 'iris',
  enterDur: 1.0,
  textTop: 0.25,
  extras: ['fairy-lights'],
  layers: [
    ...COLONNADE,
    ARCH,
    { src: 'lantern_hanging', w: 8, x: -30, anchor: 'top', y: 6, d: 0.25, ambient: 'swing' },
    { src: 'lantern_hanging', w: 8, x: 30, anchor: 'top', y: 6, d: 0.25, ambient: 'swing', delay: -1.6 },
    BALUSTRADE,
    { src: 'banana_leaves', w: 34, x: -40, anchor: 'bottom', y: -8, d: 0.7, ambient: 'sway-slow' },
    { src: 'banana_leaves', w: 34, x: 40, anchor: 'bottom', y: -8, d: 0.7, flip: true, ambient: 'sway-slow', delay: -3 },
  ],
}

/** The children's welcome: jasmine strings and roses on red. */
export const LITTLE_HEARTS: ScenePreset = {
  palette: { center: '#ab3a40', mid: '#8d272d', edge: '#4a0f13', ink: '#f8e7c8' },
  air: air([{ kind: 'blossom', colors: [...JASMINE, ...BLOSSOM], weight: 3 }, { kind: 'petal', colors: PINK, weight: 2 }], true),
  shower: 22,
  enter: 'truck',
  enterDur: 1.0,
  textTop: 0.275,
  layers: [
    ...COLONNADE,
    ARCH,
    { src: 'jasmine_strings', w: 62, anchor: 'top', y: -36, d: 0.3, ambient: 'sway-slow', role: 'garland' },
    { src: 'cypress_pair', w: 20, x: -41, anchor: 'bottom', y: 18, d: -0.1, ambient: 'breeze' },
    { src: 'cypress_pair', w: 20, x: 41, anchor: 'bottom', y: 18, d: -0.1, flip: true, ambient: 'breeze', delay: -3 },
    { src: 'brass_urn', w: 18, x: -36, anchor: 'bottom', y: 2, d: 0.55 },
    { src: 'brass_urn', w: 18, x: 36, anchor: 'bottom', y: 2, d: 0.55, flip: true },
    { src: 'red_flower_bush', w: 120, anchor: 'bottom', y: -22, d: 0.9, ambient: 'breeze' },
  ],
}

/** Family welcome lists: a plum-and-gold hall with a rose garland. */
export const FAMILY_WELCOME: ScenePreset = {
  palette: { center: '#8e3550', mid: '#6e2440', edge: '#3a0a1f', ink: '#fbe7d4' },
  air: air([{ kind: 'petal', colors: ROSE, weight: 2 }, { kind: 'blossom', colors: JASMINE, weight: 1 }]),
  shower: 12,
  enter: 'crane',
  enterDur: 1.0,
  textTop: 0.235,
  layers: [
    ...COLONNADE,
    ARCH,
    { src: 'rose_garland', w: 80, anchor: 'top', y: 7, d: 0.25, ambient: 'sway-slow', role: 'garland' },
    BALUSTRADE,
    { src: 'brass_urn', w: 16, x: -38, anchor: 'bottom', y: 4, d: 0.5 },
    { src: 'brass_urn', w: 16, x: 38, anchor: 'bottom', y: 4, d: 0.5, flip: true },
  ],
}

/**
 * The closing: a framed final card. A rose garland and vines at the top, the medallion,
 * the families' blessing in clear space, and a flowering border with two peacocks below.
 */
export const CLOSING: ScenePreset = {
  palette: { center: '#9c3433', mid: '#7c2223', edge: '#3d0c0e', ink: '#f6e6c4' },
  air: air([{ kind: 'petal', colors: ROSE, weight: 3 }, { kind: 'blossom', colors: JASMINE, weight: 1 }], true, 0.6),
  shower: 30,
  enter: 'lift',
  enterDur: 1.1,
  textTop: 0.33,
  extras: ['border', 'medallion'],
  layers: [
    { src: 'palace_terrace', w: 125, x: -108, anchor: 'bottom', y: 2, d: -0.3, wing: true },
    { src: 'palace_terrace', w: 125, x: 108, anchor: 'bottom', y: 2, d: -0.3, wing: true, flip: true },
    { src: 'rose_garland', w: 92, anchor: 'top', y: 1.5, d: 0.2, ambient: 'sway-slow', role: 'garland' },
    { src: 'vine_hanging', w: 17, x: -40, anchor: 'top', y: 0, d: 0.3, ambient: 'sway', delay: -1.5 },
    { src: 'vine_hanging', w: 17, x: 40, anchor: 'top', y: 0, d: 0.3, flip: true, ambient: 'sway', delay: -3.5 },
    { src: 'banana_leaves', w: 34, x: -40, anchor: 'bottom', y: -8, d: 0.2, ambient: 'sway-slow' },
    { src: 'banana_leaves', w: 34, x: 40, anchor: 'bottom', y: -8, d: 0.2, flip: true, ambient: 'sway-slow', delay: -2 },
    { src: 'peacock_standing', w: 21, x: -34, anchor: 'bottom', y: -17, d: 0.35, ambient: 'breathe', role: 'peacock', glint: true },
    { src: 'peacock_standing', w: 21, x: 34, anchor: 'bottom', y: -17, d: 0.35, flip: true, ambient: 'breathe', delay: -2.6, role: 'peacock', glint: true },
    { src: 'red_flower_bush', w: 118, anchor: 'bottom', y: -21, d: 0.6, ambient: 'breeze' },
  ],
}

/** Fallback order when an event names an unknown scene. */
export const SCENE_ORDER = ['mehendi', 'haldi', 'garba', 'baraat', 'varmala', 'hasta-melap']

export function presetFor(scene: string, index: number): ScenePreset {
  return EVENT_SCENES[scene] ?? EVENT_SCENES[SCENE_ORDER[index % SCENE_ORDER.length]]
}

/** Seconds of scroll (in viewport heights) each scene rests before the next begins. */
export const HOLD = { opening: 0.3, couple: 1.3, blessing: 1.25, event: 1.1, countdown: 1.3, story: 1.4, welcome: 1.3, closing: 1.9 }
