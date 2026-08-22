'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  cloneElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'

const CARD_WIDTH = 240
const VIEWPORT_GUTTER = 12
const POINTER_OFFSET = 12
const WHISPER_CARD_WIDTH = 192
const WHISPER_POINTER_OFFSET = 9

type TooltipProps = {
  content: ReactNode
  children: ReactElement<{
    'aria-controls'?: string
    'aria-describedby'?: string
    'aria-expanded'?: boolean
  }>
  containerClassName?: string
  interactive?: boolean
  variant?: 'default' | 'whisper'
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function Tooltip({
  content,
  children,
  containerClassName,
  interactive = false,
  variant = 'default',
}: TooltipProps) {
  const tooltipId = useId()
  const cardRef = useRef<HTMLSpanElement>(null)
  const hideTimeoutRef = useRef<number | null>(null)
  const reduceMotion = useReducedMotion()
  const [isVisible, setIsVisible] = useState(false)
  const [height, setHeight] = useState(0)
  const [anchor, setAnchor] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({
    left: VIEWPORT_GUTTER,
    top: VIEWPORT_GUTTER,
  })

  const cancelScheduledHide = () => {
    if (hideTimeoutRef.current === null) return
    window.clearTimeout(hideTimeoutRef.current)
    hideTimeoutRef.current = null
  }

  const scheduleHide = () => {
    cancelScheduledHide()
    hideTimeoutRef.current = window.setTimeout(() => {
      setIsVisible(false)
      hideTimeoutRef.current = null
    }, 160)
  }

  const placeCard = (x: number, y: number, cardHeight = height) => {
    const isWhisper = variant === 'whisper'
    const cardWidth = isWhisper ? WHISPER_CARD_WIDTH : CARD_WIDTH
    const pointerOffset = isWhisper ? WHISPER_POINTER_OFFSET : POINTER_OFFSET
    const maxLeft = Math.max(
      VIEWPORT_GUTTER,
      window.innerWidth - cardWidth - VIEWPORT_GUTTER
    )
    const maxTop = Math.max(
      VIEWPORT_GUTTER,
      window.innerHeight - cardHeight - VIEWPORT_GUTTER
    )
    const preferredLeft =
      isWhisper && x + pointerOffset + cardWidth > window.innerWidth - VIEWPORT_GUTTER
        ? x - cardWidth - pointerOffset
        : x + pointerOffset
    const preferredTop = isWhisper
      ? y - cardHeight - pointerOffset >= VIEWPORT_GUTTER
        ? y - cardHeight - pointerOffset
        : y + pointerOffset
      : y + pointerOffset + cardHeight > window.innerHeight
        ? y - cardHeight - pointerOffset
        : y + pointerOffset

    setAnchor({ x, y })
    setPosition({
      left: clamp(preferredLeft, VIEWPORT_GUTTER, maxLeft),
      top: clamp(preferredTop, VIEWPORT_GUTTER, maxTop),
    })
  }

  useLayoutEffect(() => {
    if (!isVisible || !cardRef.current) return
    const nextHeight = cardRef.current.scrollHeight
    setHeight(nextHeight)
    placeCard(anchor.x, anchor.y, nextHeight)
  }, [anchor.x, anchor.y, content, isVisible])

  useEffect(() => cancelScheduledHide, [])

  return (
    <span
      className={['tooltip-card-trigger', containerClassName]
        .filter(Boolean)
        .join(' ')}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'mouse') return
        cancelScheduledHide()
        placeCard(event.clientX, event.clientY)
        setIsVisible(true)
      }}
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse' || !isVisible) return
        placeCard(event.clientX, event.clientY)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') scheduleHide()
      }}
      onPointerDown={(event) => {
        if (event.pointerType === 'mouse') return
        if ((event.target as Element).closest('a')) return
        event.preventDefault()
        const rect = event.currentTarget.getBoundingClientRect()
        if (!isVisible) placeCard(rect.left + rect.width / 2, rect.top)
        setIsVisible((current) => !current)
      }}
      onFocus={(event) => {
        if (!(event.target as HTMLElement).matches(':focus-visible')) return
        const rect = event.currentTarget.getBoundingClientRect()
        placeCard(rect.left + rect.width / 2, rect.top)
        setIsVisible(true)
      }}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
        setIsVisible(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setIsVisible(false)
      }}
    >
      {cloneElement(
        children,
        interactive
          ? {
              'aria-controls': tooltipId,
              'aria-expanded': isVisible,
            }
          : { 'aria-describedby': tooltipId }
      )}
      <AnimatePresence>
        {isVisible ? (
          <motion.span
            id={tooltipId}
            ref={cardRef}
            role={interactive ? 'dialog' : 'tooltip'}
            className="contact-tooltip-card"
            data-interactive={interactive ? 'true' : 'false'}
            data-variant={variant}
            initial={{
              height: 0,
              opacity: 0,
              scale: variant === 'whisper' ? 0.96 : 1,
            }}
            animate={{ height, opacity: 1, scale: 1 }}
            exit={{
              height: 0,
              opacity: 0,
              scale: variant === 'whisper' ? 0.98 : 1,
            }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 200, damping: 24 }
            }
            style={{
              left: position.left,
              top: position.top,
              transformOrigin: 'top left',
            }}
          >
            <span className="contact-tooltip-content">{content}</span>
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  )
}
