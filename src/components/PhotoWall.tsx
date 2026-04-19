import { useEffect, useRef, useState } from 'react'
import { popConfetti } from '../lib/confetti'

type Slot = { img: string | null; caption: string; date: string }

const WALL_KEY = 'kenn_wall_v1'
// If a file exists at public/photos/01.jpg .. 08.jpg it is used as the default
// image for that slot. The user's uploaded photo (in localStorage) still wins.
const DEFAULT_FILES = ['01', '02', '03', '04', '05', '06', '07', '08'].map(
  (n) => `/photos/${n}.jpg`
)
const DEFAULT_CAPTIONS = [
  'primera cita ♡',
  'día de playa',
  'la cabina',
  'noche de sushi',
  'roadtrip',
  'backstage',
  'por café',
  'nuestra canción',
]
const DEFAULT_DATES = [
  '2024 · 03',
  '2024 · 07',
  '2024 · 11',
  '2025 · 02',
  '2025 · 05',
  '2025 · 08',
  '2025 · 11',
  '2026 · 04',
]

function loadWall(): Slot[] {
  try {
    const raw = JSON.parse(localStorage.getItem(WALL_KEY) || '[]') as Partial<Slot>[]
    const base = Array.from({ length: 8 }, (_, i) => ({
      img: null as string | null,
      caption: DEFAULT_CAPTIONS[i] || '',
      date: DEFAULT_DATES[i] || '',
    }))
    raw.forEach((s, i) => {
      if (i < 8 && s) base[i] = { ...base[i], ...s }
    })
    return base
  } catch {
    return Array.from({ length: 8 }, (_, i) => ({
      img: null,
      caption: DEFAULT_CAPTIONS[i] || '',
      date: DEFAULT_DATES[i] || '',
    }))
  }
}

function saveWall(state: Slot[]) {
  try {
    localStorage.setItem(WALL_KEY, JSON.stringify(state))
  } catch {}
}

export default function PhotoWall() {
  const [wall, setWall] = useState<Slot[]>(() => loadWall())
  const pendingSlot = useRef<number | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    saveWall(wall)
  }, [wall])

  const openPicker = (i: number) => {
    pendingSlot.current = i
    fileInput.current?.click()
  }

  const onFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0]
    const idx = pendingSlot.current
    if (!f || idx === null) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setWall((prev) => {
        const next = prev.slice()
        next[idx] = { ...next[idx], img: ev.target?.result as string }
        return next
      })
      setTimeout(() => {
        const poly = gridRef.current?.children[idx] as HTMLElement | undefined
        if (poly) popConfetti(poly)
      }, 0)
      pendingSlot.current = null
      if (fileInput.current) fileInput.current.value = ''
    }
    reader.readAsDataURL(f)
  }

  const updateCaption = (i: number, caption: string) => {
    setWall((prev) => {
      const next = prev.slice()
      next[i] = { ...next[i], caption }
      return next
    })
  }

  const remove = (i: number) => {
    setWall((prev) => {
      const next = prev.slice()
      next[i] = { ...next[i], img: null }
      return next
    })
  }

  return (
    <section className="pokes" data-screen-label="04 Photo Wall">
      <div className="wrap">
        <div className="eyebrow" style={{ color: '#0a0a2e' }}>
          Nivel Bonus <b>◆</b> Muro de Recuerdos
        </div>
        <h2 className="h2">
          Nosotros,<br />
          en polaroid.
        </h2>
        <div className="jp" style={{ color: '#0a0a2e' }}>
          思い出のポラロイド
        </div>

        <div className="poke-grid" id="pokeGrid" ref={gridRef}>
          {wall.map((slot, i) => (
            <div key={i} className={'polaroid' + (slot.img ? ' filled' : '')}>
              <div
                className="remove"
                title="Remove photo"
                onClick={(e) => {
                  e.stopPropagation()
                  remove(i)
                }}
              >
                ✕
              </div>
              <div
                className="photo"
                onClick={(e) => {
                  e.stopPropagation()
                  openPicker(i)
                }}
              >
                <div className="photo-index">No. {String(i + 1).padStart(2, '0')}</div>
                <SlotImage uploaded={slot.img} index={i} />
              </div>
              <div className="caption">
                <input
                  type="text"
                  value={slot.caption}
                  placeholder="write a caption…"
                  maxLength={40}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateCaption(i, e.target.value)}
                />
              </div>
              <div className="date">{slot.date}</div>
            </div>
          ))}
        </div>
        <div className="wall-hint">
          Haz clic en una polaroid para agregar foto <b>◆</b> escribe tu caption <b>◆</b> se guarda en este dispositivo
        </div>
      </div>

      <input
        type="file"
        id="photoInput"
        ref={fileInput}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onFile}
      />
    </section>
  )
}

function SlotImage({ uploaded, index }: { uploaded: string | null; index: number }) {
  const [defaultFailed, setDefaultFailed] = useState(false)
  if (uploaded) return <img src={uploaded} alt={`memory ${index + 1}`} />
  if (!defaultFailed) {
    return (
      <img
        src={DEFAULT_FILES[index]}
        alt={`memory ${index + 1}`}
        onError={() => setDefaultFailed(true)}
      />
    )
  }
  return (
    <div className="photo-empty">
      <div className="plus">＋</div>
      <div className="jp-add">写真を追加</div>
      <div className="lbl">Agregar foto</div>
    </div>
  )
}
