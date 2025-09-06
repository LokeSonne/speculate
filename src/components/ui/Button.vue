<template>
  <button :type="type" :disabled="disabled" :class="buttonClasses" @click="handleClick">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const classes = ['btn']

  // Variant classes
  classes.push(`btn-${props.variant}`)

  // Size classes
  classes.push(`btn-${props.size}`)

  // State classes
  if (props.disabled) classes.push('btn-disabled')
  if (props.loading) classes.push('btn-loading')

  return classes
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  border: 1px solid transparent;
  border-radius: var(--border-radius-md);
  font-family: var(--font-family-sans);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  position: relative;
  overflow: hidden;
}

.btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Sizes */
.btn-sm {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
  min-height: 32px;
}

.btn-md {
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-base);
  min-height: 40px;
}

.btn-lg {
  padding: var(--spacing-4) var(--spacing-6);
  font-size: var(--font-size-lg);
  min-height: 48px;
}

/* Variants */
.btn-primary {
  background: var(--color-primary);
  color: var(--color-background);
  border-color: var(--color-primary);
}

.btn-primary:hover:not(.btn-disabled) {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
}

.btn-primary:active:not(.btn-disabled) {
  background: var(--color-primary-darker);
  border-color: var(--color-primary-darker);
}

.btn-secondary {
  background: var(--color-background);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.btn-secondary:hover:not(.btn-disabled) {
  background: var(--color-background-hover);
  border-color: var(--color-border-dark);
}

.btn-secondary:active:not(.btn-disabled) {
  background: var(--color-background-muted);
  border-color: var(--color-border-dark);
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-primary);
  border-color: transparent;
}

.btn-ghost:hover:not(.btn-disabled) {
  background: var(--color-background-hover);
}

.btn-ghost:active:not(.btn-disabled) {
  background: var(--color-background-muted);
}

.btn-danger {
  background: var(--color-error);
  color: var(--color-background);
  border-color: var(--color-error);
}

.btn-danger:hover:not(.btn-disabled) {
  background: var(--color-error-dark);
  border-color: var(--color-error-dark);
}

.btn-danger:active:not(.btn-disabled) {
  background: var(--color-error-darker);
  border-color: var(--color-error-darker);
}

/* States */
.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-loading {
  cursor: wait;
  pointer-events: none;
}

.btn-loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .btn-sm {
    padding: var(--spacing-2) var(--spacing-2);
    font-size: var(--font-size-xs);
    min-height: 28px;
  }

  .btn-md {
    padding: var(--spacing-2) var(--spacing-3);
    font-size: var(--font-size-sm);
    min-height: 36px;
  }

  .btn-lg {
    padding: var(--spacing-3) var(--spacing-4);
    font-size: var(--font-size-base);
    min-height: 44px;
  }
}
</style>
