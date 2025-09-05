import { describe, it, expect } from 'vitest'
import { createDefaultFeatureSpec, type FrontendFeatureSpec, type Reviewer, type UseCase } from '../../types/feature'

describe('Feature Types', () => {
  describe('createDefaultFeatureSpec', () => {
    it('should create a valid default feature spec', () => {
      const spec = createDefaultFeatureSpec()
      
      expect(spec).toBeDefined()
      expect(spec.id).toBeDefined()
      expect(spec.featureName).toBe('')
      expect(spec.author).toBe('')
      expect(spec.status).toBe('Draft')
      expect(spec.reviewers).toEqual([])
      expect(spec.successCriteria).toEqual([])
      expect(spec.createdAt).toBeInstanceOf(Date)
      expect(spec.updatedAt).toBeInstanceOf(Date)
      expect(spec.version).toBe('1.0.0')
    })

    it('should have proper layout structure defaults', () => {
      const spec = createDefaultFeatureSpec()
      
      expect(spec.layoutStructure.desktop.breakpoint).toBe('>1200px')
      expect(spec.layoutStructure.tablet.breakpoint).toBe('768-1199px')
      expect(spec.layoutStructure.mobile.breakpoint).toBe('<768px')
    })

    it('should have proper accessibility requirements structure', () => {
      const spec = createDefaultFeatureSpec()
      
      expect(spec.accessibilityRequirements.keyboardNavigation.tabOrder).toEqual([])
      expect(spec.accessibilityRequirements.screenReaderSupport.labels).toEqual([])
      expect(spec.accessibilityRequirements.visualAccessibility.colorRequirements).toEqual([])
    })
  })

  describe('FrontendFeatureSpec interface', () => {
    it('should accept valid status values', () => {
      const validStatuses: FrontendFeatureSpec['status'][] = ['Draft', 'In Review', 'Approved', 'Locked']
      
      validStatuses.forEach(status => {
        const spec = createDefaultFeatureSpec()
        spec.status = status
        expect(spec.status).toBe(status)
      })
    })
  })

  describe('Reviewer interface', () => {
    it('should create a valid reviewer', () => {
      const reviewer: Reviewer = {
        id: '1',
        name: 'John Doe',
        role: 'Product',
        status: 'pending'
      }
      
      expect(reviewer.id).toBe('1')
      expect(reviewer.name).toBe('John Doe')
      expect(reviewer.role).toBe('Product')
      expect(reviewer.status).toBe('pending')
    })
  })

  describe('UseCase interface', () => {
    it('should create a valid use case', () => {
      const useCase: UseCase = {
        id: '1',
        name: 'User Login',
        type: 'Primary',
        context: 'User wants to access their account',
        userAction: 'Enter credentials and click login',
        expectedOutcome: 'User is logged in and redirected to dashboard',
        successCondition: 'User sees dashboard with their data'
      }
      
      expect(useCase.id).toBe('1')
      expect(useCase.name).toBe('User Login')
      expect(useCase.type).toBe('Primary')
      expect(useCase.context).toBeDefined()
      expect(useCase.userAction).toBeDefined()
      expect(useCase.expectedOutcome).toBeDefined()
      expect(useCase.successCondition).toBeDefined()
    })
  })
})
