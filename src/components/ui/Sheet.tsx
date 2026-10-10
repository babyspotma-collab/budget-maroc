import { useEffect, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * Feuille modale par le bas, basée sur <dialog> natif :
 * focus piégé, Échap et clic sur le fond pour fermer.
 */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dlg = ref.current
    if (!dlg) return
    if (open && !dlg.open) dlg.showModal()
    if (!open && dlg.open) dlg.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      aria-label={title}
      className="sheet m-0 mx-auto mt-auto max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-surface p-0 text-ink shadow-2xl"
    >
      <div className="px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3">
        <div aria-hidden className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line-strong" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="flex size-10 items-center justify-center rounded-full text-muted hover:bg-line/60"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
