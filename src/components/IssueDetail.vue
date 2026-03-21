<script setup lang="ts">
import { ref, watch } from 'vue'
import { marked } from 'marked'
import type { Issue } from '../types'
import LabelBadge from './LabelBadge.vue'
import { fetchIssue } from '../api'

const props = defineProps<{ issueNumber: number }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const issue = ref<Issue | null>(null)
const loading = ref(true)

watch(
  () => props.issueNumber,
  async (num) => {
    loading.value = true
    issue.value = null
    issue.value = await fetchIssue(num)
    loading.value = false
  },
  { immediate: true }
)

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-start justify-end" @click.self="emit('close')">
    <div class="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <span class="text-sm text-gray-500">Issue Detail</span>
        <button
          class="text-gray-400 hover:text-gray-600 transition-colors"
          @click="emit('close')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex-1 flex items-center justify-center">
        <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Content -->
      <div v-else-if="issue" class="flex-1 overflow-y-auto px-6 py-5">
        <div class="mb-4">
          <div class="flex items-center gap-2 mb-2">
            <span
              class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded"
              :class="issue.state === 'open' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'"
            >
              <span class="w-1.5 h-1.5 rounded-full inline-block" :class="issue.state === 'open' ? 'bg-green-500' : 'bg-purple-500'"></span>
              {{ issue.state }}
            </span>
            <span class="text-sm text-gray-400">#{{ issue.number }}</span>
          </div>
          <h1 class="text-xl font-semibold text-gray-900 mb-3">{{ issue.title }}</h1>
          <div class="flex flex-wrap gap-1 mb-3">
            <LabelBadge v-for="label in issue.labels" :key="label.id" :label="label" />
          </div>
          <div class="flex items-center gap-2 text-xs text-gray-400">
            <img :src="issue.user.avatar_url" class="w-5 h-5 rounded-full" />
            <span>{{ issue.user.login }}</span>
            <span>·</span>
            <span>{{ formatDate(issue.created_at) }}</span>
            <span>·</span>
            <a :href="issue.html_url" target="_blank" class="text-blue-500 hover:underline">Open on GitHub ↗</a>
          </div>
        </div>

        <hr class="border-gray-100 mb-4" />

        <div
          v-if="issue.body"
          class="prose prose-sm max-w-none text-gray-700"
          v-html="marked(issue.body)"
        ></div>
        <p v-else class="text-gray-400 text-sm italic">No description provided.</p>
      </div>
    </div>
  </div>
</template>
