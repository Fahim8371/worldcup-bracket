// One-off: capture app screenshots for the README using the system Chrome.
// Run with the dev server up on http://localhost:5173.
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = 'http://localhost:5173/'
const OUT = new URL('../docs/screenshots/', import.meta.url).pathname
mkdirSync(OUT, { recursive: true })

const FAVS = JSON.stringify(['AUS', 'BRA'])
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--hide-scrollbars', '--force-color-profile=srgb'],
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 })

async function setState({ onboarded = true, theme = 'dark', watchlist = [] }) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.evaluate(
    (favs, ob, th, wl) => {
      localStorage.clear()
      if (ob) localStorage.setItem('wc2026.onboarded', '1')
      if (ob) localStorage.setItem('wc2026.favourites', favs)
      localStorage.setItem('wc2026.theme', th)
      if (wl.length) localStorage.setItem('wc2026.watchlist', JSON.stringify(wl))
    },
    FAVS,
    onboarded,
    theme,
    watchlist
  )
  await page.reload({ waitUntil: 'networkidle2' })
  await sleep(1600) // let flags + fonts settle
}

async function shot(name) {
  await page.screenshot({ path: OUT + name })
  console.log('saved', name)
}

// 1) Onboarding welcome
await page.goto(BASE, { waitUntil: 'domcontentloaded' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle2' })
await sleep(1200)
await shot('01-onboarding.png')

// 2) Fixtures (dark)
await setState({ theme: 'dark' })
await page.evaluate(() => window.scrollTo(0, 0))
await shot('02-fixtures.png')

// 3) Groups
await page.evaluate(() => {
  ;[...document.querySelectorAll('.tab')].find((t) => t.textContent === 'Groups')?.click()
})
await sleep(600)
await page.evaluate(() => window.scrollTo(0, 0))
await shot('03-groups.png')

// 4) Calendar — star a few games first
await setState({ theme: 'dark' })
await page.evaluate(() => {
  const btns = [...document.querySelectorAll('.match-card .watch-btn')].slice(0, 5)
  btns.forEach((b) => b.click())
})
await sleep(300)
await page.evaluate(() => {
  ;[...document.querySelectorAll('.tab')].find((t) => t.textContent.startsWith('Calendar'))?.click()
})
await sleep(700)
await page.evaluate(() => window.scrollTo(0, 0))
await shot('04-calendar.png')

// 5) Settings sheet
await setState({ theme: 'dark' })
await page.evaluate(() => document.querySelector('.settings-btn')?.click())
await sleep(500)
await shot('05-settings.png')

// 6) Light theme fixtures
await setState({ theme: 'light' })
await page.evaluate(() => window.scrollTo(0, 0))
await shot('06-light.png')

await browser.close()
console.log('done')
