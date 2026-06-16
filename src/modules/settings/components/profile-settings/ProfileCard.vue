<script setup>
import { computed, ref, watch } from 'vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { updateAuthenticatedUserProfile } from '@/services/auth'
import { getAvatarInitials, resolveAvatarSource } from '@/utils/avatar'
import { optimizeImageFile } from '@/utils/imageOptimization'

const { t, te } = useLanguage()

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

const hasImageError = ref(false)
const isImageLoaded = ref(false)
const isUploadingAvatar = ref(false)
const avatarInputRef = ref(null)
const requestError = ref('')

/**
 * Prefer a safe uploaded avatar or a bundled local avatar.
 * If that still fails, the initials fallback below keeps the card stable.
 */
const avatarUrl = computed(() =>
  resolveAvatarSource(
    props.user.avatar ||
      props.user.avatarUrl ||
      props.user.profilePhotoUrl ||
      props.user.photo,
    { fallbackToAsset: true },
  ),
)

const shouldShowImage = computed(() =>
  Boolean(avatarUrl.value) && Boolean(isImageLoaded.value) && !hasImageError.value,
)

const displayName = computed(() =>
  String(
    props.user.fullName ||
      props.user.name ||
      [props.user.firstName, props.user.lastName].filter(Boolean).join(' ') ||
      props.user.username ||
      'User',
  ).trim(),
)

const avatarInitials = computed(() => getAvatarInitials(displayName.value, 'U'))

watch(avatarUrl, () => {
  hasImageError.value = false
  isImageLoaded.value = false
})

function onAvatarLoad() {
  isImageLoaded.value = true
}

function onAvatarError() {
  hasImageError.value = true
  isImageLoaded.value = false
}

function openAvatarPicker() {
  avatarInputRef.value?.click()
}

async function onAvatarChange(event) {
  const [file] = event?.target?.files || []

  if (!file || isUploadingAvatar.value) return

  requestError.value = ''
  isUploadingAvatar.value = true

  try {
    const optimizedFile = await optimizeImageFile(file, {
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.84,
    }).catch(() => file)

    await updateAuthenticatedUserProfile({
      avatar: optimizedFile,
    })
  } catch (error) {
    requestError.value = error?.message || t('common.error')
  } finally {
    isUploadingAvatar.value = false

    if (event?.target) {
      event.target.value = ''
    }
  }
}

const roleLabel = computed(() => {
  const normalizedRole = String(props.user.role || '').trim()

  if (!normalizedRole) {
    return '-'
  }

  const roleKey = normalizedRole.toLowerCase().replace(/[\s-]+/g, '_')
  const translationKey = `common.role.${roleKey}`

  if (te(translationKey)) {
    return t(translationKey)
  }

  return props.user.role || '-'
})

const statusLabel = computed(() => {
  const normalizedStatus = String(props.user.status || '').trim()

  if (!normalizedStatus) {
    return '-'
  }

  const statusKey = normalizedStatus.toLowerCase()
  const translated = t(`common.status.${statusKey}`)
  return translated === `common.status.${statusKey}` ? props.user.status : translated
})

const bioText = computed(() => String(props.user.bio || '').trim())
const departmentLabel = computed(() => String(props.user.department || '-').trim() || '-')
const contactItems = computed(() => [
  { label: t('pages.profile.general.username'), value: props.user.username || '-' },
  { label: t('pages.profile.general.email'), value: props.user.email || '-' },
  { label: t('pages.profile.general.phone'), value: props.user.phone || '-' },
  { label: t('pages.profile.general.department'), value: departmentLabel.value },
])
</script>

<template>
  <div
    class="relative overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white p-6 text-center shadow-[0_16px_34px_-28px_rgba(15,23,42,0.45)]"
  >
    <div class="absolute left-0 top-0 h-24 w-full bg-[linear-gradient(135deg,#0ea5e9_0%,#0f766e_100%)]"></div>

    <div class="relative mb-4 mt-12">
      <div class="relative mx-auto h-24 w-24 rounded-full bg-white p-1.5 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.45)]">
        <div
          v-if="!shouldShowImage"
          class="flex h-full w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#0891b2_0%,#155e75_100%)] text-lg font-extrabold uppercase tracking-[0.08em] text-white"
        >
          {{ avatarInitials }}
        </div>

        <img
          v-if="avatarUrl"
          id="profileAvatar"
          class="absolute inset-0 h-full w-full rounded-full object-cover opacity-0 transition-opacity duration-150"
          :class="{ 'opacity-100': shouldShowImage }"
          :src="avatarUrl"
          :alt="user.name"
          @load="onAvatarLoad"
          @error="onAvatarError"
        />
      </div>
      <input
        ref="avatarInputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="onAvatarChange"
      >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="absolute bottom-0 right-1/2 translate-x-10 translate-y-2 rounded-full border border-gray-100 bg-white p-1.5 text-gray-600 shadow-sm transition-colors hover:text-hope-cyan"
        :loading="isUploadingAvatar"
        :disabled="isUploadingAvatar"
        @click="openAvatarPicker"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          ></path>
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          ></path>
        </svg>
      </Button>
    </div>

    <h2 id="profileDisplayName" class="text-xl font-bold text-hope-dark">{{ displayName }}</h2>
    <p id="profileDisplayRole" class="mb-4 text-sm text-gray-500">{{ roleLabel }}</p>

    <div class="mb-6 flex flex-wrap justify-center gap-2">
      <span
        class="rounded-full border border-hope-lime/20 bg-hope-lime/10 px-3 py-1 text-xs font-semibold text-hope-lime"
      >
        {{ statusLabel }}
      </span>
      <span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
        {{ location }}
      </span>
    </div>

    <div class="space-y-4 border-t border-slate-100 pt-4 text-left">
      <div
        v-if="requestError"
        class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
      >
        {{ requestError }}
      </div>

      <div class="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div
          v-for="item in contactItems"
          :key="item.label"
          class="flex items-center justify-between gap-4"
        >
          <span class="text-[0.76rem] font-bold uppercase tracking-[0.08em] text-slate-500">
            {{ item.label }}
          </span>
          <span class="max-w-[68%] truncate text-sm font-semibold text-slate-800">
            {{ item.value }}
          </span>
        </div>
      </div>

      <div v-if="bioText" class="space-y-1 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p class="text-[0.76rem] font-bold uppercase tracking-[0.08em] text-slate-500">
          {{ t('pages.profile.general.bio') }}
        </p>
        <p id="profileDisplayBio" class="whitespace-pre-line break-words text-sm leading-6 text-slate-700">
          {{ bioText }}
        </p>
      </div>
    </div>
  </div>
</template>
