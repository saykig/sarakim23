import Link from 'next/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/core/accordion'
import { ProjectsTransitionPanel } from './projects-transition-panel'
import { Tooltip } from '@/components/ui/tooltip-card'

export function AboutSection() {
  return (
    <section className="about-section" aria-label="Explore more about Sara">
      <div className="about-link-row">
        <Link className="about-trigger about-link w-full py-0.5" href="/about">
          A little bit about me
        </Link>
      </div>

      <Accordion className="about-accordion flex w-full flex-col">
        <AccordionItem className="homepage-accordion-item" value="reading">
          <AccordionTrigger className="about-trigger w-full py-0.5">
            Reading
          </AccordionTrigger>
          <AccordionContent className="homepage-accordion-content">
            <p>to be continued...</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem className="homepage-accordion-item" value="writings">
          <AccordionTrigger className="about-trigger w-full py-0.5">
            Writing
          </AccordionTrigger>
          <AccordionContent className="homepage-accordion-content">
            <div className="homepage-writing-list">
              <article className="homepage-accordion-entry homepage-accordion-entry-poetry">
                <Link
                  className="homepage-accordion-title"
                  href="/writing/poetry"
                  aria-describedby="homepage-poetry-helper"
                >
                  Poetry
                </Link>
                <span
                  id="homepage-poetry-helper"
                  className="writing-helper-text"
                >
                  Some poems I have written over the years.
                </span>
              </article>
              <article className="homepage-accordion-entry">
                <Tooltip
                  containerClassName="homepage-accordion-tooltip"
                  content="An essay about the growing distance between the people building advanced AI and the institutions expected to govern it. It asks who holds technical knowledge, who holds public authority, and what happens when those responsibilities sit in different places."
                >
                  <a
                    className="homepage-accordion-title"
                    href="https://cepheus-pons.org/essays/what-we-owe-to-each-other"
                  >
                    What We Owe to Each Other
                  </a>
                </Tooltip>
              </article>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem className="homepage-accordion-item" value="projects">
          <AccordionTrigger className="about-trigger w-full py-0.5">
            Working
          </AccordionTrigger>
          <AccordionContent className="homepage-accordion-content">
            <ProjectsTransitionPanel />
          </AccordionContent>
        </AccordionItem>

        <div className="homepage-accordion-item">
          <Link
            className="about-trigger w-full py-0.5"
            href="/about#important-notes"
          >
            Important notes
          </Link>
        </div>
      </Accordion>
    </section>
  )
}
