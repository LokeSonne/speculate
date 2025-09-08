<template>
  <ComboboxRoot
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :multiple="multiple"
    class="combobox-root"
  >
    <ComboboxAnchor class="combobox-anchor">
      <ComboboxInput class="combobox-input" :placeholder="placeholder" />
      <ComboboxTrigger class="combobox-trigger">
        <ChevronDownIcon :size="16" class="combobox-icon" />
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxContent class="combobox-content">
      <ComboboxViewport class="combobox-viewport">
        <ComboboxEmpty class="combobox-empty">
          {{ emptyText }}
        </ComboboxEmpty>

        <template v-for="(group, groupIndex) in options" :key="group.name">
          <ComboboxGroup v-if="group.children?.length" class="combobox-group">
            <ComboboxSeparator v-if="groupIndex !== 0" class="combobox-separator" />
            <ComboboxLabel class="combobox-label">
              {{ group.name }}
            </ComboboxLabel>
            <ComboboxItem
              v-for="option in group.children"
              :key="option.value"
              :value="option.value"
              class="combobox-item"
              @click="handleItemClick(option.value)"
            >
              <ComboboxItemIndicator class="combobox-item-indicator">
                <CheckIcon :size="14" />
              </ComboboxItemIndicator>
              <span>{{ option.label }}</span>
            </ComboboxItem>
          </ComboboxGroup>
        </template>
      </ComboboxViewport>
    </ComboboxContent>
  </ComboboxRoot>
</template>

<script setup lang="ts">
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxRoot,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxViewport,
} from 'reka-ui'
import ChevronDownIcon from '../../icons/ChevronDownIcon.vue'
import CheckIcon from '../../icons/CheckIcon.vue'

export interface ComboboxOption {
  value: string
  label: string
}

export interface ComboboxGroup {
  name: string
  children: ComboboxOption[]
}

interface Props {
  modelValue?: string | string[]
  multiple?: boolean
  placeholder?: string
  emptyText?: string
  options: ComboboxGroup[]
}

interface Emits {
  (e: 'update:modelValue', value: string | string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  placeholder: 'Search...',
  emptyText: 'No options found',
})

const emit = defineEmits<Emits>()

const handleItemClick = (value: string) => {
  if (props.multiple) {
    const currentValue = Array.isArray(props.modelValue) ? props.modelValue : []
    const newValue = currentValue.includes(value)
      ? currentValue.filter((v) => v !== value)
      : [...currentValue, value]
    emit('update:modelValue', newValue)
  } else {
    emit('update:modelValue', value)
  }
}
</script>

<style scoped>
/* Reset */
button,
input {
  all: unset;
}

.combobox-root {
  position: relative;
}

.combobox-anchor {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  line-height: 1;
  height: 36px;
  padding: 0 var(--spacing-3);
  gap: var(--spacing-2);
  background-color: white;
  color: var(--color-gray-900);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  min-width: 200px;
}

.combobox-anchor:hover {
  background-color: var(--color-gray-50);
  border-color: var(--color-gray-400);
}

.combobox-anchor:focus-within {
  outline: 2px solid var(--color-blue-500);
  outline-offset: 2px;
  border-color: var(--color-blue-500);
}

.combobox-input {
  flex: 1;
  height: 100%;
  background-color: transparent;
  color: var(--color-gray-900);
  font-size: var(--font-size-sm);
}

.combobox-input::placeholder {
  color: var(--color-gray-500);
}

.combobox-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.combobox-icon {
  color: var(--color-gray-500);
  transition: transform 0.2s ease;
}

.combobox-trigger[data-state='open'] .combobox-icon {
  transform: rotate(180deg);
}

.combobox-content {
  z-index: 50;
  width: 100%;
  position: absolute;
  overflow: hidden;
  background-color: white;
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-1);
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.1),
    0 4px 6px rgba(0, 0, 0, 0.05);
}

.combobox-viewport {
  padding: var(--spacing-1);
  max-height: 200px;
  overflow-y: auto;
}

.combobox-empty {
  padding: var(--spacing-3);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
}

.combobox-group {
  margin-bottom: var(--spacing-1);
}

.combobox-group:last-child {
  margin-bottom: 0;
}

.combobox-label {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.combobox-separator {
  height: 1px;
  background-color: var(--color-gray-200);
  margin: var(--spacing-1) 0;
}

.combobox-item {
  font-size: var(--font-size-sm);
  line-height: 1;
  color: var(--color-gray-900);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 var(--spacing-8) 0 var(--spacing-6);
  position: relative;
  user-select: none;
  cursor: pointer;
}

.combobox-item[data-disabled] {
  color: var(--color-gray-400);
  pointer-events: none;
}

.combobox-item[data-highlighted] {
  outline: none;
  background-color: var(--color-blue-50);
  color: var(--color-blue-900);
}

.combobox-item[data-state='checked'] {
  background-color: var(--color-blue-100);
  color: var(--color-blue-900);
}

.combobox-item-indicator {
  position: absolute;
  left: 0;
  width: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-blue-600);
}
</style>
