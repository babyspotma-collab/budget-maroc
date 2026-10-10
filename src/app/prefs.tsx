import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import i18n, { getStoredLang, storeLang } from '../i18n'
import { formatMAD, type Lang, type Numerals } from '../domain/money'

const NUMERALS_KEY = 'budget.numerals'

function getStoredNumerals(): Numerals {
  try {
    return localStorage.getItem(NUMERALS_KEY) === 'arab' ? 'arab' : 'latn'
  } catch {
    return 'latn'
  }
}

interface Prefs {
  lang: Lang
  dir: 'ltr' | 'rtl'
  numerals: Numerals
  setLang: (lang: Lang) => void
  setNumerals: (n: Numerals) => void
  /** Formate des centimes en MAD selon la langue et le système de chiffres. */
  money: (cents: number) => string
}

const PrefsContext = createContext<Prefs | null>(null)

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getStoredLang)
  const [numerals, setNumeralsState] = useState<Numerals>(getStoredNumerals)

  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
    void i18n.changeLanguage(lang)
  }, [lang, dir])

  const setLang = useCallback((l: Lang) => {
    storeLang(l)
    setLangState(l)
  }, [])

  const setNumerals = useCallback((n: Numerals) => {
    try {
      localStorage.setItem(NUMERALS_KEY, n)
    } catch {
      /* ignoré */
    }
    setNumeralsState(n)
  }, [])

  const value = useMemo<Prefs>(
    () => ({
      lang,
      dir,
      numerals,
      setLang,
      setNumerals,
      money: (cents) => formatMAD(cents, { lang, numerals }),
    }),
    [lang, dir, numerals, setLang, setNumerals],
  )

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}

export function usePrefs(): Prefs {
  const ctx = useContext(PrefsContext)
  if (!ctx) throw new Error('usePrefs doit être utilisé dans <PrefsProvider>')
  return ctx
}
