import type { Metadata } from 'next'
import { Libre_Baskerville } from 'next/font/google'
import { MindscapePage } from '@/app/components/mindscape-page'
import { PoetryReadingRoom } from '@/app/components/poetry-reading-room'
import { poems } from '@/app/data/poems'

const poetrySerif = Libre_Baskerville({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-poetry-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Poetry',
  description: 'A continuous reading room for poetry by Sara Kim.',
  alternates: { canonical: '/poetry' },
}

export default function PoetryPage() {
  return (
    <MindscapePage
      initialSection="poetry"
      className={poetrySerif.variable}
      poetryContent={<PoetryReadingRoom poems={poems} />}
    />
  )
}
