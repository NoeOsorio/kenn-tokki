import { useEffect, useRef } from 'react'

const Palm = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 140 220">
    <rect x="66" y="80" width="8" height="140" fill="#0a0a2e" />
    <path d="M70 80 Q40 50 10 55 Q38 60 50 80 Z" fill="#0a0a2e" />
    <path d="M70 80 Q100 50 130 55 Q102 60 90 80 Z" fill="#0a0a2e" />
    <path d="M70 80 Q55 40 40 20 Q60 40 66 80 Z" fill="#0a0a2e" />
    <path d="M70 80 Q85 40 100 20 Q80 40 74 80 Z" fill="#0a0a2e" />
    <path d="M70 80 Q45 70 15 90 Q45 78 66 82 Z" fill="#0a0a2e" />
    <path d="M70 80 Q95 70 125 90 Q95 78 74 82 Z" fill="#0a0a2e" />
  </svg>
)

export default function Hero() {
  const starsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const c = starsRef.current
    if (!c) return
    c.innerHTML = ''
    for (let i = 0; i < 60; i++) {
      const s = document.createElement('div')
      s.className = 'star'
      s.style.left = Math.random() * 100 + '%'
      s.style.top = Math.random() * 55 + '%'
      s.style.animationDelay = Math.random() * 3 + 's'
      const px = (Math.random() < 0.2 ? 3 : 2) + 'px'
      s.style.width = px
      s.style.height = px
      c.appendChild(s)
    }
  }, [])

  return (
    <section className="hero" data-screen-label="01 Hero">
      <div className="stars" ref={starsRef} />
      <div className="sun" />
      <div className="palms">
        <Palm className="p1" />
        <Palm className="p2" />
      </div>
      <div className="grid" />
      <div className="hero-inner">
        <div className="katakana">
          ハッピー <span className="dot">◆</span> バースデー <span className="dot">◆</span> ケン
        </div>
        <h1 className="title">
          Feliz<br />
          Cumple<span className="amp">♡</span>años
        </h1>
        <div className="subtitle">
          para la única e irrepetible <span>Kenn Tokki</span>
        </div>
        <div className="jp-title">渋谷ナイトクルーズ ✦ 2026</div>
        <div className="chip-row">
          <div className="chip">
            Influencer DJ <b>◆</b> CDMX
          </div>
          <div className="chip">
            Hot Maries <b>◆</b> Surf Pop
          </div>
          <div className="chip">
            Novia <b>◆</b> NV. 34
          </div>
        </div>
      </div>
      <div className="scroll-cue">DESLIZA / スクロール</div>
    </section>
  )
}
