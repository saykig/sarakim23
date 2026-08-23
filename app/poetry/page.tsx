import type { Metadata } from 'next'
import { IM_Fell_English, Libre_Baskerville } from 'next/font/google'
import { HomeGlobeNav } from '@/app/components/home-globe-nav'
import { PoetryReadingRoom } from '@/app/components/poetry-reading-room'
import { poems } from '@/app/data/poems'

const poetryDisplay = IM_Fell_English({
  subsets: ['latin'],
  weight: '400',
  style: 'normal',
  variable: '--font-poetry-display',
  display: 'swap',
})

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
}

export default function PoetryPage() {
  return (
    <article
      className={`poetry-page ${poetryDisplay.variable} ${poetrySerif.variable}`}
    >
      <div className="poetry-page-inner">
        <header className="poetry-page-header">
          <h1>Poetry</h1>
          <HomeGlobeNav className="poetry-home-globe-nav" />
        </header>

        <PoetryReadingRoom poems={poems} />
      </div>
    </article>
  )
}
