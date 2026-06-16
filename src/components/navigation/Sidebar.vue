<script setup>
import { computed, useSlots } from 'vue'
import PrimeButton from 'primevue/button'
import Avatar from '@/components/navigation/Avatar.vue'
import LogoutButton from '@/components/buttons/LogoutButton.vue'
import SidebarNavigation from '@/components/navigation/SidebarNavigation.vue'
import { useLanguage } from '@/composables/useLanguage'
import { getSidebarToneClass } from '@/services/accessControl'
import { useUserStore } from '@/store/userStore'

defineOptions({
  name: 'MainSidebar',
})

const emit = defineEmits(['toggle-sidebar', 'logout'])
const userStore = useUserStore()
const { t } = useLanguage()

defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
})

const slots = useSlots()
const currentUser = computed(() => userStore.currentUser || {})
const currentUserDisplayName = computed(() => {
  const firstName = String(currentUser.value?.firstName || '').trim()
  const lastName = String(currentUser.value?.lastName || '').trim()
  const fullName = `${lastName} ${firstName}`.trim()
  return fullName || String(currentUser.value?.username || '').trim() || t('common.navigation.defaultUserName')
})
const currentUserDisplayUsername = computed(() => {
  const role = String(currentUser.value?.role || '').trim()
  if (role) return role
  const email = String(currentUser.value?.email || '').trim()
  if (email.includes('@')) return email.split('@')[0]
  return email || t('common.navigation.defaultUsername')
})
const sidebarToneClass = computed(() => getSidebarToneClass(currentUser.value))
const hasHeaderSlot = computed(() => Boolean(slots.header))
const togglePt = {
  root: {
    class: [
      '!border',
      '!border-surface-200',
      '!bg-white',
      '!text-surface-500',
      '!shadow-[0_10px_22px_-22px_rgba(15,23,42,0.14)]',
      'transition-all',
      'duration-200',
      'hover:enabled:!border-brand-300',
      'hover:enabled:!bg-slate-100',
      'hover:enabled:!text-sky-800',
      'focus-visible:!outline-none',
      'focus-visible:!shadow-focus',
    ],
  },
}

function onToggleSidebar() {
  emit('toggle-sidebar')
}

function onLogout() {
  emit('logout')
}
</script>

<template>
  <aside
    class="sidebar-shell h-full border-r border-surface-200 px-[0.8rem] pt-[0.95rem] pb-[0.8rem]"
    :class="[sidebarToneClass, { 'sidebar-shell--collapsed': collapsed }]"
  >
    <nav class="flex h-full min-h-0 flex-col pb-2" :aria-label="t('common.navigation.mainNavigation')">
      <div class="py-2 pb-4 sm:pb-5">
        <div
          class="sidebar-topbar mb-4 flex items-start justify-between"
          :class="{
            'sidebar-topbar--collapsed justify-center': collapsed,
            'sidebar-topbar--custom': hasHeaderSlot,
          }"
        >
          <div v-if="!collapsed" class="min-w-0 flex-1">
            <slot name="header">
              <div class="sidebar-user-card">
                <Avatar
                  :name="currentUserDisplayName"
                  :username="currentUserDisplayUsername"
                  size="sm"
                  status="online"
                  :show-meta="false"
                />
                <div class="sidebar-user-card__meta">
                  <p class="sidebar-user-card__name">{{ currentUserDisplayName }}</p>
                  <p class="sidebar-user-card__username">{{ currentUserDisplayUsername }}</p>
                </div>
              </div>
            </slot>
          </div>
          <PrimeButton
            type="button"
            severity="secondary"
            text
            rounded
            class="sidebar-toggle-btn hidden h-8 w-8 min-h-0 !p-1.5 min-[769px]:flex"
            :pt="togglePt"
            :aria-label="t('common.navigation.toggleSidebar')"
            @click="onToggleSidebar"
          >
            <template #icon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-full w-full">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </template>
          </PrimeButton>
        </div>
      </div>

      <SidebarNavigation :collapsed="collapsed" />

      <div class="sidebar-logout-area mt-3 pt-3" :class="{ 'flex justify-center': collapsed }">
        <LogoutButton :collapsed="collapsed" @logout="onLogout" />
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar-shell {
  --sidebar-shell-accent: var(--hope-cyan);
  --color-base: var(--sidebar-shell-accent);
  background:
    radial-gradient(
      circle at top left,
      color-mix(in srgb, var(--sidebar-shell-accent) 12%, transparent),
      transparent 28%
    ),
    linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.sidebar-shell--super-admin {
  --sidebar-shell-accent: var(--brand-surface-800);
}

.sidebar-shell--english {
  --sidebar-shell-accent: var(--hope-cyan);
}

.sidebar-shell--preschool {
  --sidebar-shell-accent: var(--hope-lime);
}

.sidebar-shell--scholarship {
  --sidebar-shell-accent: var(--hope-yellow);
}

.sidebar-shell--sport {
  --sidebar-shell-accent: var(--hope-red);
}

.sidebar-topbar {
  min-height: 3.35rem;
}

.sidebar-topbar--custom {
  min-height: 5.9rem;
}

.sidebar-topbar--collapsed {
  min-height: 2.75rem;
}

.sidebar-user-card {
  display: flex;
  align-items: center;
  gap: 0.68rem;
  min-width: 0;
  padding: 0.08rem 0;
}

.sidebar-user-card :deep(a) {
  flex: none;
  margin-left: 0;
  padding: 0.45rem 0.55rem 0.45rem 0.48rem;
  border-left: 0;
  border-radius: 0.92rem;
  background:
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--sidebar-shell-accent) 10%, transparent) 0 3px,
      transparent 3px
    ),
    linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(248, 251, 255, 0.76) 100%);
  border: 1px solid color-mix(in srgb, var(--sidebar-shell-accent) 14%, var(--brand-surface-200));
}

.sidebar-user-card :deep(.navbar-profile__avatar.p-avatar) {
  width: 2.2rem;
  height: 2.2rem;
}

.sidebar-user-card__meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.sidebar-user-card__name {
  margin: 0;
  overflow: hidden;
  color: var(--brand-surface-900);
  font-size: 0.92rem;
  font-weight: 900;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-user-card__username {
  margin: 0;
  overflow: hidden;
  color: var(--brand-surface-500);
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-logout-area {
  border-top: 1px solid rgba(226, 232, 240, 0.86);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.58) 0%, rgba(248, 250, 252, 0.94) 100%);
}

@media (max-width: 768px) {
  .sidebar-shell {
    padding: 0.7rem 0.65rem 0.65rem;
  }

  .sidebar-topbar {
    min-height: 3.05rem;
    margin-bottom: 0.8rem;
  }

  .sidebar-topbar--custom {
    min-height: 4.75rem;
  }

  .sidebar-topbar--collapsed {
    min-height: 2.4rem;
  }

  .sidebar-user-card {
    gap: 0.55rem;
  }

  .sidebar-user-card :deep(a) {
    padding: 0.38rem 0.45rem 0.38rem 0.4rem;
    border-radius: 0.82rem;
  }

  .sidebar-user-card :deep(.navbar-profile__avatar.p-avatar) {
    width: 2rem;
    height: 2rem;
  }

  .sidebar-user-card__name {
    font-size: 0.86rem;
  }

  .sidebar-user-card__username {
    font-size: 0.68rem;
  }
}

@media (max-width: 480px) {
  .sidebar-shell {
    padding: 0.6rem 0.55rem 0.55rem;
  }

  .sidebar-topbar {
    min-height: 2.85rem;
    margin-bottom: 0.7rem;
  }

  .sidebar-topbar--custom {
    min-height: 4.35rem;
  }

  .sidebar-user-card {
    gap: 0.5rem;
  }

  .sidebar-user-card :deep(a) {
    padding: 0.34rem 0.4rem 0.34rem 0.35rem;
  }

  .sidebar-user-card :deep(.navbar-profile__avatar.p-avatar) {
    width: 1.85rem;
    height: 1.85rem;
  }

  .sidebar-user-card__name {
    font-size: 0.82rem;
  }

  .sidebar-user-card__username {
    font-size: 0.65rem;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
