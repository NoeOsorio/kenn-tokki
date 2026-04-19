import { useEffect, useRef, useState } from 'react'
import { popConfettiSplash } from '../lib/confetti'

export default function Message() {
  const [open, setOpen] = useState(false)
  const flipRef = useRef<HTMLDivElement>(null)

  const openCard = () => {
    setOpen(true)
    // Wait one frame so the full-screen layout settles, then fire
    // the multi-point splash over the opened card.
    requestAnimationFrame(() => popConfettiSplash())
  }
  const closeCard = () => setOpen(false)
  const toggle = () => (open ? closeCard() : openCard())

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCard()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <section className="msg-bg" data-screen-label="05 Message">
      <div className="wrap">
        <div className="eyebrow" style={{ color: '#ff2d95' }}>
          Última Canción <b>◆</b> Para ti, mí hielito
        </div>
        <h2 className="h2">
          La tarjeta<br />
          por dentro.
        </h2>

        <div className={'flip' + (open ? ' open' : '')} id="flip" ref={flipRef} onClick={toggle}>
          <div className="flip-inner">
            <div className="face front">
              <h3>
                Ábreme<br />
                ♡
              </h3>
              <div className="jp-open">クリックしてね</div>
              <div className="open-cue">▾ Haz clic para abrir ▾</div>
            </div>
            <div
              className="face back"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <button
                type="button"
                className="close-card"
                aria-label="Cerrar tarjeta"
                onClick={(e) => {
                  e.stopPropagation()
                  closeCard()
                }}
              >
                ✕
              </button>
              <div className="corner tl">★ ケン ★ KENN ★</div>
              <div className="corner br">★ 2026 ★ 誕生日 ★</div>
              <div className="msg-h">
                Feliz<br />
                cumpleaños<br />
                Kenn ♡<small>お誕生日おめでとう</small>
              </div>
              <div className="msg-body">
                Eres una <span className="hl">bendicion del universo</span>, y hoy celebro con todo mi corazon tu fuerza,
                tu dedicacion, tu amor y la ternura con la que iluminas mis dias.
                <br />
                <br />
                Estoy profundamente orgulloso de ti y agradecido por todo el carino y amor que me regalas dia con dia.
                Eres mi compañera de cafecito, de juegos y de vida; eres mi hogar, mi lugar bonito en el mundo. Te amo,
                mi hielito.
              </div>
              <div className="sig">— Noe ♡</div>
            </div>
          </div>
        </div>
       
      </div>
    </section>
  )
}
