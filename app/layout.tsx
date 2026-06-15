import React from 'react'
import './globals.css'

export const metadata = {
  title: 'KidsChem',
  description: 'Interactive Science Simplifier & Visual Sandbox'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-canvas text-slate min-h-screen">{children}</body>
    </html>
  )
}
