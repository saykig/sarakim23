import type { Metadata } from 'next'
import Link from 'next/link'
import { AboutCopy } from '../components/about-copy'

export const metadata: Metadata = {
  title: 'A little about me',
  description: 'A little more about Sara Kim.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <article className="about-page">
      <div className="about-page-inner">
        <header className="about-page-header">
          <h1>A little about me</h1>
        </header>

        <AboutCopy />

        <footer className="about-page-footer">
          <Link href="/">Return to home</Link>
        </footer>
      </div>
    </article>
  )
}
