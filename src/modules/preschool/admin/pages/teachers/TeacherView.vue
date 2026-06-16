<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchPreschoolTeacher } from '@/modules/preschool/services/preschoolApi'
import { getAvatarInitials, resolveAvatarSource } from '@/utils/avatar'
import {
  DEFAULT_AVATAR_INITIALS,
  USERS_ROUTE_PATH,
  ADD_USERS_ROUTE_PATH,
  QUERY_KEYS,
} from './constants/teacherViewConstants'
import {
  normalizePermissions,
  buildPermissionChips,
  buildSummaryCards,
  getTeacherDisplayName,
} from './utils/teacherViewHelpers'

defineOptions({
  name: 'PreschoolAdminTeacherViewPage',
})

const route = useRoute()
const router = useRouter()
const { t } = useLanguage()

const teacher = ref(null)
const loading = ref(false)
const errorMessage = ref('')

const teacherId = computed(() => String(route.params.id || '').trim())

const avatarSrc = computed(() => resolveAvatarSource(teacher.value?.avatar || teacher.value?.avatarUrl || ''))
const avatarInitials = computed(() => getAvatarInitials(teacher.value?.name || '', DEFAULT_AVATAR_INITIALS))
const showImage = ref(false)
const teacherName = computed(() => getTeacherDisplayName(teacher.value))
const permissionCount = computed(() => permissions.value.length)

const summaryCards = computed(() => buildSummaryCards(teacher.value, permissionCount.value, t))

function onImgLoad() { showImage.value = true }
function onImgError() { showImage.value = false }

const permissions = computed(() => normalizePermissions(teacher.value?.permissions))

const permissionChips = computed(() => buildPermissionChips(permissions.value))

async function loadTeacher() {
  if (!teacherId.value) return
  loading.value = true
  errorMessage.value = ''
  try {
    const data = await fetchPreschoolTeacher(teacherId.value)
    teacher.value = data || null
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolTeacherView.loadFailed')
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push(USERS_ROUTE_PATH)
}

function goEdit() {
  router.push({ path: ADD_USERS_ROUTE_PATH, query: { [QUERY_KEYS.MODE]: 'edit', [QUERY_KEYS.ID]: teacherId.value } })
}

onMounted(loadTeacher)
</script>

<template>
  <MainLayout>
    <section class="teacher-view">
      <HeaderSection
        :title="t('preschoolTeacherView.title')"
        :subtitle="t('preschoolTeacherView.subtitle')"
      />

      <!-- loading skeleton -->
      <div v-if="loading" class="teacher-view__skeleton">
        <div class="teacher-view__skeleton-avatar" />
        <div class="teacher-view__skeleton-lines">
          <div class="teacher-view__skeleton-line teacher-view__skeleton-line--lg" />
          <div class="teacher-view__skeleton-line teacher-view__skeleton-line--sm" />
        </div>
      </div>

      <!-- error -->
      <div v-else-if="errorMessage" class="teacher-view__error">
        {{ errorMessage }}
      </div>

      <template v-else-if="teacher">

        <!-- profile card -->
        <div class="teacher-view__profile-card">
          <!-- avatar -->
          <div class="teacher-view__avatar-wrap">
            <div class="teacher-view__avatar">
              <span v-if="!showImage" class="teacher-view__avatar-initials">{{ avatarInitials }}</span>
              <img
                v-if="avatarSrc"
                :src="avatarSrc"
                :alt="teacherName"
                class="teacher-view__avatar-img"
                :class="{ 'teacher-view__avatar-img--visible': showImage }"
                @load="onImgLoad"
                @error="onImgError"
              />
            </div>
          </div>

          <!-- identity -->
          <div class="teacher-view__identity">
            <h2 class="teacher-view__name">{{ teacherName }}</h2>
            <p v-if="teacher.username" class="teacher-view__username">@{{ teacher.username }}</p>
            <div class="teacher-view__badges">
              <StatusBadge :status="teacher.status" :label="teacher.status" size="sm" />
              <span class="teacher-view__role-badge">{{ teacher.role || '—' }}</span>
            </div>
          </div>

          <!-- actions -->
          <div class="teacher-view__profile-actions">
            <Button
              variant="ghost"
              rounded="xl"
              size="sm"
              class="teacher-view__back-btn"
              @click="goBack"
            >
              <template #iconLeft>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="teacher-view__btn-icon">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </template>
              <span class="teacher-view__back-label">
                {{ t('preschoolTeacherView.actions.back') }}
              </span>
            </Button>
            <Button variant="primary" rounded="xl" size="sm" @click="goEdit">
              {{ t('preschoolTeacherView.actions.edit') }}
              <template #iconRight>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="teacher-view__btn-icon">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </template>
            </Button>
          </div>
        </div>

        <div class="teacher-view__stats">
          <article v-for="card in summaryCards" :key="card.key" class="teacher-view__stat-card">
            <p class="teacher-view__stat-label">{{ card.label }}</p>
            <p class="teacher-view__stat-value">{{ card.value }}</p>
            <p class="teacher-view__stat-caption">{{ card.caption }}</p>
          </article>
        </div>

        <!-- info grid -->
        <div class="teacher-view__grid">

          <!-- contact section -->
          <div class="teacher-view__section">
            <p class="teacher-view__section-title">{{ t('preschoolTeacherView.sections.contact') }}</p>
            <div class="teacher-view__field-list">
              <div class="teacher-view__field">
                <span class="teacher-view__field-label">{{ t('preschoolTeacherView.fields.email') }}</span>
                <a
                  v-if="teacher.email"
                  :href="`mailto:${teacher.email}`"
                  class="teacher-view__field-value teacher-view__field-value--link"
                >{{ teacher.email }}</a>
                <span v-else class="teacher-view__field-value teacher-view__field-value--empty">
                  {{ t('preschoolTeacherView.fields.noEmail') }}
                </span>
              </div>
              <div class="teacher-view__field">
                <span class="teacher-view__field-label">{{ t('preschoolTeacherView.fields.phone') }}</span>
                <a
                  v-if="teacher.phone"
                  :href="`tel:${teacher.phone}`"
                  class="teacher-view__field-value teacher-view__field-value--link"
                >{{ teacher.phone }}</a>
                <span v-else class="teacher-view__field-value teacher-view__field-value--empty">
                  {{ t('preschoolTeacherView.fields.noPhone') }}
                </span>
              </div>
            </div>
          </div>

          <!-- account section -->
          <div class="teacher-view__section">
            <p class="teacher-view__section-title">{{ t('preschoolTeacherView.sections.account') }}</p>
            <div class="teacher-view__field-list">
              <div class="teacher-view__field">
                <span class="teacher-view__field-label">{{ t('preschoolTeacherView.fields.username') }}</span>
                <span class="teacher-view__field-value">{{ teacher.username || '—' }}</span>
              </div>
              <div class="teacher-view__field">
                <span class="teacher-view__field-label">{{ t('preschoolTeacherView.fields.role') }}</span>
                <span class="teacher-view__field-value">{{ teacher.role || '—' }}</span>
              </div>
              <div class="teacher-view__field">
                <span class="teacher-view__field-label">{{ t('preschoolTeacherView.fields.status') }}</span>
                <StatusBadge :status="teacher.status" :label="teacher.status" size="sm" />
              </div>
            </div>
          </div>

          <!-- permissions section (full width) -->
          <div class="teacher-view__section teacher-view__section--full">
            <p class="teacher-view__section-title">{{ t('preschoolTeacherView.sections.permissions') }}</p>
            <div v-if="permissionChips.length" class="teacher-view__permissions">
              <span
                v-for="perm in permissionChips"
                :key="perm.raw"
                class="teacher-view__perm-chip"
                :class="`teacher-view__perm-chip--tone-${perm.tone}`"
              >
                <span class="teacher-view__perm-chip-dot" />
                <span class="teacher-view__perm-chip-text">{{ perm.label }}</span>
              </span>
            </div>
            <p v-else class="teacher-view__field-value teacher-view__field-value--empty">
              {{ t('preschoolTeacherView.fields.noPermissions') }}
            </p>
          </div>
        </div>

      </template>
    </section>
  </MainLayout>
</template>

<style scoped>
.teacher-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* skeleton */
.teacher-view__skeleton {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.teacher-view__skeleton-avatar {
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  flex-shrink: 0;
}

.teacher-view__skeleton-lines {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.teacher-view__skeleton-line {
  border-radius: 0.5rem;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.teacher-view__skeleton-line--lg { height: 1.1rem; width: 45%; }
.teacher-view__skeleton-line--sm { height: 0.8rem; width: 28%; }

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* error */
.teacher-view__error {
  padding: 0.75rem 1rem;
  border-radius: 0.8rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
}

/* profile card */
.teacher-view__profile-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.75rem 2rem;
  border-radius: 1.5rem;
  border: 1px solid #e2e8f0;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 30%),
    linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(248,250,252,0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.45);
}

/* avatar */
.teacher-view__avatar-wrap {
  flex-shrink: 0;
}

.teacher-view__avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #7dd3fc 0%, #0369a1 100%);
  box-shadow:
    0 0 0 3px #fff,
    0 0 0 5px #e0f2fe,
    0 16px 32px -16px rgba(3, 105, 161, 0.5);
  color: #fff;
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  overflow: hidden;
}

.teacher-view__avatar-initials {
  user-select: none;
}

.teacher-view__avatar-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 9999px;
  opacity: 0;
  transition: opacity 0.18s ease;
}

.teacher-view__avatar-img--visible {
  opacity: 1;
}

/* identity */
.teacher-view__identity {
  flex: 1;
  min-width: 0;
}

.teacher-view__name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
  margin: 0 0 0.15rem;
}

.teacher-view__username {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0 0 0.6rem;
}

.teacher-view__badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.teacher-view__role-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

/* profile actions */
.teacher-view__profile-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-left: auto;
  max-width: 100%;
  flex-shrink: 0;
}

.teacher-view__back-btn {
  flex: 0 0 auto;
  border: 1px solid #bfdbfe;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  color: #0f172a;
  box-shadow: 0 12px 24px -20px rgba(15, 23, 42, 0.35);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.teacher-view__back-btn:hover {
  transform: translateY(-1px);
  border-color: #93c5fd;
  background: linear-gradient(180deg, #ffffff 0%, #eff6ff 100%);
  box-shadow: 0 16px 30px -22px rgba(15, 23, 42, 0.42);
}

.teacher-view__back-btn:focus-visible {
  outline: 2px solid #93c5fd;
  outline-offset: 2px;
}

.teacher-view__back-label {
  display: inline-flex;
}

.teacher-view__btn-icon {
  width: 0.95rem;
  height: 0.95rem;
}

/* summary cards */
.teacher-view__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
}

.teacher-view__stat-card {
  padding: 1rem 1.05rem;
  border-radius: 1.1rem;
  border: 1px solid #dbeafe;
  background:
    radial-gradient(circle at top right, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 16px 32px -26px rgba(15, 23, 42, 0.45);
}

.teacher-view__stat-label {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #0369a1;
}

.teacher-view__stat-value {
  margin: 0.35rem 0 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  word-break: break-word;
}

.teacher-view__stat-caption {
  margin: 0.3rem 0 0;
  font-size: 0.78rem;
  color: #64748b;
}

/* info grid */
.teacher-view__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  grid-auto-flow: dense;
  gap: 1rem;
  align-items: start;
}

.teacher-view__section {
  padding: 1.25rem 1.5rem;
  border-radius: 1.25rem;
  border: 1px solid #e2e8f0;
  background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
}

.teacher-view__section--full {
  grid-column: 2;
  grid-row: 1 / span 2;
}

.teacher-view__section--accent {
  background:
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 26%),
    linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border-color: #bfdbfe;
}

.teacher-view__field-list--compact {
  gap: 0.65rem;
}

.teacher-view__section-title {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0369a1;
  margin: 0 0 0.85rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0f2fe;
}

.teacher-view__field-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.teacher-view__field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.teacher-view__field-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.teacher-view__field-value {
  font-size: 0.875rem;
  color: #0f172a;
  font-weight: 500;
}

.teacher-view__field-value--link {
  color: #0369a1;
  text-decoration: none;
}

.teacher-view__field-value--link:hover {
  text-decoration: underline;
}

.teacher-view__field-value--empty {
  color: #94a3b8;
  font-style: italic;
}

/* permissions */
.teacher-view__permissions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.teacher-view__perm-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.42rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #0f172a;
  border: 1px solid transparent;
  box-shadow: 0 10px 20px -16px rgba(15, 23, 42, 0.35);
}

.teacher-view__perm-chip-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 9999px;
  flex-shrink: 0;
  background: currentColor;
  opacity: 0.95;
}

.teacher-view__perm-chip-text {
  min-width: 0;
}

.teacher-view__perm-chip--tone-0 {
  background: linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%);
  color: #0369a1;
  border-color: #bae6fd;
}

.teacher-view__perm-chip--tone-1 {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  color: #15803d;
  border-color: #bbf7d0;
}

.teacher-view__perm-chip--tone-2 {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  color: #c2410c;
  border-color: #fed7aa;
}

.teacher-view__perm-chip--tone-3 {
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  color: #7c3aed;
  border-color: #ddd6fe;
}

@media (max-width: 768px) {
  .teacher-view__profile-card {
    flex-wrap: wrap;
    padding: 1.25rem;
    gap: 1rem;
  }

  .teacher-view__profile-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .teacher-view__back-label {
    display: none;
  }

  .teacher-view__stats,
  .teacher-view__grid {
    grid-template-columns: 1fr;
  }

  .teacher-view__section--full {
    grid-column: auto;
    grid-row: auto;
  }
}
</style>
