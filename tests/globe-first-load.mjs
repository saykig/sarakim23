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
    const caption = element.querySelector('.atlas-caption-text')
    const frameRect = element.getBoundingClientRect()
    const canvasRect = canvas?.getBoundingClientRect()
    const captionRect = caption?.getBoundingClientRect()
    const captionSvg = element.querySelector('.atlas-globe-caption')
    return {
      ready: element.getAttribute('data-ready'),
      frameWidth: frameRect.width,
      frameHeight: frameRect.height,
      canvasWidth: canvasRect?.width ?? 0,
      canvasHeight: canvasRect?.height ?? 0,
      caption: caption?.textContent?.trim() ?? '',
      captionCenterX: Number(captionSvg?.getAttribute('data-globe-center-x')),
      captionCenterY: Number(captionSvg?.getAttribute('data-globe-center-y')),
      captionVisible:
        Boolean(captionRect) &&
        captionRect.right > 0 &&
        captionRect.bottom > 0 &&
        captionRect.left < window.innerWidth &&
        captionRect.top < window.innerHeight,
      opacity: getComputedStyle(element).opacity,
    }
  })

  if (
    state.ready !== 'true' ||
    state.frameWidth <= 0 ||
    state.frameHeight <= 0 ||
    state.canvasWidth <= 0 ||
    state.canvasHeight <= 0 ||
    !state.caption ||
    state.captionCenterX < 0 ||
    state.captionCenterX > state.frameWidth ||
    state.captionCenterY < 0 ||
    state.captionCenterY > state.frameHeight ||
    !state.captionVisible ||
    Number(state.opacity) <= 0
  ) {
    throw new Error(`${label}: globe was not visibly ready: ${JSON.stringify(state)}`)
  }
}

async function assertHomeGlobeNav(page, label) {
  const nav = page.getByRole('link', { name: 'Return to homepage' })
  await nav.waitFor({ state: 'visible', timeout: 10_000 })

  const restingState = await nav.evaluate((element) => {
    const svg = element.querySelector('.home-globe-nav-icon')
    const sphere = element.querySelector('.home-globe-nav-sphere')
    const strokes = element.querySelectorAll('.home-globe-nav-stroke')
    const navStyle = getComputedStyle(element)
    const sphereStyle = sphere ? getComputedStyle(sphere) : null

    return {
      href: element.getAttribute('href'),
      target: element.getAttribute('target'),
      color: navStyle.color,
      svgVisible: Boolean(svg && svg.getBoundingClientRect().width > 0),
      strokeCount: strokes.length,
      animationName: sphereStyle?.animationName ?? 'none',
    }
  })

  if (
    restingState.href !== '/' ||
    restingState.target !== null ||
    restingState.color !== 'rgb(93, 105, 79)' ||
    !restingState.svgVisible ||
    restingState.strokeCount !== 6 ||
    restingState.animationName !== 'none'
  ) {
    throw new Error(
      `${label}: home globe resting state was incorrect: ${JSON.stringify(restingState)}`
    )
  }

  await nav.hover()
  await page.waitForTimeout(120)

  const animatedState = await nav.evaluate((element) => {
    const sphere = element.querySelector('.home-globe-nav-sphere')
    const stroke = element.querySelector('.home-globe-nav-stroke')
    const sphereStyle = sphere ? getComputedStyle(sphere) : null
    const strokeStyle = stroke ? getComputedStyle(stroke) : null

    return {
      sphereAnimation: sphereStyle?.animationName ?? 'none',
      sphereTransform: sphereStyle?.transform ?? 'none',
      strokeAnimation: strokeStyle?.animationName ?? 'none',
      strokeOpacity: strokeStyle?.opacity ?? '1',
    }
  })

  if (
    animatedState.sphereAnimation !== 'home-globe-turn' ||
    animatedState.sphereTransform === 'none' ||
    animatedState.strokeAnimation !== 'home-globe-draw' ||
    animatedState.strokeOpacity === '1'
  ) {
    throw new Error(
      `${label}: home globe animation did not start: ${JSON.stringify(animatedState)}`
    )
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
  page.on('response', (response) => {
    if (response.url().includes('/_next/') && response.status() >= 400) {
      fatalErrors.push(`${response.status()} loading ${response.url()}`)
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
        await page.goto(`${baseUrl}/about`, {
          waitUntil: 'domcontentloaded',
        })
        await assertHomeGlobeNav(
          page,
          `about home navigation ${viewport.name} ${viewport.width}x${viewport.height} run ${run}`
        )

        await page.goto(`${baseUrl}/blog`, {
          waitUntil: 'domcontentloaded',
        })
        await assertHomeGlobeNav(
          page,
          `blog home navigation ${viewport.name} ${viewport.width}x${viewport.height} run ${run}`
        )

        await page.goto(`${baseUrl}/memories/interlaken`, {
          waitUntil: 'domcontentloaded',
        })
        await assertHomeGlobeNav(
          page,
          `memory home navigation ${viewport.name} ${viewport.width}x${viewport.height} run ${run}`
        )
        await page.getByRole('link', { name: 'Return to homepage' }).click()
        await page.waitForURL(`${baseUrl}/`)
        if (await page.getByRole('link', { name: 'Return to homepage' }).count()) {
          throw new Error('Home globe navigation must not render on the homepage.')
        }
      })
    }
  }
} finally {
  await browser.close()
}

console.log(
  `Soft Atlas and shared home globe navigation passed ${runs * viewports.length} direct loads and ${runs * viewports.length} internal navigation checks.`
)
