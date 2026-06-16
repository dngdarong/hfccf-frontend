<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'
import { useUserStore } from '@/store/userStore'
import { getAvatarInitials, resolveAvatarSource } from '@/utils/avatar'

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

const userStore = useUserStore()
const currentUser = computed(() => userStore.currentUser || {})
const hasImageError = ref(false)
const isImageLoaded = ref(false)
const { t } = useLanguage()

const displayName = computed(() => {
  if (props.name) return props.name

  const firstName = String(currentUser.value?.firstName || '').trim()
  const lastName = String(currentUser.value?.lastName || '').trim()
  const fullName = `${firstName} ${lastName}`.trim()

  return fullName || String(currentUser.value?.username || '').trim() || t('common.navigation.defaultUserName')
})

const displayUsername = computed(() => {
  if (props.username) return props.username

  const role = String(currentUser.value?.role || '').trim()
  if (role) return role

  const email = String(currentUser.value?.email || '').trim()
  if (email.includes('@')) return email.split('@')[0]

  return email || t('common.navigation.defaultUsername')
})

const resolvedAvatar = computed(() => {
  if (props.avatar) return resolveAvatarSource(props.avatar)

  return resolveAvatarSource(currentUser.value?.avatar)
})

const shouldShowImage = computed(() =>
  Boolean(resolvedAvatar.value) && Boolean(isImageLoaded.value) && !hasImageError.value,
)

const displayInitials = computed(() => {
  if (props.initials) return props.initials

  return getAvatarInitials(displayName.value, 'AU')
})

const avatarSize = computed(() => {
  if (props.size === 'sm') return 'normal'
  if (props.size === 'lg') return 'large'
  return 'normal'
})

const resolvedTo = computed(() => props.to || props.href || { name: 'profile-settings' })

watch(resolvedAvatar, () => {
  hasImageError.value = false
  isImageLoaded.value = false
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
      <div class="text-[0.88rem] leading-tight font-extrabold text-surface-900">
        {{ displayName }}
      </div>
      <div class="text-[0.72rem] font-semibold tracking-[0.02em] text-surface-500">
        {{ displayUsername }}
      </div>
    </div>

    <div class="relative flex">
      <div class="navbar-profile__avatar" :class="`navbar-profile__avatar--${avatarSize}`">
        <span
          v-if="!shouldShowImage"
          class="navbar-profile__avatar-initials"
        >
          {{ displayInitials }}
        </span>

        <img
          v-if="resolvedAvatar"
          :src="resolvedAvatar"
          :alt="displayName"
          class="navbar-profile__avatar-image"
          :class="{ 'navbar-profile__avatar-image--visible': shouldShowImage }"
          @load="isImageLoaded = true"
          @error="hasImageError = true"
        >
      </div>

      <div
        class="absolute right-0 bottom-0 h-3 w-3 rounded-full border-[2.5px] border-white shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
        :class="`navbar-profile__status-dot--${status}`"
      ></div>
    </div>
  </RouterLink>
</template>

<style scoped>
.navbar-profile__avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, var(--hope-cyan) 0%, #0087b8 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 174, 239, 0.2);
  border: 2px solid #fff;
  border-radius: 9999px;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
}

.navbar-profile__avatar--normal {
  width: 2.5rem;
  height: 2.5rem;
}

.navbar-profile__avatar--large {
  width: 3rem;
  height: 3rem;
}

.navbar-profile__avatar-initials {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.navbar-profile__avatar-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.navbar-profile__avatar-image--visible {
  opacity: 1;
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
