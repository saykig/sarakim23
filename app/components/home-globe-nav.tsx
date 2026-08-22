import Link from 'next/link'

type HomeGlobeNavProps = {
  className?: string
}

export function HomeGlobeNav({ className = '' }: HomeGlobeNavProps) {
  const classes = ['home-globe-nav', className].filter(Boolean).join(' ')

  return (
    <Link href="/" className={classes} aria-label="Return to homepage">
      <svg
        className="home-globe-nav-icon"
        viewBox="0 0 40 40"
        role="img"
        aria-hidden="true"
      >
        <g className="home-globe-nav-sphere">
          <path
            className="home-globe-nav-stroke home-globe-nav-outline"
            pathLength="1"
            d="M20.1 3.2C10.9 3 3.6 10.3 3.7 19.8c.1 9.6 7.5 16.9 16.8 16.7 9.2-.2 16.1-7.5 15.8-16.8-.2-9.2-7.1-16.3-16.2-16.5Z"
          />
          <path
            className="home-globe-nav-stroke home-globe-nav-meridian"
            pathLength="1"
            d="M20.2 3.4c-5.1 4.4-7.4 10.1-7.3 16.5.1 6.6 2.7 12.2 7.5 16.4"
          />
          <path
            className="home-globe-nav-stroke home-globe-nav-meridian home-globe-nav-stroke-delayed"
            pathLength="1"
            d="M20.2 3.4c5 4.5 7.4 10.3 7.2 16.6-.2 6.5-2.7 12.1-7 16.3"
          />
          <path
            className="home-globe-nav-stroke home-globe-nav-latitude"
            pathLength="1"
            d="M6.2 11.4c3.9 2.4 8.5 3.6 13.9 3.6 5.6 0 10.1-1.2 13.9-3.7"
          />
          <path
            className="home-globe-nav-stroke home-globe-nav-latitude home-globe-nav-stroke-delayed"
            pathLength="1"
            d="M4.3 21.2c5.3-1.3 10.5-1.8 15.8-1.7 5.6 0 10.9.6 15.7 1.8"
          />
          <path
            className="home-globe-nav-stroke home-globe-nav-latitude"
            pathLength="1"
            d="M6.6 28.8c3.9-2.2 8.4-3.3 13.7-3.3 5.4.1 9.8 1.2 13.5 3.5"
          />
        </g>
      </svg>
    </Link>
  )
}
