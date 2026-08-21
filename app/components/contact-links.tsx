'use client'

import { Tooltip } from '@/components/ui/tooltip-card'

export function ContactLinks() {
  return (
    <nav className="personal-contact-links" aria-label="Find Sara online">
      <Tooltip content="sarakim203@gmail.com">
        <button type="button" className="personal-contact-email">
          email
        </button>
      </Tooltip>
      <span aria-hidden="true">·</span>
      <a
        href="https://www.linkedin.com/in/sarakim203/"
        target="_blank"
        rel="noopener noreferrer"
      >
        linkedin
      </a>
      <span aria-hidden="true">·</span>
      <a
        href="https://github.com/saykig"
        target="_blank"
        rel="noopener noreferrer"
      >
        github
      </a>
    </nav>
  )
}
