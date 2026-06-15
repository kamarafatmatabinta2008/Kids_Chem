"use client"
import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { evaluateRules, Rule } from '../../src/lab/ruleEngine'

type LabConfig = {
  assets: string[]
  rules: Rule[]
}

type AssetInstance = { id: string; name: string; x: number; y: number; z: number }

export default function EnhancedLabBox({ 
  storageKey = 'labbox_state',
  config
}: { 
  storageKey?: string
  config?: LabConfig
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const flameRef = useRef<HTMLDivElement | null>(null)
  
  const rules = config?.rules || []
  const [oxygen, setOxygen] = useState<number>(100)
  const [flameOn, setFlameOn] = useState<boolean>(true)

  // Map string assets to AssetInstance objects
  const assets: AssetInstance[] = (config?.assets || []).map((assetId, index) => ({
    id: assetId,
    name: assetId.charAt(0).toUpperCase() + assetId.slice(1),
    x: 20 + (index * 60),
    y: 200,
    z: 10
  }))

  useEffect(() => {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      try { 
        const parsed = JSON.parse(raw)
        if (parsed.oxygen != null) { 
          setOxygen(parsed.oxygen)
          setFlameOn(parsed.flameOn ?? true) 
        } 
      } catch {
        // ignore parse errors
      }
    } else {
      // Default state for new topic
      setOxygen(100)
      setFlameOn(true)
    }
  }, [storageKey])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.particle', { opacity: flameOn ? 1 : 0, duration: 0.4 })
    }, containerRef)
    return () => ctx.revert()
  }, [flameOn])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ oxygen, flameOn }))
  }, [oxygen, flameOn, storageKey])

  function rectOf(el: HTMLElement | null) {
    if (!el) return null
    return el.getBoundingClientRect()
  }

  function detectCollision(assetEl: HTMLElement | null, targetEl: HTMLElement | null) {
    const a = rectOf(assetEl); const b = rectOf(targetEl)
    if (!a || !b) return false
    // Collision padding
    const padding = 10
    return !(a.right < b.left + padding || a.left > b.right - padding || a.bottom < b.top + padding || a.top > b.bottom - padding)
  }

  async function handleCollision(trigger: string) {
    const { state: next, events } = evaluateRules({ oxygen, flameOn }, rules, trigger)
    
    if (events.length > 0) {
      setOxygen(next.oxygen)
      setFlameOn(next.flameOn)

      // Animation feedback
      if (events.some(e => e.startsWith('oxygen_increased'))) {
        if (flameRef.current) {
          gsap.fromTo(flameRef.current, { scale: 1 }, { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 })
        }
      }

      // Sync to server
      try { 
        await fetch('/api/lab-sync', { 
          method: 'POST', 
          headers: { 'content-type': 'application/json' }, 
          body: JSON.stringify({ trigger, oxygen: next.oxygen, flameOn: next.flameOn, storageKey }) 
        }) 
      } catch (e) { /* ignore */ }
    }
  }

  return (
    <div className="lab-box bg-white p-6 rounded-xl shadow-md border border-slate-200" ref={containerRef}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Virtual Lab</h2>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-slate-500 uppercase tracking-tight">Oxygen Level</div>
          <div className={`text-lg font-bold ${oxygen < 20 ? 'text-red-500' : 'text-blue-600'}`}>
            {oxygen}%
          </div>
        </div>
      </div>

      <div className="relative bg-slate-900 rounded-lg h-80 overflow-hidden shadow-inner border-4 border-slate-800">
        {/* Flame / Center Target */}
        <div ref={flameRef} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className={`w-16 h-24 rounded-full flex items-end justify-center transition-opacity duration-500 particle ${flameOn ? 'opacity-100' : 'opacity-0'}`} 
               style={{ background: 'radial-gradient(circle at center, #fff 0%, #ffddb1 30%, #ff9900 70%, transparent 100%)', filter: 'blur(2px)' }}>
            <div className="w-1 h-12 bg-slate-400/40 rounded-full mb-2" />
          </div>
          {!flameOn && <div className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">FLAME OUT</div>}
        </div>

        {/* Drag constraints area */}
        <div className="absolute inset-0 z-10">
          {assets.map(a => (
            <motion.div
              key={a.id}
              className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg flex flex-col items-center justify-center cursor-grab active:cursor-grabbing text-[10px] font-bold text-slate-800 border-2 border-white"
              drag
              dragMomentum={false}
              style={{ x: a.x, y: a.y, zIndex: 30 }}
              onDragEnd={(e) => {
                const el = (e.target as HTMLElement)
                const flameEl = flameRef.current
                if (detectCollision(el, flameEl)) {
                  // Specific logic for candle-beaker-leaf topic
                  if (a.id === 'beaker') handleCollision('beaker_on_candle')
                  if (a.id === 'leaf') handleCollision('leaf_in_beaker')
                  
                  // Generic logic for other topics
                  handleCollision(`${a.id}_on_target`)
                }
              }}
            >
              <div className="text-2xl mb-1">
                {a.id === 'leaf' ? '🌿' : a.id === 'beaker' ? '🧪' : a.id === 'candle' ? '🕯️' : '📦'}
              </div>
              {a.name}
            </motion.div>
          ))}
        </div>
        
        <div className="absolute bottom-2 right-2 text-[10px] text-slate-500 italic">
          Tactile Canvas v1.0
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Status</div>
          <div className="text-sm font-semibold text-slate-700">{flameOn ? 'Active Reaction' : 'Reaction Stopped'}</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Environment</div>
          <div className="text-sm font-semibold text-slate-700">Closed System</div>
        </div>
      </div>
      
      <p className="mt-4 text-xs text-slate-500 leading-relaxed">
        <strong>Experiment:</strong> Interact with the assets to observe chemical changes. 
        Your progress is automatically saved to your profile.
      </p>
    </div>
  )
}
