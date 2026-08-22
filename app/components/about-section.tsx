import Link from 'next/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/core/accordion'
import { Tooltip } from '@/components/ui/tooltip-card'

export function AboutSection() {
  return (
    <section className="about-section" aria-label="Explore more about Sara">
      <div className="about-link-row">
        <Link className="about-trigger about-link w-full py-0.5" href="/about">
          A little about me
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
          </AccordionContent>
        </AccordionItem>

        <AccordionItem className="homepage-accordion-item" value="projects">
          <AccordionTrigger className="about-trigger w-full py-0.5">
            Project
          </AccordionTrigger>
          <AccordionContent className="homepage-accordion-content">
            <div className="homepage-accordion-entries">
              <article className="homepage-accordion-entry">
                <Tooltip
                  containerClassName="homepage-accordion-tooltip"
                  content="My little public home for essays and projects on technology, policy, and global affairs—mostly where emerging technologies and the political world begin to overlap."
                >
                  <a className="homepage-accordion-title" href="https://cepheus-pons.org/">
                    Cepheus
                  </a>
                </Tooltip>
              </article>

              <article className="homepage-accordion-entry">
                <Tooltip
                  containerClassName="homepage-accordion-tooltip"
                  content="An open-source project for turning political, legal, and institutional research into structured, traceable knowledge, while keeping the source, uncertainty, and disagreement visible."
                >
                  <span className="homepage-accordion-title">Writ</span>
                </Tooltip>
                <p className="homepage-accordion-links">
                  <a href="https://writewrit.vercel.app/">Demo</a>
                  <a href="https://github.com/saykig/Writ">GitHub</a>
                </p>
              </article>

              <article className="homepage-accordion-entry">
                <Tooltip
                  containerClassName="homepage-accordion-tooltip"
                  content="An experiment in making research datasets easier to compare without pretending they measure the same thing. It asks where sources really align, where they only partly align, and what gets lost when we treat them as equivalent."
                >
                  <a
                    className="homepage-accordion-title"
                    href="https://github.com/saykig/Aldera"
                  >
                    Aldera
                  </a>
                </Tooltip>
              </article>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem className="homepage-accordion-item" value="poetry">
          <AccordionTrigger className="about-trigger w-full py-0.5">
            Poetry
          </AccordionTrigger>
          <AccordionContent className="homepage-accordion-content">
            <div />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem className="homepage-accordion-item" value="life">
          <AccordionTrigger className="about-trigger w-full py-0.5">
            Life
          </AccordionTrigger>
          <AccordionContent className="homepage-accordion-content">
            <p>to be continued...</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  )
}
