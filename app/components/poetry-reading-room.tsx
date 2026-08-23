'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Poem } from '@/app/data/poems'

type PoetryReadingRoomProps = {
  poems: Poem[]
}

function poemNumber(index: number) {
  return String(index + 1).padStart(2, '0')
}

export function PoetryReadingRoom({ poems }: PoetryReadingRoomProps) {
  const [activePoem, setActivePoem] = useState(poems[0]?.id ?? '')

  useEffect(() => {
    let frame = 0

    const updateActivePoem = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const readingLine = window.innerHeight * 0.32
        let nextActive = poems[0]?.id ?? ''

        for (const poem of poems) {
          const section = document.getElementById(poem.id)
          if (!section || section.getBoundingClientRect().top > readingLine) break
          nextActive = poem.id
        }

        setActivePoem((current) => (current === nextActive ? current : nextActive))
      })
    }

    updateActivePoem()
    window.addEventListener('scroll', updateActivePoem, { passive: true })
    window.addEventListener('resize', updateActivePoem)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateActivePoem)
      window.removeEventListener('resize', updateActivePoem)
    }
  }, [poems])

  const moveToPoem = useCallback((id: string) => {
    const section = document.getElementById(id)
    if (!section) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    window.history.replaceState(null, '', `#${id}`)
    setActivePoem(id)
  }, [])

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
        <aside className="poetry-reading-index" aria-label="Poem index">
          <ol>
            {poems.map((poem, index) => {
              const isActive = activePoem === poem.id
              return (
                <li key={poem.id}>
                  <a
                    href={`#${poem.id}`}
                    aria-current={isActive ? 'location' : undefined}
                    onClick={(event) => handleAnchorClick(event, poem.id)}
                  >
                    <span aria-hidden="true">{poemNumber(index)}</span>
                    {poem.title}
                  </a>
                </li>
              )
            })}
          </ol>
        </aside>

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
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
