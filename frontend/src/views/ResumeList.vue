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
          <div class="resume-header">
            <h2>简历管理</h2>
            <el-select v-model="filterStatus" placeholder="筛选状态">
              <el-option label="全部" value="" />
              <el-option label="待沟通" value="pending" />
              <el-option label="已面试" value="interviewing" />
              <el-option label="已录用" value="hired" />
            </el-select>
            <el-checkbox v-model="filterFavorite" label="仅看收藏" />
          </div>
          <el-table :data="resumes" border>
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="phone" label="电话" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="education" label="学历" />
            <el-table-column prop="experience" label="经验" />
            <el-table-column prop="status" label="状态" :formatter="formatStatus" />
            <el-table-column prop="is_favorite" label="收藏" :formatter="formatFavorite" />
            <el-table-column prop="created_at" label="投递时间" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button @click="handleView(scope.row)" size="small">查看详情</el-button>
                <el-button @click="handleFavorite(scope.row)" size="small">{{ scope.row.is_favorite ? '取消收藏' : '收藏' }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { HomeFilled, Box, Briefcase, User } from '@element-plus/icons-vue'
import { getResumes, toggleFavorite } from '../utils/api'
import { ElMessage } from 'element-plus'

const icons = { Home: HomeFilled, Building: Box, Briefcase, FileText: Briefcase, User }
const activeMenu = ref('resumes')
const companyName = ref('')
const resumes = ref([])
const filterStatus = ref('')
const filterFavorite = ref(false)

onMounted(async () => {
  const companyData = JSON.parse(localStorage.getItem('company') || '{}')
  companyName.value = companyData.name || ''
  await loadResumes()
})

watch([filterStatus, filterFavorite], async () => {
  await loadResumes()
})

async function loadResumes() {
  const params = {}
  if (filterStatus.value) params.status = filterStatus.value
  if (filterFavorite.value) params.is_favorite = 1
  
  const data = await getResumes(params)
  if (data && !data.error) {
    resumes.value = data
  }
}

function handleMenuSelect(key) {
  activeMenu.value = key
  window.location.href = `/${key}`
}

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('company')
  window.location.href = '/'
}

function handleView(row) {
  window.location.href = `/resumes/${row.id}`
}

async function handleFavorite(row) {
  const newStatus = row.is_favorite ? 0 : 1
  const result = await toggleFavorite(row.id, newStatus)
  if (result.error) {
    ElMessage.error(result.error)
  } else {
    row.is_favorite = newStatus
    ElMessage.success(row.is_favorite ? '已收藏' : '已取消收藏')
  }
}

function formatStatus(row) {
  const statusMap = {
    pending: '待沟通',
    interviewing: '已面试',
    hired: '已录用'
  }
  return statusMap[row.status] || row.status
}

function formatFavorite(row) {
  return row.is_favorite ? '是' : '否'
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

.resume-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.resume-header h2 {
  font-size: 18px;
  color: #333;
}

.resume-header .el-select {
  width: 150px;
}
</style>
