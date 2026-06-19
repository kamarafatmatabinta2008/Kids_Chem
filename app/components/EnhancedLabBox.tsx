"use client"
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { evaluateRules, Rule } from '../../src/lab/ruleEngine'

type LabConfig = {
  assets: string[]
  rules: Rule[]
}

type AssetInstance = {
  id: string
  name: string
  x: number
  y: number
  z: number
  dropped: boolean
}

const SUBJECT_THEMES: Record<string, {
  gradient: string
  glow: string
  bg: string
  particle: string
  accent: string
  centerEmoji: string
  centerLabel: string
  inactiveLabel: string
  revealColor: string
}> = {
  CHEMISTRY: {
    gradient: 'from-purple-900 via-indigo-900 to-slate-900',
    glow: 'shadow-purple-500/30',
    bg: 'bg-purple-950',
    particle: '#a855f7',
    accent: 'from-purple-500 to-pink-500',
    centerEmoji: '⚗️',
    centerLabel: 'REACTION ZONE',
    inactiveLabel: 'REACTION STOPPED',
    revealColor: '#c084fc'
  },
  PHYSICS: {
    gradient: 'from-blue-900 via-cyan-900 to-slate-900',
    glow: 'shadow-blue-500/30',
    bg: 'bg-blue-950',
    particle: '#0ea5e9',
    accent: 'from-blue-500 to-cyan-500',
    centerEmoji: '⚡',
    centerLabel: 'ENERGY ZONE',
    inactiveLabel: 'ENERGY DEPLETED',
    revealColor: '#38bdf8'
  },
  BIOLOGY: {
    gradient: 'from-emerald-900 via-green-900 to-slate-900',
    glow: 'shadow-emerald-500/30',
    bg: 'bg-emerald-950',
    particle: '#10b981',
    accent: 'from-emerald-500 to-green-500',
    centerEmoji: '🌱',
    centerLabel: 'GROWTH ZONE',
    inactiveLabel: 'DORMANT',
    revealColor: '#34d399'
  }
}

const PER_ASSET_COLORS: Record<string, string> = {
  candle: '#f59e0b', beaker: '#8b5cf6', leaf: '#22c55e', plant: '#16a34a',
  'heat-source': '#ef4444', sunlight: '#eab308', water: '#3b82f6',
  'chemical-a': '#ec4899', 'chemical-b': '#f97316', container: '#94a3b8',
  'hot-object': '#dc2626', 'cold-object': '#06b6d4', thermometer: '#64748b',
  ice: '#7dd3fc', steam: '#e2e8f0'
}

const PER_ASSET_GLOW: Record<string, string> = {
  candle: 'shadow-amber-500/60', beaker: 'shadow-purple-500/60', leaf: 'shadow-green-500/60',
  plant: 'shadow-green-600/60', 'heat-source': 'shadow-red-500/60', sunlight: 'shadow-yellow-500/60',
  water: 'shadow-blue-500/60', 'chemical-a': 'shadow-pink-500/60', 'chemical-b': 'shadow-orange-500/60',
  container: 'shadow-slate-500/60', 'hot-object': 'shadow-red-600/60', 'cold-object': 'shadow-cyan-500/60',
  thermometer: 'shadow-slate-500/60', ice: 'shadow-sky-500/60', steam: 'shadow-slate-400/60'
}

const ASSET_EFFECTS: Record<string, {
  onDrop: string
  description: string
}> = {
  candle: { onDrop: '🔥 Burns oxygen!', description: 'Candle consumes O₂' },
  beaker: { onDrop: '🧪 Mixing chemicals...', description: 'Chemical reaction' },
  leaf: { onDrop: '🌿 Produces oxygen!', description: 'Leaf makes O₂' },
  plant: { onDrop: '🌱 Grows in light!', description: 'Plant photosynthesis' },
  'heat-source': { onDrop: '🔥 Raises temperature!', description: 'Heat added' },
  sunlight: { onDrop: '☀️ Energizes!', description: 'Solar energy' },
  water: { onDrop: '💧 Hydrates!', description: 'Water added' },
  'chemical-a': { onDrop: '🧪 Reacts!', description: 'Chemical A' },
  'chemical-b': { onDrop: '⚗️ Fizzes!', description: 'Chemical B' },
  container: { onDrop: '🥃 Holds mixture', description: 'Container' },
  'hot-object': { onDrop: '🌡️ Transfers heat!', description: 'Hot object' },
  'cold-object': { onDrop: '🧊 Cools down!', description: 'Cold object' },
  thermometer: { onDrop: '🌡️ Measures temp!', description: 'Thermometer' },
  ice: { onDrop: '🧊 Melting...', description: 'Ice cube' },
  steam: { onDrop: '💨 Evaporates!', description: 'Steam' }
}

function ParticleField({ count = 40, color = '#a855f7' }: { count?: number; color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId: number
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * 400, y: Math.random() * 400,
      vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 2.5 + 1, o: Math.random() * 0.5 + 0.2
    }))
    function draw() {
      ctx!.clearRect(0, 0, 400, 400)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > 400) p.vx *= -1
        if (p.y < 0 || p.y > 400) p.vy *= -1
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = color
        ctx!.globalAlpha = p.o
        ctx!.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [count, color])
  return <canvas ref={canvasRef} width={400} height={400} className="absolute inset-0 w-full h-full pointer-events-none opacity-50" />
}

function ReactionBurst({ color, onDone }: { color: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 1200); return () => clearTimeout(t) }, [onDone])
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
      {[...Array(16)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{ background: color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(i * 22.5 * Math.PI / 180) * (100 + Math.random() * 60),
            y: Math.sin(i * 22.5 * Math.PI / 180) * (100 + Math.random() * 60),
            opacity: 0,
            scale: 0
          }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.03 }}
        />
      ))}
    </div>
  )
}

function FloatingEmoji({ emoji, onDone }: { emoji: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 1500); return () => clearTimeout(t) }, [onDone])
  return (
    <motion.div
      className="absolute z-40 text-4xl pointer-events-none"
      initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
      animate={{ y: -80, opacity: 0, scale: 1.5 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      {emoji}
    </motion.div>
  )
}

export default function EnhancedLabBox({
  storageKey = 'labbox_state',
  config
}: {
  storageKey?: string
  config?: LabConfig
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)
  const [oxygen, setOxygen] = useState(100)
  const [flameOn, setFlameOn] = useState(true)
  const [burstKey, setBurstKey] = useState(0)
  const [showResult, setShowResult] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [phase, setPhase] = useState(0)
  const [droppedAssets, setDroppedAssets] = useState<Set<string>>(new Set())
  const [floatEmoji, setFloatEmoji] = useState<string | null>(null)

  const rules = config?.rules || []
  const configuredAssets = config?.assets || []

  const subject = configuredAssets.some(a => ['leaf', 'plant'].includes(a)) ? 'BIOLOGY'
    : configuredAssets.some(a => ['chemical-a', 'chemical-b', 'beaker', 'candle'].includes(a)) ? 'CHEMISTRY'
    : 'PHYSICS'

  const theme = SUBJECT_THEMES[subject] || SUBJECT_THEMES.PHYSICS

  const [assets, setAssets] = useState<AssetInstance[]>([])

  useEffect(() => {
    setAssets(configuredAssets.map((assetId, index) => ({
      id: assetId,
      name: assetId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      x: 20 + (index * 90),
      y: 50 + (index % 2) * 60,
      z: 10,
      dropped: false
    })))
  }, [configuredAssets])

  useEffect(() => {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (parsed.oxygen != null) setOxygen(parsed.oxygen)
        if (parsed.flameOn != null) setFlameOn(parsed.flameOn)
        if (parsed.score != null) setScore(parsed.score)
        if (parsed.phase != null) setPhase(parsed.phase)
      } catch { /* ignore */ }
    }
  }, [storageKey])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.particle', { opacity: flameOn ? 1 : 0, duration: 0.4 })
    }, containerRef)
    return () => ctx.revert()
  }, [flameOn])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ oxygen, flameOn, score, phase }))
  }, [oxygen, flameOn, score, phase, storageKey])

  function detectCollision(a: DOMRect | null, b: DOMRect | null) {
    if (!a || !b) return false
    const pad = 12
    return !(a.right < b.left + pad || a.left > b.right - pad || a.bottom < b.top + pad || a.top > b.bottom - pad)
  }

  const onBurstDone = useCallback(() => setBurstKey(0), [])
  const onEmojiDone = useCallback(() => setFloatEmoji(null), [])

  async function handleInteraction(assetId: string, assetName: string) {
    if (droppedAssets.has(assetId)) return

    // Try multiple trigger patterns to match seed data rules
    const triggers: string[] = [
      `${assetId}_on_target`,
      `${assetId}_dropped`,
      `${assetId}_added`,
      `${assetId}_on_center`,
    ]
    // Also try two-asset triggers using already-dropped assets
    droppedAssets.forEach(otherId => {
      triggers.push(`${assetId}_on_${otherId}`)
      triggers.push(`${otherId}_on_${assetId}`)
      triggers.push(`${assetId}_with_${otherId}`)
      triggers.push(`${otherId}_with_${assetId}`)
    })

    let matchedTrigger = ''
    let { state: next, events } = { state: { oxygen, flameOn, score, combo, phase }, events: [] as string[] }

    for (const t of triggers) {
      const result = evaluateRules(
        { oxygen, flameOn, score, combo, phase },
        rules,
        t
      )
      if (result.events.length > 0) {
        next = result.state
        events = result.events
        matchedTrigger = t
        break
      }
    }

    setDroppedAssets(prev => new Set(prev).add(assetId))
    setOxygen(next.oxygen)
    setFlameOn(next.flameOn)
    if (next.score !== undefined) setScore(next.score)
    if (next.combo !== undefined) setCombo(next.combo)
    if (next.phase !== undefined) setPhase(next.phase)

    let resultMsg = ''

    if (events.length > 0) {
      setBurstKey(k => k + 1)

      if (events.some(e => e.startsWith('oxygen_increased'))) {
        const amt = events.find(e => e.startsWith('oxygen_increased'))?.split('_').pop()
        resultMsg = `🌿 ${assetName} boosted oxygen! +${amt}%`
        setFloatEmoji('🌿')
      } else if (events.some(e => e.startsWith('oxygen_reduced'))) {
        const amt = events.find(e => e.startsWith('oxygen_reduced'))?.split('_').pop()
        resultMsg = `🔥 ${assetName} consumed oxygen! -${amt}%`
        setFloatEmoji('🔥')
      } else if (events.some(e => e === 'flame_extinguished')) {
        resultMsg = '💨 Oxygen depleted! Flame out!'
        setFloatEmoji('💨')
      } else if (events.some(e => e === 'flame_ignited')) {
        resultMsg = '🔥 Flame reignited!'
        setFloatEmoji('🔥')
      } else if (events.some(e => e.startsWith('score_'))) {
        const pts = events.find(e => e.startsWith('score_+'))?.split('+').pop()
        resultMsg = `⭐ +${pts} points!`
        if (events.includes('combo_x3')) {
          resultMsg = `🔥 COMBO x3! +${pts} points!`
          setFloatEmoji('🏆')
        } else {
          setFloatEmoji('⭐')
        }
      } else if (events.some(e => e.startsWith('phase_'))) {
        resultMsg = `🎯 Phase ${next.phase} unlocked!`
        setFloatEmoji('🎯')
      } else if (events.some(e => e === 'particle_burst')) {
        resultMsg = `✨ ${assetName} reacted!`
        setFloatEmoji('✨')
      } else if (events.some(e => e === 'shake')) {
        resultMsg = '💥 BOOM!'
        setFloatEmoji('💥')
        if (containerRef.current) {
          gsap.fromTo(containerRef.current, { x: -5 }, { x: 5, duration: 0.1, yoyo: true, repeat: 5 })
        }
      } else {
        const effect = ASSET_EFFECTS[assetId]
        resultMsg = effect?.onDrop || `✨ ${assetName} added!`
        if (subject === 'PHYSICS' && ['ice', 'cold-object'].includes(assetId)) {
          resultMsg = `🧊 ${assetName} lowered temperature!`
          setFloatEmoji('🥶')
        } else if (subject === 'PHYSICS' && ['heat-source', 'hot-object'].includes(assetId)) {
          resultMsg = `🔥 ${assetName} raised temperature!`
          setFloatEmoji('🔥')
        } else if (subject === 'BIOLOGY' && ['sunlight', 'water'].includes(assetId)) {
          resultMsg = `🌱 ${assetName} helps the plant grow!`
          setFloatEmoji('🌱')
        } else if (subject === 'CHEMISTRY' && ['chemical-a', 'chemical-b'].includes(assetId)) {
          resultMsg = `🧪 ${assetName} is reacting!`
          setFloatEmoji('🧪')
        } else {
          const emojiMap: Record<string, string> = {
            candle: '🕯️', beaker: '🧪', leaf: '🌿', plant: '🌱', 'heat-source': '🔥',
            sunlight: '☀️', water: '💧', 'chemical-a': '🧪', 'chemical-b': '⚗️',
            container: '🥃', 'hot-object': '🌡️', 'cold-object': '🧊', thermometer: '🌡️',
            ice: '🧊', steam: '💨'
          }
          setFloatEmoji(emojiMap[assetId] || '✨')
        }
      }

      setShowResult(resultMsg)

      if (centerRef.current) {
        gsap.fromTo(centerRef.current, { scale: 1 }, { scale: 1.2, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.inOut' })
      }

      try {
        await fetch('/api/lab-sync', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ trigger: matchedTrigger, oxygen: next.oxygen, flameOn: next.flameOn, storageKey })
        })
      } catch { /* ignore */ }
    } else {
      // No rules matched - show generic reaction based on asset
      const effect = ASSET_EFFECTS[assetId]
      resultMsg = effect?.onDrop || `✨ ${assetName} added to the lab!`
      setBurstKey(k => k + 1)
      setFloatEmoji(assetId === 'thermometer' ? '🌡️' : '✨')
    }

    setShowResult(resultMsg)
    setTimeout(() => setShowResult(null), 2500)
  }

  function resetLab() {
    setOxygen(100)
    setFlameOn(true)
    setScore(0)
    setCombo(0)
    setPhase(0)
    setDroppedAssets(new Set())
    setShowResult('🔄 Lab reset! Try again!')
    setTimeout(() => setShowResult(null), 1500)
  }

  const assetEmoji: Record<string, string> = {
    candle: '🕯️', beaker: '🧪', leaf: '🌿', plant: '🌱', 'heat-source': '🔥',
    sunlight: '☀️', water: '💧', 'chemical-a': '🧪', 'chemical-b': '⚗️',
    container: '🥃', 'hot-object': '🌡️', 'cold-object': '🧊', thermometer: '🌡️',
    ice: '🧊', steam: '💨'
  }

  // Determine number of interaction zones based on phase
  const zones = phase > 0 ? 3 : 1
  const zonePositions = [
    { x: '50%', y: '35%', label: 'Primary' },
    { x: '25%', y: '70%', label: 'Secondary' },
    { x: '75%', y: '70%', label: 'Tertiary' }
  ]

  return (
    <div className="bg-[#12142D] rounded-3xl shadow-xl border border-[#22254F] overflow-hidden" ref={containerRef}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${theme.accent} p-4 flex items-center justify-between`}>
        <div>
          <h3 className="text-white font-black text-lg">Virtual Lab</h3>
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{subject} Lab</p>
        </div>
        <div className="flex items-center gap-3">
          {score > 0 && (
            <span className="text-white/80 text-xs font-bold bg-white/20 rounded-full px-2.5 py-1">
              ⭐ {score}
            </span>
          )}
          {combo >= 3 && (
            <span className="text-yellow-300 text-xs font-bold bg-yellow-500/20 rounded-full px-2.5 py-1 animate-pulse">
              🔥 x{combo}
            </span>
          )}
          <span className="text-white/80 text-xs font-bold uppercase">O₂</span>
          <div className="bg-white/20 rounded-full px-3 py-1">
            <span className={`text-white font-black ${oxygen < 20 ? 'text-red-300 animate-pulse' : ''}`}>{oxygen}%</span>
          </div>
          <div className={`w-3 h-3 rounded-full ${flameOn ? 'bg-yellow-400 animate-pulse shadow-lg shadow-yellow-400/50' : 'bg-slate-400'}`} />
          <button onClick={resetLab} className="text-white/60 hover:text-white text-xs font-bold bg-white/10 hover:bg-white/20 rounded-full px-2 py-1 transition-all" title="Reset lab">
            🔄
          </button>
        </div>
      </div>

      {/* Lab Area */}
      <div className={`relative ${theme.bg} ${theme.glow} overflow-hidden`} style={{ height: 400 }}>
        <ParticleField color={theme.particle} count={phase > 0 ? 60 : 40} />

        {burstKey > 0 && <ReactionBurst key={burstKey} color={theme.revealColor} onDone={onBurstDone} />}
        {floatEmoji && <FloatingEmoji key={floatEmoji + Date.now()} emoji={floatEmoji} onDone={onEmojiDone} />}

        {/* Multi-zone targets */}
        {Array.from({ length: zones }).map((_, zi) => (
          <div
            key={zi}
            ref={zi === 0 ? centerRef : undefined}
            className={`absolute z-20 transition-all duration-500 ${flameOn ? 'opacity-100 scale-100' : 'opacity-50 scale-75'}`}
            style={{
              left: zonePositions[zi].x,
              top: zonePositions[zi].y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className={`bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-3 text-center min-w-[100px]`}>
              {subject === 'CHEMISTRY' && (
                <div className={`transition-all duration-500 ${flameOn ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                  <div className="w-16 h-20 relative mx-auto">
                    <div className="absolute inset-0 rounded-full" style={{
                      background: 'radial-gradient(circle at 50% 60%, #c084fc 0%, #a855f7 30%, #7c3aed 60%, transparent 100%)',
                      filter: 'blur(4px)'
                    }} />
                    <div className="absolute inset-2 rounded-full" style={{
                      background: 'radial-gradient(circle at 50% 50%, #e9d5ff 0%, #a855f7 40%, transparent 70%)',
                      filter: 'blur(1px)'
                    }} />
                  </div>
                  <div className="text-purple-300 text-[9px] font-bold uppercase tracking-wider mt-1">
                    {flameOn ? 'REACTIVE' : 'STOPPED'}
                  </div>
                </div>
              )}
              {subject === 'PHYSICS' && (
                <div className={`transition-all duration-500 ${flameOn ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                  <div className="w-16 h-16 relative mx-auto">
                    <div className="absolute inset-0 rounded-full animate-spin" style={{ animationDuration: '3s', background: 'conic-gradient(from 0deg, #0ea5e9, #06b6d4, #0ea5e9, #0284c7, #0ea5e9)', filter: 'blur(3px)' }} />
                    <div className="absolute inset-1.5 rounded-full bg-blue-950 flex items-center justify-center">
                      <div className="text-2xl animate-pulse">⚡</div>
                    </div>
                  </div>
                  <div className="text-blue-300 text-[9px] font-bold uppercase tracking-wider mt-1">
                    {flameOn ? 'ACTIVE' : 'DEPLETED'}
                  </div>
                </div>
              )}
              {subject === 'BIOLOGY' && (
                <div className={`transition-all duration-500 ${flameOn ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                  <div className="w-16 h-16 relative mx-auto">
                    <div className="absolute inset-0 rounded-full" style={{
                      background: 'radial-gradient(circle at 40% 40%, #6ee7b7 0%, #10b981 30%, #047857 60%, transparent 100%)',
                      filter: 'blur(3px)'
                    }} />
                    <div className="absolute inset-1 rounded-full border-2 border-emerald-400/30 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/30 flex items-center justify-center">
                        <div className="text-2xl animate-pulse">🌱</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-emerald-300 text-[9px] font-bold uppercase tracking-wider mt-1">
                    {flameOn ? 'GROWING' : 'DORMANT'}
                  </div>
                </div>
              )}
              {zi > 0 && (
                <div className="text-white/30 text-[8px] font-bold uppercase tracking-wider mt-1">
                  Zone {zi + 1}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Phase indicator for multi-zone */}
        {phase > 0 && (
          <div className="absolute top-3 right-3 z-30 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/10">
            <span className="text-white/70 text-[9px] font-bold uppercase tracking-wider">
              Phase {phase}/{phase + 1}
            </span>
          </div>
        )}

        {/* Draggable Assets */}
        <div className="absolute inset-0 z-10">
          {assets.map(a => {
            const isUsed = droppedAssets.has(a.id)
            const assetColor = PER_ASSET_COLORS[a.id] || theme.particle
            const glowClass = PER_ASSET_GLOW[a.id] || ''

            return (
              <motion.div
                key={a.id}
                className={`w-20 h-20 rounded-2xl shadow-lg flex flex-col items-center justify-center text-xs font-bold text-white transition-colors ${
                  isUsed
                    ? 'bg-white/5 border border-white/10 opacity-50 cursor-not-allowed'
                    : 'bg-white/10 backdrop-blur-md border border-white/20 cursor-grab active:cursor-grabbing hover:bg-white/20'
                } ${glowClass}`}
                drag={!isUsed}
                dragMomentum={false}
                initial={false}
                animate={isUsed ? {
                  scale: 0.8,
                  opacity: 0.5,
                  x: a.x,
                  y: a.y + 300
                } : undefined}
                style={{ x: a.x, y: a.y, zIndex: 30 + a.z }}
                onDragEnd={(e, _info) => {
                  if (isUsed) return
                  const el = e.target as HTMLElement
                  const centerRect = centerRef.current?.getBoundingClientRect()
                  const assetRect = el.getBoundingClientRect()

                  if (detectCollision(assetRect, centerRect)) {
                    handleInteraction(a.id, a.name)
                  } else {
                    // Check proximity to other assets for multi-asset triggers
                    // For now, just check if dropped anywhere in the lab area
                    const containerRect = containerRef.current?.getBoundingClientRect()
                    if (containerRect && assetRect) {
                      const centerX = containerRect.left + containerRect.width / 2
                      const centerY = containerRect.top + containerRect.height / 2
                      const assetCX = assetRect.left + assetRect.width / 2
                      const assetCY = assetRect.top + assetRect.height / 2
                      const dist = Math.sqrt((assetCX - centerX) ** 2 + (assetCY - centerY) ** 2)

                      if (dist < 150) {
                        // Close enough to center
                        handleInteraction(a.id, a.name)
                      }
                    }
                  }
                }}
                whileHover={!isUsed ? { scale: 1.08, boxShadow: `0 0 20px ${assetColor}40` } : {}}
                whileTap={!isUsed ? { scale: 0.95 } : {}}
              >
                <div className="text-3xl mb-0.5 drop-shadow-lg" style={{ filter: isUsed ? 'grayscale(1)' : undefined }}>
                  {assetEmoji[a.id] || '📦'}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-tight opacity-80">
                  {isUsed ? 'Used' : a.name.split(' ')[0]}
                </span>
              </motion.div>
            )
          })}
        </div>

        {/* Hint text */}
        {assets.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <p className="text-white/30 text-sm font-bold italic">No lab assets configured for this topic</p>
          </div>
        )}

        {/* All assets used celebration */}
        {assets.length > 0 && droppedAssets.size === assets.length && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/20 backdrop-blur-md rounded-3xl px-8 py-6 border border-white/30 text-center"
            >
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-white font-black text-lg">Experiment Complete!</p>
              <p className="text-white/60 text-sm font-bold mt-1">Score: {score} pts</p>
              <button
                onClick={resetLab}
                className="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-all text-sm"
              >
                Run Again 🔄
              </button>
            </motion.div>
          </div>
        )}

        {/* Result toast */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-[#090A1A]/90 backdrop-blur-md rounded-2xl px-6 py-3 shadow-2xl border border-[#8CE600]/30"
            >
              <p className="text-sm font-bold text-[#FAF9F6] whitespace-nowrap">{showResult}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom status */}
        <div className="absolute bottom-3 left-4 right-4 flex justify-between z-10">
          <div className="flex gap-2">
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
              {droppedAssets.size < assets.length
                ? `Drag items to the center (${assets.length - droppedAssets.size} left)`
                : 'All items used!'}
            </span>
          </div>
          <span className="text-[10px] text-white/30 italic">{subject} Lab</span>
        </div>
      </div>

      {/* Status Panel */}
      <div className="p-4 bg-[#090A1A] border-t border-[#22254F] grid grid-cols-4 gap-3">
        <div className="text-center p-2 bg-[#12142D] rounded-xl border border-[#22254F]">
          <div className="text-[10px] font-bold text-[#8888AA] uppercase">Status</div>
          <div className={`text-sm font-bold ${flameOn ? 'text-emerald-400' : 'text-red-400'}`}>
            {flameOn ? (
              subject === 'CHEMISTRY' ? '⚗️ Reactive' : subject === 'BIOLOGY' ? '🌱 Growing' : '⚡ Active'
            ) : '⏸️ Stopped'}
          </div>
        </div>
        <div className="text-center p-2 bg-[#12142D] rounded-xl border border-[#22254F]">
          <div className="text-[10px] font-bold text-[#8888AA] uppercase">Oxygen</div>
          <div className={`text-sm font-bold ${oxygen < 30 ? 'text-red-400' : 'text-[#8CE600]'}`}>{oxygen}%</div>
        </div>
        <div className="text-center p-2 bg-[#12142D] rounded-xl border border-[#22254F]">
          <div className="text-[10px] font-bold text-[#8888AA] uppercase">Score</div>
          <div className="text-sm font-bold text-yellow-400">{score}</div>
        </div>
        <div className="text-center p-2 bg-[#12142D] rounded-xl border border-[#22254F]">
          <div className="text-[10px] font-bold text-[#8888AA] uppercase">Phase</div>
          <div className="text-sm font-bold text-[#FAF9F6]">{phase > 0 ? `Lv.${phase}` : 'Start'}</div>
        </div>
      </div>
    </div>
  )
}
