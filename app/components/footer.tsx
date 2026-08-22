import { LicenseEasterEgg } from './license-easter-egg'

export default function Footer() {
  return (
    <footer className="site-footer mb-16">
      <div className="site-footer-inner">
        <p className="text-neutral-600 dark:text-neutral-300">
          © 2026 MIT licensed, <LicenseEasterEgg />
        </p>
      </div>
    </footer>
  )
}
