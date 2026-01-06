<template>
  <div class="upload-container">
    <!-- Admin 上传页弹框 -->
    <div v-if="showAdminModal" class="admin-modal" @click.self="closeAdminModal">
      <div class="admin-modal-content" :class="{ 'modal-shake': modalShake }">
        <!-- 右上角小字 -->
        <transition name="sparkle">
          <div v-if="showSparkleText" class="sparkle-text">
            {{ sparkleText }}
          </div>
        </transition>
        
        <!-- 主文案 -->
        <h2 class="admin-modal-title">
          {{ randomText }}
        </h2>
        
        <!-- 按钮组 -->
        <div class="admin-modal-buttons">
          <button 
            @click="handleStartWork" 
            @mouseenter="onMainButtonHover"
            @mouseleave="onMainButtonLeave"
            class="admin-btn admin-btn-primary"
          >
            <span class="btn-text">{{ mainButtonText }}</span>
            <span class="btn-emoji">💼</span>
          </button>
          
          <button 
            @click="closeAdminModal" 
            class="admin-btn admin-btn-secondary"
          >
            <span class="btn-text">{{ secondaryButtonText }}</span>
            <span class="btn-emoji">💧</span>
          </button>
        </div>
      </div>
    </div>

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
import { ref, onMounted } from 'vue'
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

// Admin 弹框相关
const showAdminModal = ref(false)
const modalShake = ref(false)
const showSparkleText = ref(false)
const sparkleText = ref('')
const mainButtonText = ref('开工！')
const secondaryButtonText = ref('先喝口水再干')

// 随机文案池
const randomTexts = [
  '大小姐上线，开始打工赚钱了。',
  '老板娘今天也在亲自搞事业。',
  '为浪漫打工的一天开始了。',
  '今天也要靠自己养活轻奢。',
  '幸福不是自动生成的。'
]

const randomText = ref('')

// 随机彩蛋文案
const sparkleTexts = [
  '系统很懂事，没有打卡。',
  '今天也要为幸福 KPI 努力 ✨',
  '老板娘正在努力...',
  '轻奢不是随便的 💎'
]

// 检查是否需要显示弹框
onMounted(() => {
  // 只有owner账号才显示
  if (authStore.isOwner) {
    // 检查今天是否已经显示过（可选，也可以每次都显示）
    const today = new Date().toDateString()
    const lastShown = localStorage.getItem('adminModalLastShown')
    
    // 如果今天没显示过，或者每次都显示（注释掉日期检查即可）
    if (!lastShown || lastShown !== today) {
      // 随机选择文案
      randomText.value = randomTexts[Math.floor(Math.random() * randomTexts.length)]
      
      // 延迟显示，让页面先加载
      setTimeout(() => {
        showAdminModal.value = true
        // 轻微抖动效果
        modalShake.value = true
        setTimeout(() => {
          modalShake.value = false
        }, 500)
        
        // 随机显示右上角小字
        if (Math.random() > 0.5) {
          setTimeout(() => {
            sparkleText.value = sparkleTexts[Math.floor(Math.random() * sparkleTexts.length)]
            showSparkleText.value = true
            setTimeout(() => {
              showSparkleText.value = false
            }, 2000)
          }, 800)
        }
      }, 300)
    }
  }
})

// 关闭弹框
const closeAdminModal = () => {
  showAdminModal.value = false
  const today = new Date().toDateString()
  localStorage.setItem('adminModalLastShown', today)
}

// 主按钮点击
const handleStartWork = () => {
  closeAdminModal()
}

// 主按钮hover效果
const onMainButtonHover = () => {
  mainButtonText.value = '算了，还是我来吧'
}

const onMainButtonLeave = () => {
  mainButtonText.value = '开工！'
}

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

/* ========== Admin 弹框样式 ========== */
.admin-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.admin-modal-content {
  position: relative;
  background: linear-gradient(135deg, #FFF8F0 0%, #FFE4E1 100%);
  border-radius: 20px;
  padding: 40px 36px;
  max-width: 480px;
  width: 100%;
  text-align: center;
  box-shadow: 0 16px 48px rgba(212, 165, 116, 0.35);
  border: 2px solid rgba(212, 165, 116, 0.25);
  animation: contentSlideIn 0.3s ease;
}

@keyframes contentSlideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 轻微左右抖动效果（像打工人叹气） */
.modal-shake {
  animation: modalShake 0.5s ease;
}

@keyframes modalShake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

/* 主文案 */
.admin-modal-title {
  font-size: 24px;
  font-weight: 600;
  color: #8B6F47;
  line-height: 1.5;
  margin: 0 0 32px 0;
  letter-spacing: 0.5px;
}

/* 按钮组 */
.admin-modal-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.admin-btn {
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.admin-btn-primary {
  background: linear-gradient(135deg, #D4A574 0%, #C19A6B 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(212, 165, 116, 0.4);
}

.admin-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 165, 116, 0.5);
}

.admin-btn-primary:active {
  transform: translateY(0);
}

.admin-btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #D4A574;
  border: 2px solid rgba(212, 165, 116, 0.3);
}

.admin-btn-secondary:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(212, 165, 116, 0.5);
  transform: translateY(-1px);
}

.btn-text {
  transition: all 0.3s ease;
}

.btn-emoji {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.admin-btn:hover .btn-emoji {
  transform: scale(1.15) rotate(5deg);
}

/* 右上角彩蛋文案 */
.sparkle-text {
  position: absolute;
  top: -35px;
  right: 20px;
  font-size: 13px;
  color: #C19A6B;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.9);
  padding: 6px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(212, 165, 116, 0.2);
  white-space: nowrap;
  animation: sparkleFloat 2s ease;
  pointer-events: none;
}

@keyframes sparkleFloat {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.9);
  }
  50% {
    opacity: 1;
    transform: translateY(-8px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-16px) scale(0.9);
  }
}

.sparkle-enter-active,
.sparkle-leave-active {
  transition: opacity 0.3s ease;
}

.sparkle-enter-from,
.sparkle-leave-to {
  opacity: 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .admin-modal-content {
    padding: 32px 24px;
    max-width: 90%;
  }

  .admin-modal-title {
    font-size: 20px;
  }

  .admin-btn {
    font-size: 15px;
    padding: 12px 20px;
  }
}
</style>

