<script setup>
import { computed, ref, watch } from 'vue'
import QRCode from 'qrcode'
import logoSrc from '@/assets/images/logo.jpg'

const props = defineProps({
  player:       { type: Object,  required: true },
  teamName:     { type: String,  default: '' },
  division:     { type: String,  default: '' },
  season:       { type: String,  default: '' },
  orientation:  { type: String,  default: 'landscape' },
  lang:         { type: String,  default: 'en' },
  width:        { type: Number,  default: 300 },
  qrDataUrl:    { type: String,  default: '' },
})

const TEXT = {
  en: {
    school: 'HFCCF SPORT',
    tagline: 'Athletic Development Program',
    badge: 'COACH CARD',
    profile: 'COACH PROFILE',
    coachName: 'Coach Name',
    coachPhone: 'Coach Phone',
    playerRef: 'Player Reference',
    playerId: 'Player ID',
    team: 'Team',
    division: 'Division',
    note: 'Keep this side for communication and emergency contact.',
  },
  kh: {
    school: 'កីឡា HFCCF',
    tagline: 'កម្មវិធីលូតលាស់កីឡា',
    badge: 'កាតបាទ',
    profile: 'ព័ត៌មានបាទ',
    coachName: 'ឈ្មោះបាទ',
    coachPhone: 'លេខទូរស័ព្ទបាទ',
    playerRef: 'ព័ត៌មានកីឡាករ',
    playerId: 'លេខសម្គាល់',
    team: 'ក្រុម',
    division: 'ច្បាប់ការប្រកួតប្រជែង',
    note: 'រក្សាផ្នែកនេះសម្រាប់ទំនាក់ទំនងពេលដែលត្រូវការ។',
  },
}

const T = computed(() => TEXT[props.lang] || TEXT.en)

const isPortrait = computed(() => props.orientation === 'portrait')
const cardWmm = computed(() => isPortrait.value ? 54 : 85.6)
const cardHmm = computed(() => isPortrait.value ? 85.6 : 54)
const ppm = computed(() => props.width / cardWmm.value)
const mm = (v) => `${v * ppm.value}px`
const mmn = (v) => v * ppm.value
const pt = (v) => `${v * 0.3528 * ppm.value}px`

const cardPx = computed(() => ({
  width: `${props.width}px`,
  height: `${mmn(cardHmm.value)}px`,
}))

const HEADER_H = computed(() => isPortrait.value ? 20 : 14.5)
const BAR_H = 1.8
const FOOTER_H = 8.5
const bodyH = computed(() => cardHmm.value - HEADER_H.value - BAR_H - FOOTER_H)

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || '?'
}

const coachName = computed(() => props.player.coachName || props.player.coach_name || '—')
const coachPhone = computed(() => props.player.coachPhone || props.player.coach_phone || '—')
const playerName = computed(() => props.player.fullName || props.player.name || '—')
const playerCode = computed(() => props.player.publicId || props.player.playerCode || props.player.id || '—')
const coachInitials = computed(() => getInitials(coachName.value === '—' ? '' : coachName.value))
const codeSeed = computed(() => `${playerCode.value}-${coachPhone.value}`)
const qrDataUrlInternal = ref('')
const resolvedQrDataUrl = computed(() => props.qrDataUrl || qrDataUrlInternal.value)
const codeTitle = computed(() => `${T.value.playerId} / ${T.value.coachPhone}`)

watch(codeSeed, async (seed) => {
  try {
    qrDataUrlInternal.value = await QRCode.toDataURL(seed || 'HFCCF-SPORT', {
      errorCorrectionLevel: 'M',
      margin: 1,
      scale: 6,
      color: { dark: '#1e40af', light: '#ffffff' },
    })
  } catch {
    qrDataUrlInternal.value = ''
  }
}, { immediate: true })
</script>

<template>
  <div
    class="relative overflow-hidden rounded-[4px] border border-slate-200/80 bg-white shadow-lg select-none shrink-0"
    :style="cardPx"
  >
    <div
      class="absolute inset-x-0 top-0 overflow-hidden"
      :style="{ height: mm(HEADER_H), background: 'linear-gradient(135deg, #102d60 0%, #0a2450 60%, #071a3a 100%)' }"
    >
      <div class="pointer-events-none absolute rounded-full border-[1.5px] border-white/[0.06]"
        :style="{ width: mm(26), height: mm(26), right: mm(-9), top: mm(-12) }" />
      <div class="pointer-events-none absolute rounded-full border border-white/[0.05]"
        :style="{ width: mm(17), height: mm(17), right: mm(2), top: mm(-4) }" />

      <div v-if="!isPortrait" class="flex items-center h-full" :style="{ gap: mm(1.5), padding: `0 ${mm(2)}` }">
        <img :src="logoSrc" class="object-contain shrink-0" :style="{ width: mm(10.5), height: mm(10.5) }">
        <div class="flex-1 min-w-0 flex flex-col justify-center">
          <span class="font-bold text-white truncate leading-none" :style="{ fontSize: pt(7.2), marginBottom: mm(0.8) }">{{ T.school }}</span>
          <span class="text-sky-300 truncate leading-none" :style="{ fontSize: pt(5.2) }">{{ T.tagline }}</span>
        </div>
        <div class="border border-white/50 rounded bg-white/[0.07] font-bold text-white shrink-0" :style="{ fontSize: pt(4.7), padding: `${mmn(0.8)}px ${mmn(1.8)}px` }">
          {{ T.badge }}
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center h-full" :style="{ gap: mm(1) }">
        <img :src="logoSrc" class="object-contain shrink-0" :style="{ width: mm(10), height: mm(10) }">
        <span class="font-bold text-white leading-none" :style="{ fontSize: pt(7.2) }">{{ T.school }}</span>
        <span class="text-sky-300 leading-none" :style="{ fontSize: pt(5) }">{{ T.tagline }}</span>
      </div>
    </div>

    <div class="absolute inset-x-0 flex" :style="{ top: mm(HEADER_H), height: mm(BAR_H) }">
      <div class="flex-1 bg-[#22c55e]" />
      <div class="flex-1 bg-[#f97316]" />
      <div class="flex-1 bg-[#ef4444]" />
      <div class="flex-1 bg-[#3b82f6]" />
    </div>

    <div class="pointer-events-none absolute inset-0 opacity-60">
      <div class="absolute right-[-18px] top-[78px] h-36 w-36 rounded-full border border-slate-200/70" />
      <div class="absolute right-[-30px] top-[110px] h-52 w-52 rounded-full border border-slate-100/80" />
      <div class="absolute left-[-20px] top-[146px] h-24 w-24 rounded-full border border-slate-100/70" />
    </div>

    <div class="absolute inset-x-0 flex" :style="{ top: mm(HEADER_H + BAR_H), height: mm(bodyH) }">
      <template v-if="!isPortrait">
        <div class="flex h-full w-full gap-0" :style="{ padding: `${mmn(1.8)}px ${mmn(2)}px` }">
          <div class="flex flex-col justify-between shrink-0" :style="{ width: mm(29.5) }">
            <div class="flex flex-col items-center">
              <div class="rounded-full overflow-hidden bg-blue-50 flex items-center justify-center ring-[1.5px] ring-blue-400 shadow-sm"
                :style="{ width: mm(22.5), height: mm(22.5) }">
                <span class="font-bold text-blue-800" :style="{ fontSize: pt(8.8) }">{{ coachInitials }}</span>
              </div>
              <div class="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700 mt-2">
                {{ T.profile }}
              </div>
            </div>

            <div class="rounded-[16px] border border-slate-200/80 bg-white p-3 shadow-[0_6px_18px_rgba(15,23,42,0.05)]">
              <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{{ T.note }}</p>
              <p class="mt-2 text-[11px] leading-snug text-slate-500">
                {{ coachName }} · {{ coachPhone }}
              </p>
            </div>
          </div>

          <div class="mx-4 w-px shrink-0" :style="{ background: 'linear-gradient(to bottom, transparent, #dbe4f0 18%, #dbe4f0 82%, transparent)' }" />

          <div class="flex-1 flex flex-col justify-center overflow-hidden" :style="{ padding: `${mmn(0.8)}px 0` }">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <p class="font-bold text-slate-900 truncate leading-tight" :style="{ fontSize: pt(8.2), marginBottom: mm(0.6) }">{{ coachName }}</p>
                <p class="text-slate-500 leading-none" :style="{ fontSize: pt(4.5), marginBottom: mm(1.2) }">{{ T.coachPhone }} · {{ coachPhone }}</p>
                <div class="rounded-full" :style="{ width: mm(9), height: mm(0.65), background: 'linear-gradient(to right, #2563eb, #60a5fa)' }" />
              </div>
              <div class="shrink-0 rounded-[18px] border border-slate-200/80 bg-slate-50 p-2 shadow-[0_8px_18px_rgba(15,23,42,0.06)]" :style="{ width: mm(18), height: mm(18) }">
                <img
                  :src="resolvedQrDataUrl"
                  :alt="codeTitle"
                  class="h-full w-full rounded-[4px] bg-white object-contain"
                >
              </div>
            </div>

            <div class="mt-3 grid grid-cols-2 gap-2">
              <div class="rounded-[14px] border border-slate-200/80 bg-white px-3 py-2 shadow-[0_6px_16px_rgba(15,23,42,0.04)]">
                <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.4) }">{{ T.coachName }}</p>
                <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.6) }">{{ coachName }}</p>
              </div>
              <div class="rounded-[14px] border border-slate-200/80 bg-white px-3 py-2 shadow-[0_6px_16px_rgba(15,23,42,0.04)]">
                <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.4) }">{{ T.playerId }}</p>
                <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.6) }">{{ playerCode }}</p>
              </div>
              <div class="rounded-[14px] border border-slate-200/80 bg-white px-3 py-2 shadow-[0_6px_16px_rgba(15,23,42,0.04)]">
                <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.4) }">{{ T.playerRef }}</p>
                <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.6) }">{{ playerName }}</p>
              </div>
              <div class="rounded-[14px] border border-slate-200/80 bg-white px-3 py-2 shadow-[0_6px_16px_rgba(15,23,42,0.04)]">
                <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.4) }">{{ T.team }}</p>
                <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.6) }">{{ teamName || '—' }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="w-full flex flex-col items-center overflow-hidden" :style="{ paddingTop: mm(2) }">
          <div class="rounded-full overflow-hidden bg-blue-50 flex items-center justify-center ring-[1.5px] ring-blue-400 shrink-0"
            :style="{ width: mm(22), height: mm(22) }">
            <span class="font-bold text-blue-800" :style="{ fontSize: pt(8.8) }">{{ coachInitials }}</span>
          </div>
          <div class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mt-2">
            {{ T.profile }}
          </div>
          <p class="font-bold text-slate-900 truncate max-w-full leading-tight" :style="{ fontSize: pt(8), marginTop: mm(2), paddingInline: mm(3) }">{{ coachName }}</p>
          <div class="border-t border-slate-200 self-stretch" :style="{ margin: `${mmn(2)}px ${mmn(4)}px` }" />
          <div class="grid grid-cols-2 self-stretch" :style="{ paddingInline: mm(5), rowGap: mm(1.5), columnGap: mm(2) }">
            <div>
              <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.5) }">{{ T.coachName }}</p>
              <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.5) }">{{ coachName }}</p>
            </div>
            <div>
              <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.5) }">{{ T.coachPhone }}</p>
              <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.5) }">{{ coachPhone }}</p>
            </div>
            <div>
              <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.5) }">{{ T.playerRef }}</p>
              <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.5) }">{{ playerName }}</p>
            </div>
            <div>
              <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.5) }">{{ T.playerId }}</p>
              <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.5) }">{{ playerCode }}</p>
            </div>
            <div>
              <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.5) }">{{ T.team }}</p>
              <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.5) }">{{ teamName || '—' }}</p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="absolute inset-x-0 bottom-0 flex items-center justify-center border-t border-blue-200/70" :style="{ height: mm(FOOTER_H), background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }">
      <span class="font-bold text-blue-800" :style="{ fontSize: pt(isPortrait ? 5.5 : 6) }">
        {{ T.note }}
      </span>
    </div>
  </div>
</template>
