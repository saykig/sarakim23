import { LicenseEasterEgg } from './license-easter-egg'
import { ContactLinks } from './contact-links'

export default function Footer() {
  return (
    <footer className="site-footer mb-16">
      <div className="site-footer-inner">
        <ContactLinks />
        <p className="text-neutral-600 dark:text-neutral-300">
          © {new Date().getFullYear()} MIT licensed, <LicenseEasterEgg />
        </p>
      </div>
    </footer>
  )
}
