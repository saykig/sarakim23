'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

const greetings = [
  { word: 'Merhaba!', hold: 320, transition: 0.24 },
  { word: '안녕하세요!', hold: 400, transition: 0.28 },
  { word: 'Привет!', hold: 420, transition: 0.3 },
  { word: 'Hello!', hold: null, transition: 0.75 },
] as const

export function WordRotate() {
  const [index, setIndex] = useState(0)
  const reduceMotion = useReducedMotion()
  const greeting = greetings[index]

  useEffect(() => {
    if (reduceMotion) {
      setIndex(greetings.length - 1)
      return
    }

    if (greeting.hold === null) return

    const previousTransition = index > 0 ? greetings[index - 1].transition : 0
    const delay =
      greeting.hold + (previousTransition + greeting.transition) * 1000

    const timeout = window.setTimeout(() => {
      setIndex((current) => Math.min(current + 1, greetings.length - 1))
    }, delay)

    return () => window.clearTimeout(timeout)
  }, [greeting.hold, greeting.transition, index, reduceMotion])

  return (
    <span className="greeting-rotate" aria-live="polite" aria-atomic="true">
      <AnimatePresence initial={!reduceMotion} mode="wait">
        <motion.span
          key={greeting.word}
          className="greeting-word"
          initial={reduceMotion ? false : { opacity: 0, y: '-38%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: '38%' }}
          transition={{
            duration: reduceMotion ? 0 : greeting.transition,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {greeting.word}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
