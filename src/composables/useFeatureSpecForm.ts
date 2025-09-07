import { useForm } from '@tanstack/vue-form'
import { computed } from 'vue'
import type { FeatureSpecFormData } from '../types/feature'

export function useFeatureSpecForm(initialData?: Partial<FeatureSpecFormData>) {
  const form = useForm({
    defaultValues: {
      featureName: initialData?.featureName || '',
      author: initialData?.author || '',
      date: initialData?.date
        ? initialData.date instanceof Date
          ? initialData.date
          : new Date(initialData.date)
        : new Date(),
      status: initialData?.status || 'Draft',
      featureSummary: initialData?.featureSummary || '',
      reviewers: initialData?.reviewers || [],
      successCriteria: initialData?.successCriteria || [],
      targetUsers: initialData?.targetUsers || [],
      userGoals: initialData?.userGoals || [],
      useCases: initialData?.useCases || [],
      coreInteractions: initialData?.coreInteractions || [],
      loadingStates: initialData?.loadingStates || [],
      emptyStates: initialData?.emptyStates || [],
      errorStates: initialData?.errorStates || [],
      formBehavior: initialData?.formBehavior,
      layoutStructure: initialData?.layoutStructure || {
        desktop: { breakpoint: '>1200px', description: '' },
        tablet: { breakpoint: '768-1199px', description: '' },
        mobile: { breakpoint: '<768px', description: '' },
      },
      visualHierarchy: initialData?.visualHierarchy || {
        primaryElements: [],
        secondaryElements: [],
        tertiaryElements: [],
      },
      componentSpecs: initialData?.componentSpecs || [],
      typographyContent: initialData?.typographyContent || {
        headlines: [],
        bodyText: [],
        labels: [],
        errorMessages: [],
        successMessages: [],
        emptyStateText: [],
      },
      accessibilityRequirements: initialData?.accessibilityRequirements || {
        keyboardNavigation: {
          tabOrder: [],
          shortcuts: [],
          focusManagement: [],
        },
        screenReaderSupport: {
          labels: [],
          announcements: [],
          structure: [],
        },
        visualAccessibility: {
          colorRequirements: [],
          focusIndicators: [],
          textScaling: [],
        },
      },
      responsiveBehavior: initialData?.responsiveBehavior || {
        breakpointTransitions: [],
        touchInteractions: [],
      },
      animationRequirements: initialData?.animationRequirements || [],
      edgeCases: initialData?.edgeCases || [],
      technicalConstraints: initialData?.technicalConstraints || [],
      businessRules: initialData?.businessRules || [],
      approvals: initialData?.approvals || [],
    } as FeatureSpecFormData,
    validators: {
      onChange: ({ value }) => {
        const errors: Record<string, string> = {}

        if (!value.featureName?.trim()) {
          errors.featureName = 'Feature name is required'
        }

        if (!value.author?.trim()) {
          errors.author = 'Author is required'
        }

        if (!value.status) {
          errors.status = 'Status is required'
        }

        if (!value.featureSummary?.trim()) {
          errors.featureSummary = 'Feature summary is required'
        }

        return Object.keys(errors).length > 0 ? errors : undefined
      },
    },
  })

  // Computed properties for easier access
  const formData = computed(() => form.state.values)
  const errors = computed(() => {
    const formErrors = form.state.errors
    if (Array.isArray(formErrors)) {
      return formErrors.reduce(
        (acc, error) => {
          if (error && typeof error === 'object') {
            return { ...acc, ...error }
          }
          return acc
        },
        {} as Record<string, string>,
      )
    }
    return formErrors || {}
  })
  const isSubmitting = computed(() => form.state.isSubmitting)
  const isValid = computed(() => form.state.isValid)

  // Helper function to update form fields
  const updateField = (fieldPath: string, value: unknown) => {
    // Handle nested field updates (e.g., 'approvals.design.visualDesign')
    if (fieldPath.includes('.')) {
      const keys = fieldPath.split('.')
      let current = form.state.values as unknown as Record<string, unknown>
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]] as Record<string, unknown>
      }
      current[keys[keys.length - 1]] = value
    } else {
      // Handle direct field updates
      form.setFieldValue(fieldPath as keyof FeatureSpecFormData, value as never)
    }
  }

  // Helper function to get field value
  const getFieldValue = (fieldPath: string) => {
    if (fieldPath.includes('.')) {
      const keys = fieldPath.split('.')
      let current = form.state.values as unknown as Record<string, unknown>
      for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
          current = current[key] as Record<string, unknown>
        } else {
          return undefined
        }
      }
      return current
    } else {
      return form.state.values[fieldPath as keyof FeatureSpecFormData]
    }
  }

  return {
    form,
    formData,
    errors,
    isSubmitting,
    isValid,
    updateField,
    getFieldValue,
    handleSubmit: form.handleSubmit,
    reset: form.reset,
  }
}
