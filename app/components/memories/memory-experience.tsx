'use client'

import Image from 'next/image'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { MemoryEntry, MemoryPhoto } from '../../memories/data'
import { EphemeraNote } from './ephemera-note'

type MemoryExperienceProps = {
  location: string
  entries: MemoryEntry[]
}

export function MemoryExperience({ location, entries }: MemoryExperienceProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const sourceRef = useRef<HTMLElement | null>(null)
  const flipStateRef = useRef<ReturnType<typeof Flip.getState> | null>(null)
  const pushedHistoryRef = useRef(false)
  const closeRequestedRef = useRef(false)
  const activeRef = useRef<MemoryPhoto | null>(null)
  const [activePhoto, setActivePhoto] = useState<MemoryPhoto | null>(null)
  const photos = entries.filter(
    (entry): entry is MemoryPhoto => entry.type === 'photo'
  )

  useEffect(() => {
    activeRef.current = activePhoto
  }, [activePhoto])

  useLayoutEffect(() => {
    if (!rootRef.current) return

    gsap.registerPlugin(Flip, ScrollTrigger)
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('[data-memory-item]').forEach((item) => {
          const image = item.querySelector<HTMLElement>('[data-parallax]')
          const amount = Number(item.dataset.parallax ?? 0)

          gsap.fromTo(
            item,
            { autoAlpha: 0.45, y: 28 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.85,
              ease: 'power2.out',
              scrollTrigger: { trigger: item, start: 'top 88%', once: true },
            }
          )

          if (image && amount) {
            gsap.fromTo(
              image,
              { yPercent: -amount },
              {
                yPercent: amount,
                ease: 'none',
                scrollTrigger: {
                  trigger: item,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 0.7,
                },
              }
            )
          }
        })
      }, rootRef)

      return () => context.revert()
    })

    return () => media.revert()
  }, [])

  const finishClose = useCallback(() => {
    dialogRef.current?.close()
    setActivePhoto(null)
    activeRef.current = null
    sourceRef.current?.focus()
    sourceRef.current = null
    flipStateRef.current = null
    pushedHistoryRef.current = false
    closeRequestedRef.current = false
  }, [])

  const closeDetail = useCallback(
    (animate = true) => {
      const preview = dialogRef.current?.querySelector<HTMLElement>(
        '[data-memory-preview]'
      )
      const source = sourceRef.current
      const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (!animate || reduceMotion || !preview || !source) {
        finishClose()
        return
      }

      Flip.fit(preview, source, {
        absolute: true,
        duration: 0.58,
        ease: 'power3.inOut',
        onComplete: finishClose,
      })
    },
    [finishClose]
  )

  useEffect(() => {
    const handlePopState = () => {
      if (activeRef.current) {
        closeRequestedRef.current = true
        closeDetail()
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [closeDetail])

  useLayoutEffect(() => {
    if (!activePhoto || !dialogRef.current) return

    let cancelled = false
    const dialog = dialogRef.current
    if (!dialog.open) dialog.showModal()
    const preview = dialog.querySelector<HTMLElement>('[data-memory-preview]')
    const previewImage = preview?.querySelector<HTMLImageElement>('img')
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const animateOpen = () => {
      if (cancelled || !preview || !flipStateRef.current || reduceMotion) return
      Flip.from(flipStateRef.current, {
        targets: preview,
        absolute: true,
        duration: 0.72,
        ease: 'power3.inOut',
      })
    }

    if (previewImage?.complete) animateOpen()
    else previewImage?.decode().then(animateOpen).catch(animateOpen)

    closeRef.current?.focus()
    return () => {
      cancelled = true
    }
  }, [activePhoto])

  const openDetail = (photo: MemoryPhoto, trigger: HTMLElement) => {
    if (activeRef.current) return
    gsap.registerPlugin(Flip)
    sourceRef.current = trigger
    flipStateRef.current = Flip.getState(trigger)
    activeRef.current = photo
    closeRequestedRef.current = false
    setActivePhoto(photo)
    window.history.pushState(
      { memoryPhoto: photo.id },
      '',
      `${window.location.pathname}?photo=${photo.id}`
    )
    pushedHistoryRef.current = true
  }

  const requestClose = () => {
    if (closeRequestedRef.current) return
    closeRequestedRef.current = true

    if (pushedHistoryRef.current) {
      pushedHistoryRef.current = false
      window.history.back()
    } else {
      closeDetail()
    }
  }

  return (
    <div ref={rootRef} className="memory-experience">
      <div className="memory-stream">
        {entries.map((entry) => {
          if (entry.type === 'ephemera') {
            return (
              <div
                key={entry.id}
                className="memory-entry memory-entry-note"
                data-layout={entry.layout}
                data-memory-item
              >
                <EphemeraNote entry={entry} />
              </div>
            )
          }

          const photoNumber = photos.findIndex((photo) => photo.id === entry.id) + 1
          return (
            <figure
              key={entry.id}
              className="memory-entry memory-photo"
              data-layout={entry.layout}
              data-parallax={entry.parallax}
              data-memory-item
            >
              <button
                type="button"
                className="memory-photo-trigger"
                aria-label={`Open photograph ${photoNumber} of ${photos.length} from ${location}`}
                data-flip-id={entry.id}
                onClick={(event) => openDetail(entry, event.currentTarget)}
              >
                <span className="memory-photo-window">
                  <span className="memory-photo-parallax" data-parallax>
                    <Image
                      src={entry.localPath}
                      alt={entry.alt ?? `Photograph ${photoNumber} from ${location}`}
                      width={entry.width}
                      height={entry.height}
                      sizes="(max-width: 700px) 88vw, (max-width: 1100px) 58vw, 46vw"
                      loading={photoNumber === 1 ? 'eager' : 'lazy'}
                    />
                  </span>
                </span>
                <span className="memory-photo-index" aria-hidden="true">
                  {String(photoNumber).padStart(2, '0')}
                </span>
              </button>
              {entry.caption ? <figcaption>{entry.caption}</figcaption> : null}
            </figure>
          )
        })}
      </div>

      <dialog
        ref={dialogRef}
        className="memory-dialog"
        aria-label={activePhoto ? `Expanded photograph from ${location}` : undefined}
        onCancel={(event) => {
          event.preventDefault()
          requestClose()
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            requestClose()
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) requestClose()
        }}
      >
        {activePhoto ? (
          <>
            <button
              ref={closeRef}
              type="button"
              className="memory-dialog-close"
              onClick={requestClose}
            >
              close <span aria-hidden="true">×</span>
            </button>
            <div
              className="memory-dialog-image"
              data-memory-preview
              data-flip-id={activePhoto.id}
            >
              <Image
                src={activePhoto.localPath}
                alt={activePhoto.alt ?? `Photograph from ${location}`}
                fill
                sizes="(max-width: 700px) calc(100vw - 1.6rem), (max-width: 1100px) 86vw, calc(100vw - 11rem)"
                loading="eager"
              />
            </div>
          </>
        ) : null}
      </dialog>
    </div>
  )
}
