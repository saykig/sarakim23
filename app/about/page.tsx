import type { Metadata } from 'next'
import { MindscapePage } from '../components/mindscape-page'

export const metadata: Metadata = {
  title: 'Sara’s Mindscape',
  description: 'Notes on Sara’s life, reading, writing, and poetry.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return <MindscapePage initialSection="about" />
}
