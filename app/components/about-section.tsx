'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/core/accordion'

export function AboutSection() {
  return (
    <section className="about-section" aria-label="Explore more about Sara">
      <Accordion className="about-accordion flex w-full flex-col">
        <AccordionItem value="about">
          <AccordionTrigger className="about-trigger w-full py-0.5 text-left">
            A little about me
          </AccordionTrigger>

          <AccordionContent className="about-content">
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
              <p className="about-signoff">Thanks for dropping by :)</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  )
}
