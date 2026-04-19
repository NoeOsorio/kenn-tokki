import { useEffect, useRef, useState } from 'react'

type Track = {
  t: string
  n: string
  sub: string
  dur: string
  src?: string
  /** easter-egg Hot Maries tracks: real songs, no audio attached */
  hm?: boolean
}

const TRACKS: Track[] = [
  { t: 'Medianoche en Shibuya', n: '01', sub: 'City Pop ◆ Apertura', dur: '3:42' },
  { t: 'Coco de Neón', n: '02', sub: 'Surf Boogie ◆ Dedicada a las Hot Maries', dur: '4:18' },
  { t: 'Tokio al Atardecer', n: '03', sub: 'Synth Funk ◆ 110 BPM', dur: '5:02' },
  { t: 'Oh', n: '04', sub: 'Hot Maries ♡ Surf Pop', dur: '2:30', hm: true },
  { t: 'Oh Sweet', n: '05', sub: 'Hot Maries ♡ Surf Pop', dur: '3:40', hm: true },
  { t: 'Blue Monday', n: '06', sub: 'Hot Maries ♡ Surf Pop', dur: '3:20', hm: true },
  { t: "I Won't Be There", n: '07', sub: 'Hot Maries ♡ Surf Pop', dur: '2:14', hm: true },
  {
    t: 'Feliz Cumpleaños Kenn',
    n: '08',
    sub: 'Pista oculta ◆ mantén presionado',
    dur: '∞',
    src: '/songs/happy-bday-tokki.wav',
  },
]

export default function Mixtape() {
  const [active, setActive] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const flashTimer = useRef<number | null>(null)

  const activeTrack = active !== null ? TRACKS[active] : null

  const trackname = flash
    ? flash
    : playing && activeTrack
    ? `♪ ${activeTrack.t}`
    : active === null
    ? '— Dale Play —'
    : `— ${activeTrack!.t} —`

  const windowText = playing ? '▶ PLAY' : active === null ? 'LISTO' : '‖ PAUSE'

  const showFlash = (msg: string) => {
    setFlash(msg)
    if (flashTimer.current) window.clearTimeout(flashTimer.current)
    flashTimer.current = window.setTimeout(() => setFlash(null), 1500)
  }

  const playTrack = (idx: number) => {
    const t = TRACKS[idx]
    const audio = audioRef.current
    if (!audio) return
    if (!t.src) {
      showFlash(t.hm ? `♡ ${t.t} ◆ Hot Maries` : '— Próximamente ✦ Coming soon —')
      return
    }
    if (active !== idx) {
      audio.src = t.src
      setActive(idx)
    }
    audio.play().catch(() => {
      showFlash('— Play bloqueado, intenta de nuevo —')
    })
  }

  const pauseTrack = () => {
    audioRef.current?.pause()
  }

  const stop = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    setPlaying(false)
  }

  const onPrimary = () => {
    if (playing) {
      pauseTrack()
    } else if (active !== null) {
      playTrack(active)
    } else {
      // default: play the only available song (track 8)
      const firstAvailable = TRACKS.findIndex((t) => t.src)
      if (firstAvailable >= 0) playTrack(firstAvailable)
      else showFlash('— Sin canciones disponibles —')
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => setPlaying(false)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  useEffect(
    () => () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current)
    },
    []
  )

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
              {TRACKS.map((t, i) => {
                const available = !!t.src
                const classes =
                  'tr' +
                  (active === i ? ' active' : '') +
                  (available ? '' : ' unavailable') +
                  (t.hm ? ' hot-maries' : '')
                const subText = available || t.hm ? t.sub : `${t.sub} ◆ próximamente`
                return (
                  <div
                    key={i}
                    className={classes}
                    data-t={t.t}
                    onClick={() => playTrack(i)}
                    style={available ? undefined : { cursor: 'not-allowed' }}
                  >
                    <div className="n">{t.n}</div>
                    <div className="name">
                      {t.t}
                      {t.hm && <span className="hm-badge">HM</span>}
                      <small>{subText}</small>
                    </div>
                    <div className="dur">{t.dur}</div>
                  </div>
                )
              })}
            </div>
            <div className="play-row">
              <button className="btn primary" id="playBtn" onClick={onPrimary}>
                {playing ? '‖ Pausar' : '▶ Reproducir'}
              </button>
              <button className="btn" id="stopBtn" onClick={stop}>
                ■ Detener
              </button>
            </div>
          </div>
        </div>
      </div>

      <audio ref={audioRef} preload="none" />
    </section>
  )
}
