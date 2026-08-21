'use client'

import { useId, useState } from 'react'

const VIDEO_URL =
  'https://youtu.be/KmDYXaaT9sA?si=kEu3XmRfQvMqb482&t=1122'
const THUMBNAIL_URL = 'https://i.ytimg.com/vi/KmDYXaaT9sA/hqdefault.jpg'
const CARD_WIDTH = 208
const CARD_HEIGHT = 150
const VIEWPORT_GUTTER = 12

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getCardPosition(x: number, y: number) {
  const maxLeft = Math.max(VIEWPORT_GUTTER, window.innerWidth - CARD_WIDTH - VIEWPORT_GUTTER)
  const maxTop = Math.max(VIEWPORT_GUTTER, window.innerHeight - CARD_HEIGHT - VIEWPORT_GUTTER)
  const top = y > CARD_HEIGHT + 32 ? y - CARD_HEIGHT - 14 : y + 18

  return {
    left: clamp(x + 12, VIEWPORT_GUTTER, maxLeft),
    top: clamp(top, VIEWPORT_GUTTER, maxTop),
  }
}

export function LicenseEasterEgg() {
  const tooltipId = useId()
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ left: VIEWPORT_GUTTER, top: VIEWPORT_GUTTER })

  return (
    <span className="license-easter-egg">
      <a
        className="license-easter-egg-link"
        href={VIDEO_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-describedby={tooltipId}
        onPointerEnter={(event) => {
          if (event.pointerType !== 'mouse') return
          setPosition(getCardPosition(event.clientX, event.clientY))
          setIsVisible(true)
        }}
        onPointerMove={(event) => {
          if (event.pointerType !== 'mouse') return
          setPosition(getCardPosition(event.clientX, event.clientY))
        }}
        onPointerLeave={() => setIsVisible(false)}
        onFocus={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          setPosition(getCardPosition(rect.left + rect.width / 2, rect.top))
          setIsVisible(true)
        }}
        onBlur={() => setIsVisible(false)}
      >
        or so as they say
      </a>
      <span
        id={tooltipId}
        role="tooltip"
        aria-hidden={!isVisible}
        className="license-tooltip-card"
        data-visible={isVisible ? 'true' : 'false'}
        style={{ left: position.left, top: position.top }}
      >
        <img
          className="license-tooltip-thumbnail"
          src={THUMBNAIL_URL}
          alt=""
          width="480"
          height="360"
        />
        <span className="license-tooltip-caption">
          some fruit for thought. 18:42-21:11 and 8:38-9:20 : )
        </span>
      </span>
    </span>
  )
}
