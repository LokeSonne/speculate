<template>
  <div class="form-section">
    <h2>Approval & Sign-off</h2>

    <!-- Design Approval -->
    <div class="approval-group">
      <h3>Design Approval</h3>
      <div class="checkbox-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="data.approvals.design?.visualDesign || false"
            @change="
              updateApproval('design', 'visualDesign', ($event.target as HTMLInputElement).checked)
            "
          />
          <span class="checkbox-text">Visual design approved</span>
        </label>
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="data.approvals.design?.interactionDesign || false"
            @change="
              updateApproval(
                'design',
                'interactionDesign',
                ($event.target as HTMLInputElement).checked,
              )
            "
          />
          <span class="checkbox-text">Interaction design approved</span>
        </label>
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="data.approvals.design?.responsiveBehavior || false"
            @change="
              updateApproval(
                'design',
                'responsiveBehavior',
                ($event.target as HTMLInputElement).checked,
              )
            "
          />
          <span class="checkbox-text">Responsive behavior approved</span>
        </label>
      </div>
    </div>

    <!-- Product Approval -->
    <div class="approval-group">
      <h3>Product Approval</h3>
      <div class="checkbox-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="data.approvals.product?.userRequirements || false"
            @change="
              updateApproval(
                'product',
                'userRequirements',
                ($event.target as HTMLInputElement).checked,
              )
            "
          />
          <span class="checkbox-text">User requirements approved</span>
        </label>
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="data.approvals.product?.behavioralRequirements || false"
            @change="
              updateApproval(
                'product',
                'behavioralRequirements',
                ($event.target as HTMLInputElement).checked,
              )
            "
          />
          <span class="checkbox-text">Behavioral requirements approved</span>
        </label>
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="data.approvals.product?.successCriteria || false"
            @change="
              updateApproval(
                'product',
                'successCriteria',
                ($event.target as HTMLInputElement).checked,
              )
            "
          />
          <span class="checkbox-text">Success criteria approved</span>
        </label>
      </div>
    </div>

    <!-- Engineering Feasibility -->
    <div class="approval-group">
      <h3>Engineering Feasibility</h3>
      <div class="checkbox-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="data.approvals.engineering?.technicalApproach || false"
            @change="
              updateApproval(
                'engineering',
                'technicalApproach',
                ($event.target as HTMLInputElement).checked,
              )
            "
          />
          <span class="checkbox-text">Technical approach confirmed</span>
        </label>
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="data.approvals.engineering?.performanceRequirements || false"
            @change="
              updateApproval(
                'engineering',
                'performanceRequirements',
                ($event.target as HTMLInputElement).checked,
              )
            "
          />
          <span class="checkbox-text">Performance requirements achievable</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Approvals } from '../../../types/feature'

interface Props {
  data: {
    approvals: Approvals
  }
}

interface Emits {
  (e: 'update', field: string, value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const updateApproval = (category: keyof Approvals, field: string, value: boolean) => {
  const updatedApprovals = { ...props.data.approvals }

  if (!updatedApprovals[category]) {
    updatedApprovals[category] = {} as any
  }

  updatedApprovals[category] = {
    ...updatedApprovals[category],
    [field]: value,
  }

  emit('update', 'approvals', updatedApprovals)
}
</script>

<style scoped>
.form-section {
  margin-bottom: var(--spacing-8);
  padding: var(--spacing-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-background);
}

.form-section h2 {
  margin: 0 0 var(--spacing-6) 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-700);
}

.approval-group {
  margin-bottom: var(--spacing-6);
  padding: var(--spacing-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-background-card);
}

.approval-group h3 {
  margin: 0 0 var(--spacing-4) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--color-gray-700);
}

.checkbox-label input[type='checkbox'] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.checkbox-text {
  user-select: none;
}

.checkbox-label:hover .checkbox-text {
  color: var(--color-gray-800);
}
</style>
