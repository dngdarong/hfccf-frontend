import { computed } from 'vue'
import {
  TOURNAMENT_KNOCKOUT_BRACKET_SIZES,
  compareQualificationRows,
  compareQualifierSeed,
  createGroupQualification,
  createKnockoutSettingsSnapshot,
  normalizeQualificationRole,
  normalizeNumber,
  normalizeText,
  qualificationPriority,
  selectTournamentQualifiers,
  validateKnockoutReadiness,
} from '../services/generateQualification'

export function useTournamentQualification(tournament, settings = {}) {
  const qualification = computed(() =>
    selectTournamentQualifiers({
      tournament: tournament?.value || tournament || {},
      settings: settings?.value || settings || {},
    }),
  )

  const validation = computed(() => validateKnockoutReadiness(qualification.value))

  return {
    qualification,
    validation,
    qualifiers: computed(() => qualification.value.qualifiers),
    groupQualifications: computed(() => qualification.value.groupQualifications),
    bracketSize: computed(() => qualification.value.bracketSize),
    knockoutSettings: computed(() => qualification.value.knockoutSettings),
  }
}

export {
  TOURNAMENT_KNOCKOUT_BRACKET_SIZES,
  compareQualificationRows,
  compareQualifierSeed,
  createGroupQualification,
  createKnockoutSettingsSnapshot,
  normalizeQualificationRole,
  normalizeNumber,
  normalizeText,
  qualificationPriority,
  selectTournamentQualifiers,
  validateKnockoutReadiness,
}
