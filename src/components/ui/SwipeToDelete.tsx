import { useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { CategoryIcon } from './CategoryIcon'

interface SwipeToDeleteProps {
  children: ReactNode
  /** Appelé une fois la ligne sortie de l'écran (prévoir un « Annuler » côté appelant). */
  onDelete: () => void
  className?: string
}

const SLIDE_OUT_MS = 200

/**
 * Glisser une ligne d'un côté ou de l'autre pour la supprimer. Un simple appui reste
 * un clic normal ; un glissement vertical garde le défilement de la page.
 */
export function SwipeToDelete({ children, onDelete, className = '' }: SwipeToDeleteProps) {
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; active: boolean } | null>(null)
  const dxRef = useRef(0)
  const moved = useRef(false)

  const width = () => box.current?.offsetWidth ?? 320
  const threshold = () => Math.min(110, width() * 0.35)

  function update(value: number) {
    dxRef.current = value
    setDx(value)
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    drag.current = { x: e.clientX, y: e.clientY, active: false }
    moved.current = false
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current
    if (!d) return
    const ddx = e.clientX - d.x
    const ddy = e.clientY - d.y
    if (!d.active) {
      if (Math.abs(ddy) > 8 && Math.abs(ddy) > Math.abs(ddx)) {
        drag.current = null // geste vertical : on laisse la page défiler
        return
      }
      if (Math.abs(ddx) <= 8) return
      d.active = true
      setDragging(true)
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    moved.current = true
    update(ddx)
  }

  function end() {
    const d = drag.current
    drag.current = null
    if (!d?.active) return
    setDragging(false)
    if (Math.abs(dxRef.current) >= threshold()) {
      update(Math.sign(dxRef.current) * width())
      window.setTimeout(onDelete, SLIDE_OUT_MS)
    } else {
      update(0)
    }
  }

  return (
    <div ref={box} className={`relative overflow-hidden rounded-xl ${className}`}>
      {/* Fond rouge révélé par le glissement ; dir=ltr : le côté suit la position réelle */}
      <div
        aria-hidden
        dir="ltr"
        className={`absolute inset-0 flex items-center bg-danger-50 px-5 text-danger-600 ${
          dx > 0 ? 'justify-start' : 'justify-end'
        }`}
        style={{ opacity: dx === 0 ? 0 : 1 }}
      >
        <CategoryIcon name="trash" tone="plain" px={24} iconColor="#c2321f" />
      </div>
      <div
        className="relative bg-surface"
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging ? 'none' : `transform ${SLIDE_OUT_MS}ms ease-out`,
          touchAction: 'pan-y',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerCancel={end}
        onClickCapture={(e) => {
          if (moved.current) {
            e.preventDefault()
            e.stopPropagation()
            moved.current = false
          }
        }}
      >
        {children}
      </div>
    </div>
  )
}
