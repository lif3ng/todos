<script setup lang="ts">
import type { Issue } from '../types'
import LabelBadge from './LabelBadge.vue'
const props = defineProps<{ issue: Issue }>()
const emit = defineEmits<{ (e: 'select', issue: Issue): void }>()

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}
</script>

<template>
  <div
    class="group p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all"
    @click="emit('select', issue)"
  >
    <div class="flex items-start gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span
            class="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
            :class="issue.state === 'open' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'"
          >
            <span class="w-1.5 h-1.5 rounded-full inline-block" :class="issue.state === 'open' ? 'bg-green-500' : 'bg-purple-500'"></span>
            {{ issue.state }}
          </span>
          <span class="text-xs text-gray-400">#{{ issue.number }}</span>
        </div>
        <h3 class="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate">
          {{ issue.title }}
        </h3>
        <div class="mt-2 flex flex-wrap gap-1">
          <LabelBadge v-for="label in issue.labels" :key="label.id" :label="label" />
        </div>
      </div>
      <div class="text-xs text-gray-400 whitespace-nowrap mt-0.5">
        {{ timeAgo(issue.updated_at) }}
      </div>
    </div>
  </div>
</template>
