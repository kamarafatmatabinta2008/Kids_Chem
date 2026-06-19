"use client"
import React, { useState } from 'react'
import EnhancedLabBox from '../components/EnhancedLabBox'
import { motion } from 'framer-motion'

const DEMO_CONFIGS = [
  {
    name: '🧪 Chemistry Lab',
    subject: 'CHEMISTRY',
    config: {
      assets: ['beaker', 'candle', 'leaf'],
      rules: [
        { when: 'beaker_on_target', effect: 'reduce_oxygen' as const, amount: 50 },
        { when: 'leaf_on_target', effect: 'increase_oxygen' as const, amount: 30 },
        { when: 'candle_on_target', effect: 'reduce_oxygen' as const, amount: 10 }
      ]
    }
  },
  {
    name: '⚡ Physics Lab',
    subject: 'PHYSICS',
    config: {
      assets: ['hot-object', 'cold-object', 'thermometer'],
      rules: [
        { when: 'hot-object_on_target', effect: 'increase_oxygen' as const, amount: 20 },
        { when: 'cold-object_on_target', effect: 'reduce_oxygen' as const, amount: 30 }
      ]
    }
  },
  {
    name: '🌿 Biology Lab',
    subject: 'BIOLOGY',
    config: {
      assets: ['plant', 'sunlight', 'water'],
      rules: [
        { when: 'sunlight_on_target', effect: 'increase_oxygen' as const, amount: 40 },
        { when: 'water_on_target', effect: 'increase_oxygen' as const, amount: 15 },
        { when: 'plant_on_target', effect: 'reduce_oxygen' as const, amount: 5 }
      ]
    }
  }
]

export default function LabPage() {
  const [activeLab, setActiveLab] = useState(0)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">🔬 Virtual Science Lab</h1>
          <p className="text-slate-400 font-medium text-lg">Choose a lab and start experimenting!</p>
        </div>

        {/* Lab Selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {DEMO_CONFIGS.map((lab, idx) => (
            <motion.button
              key={idx}
              onClick={() => setActiveLab(idx)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-4 rounded-2xl font-black text-sm transition-all ${
                activeLab === idx
                  ? 'bg-white text-slate-900 shadow-xl shadow-white/10'
                  : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
              }`}
            >
              {lab.name}
            </motion.button>
          ))}
        </div>

        {/* Active Lab */}
        <motion.div
          key={activeLab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-lg mx-auto"
        >
          <EnhancedLabBox
            storageKey={`lab_demo_${activeLab}`}
            config={DEMO_CONFIGS[activeLab].config}
          />
        </motion.div>

        {/* Tips */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <h3 className="text-xl font-black text-white mb-4">💡 Lab Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="text-slate-300">
                <span className="text-2xl block mb-2">👆</span>
                <span className="font-bold text-sm">Drag & drop items onto the center to trigger reactions</span>
              </div>
              <div className="text-slate-300">
                <span className="text-2xl block mb-2">📊</span>
                <span className="font-bold text-sm">Watch the oxygen level change with each reaction</span>
              </div>
              <div className="text-slate-300">
                <span className="text-2xl block mb-2">🔄</span>
                <span className="font-bold text-sm">Different subjects have different visual effects</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
