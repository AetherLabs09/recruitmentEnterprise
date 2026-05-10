<template>
  <div class="dashboard">
    <el-container>
      <el-header class="header">
        <div class="logo">招聘管理系统</div>
        <div class="user-info">
          <span>{{ companyName }}</span>
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
          <div class="job-header">
            <h2>岗位管理</h2>
            <el-button type="primary" @click="handleCreate">新建岗位</el-button>
          </div>
          <el-table :data="jobs" border>
            <el-table-column prop="title" label="岗位名称" />
            <el-table-column prop="salary_min" label="薪资" :formatter="formatSalary" />
            <el-table-column prop="location" label="地点" />
            <el-table-column prop="status" label="状态" :formatter="formatStatus" />
            <el-table-column prop="created_at" label="发布时间" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button @click="handleEdit(scope.row)" size="small">编辑</el-button>
                <el-button v-if="scope.row.status === 'active'" @click="handleOffline(scope.row)" size="small" type="warning">下架</el-button>
                <el-button v-if="scope.row.status !== 'closed'" @click="handleRefresh(scope.row)" size="small">刷新</el-button>
                <el-button @click="handleClose(scope.row)" size="small" type="danger">关闭招聘</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { HomeFilled, Box, Briefcase, User } from '@element-plus/icons-vue'
import { getJobs, updateJobStatus, refreshJob, deleteJob } from '../utils/api'
import { ElMessage } from 'element-plus'

const icons = { Home: HomeFilled, Building: Box, Briefcase, FileText: Briefcase, User }
const activeMenu = ref('jobs')
const companyName = ref('')
const jobs = ref([])

onMounted(async () => {
  const companyData = JSON.parse(localStorage.getItem('company') || '{}')
  companyName.value = companyData.name || ''
  
  const data = await getJobs()
  if (data && !data.error) {
    jobs.value = data
  }
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

function handleCreate() {
  window.location.href = '/jobs/create'
}

function handleEdit(row) {
  window.location.href = `/jobs/edit/${row.id}`
}

async function handleOffline(row) {
  const result = await updateJobStatus(row.id, 'offline')
  if (result.error) {
    ElMessage.error(result.error)
  } else {
    row.status = 'offline'
    ElMessage.success('已下架')
  }
}

async function handleRefresh(row) {
  const result = await refreshJob(row.id)
  if (result.error) {
    ElMessage.error(result.error)
  } else {
    row.updated_at = new Date().toISOString()
    ElMessage.success('已刷新')
  }
}

async function handleClose(row) {
  const result = await deleteJob(row.id)
  if (result.error) {
    ElMessage.error(result.error)
  } else {
    jobs.value = jobs.value.filter(j => j.id !== row.id)
    ElMessage.success('已关闭')
  }
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

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.job-header h2 {
  font-size: 18px;
  color: #333;
}
</style>
