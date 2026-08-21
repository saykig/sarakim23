'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/core/accordion'
import { Tooltip } from '@/components/ui/tooltip-card'

const fatalitySummaryUrl =
  'https://www.uspa.org/uspa-news/a-milestone-in-safetythe-2024-fatality-summary'

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
                I’ve been travelling the world since I was in the womb.
              </p>
              <p>
                Since then, I have lived in Daejeon, Tashkent, St. Petersburg,
                Vancouver, and Toronto. I have been living in Toronto for uni, and am
                currently a master’s student at the Munk School of Global Affairs and
                Public Policy at the University of Toronto. I hope to write my thesis
                on the ways in which powerful people make decisions about the
                world—decisions that are often, if not most of the time, difficult to
                understand on why they even did it.
              </p>
              <p>
                I’m curious about where this little journey across the pale blue dot
                we call home takes me next. Hopefully somewhere unexpected. Hopefully
                also skydiving, despite several friends warning me that this is a{' '}
                <Tooltip
                  interactive
                  containerClassName="about-inline-tooltip"
                  content={
                    <span className="about-tooltip-copy">
                      According to the{' '}
                      <a
                        className="about-tooltip-source"
                        href={fatalitySummaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        USPA
                      </a>
                      , there were only 9 deaths across 3.88 million skydives in 2024.
                      That’s about one in every 430,000 jumps. So perhaps skydiving is
                      not the terrible idea everyone keeps telling me it is...
                    </span>
                  }
                >
                  <button type="button" className="about-inline-easter-egg">
                    terrible idea
                  </button>
                </Tooltip>
                .
              </p>
              <p>
                This website is my way of presenting the digital version of myself
                while the physical one remains very much a work in progress:
                constantly learning things, changing my mind, making things,
                collecting thoughts, and meeting people who are genuinely excited
                about what they do and want to see change in the world as much as I
                do.
              </p>
              <p>
                If you’re in political science, metascience, neuroeconomics,
                astrophysics, or some wonderfully specific niche thing that you are
                passionate about, then you’re probably in the right place. I find
                that people who take their curiosities seriously and are constantly
                in awe of whatever they uncover or create next as the{' '}
                <Tooltip
                  containerClassName="about-inline-tooltip"
                  content={
                    <span className="about-tooltip-copy">
                      Lapis lazuli has long been associated with wisdom, truth,
                      royalty, and something almost divine. Its deep blue flecked with
                      gold is often represented as the starry night sky, one of the
                      things I’m fascinated by.
                    </span>
                  }
                >
                  <button type="button" className="about-inline-easter-egg">
                    lapis lazulis
                  </button>
                </Tooltip>{' '}
                of society.
              </p>
              <p>
                If you care about doing good and are deeply passionate something,
                I’d like to hear about it. Shoot me an email or connect with me on
                LinkedIn.
              </p>

              <p className="about-signoff">Thanks for dropping by :)</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  )
}
