import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Import components
import Dashboard from '@/components/Dashboard.vue'
import FeatureSpecFormContainer from '@/components/FeatureSpecFormContainer.vue'
import FeatureSpecView from '@/components/FeatureSpecView.vue'
import EditableFeatureSpecView from '@/components/EditableFeatureSpecView.vue'
import AuthForm from '@/components/auth/AuthForm.vue'
import AuthGuard from '@/components/AuthGuard.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/specs/create',
    name: 'CreateSpec',
    component: FeatureSpecFormContainer,
    props: { mode: 'create' },
  },
  {
    path: '/specs/:id/edit',
    name: 'EditSpec',
    component: FeatureSpecFormContainer,
    props: { mode: 'edit' },
  },
  {
    path: '/specs/:id/view',
    name: 'ViewSpec',
    component: FeatureSpecView,
  },
  {
    path: '/specs/:id/edit-view',
    name: 'EditViewSpec',
    component: EditableFeatureSpecView,
  },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthForm,
  },
  {
    path: '/auth/:mode',
    name: 'AuthMode',
    component: AuthForm,
    props: true,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
