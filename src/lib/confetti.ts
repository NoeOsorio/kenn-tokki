export function popConfetti(from?: HTMLElement | null) {
  const container = document.getElementById('confetti')
  if (!container) return
  const r = from
    ? from.getBoundingClientRect()
    : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 }
  const ox = r.left + r.width / 2
  const oy = r.top + r.height / 2
  const colors = ['#ff2d95', '#00e5ff', '#ffd166', '#ff6b35', '#fff4e0', '#c084fc']
  for (let i = 0; i < 36; i++) {
    const p = document.createElement('div')
    p.className = 'piece'
    p.style.background = colors[i % colors.length]
    p.style.left = ox + 'px'
    p.style.top = oy + 'px'
    container.appendChild(p)
    const ang = Math.random() * Math.PI * 2
    const dist = 120 + Math.random() * 240
    const dx = Math.cos(ang) * dist
    const dy = Math.sin(ang) * dist - 120
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

export function initConfetti() {
  // global trigger hook if needed elsewhere
  ;(window as any).popConfetti = popConfetti
}
