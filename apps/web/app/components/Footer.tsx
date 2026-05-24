import Link from 'next/link'

const LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Movies', href: '/?category=Movies' },
  { label: 'Documentaries', href: '/?category=Documentaries' },
  { label: 'Kids', href: '/?category=Kids' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Account', href: '/account' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
]

export function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-900 px-4 sm:px-12 py-10">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-5">

        {/* Logo */}
        <div className="overflow-hidden" style={{ width: 60, height: 38 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpeg" alt="AbundanZ" style={{ width: 60, height: 'auto', display: 'block' }} />
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-3 max-w-xs sm:max-w-none">
          {LINKS.map(({ label, href }) => (
            <Link key={label} href={href} className="text-xs text-zinc-500 hover:text-white transition-colors">
              {label}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-xs text-zinc-700 text-center">
          © {new Date().getFullYear()} AbundanZ · Christian Media
        </p>

      </div>
    </footer>
  )
}
