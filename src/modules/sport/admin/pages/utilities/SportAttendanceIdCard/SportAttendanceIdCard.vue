<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import { fetchSportTeams } from '@/modules/sport/services/api/sportTeamsApi'
import { fetchSportPlayers } from '@/modules/sport/services/api/sportPlayersApi'
import { buildBackQrDataUrl } from '@/modules/sport/admin/pages/utilities/sportIdCardBack'
import {
  getInitials,
  loadStudentPhoto,
  imgToDataUrl,
  logGenerationProgress,
  logCacheStatus,
} from './utils/idCardHelpers'
import {
  LANG_OPTIONS,
  FORMAT_OPTIONS,
  ORIENT_OPTIONS,
  CARD_SIZES,
  DEFAULT_FORMAT,
  DEFAULT_ORIENTATION,
  DEFAULT_SIZE,
  DEFAULT_LANG,
  DEFAULT_GAP_MM,
} from './constants/idCardConstants'

defineOptions({ name: 'SportAdminAttendanceIdCardPage' })

const router = useRouter()

const teamOptions = ref([])
const players = ref([])
const selectedTeamId = ref('')
const selectedPlayerIds = ref([])
const selectedFormat = ref(DEFAULT_FORMAT)
const selectedOrientation = ref(DEFAULT_ORIENTATION)
const selectedSize = ref(DEFAULT_SIZE)
const selectedLang = ref(DEFAULT_LANG)
const selectedGapMm = ref(DEFAULT_GAP_MM)
const loadingTeams = ref(false)
const loadingPlayers = ref(false)
const generating = ref(false)

const allSelected = computed(() =>
  players.value.length > 0 && selectedPlayerIds.value.length === players.value.length,
)

function toggleSelectAll() {
  if (allSelected.value) selectedPlayerIds.value = []
  else selectedPlayerIds.value = players.value.map((p) => p.id)
}

function togglePlayer(id) {
  const idx = selectedPlayerIds.value.indexOf(id)
  if (idx === -1) selectedPlayerIds.value.push(id)
  else selectedPlayerIds.value.splice(idx, 1)
}

async function loadTeams() {
  loadingTeams.value = true
  try {
    const res = await fetchSportTeams({ page: 1, perPage: 100 })
    teamOptions.value = (res.items || []).map((t) => ({
      label: t.name || t.code || String(t.id),
      value: t.id,
      division: t.division || '',
    }))
  } catch {
    teamOptions.value = []
  } finally {
    loadingTeams.value = false
  }
}

async function loadPlayers() {
  if (!selectedTeamId.value) {
    players.value = []
    return
  }
  loadingPlayers.value = true
  selectedPlayerIds.value = []
  try {
    const res = await fetchSportPlayers({ page: 1, perPage: 200, teamId: selectedTeamId.value })
    players.value = res.items || []
  } catch {
    players.value = []
  } finally {
    loadingPlayers.value = false
  }
}

async function generateCards() {
  if (!selectedPlayerIds.value.length) return

  generating.value = true
  const blobUrls = []

  try {
    const chosen = players.value.filter((p) => selectedPlayerIds.value.includes(p.id))
    const fmt = selectedFormat.value
    const orient = selectedOrientation.value

    // Load photos
    const photoImgCache = new Map()
    await Promise.allSettled(
      chosen.map(async (p) => {
        if (!p.avatarUrl) return
        try {
          const { img, objectUrl } = await loadStudentPhoto(p.avatarUrl)
          photoImgCache.set(p.id, img)
          blobUrls.push(objectUrl)
        } catch (error) {
          console.warn(`[ID Card] Photo failed for "${p.fullName || p.id}":`, error)
        }
      }),
    )

    // Convert photos to data URLs
    const photoDataUrlCache = new Map()
    for (const [playerId, photoImg] of photoImgCache.entries()) {
      try {
        photoDataUrlCache.set(playerId, imgToDataUrl(photoImg))
      } catch (error) {
        console.warn(`[ID Card] Photo data URL failed for "${playerId}":`, error)
      }
    }

    // Generate QR codes
    const qrDataCache = new Map()
    await Promise.allSettled(
      chosen.map(async (p) => {
        try {
          qrDataCache.set(p.id, await buildBackQrDataUrl(p))
        } catch (error) {
          console.warn(`[ID Card] QR generation failed for "${p.fullName || p.id}":`, error)
        }
      }),
    )

    logGenerationProgress(chosen, fmt, orient, selectedSize.value)
    logCacheStatus(photoDataUrlCache, qrDataCache)
  } catch (error) {
    console.error('[ID Card] Generation error:', error)
  } finally {
    generating.value = false
    blobUrls.forEach((url) => URL.revokeObjectURL(url))
  }
}

onMounted(() => {
  loadTeams()
})
</script>

<template>
  <MainLayout>
    <section class="space-y-6">
      <HeaderSection title="Generate Player ID Cards" subtitle="Create and export ID cards for team members" />

      <!-- Team & Player Selection -->
      <div class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="mb-4 text-lg font-semibold text-slate-900">Select Team & Players</h3>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Team</label>
            <Select
              v-model="selectedTeamId"
              :options="teamOptions"
              option-label="label"
              option-value="value"
              :loading="loadingTeams"
              placeholder="Select a team..."
              class="w-full"
              @change="loadPlayers"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              Players
              <span v-if="players.length" class="text-slate-500">({{ selectedPlayerIds.length }} selected)</span>
            </label>
            <button
              v-if="players.length"
              type="button"
              class="mb-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              @click="toggleSelectAll"
            >
              {{ allSelected ? 'Deselect All' : 'Select All' }}
            </button>
            <div
              class="max-h-64 overflow-y-auto border border-slate-200 rounded-lg bg-slate-50 p-3"
            >
              <div v-if="!loadingPlayers && players.length === 0" class="py-6 text-center text-sm text-slate-500">
                Select a team to load players
              </div>
              <div v-else-if="loadingPlayers" class="py-6 text-center text-sm text-slate-500">
                Loading players...
              </div>
              <div v-else class="space-y-2">
                <label
                  v-for="player in players"
                  :key="player.id"
                  class="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :checked="selectedPlayerIds.includes(player.id)"
                    class="rounded"
                    @change="togglePlayer(player.id)"
                  />
                  <span class="flex-1">
                    <span class="font-medium text-slate-900">{{ player.fullName || player.name }}</span>
                    <span class="text-sm text-slate-500 ml-2">#{{ player.publicId || player.playerCode || player.id }}</span>
                  </span>
                  <span class="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                    {{ getInitials(player) }}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Export Options -->
      <div class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 class="mb-4 text-lg font-semibold text-slate-900">Export Options</h3>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Format</label>
            <div class="space-y-2">
              <label v-for="opt in FORMAT_OPTIONS" :key="opt.value" class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="selectedFormat" :value="opt.value" />
                <span>{{ opt.label }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Orientation</label>
            <div class="space-y-2">
              <label v-for="opt in ORIENT_OPTIONS" :key="opt.value" class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="selectedOrientation" :value="opt.value" />
                <span>{{ opt.label }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Size</label>
            <Select
              v-model="selectedSize"
              :options="CARD_SIZES"
              option-label="label"
              option-value="value"
              placeholder="Select size..."
              class="w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Language</label>
            <Select
              v-model="selectedLang"
              :options="LANG_OPTIONS"
              option-label="label"
              option-value="value"
              placeholder="Select language..."
              class="w-full"
            />
          </div>

          <div class="col-span-full sm:col-span-1">
            <label class="block text-sm font-medium text-slate-700 mb-2">Gap (mm)</label>
            <input
              v-model.number="selectedGapMm"
              type="number"
              min="0"
              max="20"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      <!-- Generate Button -->
      <div class="flex gap-3">
        <Button
          :disabled="!selectedPlayerIds.length || generating"
          :loading="generating"
          @click="generateCards"
        >
          {{ generating ? 'Generating...' : 'Generate Cards' }}
        </Button>
        <Button variant="secondary" @click="router.back()">
          Cancel
        </Button>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
/* Custom styles if needed */
</style>
