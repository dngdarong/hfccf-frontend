import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TrainingSessionForm from '@/modules/sport/coach/components/TrainingSessionForm.vue'
import TrainingSessionDetail from '@/modules/sport/coach/components/TrainingSessionDetail.vue'

const t = (key) => key

const stubs = {
  InputText: { props: ['modelValue'], template: '<input :value="modelValue" />' },
  Select: { props: ['modelValue'], template: '<select :value="modelValue"><slot /></select>' },
  DatePicker: { props: ['modelValue'], template: '<input :value="modelValue" />' },
  Textarea: { props: ['modelValue'], template: '<textarea :value="modelValue"></textarea>' },
  Button: { props: ['type', 'label', 'loading', 'disabled'], emits: ['click'], template: '<button :type="type || \'button\'" :disabled="disabled" @click="$emit(\'click\')">{{ label }}</button>' },
}

describe('Training session CRUD components', () => {
  it('validates required fields before create and prevents duplicate submission while saving', async () => {
    const wrapper = mount(TrainingSessionForm, {
      props: { t },
      global: { stubs },
    })

    await wrapper.vm.submit()
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('coachTrainingSchedule.validation.teamRequired')

    await wrapper.setProps({ loading: true })
    wrapper.vm.form.teamId = '1'
    wrapper.vm.form.title = 'Morning training'
    wrapper.vm.form.startDate = new Date(2026, 6, 18)
    wrapper.vm.form.endDate = new Date(2026, 6, 18)
    await wrapper.vm.submit()
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('emits a normalized create/edit payload and supports cancel', async () => {
    const wrapper = mount(TrainingSessionForm, {
      props: { t },
      global: { stubs },
    })
    wrapper.vm.form.teamId = '4'
    wrapper.vm.form.title = '  Tactical session  '
    wrapper.vm.form.startDate = new Date(2026, 6, 18)
    wrapper.vm.form.endDate = new Date(2026, 6, 18)
    wrapper.vm.form.startTime = '09:00'
    wrapper.vm.form.endTime = '11:00'

    await wrapper.vm.submit()
    expect(wrapper.emitted('submit')[0][0]).toMatchObject({
      teamId: '4',
      title: 'Tactical session',
      startsAt: '2026-07-18 09:00:00',
      endsAt: '2026-07-18 11:00:00',
    })

    await wrapper.find('button[type="button"]').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('renders read-only session details', () => {
    const wrapper = mount(TrainingSessionDetail, {
      props: {
        t,
        session: {
          team: { name: 'Falcons' }, coach: { fullName: 'Coach Dara' }, title: 'Fitness session',
          trainingType: 'fitness', venue: 'Main pitch', startsAt: '2026-07-18 09:00:00',
          endsAt: '2026-07-18 10:00:00', status: 'scheduled', intensity: 'high', focus: 'Speed', notes: 'Bring cones',
        },
      },
      global: { stubs: { StatusBadge: { props: ['label'], template: '<span>{{ label }}</span>' } } },
    })

    expect(wrapper.text()).toContain('Falcons')
    expect(wrapper.text()).toContain('Fitness session')
    expect(wrapper.text()).toContain('Main pitch')
    expect(wrapper.text()).toContain('Bring cones')
  })
})
