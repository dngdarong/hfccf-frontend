import dashboard from './dashboard'
import teams from './teams'
import players from './players'
import matches from './matches'
import results from './results'
import tournament from './tournament'
import attendance from './attendance'
import coachManagement from './admin/coach-management'
import addCoach from './admin/add-coach'
import addPlayer from './admin/add-player'
import addTeam from './admin/add-team'
import adminDashboard from './admin/dashboard'
import matchesManagement from './admin/matches-management'
import playerInformation from './admin/player-information'
import teamsManagement from './admin/teams-management'
import divisionManagement from './admin/division-management'
import playingStyleManagement from './admin/playing-style-management'
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
