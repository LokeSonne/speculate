import { describe, it, expect } from 'vitest'

describe('MSW Test', () => {
  it('should intercept requests', async () => {
    const response = await fetch(
      'https://mock.supabase.co/rest/v1/field_changes?feature_spec_id=eq.mock-spec-2',
    )
    const data = await response.json()

    console.log('📡 Response:', data)
    expect(data).toHaveLength(2) // Should return 2 field changes for mock-spec-2
    expect(data[0].id).toBe('fc-5')
    expect(data[1].id).toBe('fc-6')
  })
})
