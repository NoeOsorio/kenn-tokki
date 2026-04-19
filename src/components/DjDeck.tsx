import { useEffect, useRef, useState } from 'react'
import { popConfetti } from '../lib/confetti'

type Track = { name: string; bpm: number }

const TRACKS: Track[] = [
  { name: '♪ Midnight en Shibuya', bpm: 118 },
  { name: '♪ Coco Neón', bpm: 114 },
  { name: '♪ Tokio Sunset Drive', bpm: 122 },
  { name: '♪ Surf de Polanco', bpm: 108 },
  { name: '♪ Harajuku Heartbreak', bpm: 120 },
]

const PAD_COLORS = ['#ff2d95', '#ff6b35', '#ffd166', '#9cff4d', '#00e5ff', '#c084fc', '#ff2d95', '#fff4e0']
const PAD_KEYS = ['Q', 'W', 'E', 'R', 'A', 'S', 'D', 'F']
const PAD_SOUNDS = ['KICK', 'SNARE', 'CLAP', 'HAT', 'VOX', 'RISER', 'FX', 'AIRHORN']

export default function DjDeck() {
  const deckLRef = useRef<HTMLDivElement>(null)
  const deckRRef = useRef<HTMLDivElement>(null)
  const platterLRef = useRef<HTMLDivElement>(null)
  const platterRRef = useRef<HTMLDivElement>(null)
  const xfaderRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)
  const padsRef = useRef<HTMLDivElement>(null)

  const [tIdx, setTIdx] = useState(0)
  const [trackText, setTrackText] = useState(TRACKS[0].name)
  const [bpm, setBpm] = useState(TRACKS[0].bpm)

  // refs that the animation loop reads so setState doesn't reset it
  const bpmRef = useRef(bpm)
  const velR = useRef(0)
  const angR = useRef(0)
  const angL = useRef(0)

  useEffect(() => {
    bpmRef.current = bpm
  }, [bpm])

  // Animation loop
  useEffect(() => {
    let raf = 0
    let lastT = performance.now()
    const loop = (now: number) => {
      const dt = (now - lastT) / 1000
      lastT = now
      const speedL = (bpmRef.current / 118) * 360 / 1.8
      angL.current = (angL.current + speedL * dt) % 360
      if (platterLRef.current) platterLRef.current.style.transform = `rotate(${angL.current}deg)`
      angR.current += velR.current * dt
      velR.current *= 0.96
      if (Math.abs(velR.current) < 0.5) velR.current = 0
      if (platterRRef.current) platterRRef.current.style.transform = `rotate(${angR.current}deg)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Drag-to-spin right deck
  useEffect(() => {
    const deck = deckRRef.current
    if (!deck) return
    let dragging = false
    let lastAng = 0
    let lastDragT = 0

    const angleFromEvent = (e: PointerEvent) => {
      const r = deck.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      return (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI
    }
    const onDown = (e: PointerEvent) => {
      dragging = true
      lastAng = angleFromEvent(e)
      lastDragT = performance.now()
      velR.current = 0
      deck.classList.add('glow')
      e.preventDefault()
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const a = angleFromEvent(e)
      let d = a - lastAng
      if (d > 180) d -= 360
      if (d < -180) d += 360
      angR.current += d
      const now = performance.now()
      const dt = Math.max(1, now - lastDragT) / 1000
      velR.current = d / dt
      lastAng = a
      lastDragT = now
      e.preventDefault()
    }
    const onUp = () => {
      if (!dragging) return
      dragging = false
      deck.classList.remove('glow')
    }
    deck.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      deck.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [])

  // Crossfader drag
  useEffect(() => {
    const xfader = xfaderRef.current
    const handle = handleRef.current
    if (!xfader || !handle) return
    let xDown = false
    let xRect: DOMRect | null = null
    let xStartLeft = 50
    let xStartX = 0
    const setX = (pct: number) => {
      pct = Math.max(0, Math.min(100, pct))
      handle.style.left = pct + '%'
    }
    const onDown = (e: PointerEvent) => {
      xDown = true
      xRect = xfader.getBoundingClientRect()
      xStartX = e.clientX
      xStartLeft = parseFloat(handle.style.left)
      handle.setPointerCapture(e.pointerId)
      e.preventDefault()
    }
    const onMove = (e: PointerEvent) => {
      if (!xDown || !xRect) return
      const dx = e.clientX - xStartX
      setX(xStartLeft + (dx / xRect.width) * 100)
    }
    const onUp = (e: PointerEvent) => {
      xDown = false
      try {
        handle.releasePointerCapture(e.pointerId)
      } catch {}
    }
    const onClick = (e: MouseEvent) => {
      if (e.target === handle) return
      const r = xfader.getBoundingClientRect()
      setX(((e.clientX - r.left) / r.width) * 100)
    }
    handle.addEventListener('pointerdown', onDown)
    handle.addEventListener('pointermove', onMove)
    handle.addEventListener('pointerup', onUp)
    xfader.addEventListener('click', onClick)
    setX(50)
    return () => {
      handle.removeEventListener('pointerdown', onDown)
      handle.removeEventListener('pointermove', onMove)
      handle.removeEventListener('pointerup', onUp)
      xfader.removeEventListener('click', onClick)
    }
  }, [])

  // Keyboard for pads
  useEffect(() => {
    const keyMap: Record<string, number> = { q: 0, w: 1, e: 2, r: 3, a: 4, s: 5, d: 6, f: 7 }
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      const i = keyMap[e.key.toLowerCase()]
      if (i == null) return
      firePad(i)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const firePad = (i: number) => {
    const p = padsRef.current?.children[i] as HTMLDivElement | undefined
    if (!p) return
    p.classList.add('on')
    setTimeout(() => p.classList.remove('on'), 220)
    const cur = TRACKS[tIdx].name.replace('♪ ', '')
    setTrackText(`♪ ${PAD_SOUNDS[i]} ◆ ${cur}`)
    setTimeout(() => setTrackText(TRACKS[tIdx].name), 900)
  }

  const onCue = (deck: 'L' | 'R', e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const btn = e.currentTarget
    btn.classList.add('on')
    setTimeout(() => btn.classList.remove('on'), 180)
    if (deck === 'R') {
      velR.current = 720
    } else {
      const next = (tIdx + 1) % TRACKS.length
      setTIdx(next)
      setTrackText(TRACKS[next].name)
      setBpm(TRACKS[next].bpm)
    }
    popConfetti(btn)
  }

  return (
    <section className="surf" data-screen-label="03 Hot Maries">
      <svg className="wave" style={{ top: 0, transform: 'translateY(-60%)' }} viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path
          d="M0,50 C180,90 360,10 540,50 C720,90 900,10 1080,50 C1260,90 1440,20 1440,50 L1440,100 L0,100 Z"
          fill="#0a0a2e"
        />
      </svg>
      <div className="wrap">
        <div className="eyebrow">
          LADO B <b>◆</b> Las Hot Maries
        </div>
        <div className="surf-grid">
          <div className="dj-wrap">
            <div>
              <div className="dj" id="dj">
                <div className="dj-grid">
                  <div className="dj-brand left">
                    <span className="mark">KENN</span> SYSTEM ONE
                  </div>
                  <div />
                  <div className="dj-brand right">
                    SURF POP CLUB <span className="mark">♡</span>
                  </div>

                  <div className="deck left" id="deckL" ref={deckLRef}>
                    <div className="platter" ref={platterLRef} />
                    <div className="platter-inner">
                      <div className="plabel top">★ Lado A ★</div>
                      <div className="pname">HOT<br />MARIES</div>
                      <div className="plabel bot">45 RPM</div>
                    </div>
                    <div className="deck-cue" data-deck="L" onClick={(e) => onCue('L', e)}>
                      CUE
                    </div>
                  </div>

                  <div className="mixer">
                    <div className="screen">
                      <div className="row1">
                        <span className="a">● A</span>
                        <span>SYNC</span>
                        <span className="b">B ●</span>
                      </div>
                      <div className="track" id="djTrack">
                        {trackText}
                      </div>
                      <div className="wave" />
                      <div className="bpm">
                        <span>TEMPO</span>
                        <b id="djBpm">{bpm}</b>
                        <span>BPM</span>
                      </div>
                    </div>
                    <div className="knobs">
                      <Knob rot={0} />
                      <Knob rot={-30} />
                      <Knob rot={40} />
                    </div>
                  </div>

                  <div className="deck right" id="deckR" ref={deckRRef}>
                    <div className="platter" ref={platterRRef} />
                    <div className="platter-inner">
                      <div className="plabel top">★ Lado B ★</div>
                      <div className="pname">KENN<br />TOKKI</div>
                      <div className="plabel bot">DRAG ME</div>
                    </div>
                    <div className="deck-cue" data-deck="R" onClick={(e) => onCue('R', e)}>
                      CUE
                    </div>
                  </div>

                  <div className="xfader" id="xfader" ref={xfaderRef}>
                    <div className="xfader-track" />
                    <div className="xfader-handle" id="xfaderHandle" ref={handleRef} style={{ left: '50%' }} />
                  </div>

                  <div className="pads" id="pads" ref={padsRef}>
                    {PAD_COLORS.map((c, i) => (
                      <div
                        key={i}
                        className="pad"
                        data-k={PAD_KEYS[i]}
                        style={{ ['--pc' as any]: c }}
                        onPointerDown={(e) => {
                          e.preventDefault()
                          firePad(i)
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="dj-caption">
                KENN <b>TOKKI</b> ◆ Alma <b>Hermosa</b> ◆ Risa <b>Contagiosa</b>◆ Mente <b>Creativa</b>
              </div>
            </div>

            <div className="surf-copy">
              <div className="eyebrow" style={{ color: '#ffd166' }}>
                ESTUDIOS HIELITO <b style={{ color: '#fff' }}>◆</b> MISS KARY
              </div>
              <h2 className="h2">
                Surf pop<br />
                princesa.
              </h2>
              <div className="jp" style={{ color: '#fff4e0' }}>
                サーフ・ポップ・プリンセス
              </div>
              <p>
                Artista de alma luminosa, amante de los gatitos y de esas bolsas de peluche que parecen abrazos.
                La mejor compañera de risas y cafesito, de tardes suaves y momentos que se quedan brillando un ratito
                mas en el corazón.
              </p>
              <div className="stats">
                <div className="stat">
                  <b>04</b>
                  <span>Sencillos ◆ 4min</span>
                </div>
                <div className="stat">
                  <b>408</b>
                  <span>Meses ◆ Amor</span>
                </div>
                <div className="stat">
                  <b>∞</b>
                  <span>Tocadas por venir</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Knob({ rot: initRot }: { rot: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const sidRef = useRef('k' + Math.random().toString(36).slice(2, 7))

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const sid = sidRef.current
    el.dataset.sid = sid
    const style = document.createElement('style')
    style.id = sid
    document.head.appendChild(style)
    let rot = initRot
    const apply = () => {
      style.textContent = `[data-sid="${sid}"]::before{transform:translateX(-50%) rotate(${rot}deg)}`
    }
    apply()

    let startY = 0
    let startRot = 0
    let down = false
    const onDown = (e: PointerEvent) => {
      down = true
      startY = e.clientY
      startRot = rot
      el.setPointerCapture(e.pointerId)
      e.preventDefault()
    }
    const onMove = (e: PointerEvent) => {
      if (!down) return
      const dy = startY - e.clientY
      rot = Math.max(-135, Math.min(135, startRot + dy * 1.5))
      apply()
    }
    const onUp = (e: PointerEvent) => {
      down = false
      try {
        el.releasePointerCapture(e.pointerId)
      } catch {}
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      style.remove()
    }
  }, [initRot])

  return <div className="knob" ref={ref} />
}
