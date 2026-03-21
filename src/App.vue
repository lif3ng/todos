<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Issue, Label } from './types'
import { fetchIssues, fetchLabels } from './api'
import IssueCard from './components/IssueCard.vue'
import IssueDetail from './components/IssueDetail.vue'

// State
const issues = ref<Issue[]>([])
const labels = ref<Label[]>([])
const loading = ref(false)
const error = ref('')
const total = ref(0)

// Filters
const search = ref('')
const searchInput = ref('')
const selectedLabel = ref('')
const selectedState = ref<'all' | 'open' | 'closed'>('all')
const page = ref(1)
const PER_PAGE = 30

// Detail panel
const selectedIssueNumber = ref<number | null>(null)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PER_PAGE)))

async function load() {
  loading.value = true
  error.value = ''
  try {
    const result = await fetchIssues({
      state: selectedState.value,
      label: selectedLabel.value || undefined,
      page: page.value,
      per_page: PER_PAGE,
      q: search.value || undefined,
    })
    issues.value = result.issues
    total.value = result.total
  } catch (e) {
    error.value = 'Failed to load issues. GitHub API rate limit may be exceeded.'
  } finally {
    loading.value = false
  }
}

function applySearch() {
  search.value = searchInput.value
  page.value = 1
  load()
}

function clearSearch() {
  searchInput.value = ''
  search.value = ''
  page.value = 1
  load()
}

watch([selectedLabel, selectedState], () => {
  page.value = 1
  load()
})

watch(page, () => load())

onMounted(async () => {
  labels.value = await fetchLabels()
  load()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
        <div class="flex items-center gap-2">
          <svg class="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <a href="https://github.com/lif3ng/todos" target="_blank" class="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            lif3ng/todos
          </a>
        </div>
        <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Issues Viewer</span>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-4 py-6">
      <!-- Search + Filters -->
      <div class="mb-5 flex flex-col sm:flex-row gap-3">
        <!-- Search -->
        <div class="flex-1 flex gap-2">
          <div class="relative flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchInput"
              type="text"
              placeholder="Search issues..."
              class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              @keyup.enter="applySearch"
            />
          </div>
          <button
            class="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            @click="applySearch"
          >Search</button>
          <button
            v-if="search"
            class="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            @click="clearSearch"
          >Clear</button>
        </div>

        <!-- State filter -->
        <div class="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            v-for="s in ['all', 'open', 'closed'] as const"
            :key="s"
            class="px-3 py-1 text-sm rounded-md transition-colors capitalize"
            :class="selectedState === s ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'"
            @click="selectedState = s"
          >{{ s }}</button>
        </div>
      </div>

      <!-- Label filter -->
      <div class="mb-5 flex flex-wrap gap-1.5">
        <button
          class="px-2.5 py-1 text-xs rounded-full border transition-colors"
          :class="selectedLabel === '' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'"
          @click="selectedLabel = ''"
        >All</button>
        <button
          v-for="label in labels"
          :key="label.name"
          class="px-2.5 py-1 text-xs rounded-full border transition-all"
          :class="selectedLabel === label.name ? 'opacity-100 ring-2 ring-offset-1' : 'opacity-80 hover:opacity-100'"
          :style="selectedLabel === label.name
            ? { backgroundColor: '#' + label.color, color: '#fff', borderColor: '#' + label.color, '--tw-ring-color': '#' + label.color }
            : { borderColor: '#' + label.color, color: '#' + label.color, backgroundColor: '#' + label.color + '22' }"
          @click="selectedLabel = selectedLabel === label.name ? '' : label.name"
        >{{ label.name }}</button>
      </div>

      <!-- Stats -->
      <div class="mb-3 flex items-center justify-between">
        <p class="text-sm text-gray-500">
          <span v-if="loading">Loading...</span>
          <span v-else>{{ total }} issues</span>
        </p>
        <div v-if="!loading && totalPages > 1" class="flex items-center gap-2 text-sm">
          <button
            :disabled="page === 1"
            class="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            @click="page--"
          >← Prev</button>
          <span class="text-gray-500">{{ page }} / {{ totalPages }}</span>
          <button
            :disabled="page === totalPages"
            class="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            @click="page++"
          >Next →</button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        {{ error }}
      </div>

      <!-- Issues List -->
      <div v-if="loading" class="flex justify-center py-16">
        <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="issues.length === 0" class="text-center py-16 text-gray-400">
        <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p>No issues found</p>
      </div>

      <div v-else class="grid gap-2">
        <IssueCard
          v-for="issue in issues"
          :key="issue.number"
          :issue="issue"
          @select="selectedIssueNumber = issue.number"
        />
      </div>

      <!-- Pagination (bottom) -->
      <div v-if="!loading && totalPages > 1" class="mt-6 flex justify-center gap-2">
        <button
          :disabled="page === 1"
          class="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
          @click="page--"
        >← Prev</button>
        <span class="px-4 py-2 text-sm text-gray-500">{{ page }} / {{ totalPages }}</span>
        <button
          :disabled="page === totalPages"
          class="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
          @click="page++"
        >Next →</button>
      </div>
    </main>

    <!-- Issue Detail Panel -->
    <IssueDetail
      v-if="selectedIssueNumber !== null"
      :issue-number="selectedIssueNumber"
      @close="selectedIssueNumber = null"
    />
  </div>
</template>
