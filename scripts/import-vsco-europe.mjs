#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { constants as fsConstants } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { chromium } from 'playwright-core'
import { readImageMetadata, sha256 } from './memory-image-utils.mjs'

const SOURCE_URL = 'https://vsco.co/saykig/journal/europe'
const SOURCE_JOURNAL = 'saykig / europe (VSCO journal)'
const SCHEMA_VERSION = 1
const IMPORTER_VERSION = 1
const DEFAULT_IMAGE_WIDTH = 2048
const DEFAULT_IMAGE_QUALITY = 90
const CONTENT_ROOT = path.resolve('content/memories/europe')
const PUBLIC_ROOT = path.resolve('public/memories/europe')

// These migration-specific labels were verified against the rendered journal. VSCO
// represents ordinary article text and geographic boundaries with the same <p>
// markup, while "louvre museum" is a <figcaption>. Keeping the reviewed labels
// explicit prevents prose such as "At the top of Europe" from becoming a fake place.
const REVIEWED_LOCATION_LABELS = [
  ['london', 'london'],
  ['mont st michel', 'mont-st-michel'],
  ['paris', 'paris'],
  ['louvre museum', 'louvre-museum'],
  ['interlaken', 'interlaken'],
  ['verona', 'verona'],
  ['venice', 'venice'],
  ['florence', 'florence'],
  ['san gimignano', 'san-gimignano'],
  ['orvieto', 'orvieto'],
  ['pompei', 'pompei'],
  ['sorrento', 'sorrento'],
  ['capri', 'capri'],
  ['rome', 'rome'],
]

const locationSlugByLabel = new Map(REVIEWED_LOCATION_LABELS)

const options = parseArguments(process.argv.slice(2))
const extraction = await extractWithRetries(options)
const model = buildContentModel(extraction, options)
const writeSummary = await writeContent(model, extraction.assets)

console.log(
  JSON.stringify(
    {
      sourceUrl: SOURCE_URL,
      extractionMethod: 'Playwright-rendered DOM and browser-captured image responses',
      imagePolicy: `${options.imageWidth}px wide, quality ${options.imageQuality}`,
      locations: model.locations.map((location) => location.name),
      locationCount: model.locations.length,
      discoveredImages: model.photoCount,
      importedImages: writeSummary.importedImages,
      writtenImages: writeSummary.writtenImages,
      reusedImages: writeSummary.reusedImages,
      importedBytes: writeSummary.importedBytes,
      contentRoot: path.relative(process.cwd(), CONTENT_ROOT),
      publicRoot: path.relative(process.cwd(), PUBLIC_ROOT),
    },
    null,
    2,
  ),
)

function parseArguments(args) {
  const parsed = {
    chromePath: process.env.VSCO_CHROME_PATH,
    headed: false,
    imageQuality: DEFAULT_IMAGE_QUALITY,
    imageWidth: DEFAULT_IMAGE_WIDTH,
    retries: 3,
  }

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--headed') parsed.headed = true
    else if (argument === '--chrome-path') parsed.chromePath = requireValue(args, ++index, argument)
    else if (argument === '--width') parsed.imageWidth = Number(requireValue(args, ++index, argument))
    else if (argument === '--quality') parsed.imageQuality = Number(requireValue(args, ++index, argument))
    else if (argument === '--retries') parsed.retries = Number(requireValue(args, ++index, argument))
    else if (argument === '--help') {
      console.log(`Usage: pnpm memories:import:europe [options]

Options:
  --headed                 Show Chrome while importing
  --chrome-path <path>     Chrome/Chromium executable (or set VSCO_CHROME_PATH)
  --width <pixels>         Stored image width (default: ${DEFAULT_IMAGE_WIDTH})
  --quality <1-100>        JPEG transform quality (default: ${DEFAULT_IMAGE_QUALITY})
  --retries <count>        Browser extraction attempts (default: 3)`)
      process.exit(0)
    } else throw new Error(`Unknown argument: ${argument}`)
  }

  if (!Number.isInteger(parsed.imageWidth) || parsed.imageWidth < 1200 || parsed.imageWidth > 3840) {
    throw new Error('--width must be an integer between 1200 and 3840')
  }
  if (!Number.isInteger(parsed.imageQuality) || parsed.imageQuality < 60 || parsed.imageQuality > 100) {
    throw new Error('--quality must be an integer between 60 and 100')
  }
  if (!Number.isInteger(parsed.retries) || parsed.retries < 1 || parsed.retries > 5) {
    throw new Error('--retries must be an integer between 1 and 5')
  }

  return parsed
}

function requireValue(args, index, flag) {
  if (!args[index]) throw new Error(`${flag} requires a value`)
  return args[index]
}

async function extractWithRetries(importOptions) {
  const failures = []
  for (let attempt = 1; attempt <= importOptions.retries; attempt += 1) {
    try {
      return await extractJournal(importOptions)
    } catch (error) {
      failures.push(`attempt ${attempt}: ${error.message}`)
      if (attempt < importOptions.retries) {
        console.warn(`VSCO extraction attempt ${attempt} failed; retrying with a fresh browser.`)
      }
    }
  }

  throw new Error(
    `VSCO could not be rendered after ${importOptions.retries} attempts. ` +
      `Try rerunning with --headed.\n${failures.join('\n')}`,
  )
}

async function extractJournal(importOptions) {
  const launchOptions = {
    headless: !importOptions.headed,
    args: ['--disable-blink-features=AutomationControlled'],
  }

  const executablePath = await resolveChromePath(importOptions.chromePath)
  if (executablePath) launchOptions.executablePath = executablePath
  else launchOptions.channel = 'chrome'

  const browser = await chromium.launch(launchOptions)
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    })
    const page = await context.newPage()
    const capturedAssets = new Map()

    await page.route('https://im.vsco.co/**', async (route) => {
      const key = assetKeyFromUrl(route.request().url())
      if (!key) return route.continue()
      return route.continue({
        url: transformedAssetUrl(key, importOptions.imageWidth, importOptions.imageQuality),
      })
    })

    page.on('response', (response) => {
      const key = assetKeyFromUrl(response.url())
      if (!key || !response.url().includes('/cdn-cgi/image/')) return
      if (capturedAssets.has(key)) return

      const promise = (async () => {
        if (!response.ok()) {
          throw new Error(`Image request failed with ${response.status()}: ${response.url()}`)
        }
        const buffer = await response.body()
        const image = readImageMetadata(buffer)
        return {
          ...image,
          buffer,
          bytes: buffer.length,
          sha256: sha256(buffer),
          sourceUrl: response.url(),
        }
      })()
      capturedAssets.set(key, promise)
    })

    let navigationError
    try {
      await page.goto(SOURCE_URL, { waitUntil: 'domcontentloaded', timeout: 90_000 })
    } catch (error) {
      navigationError = error
    }

    await page.waitForTimeout(1_000)
    const title = await page.title()
    if (/attention required|cloudflare|just a moment/i.test(title)) {
      throw new Error(`Cloudflare challenge page was shown (${title})`)
    }

    try {
      await page.locator('main h1').waitFor({ state: 'visible', timeout: 45_000 })
      await page.locator('main figure img').first().waitFor({ state: 'attached', timeout: 45_000 })
    } catch (error) {
      if (navigationError) throw navigationError
      throw error
    }

    await waitForStableFigureCount(page)
    const dom = await readJournalDom(page)
    if (dom.items.filter((item) => item.kind === 'figure').length === 0) {
      throw new Error('Rendered journal contained no figure images')
    }

    const expectedKeys = dom.items
      .filter((item) => item.kind === 'figure')
      .map((item) => assetKeyFromUrl(item.image.sourceUrl))
    if (expectedKeys.some((key) => !key)) throw new Error('One or more journal images had an unknown URL shape')

    await loadAllJournalImages(page, expectedKeys, capturedAssets)

    const assets = new Map()
    for (const key of expectedKeys) {
      const assetPromise = capturedAssets.get(key)
      if (!assetPromise) throw new Error(`Browser did not request journal image ${key}`)
      assets.set(key, await assetPromise)
    }

    return { assets, dom }
  } finally {
    await browser.close()
  }
}

async function waitForStableFigureCount(page) {
  let previousCount = -1
  let stableRounds = 0
  for (let round = 0; round < 20; round += 1) {
    const count = await page.locator('main figure img').count()
    stableRounds = count === previousCount ? stableRounds + 1 : 0
    if (count > 0 && stableRounds >= 3) return
    previousCount = count
    await page.waitForTimeout(400)
  }
  throw new Error('Journal figure count did not stabilize')
}

async function loadAllJournalImages(page, expectedKeys, capturedAssets) {
  await page.evaluate(() => window.scrollTo(0, 0))
  const images = page.locator('main figure img')

  for (let index = 0; index < expectedKeys.length; index += 1) {
    if (!capturedAssets.has(expectedKeys[index])) {
      await images.nth(index).evaluate((image) => image.scrollIntoView({ block: 'center' }))
      await page.waitForTimeout(120)
    }
  }

  for (let round = 0; round < 40; round += 1) {
    const missing = expectedKeys.filter((key) => !capturedAssets.has(key))
    if (missing.length === 0) return
    await page.evaluate(() => window.scrollBy(0, Math.max(700, window.innerHeight * 0.8)))
    await page.waitForTimeout(250)
  }

  const missing = expectedKeys.filter((key) => !capturedAssets.has(key))
  throw new Error(`Browser did not load ${missing.length} journal images: ${missing.join(', ')}`)
}

async function readJournalDom(page) {
  return page.evaluate(() => {
    const parseSrcset = (srcset) => {
      if (!srcset) return []
      return srcset
        .split(',')
        .map((candidate) => candidate.trim().match(/^(.*)\s+(\d+)w$/))
        .filter(Boolean)
        .map((match) => ({ url: match[1], width: Number(match[2]) }))
    }

    const elements = Array.from(document.querySelectorAll('main p, main figure'))
    const items = elements.map((element, documentOrder) => {
      if (element.tagName === 'P') {
        return { kind: 'text', documentOrder, text: element.textContent?.trim() || '' }
      }

      const image = element.querySelector('img')
      if (!image) return { kind: 'ignored', documentOrder }

      const candidates = []
      const seen = new Set()
      const addCandidate = (url, width = null) => {
        if (!url || seen.has(url)) return
        seen.add(url)
        candidates.push({ url, width })
      }

      for (const source of element.querySelectorAll('source')) {
        for (const candidate of parseSrcset(source.getAttribute('srcset'))) {
          addCandidate(candidate.url, candidate.width)
        }
      }
      for (const candidate of parseSrcset(image.getAttribute('srcset'))) {
        addCandidate(candidate.url, candidate.width)
      }
      addCandidate(image.currentSrc)
      addCandidate(image.getAttribute('src'))
      addCandidate(image.getAttribute('data-src'))

      candidates.sort((left, right) => (right.width || 0) - (left.width || 0))
      const sourceUrl = candidates[0]?.url
      return {
        kind: 'figure',
        documentOrder,
        caption: element.querySelector('figcaption')?.textContent?.trim() || null,
        image: {
          sourceUrl,
          sourceCandidates: candidates,
          sourceAlt: image.getAttribute('alt') || null,
        },
      }
    })

    const articleDateText = document.querySelector('main [class*="articleDate"]')?.textContent?.trim() || null
    const subtitle = document.querySelector('main h1')?.parentElement?.querySelector('div')?.textContent?.trim() || null
    return {
      title: document.querySelector('main h1')?.textContent?.trim() || null,
      articleDateText,
      subtitle,
      items: items.filter((item) => item.kind !== 'ignored'),
    }
  })
}

function buildContentModel(extractionResult, importOptions) {
  const { dom } = extractionResult
  const locations = []
  const locationsBySlug = new Map()
  const foundLabels = new Set()
  const usedAssetKeys = new Set()
  let currentLocation
  let photoOrder = 0

  const startLocation = (label, boundaryKind, documentOrder) => {
    const normalized = normalizeLabel(label)
    const slug = locationSlugByLabel.get(normalized)
    if (!slug) return false
    if (foundLabels.has(normalized)) throw new Error(`Duplicate location boundary: ${label}`)

    currentLocation = {
      schemaVersion: SCHEMA_VERSION,
      slug,
      name: label,
      sourceHeading: { text: label, kind: boundaryKind, documentOrder },
      entries: [],
    }
    foundLabels.add(normalized)
    locations.push(currentLocation)
    locationsBySlug.set(slug, currentLocation)
    return true
  }

  for (const item of dom.items) {
    if (item.kind === 'text') {
      if (startLocation(item.text, 'paragraph', item.documentOrder)) continue
      if (!item.text) continue
      if (!currentLocation) throw new Error(`Text appeared before the first location: ${item.text}`)
      currentLocation.entries.push({
        type: 'prose',
        text: item.text,
        sourceJournal: SOURCE_JOURNAL,
        sourceUrl: SOURCE_URL,
        originalDocumentOrder: item.documentOrder,
      })
      continue
    }

    let caption = item.caption
    if (caption && startLocation(caption, 'figcaption', item.documentOrder)) caption = null
    if (!currentLocation) throw new Error(`Image appeared before the first location at document order ${item.documentOrder}`)

    const assetKey = assetKeyFromUrl(item.image.sourceUrl)
    if (!assetKey) throw new Error(`Cannot identify VSCO image: ${item.image.sourceUrl}`)
    if (usedAssetKeys.has(assetKey)) throw new Error(`Duplicate journal image asset: ${assetKey}`)
    usedAssetKeys.add(assetKey)

    const asset = extractionResult.assets.get(assetKey)
    if (!asset) throw new Error(`No downloaded response for ${assetKey}`)
    photoOrder += 1
    const sourceAssetId = assetKey.split('/').at(-2)
    const fileName = `${String(photoOrder).padStart(3, '0')}-${sourceAssetId}.jpg`
    const localPath = `/memories/europe/${currentLocation.slug}/${fileName}`
    const sourceAlt = item.image.sourceAlt
    const locationPhotoOrder = currentLocation.entries.filter((entry) => entry.type === 'photo').length + 1

    const photo = {
      type: 'photo',
      location: currentLocation.name,
      sourceJournal: SOURCE_JOURNAL,
      sourceUrl: transformedAssetUrl(assetKey, importOptions.imageWidth, importOptions.imageQuality),
      sourceJournalUrl: SOURCE_URL,
      sourceOriginalUrl: item.image.sourceUrl,
      sourceAssetId,
      sourceCandidates: item.image.sourceCandidates,
      localPath,
      originalOrder: photoOrder,
      locationOrder: locationPhotoOrder,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType,
      bytes: asset.bytes,
      sha256: asset.sha256,
    }
    if (caption) photo.caption = caption
    if (sourceAlt && !/^user-image-/i.test(sourceAlt)) photo.alt = sourceAlt
    currentLocation.entries.push(photo)
  }

  const missingLocations = REVIEWED_LOCATION_LABELS.filter(([label]) => !foundLabels.has(label)).map(
    ([label]) => label,
  )
  if (missingLocations.length > 0) {
    throw new Error(`Reviewed location boundaries missing from the rendered page: ${missingLocations.join(', ')}`)
  }

  const sourcePublishedDate = parseSourceDate(dom.articleDateText)
  return {
    schemaVersion: SCHEMA_VERSION,
    slug: 'europe',
    title: dom.title,
    sourceJournal: SOURCE_JOURNAL,
    sourceUrl: SOURCE_URL,
    sourcePublishedDate,
    sourceDateLabel: dom.subtitle,
    importer: {
      name: 'scripts/import-vsco-europe.mjs',
      version: IMPORTER_VERSION,
      extractionMethod: 'Playwright-rendered DOM and browser-captured image responses',
      imagePolicy: { width: importOptions.imageWidth, quality: importOptions.imageQuality },
    },
    locationCount: locations.length,
    photoCount: photoOrder,
    locations,
  }
}

async function writeContent(model, assets) {
  await mkdir(CONTENT_ROOT, { recursive: true })
  await mkdir(PUBLIC_ROOT, { recursive: true })

  let writtenImages = 0
  let reusedImages = 0
  let importedBytes = 0

  for (const location of model.locations) {
    await mkdir(path.join(CONTENT_ROOT, location.slug), { recursive: true })
    await mkdir(path.join(PUBLIC_ROOT, location.slug), { recursive: true })

    for (const entry of location.entries.filter((candidate) => candidate.type === 'photo')) {
      const assetKey = assetKeyFromUrl(entry.sourceOriginalUrl)
      const asset = assets.get(assetKey)
      const outputPath = localPathToFile(entry.localPath)
      importedBytes += asset.bytes

      let existing
      try {
        existing = await readFile(outputPath)
      } catch (error) {
        if (error.code !== 'ENOENT') throw error
      }

      if (existing && sha256(existing) === asset.sha256) reusedImages += 1
      else {
        await writeFile(outputPath, asset.buffer)
        writtenImages += 1
      }
    }

    await writeJsonIfChanged(path.join(CONTENT_ROOT, location.slug, 'index.json'), location)
  }

  const journalIndex = {
    schemaVersion: model.schemaVersion,
    slug: model.slug,
    title: model.title,
    sourceJournal: model.sourceJournal,
    sourceUrl: model.sourceUrl,
    sourcePublishedDate: model.sourcePublishedDate,
    sourceDateLabel: model.sourceDateLabel,
    importer: model.importer,
    locationCount: model.locationCount,
    photoCount: model.photoCount,
    locations: model.locations.map((location, index) => ({
      slug: location.slug,
      name: location.name,
      originalOrder: index + 1,
      entryCount: location.entries.length,
      photoCount: location.entries.filter((entry) => entry.type === 'photo').length,
      manifest: `./${location.slug}/index.json`,
    })),
  }
  await writeJsonIfChanged(path.join(CONTENT_ROOT, 'index.json'), journalIndex)

  const coordinatesReview = {
    schemaVersion: SCHEMA_VERSION,
    sourceUrl: SOURCE_URL,
    note: 'Coordinates are absent from the source journal and require manual review.',
    locations: model.locations.map((location) => ({
      slug: location.slug,
      name: location.name,
      lat: null,
      lng: null,
      status: 'needs-review',
    })),
  }
  await writeJsonIfChanged(path.join(CONTENT_ROOT, 'coordinates-review.json'), coordinatesReview)

  return {
    importedImages: model.photoCount,
    writtenImages,
    reusedImages,
    importedBytes,
  }
}

async function writeJsonIfChanged(filePath, value) {
  const serialized = `${JSON.stringify(value, null, 2)}\n`
  let existing
  try {
    existing = await readFile(filePath, 'utf8')
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  if (existing !== serialized) await writeFile(filePath, serialized)
}

function localPathToFile(localPath) {
  const relative = localPath.replace(/^\/+/, '')
  const resolved = path.resolve('public', relative)
  const publicDirectory = `${path.resolve('public')}${path.sep}`
  if (!resolved.startsWith(publicDirectory)) throw new Error(`Unsafe local path: ${localPath}`)
  return resolved
}

function normalizeLabel(value) {
  return value.trim().toLocaleLowerCase('en-US').replace(/\s+/g, ' ')
}

function assetKeyFromUrl(value) {
  if (!value) return null
  const url = new URL(value)
  let pathname = decodeURIComponent(url.pathname)
  pathname = pathname.replace(/^\/aws-us-west-2\//, '/')
  pathname = pathname.replace(/^\/cdn-cgi\/image\/[^/]+\//, '/')
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length < 4 || !/\.(jpe?g|png)$/i.test(parts.at(-1))) return null
  return parts.join('/')
}

function transformedAssetUrl(assetKey, width, quality) {
  return `https://img.vsco.co/cdn-cgi/image/width=${width},quality=${quality}/${assetKey}`
}

function parseSourceDate(value) {
  if (!value) return null
  const parsed = new Date(`${value} 00:00:00 UTC`)
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString().slice(0, 10)
}

async function resolveChromePath(configuredPath) {
  if (configuredPath) {
    await access(configuredPath, fsConstants.X_OK)
    return configuredPath
  }

  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ]
  for (const candidate of candidates) {
    try {
      await access(candidate, fsConstants.X_OK)
      return candidate
    } catch {}
  }
  return null
}
