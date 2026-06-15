"use client"
import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'

const MDiv: any = motion.div

export default function LabBox() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const flameRef = useRef<HTMLDivElement | null>(null)
  const [oxygen, setOxygen] = useState<number>(100)

  useEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.particle',
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, repeat: -1, yoyo: true }
      )
    }, containerRef)
    return () => ctx.revert()
  }, [])

  const onDragEnd = (_: any, __: any, name: string) => {
    if (name === 'leaf') {
      setOxygen((o) => Math.min(100, o + 20))
      if (flameRef.current) gsap.to(flameRef.current, { scale: 1.12, duration: 0.25, yoyo: true, repeat: 1 })
    }
    if (name === 'beaker') {
      setOxygen((o) => Math.max(0, o - 45))
      if (flameRef.current) gsap.to(flameRef.current, { opacity: 0, duration: 0.5 })
    }
  }

  return (
    <div className="lab-box p-6" style={{ minHeight: 360 }} ref={containerRef}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Virtual Lab Box</h2>
        <div className="text-sm">Oxygen: <strong>{oxygen}%</strong></div>
      </div>

      <div className="relative bg-white rounded-lg border border-boundary p-6 h-64">
        {/* Flame visual */}
        <div ref={flameRef} className="absolute left-1/2 top-1/3 -translate-x-1/2">
          <div className="w-10 h-14 bg-gradient-to-b from-amber-300 to-amber-500 rounded-full flex items-end justify-center particle">
            <div className="w-2 h-6 bg-white/80 rounded-sm" />
          </div>
        </div>

        {/* Inventory / draggable assets */}
        <div className="absolute bottom-4 left-4 flex gap-4">
          <MDiv
            className="w-12 h-12 bg-green-200 rounded-md flex items-center justify-center cursor-grab"
            drag
            dragConstraints={{ left: 0, right: 600, top: -200, bottom: 200 }}
            onDragEnd={(e, info) => onDragEnd(e, info, 'leaf')}
            whileTap={{ cursor: 'grabbing' }}>
            Leaf
          </MDiv>

          <MDiv
            className="w-12 h-12 bg-blue-200 rounded-md flex items-center justify-center cursor-grab"
            drag
            dragConstraints={{ left: 0, right: 600, top: -200, bottom: 200 }}
            onDragEnd={(e, info) => onDragEnd(e, info, 'beaker')}
            whileTap={{ cursor: 'grabbing' }}>
            Beaker
          </MDiv>

          <MDiv
            className="w-12 h-12 bg-yellow-200 rounded-md flex items-center justify-center cursor-grab"
            drag
            dragConstraints={{ left: 0, right: 600, top: -200, bottom: 200 }}
            onDragEnd={(e, info) => onDragEnd(e, info, 'candle')}
            whileTap={{ cursor: 'grabbing' }}>
            Candle
          </MDiv>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-600">Drag assets onto the canvas to see simple GSAP + Framer Motion interactions.</p>
    </div>
  )
}
