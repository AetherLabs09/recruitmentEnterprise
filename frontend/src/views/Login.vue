<template>
  <div class="login-container">
    <div class="login-box">
      <h2>企业登录</h2>
      <el-form :model="form" label-width="80px">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="form.password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" class="login-btn">登录</el-button>
        </el-form-item>
      </el-form>
      <p class="register-link">
        还没有账号？<a href="/register">立即注册</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { login } from '../utils/api'
import { ElMessage } from 'element-plus'

const form = ref({
  phone: '',
  password: ''
})

async function handleLogin() {
  if (!form.value.phone || !form.value.password) {
    ElMessage.error('请填写手机号和密码')
    return
  }

  const result = await login(form.value.phone, form.value.password)
  if (result.error) {
    ElMessage.error(result.error)
  } else {
    localStorage.setItem('token', result.token)
    localStorage.setItem('company', JSON.stringify(result.company))
    ElMessage.success('登录成功')
    window.location.href = '/dashboard'
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 400px;
}

.login-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.login-btn {
  width: 100%;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
}
</style>
