'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  cloneElement,
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

type TooltipProps = {
  content: ReactNode
  children: ReactElement<{ 'aria-describedby'?: string }>
  containerClassName?: string
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function Tooltip({
  content,
  children,
  containerClassName,
}: TooltipProps) {
  const tooltipId = useId()
  const cardRef = useRef<HTMLSpanElement>(null)
  const reduceMotion = useReducedMotion()
  const [isVisible, setIsVisible] = useState(false)
  const [height, setHeight] = useState(0)
  const [anchor, setAnchor] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({
    left: VIEWPORT_GUTTER,
    top: VIEWPORT_GUTTER,
  })

  const placeCard = (x: number, y: number, cardHeight = height) => {
    const maxLeft = Math.max(
      VIEWPORT_GUTTER,
      window.innerWidth - CARD_WIDTH - VIEWPORT_GUTTER
    )
    const maxTop = Math.max(
      VIEWPORT_GUTTER,
      window.innerHeight - cardHeight - VIEWPORT_GUTTER
    )
    const preferredTop =
      y + POINTER_OFFSET + cardHeight > window.innerHeight
        ? y - cardHeight - POINTER_OFFSET
        : y + POINTER_OFFSET

    setAnchor({ x, y })
    setPosition({
      left: clamp(x + POINTER_OFFSET, VIEWPORT_GUTTER, maxLeft),
      top: clamp(preferredTop, VIEWPORT_GUTTER, maxTop),
    })
  }

  useLayoutEffect(() => {
    if (!isVisible || !cardRef.current) return
    const nextHeight = cardRef.current.scrollHeight
    setHeight(nextHeight)
    placeCard(anchor.x, anchor.y, nextHeight)
  }, [anchor.x, anchor.y, content, isVisible])

  return (
    <span
      className={['tooltip-card-trigger', containerClassName]
        .filter(Boolean)
        .join(' ')}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'mouse') return
        placeCard(event.clientX, event.clientY)
        setIsVisible(true)
      }}
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse' || !isVisible) return
        placeCard(event.clientX, event.clientY)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setIsVisible(false)
      }}
      onPointerDown={(event) => {
        if (event.pointerType === 'mouse') return
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
      onBlur={() => setIsVisible(false)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setIsVisible(false)
      }}
    >
      {cloneElement(children, { 'aria-describedby': tooltipId })}
      <AnimatePresence>
        {isVisible ? (
          <motion.span
            id={tooltipId}
            ref={cardRef}
            role="tooltip"
            className="contact-tooltip-card"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 200, damping: 24 }
            }
            style={{ left: position.left, top: position.top }}
          >
            <span className="contact-tooltip-content">{content}</span>
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  )
}
