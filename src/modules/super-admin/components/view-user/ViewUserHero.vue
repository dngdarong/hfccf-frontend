<script setup>
import { computed } from 'vue'
import Button from '@/components/buttons/Button.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import RolesBadge from '@/components/badges/RolesBadge.vue'

defineOptions({
  name: 'ViewUserHero',
})

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  bio: {
    type: String,
    default: '',
  },
  avatarSource: {
    type: String,
    default: '',
  },
  avatarInitials: {
    type: String,
    default: '?',
  },
  shouldShowAvatar: {
    type: Boolean,
    default: false,
  },
  statusTone: {
    type: String,
    default: 'info',
  },
  statusLabel: {
    type: String,
    default: '-',
  },
  refreshLabel: {
    type: String,
    default: 'Refresh',
  },
  backLabel: {
    type: String,
    default: 'Back to users',
  },
  editLabel: {
    type: String,
    default: 'Edit user',
  },
})

const emit = defineEmits(['refresh', 'back', 'edit', 'avatar-load', 'avatar-error'])

const bioText = computed(() => String(props.bio || '').trim())
</script>

<template>
  <div class="view-user-hero">
    <div class="view-user-hero__avatar-wrap">
      <div class="view-user-hero__avatar">
        <span v-if="!shouldShowAvatar" class="view-user-hero__avatar-initials">
          {{ avatarInitials }}
        </span>

        <img
          v-if="avatarSource"
          :src="avatarSource"
          :alt="`${user.name || 'User'} avatar`"
          class="view-user-hero__avatar-image"
          :class="{ 'view-user-hero__avatar-image--visible': shouldShowAvatar }"
          @load="emit('avatar-load')"
          @error="emit('avatar-error')"
        >
      </div>
    </div>

    <div class="view-user-hero__content">
      <div class="view-user-hero__identity">
        <p class="view-user-hero__eyebrow">Selected profile</p>
        <h1 class="view-user-hero__name">{{ user.fullName || user.name || '-' }}</h1>
        <p class="view-user-hero__subline">
          {{ user.username ? `@${user.username}` : user.email || '-' }}
        </p>
        <p v-if="bioText" class="view-user-hero__bio">
          {{ bioText }}
        </p>
      </div>

      <div class="view-user-hero__chips">
        <RolesBadge :role="user.role" />
        <StatusBadge :status="statusTone" :label="statusLabel" size="sm" />
        <span v-if="user.domain" class="view-user-hero__chip">{{ user.domain }}</span>
        <span v-if="user.scope" class="view-user-hero__chip">{{ user.scope }}</span>
      </div>

      <div class="view-user-hero__actions">
        <Button type="button" severity="secondary" outlined @click="emit('refresh')">
          {{ refreshLabel }}
        </Button>
        <Button type="button" severity="secondary" outlined @click="emit('back')">
          {{ backLabel }}
        </Button>
        <Button type="button" @click="emit('edit')">
          {{ editLabel }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.view-user-hero {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 1.25rem;
  align-items: center;
}

.view-user-hero__avatar {
  position: relative;
  width: 6rem;
  height: 6rem;
  overflow: hidden;
  border-radius: 9999px;
  background: linear-gradient(135deg, #0ea5e9, #155e75);
  box-shadow: 0 18px 34px -26px rgba(15, 23, 42, 0.45);
}

.view-user-hero__avatar-initials {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 1.6rem;
  font-weight: 900;
  letter-spacing: 0.06em;
}

.view-user-hero__avatar-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.view-user-hero__avatar-image--visible {
  opacity: 1;
}

.view-user-hero__content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.9rem;
}

.view-user-hero__identity {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.view-user-hero__eyebrow {
  margin: 0;
  color: #0f766e;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.view-user-hero__name {
  margin: 0;
  color: #0f172a;
  font-size: 1.5rem;
  font-weight: 900;
}

.view-user-hero__subline {
  margin: 0;
  color: #64748b;
  font-size: 0.92rem;
}

.view-user-hero__bio {
  margin: 0.35rem 0 0;
  max-width: 58rem;
  color: #334155;
  font-size: 0.92rem;
  line-height: 1.7;
  white-space: pre-line;
}

.view-user-hero__chips,
.view-user-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.view-user-hero__chip {
  display: inline-flex;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  background: #f8fafc;
  padding: 0.38rem 0.7rem;
  color: #334155;
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1;
}

@media (max-width: 768px) {
  .view-user-hero {
    grid-template-columns: 1fr;
    justify-items: start;
  }
}
</style>

