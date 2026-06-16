import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  addTournamentTeam,
  buildQueryParams,
  compareMatchEvents,
  createMatchEvent,
  createSportCoach,
  createSportMatch,
  createSportPlayer,
  createSportTeam,
  createSportTournament,
  deleteMatchEvent,
  deleteSportCoach,
  deleteSportMatch,
  deleteSportPlayer,
  deleteSportTeam,
  deleteSportTournament,
  fetchSportAttendance,
  fetchCoachDashboard,
  fetchMatchEvents,
  fetchSportCoach,
  fetchSportCoaches,
  fetchSportDashboard,
  fetchSportMatch,
  fetchSportMatches,
  fetchSportPlayer,
  fetchSportPlayers,
  fetchSportTeam,
  fetchSportTeams,
  fetchSportTournament,
  fetchSportTournaments,
  fetchTournamentStandings,
  normalizeBooleanLike,
  normalizePerPage,
  saveSportAttendance,
  saveSportPlayerAttendance,
  recalculateTournamentStandings,
  removeTournamentTeam,
  updateMatchEvent,
  updateMatchStatus,
  updateSportCoach,
  updateSportMatch,
  updateSportPlayer,
  updateSportTeam,
  updateSportTournament,
} from '@/modules/sport/services/sportApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

function stubResponse(data) {
  return { data: { success: true, message: 'ok', data } }
}

function getFormEntries(formData) {
  return Array.from(formData.entries())
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('sportApi shared helpers', () => {
  it('preserves query param normalization and event comparison behavior', () => {
    expect(buildQueryParams({ search: '  Lions  ', empty: '   ', page: 1 })).toEqual({
      search: 'Lions',
      page: 1,
    })

    expect(normalizeBooleanLike('yes')).toBe(true)
    expect(normalizeBooleanLike(0)).toBe(false)
    expect(normalizePerPage(200)).toBe(100)
    expect(normalizePerPage('75')).toBe(75)
    expect(normalizePerPage(-1)).toBe(25)
    expect(normalizePerPage('not-a-number')).toBe(25)

    const sorted = [
      { id: '3', minute: 45, extraTimeMinute: 1 },
      { id: '1', minute: 45 },
      { id: '2', minute: 90, extraTimeMinute: 5 },
    ].sort(compareMatchEvents)

    expect(sorted.map((event) => event.id)).toEqual(['1', '3', '2'])
  })
})

describe('sport dashboard APIs', () => {
  it('loads admin dashboard data with normalized entities', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        summary: { teams: 2, players: 3 },
        featuredTournament: { id: 10, name: 'League One', tournament_type: 'league' },
        teams: [{ id: 1, name: 'Team A' }],
        players: [{ id: 2, first_name: 'A', last_name: 'B' }],
        matches: [{ id: 3, homeTeam: { name: 'Team A' }, awayTeam: { name: 'Team B' } }],
        events: [{ id: 4, event_type: 'goal', team_id: 1 }],
        tournaments: [{ id: 5, name: 'Cup' }],
        standings: [{ id: 6, team: { id: 7, name: 'Team A' } }],
      }),
    )

    const result = await fetchSportDashboard()

    expect(http.get).toHaveBeenCalledWith('/sport/dashboard', { signal: undefined })
    expect(result.summary).toEqual({ teams: 2, players: 3 })
    expect(result.featuredTournament.name).toBe('League One')
    expect(result.teams[0].name).toBe('Team A')
    expect(result.players[0].name).toBe('A B')
    expect(result.matches[0].homeTeam).toBe('Team A')
    expect(result.events[0].eventType).toBe('goal')
    expect(result.standings[0].team.name).toBe('Team A')
  })

  it('loads coach dashboard data raw', async () => {
    http.get.mockResolvedValueOnce(stubResponse({ summary: { matches: 4 } }))

    await expect(fetchCoachDashboard()).resolves.toEqual({ summary: { matches: 4 } })
  })
})

describe('sport team APIs', () => {
  it('fetches, creates, updates, and deletes teams with unchanged contracts', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({ items: [{ id: 1, team_code: 'T-1', name: 'Team A' }], pagination: { page: 2, perPage: 5, total: 10, totalPages: 2 } }),
    )
    const list = await fetchSportTeams({ page: 2, perPage: 5, search: '  Team  ', status: 'active' })
    expect(http.get).toHaveBeenCalledWith('/sport/teams', {
      params: expect.objectContaining({
        page: 2,
        per_page: 5,
        search: 'Team',
        status: 'active',
        sort_by: 'created_at',
        sort_direction: 'desc',
      }),
      signal: undefined,
    })
    expect(list.items[0].teamCode).toBe('T-1')

    http.get.mockResolvedValueOnce(stubResponse({ team: { id: 2, name: 'Team B' } }))
    await expect(fetchSportTeam(2)).resolves.toMatchObject({ id: 2, name: 'Team B' })

    http.post.mockResolvedValueOnce(stubResponse({ team: { id: 3, name: 'Team C' } }))
    await expect(createSportTeam({ name: 'Team C', coachUserId: 9 })).resolves.toMatchObject({ id: 3, name: 'Team C' })
    const createPayload = http.post.mock.calls[0][1]
    expect(getFormEntries(createPayload)).toEqual(expect.arrayContaining([
      ['name', 'Team C'],
      ['coach_user_id', '9'],
    ]))

    http.post.mockResolvedValueOnce(stubResponse({ team: { id: 4, name: 'Team D' } }))
    await expect(updateSportTeam(4, { name: 'Team D' })).resolves.toMatchObject({ id: 4, name: 'Team D' })
    const updatePayload = http.post.mock.calls[1][1]
    expect(getFormEntries(updatePayload)).toEqual(expect.arrayContaining([
      ['name', 'Team D'],
      ['_method', 'PUT'],
    ]))

    http.delete.mockResolvedValueOnce(stubResponse(null))
    await expect(deleteSportTeam(5)).resolves.toBe(true)
    expect(http.delete).toHaveBeenCalledWith('/sport/teams/5')
  })
})

describe('sport player APIs', () => {
  it('fetches, creates, updates, and deletes players with unchanged contracts', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({ items: [{ id: 1, first_name: 'Ada', last_name: 'Lovelace' }], pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 } }),
    )
    const list = await fetchSportPlayers({ teamId: 12, search: 'Ada' })
    expect(http.get).toHaveBeenCalledWith('/sport/players', {
      params: expect.objectContaining({
        team_id: 12,
        search: 'Ada',
        sort_by: 'created_at',
        sort_direction: 'desc',
      }),
      signal: undefined,
    })
    expect(list.items[0].name).toBe('Ada Lovelace')

    http.get.mockResolvedValueOnce(
      stubResponse({ items: [], pagination: { page: 1, perPage: 100, total: 0, totalPages: 1 } }),
    )
    await fetchSportPlayers({ perPage: 200 })
    expect(http.get).toHaveBeenLastCalledWith('/sport/players', {
      params: expect.objectContaining({ per_page: 100, page: 1 }),
      signal: undefined,
    })

    http.get.mockResolvedValueOnce(stubResponse({ player: { id: 2, first_name: 'Grace', last_name: 'Hopper' } }))
    await expect(fetchSportPlayer(2)).resolves.toMatchObject({ id: 2, name: 'Grace Hopper' })

    http.post.mockResolvedValueOnce(stubResponse({ player: { id: 3, first_name: 'Marie', last_name: 'Curie' } }))
    await expect(createSportPlayer({ fullName: 'Marie Curie', team: 'A' })).resolves.toMatchObject({ id: 3, name: 'Marie Curie' })
    expect(getFormEntries(http.post.mock.calls[0][1])).toEqual(expect.arrayContaining([
      ['name', 'Marie Curie'],
      ['team', 'A'],
    ]))

    http.post.mockResolvedValueOnce(stubResponse({ player: { id: 4, first_name: 'N', last_name: 'R' } }))
    await expect(updateSportPlayer(4, { name: 'N R' })).resolves.toMatchObject({ id: 4, name: 'N R' })
    expect(getFormEntries(http.post.mock.calls[1][1])).toEqual(expect.arrayContaining([
      ['name', 'N R'],
      ['_method', 'PUT'],
    ]))

    http.delete.mockResolvedValueOnce(stubResponse(null))
    await expect(deleteSportPlayer(5)).resolves.toBe(true)
    expect(http.delete).toHaveBeenCalledWith('/sport/players/5')
  })
})

describe('sport coach APIs', () => {
  it('fetches, creates, updates, and deletes coaches with unchanged contracts', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({ items: [{ id: 1, name: 'Coach One' }], pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 } }),
    )
    const list = await fetchSportCoaches({ search: 'Coach' })
    expect(http.get).toHaveBeenCalledWith('/sport/coaches', {
      params: expect.objectContaining({ search: 'Coach' }),
      signal: undefined,
    })
    expect(list.items[0].name).toBe('Coach One')

    http.get.mockResolvedValueOnce(stubResponse({ coach: { id: 2, name: 'Coach Two' } }))
    await expect(fetchSportCoach(2)).resolves.toMatchObject({ id: 2, name: 'Coach Two' })

    http.post.mockResolvedValueOnce(stubResponse({ coach: { id: 3, name: 'Coach Three' } }))
    await expect(createSportCoach({ fullName: 'Coach Three', email: 'c@example.com' })).resolves.toMatchObject({ id: 3, name: 'Coach Three' })
    expect(getFormEntries(http.post.mock.calls[0][1])).toEqual(expect.arrayContaining([
      ['name', 'Coach Three'],
      ['email', 'c@example.com'],
    ]))

    http.post.mockResolvedValueOnce(stubResponse({ coach: { id: 4, name: 'Coach Four' } }))
    await expect(updateSportCoach(4, { name: 'Coach Four' })).resolves.toMatchObject({ id: 4, name: 'Coach Four' })
    expect(getFormEntries(http.post.mock.calls[1][1])).toEqual(expect.arrayContaining([
      ['name', 'Coach Four'],
      ['_method', 'PUT'],
    ]))

    http.delete.mockResolvedValueOnce(stubResponse(null))
    await expect(deleteSportCoach(5)).resolves.toBe(true)
    expect(http.delete).toHaveBeenCalledWith('/sport/coaches/5')
  })
})

describe('sport attendance APIs', () => {
  it('fetches and saves player and coach attendance with normalized payloads', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({
        items: [
          {
            id: 1,
            attendance_type: 'player',
            team_id: 2,
            player: { id: 3, first_name: 'Ada', last_name: 'Lovelace' },
            attendance_date: '2026-06-01',
            status: 'present',
            note: 'on time',
          },
        ],
        pagination: { page: 1, perPage: 25, total: 1, totalPages: 1 },
      }),
    )

    const playerList = await fetchSportAttendance({
      attendanceType: 'player',
      teamId: 2,
      attendanceDate: '2026-06-01',
    })

    expect(http.get).toHaveBeenCalledWith('/sport/attendance', {
      params: expect.objectContaining({
        attendance_type: 'player',
        team_id: 2,
        attendance_date: '2026-06-01',
      }),
      signal: undefined,
    })
    expect(playerList.items[0]).toMatchObject({
      attendanceType: 'player',
      teamId: 2,
      personName: 'Ada Lovelace',
      status: 'present',
    })

    http.post.mockResolvedValueOnce(
      stubResponse({
        attendance: {
          id: 4,
          attendance_type: 'coach',
          coach: { id: 5, name: 'Coach One' },
          attendance_date: '2026-06-01',
          status: 'absent',
        },
      }),
    )

    await expect(
      saveSportAttendance({
        attendanceType: 'coach',
        coachId: 5,
        attendanceDate: '2026-06-01',
        status: 'absent',
      }),
    ).resolves.toMatchObject({
      id: 4,
      attendanceType: 'coach',
      coachName: 'Coach One',
      status: 'absent',
    })

    expect(http.post).toHaveBeenCalledWith(
      '/sport/attendance',
      expect.objectContaining({
        attendance_type: 'coach',
        coach_id: 5,
        attendance_date: '2026-06-01',
        status: 'absent',
      }),
    )

    http.post.mockResolvedValueOnce(stubResponse({ attendance: { id: 6, attendance_type: 'player' } }))
    await expect(
      saveSportPlayerAttendance({
        playerId: 9,
        attendanceDate: '2026-06-01',
        status: 'present',
      }),
    ).resolves.toMatchObject({
      id: 6,
      attendanceType: 'player',
    })
  })
})

describe('sport match APIs', () => {
  it('fetches, creates, updates, and deletes matches with unchanged contracts', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({ items: [{ id: 1, match_code: 'M-1', home_team: { name: 'Team A' }, away_team: { name: 'Team B' } }], pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 } }),
    )
    const list = await fetchSportMatches({ status: 'live', teamId: 7 })
    expect(http.get).toHaveBeenCalledWith('/sport/matches', {
      params: expect.objectContaining({
        status: 'live',
        team_id: 7,
        sort_by: 'scheduled_at',
        sort_direction: 'desc',
      }),
      signal: undefined,
    })
    expect(list.items[0].matchCode).toBe('M-1')

    http.get.mockResolvedValueOnce(stubResponse({ match: { id: 2, homeTeam: { name: 'Team A' }, awayTeam: { name: 'Team B' } } }))
    await expect(fetchSportMatch(2)).resolves.toMatchObject({ id: 2, homeTeam: 'Team A', awayTeam: 'Team B' })

    http.post.mockResolvedValueOnce(stubResponse({ match: { id: 3, home_team: { name: 'Team A' }, away_team: { name: 'Team B' } } }))
    await expect(createSportMatch({ homeTeam: 'Team A', awayTeam: 'Team B', status: 'scheduled' })).resolves.toMatchObject({ id: 3 })
    expect(getFormEntries(http.post.mock.calls[0][1])).toEqual(expect.arrayContaining([
      ['home_team', 'Team A'],
      ['away_team', 'Team B'],
      ['status', 'scheduled'],
    ]))

    http.post.mockResolvedValueOnce(stubResponse({ match: { id: 4 } }))
    await expect(updateSportMatch(4, { homeTeam: 'Team C' })).resolves.toMatchObject({ id: 4 })
    expect(getFormEntries(http.post.mock.calls[1][1])).toEqual(expect.arrayContaining([
      ['home_team', 'Team C'],
      ['_method', 'PUT'],
    ]))

    http.patch.mockResolvedValueOnce(stubResponse({ match: { id: 5, status: 'completed' } }))
    await expect(updateMatchStatus(5, { status: 'completed', currentPeriod: 'final' })).resolves.toMatchObject({ id: 5, status: 'completed' })
    expect(http.patch).toHaveBeenCalledWith('/sport/matches/5/status', { status: 'completed', current_period: 'final' })

    http.get.mockResolvedValueOnce(
      stubResponse({
        match: { homeTeamId: 11, awayTeamId: 12 },
        items: [
          { id: 'b', minute: 90, extra_time_minute: 5, event_type: 'goal' },
          { id: 'a', minute: 45, event_type: 'goal' },
        ],
      }),
    )
    const events = await fetchMatchEvents(5)
    expect(http.get).toHaveBeenCalledWith('/sport/matches/5/events', { signal: undefined })
    expect(events.items.map((event) => event.id)).toEqual(['a', 'b'])

    http.post.mockResolvedValueOnce(stubResponse({ event: { id: 6, event_type: 'goal' } }))
    await expect(createMatchEvent(5, { teamId: 11, eventType: 'goal', minute: 12 })).resolves.toMatchObject({ id: 6, eventType: 'goal' })
    expect(getFormEntries(http.post.mock.calls[2][1])).toEqual(expect.arrayContaining([
      ['team_id', '11'],
      ['event_type', 'goal'],
      ['minute', '12'],
    ]))

    http.post.mockResolvedValueOnce(stubResponse({ event: { id: 7, event_type: 'yellow_card' } }))
    await expect(updateMatchEvent(7, { eventType: 'yellow_card', minute: 33 })).resolves.toMatchObject({ id: 7, eventType: 'yellow_card' })
    expect(getFormEntries(http.post.mock.calls[3][1])).toEqual(expect.arrayContaining([
      ['event_type', 'yellow_card'],
      ['_method', 'PUT'],
    ]))

    http.delete.mockResolvedValueOnce(stubResponse(null))
    await expect(deleteMatchEvent(8)).resolves.toBe(true)
    expect(http.delete).toHaveBeenCalledWith('/sport/events/8')

    http.delete.mockResolvedValueOnce(stubResponse(null))
    await expect(deleteSportMatch(9)).resolves.toBe(true)
    expect(http.delete).toHaveBeenCalledWith('/sport/matches/9')
  })
})

describe('sport tournament and standings APIs', () => {
  it('fetches tournaments, mutates memberships, and recalculates standings with unchanged contracts', async () => {
    http.get.mockResolvedValueOnce(
      stubResponse({ items: [{ id: 1, tournament_code: 'T-1', name: 'League One' }], pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 } }),
    )
    const list = await fetchSportTournaments({ type: 'league' })
    expect(http.get).toHaveBeenCalledWith('/sport/tournaments', {
      params: expect.objectContaining({ type: 'league', sort_by: 'created_at', sort_direction: 'desc' }),
      signal: undefined,
    })
    expect(list.items[0].name).toBe('League One')

    http.get.mockResolvedValueOnce(stubResponse({ tournament: { id: 2, name: 'League Two' } }))
    await expect(fetchSportTournament(2)).resolves.toMatchObject({ id: 2, name: 'League Two' })

    http.post.mockResolvedValueOnce(stubResponse({ tournament: { id: 3, name: 'League Three' } }))
    await expect(createSportTournament({ name: 'League Three' })).resolves.toMatchObject({ id: 3, name: 'League Three' })
    expect(getFormEntries(http.post.mock.calls[0][1])).toEqual(expect.arrayContaining([
      ['name', 'League Three'],
    ]))

    http.post.mockResolvedValueOnce(stubResponse({ tournament: { id: 4, name: 'League Four' } }))
    await expect(updateSportTournament(4, { name: 'League Four' })).resolves.toMatchObject({ id: 4, name: 'League Four' })
    expect(getFormEntries(http.post.mock.calls[1][1])).toEqual(expect.arrayContaining([
      ['name', 'League Four'],
      ['_method', 'PUT'],
    ]))

    http.post.mockResolvedValueOnce(stubResponse({ tournament: { id: 5 }, standings: [{ id: 9, team: { id: 10, name: 'Team A' } }] }))
    await expect(addTournamentTeam(5, 8)).resolves.toMatchObject({
      tournament: { id: 5 },
      standings: [{ id: 9, team: { name: 'Team A' } }],
    })
    expect(http.post).toHaveBeenCalledWith('/sport/tournaments/5/teams', { team_id: 8 })

    http.delete.mockResolvedValueOnce(stubResponse({ tournament: { id: 6 }, standings: [{ id: 11, team: { id: 12, name: 'Team B' } }] }))
    await expect(removeTournamentTeam(6, 13)).resolves.toMatchObject({
      tournament: { id: 6 },
      standings: [{ id: 11, team: { name: 'Team B' } }],
    })
    expect(http.delete).toHaveBeenCalledWith('/sport/tournaments/6/teams/13')

    http.get.mockResolvedValueOnce(
      stubResponse({ items: [{ id: 14, team: { id: 15, name: 'Team C' }, points: 7 }], pagination: { page: 1, perPage: 50, total: 1, totalPages: 1 } }),
    )
    await expect(fetchTournamentStandings(16)).resolves.toMatchObject({
      items: [{ id: 14, team: { name: 'Team C' }, points: 7 }],
    })
    expect(http.get).toHaveBeenCalledWith('/sport/tournaments/16/standings', {
      params: { page: 1, per_page: 50 },
      signal: undefined,
    })

    http.post.mockResolvedValueOnce(stubResponse({ tournamentId: 17, standings: [{ id: 18, team: { id: 19, name: 'Team D' } }] }))
    await expect(recalculateTournamentStandings(17)).resolves.toMatchObject({
      tournamentId: 17,
      standings: [{ id: 18, team: { name: 'Team D' } }],
    })

    http.delete.mockResolvedValueOnce(stubResponse(null))
    await expect(deleteSportTournament(20)).resolves.toBe(true)
    expect(http.delete).toHaveBeenCalledWith('/sport/tournaments/20')
  })
})
