import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

// Mock Vue Router
const mockPush = vi.fn()
const mockReplace = vi.fn()
const mockGo = vi.fn()
const mockBack = vi.fn()
const mockForward = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    go: mockGo,
    back: mockBack,
    forward: mockForward,
  }),
  useRoute: () => ({
    path: '/',
    params: {},
    query: {},
  }),
}))

describe('App', () => {
  it('mounts renders properly', () => {
    const wrapper = mount(App)
    // The app should render the authentication form when not logged in
    expect(wrapper.text()).toContain('Sign In')
  })
})
