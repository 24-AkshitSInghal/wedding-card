import { useSyncExternalStore } from 'react'
import { music } from '../lib/music'

/** The round music button in the bottom-right corner: shows the song playing, and mutes it. */
export function SoundToggle({ title }: { title: string }) {
  const playing = useSyncExternalStore(music.subscribe, () => music.playing && !music.muted)
  const toggle = () => (playing ? music.mute() : music.unmute())
  return (
    <button
      type="button"
      className={`sound-toggle${playing ? ' is-on' : ''}`}
      onClick={toggle}
      aria-pressed={playing}
      aria-label={`${playing ? 'Mute' : 'Play'} background music${title ? `: ${title}` : ''}`}
    >
      <span className="sound-ring" aria-hidden="true" />
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 17.5 V 6 L 19 4 V 15.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="7" cy="17.5" rx="2.4" ry="1.9" fill="currentColor" />
        <ellipse cx="17" cy="15.5" rx="2.4" ry="1.9" fill="currentColor" />
        {!playing && <path d="M4 4 L 20 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
      </svg>
      <span className="sound-bars" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </button>
  )
}
