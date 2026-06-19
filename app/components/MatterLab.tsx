"use client"
import React, { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'

type LabConfig = {
  assets: string[]
  rules: { when: string; effect: string; amount: number }[]
}

const ASSET_EMOJI: Record<string, string> = {
  candle: '🕯️', beaker: '🧪', leaf: '🌿', 'heat-source': '🔥',
  'hot-object': '☀️', 'cold-object': '❄️', thermometer: '🌡️',
  plant: '🌱', sunlight: '☀️', water: '💧', ice: '🧊',
  'chemical-a': '🧪', 'chemical-b': '⚗️', container: '🧫', 'steam': '♨️'
}

const ASSET_COLORS: Record<string, string> = {
  candle: '#FFD700', beaker: '#A78BFA', leaf: '#4ADE80', 'heat-source': '#FB923C',
  'hot-object': '#FACC15', 'cold-object': '#67E8F9', thermometer: '#FCA5A5',
  plant: '#86EFAC', sunlight: '#FDE047', water: '#60A5FA', ice: '#BAE6FD',
  'chemical-a': '#C084FC', 'chemical-b': '#F472B6', container: '#D1D5DB', steam: '#E0F2FE'
}

const SUBJECT_GRADIENTS: Record<string, string> = {
  CHEMISTRY: 'from-purple-900/50 via-indigo-900/30 to-slate-900',
  PHYSICS: 'from-blue-900/50 via-cyan-900/30 to-slate-900',
  BIOLOGY: 'from-emerald-900/50 via-green-900/30 to-slate-900'
}

export default function MatterLab({
  config,
  subject = 'CHEMISTRY'
}: {
  config: LabConfig
  subject?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Matter.Engine>()
  const renderRef = useRef<Matter.Render>()
  const runnerRef = useRef<Matter.Runner>()
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0.5, scale: 0.001 }
    })
    engineRef.current = engine

    const runner = Matter.Runner.create()
    runnerRef.current = runner

    const render = Matter.Render.create({
      canvas,
      engine,
      options: {
        width: 400,
        height: 400,
        wireframes: false,
        background: 'transparent'
      }
    })
    renderRef.current = render

    const walls = [
      Matter.Bodies.rectangle(200, -10, 420, 20, { isStatic: true, render: { visible: false } }),
      Matter.Bodies.rectangle(200, 410, 420, 20, { isStatic: true, render: { visible: false } }),
      Matter.Bodies.rectangle(-10, 200, 20, 420, { isStatic: true, render: { visible: false } }),
      Matter.Bodies.rectangle(410, 200, 20, 420, { isStatic: true, render: { visible: false } })
    ]
    Matter.Composite.add(engine.world, walls)

    const dropped: Matter.Body[] = []

    function handleClick(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const i = Math.floor(Math.random() * config.assets.length)
      const name = config.assets[i]
      const emoji = ASSET_EMOJI[name] || '🔬'
      const body = Matter.Bodies.circle(x, y, 20, {
        restitution: 0.6,
        friction: 0.1,
        render: {
          fillStyle: ASSET_COLORS[name] || '#8CE600',
          strokeStyle: '#ffffff44',
          lineWidth: 2
        },
        label: name
      })
      Matter.Composite.add(engine.world, body)
      dropped.push(body)

      setMessages(prev => [`Dropped ${emoji} ${name}`, ...prev].slice(0, 5))

      setTimeout(() => {
        const overlapping = Matter.Query.collides(body, dropped.filter(b => b !== body))
        for (const col of overlapping) {
          const otherLabel = col.bodyA === body ? col.bodyB.label : col.bodyA.label
          const rule = config.rules.find(r =>
            (r.when.includes(name) && r.when.includes(otherLabel)) ||
            (r.when.includes(otherLabel) && r.when.includes(name))
          )
          if (rule) {
            const emojiB = ASSET_EMOJI[otherLabel] || '🔬'
            setMessages(prev => [
              `⚡ ${emoji} + ${emojiB} → ${rule.effect} by ${rule.amount}!`,
              ...prev
            ].slice(0, 5))

            const burst = [...Array(8)].map(() => {
              const p = Matter.Bodies.circle(x + (Math.random() - 0.5) * 80, y + (Math.random() - 0.5) * 80, 4, {
                restitution: 0.8,
                friction: 0,
                render: { fillStyle: '#8CE600', strokeStyle: '#A3FF00', lineWidth: 1 }
              })
              Matter.Body.setVelocity(p, { x: (Math.random() - 0.5) * 5, y: -Math.random() * 5 - 2 })
              return p
            })
            Matter.Composite.add(engine.world, burst)
            setTimeout(() => Matter.Composite.remove(engine.world, burst), 1500)
          }
        }
      }, 500)
    }

    canvas.addEventListener('click', handleClick)

    Matter.Runner.run(runner, engine)
    Matter.Render.run(render)

    return () => {
      canvas.removeEventListener('click', handleClick)
      Matter.Render.stop(render)
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current)
      Matter.Engine.clear(engine)
    }
  }, [config])

  return (
    <div className={`p-4 rounded-[2rem] bg-gradient-to-br ${SUBJECT_GRADIENTS[subject] || SUBJECT_GRADIENTS.CHEMISTRY} border border-[#22254F] shadow-xl`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-sm uppercase tracking-wider text-[#8CE600]">
          🔬 Matter.js Sandbox
        </h3>
        <span className="text-[10px] font-black text-[#8888AA] uppercase tracking-widest">
          Click to drop items
        </span>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-[#090A1A] border border-[#22254F]">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-full h-auto cursor-pointer"
        />
      </div>

      {/* Asset Legend */}
      <div className="flex flex-wrap gap-2 mt-4">
        {config.assets.map((a) => (
          <span key={a} className="text-[11px] font-bold text-[#8888AA] bg-[#090A1A] px-2.5 py-1 rounded-lg border border-[#22254F]">
            {ASSET_EMOJI[a] || '🔬'} {a}
          </span>
        ))}
      </div>

      {/* Reaction Messages */}
      {messages.length > 0 && (
        <div className="mt-4 space-y-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className="text-xs font-bold text-[#8CE600] bg-[#090A1A] px-3 py-2 rounded-xl border border-[#8CE600]/20 animate-fadeIn"
            >
              {msg}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
