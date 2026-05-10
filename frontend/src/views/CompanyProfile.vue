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
          <div class="profile-container">
            <h2>企业资料</h2>
            <el-form :model="form" label-width="120px">
              <el-form-item label="企业名称">
                <el-input v-model="form.name" />
              </el-form-item>
              <el-form-item label="联系人">
                <el-input v-model="form.contact_name" />
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="form.phone" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="form.email" />
              </el-form-item>
              <el-form-item label="地址">
                <el-input v-model="form.address" />
              </el-form-item>
              <el-form-item label="营业执照号">
                <el-input v-model="form.license_number" />
              </el-form-item>
              <el-form-item label="营业执照">
                <el-upload action="/api/company/verify" :headers="uploadHeaders">
                  <el-button type="primary">上传营业执照</el-button>
                </el-upload>
                <div v-if="form.business_license" class="license-preview">
                  <img :src="form.business_license" alt="营业执照" />
                </div>
              </el-form-item>
              <el-form-item label="审核状态">
                <el-tag :type="getStatusType(form.status)">{{ getStatusText(form.status) }}</el-tag>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSave">保存资料</el-button>
                <el-button type="success" @click="handleVerify">提交资质认证</el-button>
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
import { getCompanyProfile, updateCompanyProfile } from '../utils/api'
import { ElMessage } from 'element-plus'

const icons = { Home: HomeFilled, Building: Box, Briefcase, FileText: Briefcase, User }
const activeMenu = ref('company/profile')
const company = ref({ name: '' })
const form = ref({
  name: '',
  contact_name: '',
  phone: '',
  email: '',
  address: '',
  license_number: '',
  business_license: '',
  status: 'pending'
})

const uploadHeaders = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}

onMounted(async () => {
  const data = await getCompanyProfile()
  if (data) {
    company.value = data
    form.value = { ...data }
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

async function handleSave() {
  const result = await updateCompanyProfile(form.value)
  if (result.error) {
    ElMessage.error(result.error)
  } else {
    ElMessage.success('保存成功')
  }
}

async function handleVerify() {
  if (!form.value.license_number) {
    ElMessage.error('请填写营业执照号')
    return
  }
  ElMessage.success('资质认证已提交，等待审核')
}

function getStatusType(status) {
  const typeMap = {
    pending: 'warning',
    verified: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

function getStatusText(status) {
  const textMap = {
    pending: '待审核',
    verified: '已认证',
    rejected: '未通过'
  }
  return textMap[status] || status
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

.profile-container {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.profile-container h2 {
  margin-bottom: 30px;
  font-size: 18px;
  color: #333;
}

.license-preview {
  margin-top: 10px;
  width: 200px;
}

.license-preview img {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
