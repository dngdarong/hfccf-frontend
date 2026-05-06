import sportAdminDashboard from './admin/sport-admin-dashboard'
import sportCoachManagement from './admin/sport-coach-management'
import sportAddCoach from './admin/sport-add-coach'
import sportTeamsManagement from './admin/sport-teams-management'
import sportPlayerInformation from './admin/sport-player-information'
import sportAddPlayer from './admin/sport-add-player'
import sportAddTeam from './admin/sport-add-team'
import sportMatchesManagement from './admin/sport-matches-management'

export default {
  ...sportAdminDashboard,
  ...sportCoachManagement,
  ...sportAddCoach,
  ...sportTeamsManagement,
  ...sportPlayerInformation,
  ...sportAddPlayer,
  ...sportAddTeam,
  ...sportMatchesManagement,
}
