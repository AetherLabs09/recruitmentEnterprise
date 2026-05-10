import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import CompanyProfile from '../views/CompanyProfile.vue'
import JobList from '../views/JobList.vue'
import JobCreate from '../views/JobCreate.vue'
import JobEdit from '../views/JobEdit.vue'
import ResumeList from '../views/ResumeList.vue'
import ResumeDetail from '../views/ResumeDetail.vue'
import InterviewList from '../views/InterviewList.vue'

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/company/profile', name: 'CompanyProfile', component: CompanyProfile },
  { path: '/jobs', name: 'JobList', component: JobList },
  { path: '/jobs/create', name: 'JobCreate', component: JobCreate },
  { path: '/jobs/edit/:id', name: 'JobEdit', component: JobEdit },
  { path: '/resumes', name: 'ResumeList', component: ResumeList },
  { path: '/resumes/:id', name: 'ResumeDetail', component: ResumeDetail },
  { path: '/interviews', name: 'InterviewList', component: InterviewList }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/' && to.path !== '/register' && !token) {
    next('/')
  } else {
    next()
  }
})

export default router
