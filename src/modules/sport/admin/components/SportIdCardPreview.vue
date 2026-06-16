<script setup>
import { computed } from 'vue'
import logoSrc from '@/assets/images/logo.jpg'

const props = defineProps({
  player:       { type: Object,  required: true },
  teamName:     { type: String,  default: '' },
  division:     { type: String,  default: '' },
  season:       { type: String,  default: '' },
  orientation:  { type: String,  default: 'landscape' },
  lang:         { type: String,  default: 'en' },
  width:        { type: Number,  default: 300 },
  photoSrc:     { type: String,  default: '' },
})

const CARD_TEXT = {
  en: {
    school: 'HFCCF SPORT',
    tagline: 'Athletic Development Program',
    badge: 'PLAYER ID CARD',
    playerId: 'Player ID',
    team: 'Team',
    division: 'Division',
    dob: 'DOB',
    male: 'MALE',
    female: 'FEMALE',
    season: 'Season',
  },
  kh: {
    school: 'កីឡា HFCCF',
    tagline: 'កម្មវិធីលូតលាស់កីឡា',
    badge: 'បណ្ណសម្គាល់កីឡាករ',
    playerId: 'លេខសម្គាល់',
    team: 'ក្រុម',
    division: 'ច្បាប់ការប្រកួតប្រជែង',
    dob: 'ថ្ងៃកំណើត',
    male: 'ប្រុស',
    female: 'ស្រី',
    season: 'រដូវ',
  },
}

const T = computed(() => CARD_TEXT[props.lang] || CARD_TEXT.en)

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
const BODY_H = computed(() => cardHmm.value - HEADER_H.value - BAR_H - FOOTER_H)

const AV_R = computed(() => isPortrait.value ? 10 : 11.5)

const name = computed(() => props.player.fullName || props.player.name || '—')
const pid = computed(() => props.player.publicId || props.player.playerCode || props.player.id || '—')
const photoUrl = computed(() => props.photoSrc || props.player.avatarUrl || '')
const initials = computed(() =>
  name.value.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?',
)
const hasGender = computed(() => !!props.player.gender)
const isMale = computed(() => props.player.gender?.toLowerCase().startsWith('m') ?? true)
</script>

<template>
  <div
    class="relative overflow-hidden rounded-[4px] border border-slate-200/80 bg-white shadow-lg select-none shrink-0"
    :style="cardPx"
  >
    <!-- HEADER -->
    <div
      class="absolute inset-x-0 top-0 overflow-hidden"
      :style="{ height: mm(HEADER_H), background: 'linear-gradient(135deg, #102d60 0%, #0a2450 60%, #071a3a 100%)' }"
    >
      <div class="pointer-events-none absolute rounded-full border-[1.5px] border-white/[0.06]"
        :style="{ width: mm(26), height: mm(26), right: mm(-9), top: mm(-12) }" />
      <div class="pointer-events-none absolute rounded-full border border-white/[0.05]"
        :style="{ width: mm(17), height: mm(17), right: mm(2), top: mm(-4) }" />

      <!-- Landscape header -->
      <div v-if="!isPortrait" class="flex items-center h-full" :style="{ gap: mm(1.5), padding: `0 ${mm(2)}` }">
        <img
          :src="logoSrc"
          class="object-contain shrink-0 drop-shadow-sm"
          :style="{ width: mm(10), height: mm(10) }"
        />
        <div class="flex-1 min-w-0 flex flex-col justify-center">
          <span class="font-bold text-white truncate leading-none" :style="{ fontSize: pt(7.2), marginBottom: mm(0.6) }">{{ T.school }}</span>
          <span class="text-sky-300 truncate leading-none" :style="{ fontSize: pt(5.1) }">{{ T.tagline }}</span>
        </div>
        <div
          class="rounded-full border border-white/40 bg-white/[0.08] font-bold text-white shrink-0 shadow-sm"
          :style="{ fontSize: pt(4.4), padding: `${mmn(0.85)}px ${mmn(1.8)}px` }"
        >
          {{ T.badge }}
        </div>
      </div>

      <!-- Portrait header -->
      <div v-else class="flex flex-col items-center justify-center h-full" :style="{ gap: mm(1) }">
        <img
          :src="logoSrc"
          class="object-contain shrink-0 drop-shadow-sm"
          :style="{ width: mm(10), height: mm(10) }"
        />
        <span class="font-bold text-white leading-none" :style="{ fontSize: pt(7.5) }">{{ T.school }}</span>
        <span class="text-sky-300 leading-none" :style="{ fontSize: pt(5) }">{{ T.tagline }}</span>
      </div>
    </div>

    <!-- ACCENT BAR -->
    <div
      class="absolute inset-x-0 flex"
      :style="{ top: mm(HEADER_H), height: mm(BAR_H) }"
    >
      <div class="flex-1 bg-[#22c55e]" />
      <div class="flex-1 bg-[#f97316]" />
      <div class="flex-1 bg-[#ef4444]" />
      <div class="flex-1 bg-[#3b82f6]" />
    </div>

    <!-- BODY -->
    <div
      class="absolute inset-x-0 flex"
      :style="{ top: mm(HEADER_H + BAR_H), height: mm(BODY_H) }"
    >
      <!-- Landscape -->
      <template v-if="!isPortrait">
        <div class="flex h-full w-full gap-0" :style="{ padding: `${mmn(1.8)}px ${mmn(2)}px` }">
          <div class="flex flex-col items-center justify-center shrink-0" :style="{ width: mm(30) }">
            <div class="rounded-[999px] bg-white p-[2px] shadow-[0_6px_14px_rgba(15,23,42,0.12)]">
              <div
                class="rounded-full overflow-hidden bg-blue-100 flex items-center justify-center"
                :style="{
                  width: mm(AV_R * 2), height: mm(AV_R * 2),
                  boxShadow: `inset 0 0 0 ${mmn(0.8)}px rgba(255,255,255,0.7)`,
                }"
              >
                <img v-if="photoUrl" :src="photoUrl" class="w-full h-full object-cover" />
                <span v-else class="font-bold text-blue-800" :style="{ fontSize: pt(initials.length > 2 ? 8.5 : 11) }">
                  {{ initials }}
                </span>
              </div>
            </div>
            <div
              v-if="hasGender"
              class="mt-2 rounded-full font-bold leading-none shadow-sm"
              :style="{
                fontSize: pt(4.5),
                padding: `${mmn(0.7)}px ${mmn(2.2)}px`,
                background: isMale ? '#eef2ff' : '#fdf2f8',
                color: isMale ? '#4338ca' : '#be185d',
              }"
            >{{ isMale ? T.male : T.female }}</div>
            <div class="mt-2 rounded-full bg-sky-50 px-3 py-1 text-[10px] font-semibold tracking-wide text-sky-700">
              Player
            </div>
          </div>

          <div
            class="mx-4 w-px shrink-0"
            :style="{ background: 'linear-gradient(to bottom, transparent, #dbe4f0 18%, #dbe4f0 82%, transparent)' }"
          />

          <div class="flex-1 flex flex-col justify-center overflow-hidden" :style="{ padding: `${mmn(0.8)}px 0` }">
            <p
              class="font-extrabold text-slate-900 truncate leading-tight"
              :style="{ fontSize: pt(8.7), marginBottom: mm(0.5) }"
            >{{ name }}</p>
            <p class="text-slate-500 leading-none" :style="{ fontSize: pt(4.5), marginBottom: mm(1.3) }">
              {{ T.badge }}
            </p>
            <div
              class="rounded-full"
              :style="{ width: mm(9), height: mm(0.65), marginBottom: mm(1.4), background: 'linear-gradient(to right, #2563eb, #60a5fa)' }"
            />

            <div class="grid grid-cols-2 gap-2">
              <div class="rounded-[14px] border border-slate-200/80 bg-white px-3 py-2 shadow-[0_6px_16px_rgba(15,23,42,0.04)]">
                <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.4) }">{{ T.playerId }}</p>
                <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.9) }">{{ pid }}</p>
              </div>
              <div class="rounded-[14px] border border-slate-200/80 bg-white px-3 py-2 shadow-[0_6px_16px_rgba(15,23,42,0.04)]">
                <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.4) }">{{ T.team }}</p>
                <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.9) }">{{ teamName || '—' }}</p>
              </div>
              <div class="rounded-[14px] border border-slate-200/80 bg-white px-3 py-2 shadow-[0_6px_16px_rgba(15,23,42,0.04)]">
                <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.4) }">{{ T.division }}</p>
                <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.9) }">{{ division || '—' }}</p>
              </div>
              <div class="rounded-[14px] border border-slate-200/80 bg-white px-3 py-2 shadow-[0_6px_16px_rgba(15,23,42,0.04)]">
                <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.4) }">{{ T.dob }}</p>
                <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.9) }">{{ player.dateOfBirth || '—' }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Portrait -->
      <template v-else>
        <div class="w-full flex flex-col items-center overflow-hidden" :style="{ paddingTop: mm(2) }">
          <div
            class="rounded-full overflow-hidden bg-blue-100 flex items-center justify-center shrink-0"
            :style="{
              width: mm(AV_R * 2), height: mm(AV_R * 2),
              boxShadow: `0 0 0 ${mmn(0.7)}px #fff, 0 0 0 ${mmn(1.6)}px #60a5fa, 0 ${mmn(1)}px ${mmn(3)}px rgba(59,130,246,0.25)`,
            }"
          >
            <img v-if="photoUrl" :src="photoUrl" class="w-full h-full object-cover" />
            <span v-else class="font-bold text-blue-800" :style="{ fontSize: pt(initials.length > 2 ? 7.5 : 9.5) }">
              {{ initials }}
            </span>
          </div>

          <div
            v-if="hasGender"
            class="rounded-full font-bold leading-none shrink-0"
            :style="{
              fontSize: pt(4.8),
              padding: `${mmn(0.6)}px ${mmn(2.5)}px`,
              marginTop: mm(1.5),
              background: isMale ? '#ede9fe' : '#fce7f3',
              color: isMale ? '#6d28d9' : '#be185d',
            }"
          >{{ isMale ? T.male : T.female }}</div>

          <p
            class="font-extrabold text-slate-900 truncate max-w-full leading-tight"
            :style="{ fontSize: pt(8), marginTop: mm(2), paddingInline: mm(3) }"
          >{{ name }}</p>
          <div
            class="rounded-full self-center"
            :style="{ width: mm(8), height: mm(0.6), marginTop: mm(0.8), marginBottom: mm(0.5), background: 'linear-gradient(to right, #3b82f6, #93c5fd)' }"
          />

          <div
            class="self-stretch"
            :style="{
              height: '1px',
              margin: `${mmn(1.5)}px ${mmn(4)}px`,
              background: 'linear-gradient(to right, transparent, #cbd5e1 30%, #cbd5e1 70%, transparent)',
            }"
          />

          <div
            class="grid grid-cols-2 self-stretch"
            :style="{ paddingInline: mm(5), rowGap: mm(1.5), columnGap: mm(2) }"
          >
            <div>
              <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.5) }">{{ T.playerId }}</p>
              <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.5) }">{{ pid }}</p>
            </div>
            <div v-if="division">
              <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.5) }">{{ T.division }}</p>
              <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.5) }">{{ division }}</p>
            </div>
            <div>
              <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.5) }">{{ T.team }}</p>
              <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.5) }">{{ teamName || '—' }}</p>
            </div>
            <div v-if="player.dateOfBirth">
              <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.5) }">{{ T.dob }}</p>
              <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.5) }">{{ player.dateOfBirth }}</p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- FOOTER -->
    <div
      class="absolute inset-x-0 bottom-0 flex items-center justify-center border-t border-blue-200/70"
      :style="{ height: mm(FOOTER_H), background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }"
    >
      <span class="font-bold text-blue-800" :style="{ fontSize: pt(isPortrait ? 5.5 : 6) }">
        {{ T.season }}&nbsp;&nbsp;{{ season }}
      </span>
    </div>
  </div>
</template>
