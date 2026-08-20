import { cache } from 'react'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

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

export type MemoryEntry = MemoryPhoto | MemoryEphemera | MemorySection

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
  entries: Array<ImportedPhoto | ImportedProse>
}

type ImportedCollectionLocation = {
  slug: string
  manifest: string
  photoCount: number
}

type ImportedCollection = {
  sourceDateLabel?: string
  locations: ImportedCollectionLocation[]
}

type PresentationEntry = {
  layout: string
  parallax?: number
  noteType?: EphemeraType
  relatedPhoto?: string
}

type Presentation = {
  presentation: Record<string, PresentationEntry>
}

type MemoryDestination = {
  slug: string
  name: string
  sources: ImportedLocation[]
}

const contentDirectory = path.join(
  process.cwd(),
  'content',
  'memories',
  'europe'
)
const defaultLayouts = [
  'opening',
  'left',
  'right-narrow',
  'left-narrow',
  'right-wide',
] as const
const defaultParallax = [4, 7, 5, 6, 4] as const

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
  const collection = await readJson<ImportedCollection>(
    path.join(contentDirectory, 'index.json')
  )
  const sources = await Promise.all(
    collection.locations
      .filter((location) => location.photoCount > 0)
      .map((location) =>
        readJson<ImportedLocation>(
          path.join(contentDirectory, location.manifest)
        )
      )
  )

  const destinations: MemoryDestination[] = []
  for (const source of sources) {
    const startsDestination =
      source.sourceHeading.kind === 'paragraph' || destinations.length === 0

    if (startsDestination) {
      destinations.push({
        slug: source.slug,
        name: source.name,
        sources: [source],
      })
    } else {
      destinations.at(-1)?.sources.push(source)
    }
  }

  return { collection, destinations }
})

export async function getPublishedMemorySlugs() {
  const { destinations } = await getMemoryCatalog()
  return destinations.map((destination) => destination.slug)
}

export const getMemory = cache(
  async (slug: string): Promise<MemoryPage | null> => {
    const { collection, destinations } = await getMemoryCatalog()
    const destination = destinations.find((candidate) => candidate.slug === slug)
    if (!destination) return null

    const page = await readOptionalJson<Presentation>(
      path.join(contentDirectory, destination.slug, 'page.json')
    )
    const presentation = page?.presentation ?? {}
    const entries: MemoryEntry[] = []
    let photoIndex = 0

    for (
      let sourceIndex = 0;
      sourceIndex < destination.sources.length;
      sourceIndex += 1
    ) {
      const source = destination.sources[sourceIndex]
      if (sourceIndex > 0) {
        entries.push({
          type: 'section',
          id: `section:${source.slug}`,
          name: source.name,
        })
      }

      for (const entry of source.entries) {
        if (entry.type === 'photo') {
          const override = presentation[entry.sourceAssetId]
          const defaultIndex = photoIndex % defaultLayouts.length
          entries.push({
            ...entry,
            id: entry.sourceAssetId,
            layout: override?.layout ?? defaultLayouts[defaultIndex],
            parallax: override?.parallax ?? defaultParallax[defaultIndex],
          })
          photoIndex += 1
          continue
        }

        const id = `prose:${entry.originalDocumentOrder}`
        const override = presentation[id]
        entries.push({
          type: 'ephemera',
          id,
          noteType: override?.noteType ?? 'prose',
          text: entry.text,
          sourceJournal: entry.sourceJournal,
          sourceUrl: entry.sourceUrl,
          originalOrder: entry.originalDocumentOrder,
          relatedPhoto: override?.relatedPhoto,
          layout: override?.layout ?? 'note',
        })
      }
    }

    const firstPhoto = entries.find(
      (entry): entry is MemoryPhoto => entry.type === 'photo'
    )

    return {
      slug: destination.slug,
      name: destination.name,
      dateLabel: collection.sourceDateLabel,
      sourceJournal: firstPhoto?.sourceJournal ?? '',
      sourceUrl: firstPhoto?.sourceUrl ?? '',
      entries,
    }
  }
)
