<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useRouter } from 'vue-router'
import { fetchPreschoolDashboard } from '@/modules/preschool/services/preschoolApi'
import { fetchHealthDashboardSummary } from '@/modules/preschool/services/api/preschoolHealthApi'

defineOptions({ name: 'DashboardTrackerPage' })

const router = useRouter()

const dashboard = ref({
  summary: {
    students: 0,
    classes: 0,
    teachers: 0,
    attendanceToday: 0,
    healthAlerts: 0,
    pendingPayments: 0,
    overduePayments: 0,
  },
  recentAttendance: [],
  upcomingClasses: [],
})
const healthSummary = ref({
  summary: {
    newAlerts: 0,
    inProgressAlerts: 0,
    criticalAlerts: 0,
    resolvedThisWeek: 0,
    criticalIncidents: 0,
    severeAllergies: 0,
    missingEmergencyContacts: 0,
    overdueVaccinations: 0,
    medicationReminders: 0,
    unresolvedItems: 0,
  },
  items: [],
  unresolvedCriticalItems: [],
})
const healthAlertFilters = ref({
  severity: 'all',
  status: 'all',
  assigned_to: 'all',
})
const isLoading = ref(false)

const healthAlertCards = computed(() => [
  {
    label: 'New Alerts',
    value: healthSummary.value.summary?.newAlerts ?? 0,
    note: 'Alerts waiting for review',
  },
  {
    label: 'In Progress Alerts',
    value: healthSummary.value.summary?.inProgressAlerts ?? 0,
    note: 'Alerts currently being handled',
  },
  {
    label: 'Critical Alerts',
    value: healthSummary.value.summary?.criticalAlerts ?? 0,
    note: 'Urgent alerts requiring attention',
  },
  {
    label: 'Resolved This Week',
    value: healthSummary.value.summary?.resolvedThisWeek ?? 0,
    note: 'Alerts resolved in the last 7 days',
  },
])

const healthAlertAssigneeOptions = computed(() => {
  const options = new Map()
  for (const alert of healthSummary.value.items || []) {
    const assigned = alert.assignedTo
    const assignedId = assigned?.id || alert.assigned_to_user_id || alert.assignedToUserId || ''
    if (!assignedId) continue
    const label = assigned?.fullName || assigned?.username || assigned?.firstName || assigned?.lastName || 'Assigned staff'
    options.set(String(assignedId), { label, value: String(assignedId) })
  }
  return [{ label: 'All staff', value: 'all' }, ...options.values()]
})

async function load() {
  isLoading.value = true
  try {
    const [dashboardPayload, healthPayload] = await Promise.all([
      fetchPreschoolDashboard(),
      fetchHealthDashboardSummary(healthAlertFilters.value),
    ])

    dashboard.value = dashboardPayload
    healthSummary.value = healthPayload
    dashboard.value.summary.healthAlerts = healthPayload.summary.unresolvedItems || healthPayload.summary.criticalIncidents || 0
  } finally {
    isLoading.value = false
  }
}

watch(healthAlertFilters, () => {
  load()
}, { deep: true })

const moduleCards = [
  {
    id: 'students',
    title: 'Students',
    description: 'Manage student information and profiles',
    icon: '👥',
    badge: computed(() => dashboard.value.summary.students),
    action: () => router.push({ name: 'dashboard-preschool-admin-students' }),
    color: '#3b82f6',
  },
  {
    id: 'classes',
    title: 'Classes',
    description: 'Organize classes and schedules',
    icon: '🏫',
    badge: computed(() => dashboard.value.summary.classes),
    action: () => router.push({ name: 'dashboard-preschool-admin-classes' }),
    color: '#06b6d4',
  },
  {
    id: 'teachers',
    title: 'Teachers',
    description: 'Manage staff and assignments',
    icon: '👨‍🏫',
    badge: computed(() => dashboard.value.summary.teachers),
    action: () => router.push({ name: 'dashboard-preschool-admin-users' }),
    color: '#f59e0b',
  },
  {
    id: 'attendance',
    title: 'Attendance',
    description: 'Track daily attendance records',
    icon: '📅',
    badge: computed(() => dashboard.value.summary.attendanceToday),
    action: () => router.push({ name: 'dashboard-preschool-admin-attendance' }),
    color: '#10b981',
  },
  {
    id: 'health',
    title: 'Health',
    description: 'Manage health and medical records',
    icon: '🩺',
    badge: computed(() => dashboard.value.summary.healthAlerts),
    action: () => router.push({ name: 'dashboard-preschool-admin-health' }),
    color: '#ef4444',
  },
  {
    id: 'forms',
    title: 'Forms',
    description: 'Manage assessment forms',
    icon: '📝',
    badge: null,
    action: () => router.push({ name: 'dashboard-preschool-admin-forms' }),
    color: '#059669',
  },
  {
    id: 'assessments',
    title: 'Assessments',
    description: 'Track student assessments',
    icon: '📊',
    badge: null,
    action: () => router.push({ name: 'dashboard-preschool-assessments' }),
    color: '#8b5cf6',
  },
  {
    id: 'payments',
    title: 'Payments',
    description: 'Manage student payments',
    icon: '💳',
    badge: computed(() => dashboard.value.summary.pendingPayments),
    action: () => router.push({ name: 'dashboard-preschool-admin-payment' }),
    color: '#ec4899',
  },
  {
    id: 'enrollment',
    title: 'Enrollment',
    description: 'Handle enrollments and registrations',
    icon: '✍️',
    badge: null,
    action: () => router.push({ name: 'dashboard-preschool-admin-enrollments' }),
    color: '#14b8a6',
  },
]

const recentActivityCount = computed(() => dashboard.value.recentAttendance.length)

onMounted(load)
</script>

<template>
  <MainLayout>
    <div class="dashboard-tracker">
      <HeaderSection title="Preschool Admin Dashboard" subtitle="Manage students, classes, staff, and operations">
        <template #actions>
          <Button
            label="Quick Actions"
            icon="pi pi-lightning"
            @click="() => {}"
          />
        </template>
      </HeaderSection>

      <div class="dashboard-tracker__hero">
        <div class="dashboard-tracker__hero-content">
          <h2 class="dashboard-tracker__hero-title">📊 Preschool Dashboard</h2>
          <p class="dashboard-tracker__hero-subtitle">
            Centralized hub for managing all Preschool administration functions
          </p>
          <div class="dashboard-tracker__hero-actions">
            <Button
              label="Quick Report"
              icon="pi pi-file-export"
              @click="() => {}"
            />
            <Button
              label="Settings"
              icon="pi pi-cog"
              severity="secondary"
              @click="router.push({ name: 'dashboard-preschool-admin-settings' })"
            />
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="dashboard-tracker__loading">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
      </div>

      <template v-else>
        <div class="dashboard-tracker__row">
          <div class="dashboard-tracker__stat-card">
            <div class="dashboard-tracker__stat-icon">👥</div>
            <div class="dashboard-tracker__stat-content">
              <div class="dashboard-tracker__stat-value">{{ dashboard.summary.students }}</div>
              <div class="dashboard-tracker__stat-label">Total Students</div>
            </div>
          </div>

          <div class="dashboard-tracker__stat-card">
            <div class="dashboard-tracker__stat-icon">🏫</div>
            <div class="dashboard-tracker__stat-content">
              <div class="dashboard-tracker__stat-value">{{ dashboard.summary.classes }}</div>
              <div class="dashboard-tracker__stat-label">Active Classes</div>
            </div>
          </div>

          <div class="dashboard-tracker__stat-card">
            <div class="dashboard-tracker__stat-icon">👨‍🏫</div>
            <div class="dashboard-tracker__stat-content">
              <div class="dashboard-tracker__stat-value">{{ dashboard.summary.teachers }}</div>
              <div class="dashboard-tracker__stat-label">Staff Members</div>
            </div>
          </div>

          <div class="dashboard-tracker__stat-card">
            <div class="dashboard-tracker__stat-icon">📅</div>
            <div class="dashboard-tracker__stat-content">
              <div class="dashboard-tracker__stat-value">{{ dashboard.summary.attendanceToday }}</div>
              <div class="dashboard-tracker__stat-label">Present Today</div>
            </div>
          </div>
        </div>

        <div class="dashboard-tracker__row dashboard-tracker__row--full">
          <h2 class="dashboard-tracker__section-title">🎯 Module Management</h2>
          <div class="dashboard-tracker__module-grid">
            <div
              v-for="module in moduleCards"
              :key="module.id"
              class="dashboard-tracker__module-card"
              @click="module.action"
            >
              <div class="dashboard-tracker__module-header">
                <div class="dashboard-tracker__module-icon">{{ module.icon }}</div>
                <div v-if="module.badge" class="dashboard-tracker__module-badge">
                  {{ module.badge }}
                </div>
              </div>
              <div class="dashboard-tracker__module-content">
                <h3 class="dashboard-tracker__module-title">{{ module.title }}</h3>
                <p class="dashboard-tracker__module-desc">{{ module.description }}</p>
              </div>
              <div class="dashboard-tracker__module-arrow">→</div>
            </div>
          </div>
        </div>

        <div class="dashboard-tracker__row dashboard-tracker__row--two-col">
          <div class="dashboard-tracker__card">
            <div class="dashboard-tracker__card-header">
              <h3 class="dashboard-tracker__card-title">📅 Recent Attendance</h3>
              <span class="dashboard-tracker__card-count">{{ recentActivityCount }} records</span>
            </div>
            <div class="dashboard-tracker__health-filters">
              <label class="dashboard-tracker__health-filter">
                <span>Severity</span>
                <select v-model="healthAlertFilters.severity">
                  <option value="all">All severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>
              <label class="dashboard-tracker__health-filter">
                <span>Status</span>
                <select v-model="healthAlertFilters.status">
                  <option value="all">All statuses</option>
                  <option value="new">New</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <label class="dashboard-tracker__health-filter">
                <span>Assigned staff</span>
                <select v-model="healthAlertFilters.assigned_to">
                  <option v-for="option in healthAlertAssigneeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </label>
            </div>
            <div class="dashboard-tracker__health-alert-grid">
              <article v-for="card in healthAlertCards" :key="card.label" class="dashboard-tracker__health-alert-card">
                <div class="dashboard-tracker__health-alert-label">{{ card.label }}</div>
                <div class="dashboard-tracker__health-alert-value">{{ card.value }}</div>
                <div class="dashboard-tracker__health-alert-note">{{ card.note }}</div>
              </article>
            </div>
            <div class="dashboard-tracker__card-body">
              <div v-if="recentActivityCount === 0" class="dashboard-tracker__empty">
                No attendance records yet.
              </div>
              <div v-else class="dashboard-tracker__activity-list">
                <div
                  v-for="(item, idx) in dashboard.recentAttendance.slice(0, 5)"
                  :key="idx"
                  class="dashboard-tracker__activity-item"
                >
                  <div class="dashboard-tracker__activity-info">
                    <div class="dashboard-tracker__activity-name">{{ item.studentName }}</div>
                    <div class="dashboard-tracker__activity-meta">{{ item.className }} • {{ item.attendanceDate }}</div>
                  </div>
                  <div class="dashboard-tracker__activity-status">
                    <span class="dashboard-tracker__status-badge" :data-status="item.status">
                      {{ item.status === 'present' ? '✓ Present' : item.status === 'absent' ? '✗ Absent' : '⏳ Late' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="dashboard-tracker__card">
            <div class="dashboard-tracker__card-header">
              <h3 class="dashboard-tracker__card-title">📚 Upcoming Classes</h3>
              <span class="dashboard-tracker__card-count">{{ dashboard.upcomingClasses.length }} classes</span>
            </div>
            <div class="dashboard-tracker__card-body">
              <div v-if="dashboard.upcomingClasses.length === 0" class="dashboard-tracker__empty">
                No upcoming classes scheduled.
              </div>
              <div v-else class="dashboard-tracker__class-list">
                <div
                  v-for="(cls, idx) in dashboard.upcomingClasses.slice(0, 5)"
                  :key="idx"
                  class="dashboard-tracker__class-item"
                >
                  <div class="dashboard-tracker__class-info">
                    <div class="dashboard-tracker__class-name">{{ cls.name }}</div>
                    <div class="dashboard-tracker__class-meta">{{ cls.teacherName }} • {{ cls.scheduledTime }}</div>
                  </div>
                  <div class="dashboard-tracker__class-students">{{ cls.studentCount }} students</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-tracker__row dashboard-tracker__row--full">
          <div class="dashboard-tracker__card">
            <div class="dashboard-tracker__card-header">
              <h3 class="dashboard-tracker__card-title">🩺 Health Alerts</h3>
              <span class="dashboard-tracker__card-count">{{ healthSummary.summary.unresolvedItems }} active alerts</span>
            </div>
            <div class="dashboard-tracker__card-body">
              <div class="dashboard-tracker__health-grid">
                <article class="dashboard-tracker__health-card">
                  <p>Critical incidents</p>
                  <strong>{{ healthSummary.summary.criticalIncidents }}</strong>
                </article>
                <article class="dashboard-tracker__health-card">
                  <p>Severe allergies</p>
                  <strong>{{ healthSummary.summary.severeAllergies }}</strong>
                </article>
                <article class="dashboard-tracker__health-card">
                  <p>Missing contacts</p>
                  <strong>{{ healthSummary.summary.missingEmergencyContacts }}</strong>
                </article>
                <article class="dashboard-tracker__health-card">
                  <p>Overdue vaccinations</p>
                  <strong>{{ healthSummary.summary.overdueVaccinations }}</strong>
                </article>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-tracker__row dashboard-tracker__row--full">
          <h2 class="dashboard-tracker__section-title">🚀 Quick Start Guide</h2>
          <div class="dashboard-tracker__guide-grid">
            <div class="dashboard-tracker__guide-card">
              <div class="dashboard-tracker__guide-number">1</div>
              <div class="dashboard-tracker__guide-content">
                <h3 class="dashboard-tracker__guide-title">👥 Register Students</h3>
                <p class="dashboard-tracker__guide-desc">Add and enroll students into classes</p>
              </div>
            </div>

            <div class="dashboard-tracker__guide-card">
              <div class="dashboard-tracker__guide-number">2</div>
              <div class="dashboard-tracker__guide-content">
                <h3 class="dashboard-tracker__guide-title">📅 Track Attendance</h3>
                <p class="dashboard-tracker__guide-desc">Record daily attendance and absence patterns</p>
              </div>
            </div>

            <div class="dashboard-tracker__guide-card">
              <div class="dashboard-tracker__guide-number">3</div>
              <div class="dashboard-tracker__guide-content">
                <h3 class="dashboard-tracker__guide-title">📝 Create Assessments</h3>
                <p class="dashboard-tracker__guide-desc">Design and deploy assessment forms</p>
              </div>
            </div>

            <div class="dashboard-tracker__guide-card">
              <div class="dashboard-tracker__guide-number">4</div>
              <div class="dashboard-tracker__guide-content">
                <h3 class="dashboard-tracker__guide-title">💳 Manage Payments</h3>
                <p class="dashboard-tracker__guide-desc">Track payments and send payment reminders</p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </MainLayout>
</template>

<style scoped>
.dashboard-tracker {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-tracker__hero {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 1.5rem;
  padding: 3rem 2rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.dashboard-tracker__hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

.dashboard-tracker__hero-content {
  position: relative;
  z-index: 1;
  max-width: 600px;
}

.dashboard-tracker__hero-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 800;
  color: white;
}

.dashboard-tracker__hero-subtitle {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
}

.dashboard-tracker__hero-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.dashboard-tracker__loading {
  display: flex;
  justify-content: center;
  padding: 4rem;
}

.dashboard-tracker__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
}

.dashboard-tracker__row--full {
  grid-template-columns: 1fr;
}

.dashboard-tracker__row--two-col {
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
}

.dashboard-tracker__stat-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.2s ease;
}

.dashboard-tracker__stat-card:hover {
  border-color: #93c5fd;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.dashboard-tracker__stat-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.dashboard-tracker__stat-content {
  flex-grow: 1;
}

.dashboard-tracker__stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #3b82f6;
  margin: 0;
}

.dashboard-tracker__stat-label {
  font-size: 0.85rem;
  color: var(--text-color-secondary);
  margin: 0.25rem 0 0 0;
  font-weight: 500;
}

.dashboard-tracker__section-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.dashboard-tracker__module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.dashboard-tracker__module-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard-tracker__module-card:hover {
  border-color: #93c5fd;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.dashboard-tracker__module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dashboard-tracker__module-icon {
  font-size: 2.5rem;
}

.dashboard-tracker__module-badge {
  background: #3b82f6;
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

.dashboard-tracker__module-content {
  flex-grow: 1;
}

.dashboard-tracker__module-title {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.dashboard-tracker__module-desc {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.4;
}

.dashboard-tracker__module-arrow {
  font-size: 1.25rem;
  color: #3b82f6;
  transition: all 0.2s ease;
  align-self: flex-end;
}

.dashboard-tracker__module-card:hover .dashboard-tracker__module-arrow {
  color: #2563eb;
  transform: translateX(4px);
}

.dashboard-tracker__card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dashboard-tracker__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.dashboard-tracker__card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.dashboard-tracker__card-count {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.dashboard-tracker__card-body {
  padding: 1.5rem;
  flex-grow: 1;
}

.dashboard-tracker__empty {
  color: var(--text-color-secondary);
  font-size: 0.9rem;
  text-align: center;
  padding: 2rem 0;
}

.dashboard-tracker__activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dashboard-tracker__activity-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.dashboard-tracker__activity-item:hover {
  background: #eef2ff;
}

.dashboard-tracker__activity-info {
  flex-grow: 1;
}

.dashboard-tracker__activity-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0f172a;
}

.dashboard-tracker__activity-meta {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.dashboard-tracker__activity-status {
  flex-shrink: 0;
}

.dashboard-tracker__status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.dashboard-tracker__status-badge[data-status="present"] {
  background: #10b981;
}

.dashboard-tracker__status-badge[data-status="absent"] {
  background: #ef4444;
}

.dashboard-tracker__status-badge[data-status="late"] {
  background: #f59e0b;
}

.dashboard-tracker__class-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dashboard-tracker__class-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.dashboard-tracker__class-item:hover {
  background: #eef2ff;
}

.dashboard-tracker__class-info {
  flex-grow: 1;
}

.dashboard-tracker__class-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0f172a;
}

.dashboard-tracker__class-meta {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.dashboard-tracker__class-students {
  font-size: 0.85rem;
  color: #3b82f6;
  font-weight: 600;
  flex-shrink: 0;
}

.dashboard-tracker__guide-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.dashboard-tracker__guide-card {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 1px solid #93c5fd;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
}

.dashboard-tracker__guide-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.dashboard-tracker__guide-content {
  flex-grow: 1;
}

.dashboard-tracker__guide-title {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.dashboard-tracker__guide-desc {
  margin: 0;
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.4;
}

.dashboard-tracker__health-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
}

.dashboard-tracker__health-filters {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  padding: 1rem 0 0.75rem;
}

.dashboard-tracker__health-filter {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.dashboard-tracker__health-filter span {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #64748b;
}

.dashboard-tracker__health-filter select {
  width: 100%;
  min-height: 2.75rem;
  border-radius: 0.9rem;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
  padding: 0.5rem 0.8rem;
}

.dashboard-tracker__health-alert-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
  padding-bottom: 0.85rem;
}

.dashboard-tracker__health-alert-card {
  padding: 1rem;
  border-radius: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.dashboard-tracker__health-alert-label {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #64748b;
}

.dashboard-tracker__health-alert-value {
  display: block;
  margin-top: 0.35rem;
  font-size: 1.4rem;
  color: #b91c1c;
  font-weight: 800;
}

.dashboard-tracker__health-alert-note {
  margin-top: 0.2rem;
  font-size: 0.8rem;
  color: #64748b;
}

.dashboard-tracker__health-card {
  padding: 1rem;
  border-radius: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.dashboard-tracker__health-card p {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #64748b;
}

.dashboard-tracker__health-card strong {
  display: block;
  margin-top: 0.35rem;
  font-size: 1.4rem;
  color: #b91c1c;
}

@media (max-width: 1024px) {
  .dashboard-tracker__module-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-tracker__row--two-col {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-tracker__hero {
    padding: 2rem;
  }

  .dashboard-tracker__hero-title {
    font-size: 1.5rem;
  }

  .dashboard-tracker__hero-actions {
    flex-direction: column;
  }

  .dashboard-tracker__row {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-tracker__module-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-tracker__guide-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-tracker__health-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-tracker__stat-icon {
    font-size: 2rem;
  }

  .dashboard-tracker__stat-value {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .dashboard-tracker__row {
    grid-template-columns: 1fr;
  }

  .dashboard-tracker__health-grid {
    grid-template-columns: 1fr;
  }
}
</style>
