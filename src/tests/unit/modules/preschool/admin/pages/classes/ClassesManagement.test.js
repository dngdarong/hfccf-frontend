import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import ClassesManagement from '@/modules/preschool/admin/pages/classes/ClassesManagement.vue'

const mockFetchClasses = vi.fn()
const mockDeleteClass = vi.fn()

vi.mock('@/modules/preschool/services/preschoolApi', () => ({
  fetchPreschoolClasses: (...args) => mockFetchClasses(...args),
  deletePreschoolClass: (...args) => mockDeleteClass(...args),
}))

function createClassRoutes() {
  return [
    {
      path: '/module/preschool-admin/classes',
      name: 'dashboard-preschool-admin-classes',
      component: { template: '<div />' },
    },
    {
      path: '/module/preschool-admin/classes/:id',
      name: 'dashboard-preschool-admin-class-details',
      component: { template: '<div />' },
    },
  ]
}

function mountPage() {
  return mountWithPlugins(ClassesManagement, {
    messages: {
      en: enPreschool,
    },
    routes: createClassRoutes(),
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
        SearchFilterBar: { template: '<div class="search-filter-stub" />' },
        Pagination: { template: '<div class="pagination-stub" />' },
        AlertQuestion: { template: '<div class="alert-question-stub" />' },
        AlertSuccess: { template: '<div class="alert-success-stub" />' },
        PreschoolClassesSummaryGrid: { props: ['cards'], template: '<div class="summary-grid-stub">{{ cards?.[0]?.title }}</div>' },
        PreschoolClassesToolbar: { props: ['title'], template: '<div class="toolbar-stub">{{ title }}</div>' },
        PreschoolClassesHighlights: { props: ['items'], template: '<div class="highlights-stub">{{ items?.[0]?.label }}</div>' },
        ClassTable: {
          props: ['classes'],
          emits: ['view', 'edit', 'delete'],
          template: '<div class="class-table-stub"><button data-testid="view-class" @click="$emit(\'view\', classes?.[0])">View</button></div>',
        },
      },
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFetchClasses.mockResolvedValue({
    items: [
      {
        id: 'class-1',
        code: 'PS-NUR-01',
        name: 'Morning Nursery Blue',
        teacherDisplayName: 'Teacher Alpha',
        level: 'Nursery',
        schedule: 'Mon-Fri',
        studentsCount: 2,
        status: 'active',
      },
    ],
    pagination: {
      page: 1,
      perPage: 5,
      total: 1,
      totalPages: 1,
    },
  })
  mockDeleteClass.mockResolvedValue(true)
})

describe('ClassesManagement', () => {
  it('navigates from the class list to class details', async () => {
    const wrapper = mountPage()
    const pushSpy = vi.spyOn(wrapper.vm.$router, 'push')

    await flushPromises()
    await wrapper.find('[data-testid="view-class"]').trigger('click')

    expect(pushSpy).toHaveBeenCalledWith({
      name: 'dashboard-preschool-admin-class-details',
      params: { id: 'class-1' },
    })
  })
})
