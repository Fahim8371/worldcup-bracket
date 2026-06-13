// Buckets knockout-stage matches into ordered rounds for the bracket view.
// During the group stage these will be mostly empty / TBD and fill in over time.
const ROUNDS = [
  { stage: 'LAST_32', label: 'Round of 32' },
  { stage: 'LAST_16', label: 'Round of 16' },
  { stage: 'QUARTER_FINALS', label: 'Quarter-finals' },
  { stage: 'SEMI_FINALS', label: 'Semi-finals' },
  { stage: 'THIRD_PLACE', label: '3rd place' },
  { stage: 'FINAL', label: 'Final' },
]

export function buildBracket(matches) {
  return ROUNDS.map(({ stage, label }) => ({
    stage,
    label,
    matches: matches
      .filter((m) => m.stage === stage)
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate)),
  })).filter((round) => round.matches.length > 0)
}

export function hasKnockoutData(matches) {
  return matches.some((m) => m.stage && m.stage !== 'GROUP_STAGE')
}
