import { BlogPosts } from 'app/components/posts'
import { HomeGlobeNav } from 'app/components/home-globe-nav'

export const metadata = {
  title: 'Blog',
  description: 'Read my blog.',
}

export default function Page() {
  return (
    <section>
      <header className="internal-page-heading-row mb-8">
        <h1 className="font-semibold text-2xl tracking-tighter">My Blog</h1>
        <HomeGlobeNav />
      </header>
      <BlogPosts />
    </section>
  )
}
