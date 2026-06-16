import {
  TOURNAMENT_STATE_DESCRIPTION_KEYS,
  TOURNAMENT_STATE_LABEL_KEYS,
  TOURNAMENT_STATE_ORDER,
  TOURNAMENT_STATE_TONES,
  TOURNAMENT_STATE_TRANSITIONS,
} from '../constants/tournamentStates'

export const TOURNAMENT_ACTION_DEFINITIONS = [
  {
    key: 'openRegistration',
    labelKey: 'sportTournament.actions.openRegistration',
    nextState: 'registration_open',
    tone: 'info',
    availability: ['draft'],
    descriptionKey: 'sportTournament.actionDescriptions.openRegistration',
  },
  {
    key: 'closeRegistration',
    labelKey: 'sportTournament.actions.closeRegistration',
    nextState: 'registration_closed',
    tone: 'warning',
    availability: ['registration_open'],
    descriptionKey: 'sportTournament.actionDescriptions.closeRegistration',
  },
  {
    key: 'drawGroups',
    labelKey: 'sportTournament.actions.drawGroups',
    nextState: 'group_draw_completed',
    tone: 'info',
    availability: ['registration_closed'],
    descriptionKey: 'sportTournament.actionDescriptions.drawGroups',
  },
  {
    key: 'generateFixtures',
    labelKey: 'sportTournament.actions.generateFixtures',
    nextState: 'fixtures_generated',
    tone: 'info',
    availability: ['group_draw_completed'],
    descriptionKey: 'sportTournament.actionDescriptions.generateFixtures',
  },
  {
    key: 'startTournament',
    labelKey: 'sportTournament.actions.startTournament',
    nextState: 'active',
    tone: 'success',
    availability: ['fixtures_generated'],
    descriptionKey: 'sportTournament.actionDescriptions.startTournament',
  },
  {
    key: 'startKnockoutStage',
    labelKey: 'sportTournament.actions.startKnockoutStage',
    nextState: 'knockout_stage',
    tone: 'warning',
    availability: ['active'],
    descriptionKey: 'sportTournament.actionDescriptions.startKnockoutStage',
  },
  {
    key: 'completeTournament',
    labelKey: 'sportTournament.actions.completeTournament',
    nextState: 'completed',
    tone: 'success',
    availability: ['active', 'knockout_stage'],
    descriptionKey: 'sportTournament.actionDescriptions.completeTournament',
  },
  {
    key: 'archiveTournament',
    labelKey: 'sportTournament.actions.archiveTournament',
    nextState: 'archived',
    tone: 'neutral',
    availability: ['completed', 'draft'],
    descriptionKey: 'sportTournament.actionDescriptions.archiveTournament',
  },
]

function normalizeTournamentState(state) {
  const value = String(state || '').trim().toLowerCase()

  return TOURNAMENT_STATE_ORDER.includes(value) ? value : 'draft'
}

export function getTournamentStateLabelKey(state) {
  return TOURNAMENT_STATE_LABEL_KEYS[normalizeTournamentState(state)] || TOURNAMENT_STATE_LABEL_KEYS.draft
}

export function getTournamentStateDescriptionKey(state) {
  return TOURNAMENT_STATE_DESCRIPTION_KEYS[normalizeTournamentState(state)] || TOURNAMENT_STATE_DESCRIPTION_KEYS.draft
}

export function getTournamentStateTone(state) {
  return TOURNAMENT_STATE_TONES[normalizeTournamentState(state)] || 'neutral'
}

export function canTransitionTournament(currentState, nextState) {
  const normalizedCurrent = normalizeTournamentState(currentState)
  const normalizedNext = normalizeTournamentState(nextState)

  return (TOURNAMENT_STATE_TRANSITIONS[normalizedCurrent] || []).includes(normalizedNext)
}

export function getTournamentProgressIndex(state) {
  const normalizedState = normalizeTournamentState(state)
  return TOURNAMENT_STATE_ORDER.indexOf(normalizedState)
}

export function getTournamentProgressPercent(state) {
  const index = getTournamentProgressIndex(state)

  if (index < 0) {
    return 0
  }

  if (TOURNAMENT_STATE_ORDER.length <= 1) {
    return 100
  }

  return Math.round((index / (TOURNAMENT_STATE_ORDER.length - 1)) * 100)
}

export function getTournamentWorkflowSteps(state) {
  const currentIndex = getTournamentProgressIndex(state)

  return TOURNAMENT_STATE_ORDER.map((stepState, index) => ({
    state: stepState,
    labelKey: getTournamentStateLabelKey(stepState),
    descriptionKey: getTournamentStateDescriptionKey(stepState),
    tone: getTournamentStateTone(stepState),
    isComplete: index < currentIndex,
    isCurrent: index === currentIndex,
    isUpcoming: index > currentIndex,
  }))
}

export function getTournamentAvailableActions(state) {
  const normalizedState = normalizeTournamentState(state)

  return TOURNAMENT_ACTION_DEFINITIONS.map((action) => ({
    ...action,
    disabled: !action.availability.includes(normalizedState),
    isAllowed: action.availability.includes(normalizedState),
  }))
}

export function canEditTournamentConfiguration(state) {
  return ['draft', 'registration_open', 'registration_closed', 'group_draw_completed', 'fixtures_generated'].includes(
    normalizeTournamentState(state),
  )
}

export function getTournamentStateMeta(state) {
  const normalizedState = normalizeTournamentState(state)

  return {
    state: normalizedState,
    labelKey: getTournamentStateLabelKey(normalizedState),
    descriptionKey: getTournamentStateDescriptionKey(normalizedState),
    tone: getTournamentStateTone(normalizedState),
    progressIndex: getTournamentProgressIndex(normalizedState),
    progressPercent: getTournamentProgressPercent(normalizedState),
    canEditConfiguration: canEditTournamentConfiguration(normalizedState),
    actions: getTournamentAvailableActions(normalizedState),
    steps: getTournamentWorkflowSteps(normalizedState),
  }
}

export {
  normalizeTournamentState,
}

