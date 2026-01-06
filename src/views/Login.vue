<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="login-title">婚纱录入</h1>
      <h2 class="login-subtitle">登录</h2>
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            type="text"
            v-model="username"
            placeholder="请输入用户名"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            type="password"
            v-model="password"
            placeholder="请输入密码"
            required
          />
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <button type="submit" class="login-button">登录</button>
      </form>
      <div class="login-hint">
        <p>提示：不同账号拥有不同权限</p>
        <p><strong>管理员账号：</strong>admin/admin123 或 uploader/upload123</p>
        <!-- <p><strong>客户账号：</strong>customer/customer123</p> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')

onMounted(() => {
  if (authStore.isAuthenticated) {
    // 如果是管理员，跳转到上传页面；如果是客户，跳转到列表页
    if (authStore.isOwner) {
      router.push('/upload')
    } else {
      router.push('/gallery')
    }
  }
})

const handleSubmit = () => {
  error.value = ''
  const result = authStore.login(username.value, password.value)
  if (result.success) {
    // 如果是管理员，跳转到上传页面；如果是客户，跳转到列表页
    if (authStore.isOwner) {
      router.push('/upload')
    } else {
      router.push('/gallery')
    }
  } else {
    error.value = result.message
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-box {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
  width: 100%;
  max-width: 420px;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #C19A6B;
  text-align: center;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 20px;
  font-weight: 500;
  color: #333;
  text-align: center;
  margin-bottom: 32px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  outline: none;
}

.form-group input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.login-button {
  padding: 14px;
  background: linear-gradient(135deg, #D4A574 0%, #C19A6B 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-top: 8px;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  border: 1px solid #fcc;
}

.login-hint {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
  text-align: center;
  font-size: 13px;
  color: #888;
  line-height: 1.6;
}

.login-hint p {
  margin: 4px 0;
}
</style>






