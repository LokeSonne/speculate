<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polyline
      points="7 13.5 11 17 17 9"
      stroke="currentColor"
      stroke-width="1"
      fill="none"
    />
  </svg>
</template>

<script setup lang="ts">
const { size } = defineProps({
  size: { type: Number, default: 16 },
});
</script>
