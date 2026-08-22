import { HomeGlobeNav } from './components/home-globe-nav'

export default function NotFound() {
  return (
    <section>
      <header className="internal-page-heading-row mb-8">
        <h1 className="text-2xl font-semibold tracking-tighter">
          404 - Page Not Found
        </h1>
        <HomeGlobeNav />
      </header>
      <p className="mb-4">The page you are looking for does not exist.</p>
    </section>
  )
}
