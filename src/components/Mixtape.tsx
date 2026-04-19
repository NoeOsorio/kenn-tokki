import { useState } from 'react'

type Track = { t: string; n: string; sub: string; dur: string }

const TRACKS: Track[] = [
  { t: 'Medianoche en Shibuya', n: '01', sub: 'City Pop ◆ Apertura', dur: '3:42' },
  { t: 'Coco de Neón', n: '02', sub: 'Surf Boogie ◆ Dedicada a las Hot Maries', dur: '4:18' },
  { t: 'Tokio al Atardecer', n: '03', sub: 'Synth Funk ◆ 110 BPM', dur: '5:02' },
  { t: 'Ramen y Rosas', n: '04', sub: 'Slow Jam ◆ para bailar sobre la barra', dur: '3:55' },
  { t: 'Boogie de Bolsillo', n: '05', sub: 'Chip-Funk ◆ metales de 8 bits', dur: '2:48' },
  { t: 'Surf de Polanco', n: '06', sub: 'Surf CDMX ◆ cálido y vibrante', dur: '4:07' },
  { t: 'Harajuku Corazón Roto', n: '07', sub: 'Boogie ◆ redoblantes con gate', dur: '4:44' },
  { t: 'Feliz Cumpleaños Kenn', n: '08', sub: 'Pista oculta ◆ mantén presionado', dur: '∞' },
]

export default function Mixtape() {
  const [active, setActive] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)

  const activeName = active !== null ? TRACKS[active].t : null
  const trackname = playing && activeName ? `♪ ${activeName}` : active === null && !playing ? '— Dale Play —' : '— Detenido —'
  const windowText = playing ? '▶ PLAY' : active === null ? 'LISTO' : '■ STOP'

  const play = (idx: number) => {
    setActive(idx)
    setPlaying(true)
  }
  const stop = () => {
    setPlaying(false)
  }

  return (
    <section className="mix-bg" data-screen-label="02 Mixtape">
      <div className="wrap">
        <div className="eyebrow">
          LADO A <b>◆</b> Mix de Cumpleaños '26
        </div>
        <h2 className="h2">
          Un mixtape<br />
          para la DJ.
        </h2>
        <div className="jp">ケン・トッキ ミックステープ</div>
        <div className="mix-grid">
          <div className="mix-side">
            <div className={'cassette' + (playing ? ' playing' : '')} id="cassette">
              <div className="cass-label">
                <div className="cass-side">Lado A ◆ 90 MIN ◆ HIGH BIAS</div>
                <div className="cass-title">ケン・トッキ</div>
                <div className="cass-sub">Kenn Tokki ◆ Cumpleaños 2026</div>
                <div className="cass-line" />
                <div className="cass-track">
                  <span>▶ Sonando ahora</span>
                  <span id="trackname">{trackname}</span>
                </div>
              </div>
              <div className="cass-reels">
                <div className="reel" />
                <div className="reel" />
              </div>
              <div className="cass-window">
                <span id="window-text">
                  {windowText}
                  <span className="blink">_</span>
                </span>
              </div>
              <div className="cass-holes">
                <span />
                <span />
              </div>
            </div>
          </div>
          <div className="mix-side">
            <div className="eyebrow">
              LISTA DE CANCIONES <b>◆</b> 08 TEMAS
            </div>
            <div className="tracklist" id="tracklist">
              {TRACKS.map((t, i) => (
                <div
                  key={i}
                  className={'tr' + (active === i ? ' active' : '')}
                  data-t={t.t}
                  onClick={() => play(i)}
                >
                  <div className="n">{t.n}</div>
                  <div className="name">
                    {t.t}
                    <small>{t.sub}</small>
                  </div>
                  <div className="dur">{t.dur}</div>
                </div>
              ))}
            </div>
            <div className="play-row">
              <button className="btn primary" id="playBtn" onClick={() => play(0)}>
                ▶ Reproducir Lado A
              </button>
              <button className="btn" id="stopBtn" onClick={stop}>
                ■ Detener
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
