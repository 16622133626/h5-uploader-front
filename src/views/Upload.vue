<template>
  <div class="upload-container">
    <div class="user-info-card">
        <div class="user-avatar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="user-details">
          <div class="user-name">{{ authStore.userDisplayName || authStore.currentUser }}</div>
          <div class="user-role">管理员</div>
        </div>
        <button @click="handleLogout" class="logout-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>退出登录</span>
        </button>
      </div>

    <div class="upload-content">
      <div class="upload-box">
        <div class="upload-area">
          <input
            type="file"
            id="file-input"
            accept="image/*"
            @change="handleFileChange"
            class="file-input"
          />
          <label for="file-input" class="file-label">
            <img v-if="preview" :src="preview" alt="预览" class="preview-image" />
            <div v-else class="upload-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p>点击或拖拽图片到此处</p>
              <p class="upload-hint">支持 JPG、PNG、GIF 等格式</p>
            </div>
          </label>
        </div>

        <div v-if="selectedFile" class="file-info">
          <p>文件名: {{ selectedFile.name }}</p>
          <p>大小: {{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
        </div>

        <!-- 分类选择 -->
        <div class="form-section">
          <label class="form-label">图片分类 <span class="required">*</span></label>
          <select v-model="selectedCategory" class="form-select" required>
            <option value="">请选择分类</option>
            <optgroup v-for="group in categories" :key="group.group" :label="group.group">
              <option v-for="option in group.options" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </optgroup>
          </select>
        </div>

        <!-- 图片名称输入 -->
        <div class="form-section">
          <label class="form-label">图片名称 <span class="required">*</span></label>
          <input
            v-model="imageName"
            type="text"
            class="form-input"
            placeholder="请输入图片名称"
            maxlength="50"
            required
          />
        </div>

        <div v-if="message" :class="['message', message.includes('成功') ? 'success' : 'error']">
          {{ message }}
        </div>

        <button
          @click="handleUpload"
          :disabled="!selectedFile || !selectedCategory || !imageName || uploading"
          class="upload-button"
        >
          {{ uploading ? '上传中...' : '上传图片' }}
        </button>

        <button @click="goToGallery" class="view-gallery-button">
          查看图片列表
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { uploadImage } from '../utils/api'
import { categories } from '../utils/categories'

const router = useRouter()
const authStore = useAuthStore()

const selectedFile = ref(null)
const preview = ref(null)
const uploading = ref(false)
const message = ref('')
const selectedCategory = ref('')
const imageName = ref('')

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (!file.type.startsWith('image/')) {
      message.value = '请选择图片文件'
      return
    }
    selectedFile.value = file
    message.value = ''
    
    // 如果图片名称为空，使用文件名（不含扩展名）作为默认名称
    if (!imageName.value) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      imageName.value = nameWithoutExt
    }
    
    // 创建预览
    const reader = new FileReader()
    reader.onloadend = () => {
      preview.value = reader.result
    }
    reader.readAsDataURL(file)
  }
}

const handleUpload = async () => {
  if (!selectedFile.value) {
    message.value = '请先选择图片'
    return
  }

  if (!selectedCategory.value) {
    message.value = '请选择图片分类'
    return
  }

  if (!imageName.value || !imageName.value.trim()) {
    message.value = '请输入图片名称'
    return
  }

  uploading.value = true
  message.value = ''

  try {
    const result = await uploadImage(
      selectedFile.value,
      authStore.currentUser,
      selectedCategory.value,
      imageName.value.trim()
    )
    
    if (result.success) {
      message.value = '上传成功！'
      selectedFile.value = null
      preview.value = null
      selectedCategory.value = ''
      imageName.value = ''
      setTimeout(() => {
        router.push('/gallery')
      }, 1000)
    } else {
      message.value = result.message || '上传失败，请重试'
    }
  } catch (error) {
    message.value = error.message || '上传失败，请重试'
  } finally {
    uploading.value = false
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const goToGallery = () => {
  router.push('/gallery')
}
</script>

<style scoped>
.upload-container {
  min-height: 100vh;
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 10px;
}

.user-info-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #D4A574 0%, #C19A6B 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(196, 154, 107, 0.3);
  margin-bottom: 20px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.user-name {
  color: white;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.logout-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.logout-button svg {
  flex-shrink: 0;
}

.upload-content {
  display: flex;
  justify-content: center;
}

.upload-box {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 600px;
}

.upload-area {
  margin-bottom: 24px;
}

.file-input {
  display: none;
}

.file-label {
  display: block;
  cursor: pointer;
  border: 3px dashed #D4A574;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  transition: all 0.3s ease;
  background: #FFF8F0;
}

.file-label:hover {
  border-color: #C19A6B;
  background: #FFE4E1;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #D4A574;
}

.upload-placeholder svg {
  stroke-width: 2;
}

.upload-placeholder p {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.upload-hint {
  font-size: 14px;
  color: #999;
  font-weight: 400;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  object-fit: contain;
}

.file-info {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.file-info p {
  margin: 4px 0;
}

.message {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 14px;
}

.message.success {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.message.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

.upload-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #D4A574 0%, #C19A6B 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-bottom: 12px;
}

.upload-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(196, 154, 107, 0.4);
}

.upload-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.view-gallery-button {
  width: 100%;
  padding: 12px;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-gallery-button {
  border-color: #D4A574;
  color: #D4A574;
}

.view-gallery-button:hover {
  background: #D4A574;
  color: white;
}

.form-section {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
}

.required {
  color: #f44336;
}

.form-select,
.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  outline: none;
  font-family: inherit;
}

.form-select:focus,
.form-input:focus {
  border-color: #D4A574;
  box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

.form-select {
  background-color: white;
  cursor: pointer;
}

.form-select option {
  padding: 8px;
}
</style>

