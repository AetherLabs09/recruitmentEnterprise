<template>
  <div class="register-container">
    <div class="register-box">
      <h2>企业入驻</h2>
      <el-form :model="form" label-width="100px">
        <el-form-item label="企业名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="联系人" prop="contact_name">
          <el-input v-model="form.contact_name" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱（选填）" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入企业地址（选填）" />
        </el-form-item>
        <el-form-item label="营业执照号" prop="license_number">
          <el-input v-model="form.license_number" placeholder="请输入营业执照号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="form.password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRegister" class="register-btn">注册</el-button>
        </el-form-item>
      </el-form>
      <p class="login-link">
        已有账号？<a href="/">立即登录</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { register } from '../utils/api'
import { ElMessage } from 'element-plus'

const form = ref({
  name: '',
  contact_name: '',
  phone: '',
  email: '',
  address: '',
  license_number: '',
  password: ''
})

async function handleRegister() {
  if (!form.value.name || !form.value.contact_name || !form.value.phone || !form.value.password) {
    ElMessage.error('请填写必填字段')
    return
  }

  const result = await register(form.value)
  if (result.error) {
    ElMessage.error(result.error)
  } else {
    ElMessage.success('注册成功，请登录')
    window.location.href = '/'
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.register-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.register-btn {
  width: 100%;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
}
</style>
