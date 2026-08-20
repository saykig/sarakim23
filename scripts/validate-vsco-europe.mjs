#!/usr/bin/env node

import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { readImageMetadata, sha256 } from './memory-image-utils.mjs'

const CONTENT_ROOT = path.resolve('content/memories/europe')
const PUBLIC_ROOT = path.resolve('public/memories/europe')
const errors = []

const journal = await readJson(path.join(CONTENT_ROOT, 'index.json'))
const coordinates = await readJson(path.join(CONTENT_ROOT, 'coordinates-review.json'))
const locations = []
for (const locationSummary of journal.locations || []) {
  const location = await readJson(path.join(CONTENT_ROOT, locationSummary.slug, 'index.json'))
  locations.push(location)
}

validateJournal(journal, locations, coordinates)
const photos = locations.flatMap((location) =>
  (location.entries || []).filter((entry) => entry.type === 'photo'),
)
if (journal.photoCount !== photos.length) {
  errors.push(`Journal photoCount ${journal.photoCount} does not match ${photos.length} photo entries`)
}
const validation = await validateImages(photos)

if (errors.length > 0) {
  console.error(JSON.stringify({ valid: false, errors }, null, 2))
  process.exit(1)
}

console.log(
  JSON.stringify(
    {
      valid: true,
      locationCount: locations.length,
      locations: locations.map((location) => location.name),
      discoveredImages: journal.photoCount,
      validatedImages: photos.length,
      totalImageBytes: validation.totalBytes,
      largestImage: validation.largestImage,
      coordinatesNeedingReview: coordinates.locations.filter(
        (location) => location.lat == null || location.lng == null,
      ).length,
      orphanedImages: 0,
    },
    null,
    2,
  ),
)

function validateJournal(index, manifests, coordinatesReview) {
  if (index.schemaVersion !== 1) errors.push('Unsupported journal schemaVersion')
  if (index.sourceUrl !== 'https://vsco.co/saykig/journal/europe') errors.push('Unexpected sourceUrl')
  if (index.locationCount !== manifests.length) errors.push('Journal locationCount does not match manifests')
  if (new Set(manifests.map((location) => location.slug)).size !== manifests.length) {
    errors.push('Duplicate location slugs')
  }

  for (const [indexPosition, location] of manifests.entries()) {
    const summary = index.locations[indexPosition]
    if (location.slug !== summary.slug || location.name !== summary.name) {
      errors.push(`Location order/name mismatch at index ${indexPosition}`)
    }
    if (!Array.isArray(location.entries)) errors.push(`Missing entries array for ${location.slug}`)
    const photoCount = (location.entries || []).filter((entry) => entry.type === 'photo').length
    if (summary.originalOrder !== indexPosition + 1) {
      errors.push(`Location originalOrder mismatch for ${location.slug}`)
    }
    if (summary.entryCount !== (location.entries || []).length) {
      errors.push(`Location entryCount mismatch for ${location.slug}`)
    }
    if (summary.photoCount !== photoCount) {
      errors.push(`Location photoCount mismatch for ${location.slug}`)
    }
    if (summary.manifest !== `./${location.slug}/index.json`) {
      errors.push(`Location manifest path mismatch for ${location.slug}`)
    }
    if ('lat' in location || 'lng' in location) {
      errors.push(`Coordinates must remain in the review file until manually enriched: ${location.slug}`)
    }
  }

  const coordinateSlugs = coordinatesReview.locations?.map((location) => location.slug) || []
  if (coordinateSlugs.join('|') !== manifests.map((location) => location.slug).join('|')) {
    errors.push('Coordinate review list does not match location order')
  }
  for (const location of coordinatesReview.locations || []) {
    if (location.lat != null || location.lng != null) {
      if (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)) {
        errors.push(`Invalid reviewed coordinates for ${location.slug}`)
      }
    }
  }
}

async function validateImages(photos) {
  const orders = photos.map((photo) => photo.originalOrder)
  const expectedOrders = Array.from({ length: photos.length }, (_, index) => index + 1)
  if (orders.join('|') !== expectedOrders.join('|')) errors.push('Photo originalOrder is not contiguous')
  if (new Set(photos.map((photo) => photo.sourceAssetId)).size !== photos.length) {
    errors.push('Duplicate sourceAssetId values')
  }
  if (new Set(photos.map((photo) => photo.localPath)).size !== photos.length) {
    errors.push('Duplicate localPath values')
  }

  const referencedFiles = new Set()
  const contentHashes = new Set()
  let totalBytes = 0
  let largestImage = null

  for (const photo of photos) {
    for (const field of ['location', 'sourceJournal', 'sourceUrl', 'localPath', 'originalOrder']) {
      if (photo[field] == null) errors.push(`Photo ${photo.originalOrder} is missing ${field}`)
    }
    if (!photo.localPath.startsWith('/memories/europe/')) {
      errors.push(`Photo ${photo.originalOrder} has a non-local localPath`)
      continue
    }
    if (!photo.sourceUrl.startsWith('https://img.vsco.co/cdn-cgi/image/')) {
      errors.push(`Photo ${photo.originalOrder} has an unexpected provenance URL`)
    }

    const filePath = localPathToFile(photo.localPath)
    referencedFiles.add(filePath)
    let buffer
    try {
      buffer = await readFile(filePath)
    } catch (error) {
      errors.push(`Missing image ${photo.localPath}: ${error.message}`)
      continue
    }

    try {
      const image = readImageMetadata(buffer)
      if (image.width !== photo.width || image.height !== photo.height) {
        errors.push(`Dimension mismatch for ${photo.localPath}`)
      }
      if (image.mimeType !== photo.mimeType) errors.push(`MIME mismatch for ${photo.localPath}`)
    } catch (error) {
      errors.push(`Broken image ${photo.localPath}: ${error.message}`)
      continue
    }

    const hash = sha256(buffer)
    if (hash !== photo.sha256) errors.push(`SHA-256 mismatch for ${photo.localPath}`)
    if (buffer.length !== photo.bytes) errors.push(`Byte count mismatch for ${photo.localPath}`)
    if (contentHashes.has(hash)) errors.push(`Duplicate image content at ${photo.localPath}`)
    contentHashes.add(hash)
    totalBytes += buffer.length
    if (!largestImage || buffer.length > largestImage.bytes) {
      largestImage = { localPath: photo.localPath, bytes: buffer.length }
    }
  }

  const actualFiles = new Set(await listFiles(PUBLIC_ROOT))
  for (const filePath of actualFiles) {
    if (!referencedFiles.has(filePath)) errors.push(`Orphaned image: ${path.relative(process.cwd(), filePath)}`)
  }
  for (const filePath of referencedFiles) {
    if (!actualFiles.has(filePath)) errors.push(`Referenced image was not found: ${path.relative(process.cwd(), filePath)}`)
  }

  return { largestImage, totalBytes }
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'))
  } catch (error) {
    errors.push(`Cannot read ${path.relative(process.cwd(), filePath)}: ${error.message}`)
    return {}
  }
}

async function listFiles(directory) {
  const files = []
  let entries
  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return files
    throw error
  }
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await listFiles(entryPath)))
    else if (entry.isFile()) files.push(entryPath)
    else errors.push(`Unsupported filesystem entry under public memories: ${entryPath}`)
  }
  return files
}

function localPathToFile(localPath) {
  const resolved = path.resolve('public', localPath.replace(/^\/+/, ''))
  const publicDirectory = `${path.resolve('public')}${path.sep}`
  if (!resolved.startsWith(publicDirectory)) throw new Error(`Unsafe local path: ${localPath}`)
  return resolved
}
