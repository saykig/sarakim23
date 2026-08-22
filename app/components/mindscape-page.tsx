'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AboutCopy } from './about-copy'
import { HomeGlobeNav } from './home-globe-nav'

const mindscapeSections = [
  { id: 'about', label: 'About Me' },
  { id: 'reading', label: 'Reading' },
  { id: 'writing', label: 'Writing' },
  { id: 'poetry', label: 'Poetry' },
  { id: 'life', label: 'Life' },
] as const

type MindscapeSectionId = (typeof mindscapeSections)[number]['id']

function isMindscapeSection(value: string): value is MindscapeSectionId {
  return mindscapeSections.some((section) => section.id === value)
}

export function MindscapePage() {
  const [activeSection, setActiveSection] =
    useState<MindscapeSectionId>('about')

  useEffect(() => {
    let frame = 0

    const updateActiveSection = () => {
      frame = 0
      const pageBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 4

      if (pageBottom) {
        setActiveSection('life')
        return
      }

      const readingLine = Math.max(120, window.innerHeight * 0.28)
      let nextSection: MindscapeSectionId = 'about'

      for (const section of mindscapeSections) {
        const element = document.getElementById(section.id)
        if (element && element.getBoundingClientRect().top <= readingLine) {
          nextSection = section.id
        }
      }

      setActiveSection(nextSection)
    }

    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveSection)
    }

    updateActiveSection()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  const scrollToSection = (value: string) => {
    if (!isMindscapeSection(value)) return

    const section = document.getElementById(value)
    if (!section) return

    setActiveSection(value)
    window.history.replaceState(null, '', `#${value}`)
    section.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    })
  }

  return (
    <article className="about-page mindscape-page">
      <div className="about-page-inner mindscape-page-inner">
        <header className="about-page-header mindscape-page-header">
          <h1>Sara’s Mindscape</h1>
          <HomeGlobeNav />
        </header>

        <div className="mindscape-layout">
          <aside className="mindscape-index" aria-label="Mindscape index">
            <Tabs
              value={activeSection}
              onValueChange={scrollToSection}
              orientation="vertical"
              activationMode="automatic"
              className="mindscape-tabs"
            >
              <TabsList className="mindscape-tabs-list">
                {mindscapeSections.map((section) => (
                  <TabsTrigger
                    key={section.id}
                    id={`mindscape-tab-${section.id}`}
                    value={section.id}
                    aria-controls={section.id}
                    className="mindscape-tab"
                  >
                    {section.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </aside>

          <div className="mindscape-content">
            <section
              id="about"
              className="mindscape-section mindscape-section-about"
              aria-labelledby="mindscape-tab-about"
            >
              <h2>A little bit about me</h2>
              <AboutCopy />
            </section>

            <section
              id="reading"
              className="mindscape-section"
              aria-labelledby="mindscape-tab-reading"
            >
              <h2>Reading</h2>
              <p className="mindscape-placeholder">to be continued...</p>
            </section>

            <section
              id="writing"
              className="mindscape-section"
              aria-labelledby="mindscape-tab-writing"
            >
              <h2>Writing</h2>
              <article className="mindscape-writing-entry">
                <a href="https://cepheus-pons.org/essays/what-we-owe-to-each-other">
                  What We Owe to Each Other
                </a>
                <p>
                  An essay about the growing distance between the people
                  building advanced AI and the institutions expected to govern
                  it. It asks who holds technical knowledge, who holds public
                  authority, and what happens when those responsibilities sit
                  in different places.
                </p>
              </article>
            </section>

            <section
              id="poetry"
              className="mindscape-section mindscape-section-empty"
              aria-labelledby="mindscape-tab-poetry"
            >
              <h2>Poetry</h2>
            </section>

            <section
              id="life"
              className="mindscape-section"
              aria-labelledby="mindscape-tab-life"
            >
              <h2>Life</h2>
              <p className="mindscape-placeholder">to be continued...</p>
            </section>
          </div>
        </div>

        <footer className="about-page-footer">
          <Link href="/">Return to home</Link>
        </footer>
      </div>
    </article>
  )
}
