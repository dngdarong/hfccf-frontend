import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '@/services/http'
import {
  archiveHealthCheckCategory,
  archiveIncidentCategory,
  archiveSeverityLevel,
  archiveVaccinationCategory,
  createHealthCheckCategory,
  createIncidentCategory,
  createSeverityLevel,
  createVaccinationCategory,
  fetchHealthCheckCategories,
  fetchHealthSettings,
  fetchIncidentCategories,
  fetchSeverityLevels,
  fetchVaccinationCategories,
  normalizeHealthCheckCategory,
  normalizeHealthSettings,
  normalizeIncidentCategory,
  normalizeSeverityLevel,
  normalizeVaccinationCategory,
  updateHealthCheckCategory,
  updateHealthSettings,
  updateIncidentCategory,
  updateSeverityLevel,
  updateVaccinationCategory,
} from '@/modules/preschool/services/api/preschoolHealthConfigurationApi'

vi.mock('@/services/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

function stubResponse(data) {
  return { data: { success: true, message: 'ok', data } }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('preschool health configuration api', () => {
  it('normalizes health settings and category records', () => {
    expect(normalizeHealthSettings({
      critical_alert_enabled: true,
      guardian_notification_enabled: false,
      medication_reminder_enabled: true,
      vaccination_reminder_enabled: false,
      overdue_vaccination_alert_days: 14,
      medication_reminder_minutes_before: 45,
    })).toMatchObject({
      criticalAlertEnabled: true,
      guardianNotificationEnabled: false,
      medicationReminderEnabled: true,
      vaccinationReminderEnabled: false,
      overdueVaccinationAlertDays: 14,
      medicationReminderMinutesBefore: 45,
    })

    expect(normalizeSeverityLevel({
      name: 'Critical',
      code: 'critical',
      priority: 1,
      requires_acknowledgment: true,
      triggers_notification: true,
      is_active: true,
    })).toMatchObject({
      name: 'Critical',
      code: 'critical',
      requiresAcknowledgment: true,
      triggersNotification: true,
      isActive: true,
    })

    expect(normalizeIncidentCategory({
      name: 'Fever',
      code: 'fever',
      default_severity_code: 'high',
      is_active: true,
    })).toMatchObject({
      name: 'Fever',
      code: 'fever',
      defaultSeverityCode: 'high',
      isActive: true,
    })

    expect(normalizeVaccinationCategory({
      name: 'MMR',
      code: 'mmr',
      recommended_age_months: 12,
      is_required: true,
      is_active: true,
    })).toMatchObject({
      name: 'MMR',
      code: 'mmr',
      recommendedAgeMonths: 12,
      isRequired: true,
      isActive: true,
    })

    expect(normalizeHealthCheckCategory({
      name: 'Temperature',
      code: 'temperature',
      is_active: true,
    })).toMatchObject({
      name: 'Temperature',
      code: 'temperature',
      isActive: true,
    })
  })

  it('fetches and updates the health settings payload', async () => {
    http.get.mockResolvedValueOnce(stubResponse({
      settings: {
        critical_alert_enabled: true,
        guardian_notification_enabled: true,
        teacher_notification_enabled: false,
        admin_notification_enabled: true,
        medication_reminder_enabled: true,
        vaccination_reminder_enabled: true,
        overdue_vaccination_alert_days: 21,
        medication_reminder_minutes_before: 60,
      },
    }))

    await expect(fetchHealthSettings()).resolves.toMatchObject({
      criticalAlertEnabled: true,
      medicationReminderMinutesBefore: 60,
    })

    http.put.mockResolvedValueOnce(stubResponse({
      settings: {
        critical_alert_enabled: false,
        overdue_vaccination_alert_days: 30,
      },
    }))

    await expect(updateHealthSettings({
      criticalAlertEnabled: false,
      guardianNotificationEnabled: true,
      teacherNotificationEnabled: true,
      adminNotificationEnabled: true,
      medicationReminderEnabled: true,
      vaccinationReminderEnabled: false,
      overdueVaccinationAlertDays: 30,
      medicationReminderMinutesBefore: 45,
    })).resolves.toMatchObject({
      criticalAlertEnabled: false,
      overdueVaccinationAlertDays: 30,
    })

    expect(http.put).toHaveBeenCalledWith('/preschool/settings/health', expect.objectContaining({
      critical_alert_enabled: false,
      overdue_vaccination_alert_days: 30,
    }))
  })

  it('handles severity level CRUD endpoints', async () => {
    http.get.mockResolvedValueOnce(stubResponse({
      items: [
        { id: 1, name: 'Critical', code: 'critical', priority: 1, is_active: true },
      ],
    }))

    await expect(fetchSeverityLevels()).resolves.toMatchObject([
      { id: 1, code: 'critical', isActive: true },
    ])

    http.post.mockResolvedValueOnce(stubResponse({
      severity: { id: 2, name: 'High', code: 'high', priority: 2, is_active: true },
    }))
    await expect(createSeverityLevel({ name: 'High', code: 'high', priority: 2 })).resolves.toMatchObject({
      id: 2,
      code: 'high',
    })

    http.put.mockResolvedValueOnce(stubResponse({
      severityLevel: { id: 2, name: 'High', code: 'high', priority: 3, is_active: true },
    }))
    await expect(updateSeverityLevel(2, { name: 'High', code: 'high', priority: 3 })).resolves.toMatchObject({
      id: 2,
      priority: 3,
    })

    http.post.mockResolvedValueOnce(stubResponse({
      severity: { id: 2, name: 'High', code: 'high', is_active: false, status: 'archived' },
    }))
    await expect(archiveSeverityLevel(2)).resolves.toMatchObject({
      id: 2,
      status: 'archived',
    })
    expect(http.post).toHaveBeenCalledWith('/preschool/settings/health/severity-levels/2/archive')
  })

  it('handles category CRUD and archive endpoints', async () => {
    http.get.mockResolvedValueOnce(stubResponse({
      items: [
        { id: 3, name: 'Fever', code: 'fever', is_active: true },
      ],
    }))
    await expect(fetchIncidentCategories()).resolves.toMatchObject([
      { id: 3, name: 'Fever', code: 'fever', isActive: true },
    ])

    http.post.mockResolvedValueOnce(stubResponse({
      category: { id: 4, name: 'Injury', code: 'injury', is_active: true },
    }))
    await expect(createIncidentCategory({ name: 'Injury', code: 'injury' })).resolves.toMatchObject({
      id: 4,
      name: 'Injury',
    })

    http.put.mockResolvedValueOnce(stubResponse({
      incidentCategory: { id: 4, name: 'Injury', code: 'injury-2', is_active: true },
    }))
    await expect(updateIncidentCategory(4, { name: 'Injury', code: 'injury-2' })).resolves.toMatchObject({
      id: 4,
      code: 'injury-2',
    })

    http.post.mockResolvedValueOnce(stubResponse({
      category: { id: 4, name: 'Injury', is_active: false, status: 'archived' },
    }))
    await expect(archiveIncidentCategory(4)).resolves.toMatchObject({
      id: 4,
      status: 'archived',
    })
    expect(http.post).toHaveBeenCalledWith('/preschool/settings/health/incident-categories/4/archive')

    http.get.mockResolvedValueOnce(stubResponse({
      items: [
        { id: 5, name: 'MMR', code: 'mmr', is_active: true },
      ],
    }))
    await expect(fetchVaccinationCategories()).resolves.toMatchObject([
      { id: 5, code: 'mmr', isActive: true },
    ])

    http.post.mockResolvedValueOnce(stubResponse({
      category: { id: 6, name: 'Polio', code: 'polio', is_active: true },
    }))
    await expect(createVaccinationCategory({ name: 'Polio', code: 'polio' })).resolves.toMatchObject({
      id: 6,
      name: 'Polio',
    })

    http.put.mockResolvedValueOnce(stubResponse({
      vaccinationCategory: { id: 6, name: 'Polio', code: 'polio-2', is_active: true },
    }))
    await expect(updateVaccinationCategory(6, { name: 'Polio', code: 'polio-2' })).resolves.toMatchObject({
      id: 6,
      code: 'polio-2',
    })

    http.post.mockResolvedValueOnce(stubResponse({
      category: { id: 6, name: 'Polio', is_active: false, status: 'archived' },
    }))
    await expect(archiveVaccinationCategory(6)).resolves.toMatchObject({
      id: 6,
      status: 'archived',
    })
    expect(http.post).toHaveBeenCalledWith('/preschool/settings/health/vaccination-categories/6/archive')

    http.get.mockResolvedValueOnce(stubResponse({
      items: [
        { id: 7, name: 'Temperature', code: 'temperature', is_active: true },
      ],
    }))
    await expect(fetchHealthCheckCategories()).resolves.toMatchObject([
      { id: 7, code: 'temperature', isActive: true },
    ])

    http.post.mockResolvedValueOnce(stubResponse({
      category: { id: 8, name: 'Vision', code: 'vision', is_active: true },
    }))
    await expect(createHealthCheckCategory({ name: 'Vision', code: 'vision' })).resolves.toMatchObject({
      id: 8,
      name: 'Vision',
    })

    http.put.mockResolvedValueOnce(stubResponse({
      healthCheckCategory: { id: 8, name: 'Vision', code: 'vision-2', is_active: true },
    }))
    await expect(updateHealthCheckCategory(8, { name: 'Vision', code: 'vision-2' })).resolves.toMatchObject({
      id: 8,
      code: 'vision-2',
    })

    http.post.mockResolvedValueOnce(stubResponse({
      category: { id: 8, name: 'Vision', is_active: false, status: 'archived' },
    }))
    await expect(archiveHealthCheckCategory(8)).resolves.toMatchObject({
      id: 8,
      status: 'archived',
    })
    expect(http.post).toHaveBeenCalledWith('/preschool/settings/health/check-categories/8/archive')
  })
})
