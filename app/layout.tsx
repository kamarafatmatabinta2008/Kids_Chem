import React from 'react'
import './globals.css'
import Link from 'next/link'
import SearchBar from './components/SearchBar'

export const metadata = {
  title: 'KidsChem v2.0 - Interactive Science Lab',
  description: 'Interactive Science Simplifier & Visual Sandbox for Kids',
  icons: { icon: '/favicon.svg' },
}

const neonBtn = 'px-4 py-2 bg-lime-400 text-deep font-black rounded-xl hover:bg-lime-300 transition-all text-sm uppercase tracking-wider shadow-lg shadow-lime-400/20'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#090A1A] text-[#FAF9F6] min-h-screen">
        <header className="sticky top-0 z-50 bg-[#090A1A]/90 backdrop-blur-xl border-b border-[#22254F] shadow-sm">
          <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl">🧪</span>
              <span className="text-xl font-black text-[#FAF9F6] tracking-tight">Kids<span className="text-[#8CE600]">Chem</span></span>
            </Link>
            <div className="flex items-center gap-4">
              <SearchBar />
              <NavLink href="/" icon="🏠" label="Home" />
              <NavLink href="/books" icon="📚" label="Books" />
              <NavLink href="/videos" icon="🎬" label="Videos" />
              <NavLink href="/lab" icon="🔬" label="Lab" />
              <Link href="/login" className={neonBtn}>Sign In</Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}

function NavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-[#8888AA] hover:text-[#8CE600] hover:bg-[#8CE600]/10 rounded-xl transition-all"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  )
}
