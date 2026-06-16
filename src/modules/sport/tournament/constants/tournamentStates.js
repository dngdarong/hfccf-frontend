export const TOURNAMENT_STATES = [
  'draft',
  'registration_open',
  'registration_closed',
  'group_draw_completed',
  'fixtures_generated',
  'active',
  'knockout_stage',
  'completed',
  'archived',
]

export const TOURNAMENT_STATE_ORDER = [...TOURNAMENT_STATES]

export const TOURNAMENT_STATE_TRANSITIONS = {
  draft: ['registration_open', 'archived'],
  registration_open: ['registration_closed', 'archived'],
  registration_closed: ['group_draw_completed', 'archived'],
  group_draw_completed: ['fixtures_generated', 'archived'],
  fixtures_generated: ['active', 'archived'],
  active: ['knockout_stage', 'completed', 'archived'],
  knockout_stage: ['completed', 'archived'],
  completed: ['archived'],
  archived: [],
}

export const TOURNAMENT_STATE_LABEL_KEYS = {
  draft: 'sportTournament.states.draft',
  registration_open: 'sportTournament.states.registrationOpen',
  registration_closed: 'sportTournament.states.registrationClosed',
  group_draw_completed: 'sportTournament.states.groupDrawCompleted',
  fixtures_generated: 'sportTournament.states.fixturesGenerated',
  active: 'sportTournament.states.active',
  knockout_stage: 'sportTournament.states.knockoutStage',
  completed: 'sportTournament.states.completed',
  archived: 'sportTournament.states.archived',
}

export const TOURNAMENT_STATE_DESCRIPTION_KEYS = {
  draft: 'sportTournament.stateDescriptions.draft',
  registration_open: 'sportTournament.stateDescriptions.registrationOpen',
  registration_closed: 'sportTournament.stateDescriptions.registrationClosed',
  group_draw_completed: 'sportTournament.stateDescriptions.groupDrawCompleted',
  fixtures_generated: 'sportTournament.stateDescriptions.fixturesGenerated',
  active: 'sportTournament.stateDescriptions.active',
  knockout_stage: 'sportTournament.stateDescriptions.knockoutStage',
  completed: 'sportTournament.stateDescriptions.completed',
  archived: 'sportTournament.stateDescriptions.archived',
}

export const TOURNAMENT_STATE_TONES = {
  draft: 'info',
  registration_open: 'warning',
  registration_closed: 'warning',
  group_draw_completed: 'info',
  fixtures_generated: 'info',
  active: 'success',
  knockout_stage: 'warning',
  completed: 'success',
  archived: 'neutral',
}

export const TOURNAMENT_SPORT_TYPES = [
  'football',
  'basketball',
  'volleyball',
  'badminton',
]

export const TOURNAMENT_VISIBILITY_OPTIONS = [
  'public',
  'private',
  'hidden',
]

export const TOURNAMENT_REGISTRATION_STATUSES = [
  'open',
  'closed',
  'waitlist',
]

export const TOURNAMENT_RULE_DEFAULTS = {
  groupCount: 4,
  teamsPerGroup: 4,
  pointsWin: 3,
  pointsDraw: 1,
  pointsLoss: 0,
  knockoutEnabled: true,
  homeAwayEnabled: false,
  extraTimeEnabled: false,
  penaltyEnabled: false,
}
