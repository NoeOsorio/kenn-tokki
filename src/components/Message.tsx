import { useRef, useState } from 'react'
import { popConfetti } from '../lib/confetti'

export default function Message() {
  const [open, setOpen] = useState(false)
  const flipRef = useRef<HTMLDivElement>(null)

  const toggle = () => {
    setOpen((v) => {
      const next = !v
      if (next) setTimeout(() => popConfetti(flipRef.current), 0)
      return next
    })
  }

  return (
    <section className="msg-bg" data-screen-label="05 Message">
      <div className="wrap">
        <div className="eyebrow" style={{ color: '#ff2d95' }}>
          Última Canción <b>◆</b> Para ti, Kenn
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
            <div className="face back">
              <div className="corner tl">★ ケン ★ KENN ★</div>
              <div className="corner br">★ 2026 ★ 誕生日 ★</div>
              <div className="msg-h">
                Feliz<br />
                cumpleaños<br />
                Kenn ♡<small>お誕生日おめでとう</small>
              </div>
              <div className="msg-body">
                Que este año te traiga más <span className="hl">noches con pista llena</span>, más olas para las{' '}
                <span className="hl">Hot Maries</span>, más ramen a las 2 AM, y todas las criaturitas de bolsillo que aún
                te faltan.
                <br />
                <br />
                Gracias por poner la mejor música y por hacer que todo suene un poquito más brillante. Te queremos un
                montón.
              </div>
              <div className="sig">— Noe ♡</div>
            </div>
          </div>
        </div>
        <p
          style={{
            marginTop: 24,
            fontSize: 11,
            letterSpacing: '.3em',
            color: 'rgba(255,244,224,.55)',
            textTransform: 'uppercase',
          }}
        >
          Toca la tarjeta para voltearla ◆ もう一度タップで閉じる
        </p>
      </div>
    </section>
  )
}
