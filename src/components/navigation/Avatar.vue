<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import PrimeAvatar from 'primevue/avatar'
import { getCurrentUser } from '@/services/auth'
import users from '@/mocks/users.json'

defineOptions({
  name: 'UserAvatar',
})

const props = defineProps({
  name: String,
  username: String,
  avatar: String,
  initials: String,
  size: {
    type: String,
    default: 'md',
  },
  status: {
    type: String,
    default: 'online',
  },
  to: {
    type: [String, Object],
    default: null,
  },
  href: {
    type: [String, Object],
    default: null,
  },
  showMeta: {
    type: Boolean,
    default: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const currentUser = computed(() => getCurrentUser() || {})
const hasImageError = ref(false)

const matchedMockUser = computed(() => {
  const currentId = String(currentUser.value?.id || '').trim()
  const currentEmail = String(currentUser.value?.email || '').trim().toLowerCase()
  const currentUsername = String(currentUser.value?.username || '').trim().toLowerCase()

  return (
    users.find((user) => String(user.id || '').trim() === currentId) ||
    users.find((user) => String(user.email || '').trim().toLowerCase() === currentEmail) ||
    users.find((user) => String(user.username || '').trim().toLowerCase() === currentUsername) ||
    null
  )
})

const displayName = computed(() => {
  const firstName = String(currentUser.value?.firstName || '').trim()
  const lastName = String(currentUser.value?.lastName || '').trim()
  const fullName = `${lastName} ${firstName}`.trim()
  if (fullName) return fullName
  return props.name || String(currentUser.value?.username || '').trim() || 'Admin User'
})

const displayUsername = computed(() => {
  if (props.username) return props.username
  const role = String(currentUser.value?.role || '').trim()
  if (role) return role
  const email = String(currentUser.value?.email || '').trim()
  if (email.includes('@')) return email.split('@')[0]
  return email || 'user'
})

const resolvedAvatar = computed(() => {
  if (props.avatar) return props.avatar
  return (
    String(currentUser.value?.avatar || '').trim() || String(matchedMockUser.value?.avatar || '').trim()
  )
})

const displayAvatar = computed(() => (hasImageError.value ? '' : resolvedAvatar.value))

const displayInitials = computed(() => {
  if (props.initials) return props.initials
  return (
    displayName.value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'AU'
  )
})

const avatarSize = computed(() => {
  if (props.size === 'sm') return 'normal'
  if (props.size === 'lg') return 'large'
  return 'normal'
})
const resolvedTo = computed(() => props.to || props.href || { name: 'profile-settings' })

watch(resolvedAvatar, () => {
  hasImageError.value = false
})
</script>

<template>
  <RouterLink
    :to="resolvedTo"
    class="flex items-center gap-3 rounded-2xl text-inherit no-underline transition-all duration-200 hover:-translate-y-px hover:bg-slate-100/80"
    :class="
      compact
        ? 'justify-center p-1'
        : 'ml-2.5 border-l border-surface-200 px-[1rem] py-[0.35rem] max-sm:ml-0 max-sm:border-l-0 max-sm:p-1'
    "
  >
    <div v-if="showMeta" class="text-right max-sm:hidden">
      <div class="text-[0.88rem] leading-tight font-extrabold text-surface-900">{{ displayName }}</div>
      <div class="text-[0.72rem] font-semibold tracking-[0.02em] text-surface-500">
        {{ displayUsername }}
      </div>
    </div>
    <div class="relative flex">
      <PrimeAvatar
        :label="displayAvatar ? undefined : displayInitials"
        :image="displayAvatar || undefined"
        shape="circle"
        :size="avatarSize"
        class="navbar-profile__avatar"
        @image-error="hasImageError = true"
      />
      <div
        class="absolute right-0 bottom-0 h-3 w-3 rounded-full border-[2.5px] border-white shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
        :class="`navbar-profile__status-dot--${status}`"
      ></div>
    </div>
  </RouterLink>
</template>

<style scoped>
:deep(.navbar-profile__avatar.p-avatar) {
  background: linear-gradient(135deg, var(--hope-cyan) 0%, #0087b8 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 174, 239, 0.2);
  border: 2px solid #fff;
}

.navbar-profile__status-dot--online {
  background: #22c55e;
}

.navbar-profile__status-dot--away {
  background: #f59e0b;
}

.navbar-profile__status-dot--offline {
  background: #94a3b8;
}
</style>
