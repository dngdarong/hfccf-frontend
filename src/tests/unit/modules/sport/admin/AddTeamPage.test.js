import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { reactive, ref } from 'vue'
import { mountWithPlugins } from '@/tests/helpers/mount'
import AddTeamPage from '@/modules/sport/admin/pages/forms/AddTeam/AddTeam.vue'

const pushMock = vi.fn()
const routeState = reactive({
  query: {},
})

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')

  return {
    ...actual,
    useRoute: () => routeState,
    useRouter: () => ({
      push: pushMock,
    }),
  }
})

vi.mock('@/modules/sport/admin/pages/forms/AddTeam/composables/useTeamLogo', () => ({
  useTeamLogo: () => ({
    logoPreview: ref(''),
    handleLogoChange: vi.fn(async () => ''),
    removeLogo: vi.fn(),
    setLogoPreview: vi.fn(),
  }),
}))

const {
  fetchSportDivisions,
  fetchSportCoaches,
  fetchTeamRoster,
  fetchAdminRosterCandidates,
  createSportTeam,
  updateSportTeam,
} = vi.hoisted(() => ({
  fetchSportDivisions: vi.fn(),
  fetchSportCoaches: vi.fn(),
  fetchTeamRoster: vi.fn(),
  fetchAdminRosterCandidates: vi.fn(),
  createSportTeam: vi.fn(),
  updateSportTeam: vi.fn(),
}))

vi.mock('@/modules/sport/services/api/sportDivisionApi', () => ({
  fetchSportDivisions,
}))

vi.mock('@/modules/sport/services/api/sportCoachesApi', () => ({
  fetchSportCoaches,
}))

vi.mock('@/modules/sport/services/api/teamRosterApi', () => ({
  fetchTeamRoster,
  fetchAdminRosterCandidates,
}))

vi.mock('@/modules/sport/services/api/sportTeamsApi', () => ({
  createSportTeam,
  updateSportTeam,
}))

const fieldEvents = [
  'update:name',
  'update:division',
  'update:coach',
  'update:captain',
  'update:matches',
  'update:venue',
  'update:status',
  'update:wins',
  'update:draws',
  'update:losses',
  'update:selectedPlayers',
  'update:playerSearch',
]

const AddTeamFormFieldsStub = {
  name: 'AddTeamFormFieldsStub',
  props: [
    'name',
    'division',
    'coach',
    'captain',
    'matches',
    'venue',
    'status',
    'wins',
    'draws',
    'losses',
    'points',
    'divisionOptions',
    'coachOptions',
    'statusOptions',
    'selectedPlayers',
    'playerCandidates',
    'playerSearch',
    'playerLoading',
    'playerError',
    'isLocked',
    'statusLabel',
  ],
  emits: fieldEvents,
  template: `
    <div>
      <span data-test="selected-count">{{ selectedPlayers?.length || 0 }}</span>
      <span data-test="candidate-count">{{ playerCandidates?.length || 0 }}</span>
      <span data-test="locked">{{ isLocked ? 'locked' : 'open' }}</span>
      <button data-test="fill" type="button" @click="$emit('update:name', 'Phoenix FC'); $emit('update:status', 'active')">fill</button>
      <button data-test="select" type="button" @click="$emit('update:selectedPlayers', [{ id: 7, name: 'Player One' }])">select</button>
      <button data-test="search" type="button" @click="$emit('update:playerSearch', 'Player')">search</button>
    </div>
  `,
}

const baseStubs = {
  MainLayout: { template: '<div><slot /></div>' },
  HeaderSection: { props: ['title', 'subtitle'], template: '<div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>' },
  Form: {
    props: ['title', 'description', 'loading', 'disabled', 'showCancel', 'cancelText'],
    emits: ['submit', 'cancel'],
    template: `
      <form @submit.prevent="$emit('submit')">
        <slot />
        <slot name="actions" />
        <button data-test="submit" type="submit">submit</button>
        <button data-test="cancel" type="button" @click="$emit('cancel')">cancel</button>
      </form>
    `,
  },
  AlertSuccess: { props: ['show', 'title', 'message', 'buttonText'], template: '<div v-if="show"><slot /></div>' },
  AlertError: { props: ['show', 'title', 'message', 'buttonText'], template: '<div v-if="show"><slot /></div>' },
  AddAdminProfileImageField: { props: ['title', 'preview', 'removeLabel', 'disabled'], template: '<div />' },
  AddTeamIntro: { props: ['divisionLabel', 'statusLabel'], template: '<div />' },
  AddTeamFormFields: AddTeamFormFieldsStub,
  AddTeamFormActions: { props: ['isSubmitting', 'isViewMode', 'isEditMode'], template: '<div />' },
  AdminSummaryCards: { props: ['cards'], template: '<div><slot /></div>' },
  AdminChecklistPanel: { props: ['title', 'description', 'items', 'highlightLabel', 'highlightValue'], template: '<div />' },
}

beforeEach(() => {
  vi.clearAllMocks()
  routeState.query = {}
  fetchSportDivisions.mockResolvedValue({ items: [{ id: 1, name: 'Senior', status: 'active' }] })
  fetchSportCoaches.mockResolvedValue({ items: [{ id: 'coach-1', fullName: 'Coach Dara', status: 'active' }] })
  fetchAdminRosterCandidates.mockResolvedValue({
    team: null,
    items: [{ id: 7, name: 'Player One', approvalStatus: 'approved', rosterStatus: 'inactive' }],
    pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 },
  })
  fetchTeamRoster.mockResolvedValue({
    team: {
      id: 'team-1',
      name: 'Assigned FC',
      division: 'Senior',
      coachUserId: 'coach-1',
      coachDisplayName: 'Coach Dara',
      captainName: 'Captain One',
      playersCount: 1,
      matchesCount: 2,
      status: 'active',
      wins: 1,
      draws: 1,
      losses: 0,
      venue: 'Main Stadium',
      logo: '',
    },
    players: [{ id: 7, name: 'Player One', playerCode: 'PLY-7', approvalStatus: 'approved', rosterStatus: 'active' }],
    memberships: [{ id: 99, status: 'active', teamId: 'team-1', playerId: 7 }],
  })
  createSportTeam.mockResolvedValue({ id: 'team-created' })
  updateSportTeam.mockResolvedValue({ id: 'team-1' })
})

describe('AddTeam page', () => {
  it('loads eligible players and submits selected roster IDs when creating a team', async () => {
    const wrapper = mountWithPlugins(AddTeamPage, {
      messages: {
        en: {
          sportAddTeam: {
            title: 'Add Team',
            updateTitle: 'Update Team',
            viewTitle: 'Team Profile',
            summary: 'Create a team profile.',
            updateSubtitle: 'Update team details.',
            viewSubtitle: 'Review team details.',
            formDescription: 'Use the fields below.',
            createAction: 'Create Team',
            updateAction: 'Save Changes',
            editAction: 'Edit Team',
            backToTeams: 'Back to teams',
            teamCreated: 'Team created',
            teamUpdated: 'Team updated',
            createdMessage: 'Created.',
            updatedMessage: 'Updated.',
            validationError: 'Validation error',
            teamName: 'Team Name',
            logo: 'Team Logo',
            removeLogo: 'Remove Logo',
            division: 'Division',
            coach: 'Coach',
            captain: 'Captain',
            players: 'Players',
            selectedPlayers: 'Selected players',
            selectedPlayersCount: '{count} selected',
            searchPlayers: 'Search players',
            searchPlayersPlaceholder: 'Search eligible players',
            playerCode: 'Player code',
            playerName: 'Player name',
            position: 'Position',
            approvalStatus: 'Approval status',
            rosterStatus: 'Roster status',
            currentTeam: 'Current team',
            noEligiblePlayers: 'No eligible players',
            failedToLoadPlayers: 'Failed to load players.',
            matches: 'Matches',
            venue: 'Venue',
            status: 'Status',
            wins: 'Wins',
            draws: 'Draws',
            losses: 'Losses',
            pointsPreview: 'Points Preview',
            pointsFormula: 'Calculated automatically.',
            teamNamePlaceholder: 'Enter team name',
            divisionPlaceholder: 'Select a division',
            coachPlaceholder: 'Head coach name',
            captainPlaceholder: 'Team captain name',
            matchesPlaceholder: 'Total matches played',
            venuePlaceholder: 'Primary venue',
            divisionOverview: 'Division overview',
            teamTrack: 'Competition track',
            rosterReady: 'Roster ready',
            rosterPending: 'Roster pending',
            venuePending: 'Venue pending',
            noDivisionSelected: 'No division selected',
            sidebarTitle: 'Team checklist',
            sidebarText: 'Confirm these items.',
            sidebarItems: {
              identity: 'Team identity',
              identityDetail: 'Check the team name and division.',
              staffing: 'Coach and captain',
              staffingDetail: 'Confirm the coaching lead and team captain.',
              roster: 'Roster readiness',
              rosterDetail: 'Select eligible players and confirm the roster count.',
              review: 'Final review',
              reviewDetail: 'Use the summary cards to confirm the status.',
            },
            validation: {
              nameRequired: 'Team name is required.',
              statusRequired: 'Status is required.',
              recordInvalid: 'Record invalid.',
              nameTooLong: 'Team name too long.',
              divisionTooLong: 'Division too long.',
              coachTooLong: 'Coach too long.',
              captainTooLong: 'Captain too long.',
              venueTooLong: 'Venue too long.',
              loadFailed: 'Failed to load the current roster.',
              rosterUpdateFailed: 'Failed to update the team roster.',
              playerAlreadyAssigned: 'A selected player is already assigned to another active team.',
              logoType: 'Logo type.',
              logoSize: 'Logo size.',
              updateFailed: 'Unable to update team right now.',
              createFailed: 'Unable to create team right now.',
              failedToLoadPlayers: 'Failed to load eligible players.',
            },
          },
          common: { cancel: 'Cancel', close: 'Close' },
          sportTeamManagement: { common: {} },
        },
      },
      global: {
        stubs: baseStubs,
      },
    })

    await flushPromises()

    expect(fetchAdminRosterCandidates).toHaveBeenCalledWith(null)
    expect(wrapper.find('[data-test="candidate-count"]').text()).toBe('1')

    await wrapper.find('[data-test="fill"]').trigger('click')
    await wrapper.find('[data-test="select"]').trigger('click')
    await flushPromises()
    await wrapper.find('form').trigger('submit.prevent')

    expect(createSportTeam).toHaveBeenCalledTimes(1)
    expect(createSportTeam.mock.calls[0][0]).toMatchObject({
      player_ids: [7],
      players_count: 1,
    })
  })

  it('hydrates the existing roster in edit mode and marks the selector read-only in view mode', async () => {
    routeState.query = { mode: 'edit', id: 'team-1' }
    const wrapper = mountWithPlugins(AddTeamPage, {
      messages: {
        en: {
          sportAddTeam: {
            title: 'Add Team',
            updateTitle: 'Update Team',
            viewTitle: 'Team Profile',
            summary: 'Create a team profile.',
            updateSubtitle: 'Update team details.',
            viewSubtitle: 'Review team details.',
            formDescription: 'Use the fields below.',
            createAction: 'Create Team',
            updateAction: 'Save Changes',
            editAction: 'Edit Team',
            backToTeams: 'Back to teams',
            teamCreated: 'Team created',
            teamUpdated: 'Team updated',
            createdMessage: 'Created.',
            updatedMessage: 'Updated.',
            validationError: 'Validation error',
            teamName: 'Team Name',
            logo: 'Team Logo',
            removeLogo: 'Remove Logo',
            division: 'Division',
            coach: 'Coach',
            captain: 'Captain',
            players: 'Players',
            selectedPlayers: 'Selected players',
            selectedPlayersCount: '{count} selected',
            searchPlayers: 'Search players',
            searchPlayersPlaceholder: 'Search eligible players',
            playerCode: 'Player code',
            playerName: 'Player name',
            position: 'Position',
            approvalStatus: 'Approval status',
            rosterStatus: 'Roster status',
            currentTeam: 'Current team',
            noEligiblePlayers: 'No eligible players',
            failedToLoadPlayers: 'Failed to load players.',
            matches: 'Matches',
            venue: 'Venue',
            status: 'Status',
            wins: 'Wins',
            draws: 'Draws',
            losses: 'Losses',
            pointsPreview: 'Points Preview',
            pointsFormula: 'Calculated automatically.',
            teamNamePlaceholder: 'Enter team name',
            divisionPlaceholder: 'Select a division',
            coachPlaceholder: 'Head coach name',
            captainPlaceholder: 'Team captain name',
            matchesPlaceholder: 'Total matches played',
            venuePlaceholder: 'Primary venue',
            divisionOverview: 'Division overview',
            teamTrack: 'Competition track',
            rosterReady: 'Roster ready',
            rosterPending: 'Roster pending',
            venuePending: 'Venue pending',
            noDivisionSelected: 'No division selected',
            sidebarTitle: 'Team checklist',
            sidebarText: 'Confirm these items.',
            sidebarItems: {
              identity: 'Team identity',
              identityDetail: 'Check the team name and division.',
              staffing: 'Coach and captain',
              staffingDetail: 'Confirm the coaching lead and team captain.',
              roster: 'Roster readiness',
              rosterDetail: 'Select eligible players and confirm the roster count.',
              review: 'Final review',
              reviewDetail: 'Use the summary cards to confirm the status.',
            },
            validation: {
              nameRequired: 'Team name is required.',
              statusRequired: 'Status is required.',
              recordInvalid: 'Record invalid.',
              nameTooLong: 'Team name too long.',
              divisionTooLong: 'Division too long.',
              coachTooLong: 'Coach too long.',
              captainTooLong: 'Captain too long.',
              venueTooLong: 'Venue too long.',
              loadFailed: 'Failed to load the current roster.',
              rosterUpdateFailed: 'Failed to update the team roster.',
              playerAlreadyAssigned: 'A selected player is already assigned to another active team.',
              logoType: 'Logo type.',
              logoSize: 'Logo size.',
              updateFailed: 'Unable to update team right now.',
              createFailed: 'Unable to create team right now.',
              failedToLoadPlayers: 'Failed to load eligible players.',
            },
          },
          common: { cancel: 'Cancel', close: 'Close' },
        },
      },
      global: {
        stubs: baseStubs,
      },
    })

    await flushPromises()

    expect(fetchTeamRoster).toHaveBeenCalledWith('team-1')
    expect(wrapper.find('[data-test="selected-count"]').text()).toBe('1')
    expect(wrapper.find('[data-test="locked"]').text()).toBe('open')

    routeState.query = { mode: 'view', id: 'team-1' }
    const viewWrapper = mountWithPlugins(AddTeamPage, {
      messages: {
        en: {
          sportAddTeam: {
            title: 'Add Team',
            updateTitle: 'Update Team',
            viewTitle: 'Team Profile',
            summary: 'Create a team profile.',
            updateSubtitle: 'Update team details.',
            viewSubtitle: 'Review team details.',
            formDescription: 'Use the fields below.',
            createAction: 'Create Team',
            updateAction: 'Save Changes',
            editAction: 'Edit Team',
            backToTeams: 'Back to teams',
            teamCreated: 'Team created',
            teamUpdated: 'Team updated',
            createdMessage: 'Created.',
            updatedMessage: 'Updated.',
            validationError: 'Validation error',
            teamName: 'Team Name',
            logo: 'Team Logo',
            removeLogo: 'Remove Logo',
            division: 'Division',
            coach: 'Coach',
            captain: 'Captain',
            players: 'Players',
            selectedPlayers: 'Selected players',
            selectedPlayersCount: '{count} selected',
            searchPlayers: 'Search players',
            searchPlayersPlaceholder: 'Search eligible players',
            playerCode: 'Player code',
            playerName: 'Player name',
            position: 'Position',
            approvalStatus: 'Approval status',
            rosterStatus: 'Roster status',
            currentTeam: 'Current team',
            noEligiblePlayers: 'No eligible players',
            failedToLoadPlayers: 'Failed to load players.',
            matches: 'Matches',
            venue: 'Venue',
            status: 'Status',
            wins: 'Wins',
            draws: 'Draws',
            losses: 'Losses',
            pointsPreview: 'Points Preview',
            pointsFormula: 'Calculated automatically.',
            teamNamePlaceholder: 'Enter team name',
            divisionPlaceholder: 'Select a division',
            coachPlaceholder: 'Head coach name',
            captainPlaceholder: 'Team captain name',
            matchesPlaceholder: 'Total matches played',
            venuePlaceholder: 'Primary venue',
            divisionOverview: 'Division overview',
            teamTrack: 'Competition track',
            rosterReady: 'Roster ready',
            rosterPending: 'Roster pending',
            venuePending: 'Venue pending',
            noDivisionSelected: 'No division selected',
            sidebarTitle: 'Team checklist',
            sidebarText: 'Confirm these items.',
            sidebarItems: {
              identity: 'Team identity',
              identityDetail: 'Check the team name and division.',
              staffing: 'Coach and captain',
              staffingDetail: 'Confirm the coaching lead and team captain.',
              roster: 'Roster readiness',
              rosterDetail: 'Select eligible players and confirm the roster count.',
              review: 'Final review',
              reviewDetail: 'Use the summary cards to confirm the status.',
            },
            validation: {
              nameRequired: 'Team name is required.',
              statusRequired: 'Status is required.',
              recordInvalid: 'Record invalid.',
              nameTooLong: 'Team name too long.',
              divisionTooLong: 'Division too long.',
              coachTooLong: 'Coach too long.',
              captainTooLong: 'Captain too long.',
              venueTooLong: 'Venue too long.',
              loadFailed: 'Failed to load the current roster.',
              rosterUpdateFailed: 'Failed to update the team roster.',
              playerAlreadyAssigned: 'A selected player is already assigned to another active team.',
              logoType: 'Logo type.',
              logoSize: 'Logo size.',
              updateFailed: 'Unable to update team right now.',
              createFailed: 'Unable to create team right now.',
              failedToLoadPlayers: 'Failed to load eligible players.',
            },
          },
          common: { cancel: 'Cancel', close: 'Close' },
        },
      },
      global: {
        stubs: baseStubs,
      },
    })

    await flushPromises()
    expect(viewWrapper.find('[data-test="locked"]').text()).toBe('locked')
  })
})
