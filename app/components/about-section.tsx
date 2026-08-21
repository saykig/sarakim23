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
                Vancouver, and Toronto. I have been in Toronto for uni, and am
                currently a master’s student at the Munk School of Global Affairs and
                Public Policy at the University of Toronto. I hope to write my thesis
                on the ways in which powerful people make decisions about the
                world—decisions that are often, if not most of the time, difficult to
                understand.
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
                This website is still a work in progress, much like I am:
                constantly learning things, changing my mind, making things,
                collecting thoughts, and meeting people who are genuinely excited
                about what they do
              </p>
              <p>
                If you’re in political science, metascience, neuroeconomics,
                astrophysics, or some wonderfully specific niche thing that you are
                passionate about, then you’re probably in the right place. I find
                people who take their curiosities seriously and stay in awe of
                whatever they uncover to be one of the{' '}
                <Tooltip
                  containerClassName="about-inline-tooltip"
                  content={
                    <span className="about-tooltip-copy">
                      When people say ‘hidden gems’ of the world, I like to think of
                      those people as lapis lazuli. It’s a stone associated with
                      wisdom, truth, and something almost divine, and I’ve always
                      liked how its deep blue and little flecks of gold look almost
                      like a tiny night sky.
                    </span>
                  }
                >
                  <button type="button" className="about-inline-easter-egg">
                    best parts of society
                  </button>
                </Tooltip>
                .
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
