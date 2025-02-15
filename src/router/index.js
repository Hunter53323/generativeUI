import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import SettingsView from '../views/SettingsView.vue'
import DatabaseView from '../views/DatabaseView.vue'
import ModelView from '@/views/ModelView.vue'
import DataNotationView from '../views/DataNotationView.vue'
import DataCleaningView from '../views/DataCleaningView.vue'
import HomeView from '../views/HomeView.vue'
import DeviceDashboardView from '../views/DeviceDashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/devicedashboard',
      name: 'devicedashboard',
      component: DeviceDashboardView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/database',
      name: 'database',
      component: DatabaseView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    },
    {
      path: '/model',
      name: 'model',
      component: ModelView
    },
    {
      path: '/datanotation',
      name: 'datanotation',
      component: DataNotationView
    },
    {
      path: '/datacleaning',
      name: 'datacleaning',
      component: DataCleaningView
    }
  ]
})

export default router
