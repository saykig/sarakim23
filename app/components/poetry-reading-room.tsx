'use client'

import { motion, useMotionValue, type MotionValue } from 'motion/react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Poem } from '@/app/data/poems'
import { Tooltip } from '@/components/ui/tooltip-card'

type PoetryReadingRoomProps = {
  poems: Poem[]
}

type PoetryNavigationContextValue = {
  activePoem: string
  moveToPoem: (id: string) => void
  poems: Poem[]
  sideIndexVisible: boolean
  trackProgress: MotionValue<number>
}

const PoetryNavigationContext =
  createContext<PoetryNavigationContextValue | null>(null)

function poemNumber(index: number) {
  return String(index + 1).padStart(2, '0')
}

export function PoetryNavigationProvider({
  poems,
  children,
}: PoetryReadingRoomProps & { children: ReactNode }) {
  const [activePoem, setActivePoem] = useState(poems[0]?.id ?? '')
  const [sideIndexVisible, setSideIndexVisible] = useState(false)
  const trackProgress = useMotionValue(0)

  useEffect(() => {
    let frame = 0

    const updateIndex = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const openingToc = document.querySelector<HTMLElement>(
          '.poetry-opening-toc'
        )
        const nextSideIndexVisible =
          !openingToc ||
          openingToc.getBoundingClientRect().bottom <= window.innerHeight * 0.28

        setSideIndexVisible((current) =>
          current === nextSideIndexVisible ? current : nextSideIndexVisible
        )

        const sections = poems
          .map((poem) => document.getElementById(poem.id))
          .filter((section): section is HTMLElement => section !== null)

        if (sections.length === 0) return

        const readingLine = window.innerHeight * 0.32
        let nextActive = sections[0].id

        for (const section of sections) {
          if (section.getBoundingClientRect().top > readingLine) break
          nextActive = section.id
        }

        const firstTop = sections[0].getBoundingClientRect().top + window.scrollY
        const lastBottom =
          sections[sections.length - 1].getBoundingClientRect().bottom +
          window.scrollY
        const currentPosition = window.scrollY + readingLine
        const progress = Math.min(
          1,
          Math.max(0, (currentPosition - firstTop) / (lastBottom - firstTop))
        )

        trackProgress.set(progress)
        setActivePoem((current) =>
          current === nextActive ? current : nextActive
        )
      })
    }

    updateIndex()
    window.addEventListener('scroll', updateIndex, { passive: true })
    window.addEventListener('resize', updateIndex)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateIndex)
      window.removeEventListener('resize', updateIndex)
    }
  }, [poems, trackProgress])

  const moveToPoem = useCallback((id: string) => {
    const section = document.getElementById(id)
    if (!section) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    section.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    })
    window.history.replaceState(null, '', `#${id}`)
    setActivePoem(id)
  }, [])

  return (
    <PoetryNavigationContext.Provider
      value={{
        activePoem,
        moveToPoem,
        poems,
        sideIndexVisible,
        trackProgress,
      }}
    >
      {children}
    </PoetryNavigationContext.Provider>
  )
}

function usePoetryNavigation() {
  const context = useContext(PoetryNavigationContext)

  if (!context) {
    throw new Error(
      'Poetry navigation must be rendered inside PoetryNavigationProvider.'
    )
  }

  return context
}

export function PoetrySideIndex() {
  const { activePoem, moveToPoem, poems, sideIndexVisible, trackProgress } =
    usePoetryNavigation()

  return (
    <nav
      className="poetry-reading-index"
      aria-hidden={sideIndexVisible ? undefined : true}
      aria-label="Poem index"
      data-visible={sideIndexVisible}
    >
      <div className="poetry-reading-index-track">
        <span className="poetry-reading-index-rail" aria-hidden="true" />
        <motion.span
          className="poetry-reading-index-progress"
          style={{ scaleY: trackProgress }}
          aria-hidden="true"
        />
        <ol>
          {poems.map((poem, index) => {
            const isActive = activePoem === poem.id
            return (
              <li key={poem.id}>
                <a
                  href={`#${poem.id}`}
                  aria-current={isActive ? 'location' : undefined}
                  onClick={(event) => {
                    event.preventDefault()
                    moveToPoem(poem.id)
                  }}
                >
                  <span aria-hidden="true">{poemNumber(index)}</span>
                  {poem.title}
                </a>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}

export function PoetryReadingRoom({ poems }: PoetryReadingRoomProps) {
  const { activePoem, moveToPoem } = usePoetryNavigation()

  const handleAnchorClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    moveToPoem(id)
  }

  return (
    <>
      <nav className="poetry-opening-toc" aria-label="Poetry table of contents">
        <ol>
          {poems.map((poem, index) => (
            <li key={poem.id}>
              <span className="poetry-opening-number" aria-hidden="true">
                {poemNumber(index)}
              </span>
              <a href={`#${poem.id}`} onClick={(event) => handleAnchorClick(event, poem.id)}>
                {poem.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <figure className="poetry-sunset">
        <img
          src="/images/essays-sunset-landscape.png"
          alt="A warm sunset settling over a quiet landscape."
          width={1672}
          height={941}
        />
      </figure>

      <div className="poetry-reading-layout">
        <div className="poetry-mobile-index">
          <label htmlFor="poetry-mobile-select">Poem</label>
          <select
            id="poetry-mobile-select"
            value={activePoem}
            onChange={(event) => moveToPoem(event.target.value)}
          >
            {poems.map((poem, index) => (
              <option key={poem.id} value={poem.id}>
                {poemNumber(index)} — {poem.title}
              </option>
            ))}
          </select>
        </div>

        <div className="poetry-poems">
          {poems.map((poem) => (
            <section
              key={poem.id}
              id={poem.id}
              className={`poetry-poem ${
                poem.content.kind === 'image' ? 'poetry-poem-title-only' : ''
              }`}
            >
              <header className="poetry-poem-heading">
                <h2>{poem.title}</h2>
              </header>

              {poem.content.kind === 'text' ? (
                <>
                  {poem.content.leadImage ? (
                    <figure className="poetry-poem-image">
                      <Tooltip
                        containerClassName="poetry-photo-tooltip"
                        content="Florence, Italy"
                        variant="whisper"
                      >
                        <button
                          type="button"
                          className="poetry-photo-tooltip-trigger"
                        >
                          <img
                            src={poem.content.leadImage.src}
                            alt={poem.content.leadImage.alt}
                            width={poem.content.leadImage.width}
                            height={poem.content.leadImage.height}
                          />
                        </button>
                      </Tooltip>
                    </figure>
                  ) : null}

                  <div className="poetry-poem-text">
                    {poem.content.stanzas.map((stanza, stanzaIndex) => (
                      <p key={`${poem.id}-${stanzaIndex}`}>
                        {stanza.map((line, lineIndex) => (
                          <span
                            key={`${poem.id}-${stanzaIndex}-${lineIndex}`}
                            className={[
                              line.indent ? `poetry-line-indent-${line.indent}` : '',
                              line.italic ? 'poetry-line-italic' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {line.text}
                          </span>
                        ))}
                      </p>
                    ))}
                  </div>
                </>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
