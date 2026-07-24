import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import MatchesSearchFilterBar from '@/modules/sport/admin/components/matches-management/MatchesSearchFilterBar.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => key,
  }),
}))

describe('MatchesSearchFilterBar', () => {
  it('keeps search flexible and makes filters content-width on desktop', () => {
    const wrapper = mount(MatchesSearchFilterBar, {
      global: {
        stubs: {
          IconField: { template: '<div class="p-iconfield"><slot /></div>' },
          InputIcon: { template: '<span />' },
          InputText: { template: '<input v-bind="$attrs" />' },
          Select: { template: '<select v-bind="$attrs" />' },
          Button: { template: '<button><slot /></button>' },
        },
      },
    })

    const searchWrapper = wrapper.find('label > .p-iconfield')
    const filterWrapper = wrapper.find('.matches-search-filter-bar__filters')

    expect(searchWrapper.classes()).toContain('w-full')
    expect(filterWrapper.classes()).toEqual(expect.arrayContaining([
      'w-full',
      'xl:w-auto',
      'xl:flex-none',
      'xl:flex-nowrap',
    ]))
    expect(filterWrapper.classes()).not.toContain('xl:w-full')
  })
})
