import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './locales/fr.json'
import ar from './locales/ar.json'
import type { Lang } from '../domain/money'

const LANG_KEY = 'budget.lang'

export function getStoredLang(): Lang {
  try {
    const v = localStorage.getItem(LANG_KEY)
    if (v === 'fr' || v === 'ar') return v
  } catch {
    /* stockage indisponible */
  }
  return 'fr'
}

export function storeLang(lang: Lang) {
  try {
    localStorage.setItem(LANG_KEY, lang)
  } catch {
    /* ignoré */
  }
}

void i18n.use(initReactI18next).init({
  resources: { fr: { translation: fr }, ar: { translation: ar } },
  lng: getStoredLang(),
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
})

export default i18n
