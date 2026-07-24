// Keep the schedule entry card behavior covered so archived rows cannot drift
// back into editable/archiveable actions.
import { describe, expect, it } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import ScheduleEntryCard from '@/modules/preschool/shared/components/schedule/ScheduleEntryCard.vue'

function mountCard(entry) {
  return mountWithPlugins(ScheduleEntryCard, {
    props: {
      entry,
      dayLabel: 'Monday',
      showActions: true,
      editLabel: 'Edit',
      archiveLabel: 'Archive',
      viewLabel: 'View only',
    },
    global: {
      stubs: {
        Button: {
          inheritAttrs: false,
          template: '<button v-bind="$attrs"><slot /></button>',
        },
        ScheduleStatusBadge: {
          props: ['status', 'label'],
          template: '<span :data-status="status">{{ label }}</span>',
        },
        AppStatusChip: {
          props: ['status', 'label'],
          template: '<span :data-status="status">{{ label }}</span>',
        },
      },
    },
  })
}

describe('ScheduleEntryCard', () => {
  it('shows a view-only action for archived schedules', async () => {
    const wrapper = mountCard({
      id: 11,
      status: 'archived',
      activityLabel: 'Morning Circle',
      className: 'Class A',
      teacherName: 'Teacher One',
      startTime: '08:00',
      endTime: '09:00',
    })

    expect(wrapper.text()).toContain('View only')
    expect(wrapper.text()).not.toContain('Edit')
    expect(wrapper.text()).not.toContain('Archive')

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('view')).toEqual([[{
      id: 11,
      status: 'archived',
      activityLabel: 'Morning Circle',
      className: 'Class A',
      teacherName: 'Teacher One',
      startTime: '08:00',
      endTime: '09:00',
    }]])
  })

  it('keeps edit and archive actions for active schedules', () => {
    const wrapper = mountCard({
      id: 12,
      status: 'active',
      activityLabel: 'Music Time',
      className: 'Class B',
      teacherName: 'Teacher Two',
      startTime: '09:00',
      endTime: '10:00',
    })

    expect(wrapper.text()).toContain('Edit')
    expect(wrapper.text()).toContain('Archive')
    expect(wrapper.text()).not.toContain('View only')
  })

  it('renders session actions when a session is attached', async () => {
    const wrapper = mountCard({
      id: 13,
      status: 'active',
      activityLabel: 'Story Time',
      className: 'Class C',
      teacherName: 'Teacher Three',
      startTime: '10:00',
      endTime: '11:00',
    })

    await wrapper.setProps({
      entry: {
        id: 13,
        status: 'active',
        activityLabel: 'Story Time',
        className: 'Class C',
        teacherName: 'Teacher Three',
        startTime: '10:00',
        endTime: '11:00',
      },
      session: {
        id: 'session-13',
        status: 'scheduled',
        statusLabel: 'Scheduled',
        actionLabel: 'Open Session',
        actionTone: 'primary',
      },
      showSessionActions: true,
      sessionViewLabel: 'View Session',
    })

    expect(wrapper.text()).toContain('Scheduled')
    expect(wrapper.text()).toContain('Open Session')
    expect(wrapper.text()).toContain('View Session')
  })

  it('does not infer session state from the schedule entry when no session is provided', () => {
    const wrapper = mountCard({
      id: 14,
      status: 'active',
      activityLabel: 'Outdoor Play',
      className: 'Class D',
      teacherName: 'Teacher Four',
      startTime: '11:00',
      endTime: '12:00',
    })

    expect(wrapper.text()).toContain('Outdoor Play')
    expect(wrapper.text()).not.toContain('Scheduled')
    expect(wrapper.text()).not.toContain('Open Session')
    expect(wrapper.text()).not.toContain('View Session')
  })
})
