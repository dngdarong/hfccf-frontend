<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

const { t } = useLanguage()

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  location: {
    type: String,
    default: 'Phnom Penh',
  },
})

const avatarUrl = computed(() => {
  if (props.user.avatar) return props.user.avatar
  const name = encodeURIComponent(props.user.name || 'User')
  return `https://ui-avatars.com/api/?name=${name}&background=00AEEF&color=fff&size=128`
})

const roleLabel = computed(() => {
  const roleKey = props.user.role?.toLowerCase().replace(/\s+/g, '') || 'user'
  const translated = t(`common.role.${roleKey}`)
  return translated === `common.role.${roleKey}` ? props.user.role : translated
})

const statusLabel = computed(() => {
  const statusKey = props.user.status?.toLowerCase() || 'active'
  const translated = t(`common.status.${statusKey}`)
  return translated === `common.status.${statusKey}` ? props.user.status : translated
})
</script>

<template>
  <div
    class="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm"
  >
    <div class="absolute left-0 top-0 h-24 w-full bg-gradient-to-r from-hope-cyan to-blue-500"></div>

    <div class="relative mb-4 mt-12">
      <div class="mx-auto h-24 w-24 rounded-full bg-white p-1 shadow-md">
        <img
          id="profileAvatar"
          class="h-full w-full rounded-full object-cover"
          :src="avatarUrl"
          :alt="user.name"
        />
      </div>
      <button
        type="button"
        class="absolute bottom-0 right-1/2 translate-x-10 translate-y-2 rounded-full border border-gray-100 bg-white p-1.5 text-gray-600 shadow-sm transition-colors hover:text-hope-cyan"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          ></path>
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          ></path>
        </svg>
      </button>
    </div>

    <h2 id="profileDisplayName" class="text-xl font-bold text-hope-dark">{{ user.name }}</h2>
    <p id="profileDisplayRole" class="mb-4 text-sm text-gray-500">{{ roleLabel }}</p>

    <div class="mb-6 flex justify-center gap-2">
      <span
        class="rounded-full border border-hope-lime/20 bg-hope-lime/10 px-3 py-1 text-xs font-semibold text-hope-lime"
      >
        {{ statusLabel }}
      </span>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
        {{ location }}
      </span>
    </div>

    <div class="space-y-3 border-t border-gray-100 pt-4 text-left">
      <div v-if="user.bio" class="space-y-1 text-sm text-gray-600">
        <p class="font-semibold text-hope-dark">{{ t('pages.profile.general.bio') }}</p>
        <p id="profileDisplayBio" class="whitespace-pre-line break-words">{{ user.bio }}</p>
      </div>
      <div class="flex items-center gap-3 text-sm text-gray-600">
        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          ></path>
        </svg>
        <span id="profileDisplayEmail" class="break-all">{{ user.email }}</span>
      </div>
      <div v-if="user.phone" class="flex items-center gap-3 text-sm text-gray-600">
        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          ></path>
        </svg>
        <span id="profileDisplayPhone">{{ user.phone }}</span>
      </div>
    </div>
  </div>
</template>
