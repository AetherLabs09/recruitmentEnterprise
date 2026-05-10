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
          <div class="interview-header">
            <h2>面试管理</h2>
          </div>
          <el-table :data="interviews" border>
            <el-table-column prop="candidate_name" label="候选人" />
            <el-table-column prop="candidate_phone" label="联系电话" />
            <el-table-column prop="job_title" label="应聘岗位" />
            <el-table-column prop="interview_time" label="面试时间" />
            <el-table-column prop="location" label="面试地点" />
            <el-table-column prop="status" label="状态" :formatter="formatStatus" />
            <el-table-column prop="created_at" label="创建时间" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button @click="handleEdit(scope.row)" size="small">编辑</el-button>
                <el-button @click="handleDelete(scope.row)" size="small" type="danger">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-main>
      </el-container>
    </el-container>
    
    <el-dialog title="编辑面试" :visible.sync="showEditModal">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="面试时间">
          <el-date-picker v-model="editForm.interview_time" type="datetime" placeholder="选择面试时间" />
        </el-form-item>
        <el-form-item label="面试地点">
          <el-input v-model="editForm.location" placeholder="请输入面试地点" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status">
            <el-option label="已安排" value="scheduled" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditModal = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitEdit">保存修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { HomeFilled, Box, Briefcase, User } from '@element-plus/icons-vue'
import { getInterviews, updateInterview, deleteInterview } from '../utils/api'
import { ElMessage } from 'element-plus'

const icons = { Home: HomeFilled, Building: Box, Briefcase, FileText: Briefcase, User }
const activeMenu = ref('interviews')
const companyName = ref('')
const interviews = ref([])
const showEditModal = ref(false)
const editForm = ref({
  id: '',
  interview_time: '',
  location: '',
  status: 'scheduled'
})

onMounted(async () => {
  const companyData = JSON.parse(localStorage.getItem('company') || '{}')
  companyName.value = companyData.name || ''
  
  const data = await getInterviews()
  if (data && !data.error) {
    interviews.value = data
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

function handleEdit(row) {
  editForm.value = {
    id: row.id,
    interview_time: row.interview_time,
    location: row.location,
    status: row.status
  }
  showEditModal.value = true
}

async function handleSubmitEdit() {
  const result = await updateInterview(editForm.value.id, editForm.value)
  if (result.error) {
    ElMessage.error(result.error)
  } else {
    ElMessage.success('修改成功')
    showEditModal.value = false
    const index = interviews.value.findIndex(i => i.id === editForm.value.id)
    if (index !== -1) {
      interviews.value[index] = { ...interviews.value[index], ...editForm.value }
    }
  }
}

async function handleDelete(row) {
  const result = await deleteInterview(row.id)
  if (result.error) {
    ElMessage.error(result.error)
  } else {
    interviews.value = interviews.value.filter(i => i.id !== row.id)
    ElMessage.success('删除成功')
  }
}

function formatStatus(row) {
  const statusMap = {
    scheduled: '已安排',
    completed: '已完成',
    cancelled: '已取消'
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

.interview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.interview-header h2 {
  font-size: 18px;
  color: #333;
}
</style>
