'use client'

import {
  AnimatePresence,
  motion,
  type MotionProps,
  type Transition,
  type Variant,
} from 'motion/react'
import type { ReactNode } from 'react'

export type TransitionPanelProps = {
  children: ReactNode[]
  className?: string
  transition?: Transition
  activeIndex: number
  variants?: { enter: Variant; center: Variant; exit: Variant }
} & MotionProps

export function TransitionPanel({
  children,
  className,
  transition,
  variants,
  activeIndex,
  ...motionProps
}: TransitionPanelProps) {
  return (
    <div className={['relative', className].filter(Boolean).join(' ')}>
      <AnimatePresence initial={false} mode="popLayout" custom={motionProps.custom}>
        <motion.div
          key={activeIndex}
          variants={variants}
          transition={transition}
          initial="enter"
          animate="center"
          exit="exit"
          {...motionProps}
        >
          {children[activeIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
