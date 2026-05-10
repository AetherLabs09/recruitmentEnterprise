<template>
  <div class="dashboard">
    <el-container>
      <el-header class="header">
        <div class="logo">招聘管理系统</div>
        <div class="user-info">
          <span>{{ company.name }}</span>
          <el-button @click="handleLogout" type="text">退出</el-button>
        </div>
      </el-header>
      <el-container>
        <el-aside width="200px" class="aside">
          <el-menu :default-active="activeMenu" mode="vertical" @select="handleMenuSelect">
            <el-menu-item index="dashboard">
              <el-icon><component :is="icons.Home" /></el-icon>
              <span>首页</span>
            </el-menu-item>
            <el-menu-item index="company/profile">
              <el-icon><component :is="icons.Building" /></el-icon>
              <span>企业资料</span>
            </el-menu-item>
            <el-menu-item index="jobs">
              <el-icon><component :is="icons.Briefcase" /></el-icon>
              <span>岗位管理</span>
            </el-menu-item>
            <el-menu-item index="resumes">
              <el-icon><component :is="icons.FileText" /></el-icon>
              <span>简历管理</span>
            </el-menu-item>
            <el-menu-item index="interviews">
              <el-icon><component :is="icons.User" /></el-icon>
              <span>面试管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main class="main">
          <div class="stats">
            <div class="stat-card">
              <div class="stat-icon jobs-icon">
                <component :is="icons.Briefcase" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.jobs }}</div>
                <div class="stat-label">发布岗位</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon resumes-icon">
                <component :is="icons.FileText" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.resumes }}</div>
                <div class="stat-label">收到简历</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon interviews-icon">
                <component :is="icons.User" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.interviews }}</div>
                <div class="stat-label">面试安排</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon favorites-icon">
                <component :is="icons.Star" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.favorites }}</div>
                <div class="stat-label">收藏人才</div>
              </div>
            </div>
          </div>
          <div class="recent-jobs">
            <h3>最近发布的岗位</h3>
            <el-table :data="recentJobs" border>
              <el-table-column prop="title" label="岗位名称" />
              <el-table-column prop="salary_min" label="薪资" :formatter="formatSalary" />
              <el-table-column prop="location" label="地点" />
              <el-table-column prop="status" label="状态" :formatter="formatStatus" />
              <el-table-column prop="created_at" label="发布时间" />
            </el-table>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { HomeFilled, Box, Briefcase, User, Star } from '@element-plus/icons-vue'
import { getCompanyProfile, getJobs, getResumes, getInterviews } from '../utils/api'

const icons = { Home: HomeFilled, Building: Box, Briefcase, FileText: Briefcase, User, Star }
const activeMenu = ref('dashboard')
const company = ref({ name: '' })
const stats = ref({ jobs: 0, resumes: 0, interviews: 0, favorites: 0 })
const recentJobs = ref([])

onMounted(async () => {
  const companyData = await getCompanyProfile()
  if (companyData) {
    company.value = companyData
  }

  const jobs = await getJobs()
  stats.value.jobs = jobs.length
  recentJobs.value = jobs.slice(0, 5)

  const resumes = await getResumes()
  stats.value.resumes = resumes.length
  stats.value.favorites = resumes.filter(r => r.is_favorite).length

  const interviews = await getInterviews()
  stats.value.interviews = interviews.length
})

function handleMenuSelect(key) {
  activeMenu.value = key
  window.location.href = `/${key}`
}

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('company')
  window.location.href = '/'
}

function formatSalary(row) {
  return `${row.salary_min}-${row.salary_max}K`
}

function formatStatus(row) {
  const statusMap = {
    active: '进行中',
    offline: '已下架',
    closed: '已关闭'
  }
  return statusMap[row.status] || row.status
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info span {
  font-size: 14px;
}

.user-info button {
  color: white;
}

.aside {
  background: #2f4050;
}

.aside .el-menu {
  border-right: none;
  height: 100%;
}

.aside .el-menu-item {
  color: #a7b1c2;
  border-bottom: 1px solid #293846;
}

.aside .el-menu-item.is-active {
  background: #1ab394;
  color: white;
}

.main {
  padding: 20px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: white;
}

.jobs-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.resumes-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.interviews-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.favorites-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.recent-jobs {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.recent-jobs h3 {
  margin-bottom: 20px;
  font-size: 16px;
  color: #333;
}
</style>
