<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'AddTeamIntro',
})

defineProps({
  divisionLabel: {
    type: String,
    default: '',
  },
  statusLabel: {
    type: String,
    default: '',
  },
})

const { t, language } = useLanguage()
const isKh = computed(() => language.value === 'KH')
const eyebrow = computed(() => t('sportAddTeam.title'))
const summary = computed(() => t('sportAddTeam.summary'))
</script>

<template>
  <div :class="isKh ? 'add-team-intro add-team-intro--kh' : 'add-team-intro'">
    <div>
      <p class="add-team-intro__eyebrow">{{ eyebrow }}</p>
      <p class="add-team-intro__summary">{{ summary }}</p>
    </div>

    <div class="add-team-intro__tags">
      <span class="add-team-intro__tag add-team-intro__tag--division">
        {{ divisionLabel }}
      </span>
      <span class="add-team-intro__tag add-team-intro__tag--status">
        {{ statusLabel }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.add-team-intro {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border: 1px solid #e7eaf3;
  border-radius: 1rem;
  background: linear-gradient(180deg, rgba(248, 251, 255, 1) 0%, rgba(255, 255, 255, 1) 100%);
}

.add-team-intro__eyebrow {
  margin: 0;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.add-team-intro__summary {
  margin: 0.25rem 0 0;
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.6;
}

.add-team-intro__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.add-team-intro__tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.74rem;
  font-weight: 600;
}

.add-team-intro__tag--division {
  border: 1px solid #bae6fd;
  background: #ecfeff;
  color: #0369a1;
}

.add-team-intro__tag--status {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
}

.add-team-intro--kh .add-team-intro__eyebrow,
.add-team-intro--kh .add-team-intro__summary,
.add-team-intro--kh .add-team-intro__tag {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

.add-team-intro--kh .add-team-intro__eyebrow {
  letter-spacing: 0.01em;
  text-transform: none;
}

.add-team-intro--kh .add-team-intro__summary {
  line-height: 1.7;
}
</style>
