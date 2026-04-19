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

// --- Flip card opens ---
await page.locator('#flip').scrollIntoViewIfNeeded()
await page.locator('#flip').click()
await page.waitForTimeout(400)
const open = await page.locator('#flip.open').count()
open ? pass('flip card opens on click') : fail('flip card did not open')

// --- Console errors ---
if (errors.length === 0) pass('no console errors')
else fail(`console errors: ${errors.slice(0, 3).join(' | ')}`)

await page.screenshot({ path: `${OUT_DIR}/04-final.png`, fullPage: true })

await browser.close()

// --- Report ---
const passed = results.filter((r) => r.ok).length
const failed = results.filter((r) => !r.ok)
console.log('\n=== smoke ===')
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.msg}`)
console.log(`\n${passed}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)
