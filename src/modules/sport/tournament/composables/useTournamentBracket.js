import { normalizeScoreValue } from '../services/calculateStandings'

function normalizeText(value) {
  return String(value || '').trim()
}

function normalizeMatchStatus(value) {
  const status = normalizeText(value).toLowerCase()
  return ['scheduled', 'live', 'completed', 'postponed', 'cancelled'].includes(status) ? status : 'scheduled'
}

function clone(value) {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value)
    } catch {
      return JSON.parse(JSON.stringify(value))
    }
  }

  return JSON.parse(JSON.stringify(value))
}

function createRoundDefinitions(size = 0, thirdPlaceMatchEnabled = false) {
  const bracketSize = Number(size)

  if (bracketSize === 4) {
    return [
      { key: 'semifinal', labelKey: 'sportTournament.knockout.rounds.semifinal', kind: 'main', matchCount: 2 },
      { key: 'final', labelKey: 'sportTournament.knockout.rounds.final', kind: 'main', matchCount: 1 },
      ...(thirdPlaceMatchEnabled
        ? [{ key: 'third_place', labelKey: 'sportTournament.knockout.rounds.thirdPlace', kind: 'third_place', matchCount: 1 }]
        : []),
    ]
  }

  if (bracketSize === 8) {
    return [
      { key: 'quarterfinal', labelKey: 'sportTournament.knockout.rounds.quarterfinal', kind: 'main', matchCount: 4 },
      { key: 'semifinal', labelKey: 'sportTournament.knockout.rounds.semifinal', kind: 'main', matchCount: 2 },
      { key: 'final', labelKey: 'sportTournament.knockout.rounds.final', kind: 'main', matchCount: 1 },
      ...(thirdPlaceMatchEnabled
        ? [{ key: 'third_place', labelKey: 'sportTournament.knockout.rounds.thirdPlace', kind: 'third_place', matchCount: 1 }]
        : []),
    ]
  }

  if (bracketSize === 16) {
    return [
      { key: 'round_of_16', labelKey: 'sportTournament.knockout.rounds.roundOf16', kind: 'main', matchCount: 8 },
      { key: 'quarterfinal', labelKey: 'sportTournament.knockout.rounds.quarterfinal', kind: 'main', matchCount: 4 },
      { key: 'semifinal', labelKey: 'sportTournament.knockout.rounds.semifinal', kind: 'main', matchCount: 2 },
      { key: 'final', labelKey: 'sportTournament.knockout.rounds.final', kind: 'main', matchCount: 1 },
      ...(thirdPlaceMatchEnabled
        ? [{ key: 'third_place', labelKey: 'sportTournament.knockout.rounds.thirdPlace', kind: 'third_place', matchCount: 1 }]
        : []),
    ]
  }

  return []
}

function createKnockoutMatch({
  tournamentId = '',
  roundKey = '',
  roundLabelKey = '',
  matchNumber = 1,
  sourceLinks = [],
  sourceQualifierIds = [],
  homeTeam = null,
  awayTeam = null,
}) {
  const homeTeamId = normalizeText(homeTeam?.teamId)
  const awayTeamId = normalizeText(awayTeam?.teamId)

  return {
    id: `${normalizeText(tournamentId) || 'tournament'}-knockout-${roundKey}-${String(matchNumber).padStart(2, '0')}`,
    roundKey,
    roundLabelKey,
    matchNumber,
    sourceLinks: Array.isArray(sourceLinks) ? sourceLinks.map((link) => ({
      matchId: normalizeText(link?.matchId),
      role: link?.role === 'loser' ? 'loser' : 'winner',
    })) : [],
    sourceQualifierIds: Array.isArray(sourceQualifierIds) ? sourceQualifierIds.map((value) => normalizeText(value)).filter(Boolean) : [],
    homeTeamId,
    homeTeamName: normalizeText(homeTeam?.teamName),
    awayTeamId,
    awayTeamName: normalizeText(awayTeam?.teamName),
    homeScore: null,
    awayScore: null,
    extraTimeHomeScore: null,
    extraTimeAwayScore: null,
    penaltyHomeScore: null,
    penaltyAwayScore: null,
    status: 'scheduled',
    winnerTeamId: '',
    winnerTeamName: '',
    winnerMethod: '',
    completedAt: '',
    notes: '',
    venue: '',
    dateTime: '',
  }
}

function pairQualifiers(qualifiers = []) {
  const ordered = qualifiers.map((qualifier) => clone(qualifier)).sort((left, right) => {
    if (left.seedPriority !== right.seedPriority) return left.seedPriority - right.seedPriority
    if (left.groupOrder !== right.groupOrder) return left.groupOrder - right.groupOrder
    if (left.position !== right.position) return left.position - right.position
    return String(left.teamName || '').localeCompare(String(right.teamName || ''))
  })
  const pairings = []

  if (!ordered.length) {
    return pairings
  }

  const midpoint = Math.floor(ordered.length / 2)
  const homeSeeds = ordered.slice(0, midpoint)
  const awaySeeds = ordered.slice(midpoint).reverse()

  homeSeeds.forEach((home, index) => {
    if (!awaySeeds.length) return

    let awayIndex = index
    if (!awaySeeds[awayIndex]) {
      awayIndex = awaySeeds.length - 1
    }

    if (awaySeeds[awayIndex] && home.groupId && awaySeeds[awayIndex].groupId === home.groupId) {
      const swapIndex = awaySeeds.findIndex((candidate, candidateIndex) =>
        candidateIndex !== awayIndex && candidate.groupId !== home.groupId,
      )

      if (swapIndex >= 0) {
        const temporary = awaySeeds[awayIndex]
        awaySeeds[awayIndex] = awaySeeds[swapIndex]
        awaySeeds[swapIndex] = temporary
      }
    }

    pairings.push([home, awaySeeds[awayIndex]])
  })

  return pairings
}

function findMatchById(bracket = {}, matchId = '') {
  const targetId = normalizeText(matchId)
  if (!targetId) return null

  const rounds = Array.isArray(bracket.rounds) ? bracket.rounds : []
  for (const round of rounds) {
    const match = (Array.isArray(round.matches) ? round.matches : []).find((item) => normalizeText(item.id) === targetId)
    if (match) return match
  }

  return null
}

function resolveMatchOutcome(match = {}, settings = {}) {
  const homeScore = normalizeScoreValue(match.homeScore)
  const awayScore = normalizeScoreValue(match.awayScore)
  const extraTimeHomeScore = normalizeScoreValue(match.extraTimeHomeScore)
  const extraTimeAwayScore = normalizeScoreValue(match.extraTimeAwayScore)
  const penaltyHomeScore = normalizeScoreValue(match.penaltyHomeScore)
  const penaltyAwayScore = normalizeScoreValue(match.penaltyAwayScore)

  const outcome = {
    ready: homeScore !== null && awayScore !== null,
    tied: false,
    winnerTeamId: '',
    winnerTeamName: '',
    loserTeamId: '',
    loserTeamName: '',
    winnerMethod: '',
    invalid: false,
  }

  if (!outcome.ready) {
    return outcome
  }

  const homeTeam = {
    teamId: normalizeText(match.homeTeamId),
    teamName: normalizeText(match.homeTeamName) || normalizeText(match.homeTeamId),
  }
  const awayTeam = {
    teamId: normalizeText(match.awayTeamId),
    teamName: normalizeText(match.awayTeamName) || normalizeText(match.awayTeamId),
  }

  if (homeScore > awayScore) {
    outcome.winnerTeamId = homeTeam.teamId
    outcome.winnerTeamName = homeTeam.teamName
    outcome.loserTeamId = awayTeam.teamId
    outcome.loserTeamName = awayTeam.teamName
    outcome.winnerMethod = 'regular'
    return outcome
  }

  if (awayScore > homeScore) {
    outcome.winnerTeamId = awayTeam.teamId
    outcome.winnerTeamName = awayTeam.teamName
    outcome.loserTeamId = homeTeam.teamId
    outcome.loserTeamName = homeTeam.teamName
    outcome.winnerMethod = 'regular'
    return outcome
  }

  outcome.tied = true

  if (Boolean(settings.extraTimeEnabled) && extraTimeHomeScore !== null && extraTimeAwayScore !== null) {
    if (extraTimeHomeScore > extraTimeAwayScore) {
      outcome.winnerTeamId = homeTeam.teamId
      outcome.winnerTeamName = homeTeam.teamName
      outcome.loserTeamId = awayTeam.teamId
      outcome.loserTeamName = awayTeam.teamName
      outcome.winnerMethod = 'extra_time'
      return outcome
    }

    if (extraTimeAwayScore > extraTimeHomeScore) {
      outcome.winnerTeamId = awayTeam.teamId
      outcome.winnerTeamName = awayTeam.teamName
      outcome.loserTeamId = homeTeam.teamId
      outcome.loserTeamName = homeTeam.teamName
      outcome.winnerMethod = 'extra_time'
      return outcome
    }
  }

  if (Boolean(settings.penaltyEnabled) && penaltyHomeScore !== null && penaltyAwayScore !== null) {
    if (penaltyHomeScore > penaltyAwayScore) {
      outcome.winnerTeamId = homeTeam.teamId
      outcome.winnerTeamName = homeTeam.teamName
      outcome.loserTeamId = awayTeam.teamId
      outcome.loserTeamName = awayTeam.teamName
      outcome.winnerMethod = 'penalties'
      return outcome
    }

    if (penaltyAwayScore > penaltyHomeScore) {
      outcome.winnerTeamId = awayTeam.teamId
      outcome.winnerTeamName = awayTeam.teamName
      outcome.loserTeamId = homeTeam.teamId
      outcome.loserTeamName = homeTeam.teamName
      outcome.winnerMethod = 'penalties'
      return outcome
    }
  }

  return outcome
}

function resolveSourceTeam(bracket = {}, sourceLink = {}, settings = {}) {
  const sourceMatch = findMatchById(bracket, sourceLink.matchId)
  if (!sourceMatch) return null

  const outcome = resolveMatchOutcome(sourceMatch, settings)
  const role = sourceLink.role === 'loser' ? 'loser' : 'winner'

  if (role === 'winner') {
    if (outcome.winnerTeamId) {
      return {
        teamId: outcome.winnerTeamId,
        teamName: outcome.winnerTeamName,
      }
    }

    if (sourceMatch.winnerTeamId) {
      return {
        teamId: normalizeText(sourceMatch.winnerTeamId),
        teamName: normalizeText(sourceMatch.winnerTeamName) || normalizeText(sourceMatch.winnerTeamId),
      }
    }
  }

  if (role === 'loser' && outcome.winnerTeamId) {
    return {
      teamId: outcome.loserTeamId,
      teamName: outcome.loserTeamName,
    }
  }

  return null
}

function assignMatchTeamsFromSources(bracket = {}, match = {}, settings = {}) {
  if (!Array.isArray(match.sourceLinks) || !match.sourceLinks.length) {
    return {
      homeTeamId: normalizeText(match.homeTeamId),
      homeTeamName: normalizeText(match.homeTeamName),
      awayTeamId: normalizeText(match.awayTeamId),
      awayTeamName: normalizeText(match.awayTeamName),
    }
  }

  const homeSource = resolveSourceTeam(bracket, match.sourceLinks[0], settings)
  const awaySource = resolveSourceTeam(bracket, match.sourceLinks[1], settings)

  return {
    homeTeamId: normalizeText(homeSource?.teamId) || normalizeText(match.homeTeamId),
    homeTeamName: normalizeText(homeSource?.teamName) || normalizeText(match.homeTeamName),
    awayTeamId: normalizeText(awaySource?.teamId) || normalizeText(match.awayTeamId),
    awayTeamName: normalizeText(awaySource?.teamName) || normalizeText(match.awayTeamName),
  }
}

export function createKnockoutMatchDraft(match = {}) {
  return {
    status: normalizeMatchStatus(match.status),
    homeScore: normalizeScoreValue(match.homeScore),
    awayScore: normalizeScoreValue(match.awayScore),
    extraTimeHomeScore: normalizeScoreValue(match.extraTimeHomeScore),
    extraTimeAwayScore: normalizeScoreValue(match.extraTimeAwayScore),
    penaltyHomeScore: normalizeScoreValue(match.penaltyHomeScore),
    penaltyAwayScore: normalizeScoreValue(match.penaltyAwayScore),
    notes: normalizeText(match.notes),
    venue: normalizeText(match.venue),
    dateTime: normalizeText(match.dateTime),
  }
}

export function isValidBracketSize(value) {
  return [4, 8, 16].includes(Number(value))
}

export function createKnockoutBracket({
  tournamentId = '',
  qualifiers = [],
  settings = {},
  generatedAt = new Date().toISOString(),
} = {}) {
  const size = Number(Array.isArray(qualifiers) ? qualifiers.length : 0)

  if (!isValidBracketSize(size)) {
    return {
      valid: false,
      issues: [{ code: 'invalidBracketSize', value: size }],
      bracket: null,
    }
  }

  const roundDefinitions = createRoundDefinitions(size, Boolean(settings.thirdPlaceMatchEnabled))
  const mainRounds = roundDefinitions.filter((definition) => definition.kind === 'main')
  const rounds = []
  const firstRoundPairs = pairQualifiers(qualifiers)

  const firstRoundDefinition = mainRounds[0]
  const firstRound = {
    key: firstRoundDefinition.key,
    labelKey: firstRoundDefinition.labelKey,
    kind: firstRoundDefinition.kind,
    matchCount: firstRoundDefinition.matchCount,
    matches: firstRoundPairs.map(([home, away], index) =>
      createKnockoutMatch({
        tournamentId,
        roundKey: firstRoundDefinition.key,
        roundLabelKey: firstRoundDefinition.labelKey,
        matchNumber: index + 1,
        sourceQualifierIds: [home.teamId, away.teamId],
        homeTeam: home,
        awayTeam: away,
      }),
    ),
  }
  rounds.push(firstRound)

  let previousRoundMatches = firstRound.matches

  for (const definition of mainRounds.slice(1)) {
    const matches = Array.from({ length: definition.matchCount }, (_, index) =>
      createKnockoutMatch({
        tournamentId,
        roundKey: definition.key,
        roundLabelKey: definition.labelKey,
        matchNumber: index + 1,
        sourceLinks: [
          { matchId: previousRoundMatches[index * 2]?.id || '', role: 'winner' },
          { matchId: previousRoundMatches[index * 2 + 1]?.id || '', role: 'winner' },
        ],
      }),
    )

    rounds.push({
      key: definition.key,
      labelKey: definition.labelKey,
      kind: definition.kind,
      matchCount: definition.matchCount,
      matches,
    })
    previousRoundMatches = matches
  }

  if (settings.thirdPlaceMatchEnabled) {
    const semifinalRound = rounds.find((round) => round.key === 'semifinal')
    if (semifinalRound && Array.isArray(semifinalRound.matches) && semifinalRound.matches.length >= 2) {
      rounds.push({
        key: 'third_place',
        labelKey: 'sportTournament.knockout.rounds.thirdPlace',
        kind: 'third_place',
        matchCount: 1,
        matches: [
          createKnockoutMatch({
            tournamentId,
            roundKey: 'third_place',
            roundLabelKey: 'sportTournament.knockout.rounds.thirdPlace',
            matchNumber: 1,
            sourceLinks: [
              { matchId: semifinalRound.matches[0].id, role: 'loser' },
              { matchId: semifinalRound.matches[1].id, role: 'loser' },
            ],
          }),
        ],
      })
    }
  }

  return {
    valid: true,
    issues: [],
    bracket: rebuildKnockoutProgression({
      id: normalizeText(tournamentId),
      generatedAt,
      updatedAt: generatedAt,
      size,
      settings: clone(settings),
    rounds,
      champion: null,
      status: 'knockout_stage',
    }, settings),
  }
}

export function rebuildKnockoutProgression(bracket = {}, settings = {}) {
  const nextBracket = clone(bracket || {})
  const normalizedSettings = {
    extraTimeEnabled: Boolean(settings.extraTimeEnabled ?? nextBracket.settings?.extraTimeEnabled),
    penaltyEnabled: Boolean(settings.penaltyEnabled ?? nextBracket.settings?.penaltyEnabled),
    thirdPlaceMatchEnabled: Boolean(settings.thirdPlaceMatchEnabled ?? nextBracket.settings?.thirdPlaceMatchEnabled),
  }

  nextBracket.settings = {
    ...nextBracket.settings,
    ...normalizedSettings,
  }
  nextBracket.rounds = Array.isArray(nextBracket.rounds) ? nextBracket.rounds : []
  nextBracket.updatedAt = new Date().toISOString()

  for (const round of nextBracket.rounds) {
    round.matches = Array.isArray(round.matches) ? round.matches : []

    for (const match of round.matches) {
      const assignedTeams = assignMatchTeamsFromSources(nextBracket, match, normalizedSettings)
      match.homeTeamId = assignedTeams.homeTeamId
      match.homeTeamName = assignedTeams.homeTeamName
      match.awayTeamId = assignedTeams.awayTeamId
      match.awayTeamName = assignedTeams.awayTeamName

      const outcome = resolveMatchOutcome(match, normalizedSettings)
      if (outcome.winnerTeamId) {
        match.winnerTeamId = outcome.winnerTeamId
        match.winnerTeamName = outcome.winnerTeamName
        match.winnerMethod = outcome.winnerMethod
      }

      if (match.status === 'completed' && outcome.ready && !outcome.winnerTeamId && outcome.tied) {
        match.winnerTeamId = ''
        match.winnerTeamName = ''
        match.winnerMethod = ''
      }

      if (match.status === 'completed' && !match.completedAt) {
        match.completedAt = new Date().toISOString()
      }
    }
  }

  const finalRound = nextBracket.rounds.find((round) => round.key === 'final')
  const finalMatch = finalRound?.matches?.[0] || null
  const finalOutcome = finalMatch ? resolveMatchOutcome(finalMatch, normalizedSettings) : null
  const champion = finalOutcome?.winnerTeamId && finalMatch?.status === 'completed'
    ? {
        teamId: finalOutcome.winnerTeamId,
        teamName: finalOutcome.winnerTeamName,
        matchId: finalMatch.id,
        score: {
          home: finalMatch.homeScore,
          away: finalMatch.awayScore,
        },
        status: 'confirmed',
      }
    : null

  nextBracket.champion = champion
  nextBracket.status = champion ? 'completed' : 'knockout_stage'
  nextBracket.completedMatches = nextBracket.rounds.reduce(
    (sum, round) => sum + round.matches.filter((match) => match.status === 'completed').length,
    0,
  )
  nextBracket.totalMatches = nextBracket.rounds.reduce((sum, round) => sum + round.matches.length, 0)

  return nextBracket
}

export function updateKnockoutMatchResult(bracket = {}, matchId = '', patch = {}, settings = {}) {
  const targetId = normalizeText(matchId)
  if (!targetId) {
    return {
      bracket: clone(bracket),
      issue: { code: 'missingMatchId' },
    }
  }

  const nextBracket = clone(bracket || {})
  const rounds = Array.isArray(nextBracket.rounds) ? nextBracket.rounds : []
  let targetMatch = null

  rounds.forEach((round) => {
    if (targetMatch) return

    const match = (Array.isArray(round.matches) ? round.matches : []).find((item) => normalizeText(item.id) === targetId)
    if (match) {
      targetMatch = match
    }
  })

  if (!targetMatch) {
    return {
      bracket: clone(bracket),
      issue: { code: 'matchNotFound' },
    }
  }

  Object.assign(targetMatch, {
    status: normalizeMatchStatus(patch.status ?? targetMatch.status),
    homeScore: normalizeScoreValue(patch.homeScore ?? targetMatch.homeScore),
    awayScore: normalizeScoreValue(patch.awayScore ?? targetMatch.awayScore),
    extraTimeHomeScore: normalizeScoreValue(patch.extraTimeHomeScore ?? targetMatch.extraTimeHomeScore),
    extraTimeAwayScore: normalizeScoreValue(patch.extraTimeAwayScore ?? targetMatch.extraTimeAwayScore),
    penaltyHomeScore: normalizeScoreValue(patch.penaltyHomeScore ?? targetMatch.penaltyHomeScore),
    penaltyAwayScore: normalizeScoreValue(patch.penaltyAwayScore ?? targetMatch.penaltyAwayScore),
    notes: normalizeText(patch.notes ?? targetMatch.notes),
    venue: normalizeText(patch.venue ?? targetMatch.venue),
    dateTime: normalizeText(patch.dateTime ?? targetMatch.dateTime),
  })

  const outcome = resolveMatchOutcome(targetMatch, settings)

  if (targetMatch.status === 'completed' && outcome.ready && outcome.tied && !outcome.winnerTeamId) {
    const penaltiesResolved =
      Boolean(settings.penaltyEnabled)
      && normalizeScoreValue(targetMatch.penaltyHomeScore) !== null
      && normalizeScoreValue(targetMatch.penaltyAwayScore) !== null
      && normalizeScoreValue(targetMatch.penaltyHomeScore) !== normalizeScoreValue(targetMatch.penaltyAwayScore)

    if (!penaltiesResolved) {
      return {
        bracket: clone(bracket),
        issue: { code: 'drawWithoutPenaltyWinner' },
      }
    }
  }

  if (outcome.winnerTeamId) {
    targetMatch.winnerTeamId = outcome.winnerTeamId
    targetMatch.winnerTeamName = outcome.winnerTeamName
    targetMatch.winnerMethod = outcome.winnerMethod
  }

  if (targetMatch.status === 'completed' && !targetMatch.completedAt) {
    targetMatch.completedAt = new Date().toISOString()
  }

  return {
    bracket: rebuildKnockoutProgression(nextBracket, settings),
    issue: null,
  }
}

export function flattenKnockoutMatches(bracket = {}) {
  return (Array.isArray(bracket.rounds) ? bracket.rounds : []).flatMap((round) =>
    (Array.isArray(round.matches) ? round.matches : []).map((match) => ({
      ...match,
      roundKey: round.key,
      roundLabelKey: round.labelKey,
      roundKind: round.kind,
    })),
  )
}

export function findKnockoutMatchById(bracket = {}, matchId = '') {
  const match = findMatchById(bracket, matchId)
  if (!match) return null

  const round = (Array.isArray(bracket.rounds) ? bracket.rounds : []).find((entry) =>
    (Array.isArray(entry.matches) ? entry.matches : []).some((item) => normalizeText(item.id) === normalizeText(matchId)),
  )

  return round
    ? {
        ...match,
        roundKey: round.key,
        roundLabelKey: round.labelKey,
        roundKind: round.kind,
      }
    : match
}

export function summarizeKnockoutBracket(bracket = {}) {
  const matches = flattenKnockoutMatches(bracket)

  return {
    totalMatches: matches.length,
    completedMatches: matches.filter((match) => match.status === 'completed').length,
    liveMatches: matches.filter((match) => match.status === 'live').length,
    rounds: Array.isArray(bracket.rounds) ? bracket.rounds.length : 0,
    hasChampion: Boolean(bracket?.champion?.teamId),
  }
}

export {
  assignMatchTeamsFromSources,
  createKnockoutMatch,
  createRoundDefinitions,
  findMatchById,
  normalizeMatchStatus,
  pairQualifiers,
  resolveMatchOutcome,
  resolveSourceTeam,
}
