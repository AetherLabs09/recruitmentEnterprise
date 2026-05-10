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
          <div class="job-form-container">
            <h2>新建岗位</h2>
            <el-form :model="form" label-width="100px">
              <el-form-item label="岗位名称">
                <el-input v-model="form.title" placeholder="请输入岗位名称" />
              </el-form-item>
              <el-form-item label="薪资范围">
                <el-input-number v-model="form.salary_min" :min="1" :max="1000" style="width: 120px" />
                <span style="margin: 0 10px;">-</span>
                <el-input-number v-model="form.salary_max" :min="1" :max="1000" style="width: 120px" />
                <span style="margin-left: 10px;">K/月</span>
              </el-form-item>
              <el-form-item label="工作地点">
                <el-input v-model="form.location" placeholder="请输入工作地点" />
              </el-form-item>
              <el-form-item label="岗位职责">
                <el-input type="textarea" v-model="form.responsibilities" placeholder="请输入岗位职责" :rows="4" />
              </el-form-item>
              <el-form-item label="任职要求">
                <el-input type="textarea" v-model="form.requirements" placeholder="请输入任职要求" :rows="4" />
              </el-form-item>
              <el-form-item label="福利待遇">
                <el-input type="textarea" v-model="form.benefits" placeholder="请输入福利待遇" :rows="4" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSubmit">发布岗位</el-button>
                <el-button @click="handleCancel">取消</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { HomeFilled, Box, Briefcase, User } from '@element-plus/icons-vue'
import { createJob } from '../utils/api'
import { ElMessage } from 'element-plus'

const icons = { Home: HomeFilled, Building: Box, Briefcase, FileText: Briefcase, User }
const activeMenu = ref('jobs')
const companyName = ref('')
const form = ref({
  title: '',
  salary_min: '',
  salary_max: '',
  location: '',
  responsibilities: '',
  requirements: '',
  benefits: ''
})

onMounted(() => {
  const companyData = JSON.parse(localStorage.getItem('company') || '{}')
  companyName.value = companyData.name || ''
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

async function handleSubmit() {
  if (!form.value.title || !form.value.salary_min || !form.value.salary_max) {
    ElMessage.error('请填写必填字段')
    return
  }
  
  const result = await createJob(form.value)
  if (result.error) {
    ElMessage.error(result.error)
  } else {
    ElMessage.success('岗位发布成功')
    window.location.href = '/jobs'
  }
}

function handleCancel() {
  window.location.href = '/jobs'
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

.job-form-container {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.job-form-container h2 {
  margin-bottom: 30px;
  font-size: 18px;
  color: #333;
}
</style>
