import dashboard from './dashboard'
import teams from './teams'
import players from './players'
import matches from './matches'
import results from './results'
import tournament from './tournament'
import attendance from './attendance'
import coachManagement from './admin/sport-coach-management'
import addCoach from './admin/sport-add-coach'
import addPlayer from './admin/sport-add-player'
import addTeam from './admin/sport-add-team'
import adminDashboard from './admin/sport-admin-dashboard'
import matchesManagement from './admin/sport-matches-management'
import playerInformation from './admin/sport-player-information'
import teamsManagement from './admin/sport-teams-management'
import divisionManagement from './admin/sport-division-management'
import playingStyleManagement from './admin/sport-playing-style-management'
import coachTrainingSchedule from './coach-training-schedule'
import coachDashboard from './coach-dashboard'
import coachTeamManagement from './coach-team-management'
import playerLifecycle from './player-lifecycle'
import matchSquad from './match-squad'

export default {
  ...dashboard,
  ...teams,
  ...players,
  ...matches,
  ...results,
  ...tournament,
  ...attendance,
  ...coachManagement,
  ...addCoach,
  ...addPlayer,
  ...addTeam,
  ...adminDashboard,
  ...matchesManagement,
  ...playerInformation,
  ...teamsManagement,
  ...divisionManagement,
  ...playingStyleManagement,
  ...coachTrainingSchedule,
  ...coachDashboard,
  ...coachTeamManagement,
  ...playerLifecycle,
  ...matchSquad,
}
