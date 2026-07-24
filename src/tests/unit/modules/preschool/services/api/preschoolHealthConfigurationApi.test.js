import { beforeEach, describe, expect, it, vi } from 'vitest'
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

beforeEach(() => {
  vi.restoreAllMocks()
  window.localStorage.clear()
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

  it('stores and reads the health settings locally', async () => {
    await expect(fetchHealthSettings()).resolves.toMatchObject({
      criticalAlertEnabled: true,
      medicationReminderMinutesBefore: 30,
    })

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

    await expect(fetchHealthSettings()).resolves.toMatchObject({
      criticalAlertEnabled: false,
      overdueVaccinationAlertDays: 30,
      medicationReminderMinutesBefore: 45,
    })
  })

  it('stores severity levels locally', async () => {
    await expect(fetchSeverityLevels()).resolves.toMatchObject({
      items: expect.arrayContaining([
        expect.objectContaining({ code: 'critical' }),
        expect.objectContaining({ code: 'high' }),
      ]),
    })

    await expect(createSeverityLevel({ name: 'Severe', code: 'severe', priority: 5 })).resolves.toMatchObject({
      code: 'severe',
    })

    await expect(updateSeverityLevel('severe', { name: 'Severe+', code: 'severe_plus', priority: 4 })).resolves.toMatchObject({
      code: 'severe_plus',
    })

    await expect(archiveSeverityLevel('severe')).resolves.toMatchObject({
      status: 'archived',
    })
  })

  it('stores categories locally', async () => {
    await expect(fetchIncidentCategories()).resolves.toMatchObject({
      items: [],
    })

    await expect(createIncidentCategory({ name: 'Fever', code: 'fever' })).resolves.toMatchObject({
      code: 'fever',
    })
    await expect(updateIncidentCategory('fever', { name: 'Fever+', code: 'fever_plus' })).resolves.toMatchObject({
      code: 'fever_plus',
    })
    await expect(archiveIncidentCategory('fever')).resolves.toMatchObject({
      status: 'archived',
    })

    await expect(fetchVaccinationCategories()).resolves.toMatchObject({
      items: [],
    })
    await expect(createVaccinationCategory({ name: 'MMR', code: 'mmr' })).resolves.toMatchObject({
      code: 'mmr',
    })
    await expect(updateVaccinationCategory('mmr', { name: 'MMR+', code: 'mmr_plus' })).resolves.toMatchObject({
      code: 'mmr_plus',
    })
    await expect(archiveVaccinationCategory('mmr')).resolves.toMatchObject({
      status: 'archived',
    })

    await expect(fetchHealthCheckCategories()).resolves.toMatchObject({
      items: [],
    })
    await expect(createHealthCheckCategory({ name: 'Vision', code: 'vision' })).resolves.toMatchObject({
      code: 'vision',
    })
    await expect(updateHealthCheckCategory('vision', { name: 'Vision+', code: 'vision_plus' })).resolves.toMatchObject({
      code: 'vision_plus',
    })
    await expect(archiveHealthCheckCategory('vision')).resolves.toMatchObject({
      status: 'archived',
    })
  })
})
