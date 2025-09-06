<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>{{ isSignUp ? 'Create Account' : 'Sign In' }}</h2>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="isSignUp" class="form-group">
          <label for="fullName">Full Name</label>
          <input
            id="fullName"
            v-model="formData.fullName"
            type="text"
            required
            placeholder="Enter your full name"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            placeholder="Enter your email"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            :placeholder="isSignUp ? 'Create a password (min 6 characters)' : 'Enter your password'"
            class="form-input"
            minlength="6"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <button type="submit" :disabled="loading" class="btn-primary auth-submit">
          {{ loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>
          {{ isSignUp ? 'Already have an account?' : "Don't have an account?" }}
          <button type="button" @click="toggleMode" class="btn-link">
            {{ isSignUp ? 'Sign In' : 'Create Account' }}
          </button>
        </p>

        <button v-if="!isSignUp" type="button" @click="handleForgotPassword" class="btn-link">
          Forgot your password?
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useRouter } from 'vue-router'

const router = useRouter()
const { signUp, signIn, resetPassword } = useAuth()

const isSignUp = ref(false)
const loading = ref(false)
const error = ref('')
const successMessage = ref('')

const formData = reactive({
  fullName: '',
  email: '',
  password: '',
})

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    if (isSignUp.value) {
      const { error: signUpError } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
      })

      if (signUpError) {
        error.value = signUpError.message
      } else {
        successMessage.value = 'Account created! Please check your email to verify your account.'
        // Reset form
        formData.fullName = ''
        formData.email = ''
        formData.password = ''
        isSignUp.value = false
      }
    } else {
      const { error: signInError } = await signIn(formData.email, formData.password)

      if (signInError) {
        error.value = signInError.message
      } else {
        // Redirect to dashboard
        router.push('/')
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}

const toggleMode = () => {
  isSignUp.value = !isSignUp.value
  error.value = ''
  successMessage.value = ''
}

const handleForgotPassword = async () => {
  if (!formData.email) {
    error.value = 'Please enter your email address first'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const { error: resetError } = await resetPassword(formData.email)

    if (resetError) {
      error.value = resetError.message
    } else {
      successMessage.value = 'Password reset email sent! Check your inbox.'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to send reset email'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  padding: var(--spacing-4);
}

.auth-card {
  background: var(--color-background-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: var(--spacing-8);
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
}

.auth-card h2 {
  margin: 0 0 var(--spacing-6) 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  text-align: center;
}

.auth-form {
  margin-bottom: var(--spacing-6);
}

.form-group {
  margin-bottom: var(--spacing-4);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-2);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
}

.form-input {
  width: 100%;
  padding: var(--spacing-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.error-message {
  margin-bottom: var(--spacing-4);
  padding: var(--spacing-3);
  background: var(--color-red-50);
  border: 1px solid var(--color-red-100);
  border-radius: var(--radius-md);
  color: var(--color-error);
  font-size: var(--font-size-sm);
}

.success-message {
  margin-bottom: var(--spacing-4);
  padding: var(--spacing-3);
  background: var(--color-green-50);
  border: 1px solid var(--color-green-100);
  border-radius: var(--radius-md);
  color: var(--color-success);
  font-size: var(--font-size-sm);
}

.auth-submit {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-6);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.auth-submit:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.auth-submit:disabled {
  background: var(--color-gray-400);
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
}

.auth-footer p {
  margin: 0 0 var(--spacing-4) 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.btn-link {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: var(--font-size-sm);
  text-decoration: underline;
  padding: 0;
}

.btn-link:hover {
  color: var(--color-primary-hover);
}
</style>
