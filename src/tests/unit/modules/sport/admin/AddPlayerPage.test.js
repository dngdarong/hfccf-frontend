import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import AddPlayerPage from '@/modules/sport/admin/pages/forms/AddPlayer/AddPlayer.vue'
import addPlayerMessages from '@/i18n/en/sport/admin/add-player'

const fetchSportTeams = vi.fn()
const fetchSportDivisions = vi.fn()
const fetchSportPlayer = vi.fn()
const createSportPlayer = vi.fn()
const updateSportPlayer = vi.fn()

vi.mock('@/modules/sport/services/sportApi', () => ({
  createSportPlayer: (...args) => createSportPlayer(...args),
  fetchSportDivisions: (...args) => fetchSportDivisions(...args),
  fetchSportPlayer: (...args) => fetchSportPlayer(...args),
  fetchSportTeams: (...args) => fetchSportTeams(...args),
  updateSportPlayer: (...args) => updateSportPlayer(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function mountPage() {
  return mountWithPlugins(AddPlayerPage, {
    messages: {
      en: {
        ...addPlayerMessages,
        common: {
          cancel: 'Cancel',
          close: 'Close',
        },
      },
    },
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: { props: ['title', 'subtitle'], template: '<div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>' },
        Form: { props: ['title', 'description', 'loading', 'disabled', 'showCancel', 'cancelText'], template: '<div><slot /><slot name="actions" /></div>' },
        AlertSuccess: { props: ['show', 'title', 'message', 'buttonText'], template: '<div v-if="show" class="success">{{ message }}</div>' },
        AlertError: { props: ['show', 'title', 'message', 'buttonText'], template: '<div v-if="show" class="error">{{ message }}</div>' },
        AddPlayerFormFields: {
          props: ['registrationStatus', 'registrationStatusOptions'],
          template: '<div class="fields" />',
        },
        AddPlayerFormActions: { props: ['isViewMode', 'isEditMode'], template: '<div class="actions" />' },
        PlayerChecklist: {
          props: ['items'],
          template: '<div class="checklist">{{ items.map((item) => item.text).join(" | ") }}</div>',
        },
      },
    },
  })
}

describe('AddPlayer page', () => {
  it('localizes the default registration status label in the checklist', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    fetchSportTeams.mockResolvedValueOnce({
      items: [{ id: 'team-1', name: 'Lions FC', status: 'active' }],
      pagination: { page: 1, perPage: 100, total: 1, totalPages: 1 },
    })
    fetchSportDivisions.mockResolvedValueOnce({
      items: [{ id: 1, name: 'Senior', status: 'active' }],
      pagination: { page: 1, perPage: 100, total: 1, totalPages: 1 },
    })

    const wrapper = mountPage()
    await flushPromises()

    expect(fetchSportTeams).toHaveBeenCalledWith({ perPage: 100 })
    expect(wrapper.text()).toContain('Registered')
    expect(wrapper.text()).not.toContain('registered /')
    expect(warnSpy.mock.calls.flat().join(' ')).not.toContain('registrationStatusOptions')

    warnSpy.mockRestore()
  })

  it('shows a load error when the player reference data cannot be loaded', async () => {
    fetchSportTeams.mockRejectedValueOnce(new Error('network'))
    fetchSportDivisions.mockResolvedValueOnce({
      items: [{ id: 1, name: 'Senior', status: 'active' }],
      pagination: { page: 1, perPage: 100, total: 1, totalPages: 1 },
    })

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Unable to load player data right now.')
  })
})
