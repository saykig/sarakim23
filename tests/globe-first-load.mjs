import { chromium } from 'playwright-core'

const baseUrl = (process.env.BASE_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '')
const runs = Number.parseInt(process.env.STRESS_RUNS ?? '1', 10)
const chromePath =
  process.env.PLAYWRIGHT_CHROME_PATH ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

if (!Number.isInteger(runs) || runs < 1) {
  throw new Error('STRESS_RUNS must be a positive integer.')
}

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
})

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]

async function assertGlobe(page, label) {
  const globe = page.getByTestId('soft-atlas-globe')
  try {
    await globe.waitFor({ state: 'visible', timeout: 15_000 })
    await page.locator('[data-testid="soft-atlas-globe"] canvas').waitFor({
      state: 'visible',
      timeout: 15_000,
    })
  } catch (error) {
    const debugState = await globe
      .evaluate((element) => ({
        ready: element.getAttribute('data-ready'),
        html: element.innerHTML.slice(0, 500),
        opacity: getComputedStyle(element).opacity,
      }))
      .catch(() => ({ ready: null, html: 'globe frame missing', opacity: null }))
    throw new Error(
      `${label}: globe visibility timed out: ${JSON.stringify(debugState)}`,
      { cause: error }
    )
  }

  const state = await globe.evaluate((element) => {
    const canvas = element.querySelector('canvas')
    const frameRect = element.getBoundingClientRect()
    const canvasRect = canvas?.getBoundingClientRect()
    return {
      ready: element.getAttribute('data-ready'),
      frameWidth: frameRect.width,
      frameHeight: frameRect.height,
      canvasWidth: canvasRect?.width ?? 0,
      canvasHeight: canvasRect?.height ?? 0,
      opacity: getComputedStyle(element).opacity,
    }
  })

  if (
    state.ready !== 'true' ||
    state.frameWidth <= 0 ||
    state.frameHeight <= 0 ||
    state.canvasWidth <= 0 ||
    state.canvasHeight <= 0 ||
    Number(state.opacity) <= 0
  ) {
    throw new Error(`${label}: globe was not visibly ready: ${JSON.stringify(state)}`)
  }
}

async function runScenario(viewport, run, scenario, navigate) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  const fatalErrors = []

  page.on('pageerror', (error) => fatalErrors.push(error.message))
  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      !message.text().startsWith('Failed to load resource:')
    ) {
      fatalErrors.push(message.text())
    }
  })

  try {
    await navigate(page)
    await assertGlobe(
      page,
      `${scenario} ${viewport.name} ${viewport.width}x${viewport.height} run ${run}`
    )
    if (await page.locator('[data-nextjs-dialog]').count()) {
      fatalErrors.push('Next.js error overlay was visible.')
    }
    if (fatalErrors.length) {
      throw new Error(`Fatal browser errors: ${fatalErrors.join('\n')}`)
    }
  } finally {
    await context.close()
  }
}

try {
  for (const viewport of viewports) {
    for (let run = 1; run <= runs; run += 1) {
      await runScenario(viewport, run, 'direct', (page) =>
        page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' })
      )
    }

    for (let run = 1; run <= runs; run += 1) {
      await runScenario(viewport, run, 'internal', async (page) => {
        await page.goto(`${baseUrl}/memories/interlaken`, {
          waitUntil: 'domcontentloaded',
        })
        await page.getByText('return to the atlas').click()
        await page.waitForURL(`${baseUrl}/`)
      })
    }
  }
} finally {
  await browser.close()
}

console.log(
  `Soft Atlas passed ${runs * viewports.length} direct loads and ${runs * viewports.length} internal navigations.`
)
