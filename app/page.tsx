import { BlogPosts } from 'app/components/posts'
import { AboutSection } from './components/about-section'
import { SoftAtlas } from './components/soft-atlas'
import { WordRotate } from './components/word-rotate'

/*
THESIS: Sara's introduction opens into an atlas where place becomes an index for memory.
OWN-WORLD: Soft Atlas — paper green, sage ink, quiet geography, no visible container chrome.
STORY: Meet Sara on the left, discover her world on the right, then continue into biography and writing.
FIRST VIEWPORT: One shared left edge holds all hero copy while a bounded frame reveals an oversized partial globe.
FORM: A quiet editorial map with calm rotation, direct drag, small archival markers, and honest incomplete destinations.
*/

export default function Page() {
  return (
    <section className="soft-atlas-page">
      <section className="soft-atlas-hero" aria-labelledby="homepage-greeting">
        <div className="soft-atlas-hero-inner">
          <div className="hero-copy">
            <h1 id="homepage-greeting" className="hero-greeting">
              <WordRotate />
              <span className="hero-name">i’m Sara.</span>
            </h1>

            <div className="hero-support">
              <p className="hero-intro">
                i study power, security, and the strange ways people organize
                the world around them.
              </p>
              <p className="hero-current">
                currently, i’m a graduate student at the Munk School of Global
                Affairs &amp; Public Policy at the University of Toronto.
              </p>
              <p className="hero-atlas-note">
                an atlas of places i’ve called home and places that stayed with
                me.
              </p>
            </div>
          </div>

          <SoftAtlas />
        </div>
      </section>

      <div className="homepage-shell">
        <AboutSection />

        <section className="homepage-writing" aria-label="Recent writing">
          <BlogPosts />
        </section>
      </div>
    </section>
  )
}
