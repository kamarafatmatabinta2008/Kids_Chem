export type LabState = {
  oxygen: number
  flameOn: boolean
  [k: string]: any
}

export type Rule = {
  when: string // e.g., 'beaker_on_candle' or 'leaf_in_beaker'
  effect: 'reduce_oxygen' | 'increase_oxygen' | 'extinguish_flame' | 'ignite_flame'
  amount?: number
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
    }
  }

  return { state: next, events }
}
