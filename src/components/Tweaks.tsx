import { useEffect, useState } from 'react'
import { popConfetti } from '../lib/confetti'

const DEFAULTS = { hueShift: 0, gridSpeed: 3, accent: '#ff2d95' }
const SWATCHES = ['#ff2d95', '#00e5ff', '#ffd166', '#c084fc']

export default function Tweaks() {
  const [hue, setHue] = useState(DEFAULTS.hueShift)
  const [speed, setSpeed] = useState(DEFAULTS.gridSpeed)
  const [accent, setAccent] = useState(DEFAULTS.accent)

  useEffect(() => {
    const hero = document.querySelector('.hero') as HTMLElement | null
    const surf = document.querySelector('.surf') as HTMLElement | null
    const pokes = document.querySelector('.pokes') as HTMLElement | null
    if (hero) hero.style.filter = `hue-rotate(${hue}deg)`
    if (surf) surf.style.filter = `hue-rotate(${hue * 0.4}deg)`
    if (pokes) pokes.style.filter = `hue-rotate(${hue * 0.4}deg)`
  }, [hue])

  useEffect(() => {
    const grid = document.querySelector('.grid') as HTMLElement | null
    if (grid) grid.style.animationDuration = 9 / speed + 's'
  }, [speed])

  useEffect(() => {
    document.documentElement.style.setProperty('--mag', accent)
  }, [accent])

  return (
    <div className="tweaks on" id="tweaks">
      <h4>Ajustes</h4>
      <div className="tweak-row">
        <label>Tono Atardecer</label>
        <input
          type="range"
          id="hueSlider"
          min={-40}
          max={40}
          value={hue}
          onChange={(e) => setHue(+e.target.value)}
        />
      </div>
      <div className="tweak-row">
        <label>Vel. Cuadrícula</label>
        <input
          type="range"
          id="speedSlider"
          min={1}
          max={8}
          step={0.5}
          value={speed}
          onChange={(e) => setSpeed(+e.target.value)}
        />
      </div>
      <div className="tweak-row">
        <label>Acento</label>
        <div className="swatches" id="swatches">
          {SWATCHES.map((c) => (
            <div
              key={c}
              className={'sw' + (accent === c ? ' active' : '')}
              data-c={c}
              style={{ background: c }}
              onClick={() => setAccent(c)}
            />
          ))}
        </div>
      </div>
      <div className="tweak-row">
        <label>¡Confeti!</label>
        <button
          className="btn"
          style={{ padding: '6px 12px', fontSize: 10 }}
          id="confettiBtn"
          onClick={() => popConfetti()}
        >
          ◆ Pop
        </button>
      </div>
    </div>
  )
}
