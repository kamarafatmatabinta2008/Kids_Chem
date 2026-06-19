import { evaluateRules, LabState, Rule } from './ruleEngine'

describe('Lab Rule Engine', () => {
  const initialState: LabState = { oxygen: 100, flameOn: true }
  
  const rules: Rule[] = [
    { when: 'beaker_on_candle', effect: 'reduce_oxygen', amount: 50 },
    { when: 'leaf_in_beaker', effect: 'increase_oxygen', amount: 30 }
  ]

  it('should reduce oxygen when beaker is on candle', () => {
    const { state, events } = evaluateRules(initialState, rules, 'beaker_on_candle')
    expect(state.oxygen).toBe(50)
    expect(events).toContain('oxygen_reduced_by_50')
  })

  it('should extinguish flame when oxygen hits 0', () => {
    const rulesWithBigReduction: Rule[] = [
      { when: 'beaker_on_candle', effect: 'reduce_oxygen', amount: 100 }
    ]
    const { state, events } = evaluateRules(initialState, rulesWithBigReduction, 'beaker_on_candle')
    expect(state.oxygen).toBe(0)
    expect(state.flameOn).toBe(false)
    expect(events).toContain('flame_extinguished')
  })

  it('should increase oxygen when leaf is added', () => {
    const lowOxygenState: LabState = { oxygen: 10, flameOn: true }
    const { state, events } = evaluateRules(lowOxygenState, rules, 'leaf_in_beaker')
    expect(state.oxygen).toBe(40)
    expect(events).toContain('oxygen_increased_by_30')
  })

  it('should not increase oxygen above 100', () => {
    const { state } = evaluateRules(initialState, rules, 'leaf_in_beaker')
    expect(state.oxygen).toBe(100)
  })
})
