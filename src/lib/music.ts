import { wedding } from '../config/card'

/**
 * The invitation's background song, shared by the opening screen (which starts it) and the
 * music button (which mutes it). It lives outside React so switching language, which
 * rebuilds the invitation, never restarts or stops it.
 */
const VOLUME = 0.7
const src = wedding.audio.src.trim()
const audio = src ? new Audio(src) : null
if (audio) {
  audio.loop = true
  audio.preload = 'auto'
}

let muted = false
/** Set once the guest has opened the invitation, so the opening tap is asked for only once. */
let opened = !audio
let fadeTimer = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

function fadeTo(to: number, ms: number, then?: () => void) {
  if (!audio) return
  window.clearInterval(fadeTimer)
  const from = audio.volume
  const begin = Date.now()
  fadeTimer = window.setInterval(() => {
    const k = Math.min(1, (Date.now() - begin) / ms)
    audio.volume = from + (to - from) * k
    if (k < 1) return
    window.clearInterval(fadeTimer)
    then?.()
  }, 30)
}

audio?.addEventListener('play', emit)
audio?.addEventListener('pause', emit)

export const music = {
  enabled: !!audio,
  get playing() {
    return !!audio && !audio.paused
  },
  get opened() {
    return opened
  },
  markOpened() {
    opened = true
  },
  /** Starts the song (fading in). Resolves false when the browser does not allow it yet. */
  async play(): Promise<boolean> {
    if (!audio || muted) return false
    if (!audio.paused) return true
    audio.volume = 0
    try {
      await audio.play()
      fadeTo(VOLUME, 1500)
      return true
    } catch {
      return false
    }
  },
  mute() {
    if (!audio) return
    muted = true
    fadeTo(0, 400, () => audio.pause())
    emit()
  },
  unmute() {
    muted = false
    void music.play()
  },
  get muted() {
    return muted
  },
  subscribe(fn: () => void) {
    listeners.add(fn)
    return () => {
      listeners.delete(fn)
    }
  },
}

if (audio) {
  // Should the opening tap be skipped (some browsers allow sound straight away), the
  // guest's first tap, swipe or key press starts the song instead.
  const gestures = ['pointerup', 'touchend', 'click', 'keydown'] as const
  const onGesture = (e: Event) => {
    if ((e.target as Element | null)?.closest?.('.sound-toggle')) return
    void music.play().then((ok) => {
      if (ok || muted) gestures.forEach((g) => window.removeEventListener(g, onGesture, true))
    })
  }
  gestures.forEach((g) => window.addEventListener(g, onGesture, true))
  // Pause while the guest is in another app or tab; carry on when they return.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) audio.pause()
    else if (opened) void music.play()
  })
}
