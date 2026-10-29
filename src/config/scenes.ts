/**
 * Art direction for every scene: palette, illustrated layers, depth and how the
 * scene enters. Wedding *content* lives in wedding.ts; this file is the stage.
 *
 * Layer geometry is expressed in frame units: the portrait frame is 100 units
 * wide (on phones that is the screen width; on desktop a centred 9:14 window).
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

export type Ambient = 'sway' | 'sway-slow' | 'breathe' | 'walk' | 'swing' | 'flicker' | 'drift'

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
  /** Particle colours (petals). */
  petals: string[]
  /** Strength of the shade behind the text (raise it for light grounds). Default 0.16. */
  scrim?: number
}

export type Extra = 'henna' | 'rays' | 'fairy-lights' | 'fan' | 'medallion' | 'night-top'

export interface ScenePreset {
  palette: Palette
  enter: TransitionType
  enterDur: number
  layers: LayerDef[]
  extras?: Extra[]
  /** Top of the text block as a fraction of frame height. */
  textTop: number
}

const ARCH: LayerDef = { src: 'arch_event', w: 100, wh: 0.5, anchor: 'top', y: 0, d: 0, role: 'arch' }
const BALUSTRADE: LayerDef = { src: 'balustrade', w: 128, anchor: 'bottom', y: -2, d: 0.35 }
/** Neighbouring arches of the colonnade, seen on wide screens only. */
const COLONNADE: LayerDef[] = [
  { ...ARCH, x: -100, wing: true, role: undefined },
  { ...ARCH, x: 100, wing: true, role: undefined },
  { ...BALUSTRADE, x: -126, wing: true },
  { ...BALUSTRADE, x: 126, wing: true },
]

const PETALS_RED = ['#b3202a', '#d2414a', '#8e1622', '#e7a1a6']
const PETALS_PINK = ['#e48aa6', '#f3c1cf', '#c2416b', '#fff1e6']
const PETALS_MARIGOLD = ['#f2a516', '#e8800e', '#ffd25a', '#c9590a']
const PETALS_JASMINE = ['#fff6e6', '#f6e7cf', '#e9b7b7', '#c43a3a']

export const OPENING: ScenePreset = {
  palette: { center: '#5a564a', mid: '#3f3d35', edge: '#1d1c18', ink: '#f3e4c3', petals: PETALS_PINK },
  enter: 'gate',
  enterDur: 0,
  textTop: 0.62,
  layers: [
    { src: 'garden_side', w: 84, x: -142, anchor: 'bottom', y: 0, d: 0.1, wing: true },
    { src: 'garden_side', w: 84, x: 142, anchor: 'bottom', y: 0, d: 0.1, flip: true, wing: true },
    { src: 'garden_side', w: 76, x: -72, anchor: 'bottom', y: 0, d: 0.25, wing: true },
    { src: 'garden_side', w: 76, x: 72, anchor: 'bottom', y: 0, d: 0.25, flip: true, wing: true },
    { src: 'garden_side', w: 50, x: -40, anchor: 'bottom', y: 0, d: 0.55 },
    { src: 'garden_side', w: 50, x: 40, anchor: 'bottom', y: 0, d: 0.55, flip: true },
    { src: 'blossom_branch', w: 70, x: -30, anchor: 'top', y: -4, d: 0.75, ambient: 'sway-slow' },
    { src: 'blossom_branch', w: 62, x: 34, anchor: 'top', y: -2, d: 0.8, flip: true, ambient: 'sway-slow', delay: -3 },
    { src: 'red_flower_bush', w: 128, anchor: 'bottom', y: -13, d: 0.9 },
  ],
}

export const COUPLE: ScenePreset = {
  palette: { center: '#ad433b', mid: '#93302b', edge: '#561414', ink: '#f6e6c4', petals: PETALS_RED },
  enter: 'gate',
  enterDur: 2.0,
  textTop: 0.225,
  extras: [],
  layers: [
    // Through the gateway: the couple framed by the palace's carved arch, terraces beyond.
    { src: 'palace_terrace', w: 120, x: -95, anchor: 'bottom', y: 4, d: -0.3, wing: true },
    { src: 'palace_terrace', w: 120, x: 95, anchor: 'bottom', y: 4, d: -0.3, wing: true, flip: true },
    ...COLONNADE.slice(0, 2),
    ARCH,
    { src: 'cypress_pair', w: 22, x: -41, anchor: 'bottom', y: 24, d: -0.15 },
    { src: 'flowering_tree', w: 30, x: 40, anchor: 'bottom', y: 14, d: 0.05 },
    { src: 'chhatri_large', w: 44, x: -31, anchor: 'bottom', y: 10, d: 0.05 },
    { src: 'peacock_standing', w: 27, x: -37, anchor: 'bottom', y: 8, d: 0.3, ambient: 'breathe', role: 'peacock', glint: true },
    { src: 'wisteria_hanging', w: 42, x: -34, anchor: 'top', y: -3, d: 0.45, ambient: 'sway' },
    { src: 'vine_hanging', w: 26, x: 40, anchor: 'top', y: -2, d: 0.4, ambient: 'sway', delay: -2 },
    { src: 'banana_leaves', w: 52, x: 32, anchor: 'bottom', y: 2, d: 0.6, ambient: 'sway-slow' },
    { src: 'red_flower_bush', w: 124, anchor: 'bottom', y: -11, d: 0.85 },
    { src: 'emblem_buta', w: 19, anchor: 'top', y: 0, yh: 0.045, d: 0, role: 'emblem', glint: true },
  ],
}

export const BLESSING: ScenePreset = {
  palette: { center: '#a83c36', mid: '#8c2b28', edge: '#4f1212', ink: '#f6e6c4', petals: PETALS_RED },
  enter: 'crane',
  enterDur: 1.0,
  textTop: 0.075,
  extras: ['fan'],
  layers: [
    { src: 'palace_terrace', w: 125, x: -110, anchor: 'bottom', y: 2, d: -0.2, wing: true },
    { src: 'palace_terrace', w: 125, x: 110, anchor: 'bottom', y: 2, d: -0.2, wing: true, flip: true },
    { src: 'palace_terrace', w: 128, anchor: 'bottom', y: 4, d: 0 },
    { src: 'peacock_lookback', w: 28, x: 10, anchor: 'bottom', y: 40, d: 0.15, ambient: 'breathe', role: 'peacock', glint: true },
    { src: 'peacock_standing', w: 34, x: 30, anchor: 'bottom', y: 8, d: 0.35, flip: true, ambient: 'breathe', delay: -2.5, role: 'peacock', glint: true },
    { src: 'banana_leaves', w: 50, x: -34, anchor: 'bottom', y: 0, d: 0.65, ambient: 'sway-slow' },
    { src: 'red_flower_bush', w: 140, anchor: 'bottom', y: -6, d: 0.9 },
  ],
}

/** Event scenes. Any event can use any of these via `scene` in wedding.ts. */
export const EVENT_SCENES: Record<string, ScenePreset> = {
  mehendi: {
    palette: { center: '#7d6d1d', mid: '#64520f', edge: '#2f2604', ink: '#f6e8c0', petals: PETALS_PINK },
    enter: 'truck',
    enterDur: 1.0,
    textTop: 0.27,
    extras: ['henna'],
    layers: [
      ...COLONNADE,
      ARCH,
      { src: 'vine_hanging', w: 24, x: -33, anchor: 'top', y: 9, d: 0.2, ambient: 'sway' },
      { src: 'vine_hanging', w: 22, x: 34, anchor: 'top', y: 10, d: 0.2, flip: true, ambient: 'sway', delay: -2.2 },
      { src: 'cypress_pair', w: 22, x: -40, anchor: 'bottom', y: 20, d: -0.1 },
      { src: 'chhatri_large', w: 44, x: 31, anchor: 'bottom', y: 14, d: 0.05 },
      { src: 'peacock_standing', w: 28, x: 23, anchor: 'bottom', y: 9, d: 0.3, flip: true, ambient: 'breathe', role: 'peacock', glint: true },
      BALUSTRADE,
      { src: 'banana_leaves', w: 56, x: -30, anchor: 'bottom', y: -2, d: 0.6, ambient: 'sway-slow' },
    ],
  },
  haldi: {
    palette: { center: '#b8771c', mid: '#a06210', edge: '#5e3404', ink: '#fff3d6', petals: PETALS_MARIGOLD, scrim: 0.34 },
    enter: 'truck',
    enterDur: 1.0,
    textTop: 0.27,
    extras: ['rays'],
    layers: [
      ...COLONNADE,
      ARCH,
      { src: 'marigold_toran', w: 86, anchor: 'top', y: 12, d: 0.25, ambient: 'sway-slow', role: 'garland' },
      { src: 'cypress_pair', w: 22, x: 41, anchor: 'bottom', y: 20, d: -0.1 },
      { src: 'haldi_pavilion', w: 58, x: -21, anchor: 'bottom', y: 10, d: 0.1 },
      BALUSTRADE,
      { src: 'banana_leaves', w: 48, x: 32, anchor: 'bottom', y: -2, d: 0.6, flip: true, ambient: 'sway-slow' },
    ],
  },
  garba: {
    palette: { center: '#c2561e', mid: '#a84214', edge: '#5c1f05', ink: '#fff3dc', petals: PETALS_MARIGOLD, scrim: 0.28 },
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
    palette: { center: '#b43a66', mid: '#992650', edge: '#4f0b27', ink: '#fbe7d4', petals: PETALS_PINK },
    enter: 'procession',
    enterDur: 1.15,
    textTop: 0.29,
    layers: [
      ...COLONNADE,
      ARCH,
      { src: 'jasmine_strings', w: 58, anchor: 'top', y: -18, d: 0.2, ambient: 'sway-slow', role: 'garland' },
      { src: 'chhatri_large', w: 44, x: 34, anchor: 'bottom', y: 24, d: -0.05 },
      { src: 'chhatra_umbrella', w: 22, x: -34, anchor: 'bottom', y: 40, d: 0.3, ambient: 'sway', delay: -1 },
      { src: 'chhatra_umbrella', w: 20, x: 22, anchor: 'bottom', y: 22, d: 0.3, ambient: 'sway', delay: -2.4 },
      BALUSTRADE,
      { src: 'elephant_royal', w: 72, x: -24, anchor: 'bottom', y: 6, d: 0.45, ambient: 'breathe', delay: -3, role: 'walker' },
      { src: 'horse_white', w: 38, x: 33, anchor: 'bottom', y: 3, d: 0.5, ambient: 'breathe', delay: -1.7 },
      { src: 'banana_leaves', w: 40, x: -42, anchor: 'bottom', y: -6, d: 0.85, ambient: 'sway-slow' },
    ],
  },
  varmala: {
    palette: { center: '#ab3a40', mid: '#8d272d', edge: '#4a0f13', ink: '#f8e7c8', petals: PETALS_RED },
    enter: 'curtain',
    enterDur: 1.1,
    textTop: 0.255,
    layers: [
      ...COLONNADE,
      ARCH,
      { src: 'cypress_pair', w: 22, x: -40, anchor: 'bottom', y: 22, d: -0.1 },
      { src: 'cypress_pair', w: 22, x: 40, anchor: 'bottom', y: 22, d: -0.1, flip: true },
      { src: 'mandap_floral', w: 62, anchor: 'bottom', y: 10, d: 0.1, role: 'mandap' },
      { src: 'jasmine_strings', w: 62, anchor: 'top', y: -26, d: 0.3, ambient: 'sway-slow', role: 'garland' },
      { src: 'brass_urn', w: 20, x: -36, anchor: 'bottom', y: 6, d: 0.55 },
      { src: 'brass_urn', w: 20, x: 36, anchor: 'bottom', y: 6, d: 0.55, flip: true },
      { src: 'banana_leaves', w: 40, x: -40, anchor: 'bottom', y: -6, d: 0.8, ambient: 'sway-slow' },
      { src: 'red_flower_bush', w: 130, anchor: 'bottom', y: -10, d: 0.92 },
    ],
  },
  'hasta-melap': {
    palette: { center: '#3c7a2a', mid: '#2a5a1b', edge: '#0f2a0a', ink: '#f6ead0', petals: PETALS_JASMINE },
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

export const CLOSING: ScenePreset = {
  palette: { center: '#9c3433', mid: '#7c2223', edge: '#3d0c0e', ink: '#f6e6c4', petals: PETALS_RED },
  enter: 'lift',
  enterDur: 1.1,
  textTop: 0.6,
  extras: ['night-top', 'medallion'],
  layers: [
    { src: 'garden_side', w: 56, x: -36, anchor: 'bottom-at', yh: 0.44, d: -0.2 },
    { src: 'garden_side', w: 56, x: 36, anchor: 'bottom-at', yh: 0.44, d: -0.2, flip: true },
    { src: 'garden_side', w: 70, x: -100, anchor: 'bottom-at', yh: 0.44, d: -0.3, wing: true },
    { src: 'garden_side', w: 70, x: 100, anchor: 'bottom-at', yh: 0.44, d: -0.3, wing: true, flip: true },
    { src: 'banana_leaves', w: 44, x: -30, anchor: 'bottom-at', yh: 0.46, d: 0.1, ambient: 'sway-slow' },
    { src: 'banana_leaves', w: 44, x: 30, anchor: 'bottom-at', yh: 0.46, d: 0.1, flip: true, ambient: 'sway-slow', delay: -2 },
    { src: 'red_flower_bush', w: 150, anchor: 'bottom-at', yh: 0.5, d: 0.3 },
  ],
}

/** Fallback order when an event names an unknown scene. */
export const SCENE_ORDER = ['mehendi', 'haldi', 'garba', 'baraat', 'varmala', 'hasta-melap']

export function presetFor(scene: string, index: number): ScenePreset {
  return EVENT_SCENES[scene] ?? EVENT_SCENES[SCENE_ORDER[index % SCENE_ORDER.length]]
}

/** Seconds of scroll (in viewport heights) each scene rests before the next begins. */
export const HOLD = { opening: 0.3, couple: 1.3, blessing: 1.25, event: 1.1, closing: 1.9 }
