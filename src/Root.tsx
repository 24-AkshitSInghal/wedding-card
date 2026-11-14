import { useEffect, useState } from 'react'
import App from './App'
import { SoundToggle } from './components/SoundToggle'
import { wedding } from './config/card'
import { initialLang, rememberLang, setLang } from './lib/i18n'
import type { Lang } from './lib/i18n'

/** Holds the guest's language; switching rebuilds the invitation in the other language. */
export default function Root() {
  const [lang, setLangState] = useState<Lang>(initialLang)
  // The formatting helpers and labels read the language while the invitation renders.
  setLang(lang)
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  const toggle = () => {
    const next: Lang = lang === 'hi' ? 'en' : 'hi'
    rememberLang(next)
    setLangState(next)
  }
  return (
    <>
      <App key={lang} lang={lang} onToggleLang={toggle} />
      {/* Outside the invitation so the song keeps playing when the language changes. */}
      {wedding.audio.src.trim() && <SoundToggle title={wedding.audio.title} />}
    </>
  )
}
