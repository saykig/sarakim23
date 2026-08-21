import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MemoryExperience } from '../../components/memories/memory-experience'
import { getMemory, getPublishedMemorySlugs } from '../data'

/*
THESIS: A place-memory unfolds like photographs and a note set down across a long paper table.
OWN-WORLD: Soft Atlas — paper green, sage ink, editorial images, and restrained archival marks.
STORY: Name the place, enter one image, encounter paired fragments and a source-backed note, then return to the atlas.
FIRST VIEWPORT: A quiet atlas return, INTERLAKEN in serif, the 2019–20 date, and the first photograph entering below the fold.
FORM: A finite native-scroll scrapbook with unequal widths, staggered pairs, calm parallax, and a focused Flip image view.
*/

type MemoryPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return (await getPublishedMemorySlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: MemoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const memory = await getMemory(slug)
  if (!memory) return {}

  return {
    title: `${memory.name} memory`,
    description: `A photographic memory from ${memory.name}, ${memory.dateLabel ?? ''}.`.trim(),
    alternates: { canonical: `/memories/${memory.slug}` },
  }
}

export default async function MemoryPage({ params }: MemoryPageProps) {
  const { slug } = await params
  const memory = await getMemory(slug)
  if (!memory) notFound()

  return (
    <article className="memory-page">
      <header className="memory-header">
        <Link
          href="/"
          className="memory-back-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span aria-hidden="true">←</span> atlas
        </Link>
        <div className="memory-heading">
          <p className="memory-heading-kicker">place memory</p>
          <h1>{memory.name}</h1>
          {memory.dateLabel ? (
            <p className="memory-heading-date">{memory.dateLabel}</p>
          ) : null}
        </div>
        <p className="memory-scroll-cue" aria-hidden="true">
          scroll to unfold
        </p>
      </header>

      <MemoryExperience location={memory.name} entries={memory.entries} />

      <footer className="memory-footer">
        <Link href="/" target="_blank" rel="noopener noreferrer">
          return to the atlas <span aria-hidden="true">↗</span>
        </Link>
      </footer>
    </article>
  )
}
