import { BlogPosts } from 'app/components/posts'
import { AboutSection } from './components/about-section'
import { WordRotate } from './components/word-rotate'

/*
THESIS: A generous personal introduction replaces the portfolio-template pitch.
OWN-WORLD: Geist, black and white, wide margins, no containers; type is the image.
STORY: Meet Sara, understand what she studies and where she has lived, then choose whether to read further.
FIRST VIEWPORT: One oversized greeting sits vertically centered above three progressively quieter lines.
FORM: A restrained editorial extension of the incumbent site, with one multilingual motion event and one disclosure.
*/

export default function Page() {
  return (
    <section className="homepage-shell">
      <section className="homepage-hero" aria-labelledby="homepage-greeting">
        <div className="hero-copy">
          <h1 id="homepage-greeting" className="hero-greeting">
            <WordRotate />
            <span className="hero-name">i’m Sara.</span>
          </h1>

          <div className="hero-support">
            <p className="hero-intro">
              i study power, security, and the strange ways people organize the
              world around them.
            </p>
            <p className="hero-current">
              currently, i’m a graduate student at the Munk School of Global
              Affairs &amp; Public Policy at the University of Toronto.
            </p>
            <p className="hero-places">
              Vancouver → Tashkent → St. Petersburg → Daejeon → Toronto
            </p>
          </div>
        </div>
      </section>

      <AboutSection />

      <section className="homepage-writing" aria-label="Recent writing">
        <BlogPosts />
      </section>
    </section>
  )
}
