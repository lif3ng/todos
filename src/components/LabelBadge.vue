<script setup lang="ts">
import type { Label } from '../types'
const props = defineProps<{ label: Label }>()

function textColor(hex: string) {
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}
</script>

<template>
  <span
    class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
    :style="{ backgroundColor: '#' + label.color, color: textColor(label.color) }"
  >
    {{ label.name }}
  </span>
</template>
