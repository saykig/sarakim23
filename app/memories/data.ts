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

export type MemoryEntry = MemoryPhoto | MemoryEphemera

export type MemoryPage = {
  slug: string
  name: string
  dateLabel?: string
  sourceJournal: string
  sourceUrl: string
  entries: MemoryEntry[]
}

type ImportedPhoto = Omit<
  MemoryPhoto,
  'id' | 'layout' | 'parallax'
> & { sourceAssetId: string }

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
  entries: Array<ImportedPhoto | ImportedProse>
}

type PresentationEntry = {
  layout: string
  parallax?: number
  noteType?: EphemeraType
  relatedPhoto?: string
}

type Presentation = {
  published: boolean
  presentation: Record<string, PresentationEntry>
}

type ImportedCollection = {
  sourceDateLabel?: string
}

const publishedMemories = ['interlaken'] as const

export function getPublishedMemorySlugs() {
  return [...publishedMemories]
}

export const getMemory = cache(async (slug: string): Promise<MemoryPage | null> => {
  if (!publishedMemories.includes(slug as (typeof publishedMemories)[number])) {
    return null
  }

  const directory = path.join(
    process.cwd(),
    'content',
    'memories',
    'europe',
    slug
  )
  const [collectionText, sourceText, pageText] = await Promise.all([
    readFile(path.join(directory, '..', 'index.json'), 'utf8'),
    readFile(path.join(directory, 'index.json'), 'utf8'),
    readFile(path.join(directory, 'page.json'), 'utf8'),
  ])
  const collection = JSON.parse(collectionText) as ImportedCollection
  const source = JSON.parse(sourceText) as ImportedLocation
  const page = JSON.parse(pageText) as Presentation

  if (!page.published) return null

  const entries = source.entries.map<MemoryEntry>((entry) => {
    if (entry.type === 'photo') {
      const presentation = page.presentation[entry.sourceAssetId]
      return {
        ...entry,
        id: entry.sourceAssetId,
        layout: presentation?.layout ?? 'center',
        parallax: presentation?.parallax ?? 0,
      }
    }

    const id = `prose:${entry.originalDocumentOrder}`
    const presentation = page.presentation[id]
    return {
      type: 'ephemera',
      id,
      noteType: presentation?.noteType ?? 'prose',
      text: entry.text,
      sourceJournal: entry.sourceJournal,
      sourceUrl: entry.sourceUrl,
      originalOrder: entry.originalDocumentOrder,
      relatedPhoto: presentation?.relatedPhoto,
      layout: presentation?.layout ?? 'note',
    }
  })

  const firstEntry = entries.find(
    (entry): entry is MemoryPhoto => entry.type === 'photo'
  )

  return {
    slug: source.slug,
    name: source.name,
    dateLabel: collection.sourceDateLabel,
    sourceJournal: firstEntry?.sourceJournal ?? '',
    sourceUrl: firstEntry?.sourceUrl ?? '',
    entries,
  }
})
