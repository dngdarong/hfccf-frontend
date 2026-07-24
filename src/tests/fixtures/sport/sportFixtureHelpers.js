// Sport Fixture Helper Functions
// Provides convenient utilities for working with sport demo data in tests

import { sportDemoData } from './sportDemoData';

/**
 * Deep clone fixture data to avoid mutations
 */
export function cloneFixture(data) {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Get all fixtures as an isolated copy
 */
export function getIsolatedFixtures() {
  return cloneFixture(sportDemoData);
}

// ============================================================================
// TEAM HELPERS
// ============================================================================

/**
 * Get all teams
 */
export function getTeams() {
  return cloneFixture(sportDemoData.teams);
}

/**
 * Get team by ID
 */
export function getTeamById(id) {
  return cloneFixture(sportDemoData.teams.find(t => t.id === id));
}

/**
 * Get team by code
 */
export function getTeamByCode(code) {
  return cloneFixture(sportDemoData.teams.find(t => t.team_code === code));
}

/**
 * Get teams by division
 */
export function getTeamsByDivision(divisionId) {
  return cloneFixture(sportDemoData.teams.filter(t => t.division_id === divisionId));
}

/**
 * Create a test team with overrides
 */
export function createTestTeam(overrides = {}) {
  const baseTeam = cloneFixture(sportDemoData.teams[0]);
  return { ...baseTeam, ...overrides };
}

// ============================================================================
// PLAYER HELPERS
// ============================================================================

/**
 * Get all players
 */
export function getPlayers() {
  return cloneFixture(sportDemoData.players);
}

/**
 * Get player by ID
 */
export function getPlayerById(id) {
  return cloneFixture(sportDemoData.players.find(p => p.id === id));
}

/**
 * Get players by team
 */
export function getPlayersByTeam(teamId) {
  return cloneFixture(sportDemoData.players.filter(p => p.team_id === teamId));
}

/**
 * Get players by position
 */
export function getPlayersByPosition(position) {
  return cloneFixture(sportDemoData.players.filter(p => p.position === position));
}

/**
 * Get goalkeeper
 */
export function getGoalkeepers() {
  return getPlayersByPosition('Goalkeeper');
}

/**
 * Get defenders
 */
export function getDefenders() {
  return getPlayersByPosition('Defender');
}

/**
 * Get midfielders
 */
export function getMidfielders() {
  return getPlayersByPosition('Midfielder');
}

/**
 * Get forwards
 */
export function getForwards() {
  return getPlayersByPosition('Forward');
}

/**
 * Create a test player with overrides
 */
export function createTestPlayer(overrides = {}) {
  const basePlayer = cloneFixture(sportDemoData.players[0]);
  return { ...basePlayer, ...overrides };
}

/**
 * Create multiple test players
 */
export function createTestPlayers(count = 5, overrides = {}) {
  return Array.from({ length: count }, (_, i) =>
    createTestPlayer({
      id: (i + 1) * 1000,
      player_code: `TEST_PLY_${i + 1}`,
      ...overrides
    })
  );
}

// ============================================================================
// MATCH HELPERS
// ============================================================================

/**
 * Get all matches
 */
export function getMatches() {
  return cloneFixture(sportDemoData.matches);
}

/**
 * Get match by ID
 */
export function getMatchById(id) {
  return cloneFixture(sportDemoData.matches.find(m => m.id === id));
}

/**
 * Get match by code
 */
export function getMatchByCode(code) {
  return cloneFixture(sportDemoData.matches.find(m => m.match_code === code));
}

/**
 * Get completed matches
 */
export function getCompletedMatches() {
  return cloneFixture(sportDemoData.matches.filter(m => m.status === 'completed'));
}

/**
 * Get scheduled matches
 */
export function getScheduledMatches() {
  return cloneFixture(sportDemoData.matches.filter(m => m.status === 'scheduled'));
}

/**
 * Get matches by team (home or away)
 */
export function getMatchesByTeam(teamId) {
  return cloneFixture(sportDemoData.matches.filter(m =>
    m.home_team_id === teamId || m.away_team_id === teamId
  ));
}

/**
 * Create a test match with overrides
 */
export function createTestMatch(overrides = {}) {
  const baseMatch = cloneFixture(sportDemoData.matches[0]);
  return { ...baseMatch, ...overrides };
}

// ============================================================================
// TOURNAMENT HELPERS
// ============================================================================

/**
 * Get all tournaments
 */
export function getTournaments() {
  return cloneFixture(sportDemoData.tournaments);
}

/**
 * Get tournament by ID
 */
export function getTournamentById(id) {
  return cloneFixture(sportDemoData.tournaments.find(t => t.id === id));
}

/**
 * Get tournament by code
 */
export function getTournamentByCode(code) {
  return cloneFixture(sportDemoData.tournaments.find(t => t.tournament_code === code));
}

/**
 * Get active tournaments
 */
export function getActiveTournaments() {
  return cloneFixture(sportDemoData.tournaments.filter(t => t.status === 'active'));
}

/**
 * Get draft tournaments
 */
export function getDraftTournaments() {
  return cloneFixture(sportDemoData.tournaments.filter(t => t.status === 'draft'));
}

/**
 * Create a test tournament with overrides
 */
export function createTestTournament(overrides = {}) {
  const baseTournament = cloneFixture(sportDemoData.tournaments[0]);
  return { ...baseTournament, ...overrides };
}

// ============================================================================
// TRAINING SESSION HELPERS
// ============================================================================

/**
 * Get all training sessions
 */
export function getTrainingSessions() {
  return cloneFixture(sportDemoData.trainingSessions);
}

/**
 * Get training session by ID
 */
export function getTrainingSessionById(id) {
  return cloneFixture(sportDemoData.trainingSessions.find(s => s.id === id));
}

/**
 * Get sessions by team
 */
export function getSessionsByTeam(teamId) {
  return cloneFixture(sportDemoData.trainingSessions.filter(s => s.team_id === teamId));
}

/**
 * Get sessions by coach
 */
export function getSessionsByCoach(coachId) {
  return cloneFixture(sportDemoData.trainingSessions.filter(s => s.coach_user_id === coachId));
}

/**
 * Get sessions by type
 */
export function getSessionsByType(type) {
  return cloneFixture(sportDemoData.trainingSessions.filter(s => s.training_type === type));
}

/**
 * Get completed sessions
 */
export function getCompletedSessions() {
  return cloneFixture(sportDemoData.trainingSessions.filter(s => s.status === 'completed'));
}

/**
 * Create a test training session with overrides
 */
export function createTestTrainingSession(overrides = {}) {
  const baseSession = cloneFixture(sportDemoData.trainingSessions[0]);
  return { ...baseSession, ...overrides };
}

// ============================================================================
// EQUIPMENT HELPERS
// ============================================================================

/**
 * Get all equipment items
 */
export function getEquipmentItems() {
  return cloneFixture(sportDemoData.equipmentItems);
}

/**
 * Get equipment by ID
 */
export function getEquipmentById(id) {
  return cloneFixture(sportDemoData.equipmentItems.find(e => e.id === id));
}

/**
 * Get equipment by code
 */
export function getEquipmentByCode(code) {
  return cloneFixture(sportDemoData.equipmentItems.find(e => e.equipment_code === code));
}

/**
 * Get equipment by category
 */
export function getEquipmentByCategory(category) {
  return cloneFixture(sportDemoData.equipmentItems.filter(e => e.category === category));
}

/**
 * Get equipment requests
 */
export function getEquipmentRequests() {
  return cloneFixture(sportDemoData.equipmentRequests);
}

/**
 * Get equipment request by ID
 */
export function getEquipmentRequestById(id) {
  return cloneFixture(sportDemoData.equipmentRequests.find(r => r.id === id));
}

/**
 * Get approved equipment requests
 */
export function getApprovedEquipmentRequests() {
  return cloneFixture(sportDemoData.equipmentRequests.filter(r => r.status === 'approved'));
}

/**
 * Get pending equipment requests
 */
export function getPendingEquipmentRequests() {
  return cloneFixture(sportDemoData.equipmentRequests.filter(r => r.status === 'pending'));
}

/**
 * Create a test equipment item with overrides
 */
export function createTestEquipmentItem(overrides = {}) {
  const baseItem = cloneFixture(sportDemoData.equipmentItems[0]);
  return { ...baseItem, ...overrides };
}

/**
 * Create a test equipment request with overrides
 */
export function createTestEquipmentRequest(overrides = {}) {
  const baseRequest = cloneFixture(sportDemoData.equipmentRequests[0]);
  return { ...baseRequest, ...overrides };
}

// ============================================================================
// ATTENDANCE HELPERS
// ============================================================================

/**
 * Get all attendance records
 */
export function getAttendanceRecords() {
  return cloneFixture(sportDemoData.attendanceRecords);
}

/**
 * Get attendance by type
 */
export function getAttendanceByType(type) {
  return cloneFixture(sportDemoData.attendanceRecords.filter(a => a.attendance_type === type));
}

/**
 * Get training attendance
 */
export function getTrainingAttendance() {
  return getAttendanceByType('training');
}

/**
 * Get match attendance
 */
export function getMatchAttendance() {
  return getAttendanceByType('match');
}

/**
 * Get attendance by status
 */
export function getAttendanceByStatus(status) {
  return cloneFixture(sportDemoData.attendanceRecords.filter(a => a.status === status));
}

/**
 * Get present records
 */
export function getPresentRecords() {
  return getAttendanceByStatus('present');
}

/**
 * Get absent records
 */
export function getAbsentRecords() {
  return getAttendanceByStatus('absent');
}

/**
 * Get attendance by player
 */
export function getAttendanceByPlayer(playerId) {
  return cloneFixture(sportDemoData.attendanceRecords.filter(a => a.player_id === playerId));
}

/**
 * Create a test attendance record with overrides
 */
export function createTestAttendanceRecord(overrides = {}) {
  const baseRecord = cloneFixture(sportDemoData.attendanceRecords[0]);
  return { ...baseRecord, ...overrides };
}

// ============================================================================
// DIVISION HELPERS
// ============================================================================

/**
 * Get all divisions
 */
export function getDivisions() {
  return cloneFixture(sportDemoData.divisions);
}

/**
 * Get division by ID
 */
export function getDivisionById(id) {
  return cloneFixture(sportDemoData.divisions.find(d => d.id === id));
}

/**
 * Get active divisions
 */
export function getActiveDivisions() {
  return cloneFixture(sportDemoData.divisions.filter(d => d.status === 'active'));
}

// ============================================================================
// PLAYING STYLE HELPERS
// ============================================================================

/**
 * Get all playing styles
 */
export function getPlayingStyles() {
  return cloneFixture(sportDemoData.playingStyles);
}

/**
 * Get playing style by ID
 */
export function getPlayingStyleById(id) {
  return cloneFixture(sportDemoData.playingStyles.find(p => p.id === id));
}

// ============================================================================
// COACH ASSIGNMENT HELPERS
// ============================================================================

/**
 * Get all coach team assignments
 */
export function getCoachTeamAssignments() {
  return cloneFixture(sportDemoData.coachTeamAssignments);
}

/**
 * Get assignments by coach
 */
export function getAssignmentsByCoach(coachId) {
  return cloneFixture(sportDemoData.coachTeamAssignments.filter(a => a.coach_user_id === coachId));
}

/**
 * Get assignments by team
 */
export function getAssignmentsByTeam(teamId) {
  return cloneFixture(sportDemoData.coachTeamAssignments.filter(a => a.team_id === teamId));
}

/**
 * Get active coach assignments
 */
export function getActiveCoachAssignments() {
  return cloneFixture(sportDemoData.coachTeamAssignments.filter(a => a.status === 'active'));
}

// ============================================================================
// MATCH SQUAD HELPERS
// ============================================================================

/**
 * Get all match squads
 */
export function getMatchSquads() {
  return cloneFixture(sportDemoData.matchSquads);
}

/**
 * Get squad by ID
 */
export function getMatchSquadById(id) {
  return cloneFixture(sportDemoData.matchSquads.find(s => s.id === id));
}

/**
 * Get squads by match
 */
export function getSquadsByMatch(matchId) {
  return cloneFixture(sportDemoData.matchSquads.filter(s => s.match_id === matchId));
}

/**
 * Get approved squads
 */
export function getApprovedSquads() {
  return cloneFixture(sportDemoData.matchSquads.filter(s => s.status === 'approved'));
}

// ============================================================================
// STATISTICS HELPERS
// ============================================================================

/**
 * Get total count of entity
 */
export function getEntityCount(entity) {
  return sportDemoData[entity]?.length || 0;
}

/**
 * Get fixture summary
 */
export function getFixtureSummary() {
  return {
    teams: getEntityCount('teams'),
    players: getEntityCount('players'),
    matches: getEntityCount('matches'),
    tournaments: getEntityCount('tournaments'),
    trainingSessions: getEntityCount('trainingSessions'),
    equipmentItems: getEntityCount('equipmentItems'),
    equipmentRequests: getEntityCount('equipmentRequests'),
    attendanceRecords: getEntityCount('attendanceRecords'),
    matchSquads: getEntityCount('matchSquads'),
    coachTeamAssignments: getEntityCount('coachTeamAssignments'),
    divisions: getEntityCount('divisions'),
    playingStyles: getEntityCount('playingStyles'),
  };
}

/**
 * Get players per team distribution
 */
export function getPlayersPerTeam() {
  const teams = getTeams();
  return teams.map(team => ({
    teamId: team.id,
    teamName: team.name,
    playerCount: getPlayersByTeam(team.id).length,
  }));
}

/**
 * Get team stats
 */
export function getTeamStats(teamId) {
  const team = getTeamById(teamId);
  const players = getPlayersByTeam(teamId);
  const matches = getMatchesByTeam(teamId);
  const sessions = getSessionsByTeam(teamId);

  return {
    ...team,
    playerCount: players.length,
    matchCount: matches.length,
    sessionCount: sessions.length,
    completedMatches: matches.filter(m => m.status === 'completed').length,
    scheduledMatches: matches.filter(m => m.status === 'scheduled').length,
  };
}

/**
 * Get all team stats
 */
export function getAllTeamStats() {
  const teams = getTeams();
  return teams.map(team => getTeamStats(team.id));
}
