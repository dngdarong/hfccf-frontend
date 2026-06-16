<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Loading from '@/components/feedback/Loading.vue'
import { useLanguage } from '@/composables/useLanguage'
import { getAdminUser } from '@/modules/super-admin/services/adminUsersApi'
import {
  formatDateTime,
  normalizeUser,
  permissionLabel,
  statusLabel,
  statusTone,
} from '@/modules/super-admin/components/view-user/viewUserModel'
import ViewUserHero from '@/modules/super-admin/components/view-user/ViewUserHero.vue'
import ViewUserSectionCard from '@/modules/super-admin/components/view-user/ViewUserSectionCard.vue'
import ViewUserPermissionsCard from '@/modules/super-admin/components/view-user/ViewUserPermissionsCard.vue'
import { getAvatarInitials } from '@/utils/avatar'

defineOptions({
  name: 'SuperAdminViewUserPage',
})

const route = useRoute()
const router = useRouter()
const { t } = useLanguage()

const user = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')
const avatarLoaded = ref(false)
const avatarErrored = ref(false)

const userId = computed(() => String(route.params.id || '').trim())

function resolvedText(key, fallback) {
  const translated = t(key)
  return translated !== key ? translated : fallback
}

const normalizedUser = computed(() => normalizeUser(user.value || {}, t))

const pageTitle = computed(() =>
  normalizedUser.value.name || resolvedText('users.viewUser.title', 'View User'),
)

const pageSubtitle = computed(() =>
  resolvedText(
    'users.viewUser.subtitle',
    'Review the account profile, permissions, and activity details.',
  ),
)

const avatarSource = computed(() => normalizedUser.value.avatar)

const avatarInitials = computed(() =>
  getAvatarInitials(
    normalizedUser.value.fullName || normalizedUser.value.name || normalizedUser.value.username,
    '?',
  ),
)

const shouldShowAvatar = computed(
  () => Boolean(avatarSource.value) && Boolean(avatarLoaded.value) && !avatarErrored.value,
)

const isFullAccess = computed(() =>
  normalizedUser.value.permissions.some((permission) => String(permission).trim() === 'all:*'),
)

const permissionItems = computed(() => {
  if (!normalizedUser.value.permissions.length) return []

  return normalizedUser.value.permissions.map((permission) => ({
    key: permission,
    label: permissionLabel(permission, t),
  }))
})

const sectionCards = computed(() => [
  {
    key: 'profile-summary',
    title: resolvedText('users.viewUser.sections.profileSummary', 'Profile Summary'),
    rows: [
      { label: resolvedText('users.viewUser.fields.id', 'ID'), value: normalizedUser.value.id },
      {
        label: resolvedText('users.viewUser.fields.fullName', 'Full Name'),
        value: normalizedUser.value.fullName || normalizedUser.value.name,
      },
      {
        label: resolvedText('users.viewUser.fields.username', 'Username'),
        value: normalizedUser.value.username,
      },
      {
        label: resolvedText('users.viewUser.fields.avatar', 'Avatar'),
        value: normalizedUser.value.avatar
          ? resolvedText('users.viewUser.avatarPresent', 'Available')
          : '-',
      },
    ],
  },
  {
    key: 'account-details',
    title: resolvedText('users.viewUser.sections.accountDetails', 'Account Details'),
    rows: [
      {
        label: resolvedText('users.viewUser.fields.firstName', 'First name'),
        value: normalizedUser.value.firstName,
      },
      {
        label: resolvedText('users.viewUser.fields.lastName', 'Last name'),
        value: normalizedUser.value.lastName,
      },
      {
        label: resolvedText('users.viewUser.fields.department', 'Department'),
        value: normalizedUser.value.department,
      },
      {
        label: resolvedText('users.viewUser.fields.departmentCode', 'Department code'),
        value: normalizedUser.value.departmentCode,
      },
      {
        label: resolvedText('users.viewUser.fields.scope', 'Scope'),
        value: normalizedUser.value.scope,
      },
      {
        label: resolvedText('users.viewUser.fields.domain', 'Domain'),
        value: normalizedUser.value.domain,
      },
      {
        label: resolvedText('users.viewUser.fields.emailVerifiedAt', 'Email verified at'),
        value: formatDateTime(normalizedUser.value.emailVerifiedAt),
      },
      {
        label: resolvedText('users.viewUser.fields.updatedAt', 'Updated at'),
        value: formatDateTime(normalizedUser.value.updatedAt),
      },
    ],
  },
  {
    key: 'role-access',
    title: resolvedText('users.viewUser.sections.roleAccess', 'Role & Access'),
    rows: [
      {
        label: resolvedText('users.viewUser.fields.role', 'Role'),
        value: normalizedUser.value.roleLabel,
      },
      {
        label: resolvedText('users.viewUser.fields.roleRaw', 'Role key'),
        value: normalizedUser.value.role,
      },
      {
        label: resolvedText('users.viewUser.fields.status', 'Status'),
        value: statusLabel(normalizedUser.value.status, t),
      },
      {
        label: resolvedText('users.viewUser.fields.scope', 'Scope'),
        value: normalizedUser.value.scope,
      },
      {
        label: resolvedText('users.viewUser.fields.domain', 'Domain'),
        value: normalizedUser.value.domain,
      },
    ],
  },
  {
    key: 'contact-information',
    title: resolvedText('users.viewUser.sections.contactInformation', 'Contact Information'),
    rows: [
      {
        label: resolvedText('users.viewUser.fields.email', 'Email'),
        value: normalizedUser.value.email,
      },
      {
        label: resolvedText('users.viewUser.fields.phone', 'Phone'),
        value: normalizedUser.value.phone,
      },
    ],
  },
  {
    key: 'activity',
    title: resolvedText('users.viewUser.sections.activity', 'Activity'),
    rows: [
      {
        label: resolvedText('users.viewUser.fields.createdAt', 'Created at'),
        value: formatDateTime(normalizedUser.value.createdAt),
      },
      {
        label: resolvedText('users.viewUser.fields.updatedAt', 'Updated at'),
        value: formatDateTime(normalizedUser.value.updatedAt),
      },
      {
        label: resolvedText('users.viewUser.fields.lastLogin', 'Last login'),
        value: formatDateTime(normalizedUser.value.lastLoginAt),
      },
      {
        label: resolvedText('users.viewUser.fields.emailVerifiedAt', 'Email verified at'),
        value: formatDateTime(normalizedUser.value.emailVerifiedAt),
      },
    ],
  },
  {
    key: 'bio-notes',
    title: resolvedText('users.viewUser.sections.bioNotes', 'Bio / Notes'),
    body: normalizedUser.value.bio,
  },
])

async function loadUser() {
  const id = userId.value

  if (!id) {
    errorMessage.value = resolvedText(
      'users.viewUser.notFoundMessage',
      'The requested user could not be loaded.',
    )
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  avatarLoaded.value = false
  avatarErrored.value = false

  try {
    const result = await getAdminUser(id)
    user.value = result || null

    if (!result) {
      errorMessage.value = resolvedText(
        'users.viewUser.notFoundMessage',
        'The requested user could not be loaded.',
      )
    }
  } catch (error) {
    user.value = null
    if (error?.response?.status === 404) {
      errorMessage.value = resolvedText(
        'users.viewUser.notFoundMessage',
        'The requested user could not be found.',
      )
    } else {
      errorMessage.value =
        error?.message ||
        resolvedText('users.viewUser.loadFailed', 'Unable to load user details right now.')
    }
  } finally {
    isLoading.value = false
  }
}

function goBack() {
  router.push({ path: '/module/super-admin/users/manage' })
}

function goToEdit() {
  const id = userId.value
  if (!id) return

  router.push({ path: '/module/super-admin/users/add', query: { mode: 'edit', id } })
}

function onAvatarLoad() {
  avatarLoaded.value = true
}

function onAvatarError() {
  avatarErrored.value = true
  avatarLoaded.value = false
}

watch(userId, () => {
  void loadUser()
})

onMounted(() => {
  void loadUser()
})
</script>

<template>
  <MainLayout>
    <section class="view-user-page">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <Card
        v-if="isLoading"
        class="view-user-page__state"
      >
        <template #content>
          <Loading
            :label="resolvedText('users.loadingUsers', 'Loading user details...')"
            size="md"
          />
        </template>
      </Card>

      <Card
        v-else-if="errorMessage"
        class="view-user-page__state view-user-page__state--error"
      >
        <template #title>
          {{ resolvedText('users.viewUser.notFoundTitle', 'User not found') }}
        </template>

        <template #content>
          <div class="view-user-page__state-copy">
            <p>{{ errorMessage }}</p>

            <div class="view-user-page__state-actions">
              <Button
                type="button"
                severity="secondary"
                outlined
                @click="goBack"
              >
                {{ resolvedText('users.viewUser.backButton', 'Back to users') }}
              </Button>
            </div>
          </div>
        </template>
      </Card>

      <template v-else>
        <Card class="view-user-page__hero-card">
          <template #content>
            <ViewUserHero
              :user="normalizedUser"
              :bio="normalizedUser.bio"
              :avatar-source="avatarSource"
              :avatar-initials="avatarInitials"
              :should-show-avatar="shouldShowAvatar"
              :status-tone="statusTone(normalizedUser.status)"
              :status-label="statusLabel(normalizedUser.status, t)"
              :refresh-label="resolvedText('users.viewUser.refreshButton', 'Refresh')"
              :back-label="resolvedText('users.viewUser.backButton', 'Back to users')"
              :edit-label="resolvedText('users.viewUser.editButton', 'Edit user')"
              @refresh="loadUser"
              @back="goBack"
              @edit="goToEdit"
              @avatar-load="onAvatarLoad"
              @avatar-error="onAvatarError"
            />
          </template>
        </Card>

        <div class="view-user-page__grid">
          <ViewUserSectionCard
            v-for="section in sectionCards"
            :key="section.key"
            :title="section.title"
            :rows="section.rows || []"
            :body="section.body || ''"
          />

          <ViewUserPermissionsCard
            :title="resolvedText('users.viewUser.permissionsTitle', 'Permissions')"
            :permissions="permissionItems"
            :is-full-access="isFullAccess"
            :full-access-label="resolvedText('users.viewUser.fullAccess', 'Full access')"
            :empty-label="resolvedText('users.viewUser.emptyPermissions', 'No permissions assigned.')"
          />
        </div>
      </template>
    </section>
  </MainLayout>
</template>

<style scoped>
.view-user-page {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.view-user-page__hero-card,
.view-user-page__state {
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  background: #ffffff;
  box-shadow: 0 18px 34px -34px rgba(15, 23, 42, 0.25);
}

.view-user-page__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.view-user-page__state {
  padding: 0.4rem;
}

.view-user-page__state-copy {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.view-user-page__state-actions {
  display: flex;
  justify-content: flex-start;
}

.view-user-page__state--error {
  border-color: #fecaca;
}

@media (max-width: 1024px) {
  .view-user-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>
