const COLORS = ['#ff2d95', '#00e5ff', '#ffd166', '#ff6b35', '#fff4e0', '#c084fc']

type Burst = {
  /** pieces per burst (default 36) */
  count?: number
  /** min/max travel distance in px (default 120..360) */
  minDist?: number
  maxDist?: number
  /** lift: how much pieces are thrown upward (default 120) */
  lift?: number
}

function emitFromPoint(ox: number, oy: number, opts: Burst = {}) {
  const container = document.getElementById('confetti')
  if (!container) return
  const count = opts.count ?? 36
  const minDist = opts.minDist ?? 120
  const maxDist = opts.maxDist ?? 360
  const lift = opts.lift ?? 120
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div')
    p.className = 'piece'
    p.style.background = COLORS[i % COLORS.length]
    p.style.left = ox + 'px'
    p.style.top = oy + 'px'
    container.appendChild(p)
    const ang = Math.random() * Math.PI * 2
    const dist = minDist + Math.random() * (maxDist - minDist)
    const dx = Math.cos(ang) * dist
    const dy = Math.sin(ang) * dist - lift
    const rot = Math.random() * 720 - 360 + 'deg'
    p.animate(
      [
        { transform: `translate(0,0) rotate(0)`, opacity: 1 },
        { transform: `translate(${dx}px,${dy}px) rotate(${rot})`, opacity: 0 },
      ],
      { duration: 1200 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)' }
    )
    setTimeout(() => p.remove(), 1800)
  }
}

export function popConfetti(from?: HTMLElement | null) {
  const r = from
    ? from.getBoundingClientRect()
    : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 }
  emitFromPoint(r.left + r.width / 2, r.top + r.height / 2)
}

/**
 * Bigger, multi-point splash — used when the message card opens.
 * Fires three bursts from across the card to fill the viewport.
 */
export function popConfettiSplash() {
  const w = window.innerWidth
  const h = window.innerHeight
  const origins: Array<[number, number]> = [
    [w * 0.2, h * 0.35],
    [w * 0.5, h * 0.25],
    [w * 0.8, h * 0.35],
  ]
  origins.forEach(([x, y], i) => {
    setTimeout(
      () => emitFromPoint(x, y, { count: 44, minDist: 160, maxDist: 440, lift: 160 }),
      i * 120
    )
  })
}

export function initConfetti() {
  ;(window as any).popConfetti = popConfetti
  ;(window as any).popConfettiSplash = popConfettiSplash
}
