import { useRef, useState } from 'react'

interface Props {
  src: string
  title: string
}

/** Optional ambient music. Never autoplays; starts only when the guest taps it. */
export function SoundToggle({ src, title }: Props) {
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  const toggle = async () => {
    const a = audio.current
    if (!a) return
    if (playing) {
      a.pause()
      setPlaying(false)
      return
    }
    a.volume = 0.35
    try {
      await a.play()
      setPlaying(true)
    } catch {
      setPlaying(false)
    }
  }

  return (
    <>
      <audio ref={audio} src={src} loop preload="none" />
      <button
        type="button"
        className={`sound-toggle${playing ? ' is-on' : ''}`}
        onClick={toggle}
        aria-pressed={playing}
        aria-label={`Background music${title ? `: ${title}` : ''}`}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 17.5 V 6 L 19 4 V 15.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <ellipse cx="7" cy="17.5" rx="2.4" ry="1.9" fill="currentColor" />
          <ellipse cx="17" cy="15.5" rx="2.4" ry="1.9" fill="currentColor" />
          {!playing && <path d="M4 4 L 20 20" stroke="currentColor" strokeWidth="1.4" />}
        </svg>
      </button>
    </>
  )
}
