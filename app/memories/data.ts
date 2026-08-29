import { cache } from 'react'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { groupedMemoryDestinations } from './destinations'

export type EphemeraType =
  | 'poem'
  | 'memo'
  | 'quotation'
  | 'date'
  | 'prose'
  | 'caption'

export type MemoryPhoto = {
  type: 'photo'
  id: string
  location: string
  sourceJournal: string
  sourceUrl: string
  localPath: string
  originalOrder: number
  locationOrder: number
  caption?: string
  alt?: string
  width: number
  height: number
  layout: string
  parallax: number
  crop?: {
    aspectRatio: number
    objectPosition: string
  }
}

export type MemoryVideo = {
  type: 'video'
  id: string
  location: string
  sourceJournal: string
  sourceUrl: string
  localPath: string
  poster?: string
  originalOrder: number
  locationOrder: number
  caption?: string
  ariaLabel?: string
  width: number
  height: number
  layout: string
  parallax: number
}

export type MemoryEphemera = {
  type: 'ephemera'
  id: string
  noteType: EphemeraType
  text: string
  sourceJournal: string
  sourceUrl: string
  originalOrder: number
  relatedPhoto?: string
  layout: string
}

export type MemorySection = {
  type: 'section'
  id: string
  name: string
}

export type MemoryEntry =
  | MemoryPhoto
  | MemoryVideo
  | MemoryEphemera
  | MemorySection

export type MemoryPage = {
  slug: string
  name: string
  dateLabel?: string
  sourceJournal: string
  sourceUrl: string
  entries: MemoryEntry[]
}

type ImportedPhoto = Omit<MemoryPhoto, 'id' | 'layout' | 'parallax'> & {
  sourceAssetId: string
}

type ImportedVideo = Omit<MemoryVideo, 'id' | 'layout' | 'parallax'> & {
  sourceAssetId: string
}

type ImportedSection = {
  type: 'section'
  id: string
  name: string
  originalDocumentOrder: number
}

type ImportedProse = {
  type: 'prose'
  text: string
  sourceJournal: string
  sourceUrl: string
  originalDocumentOrder: number
}

type ImportedLocation = {
  slug: string
  name: string
  sourceHeading: {
    text: string
    kind: string
    documentOrder: number
  }
  entries: Array<ImportedPhoto | ImportedVideo | ImportedProse | ImportedSection>
}

type ImportedCollectionLocation = {
  slug: string
  manifest: string
  photoCount: number
  videoCount?: number
}

type ImportedCollection = {
  sourceDateLabel?: string
  locations: ImportedCollectionLocation[]
}

type PresentationEntry = {
  layout?: string
  parallax?: number
  noteType?: EphemeraType
  relatedPhoto?: string
  localPath?: string
  width?: number
  height?: number
  alt?: string
  crop?: {
    aspectRatio: number
    objectPosition: string
  }
}

type Presentation = {
  excludedPhotos?: string[]
  photoOrder?: string[]
  presentation: Record<string, PresentationEntry>
}

type MemoryDestination = {
  slug: string
  name: string
  dateLabel?: string
  sectionEverySource?: boolean
  sources: Array<{
    content: ImportedLocation
    presentationDirectory: string
  }>
}

const memoriesDirectory = path.join(process.cwd(), 'content', 'memories')
const collectionDirectories = ['europe', 'asia'] as const
const defaultLayouts = [
  'opening',
  'left',
  'right-narrow',
  'left-narrow',
  'right-wide',
] as const
const defaultParallax = [4, 7, 5, 6, 4] as const
const importedDisplayOverrides: Readonly<Record<string, string>> = {
  florence: 'Florence',
  'louvre museum': 'Louvre Museum',
  'sistine chapel': 'Sistine Chapel',
  'the colosseum': 'The Colosseum',
}

function formatImportedDisplayText(value: string) {
  return (
    importedDisplayOverrides[value.toLowerCase()] ??
    value.replace(/^\p{Ll}/u, (letter) => letter.toUpperCase())
  )
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, 'utf8')) as T
}

async function readOptionalJson<T>(filePath: string): Promise<T | null> {
  try {
    return await readJson<T>(filePath)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}

const getMemoryCatalog = cache(async () => {
  const destinations: MemoryDestination[] = []

  for (const collectionDirectory of collectionDirectories) {
    const directory = path.join(memoriesDirectory, collectionDirectory)
    const collection = await readJson<ImportedCollection>(
      path.join(directory, 'index.json')
    )
    const sources = await Promise.all(
      collection.locations
        .filter(
          (location) => location.photoCount > 0 || (location.videoCount ?? 0) > 0
        )
        .map((location) =>
          readJson<ImportedLocation>(
            path.join(directory, location.manifest)
          )
        )
    )
    const sourcesBySlug = new Map(sources.map((source) => [source.slug, source]))
    const collectionGroups = groupedMemoryDestinations.filter(
      (group) => group.collection === collectionDirectory
    )
    const groupedSourceSlugs = new Set<string>(
      collectionGroups.flatMap((group) => [...group.sourceSlugs])
    )

    const collectionDestinations: MemoryDestination[] = []
    for (const source of sources) {
      const group = collectionGroups.find(
        (candidate) => candidate.sourceSlugs[0] === source.slug
      )
      if (group) {
        collectionDestinations.push({
          slug: group.slug,
          name: group.name,
          dateLabel: collection.sourceDateLabel,
          sectionEverySource: group.sectionEverySource,
          sources: group.sourceSlugs.map((sourceSlug) => {
            const groupedSource = sourcesBySlug.get(sourceSlug)
            if (!groupedSource) {
              throw new Error(
                `Missing ${sourceSlug} source for ${group.slug} memory`
              )
            }
            return {
              content: groupedSource,
              presentationDirectory: path.join(directory, sourceSlug),
            }
          }),
        })
        continue
      }
      if (groupedSourceSlugs.has(source.slug)) continue

      const startsDestination =
        source.sourceHeading.kind === 'paragraph' ||
        collectionDestinations.length === 0

      if (startsDestination) {
        collectionDestinations.push({
          slug: source.slug,
          name: formatImportedDisplayText(source.name),
          dateLabel: collection.sourceDateLabel,
          sources: [
            {
              content: source,
              presentationDirectory: path.join(directory, source.slug),
            },
          ],
        })
      } else {
        collectionDestinations.at(-1)?.sources.push({
          content: source,
          presentationDirectory: path.join(directory, source.slug),
        })
      }
    }

    destinations.push(...collectionDestinations)
  }

  return destinations
})

export async function getPublishedMemorySlugs() {
  const destinations = await getMemoryCatalog()
  return destinations.map((destination) => destination.slug)
}

export const getMemory = cache(
  async (slug: string): Promise<MemoryPage | null> => {
    const destinations = await getMemoryCatalog()
    const destination = destinations.find((candidate) => candidate.slug === slug)
    if (!destination) return null

    const entries: MemoryEntry[] = []
    let photoIndex = 0

    for (
      let sourceIndex = 0;
      sourceIndex < destination.sources.length;
      sourceIndex += 1
    ) {
      const destinationSource = destination.sources[sourceIndex]
      const source = destinationSource.content
      const page = await readOptionalJson<Presentation>(
        path.join(destinationSource.presentationDirectory, 'page.json')
      )
      const presentation = page?.presentation ?? {}
      const excludedPhotos = new Set(page?.excludedPhotos ?? [])
      const requestedPhotoOrder = page?.photoOrder ?? []

      if (sourceIndex > 0 || destination.sectionEverySource) {
        entries.push({
          type: 'section',
          id: `section:${source.slug}`,
          name: formatImportedDisplayText(source.name),
        })
      }

      const orderedPhotos = requestedPhotoOrder
        .map((id) =>
          source.entries.find(
            (entry): entry is ImportedPhoto =>
              entry.type === 'photo' && entry.sourceAssetId === id
          )
        )
        .filter((entry): entry is ImportedPhoto => Boolean(entry))
      const orderedPhotoIds = new Set(
        orderedPhotos.map((entry) => entry.sourceAssetId)
      )
      const sourceEntries = [
        ...orderedPhotos,
        ...source.entries.filter(
          (entry) =>
            entry.type !== 'photo' || !orderedPhotoIds.has(entry.sourceAssetId)
        ),
      ]

      for (const entry of sourceEntries) {
        if (entry.type === 'photo') {
          if (excludedPhotos.has(entry.sourceAssetId)) continue

          const override = presentation[entry.sourceAssetId]
          const defaultIndex = photoIndex % defaultLayouts.length
          entries.push({
            ...entry,
            id: entry.sourceAssetId,
            localPath: override?.localPath ?? entry.localPath,
            width: override?.width ?? entry.width,
            height: override?.height ?? entry.height,
            alt: override?.alt ?? entry.alt,
            caption: entry.caption
              ? formatImportedDisplayText(entry.caption)
              : undefined,
            layout: override?.layout ?? defaultLayouts[defaultIndex],
            parallax: override?.parallax ?? defaultParallax[defaultIndex],
            crop: override?.crop,
          })
          photoIndex += 1
          continue
        }

        if (entry.type === 'video') {
          const override = presentation[entry.sourceAssetId]
          const defaultIndex = photoIndex % defaultLayouts.length
          entries.push({
            ...entry,
            id: entry.sourceAssetId,
            caption: entry.caption
              ? formatImportedDisplayText(entry.caption)
              : undefined,
            layout: override?.layout ?? defaultLayouts[defaultIndex],
            parallax: override?.parallax ?? defaultParallax[defaultIndex],
          })
          photoIndex += 1
          continue
        }

        if (entry.type === 'section') {
          entries.push({
            type: 'section',
            id: entry.id,
            name: formatImportedDisplayText(entry.name),
          })
          continue
        }

        const id = `prose:${entry.originalDocumentOrder}`
        const override = presentation[id]
        entries.push({
          type: 'ephemera',
          id,
          noteType: override?.noteType ?? 'prose',
          text: formatImportedDisplayText(entry.text),
          sourceJournal: entry.sourceJournal,
          sourceUrl: entry.sourceUrl,
          originalOrder: entry.originalDocumentOrder,
          relatedPhoto: override?.relatedPhoto,
          layout: override?.layout ?? 'note',
        })
      }
    }

    for (const note of entries.filter(
      (entry): entry is MemoryEphemera =>
        entry.type === 'ephemera' && Boolean(entry.relatedPhoto)
    )) {
      const noteIndex = entries.findIndex((entry) => entry.id === note.id)
      if (noteIndex < 0) continue
      entries.splice(noteIndex, 1)

      const photoIndex = entries.findIndex(
        (entry) => entry.type === 'photo' && entry.id === note.relatedPhoto
      )
      if (photoIndex < 0) {
        entries.splice(noteIndex, 0, note)
        continue
      }
      entries.splice(photoIndex + 1, 0, note)
    }

    const firstMedia = entries.find(
      (entry): entry is MemoryPhoto | MemoryVideo =>
        entry.type === 'photo' || entry.type === 'video'
    )

    return {
      slug: destination.slug,
      name: destination.name,
      dateLabel: destination.dateLabel,
      sourceJournal: firstMedia?.sourceJournal ?? '',
      sourceUrl: firstMedia?.sourceUrl ?? '',
      entries,
    }
  }
)
