'use client'

import { Tooltip } from '@/components/ui/tooltip-card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/core/accordion'
import { EmailTooltip, linkedInUrl } from './contact-links'

const fatalitySummaryUrl =
  'https://www.uspa.org/uspa-news/a-milestone-in-safetythe-2024-fatality-summary'
const reflectionsUrl = 'https://blog.samaltman.com/reflections'

export function AboutCopy() {
  return (
    <div className="about-copy">
      <p>I’ve been travelling the world since I was in the womb.</p>
      <Accordion className="about-decision-section">
        <AccordionItem value="decision-making">
          <p>
            Since then, I have lived in Daejeon, Tashkent, St. Petersburg,
            Vancouver, and Toronto. I have been in Toronto for uni, and am
            currently a master’s student at the Munk School of Global Affairs
            and Public Policy at the University of Toronto. I hope to write my
            thesis on the ways in which powerful people make decisions about the
            world—decisions that are often, if not most of the time,{' '}
            <AccordionTrigger className="about-inline-easter-egg">
              difficult to understand
            </AccordionTrigger>
            .
          </p>
          <AccordionContent className="about-decision-content">
            <div className="about-copy about-decision-copy">
              <p>
                A very close friend of mine in the sciences asked me an
                intriguing question: “Why don’t politicians share workflows? In
                science, publishing a finding without showing the methodology
                would make little sense. So why can’t we see the steps that took
                a state actor from point A to point B in making a policy
                decision?”
              </p>
              <p>
                To answer this question, I think ambiguity is both a carrot and
                a stick, though more often a stick. It is a strategy. Political
                actors often benefit from leaving parts of the process unclear.
                The world would be easier to understand if we could see every
                workflow behind every decision, but unfortunately, that is not
                the reality we live in.
              </p>
              <p>
                This is why I find studying decision-making so important
                (especially given the world we live in now) under high-stakes,
                gruelling security conditions such as the theatre of war. I hope
                that, over the course of my career, I can produce something that
                better contributes to a better understanding of decision-making
                in strategic security studies under fast-emerging technologies.
                For example, people keep projecting that artificial
                superintelligence (ASI) will arrive{' '}
                <Tooltip
                  containerClassName="about-inline-tooltip reflections-tooltip"
                  content={
                    <span className="reflections-tooltip-copy">
                      <span>Sam Altman · Reflections</span>
                      <em>click to see blog</em>
                    </span>
                  }
                >
                  <a
                    className="about-tooltip-source"
                    href={reflectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    within the next few years
                  </a>
                </Tooltip>{' '}
                (give or take 2030). If that timeline is even remotely plausible,
                why are our political institutions still built around decision
                cycles designed for a much slower world?
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <p>
        I’m curious about where this little journey across the pale blue dot we
        call home takes me next. Hopefully somewhere unexpected. Hopefully also
        skydiving, despite several friends warning me that this is a{' '}
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
        This website is still a work in progress, much like I am: constantly
        learning things, changing my mind, making things, collecting thoughts,
        and meeting people who are genuinely excited about what they do
      </p>
      <p>
        If you’re in political science, metascience, neuroeconomics,
        astrophysics, or some wonderfully specific niche thing that you are
        passionate about, then you’re probably in the right place. I find people
        who take their curiosities seriously and stay in awe of whatever they
        uncover to be one of the{' '}
        <Tooltip
          containerClassName="about-inline-tooltip"
          content={
            <span className="about-tooltip-copy">
              When people say ‘hidden gems’ of the world, I like to think of
              those people as lapis lazuli. It’s a stone associated with wisdom,
              truth, and something almost divine, and I’ve always liked how its
              deep blue and little flecks of gold look almost like a tiny night
              sky.
            </span>
          }
        >
          <button type="button" className="about-inline-easter-egg">
            best aspects about society
          </button>
        </Tooltip>
        .
      </p>
      <p>
        If you care about doing good and are deeply passionate something, I’d
        like to hear about it. Shoot me an{' '}
        <EmailTooltip
          className="about-inline-easter-egg"
          containerClassName="about-inline-tooltip"
        />{' '}
        or connect with me on{' '}
        <a
          className="about-inline-easter-egg"
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        .
      </p>

      <p className="about-signoff">Thanks for dropping by :)</p>
    </div>
  )
}
