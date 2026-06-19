export type LabState = {
  oxygen: number
  flameOn: boolean
  score: number
  combo: number
  phase: number
  [k: string]: any
}

export type RuleEffect =
  | 'reduce_oxygen'
  | 'increase_oxygen'
  | 'extinguish_flame'
  | 'ignite_flame'
  | 'add_score'
  | 'transform_asset'
  | 'spawn_particles'
  | 'change_background'
  | 'next_phase'
  | 'shake_screen'

export type Rule = {
  when: string
  effect: RuleEffect
  amount?: number
  asset?: string
  message?: string
}

export function evaluateRules(state: LabState, rules: Rule[], trigger: string): { state: LabState; events: string[] } {
  const events: string[] = []
  const next = { ...state }

  for (const r of rules) {
    if (r.when !== trigger) continue

    switch (r.effect) {
      case 'reduce_oxygen':
        next.oxygen = Math.max(0, next.oxygen - (r.amount ?? 10))
        events.push(`oxygen_reduced_by_${r.amount ?? 10}`)
        if (next.oxygen === 0) { next.flameOn = false; events.push('flame_extinguished') }
        break
      case 'increase_oxygen':
        next.oxygen = Math.min(100, next.oxygen + (r.amount ?? 10))
        events.push(`oxygen_increased_by_${r.amount ?? 10}`)
        if (next.oxygen > 10) { next.flameOn = true; events.push('flame_ignited') }
        break
      case 'extinguish_flame':
        next.flameOn = false
        events.push('flame_extinguished')
        break
      case 'ignite_flame':
        next.flameOn = true
        events.push('flame_ignited')
        break
      case 'add_score':
        next.score = (next.score ?? 0) + (r.amount ?? 10)
        next.combo = (next.combo ?? 0) + 1
        events.push(`score_+${r.amount ?? 10}`)
        if ((next.combo ?? 0) >= 3) events.push('combo_x3')
        break
      case 'transform_asset':
        next.transformAsset = r.asset || 'all'
        events.push(`transform_${r.asset || 'all'}`)
        break
      case 'spawn_particles':
        events.push('particle_burst')
        break
      case 'change_background':
        events.push('bg_change')
        break
      case 'next_phase':
        next.phase = (next.phase ?? 0) + 1
        events.push(`phase_${next.phase}`)
        break
      case 'shake_screen':
        events.push('shake')
        break
    }
  }

  return { state: next, events }
}
