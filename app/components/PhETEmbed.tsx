import React from 'react'

export default function PhETEmbed({ src, title = 'PhET Simulation' }: { src: string; title?: string }) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <div className="w-full" style={{ aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-boundary)' }}>
        <iframe
          title={title}
          src={src}
          width="100%"
          height="100%"
          sandbox="allow-scripts allow-same-origin allow-forms"
          style={{ border: '0', width: '100%', height: '100%' }}
        />
      </div>
      <p className="mt-2 text-sm text-gray-600">Simulations served by PhET (phet.colorado.edu). Use src to switch simulations.</p>
    </div>
  )
}
