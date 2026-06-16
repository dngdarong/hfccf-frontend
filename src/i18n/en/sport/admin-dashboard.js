import dashboard from './admin/dashboard'
import coachManagement from './admin/coach-management'
import addCoach from './admin/add-coach'
import teamsManagement from './admin/teams-management'
import playerInformation from './admin/player-information'
import addPlayer from './admin/add-player'
import addTeam from './admin/add-team'
import matchesManagement from './admin/matches-management'
import coachTrainingSchedule from './coach-training-schedule'

export default {
  ...dashboard,
  ...coachManagement,
  ...addCoach,
  ...teamsManagement,
  ...playerInformation,
  ...addPlayer,
  ...addTeam,
  ...matchesManagement,
  ...coachTrainingSchedule,
}
