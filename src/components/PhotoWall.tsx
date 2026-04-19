import { useState } from 'react'

type Slot = { src: string; caption: string; date: string }

const SLOTS: Slot[] = [
  { src: '/photos/01.jpg', caption: 'primera cita ♡', date: '2024 · 03' },
  { src: '/photos/02.jpg', caption: 'día de playa', date: '2024 · 07' },
  { src: '/photos/03.jpg', caption: 'la cabina', date: '2024 · 11' },
  { src: '/photos/04.jpg', caption: 'noche de sushi', date: '2025 · 02' },
  { src: '/photos/05.jpg', caption: 'roadtrip', date: '2025 · 05' },
  { src: '/photos/06.jpg', caption: 'backstage', date: '2025 · 08' },
  { src: '/photos/07.jpg', caption: 'por café', date: '2025 · 11' },
  { src: '/photos/08.jpg', caption: 'nuestra canción', date: '2026 · 04' },
]

export default function PhotoWall() {
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

        <div className="poke-grid" id="pokeGrid">
          {SLOTS.map((slot, i) => (
            <div key={i} className="polaroid filled">
              <div className="photo">
                <div className="photo-index">No. {String(i + 1).padStart(2, '0')}</div>
                <SlotImage src={slot.src} index={i} />
              </div>
              <div className="caption">
                <span className="caption-text">{slot.caption}</span>
              </div>
              <div className="date">{slot.date}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Renders the polaroid image. The striped placeholder (`.photo-empty`)
 * is shown underneath while the image loads and stays visible if the
 * request ever fails — so the card never appears blank on slow networks
 * or when a file is missing.
 */
function SlotImage({ src, index }: { src: string; index: number }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <>
      {!loaded && <FallbackPlaceholder />}
      {!failed && (
        <img
          src={src}
          alt={`memory ${index + 1}`}
          decoding="async"
          style={{ display: loaded ? 'block' : 'none' }}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </>
  )
}

function FallbackPlaceholder() {
  return (
    <div className="photo-empty" aria-hidden="true">
      <div className="plus">♡</div>
      <div className="jp-add">読み込み中</div>
      <div className="lbl">Cargando…</div>
    </div>
  )
}
