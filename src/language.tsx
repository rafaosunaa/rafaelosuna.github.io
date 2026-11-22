import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { translations } from './translations'

const languages = { es: 'Español', en: 'English', fr: 'Français' } as const
type Language = keyof typeof languages
const storageKey = 'portfolio-language'
const LanguageContext = createContext({
  language: 'es' as Language,
  setLanguage: (_language: Language) => {},
})

function initialLanguage(): Language {
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved === 'es' || saved === 'en' || saved === 'fr') return saved
  } catch {
    // The selector still works when storage is unavailable.
  }
  return 'es'
}

export function useLanguage() {
  const { language, setLanguage } = useContext(LanguageContext)
  const t = (text: string) => language === 'es' ? text : translations.get(text)?.[language === 'en' ? 0 : 1] ?? text
  return { language, setLanguage, t }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(initialLanguage)
  useEffect(() => {
    document.documentElement.lang = language
    const description = document.querySelector('meta[name="description"]')
    const source = 'Portfolio de Rafael Osuna Ventura, técnico superior en ASIR y estudiante de Ingeniería Informática. Software, sistemas y ciberseguridad.'
    description?.setAttribute('content', language === 'es' ? source : translations.get(source)?.[language === 'en' ? 0 : 1] ?? source)
    try {
      localStorage.setItem(storageKey, language)
    } catch {
      // The current selection remains active for this visit.
    }
  }, [language])
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()
  return <select className="language-select" aria-label={t('Idioma')} value={language}
    onChange={event => setLanguage(event.currentTarget.value as Language)}>
    {Object.entries(languages).map(([code, name]) => <option key={code} value={code} lang={code}>{name}</option>)}
  </select>
}
