'use client'

import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useReducedMotion } from 'motion/react'
import { TransitionPanel } from '@/components/core/transition-panel'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AboutCopy } from './about-copy'
import { HomeGlobeNav } from './home-globe-nav'

const mindscapeSections = [
  { id: 'about', label: 'About Me' },
  { id: 'reading', label: 'Reading' },
  { id: 'writing', label: 'Writing' },
  { id: 'important-notes', label: 'Important notes' },
] as const

export type MindscapeSectionId = (typeof mindscapeSections)[number]['id']

type MindscapePageProps = {
  initialSection?: MindscapeSectionId
  poetryContent?: ReactNode
  poetryIndex?: ReactNode
  className?: string
}

function isMindscapeSection(value: string): value is MindscapeSectionId {
  return mindscapeSections.some((section) => section.id === value)
}

export function MindscapePage({
  initialSection = 'about',
  poetryContent,
  poetryIndex,
  className = '',
}: MindscapePageProps) {
  const [activeSection, setActiveSection] =
    useState<MindscapeSectionId>(initialSection)
  const reduceMotion = useReducedMotion()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (pathname !== '/about') {
      setActiveSection(initialSection)
      return
    }

    const syncSectionFromHash = () => {
      const hashSection = window.location.hash.slice(1)

      if (hashSection === 'poetry') {
        router.replace('/writing/poetry')
        return
      }

      if (hashSection === 'life') {
        router.replace('/about#important-notes')
        return
      }

      setActiveSection(isMindscapeSection(hashSection) ? hashSection : 'about')
    }

    syncSectionFromHash()
    window.addEventListener('hashchange', syncSectionFromHash)

    return () => window.removeEventListener('hashchange', syncSectionFromHash)
  }, [initialSection, pathname, router])

  const selectSection = (value: string) => {
    if (!isMindscapeSection(value)) return

    if (pathname === '/writing/poetry') {
      const destination = value === 'about' ? '/about' : `/about#${value}`
      router.push(destination)
      return
    }

    setActiveSection(value)
    window.history.replaceState(
      null,
      '',
      value === 'about' ? '/about' : `#${value}`
    )
  }

  const activeIndex = mindscapeSections.findIndex(
    (section) => section.id === activeSection
  )

  return (
    <article
      className={['about-page', 'mindscape-page', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="about-page-inner mindscape-page-inner">
        <header className="about-page-header mindscape-page-header">
          <h1>Sara’s Mindscape</h1>
          <HomeGlobeNav />
        </header>

        <div className="mindscape-layout">
          <aside className="mindscape-index" aria-label="Mindscape index">
            <Tabs
              value={activeSection}
              onValueChange={selectSection}
              orientation="vertical"
              activationMode="manual"
              className="mindscape-tabs"
            >
              <TabsList className="mindscape-tabs-list">
                {mindscapeSections.map((section) => (
                  <TabsTrigger
                    key={section.id}
                    id={`mindscape-tab-${section.id}`}
                    value={section.id}
                    aria-controls={`mindscape-panel-${section.id}`}
                    className="mindscape-tab"
                  >
                    {section.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            {activeSection === 'writing' && poetryIndex ? (
              <div className="mindscape-index-supplement">{poetryIndex}</div>
            ) : null}
          </aside>

          <div className="mindscape-content">
            <TransitionPanel
              className="mindscape-transition-panel"
              activeIndex={activeIndex}
              transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
              variants={{
                enter: { opacity: 0, y: 10, filter: 'blur(1px)' },
                center: { opacity: 1, y: 0, filter: 'blur(0px)' },
                exit: { opacity: 0, y: -8, filter: 'blur(1px)' },
              }}
            >
              {[
                <section
                  key="about"
                  id="mindscape-panel-about"
                  className="mindscape-section mindscape-section-about"
                  role="tabpanel"
                  aria-labelledby="mindscape-tab-about"
                >
                  <h2>A little bit about me</h2>
                  <AboutCopy />
                </section>,
                <section
                  key="reading"
                  id="mindscape-panel-reading"
                  className="mindscape-section"
                  role="tabpanel"
                  aria-labelledby="mindscape-tab-reading"
                >
                  <h2>Reading</h2>
                  <p className="mindscape-placeholder">to be continued...</p>
                </section>,
                <section
                  key="writing"
                  id="mindscape-panel-writing"
                  className={
                    poetryContent
                      ? 'mindscape-section mindscape-poetry-section'
                      : 'mindscape-section'
                  }
                  role="tabpanel"
                  aria-labelledby="mindscape-tab-writing"
                >
                  {poetryContent ? (
                    <>
                      <h2>Poetry</h2>
                      {poetryContent}
                    </>
                  ) : (
                    <>
                      <h2>Writing</h2>
                      <div className="mindscape-writing-list">
                        <article className="mindscape-writing-entry">
                          <Link href="/writing/poetry">Poetry</Link>
                        </article>
                        <article className="mindscape-writing-entry">
                          <a href="https://cepheus-pons.org/essays/what-we-owe-to-each-other">
                            What We Owe to Each Other
                          </a>
                          <p>
                            An essay about the growing distance between the
                            people building advanced AI and the institutions
                            expected to govern it. It asks who holds technical
                            knowledge, who holds public authority, and what
                            happens when those responsibilities sit in
                            different places.
                          </p>
                        </article>
                      </div>
                    </>
                  )}
                </section>,
                <section
                  key="important-notes"
                  id="mindscape-panel-important-notes"
                  className="mindscape-section"
                  role="tabpanel"
                  aria-labelledby="mindscape-tab-important-notes"
                >
                  <h2>Important notes</h2>
                  <p className="mindscape-placeholder">to be continued...</p>
                </section>,
              ]}
            </TransitionPanel>
          </div>
        </div>

        <footer className="about-page-footer">
          <Link href="/">Return to home</Link>
        </footer>
      </div>
    </article>
  )
}
