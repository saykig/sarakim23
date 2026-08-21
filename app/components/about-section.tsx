'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible'

export function AboutSection() {
  const [open, setOpen] = useState(false)
  const reduceMotion = useReducedMotion()

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="about-section">
      <CollapsibleTrigger
        className="about-trigger group"
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setOpen((current) => !current)
          }
        }}
      >
        <span>A little about me</span>
        <motion.span
          aria-hidden="true"
          className="about-chevron"
          animate={
            open || reduceMotion
              ? { rotate: open ? 180 : 0, y: 0 }
              : { rotate: 0, y: [0, 2, 0] }
          }
          transition={
            open || reduceMotion
              ? { duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }
              : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <ChevronDown size={18} strokeWidth={1.5} />
        </motion.span>
      </CollapsibleTrigger>

      <CollapsibleContent className="about-content">
        <div className="about-copy">
          <p>
            I’ve been travelling the world since I was in the womb. Somehow,
            that has taken me through Vancouver, Tashkent, St. Petersburg,
            Daejeon, and, for the time being, Toronto.
          </p>
          <p>
            I’m still curious where this little journey across the pale blue dot
            takes me next. Hopefully somewhere unexpected. Hopefully also
            skydiving, despite several friends warning me that this is a terrible
            idea.
          </p>
          <p>
            This website is my attempt to map a digital version of myself while
            the physical one remains very much a work in progress: learning
            things, changing my mind, making things, collecting thoughts, and
            meeting people who are genuinely excited about what they do.
          </p>
          <p>
            If you’re into sociology, zoology, philosophy, biology,
            technology—or some wonderfully specific thing that lives somewhere
            between them—you’re probably in the right place. I like people with
            whimsical minds who take their curiosities seriously.
          </p>
          <p>
            If you care about doing good, making things better, or are simply
            very passionate about something, I’d like to hear about it.
          </p>

          <p className="about-links" aria-label="Places to find Sara online">
            email <span aria-hidden="true">·</span> linkedin{' '}
            <span aria-hidden="true">·</span>{' '}
            <a
              href="https://github.com/saykig"
              target="_blank"
              rel="noopener noreferrer"
            >
              github
            </a>{' '}
            <span aria-hidden="true">·</span> substack
          </p>
          <p className="about-signoff">thanks for dropping by :)</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
