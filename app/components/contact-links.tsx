'use client'

import { Tooltip } from '@/components/ui/tooltip-card'

export const linkedInUrl = 'https://www.linkedin.com/in/sarakim203/'

type EmailTooltipProps = {
  className?: string
  containerClassName?: string
}

export function EmailTooltip({
  className = 'personal-contact-email',
  containerClassName,
}: EmailTooltipProps) {
  return (
    <Tooltip
      content="sarakim203@gmail.com"
      containerClassName={['email-tooltip', containerClassName]
        .filter(Boolean)
        .join(' ')}
    >
      <button type="button" className={className}>
        email
      </button>
    </Tooltip>
  )
}

export function ContactLinks() {
  return (
    <nav className="personal-contact-links" aria-label="Find Sara online">
      <EmailTooltip />
      <span aria-hidden="true">·</span>
      <a
        href={linkedInUrl}
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
