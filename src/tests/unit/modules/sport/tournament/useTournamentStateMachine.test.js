import { describe, expect, it } from 'vitest'
import {
  canEditTournamentConfiguration,
  canTransitionTournament,
  getTournamentAvailableActions,
  getTournamentProgressPercent,
  getTournamentStateMeta,
  getTournamentStateLabelKey,
  getTournamentStateTone,
  getTournamentWorkflowSteps,
  normalizeTournamentState,
} from '@/modules/sport/tournament/composables/useTournamentStateMachine'

describe('useTournamentStateMachine', () => {
  it('normalizes unknown states to draft', () => {
    expect(normalizeTournamentState('unknown')).toBe('draft')
  })

  it('transitions follow the configured lifecycle', () => {
    expect(canTransitionTournament('draft', 'registration_open')).toBe(true)
    expect(canTransitionTournament('active', 'registration_open')).toBe(false)
  })

  it('derives tones from the active state', () => {
    expect(getTournamentStateTone('active')).toBe('success')
    expect(getTournamentStateTone('archived')).toBe('neutral')
  })

  it('returns the correct label key for each state', () => {
    expect(getTournamentStateLabelKey('registration_open')).toBe('sportTournament.states.registrationOpen')
    expect(getTournamentStateLabelKey('knockout_stage')).toBe('sportTournament.states.knockoutStage')
  })

  it('returns the expected workflow progress percentage', () => {
    expect(getTournamentProgressPercent('draft')).toBe(0)
    expect(getTournamentProgressPercent('active')).toBeGreaterThan(0)
  })

  it('builds available actions with correct enablement', () => {
    const actions = getTournamentAvailableActions('registration_closed')
    const drawGroups = actions.find((action) => action.key === 'drawGroups')
    const openRegistration = actions.find((action) => action.key === 'openRegistration')

    expect(drawGroups?.isAllowed).toBe(true)
    expect(drawGroups?.disabled).toBe(false)
    expect(openRegistration?.disabled).toBe(true)
  })

  it('marks editable states correctly', () => {
    expect(canEditTournamentConfiguration('group_draw_completed')).toBe(true)
    expect(canEditTournamentConfiguration('active')).toBe(false)
  })

  it('returns full metadata for a state', () => {
    const meta = getTournamentStateMeta('fixtures_generated')

    expect(meta.state).toBe('fixtures_generated')
    expect(meta.actions).toHaveLength(8)
    expect(meta.steps).toHaveLength(9)
  })

  it('marks the current workflow step', () => {
    const steps = getTournamentWorkflowSteps('completed')
    const completedStep = steps.find((step) => step.state === 'completed')

    expect(completedStep?.isCurrent).toBe(true)
    expect(completedStep?.isComplete).toBe(false)
  })
})
