import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface ToastOptions {
  actionLabel?: string
  onAction?: () => void
}

interface ToastState extends ToastOptions {
  id: number
  message: string
}

interface ToastApi {
  show: (message: string, options?: ToastOptions) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const DURATION_MS = 5000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)
  const counter = useRef(0)

  const show = useCallback((message: string, options?: ToastOptions) => {
    counter.current += 1
    setToast({ id: counter.current, message, ...options })
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), DURATION_MS)
    return () => clearTimeout(timer)
  }, [toast])

  const api = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4"
      >
        {toast && (
          <div
            key={toast.id}
            className="toast-enter pointer-events-auto flex w-full max-w-md items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-canvas shadow-lg"
          >
            <span>{toast.message}</span>
            {toast.actionLabel && (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.()
                  setToast(null)
                }}
                className="shrink-0 rounded-lg px-2 py-1 font-semibold text-saffron-500"
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast doit être utilisé dans <ToastProvider>')
  return ctx
}
