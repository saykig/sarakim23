'use client'

import { useRef, useState } from 'react'
import { TransitionPanel } from '@/components/core/transition-panel'

const projects = [
  {
    title: 'Cepheus',
    description:
      'My little public home for essays and projects on technology, policy, and global affairs—mostly where emerging technologies and the political world begin to overlap.',
    links: [{ label: 'Visit Cepheus', href: 'https://cepheus-pons.org/' }],
  },
  {
    title: 'Writ',
    description:
      'An open-source project for turning political, legal, and institutional research into structured, traceable knowledge, while keeping the source, uncertainty, and disagreement visible.',
    links: [
      { label: 'Demo', href: 'https://writewrit.vercel.app/' },
      { label: 'GitHub', href: 'https://github.com/saykig/Writ' },
    ],
  },
  {
    title: 'Aldera',
    description:
      'An experiment in making research datasets easier to compare without pretending they measure the same thing. It asks where sources really align, where they only partly align, and what gets lost when we treat them as equivalent.',
    links: [{ label: 'GitHub', href: 'https://github.com/saykig/Aldera' }],
  },
] as const

export function ProjectsTransitionPanel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const selectProject = (index: number) => {
    setActiveIndex(index)
    tabRefs.current[index]?.focus()
  }

  return (
    <div className="projects-transition-panel">
      <div className="projects-tabs" role="tablist" aria-label="Projects">
        {projects.map((project, index) => (
          <button
            key={project.title}
            ref={(element) => {
              tabRefs.current[index] = element
            }}
            id={`project-tab-${index}`}
            type="button"
            role="tab"
            aria-controls={`project-panel-${index}`}
            aria-selected={activeIndex === index}
            tabIndex={activeIndex === index ? 0 : -1}
            className="projects-tab"
            data-active={activeIndex === index}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') {
                event.preventDefault()
                selectProject((index + 1) % projects.length)
              }
              if (event.key === 'ArrowLeft') {
                event.preventDefault()
                selectProject((index - 1 + projects.length) % projects.length)
              }
              if (event.key === 'Home') {
                event.preventDefault()
                selectProject(0)
              }
              if (event.key === 'End') {
                event.preventDefault()
                selectProject(projects.length - 1)
              }
            }}
          >
            {project.title}
          </button>
        ))}
      </div>

      <div className="projects-panel-divider">
        <TransitionPanel
          activeIndex={activeIndex}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          variants={{
            enter: { opacity: 0, y: -20, filter: 'blur(2px)' },
            center: { opacity: 1, y: 0, filter: 'blur(0px)' },
            exit: { opacity: 0, y: 20, filter: 'blur(2px)' },
          }}
        >
          {projects.map((project, index) => (
            <div
              key={project.title}
              id={`project-panel-${index}`}
              className="projects-panel-content"
              role="tabpanel"
              aria-labelledby={`project-tab-${index}`}
              tabIndex={0}
            >
              <p>{project.description}</p>
              <p className="projects-panel-links">
                {project.links.map((link, linkIndex) => (
                  <span key={link.href}>
                    {linkIndex > 0 ? <span aria-hidden="true"> · </span> : null}
                    <a href={link.href}>{link.label}</a>
                  </span>
                ))}
              </p>
            </div>
          ))}
        </TransitionPanel>
      </div>
    </div>
  )
}
