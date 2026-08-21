import { LicenseEasterEgg } from './license-easter-egg'

export default function Footer() {
  return (
    <footer className="site-footer mb-16">
      <p className="text-neutral-600 dark:text-neutral-300">
        © {new Date().getFullYear()} MIT licensed, <LicenseEasterEgg />
      </p>
    </footer>
  )
}
