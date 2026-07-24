import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { mountWithPlugins } from '@/tests/helpers/mount'
import ManagesPlayerInfor from '@/modules/sport/admin/pages/list/ManagesPlayerInfor/ManagesPlayerInfor.vue'
import playerInformationMessages from '@/i18n/en/sport/admin/player-information'

const fetchSportPlayers = vi.fn()
const deleteSportPlayer = vi.fn()

vi.mock('@/modules/sport/services/sportApi', () => ({
  deleteSportPlayer: (...args) => deleteSportPlayer(...args),
  fetchSportPlayers: (...args) => fetchSportPlayers(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function mountPage() {
  return mountWithPlugins(ManagesPlayerInfor, {
    messages: {
      en: {
        ...playerInformationMessages,
        common: {
          actionCompleted: 'Action completed',
          cancel: 'Cancel',
          close: 'Close',
          delete: 'Delete',
          error: 'Error',
          success: 'Success',
        },
      },
    },
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: { props: ['title', 'subtitle'], template: '<div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>' },
        SearchFilterBar: { template: '<div class="filters" />' },
        PlayerStatsCards: { template: '<div class="stats" />' },
        PlayerInfoToolbar: { template: '<div class="toolbar"><slot name="actions" /></div>' },
        PlayerHighlights: { template: '<div class="highlights" />' },
        PlayerTable: {
          props: ['players'],
          emits: ['view', 'edit', 'delete', 'update:currentPage'],
          template: `
            <div>
              <div v-for="player in players" :key="player.id" class="player-name">{{ player.name }}</div>
              <button class="delete-player" type="button" @click="$emit('delete', players[0])">delete</button>
            </div>
          `,
        },
        Button: { template: '<button><slot /></button>' },
        AlertQuestion: {
          props: ['show', 'loading', 'title', 'message', 'confirmText', 'cancelText', 'type'],
          emits: ['confirm', 'cancel'],
          template: `
            <div v-if="show" class="confirm-dialog">
              <button class="confirm-delete" type="button" @click="$emit('confirm')">confirm</button>
            </div>
          `,
        },
        AlertSuccess: {
          props: ['show', 'title', 'message', 'buttonText'],
          template: '<div v-if="show" class="success-message">{{ message }}</div>',
        },
        AlertError: {
          props: ['show', 'title', 'message', 'buttonText'],
          template: '<div v-if="show" class="error-message">{{ message }}</div>',
        },
      },
    },
  })
}

describe('ManagesPlayerInfor page', () => {
  it('loads all paginated player records before filtering and paging locally', async () => {
    fetchSportPlayers
      .mockResolvedValueOnce({
        items: [
          {
            id: 'player-1',
            name: 'Player One',
            playerCode: 'PLY-001',
            team: 'Lions FC',
            division: 'Senior',
            status: 'active',
          },
        ],
        pagination: { page: 1, perPage: 100, total: 2, totalPages: 2 },
      })
      .mockResolvedValueOnce({
        items: [
          {
            id: 'player-2',
            name: 'Player Two',
            playerCode: 'PLY-002',
            team: 'Phoenix FC',
            division: 'Junior',
            status: 'pending',
          },
        ],
        pagination: { page: 2, perPage: 100, total: 2, totalPages: 2 },
      })

    const wrapper = mountPage()
    await flushPromises()

    expect(fetchSportPlayers).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('Player One')
    expect(wrapper.text()).toContain('Player Two')
  })

  it('shows an error and keeps the record intact when deletion fails', async () => {
    fetchSportPlayers.mockResolvedValueOnce({
      items: [
        {
          id: 'player-1',
          name: 'Player One',
          playerCode: 'PLY-001',
          team: 'Lions FC',
          division: 'Senior',
          status: 'active',
        },
      ],
      pagination: { page: 1, perPage: 100, total: 1, totalPages: 1 },
    })
    deleteSportPlayer.mockRejectedValueOnce(new Error('boom'))

    const wrapper = mountPage()
    await flushPromises()

    await wrapper.find('.delete-player').trigger('click')
    await nextTick()
    await wrapper.find('.confirm-delete').trigger('click')
    await flushPromises()

    expect(deleteSportPlayer).toHaveBeenCalledWith('player-1')
    expect(wrapper.text()).toContain('Player One')
    expect(wrapper.text()).toContain('Unable to delete player right now.')
  })
})
