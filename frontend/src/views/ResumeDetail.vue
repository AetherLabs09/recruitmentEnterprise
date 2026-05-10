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
          <div class="resume-detail-container">
            <h2>简历详情</h2>
            <el-card v-if="resume">
              <el-form :model="resume" label-width="100px">
                <el-form-item label="姓名">
                  {{ resume.name }}
                </el-form-item>
                <el-form-item label="电话">
                  {{ resume.phone }}
                </el-form-item>
                <el-form-item label="邮箱">
                  {{ resume.email || '-' }}
                </el-form-item>
                <el-form-item label="学历">
                  {{ resume.education || '-' }}
                </el-form-item>
                <el-form-item label="工作经验">
                  {{ resume.experience || '-' }}
                </el-form-item>
                <el-form-item label="技能特长">
                  {{ resume.skills || '-' }}
                </el-form-item>
                <el-form-item label="简历附件">
                  <a v-if="resume.resume_file" :href="resume.resume_file" target="_blank">下载简历</a>
                  <span v-else>-</span>
                </el-form-item>
                <el-form-item label="投递岗位">
                  {{ jobTitle }}
                </el-form-item>
                <el-form-item label="当前状态">
                  <el-select v-model="status" @change="handleStatusChange">
                    <el-option label="待沟通" value="pending" />
                    <el-option label="已面试" value="interviewing" />
                    <el-option label="已录用" value="hired" />
                  </el-select>
                </el-form-item>
              </el-form>
              <div class="actions">
                <el-button type="primary" @click="handleCreateInterview">发起面试邀约</el-button>
                <el-button @click="handleBack">返回列表</el-button>
              </div>
            </el-card>
          </div>
        </el-main>
      </el-container>
    </el-container>
    
    <el-dialog title="发起面试邀约" :visible.sync="showInterviewModal">
      <el-form :model="interviewForm" label-width="100px">
        <el-form-item label="面试时间">
          <el-date-picker v-model="interviewForm.interview_time" type="datetime" placeholder="选择面试时间" />
        </el-form-item>
        <el-form-item label="面试地点">
          <el-input v-model="interviewForm.location" placeholder="请输入面试地点" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInterviewModal = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitInterview">确认发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { HomeFilled, Box, Briefcase, User } from '@element-plus/icons-vue'
import { getResume, updateResumeStatus, createInterview, getJob } from '../utils/api'
import { ElMessage } from 'element-plus'

const icons = { Home: HomeFilled, Building: Box, Briefcase, FileText: Briefcase, User }
const activeMenu = ref('resumes')
const companyName = ref('')
const resume = ref({})
const jobTitle = ref('')
const status = ref('')
const showInterviewModal = ref(false)
const interviewForm = ref({
  interview_time: '',
  location: ''
})

onMounted(async () => {
  const companyData = JSON.parse(localStorage.getItem('company') || '{}')
  companyName.value = companyData.name || ''
  
  const path = window.location.pathname
  const id = path.split('/').pop()
  
  const data = await getResume(id)
  if (data && !data.error) {
    resume.value = data
    status.value = data.status
    
    const job = await getJob(data.job_id)
    if (job && !job.error) {
      jobTitle.value = job.title
    }
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

function handleBack() {
  window.location.href = '/resumes'
}

async function handleStatusChange() {
  const result = await updateResumeStatus(resume.value.id, status.value)
  if (result.error) {
    ElMessage.error(result.error)
  } else {
    ElMessage.success('状态更新成功')
  }
}

function handleCreateInterview() {
  showInterviewModal.value = true
}

async function handleSubmitInterview() {
  if (!interviewForm.value.interview_time) {
    ElMessage.error('请选择面试时间')
    return
  }
  
  const result = await createInterview({
    resume_id: resume.value.id,
    interview_time: interviewForm.value.interview_time,
    location: interviewForm.value.location
  })
  
  if (result.error) {
    ElMessage.error(result.error)
  } else {
    ElMessage.success('面试邀约已发送')
    showInterviewModal.value = false
    status.value = 'interviewing'
  }
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

.resume-detail-container {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.resume-detail-container h2 {
  margin-bottom: 30px;
  font-size: 18px;
  color: #333;
}

.actions {
  margin-top: 30px;
  display: flex;
  gap: 10px;
}
</style>
