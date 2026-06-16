<script setup>
/**
 * IdCardPreview — renders one ID card as HTML, pixel-perfect relative to `width`.
 * All measurements derived from mm values (matching the PDF renderer).
 */
import { computed } from 'vue'
import logoSrc from '@/assets/images/logo.jpg'

const props = defineProps({
  student:      { type: Object,  required: true },
  className:    { type: String,  default: '' },
  classLevel:   { type: String,  default: '' },
  academicYear: { type: String,  default: '' },
  orientation:  { type: String,  default: 'landscape' }, // 'landscape' | 'portrait'
  lang:         { type: String,  default: 'en' },        // 'en' | 'kh'
  width:        { type: Number,  default: 300 },         // rendered px width
  photoSrc:     { type: String,  default: '' },
})

const CARD_TEXT = {
  en: {
    school: 'HFCCF PRESCHOOL', tagline: 'Hope for Cambodian Children',
    badge: 'STUDENT ID CARD', studentId: 'Student ID', class: 'Class',
    grade: 'Grade', dob: 'DOB', male: 'MALE', female: 'FEMALE', academicYear: 'Academic Year',
  },
  kh: {
    school: 'សាលាមត្តេយ្យ HFCCF', tagline: 'សង្ឃឹមសម្រាប់កុមារកម្ពុជា',
    badge: 'អត្តសញ្ញាណបណ្ណ', studentId: 'លេខសម្គាល់', class: 'ថ្នាក់',
    grade: 'ថ្នាក់ទី', dob: 'ថ្ងៃកំណើត', male: 'ប្រុស', female: 'ស្រី', academicYear: 'ឆ្នាំសិក្សា',
  },
}

const T = computed(() => CARD_TEXT[props.lang] || CARD_TEXT.en)

// ── Shared constants ──────────────────────────────────────────────────────────
const ACCENT = ['#22c55e', '#f97316', '#ef4444', '#3b82f6']

// ── Geometry ──────────────────────────────────────────────────────────────────
const isPortrait = computed(() => props.orientation === 'portrait')
const cardWmm    = computed(() => isPortrait.value ? 54    : 85.6)
const cardHmm    = computed(() => isPortrait.value ? 85.6  : 54)
const ppm        = computed(() => props.width / cardWmm.value)   // pixels per mm

// Call these in the template — Vue tracks ppm.value inside the render effect
const mm    = (v) => `${v * ppm.value}px`   // mm → css px string
const mmn   = (v) => v * ppm.value           // mm → numeric px
// pt → css px (1 pt = 0.3528 mm)
const pt    = (v) => `${v * 0.3528 * ppm.value}px`

const cardPx = computed(() => ({
  width:  `${props.width}px`,
  height: `${mmn(cardHmm.value)}px`,
}))

// Section heights
const HEADER_H = computed(() => isPortrait.value ? 20   : 14.5)  // mm
const BAR_H    = 1.8
const FOOTER_H = 8.5
const BODY_H   = computed(() => cardHmm.value - HEADER_H.value - BAR_H - FOOTER_H)

// Avatar
const AV_R = computed(() => isPortrait.value ? 10 : 11.5)  // mm radius

// ── Student data ──────────────────────────────────────────────────────────────
const name      = computed(() => props.student.fullName || props.student.name || '—')
const sid       = computed(() => props.student.publicId || props.student.studentCode || props.student.id || '—')
const photoUrl  = computed(() => props.photoSrc || props.student.avatarUrl || '')
const initials  = computed(() =>
  name.value.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?',
)
const hasGender = computed(() => !!props.student.gender)
const isMale    = computed(() => props.student.gender?.toLowerCase().startsWith('m') ?? true)
</script>

<template>
  <!-- ── Card shell ─────────────────────────────────────────────────────────── -->
  <div
    class="relative overflow-hidden rounded-[4px] border border-slate-200/80 bg-white shadow-lg select-none shrink-0"
    :style="cardPx"
  >

    <!-- ══ HEADER ════════════════════════════════════════════════════════════ -->
    <div
      class="absolute inset-x-0 top-0 overflow-hidden"
      :style="{ height: mm(HEADER_H), background: 'linear-gradient(135deg, #102d60 0%, #0a2450 60%, #071a3a 100%)' }"
    >
      <!-- Watermark circles -->
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

      <!-- Portrait header — centred column -->
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

    <!-- ══ ACCENT BAR ════════════════════════════════════════════════════════ -->
    <div
      class="absolute inset-x-0 flex"
      :style="{ top: mm(HEADER_H), height: mm(BAR_H) }"
    >
      <div v-for="c in ACCENT" :key="c" class="flex-1" :style="{ background: c }" />
    </div>

    <!-- ══ BODY ══════════════════════════════════════════════════════════════ -->
    <div
      class="absolute inset-x-0 flex"
      :style="{ top: mm(HEADER_H + BAR_H), height: mm(BODY_H) }"
    >

      <!-- ── Landscape body ───────────────────────────────────────────────── -->
      <template v-if="!isPortrait">
        <div class="flex h-full w-full gap-0" :style="{ padding: `${mmn(1.8)}px ${mmn(2)}px` }">
          <div
            class="flex flex-col items-center justify-center shrink-0"
            :style="{ width: mm(30) }"
          >
            <div class="rounded-[999px] bg-white p-[2px] shadow-[0_6px_14px_rgba(15,23,42,0.12)]">
              <div
                class="rounded-full overflow-hidden bg-blue-100 flex items-center justify-center"
                :style="{
                  width: mm(AV_R * 2), height: mm(AV_R * 2),
                  boxShadow: `inset 0 0 0 ${mmn(0.8)}px rgba(255,255,255,0.7)`,
                }"
              >
                <img
                  v-if="photoUrl"
                  :src="photoUrl"
                  class="w-full h-full object-cover"
                />
                <span
                  v-else
                  class="font-bold text-blue-800"
                  :style="{ fontSize: pt(initials.length > 2 ? 8.5 : 11) }"
                >{{ initials }}</span>
              </div>
            </div>
            <div
              v-if="hasGender"
              class="mt-2 rounded-full font-bold leading-none shadow-sm"
              :style="{
                fontSize:   pt(4.5),
                padding:    `${mmn(0.7)}px ${mmn(2.2)}px`,
                background: isMale ? '#eef2ff' : '#fdf2f8',
                color:      isMale ? '#4338ca' : '#be185d',
              }"
            >{{ isMale ? T.male : T.female }}</div>
            <div class="mt-2 rounded-full bg-sky-50 px-3 py-1 text-[10px] font-semibold tracking-wide text-sky-700">
              Student
            </div>
          </div>

          <div
            class="mx-4 w-px shrink-0"
            :style="{
              background: 'linear-gradient(to bottom, transparent, #dbe4f0 18%, #dbe4f0 82%, transparent)',
            }"
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
                <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.4) }">{{ T.studentId }}</p>
                <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.9) }">{{ sid }}</p>
              </div>
              <div class="rounded-[14px] border border-slate-200/80 bg-white px-3 py-2 shadow-[0_6px_16px_rgba(15,23,42,0.04)]">
                <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.4) }">{{ T.class }}</p>
                <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.9) }">{{ className || '—' }}</p>
              </div>
              <div class="rounded-[14px] border border-slate-200/80 bg-white px-3 py-2 shadow-[0_6px_16px_rgba(15,23,42,0.04)]">
                <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.4) }">{{ T.grade }}</p>
                <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.9) }">{{ classLevel || '—' }}</p>
              </div>
              <div class="rounded-[14px] border border-slate-200/80 bg-white px-3 py-2 shadow-[0_6px_16px_rgba(15,23,42,0.04)]">
                <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.4) }">{{ T.dob }}</p>
                <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.9) }">{{ student.dateOfBirth || '—' }}</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ── Portrait body ────────────────────────────────────────────────── -->
      <template v-else>
        <div
          class="w-full flex flex-col items-center overflow-hidden"
          :style="{ paddingTop: mm(2) }"
        >

          <!-- Avatar circle -->
          <div
            class="rounded-full overflow-hidden bg-blue-100 flex items-center justify-center shrink-0"
            :style="{
              width: mm(AV_R * 2), height: mm(AV_R * 2),
              boxShadow: `0 0 0 ${mmn(0.7)}px #fff, 0 0 0 ${mmn(1.6)}px #60a5fa, 0 ${mmn(1)}px ${mmn(3)}px rgba(59,130,246,0.25)`,
            }"
          >
            <img v-if="photoUrl" :src="photoUrl" class="w-full h-full object-cover" />
            <span
              v-else
              class="font-bold text-blue-800"
              :style="{ fontSize: pt(initials.length > 2 ? 7.5 : 9.5) }"
            >{{ initials }}</span>
          </div>

          <!-- Gender badge -->
          <div
            v-if="hasGender"
            class="rounded-full font-bold leading-none shrink-0"
            :style="{
              fontSize:   pt(4.8),
              padding:    `${mmn(0.6)}px ${mmn(2.5)}px`,
              marginTop:  mm(1.5),
              background: isMale ? '#ede9fe' : '#fce7f3',
              color:      isMale ? '#6d28d9' : '#be185d',
            }"
          >{{ isMale ? T.male : T.female }}</div>

          <!-- Name -->
          <p
            class="font-extrabold text-slate-900 truncate max-w-full leading-tight"
            :style="{ fontSize: pt(8), marginTop: mm(2), paddingInline: mm(3) }"
          >{{ name }}</p>
          <!-- Name underline accent -->
          <div
            class="rounded-full self-center"
            :style="{ width: mm(8), height: mm(0.6), marginTop: mm(0.8), marginBottom: mm(0.5), background: 'linear-gradient(to right, #3b82f6, #93c5fd)' }"
          />

          <!-- Divider -->
          <div
            class="self-stretch"
            :style="{
              height: '1px',
              margin: `${mmn(1.5)}px ${mmn(4)}px`,
              background: 'linear-gradient(to right, transparent, #cbd5e1 30%, #cbd5e1 70%, transparent)',
            }"
          />

          <!-- 2×2 info grid -->
          <div
            class="grid grid-cols-2 self-stretch"
            :style="{ paddingInline: mm(5), rowGap: mm(1.5), columnGap: mm(2) }"
          >
            <div>
              <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.5) }">{{ T.studentId }}</p>
              <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.5) }">{{ sid }}</p>
            </div>
            <div v-if="classLevel">
              <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.5) }">{{ T.grade }}</p>
              <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.5) }">{{ classLevel }}</p>
            </div>
            <div>
              <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.5) }">{{ T.class }}</p>
              <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.5) }">{{ className || '—' }}</p>
            </div>
            <div v-if="student.dateOfBirth">
              <p class="font-semibold text-slate-400 uppercase tracking-wider leading-none" :style="{ fontSize: pt(4.5) }">{{ T.dob }}</p>
              <p class="font-bold text-blue-800 leading-tight" :style="{ fontSize: pt(6.5) }">{{ student.dateOfBirth }}</p>
            </div>
          </div>

        </div>
      </template>

    </div>

    <!-- ══ FOOTER ════════════════════════════════════════════════════════════ -->
    <div
      class="absolute inset-x-0 bottom-0 flex items-center justify-center border-t border-blue-200/70"
      :style="{ height: mm(FOOTER_H), background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }"
    >
      <span class="font-bold text-blue-800" :style="{ fontSize: pt(isPortrait ? 5.5 : 6) }">
        {{ T.academicYear }}&nbsp;&nbsp;{{ academicYear }}
      </span>
    </div>

  </div>
</template>
