import Link from 'next/link'

export function AboutSection() {
  return (
    <section className="about-section" aria-label="Explore more about Sara">
      <div className="about-accordion flex w-full flex-col">
        <Link className="about-trigger w-full py-0.5" href="/about">
          A little about me
        </Link>
      </div>
    </section>
  )
}
