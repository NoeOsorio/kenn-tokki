// Smoke test for the Kenn Tokki birthday site.
// Run with: node tests/smoke.mjs
// Verifies no console errors, section layout, and that the DJ mixer width
// stays stable when interactions fire (the recent stability fix).

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const URL = process.env.URL || 'http://localhost:5173/'
const OUT_DIR = 'debug/smoke'
mkdirSync(OUT_DIR, { recursive: true })

const errors = []
const results = []
const pass = (msg) => results.push({ ok: true, msg })
const fail = (msg) => results.push({ ok: false, msg })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))

await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)

// --- Section presence ---
for (const sel of ['.hero', '.mix-bg', '.surf', '.pokes', '.msg-bg']) {
  const el = await page.$(sel)
  el ? pass(`section ${sel} present`) : fail(`section ${sel} missing`)
}

// --- DJ mixer stability: width must not change on pad / cue clicks ---
const mixerSel = '.surf .mixer'
await page.locator('.surf').scrollIntoViewIfNeeded()
await page.waitForTimeout(300)

const readBox = async () => {
  const b = await page.locator(mixerSel).boundingBox()
  return b ? { w: Math.round(b.width), h: Math.round(b.height) } : null
}

const before = await readBox()
if (!before) fail('mixer not found')
else pass(`mixer initial size ${before.w}x${before.h}`)

// --- Decks must be circular (width ≈ height) ---
for (const side of ['left', 'right']) {
  const box = await page.locator(`.deck.${side}`).boundingBox()
  if (!box) fail(`deck.${side} not found`)
  else {
    const ratio = box.width / box.height
    if (Math.abs(1 - ratio) < 0.02) {
      pass(`deck.${side} is circular (${Math.round(box.width)}x${Math.round(box.height)})`)
    } else {
      fail(`deck.${side} is oval (${Math.round(box.width)}x${Math.round(box.height)}, ratio ${ratio.toFixed(2)})`)
    }
  }
}

await page.screenshot({ path: `${OUT_DIR}/01-before.png`, fullPage: false })

// Click a pad (longest label: "AIRHORN")
await page.locator('.pad').nth(7).click()
await page.waitForTimeout(100)
const afterPad = await readBox()
await page.screenshot({ path: `${OUT_DIR}/02-after-pad.png` })

// Click left CUE (cycles track)
await page.locator('.deck.left .deck-cue').click()
await page.waitForTimeout(100)
const afterCueL = await readBox()
await page.screenshot({ path: `${OUT_DIR}/03-after-cue-l.png` })

// Click right CUE (kicks deck)
await page.locator('.deck.right .deck-cue').click()
await page.waitForTimeout(100)
const afterCueR = await readBox()

const sameSize = (a, b) => a && b && a.w === b.w && a.h === b.h
if (sameSize(before, afterPad) && sameSize(before, afterCueL) && sameSize(before, afterCueR)) {
  pass('mixer width stable across pad + cue interactions')
} else {
  fail(
    `mixer size drifted — before ${JSON.stringify(before)}, pad ${JSON.stringify(afterPad)}, cueL ${JSON.stringify(afterCueL)}, cueR ${JSON.stringify(afterCueR)}`
  )
}

// --- Two-column Lado B at 1440px ---
const djBox = await page.locator('.surf .dj-wrap > *').first().boundingBox()
const copyBox = await page.locator('.surf .surf-copy').boundingBox()
if (djBox && copyBox && Math.abs(djBox.y - copyBox.y) < 300 && copyBox.x > djBox.x + djBox.width - 40) {
  pass('Lado B renders as two side-by-side columns')
} else {
  fail(
    `Lado B not two-column — dj ${JSON.stringify(djBox)} copy ${JSON.stringify(copyBox)}`
  )
}

// --- Mixtape: track 8 plays ---
await page.locator('.mix-bg .tr').nth(7).click()
await page.waitForTimeout(300)
const playing = await page.evaluate(() => {
  const a = document.querySelector('audio')
  return a ? { paused: a.paused, src: a.currentSrc } : null
})
if (playing && !playing.paused && /happy-bday-tokki/.test(playing.src)) {
  pass('track 8 audio element is playing the happy-bday wav')
} else {
  fail(`track 8 play failed — ${JSON.stringify(playing)}`)
}

// Pause via primary button
await page.locator('#playBtn').click()
await page.waitForTimeout(200)
const paused = await page.evaluate(() => document.querySelector('audio')?.paused)
paused ? pass('primary button pauses audio') : fail('primary button did not pause')

// --- Flip card opens as full-screen on desktop too ---
await page.locator('#flip').scrollIntoViewIfNeeded()
await page.locator('#flip').click()
await page.waitForTimeout(500)
const open = await page.locator('#flip.open').count()
open ? pass('flip card opens on click') : fail('flip card did not open')
const dOpenBox = await page.locator('#flip.open').boundingBox()
if (dOpenBox && dOpenBox.width >= 1440 - 1 && dOpenBox.height >= 900 - 1) {
  pass(`desktop: opened card fills viewport (${Math.round(dOpenBox.width)}x${Math.round(dOpenBox.height)})`)
} else {
  fail(`desktop: opened card not full-screen (${JSON.stringify(dOpenBox)})`)
}

// Confetti splash renders pieces in the DOM
const pieceCount = await page.locator('#confetti .piece').count()
if (pieceCount > 60) pass(`confetti splash fires on open (${pieceCount} pieces)`)
else fail(`confetti splash did not fire (${pieceCount} pieces)`)

await page.locator('.close-card').click()
await page.waitForTimeout(200)

// --- Console errors ---
if (errors.length === 0) pass('no console errors')
else fail(`console errors: ${errors.slice(0, 3).join(' | ')}`)

await page.screenshot({ path: `${OUT_DIR}/04-final.png`, fullPage: true })

// =============================================================
// iPhone-class viewport (iPhone 14 Pro = 393x852)
// =============================================================
await ctx.close()
const mctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 })
const m = await mctx.newPage()
const mErrors = []
m.on('console', (x) => x.type() === 'error' && mErrors.push(x.text()))
m.on('pageerror', (e) => mErrors.push('pageerror: ' + e.message))
await m.goto(URL, { waitUntil: 'networkidle' })
await m.waitForTimeout(500)

const viewportW = 393
const horiz = async (sel) => {
  const b = await m.locator(sel).boundingBox()
  return b ? Math.round(b.x + b.width) : null
}

// No horizontal overflow on any major block
const bodyW = await m.evaluate(() => document.documentElement.scrollWidth)
if (bodyW <= viewportW + 1) pass(`mobile: no horizontal overflow (scrollWidth=${bodyW})`)
else fail(`mobile: horizontal overflow (scrollWidth=${bodyW} > ${viewportW})`)

// Hero title fits
const titleBox = await m.locator('.title').boundingBox()
if (titleBox && titleBox.width <= viewportW) pass(`mobile: hero title fits (${Math.round(titleBox.width)}px)`)
else fail(`mobile: hero title overflow (${titleBox && Math.round(titleBox.width)}px)`)
await m.screenshot({ path: `${OUT_DIR}/m1-hero.png`, fullPage: false })

// Scroll to mixtape and capture
await m.locator('.mix-bg').scrollIntoViewIfNeeded()
await m.waitForTimeout(300)
await m.screenshot({ path: `${OUT_DIR}/m2-mixtape.png`, fullPage: false })

// DJ section: mixer is full-width above the two decks
await m.locator('.surf').scrollIntoViewIfNeeded()
await m.waitForTimeout(400)
const mMixerBox = await m.locator('.surf .mixer').boundingBox()
const mDeckLBox = await m.locator('.surf .deck.left').boundingBox()
const mDeckRBox = await m.locator('.surf .deck.right').boundingBox()
if (mMixerBox && mDeckLBox && mDeckRBox && mMixerBox.y + mMixerBox.height <= mDeckLBox.y + 4 && Math.abs(mDeckLBox.y - mDeckRBox.y) < 10) {
  pass('mobile: mixer is above decks, decks side-by-side')
} else {
  fail(`mobile: DJ layout wrong — mixer ${JSON.stringify(mMixerBox)} deckL ${JSON.stringify(mDeckLBox)} deckR ${JSON.stringify(mDeckRBox)}`)
}
if (mDeckLBox && Math.abs(mDeckLBox.width - mDeckLBox.height) < 3) pass(`mobile: deck.left square (${Math.round(mDeckLBox.width)}x${Math.round(mDeckLBox.height)})`)
else fail(`mobile: deck.left not square`)
await m.screenshot({ path: `${OUT_DIR}/m3-dj.png`, fullPage: false })

// Polaroids: single column
await m.locator('.pokes').scrollIntoViewIfNeeded()
await m.waitForTimeout(300)
const p1 = await m.locator('.pokes .polaroid').first().boundingBox()
const p2 = await m.locator('.pokes .polaroid').nth(1).boundingBox()
if (p1 && p2 && p2.y > p1.y + p1.height - 10) pass('mobile: photo wall is single column')
else fail(`mobile: photo wall not single-column — p1 ${JSON.stringify(p1)} p2 ${JSON.stringify(p2)}`)
await m.screenshot({ path: `${OUT_DIR}/m4-polaroids.png`, fullPage: false })

// Flip card fits when closed
await m.locator('#flip').scrollIntoViewIfNeeded()
await m.waitForTimeout(300)
const flipBox = await m.locator('#flip').boundingBox()
if (flipBox && flipBox.width <= viewportW - 20) pass(`mobile: closed card fits (${Math.round(flipBox.width)}px)`)
else fail(`mobile: closed card overflow (${flipBox && Math.round(flipBox.width)}px)`)
await m.screenshot({ path: `${OUT_DIR}/m5-message.png`, fullPage: false })

// Tap to open — expect full-screen overlay on mobile
await m.locator('#flip').click()
await m.waitForTimeout(400)
const openBox = await m.locator('#flip.open').boundingBox()
if (openBox && openBox.width >= viewportW - 1 && openBox.height >= 852 - 1) {
  pass(`mobile: opened card fills viewport (${Math.round(openBox.width)}x${Math.round(openBox.height)})`)
} else {
  fail(`mobile: opened card not full-screen (${JSON.stringify(openBox)})`)
}
await m.screenshot({ path: `${OUT_DIR}/m6-message-open.png`, fullPage: false })

// Close button works
await m.locator('.close-card').click()
await m.waitForTimeout(300)
const closedCount = await m.locator('#flip.open').count()
closedCount === 0 ? pass('mobile: close button dismisses full-screen card') : fail('mobile: close button did not close')

if (mErrors.length === 0) pass('mobile: no console errors')
else fail(`mobile console errors: ${mErrors.slice(0, 3).join(' | ')}`)

await browser.close()

// --- Report ---
const passed = results.filter((r) => r.ok).length
const failed = results.filter((r) => !r.ok)
console.log('\n=== smoke ===')
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.msg}`)
console.log(`\n${passed}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)
