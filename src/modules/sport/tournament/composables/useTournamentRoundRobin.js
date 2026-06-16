function normalizeText(value) {
  return String(value || '').trim()
}

function normalizeTeamRecord(team) {
  const id = normalizeText(team?.id)

  if (!id) return null

  return {
    id,
    name: normalizeText(team?.name) || id,
    status: normalizeText(team?.status) || 'active',
    seeded: Boolean(team?.seeded),
    seedRank:
      team?.seedRank === null || team?.seedRank === undefined || team?.seedRank === ''
        ? null
        : Number(team.seedRank) || null,
  }
}

function normalizeMode(value) {
  return String(value || 'single').trim().toLowerCase() === 'double' ? 'double' : 'single'
}

function createFixtureDate(baseDate, offsetDays) {
  if (!baseDate) return ''

  const date = new Date(baseDate)
  if (Number.isNaN(date.getTime())) return ''

  date.setDate(date.getDate() + Number(offsetDays || 0))
  return date.toISOString()
}

function createFixtureId({ groupId, matchday, leg, index }) {
  return `${groupId || 'group'}-md-${String(matchday).padStart(2, '0')}-leg-${leg}-m-${String(index + 1).padStart(2, '0')}`
}

function buildRoundRobinLeg(teamList = []) {
  const list = [...teamList]
  if (list.length < 2) return []

  if (list.length % 2 !== 0) {
    list.push(null)
  }

  const fixedTeam = list[0]
  let rotatingTeams = list.slice(1)
  const rounds = list.length - 1
  const fixtures = []

  for (let roundIndex = 0; roundIndex < rounds; roundIndex += 1) {
    const currentTeams = [fixedTeam, ...rotatingTeams]
    const pairCount = currentTeams.length / 2

    for (let pairIndex = 0; pairIndex < pairCount; pairIndex += 1) {
      const leftTeam = currentTeams[pairIndex]
      const rightTeam = currentTeams[currentTeams.length - 1 - pairIndex]

      if (!leftTeam || !rightTeam) {
        continue
      }

      fixtures.push({
        homeTeam: leftTeam,
        awayTeam: rightTeam,
        round: roundIndex + 1,
        pairIndex,
      })
    }

    if (rotatingTeams.length > 1) {
      rotatingTeams = [rotatingTeams[rotatingTeams.length - 1], ...rotatingTeams.slice(0, -1)]
    }
  }

  return fixtures
}

export function createRoundRobinFixtures({
  group = {},
  teams = [],
  roundRobinMode = 'single',
  homeAwayEnabled = false,
  matchdayStart = 1,
  matchdaySpacingDays = 7,
  baseDate = '',
  venue = '',
} = {}) {
  const normalizedTeams = (Array.isArray(teams) ? teams : []).map(normalizeTeamRecord).filter(Boolean)
  const mode = normalizeMode(roundRobinMode)

  if (normalizedTeams.length < 2) {
    return {
      fixtures: [],
      roundsPerLeg: 0,
      matchdays: 0,
      mode,
      teamCount: normalizedTeams.length,
    }
  }

  const baseGroupId = normalizeText(group?.id) || 'group-01'
  const baseGroupName = normalizeText(group?.name) || 'Group'
  const groupIndex = Number(group?.groupIndex ?? 0) || 0
  const firstLeg = buildRoundRobinLeg(normalizedTeams)
  const secondLeg =
    mode === 'double'
      ? firstLeg.map((fixture) => ({
          ...fixture,
          homeTeam: fixture.awayTeam,
          awayTeam: fixture.homeTeam,
        }))
      : []

  const allFixtures = [...firstLeg, ...secondLeg]
  const roundsPerLeg = firstLeg.length ? Math.max(...firstLeg.map((fixture) => fixture.round)) : 0
  const matchdayCount = mode === 'double' ? roundsPerLeg * 2 : roundsPerLeg

  const fixtures = allFixtures.map((fixture, index) => {
    const leg = mode === 'double' && index >= firstLeg.length ? 2 : 1
    const round = fixture.round
    const matchday = matchdayStart + (leg === 1 ? round - 1 : roundsPerLeg + round - 1)
    const homeFirst = homeAwayEnabled ? (round + fixture.pairIndex) % 2 === 0 : true
    const homeTeam = homeFirst ? fixture.homeTeam : fixture.awayTeam
    const awayTeam = homeFirst ? fixture.awayTeam : fixture.homeTeam

    return {
      id: createFixtureId({
        groupId: baseGroupId,
        matchday,
        leg,
        index,
      }),
      groupId: baseGroupId,
      groupName: baseGroupName,
      groupIndex,
      round: matchday,
      leg,
      pairIndex: fixture.pairIndex,
      homeTeamId: homeTeam.id,
      homeTeamName: homeTeam.name,
      awayTeamId: awayTeam.id,
      awayTeamName: awayTeam.name,
      matchday,
      venue: normalizeText(venue),
      dateTime: createFixtureDate(baseDate, (matchday - matchdayStart) * Number(matchdaySpacingDays || 7)),
      status: 'scheduled',
      score: {
        home: null,
        away: null,
      },
      events: [],
      notes: '',
    }
  })

  return {
    fixtures,
    roundsPerLeg,
    matchdays: matchdayCount,
    mode,
    teamCount: normalizedTeams.length,
  }
}

export function sortRoundRobinFixtures(fixtures = []) {
  return [...(Array.isArray(fixtures) ? fixtures : [])].sort((left, right) => {
    const leftMatchday = Number(left?.matchday || 0)
    const rightMatchday = Number(right?.matchday || 0)

    if (leftMatchday !== rightMatchday) {
      return leftMatchday - rightMatchday
    }

    return String(left?.id || '').localeCompare(String(right?.id || ''))
  })
}
