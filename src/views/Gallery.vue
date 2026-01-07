<template>
  <div class="gallery-container">
    <div class="header-right">
        <!-- 已登录用户信息 -->
        <div v-if="authStore.isAuthenticated" class="user-info-card">
          <div class="user-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="user-details">
            <div class="user-name">{{ authStore.userDisplayName || authStore.currentUser }}</div>
            <div class="user-role">{{ authStore.isOwner ? '管理员' : '客户' }}</div>
          </div>
          <button @click="handleLogout" class="logout-button" title="退出登录">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
          <!-- 管理员上传按钮 -->
        <div v-if="authStore.isOwner" class="gallery-actions">
          <button
            @click="goToUpload"
            class="upload-link-button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>上传图片</span>
          </button>
        </div>
        </div>
        
      </div>

    <!-- 分类筛选和布局切换 -->
    <div class="filter-section">
      <div class="filter-content">
        <div class="filter-group">
          <button @click="showFilterModal = true" class="filter-button">
            <div class="filter-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </div>
            <span class="filter-button-text">
              {{ selectedFilterCategory ? getCategoryLabel(selectedFilterCategory) : '全部分类' }}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="filter-arrow">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <span v-if="selectedFilterCategory" class="filter-count">
            <span class="count-number">{{ filteredImages.length }}</span>
            <span class="count-text">张</span>
          </span>
        </div>
        <div class="layout-switcher">
          <button
            @click="layoutMode = 'list'"
            :class="['layout-btn', { active: layoutMode === 'list' }]"
            title="列表布局"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
          <button
            @click="layoutMode = 'grid'"
            :class="['layout-btn', { active: layoutMode === 'grid' }]"
            title="网格布局"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 分类筛选弹框 -->
    <div v-if="showFilterModal" class="filter-modal" @click.self="showFilterModal = false">
      <div class="filter-modal-content">
        <div class="filter-modal-header">
          <h3 class="filter-modal-title">选择分类</h3>
          <button @click="showFilterModal = false" class="filter-modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="filter-modal-body">
          <!-- 全部选项 -->
          <button
            @click="selectCategory('')"
            :class="['filter-option', 'filter-option-all', { active: !selectedFilterCategory }]"
          >
            <span class="filter-option-text">全部分类</span>
            <span v-if="!selectedFilterCategory" class="filter-option-check">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          </button>

          <!-- 分组分类 -->
          <div v-for="group in categories" :key="group.group" class="filter-group-section">
            <div class="filter-group-title">{{ group.group }}</div>
            <div class="filter-options-grid">
              <button
                v-for="option in group.options"
                :key="option.value"
                @click="selectCategory(option.value)"
                :class="['filter-option', { active: selectedFilterCategory === option.value }]"
              >
                <span class="filter-option-text">{{ option.label }}</span>
                <span v-if="selectedFilterCategory === option.value" class="filter-option-check">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="images.length === 0" class="empty-gallery">
      <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
      <p>暂无图片</p>
    </div>

    <!-- 列表布局 -->
    <div v-else-if="layoutMode === 'list'" class="gallery-list">
      <div v-for="image in filteredImages" :key="image.id" class="gallery-item gallery-item-list">
        <div class="image-wrapper" @click="openPreview(image)">
          <img :src="image.url" :alt="image.name" />
          <div class="image-overlay">
            <div class="preview-hint">点击预览</div>
          </div>
        </div>
        <div class="image-info">
          <p class="image-name">{{ image.name }}</p>
          <div class="image-tags">
            <span v-if="image.category" class="category-tag">
              {{ getCategoryLabel(image.category) }}
            </span>
          </div>
          <p class="image-meta">
            {{ image.uploader }} · {{ image.uploadTime }}
          </p>
          <!-- 删除按钮（仅管理员可见，右下角） -->
          <button
            v-if="authStore.isOwner"
            @click.stop="showDeleteConfirm(image.id)"
            class="delete-button-trash"
            title="删除"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 网格布局 -->
    <div v-else class="gallery-grid">
      <div v-for="image in filteredImages" :key="image.id" class="gallery-item gallery-item-grid">
        <div class="image-wrapper-grid" @click="openPreview(image)">
          <img :src="image.url" :alt="image.name" />
          <div class="image-overlay">
            <div class="preview-hint">点击预览</div>
          </div>
        </div>
        <div class="image-info-grid">
          <p class="image-name">{{ image.name }}</p>
          <div class="image-tags">
            <span v-if="image.category" class="category-tag">
              {{ getCategoryLabel(image.category) }}
            </span>
          </div>
          <p class="image-meta">
            {{ image.uploader }} · {{ image.uploadTime }}
          </p>
          <!-- 删除按钮（仅管理员可见，右下角） -->
          <button
            v-if="authStore.isOwner"
            @click.stop="showDeleteConfirm(image.id)"
            class="delete-button-trash"
            title="删除"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 图片预览模态框 -->
    <div v-if="previewImage" class="preview-modal" @click="closePreview">
      <div class="preview-content" @click.stop>
        <button class="preview-close" @click="closePreview">×</button>
        <img :src="previewImage.url" :alt="previewImage.name" class="preview-img" />
        <div class="preview-info">
          <h3>{{ previewImage.name }}</h3>
          <div class="preview-tags">
            <span v-if="previewImage.category" class="category-tag">
              {{ getCategoryLabel(previewImage.category) }}
            </span>
          </div>
          <p class="preview-meta">
            {{ previewImage.uploader }} · {{ previewImage.uploadTime }}
          </p>
        </div>
      </div>
    </div>

    <!-- 删除确认弹框 -->
    <div v-if="showDeleteConfirmModal" class="delete-confirm-modal" @click.self="closeDeleteConfirm">
      <div class="delete-confirm-content">
        <div class="delete-confirm-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </div>
        <h3 class="delete-confirm-title">看仔细嗷，确定下架了嘛！！</h3>
        <div class="delete-confirm-buttons">
          <button @click="handleDelete" class="delete-confirm-btn delete-confirm-btn-primary">
            含泪下架
          </button>
          <button @click="closeDeleteConfirm" class="delete-confirm-btn delete-confirm-btn-cancel">
            不了不了
          </button>
        </div>
      </div>
    </div>

    <!-- 欢迎弹框（未登录用户首次进入） -->
    <div v-if="showWelcomeModal" class="welcome-modal" @click.self="closeWelcomeModal">
      <!-- 背景粒子效果 -->
      <div class="particles-container">
        <div v-for="i in 12" :key="i" class="particle" :style="getParticleStyle(i)"></div>
      </div>
      
      <div class="welcome-content" @click.stop>
        <!-- Logo 预留位置 -->
        <div class="welcome-logo">
          <img src="../assets//images//logo.jpg" alt="Logo" class="logo-img" />
        </div>
        
        <!-- 主文案 -->
        <h1 class="welcome-title">
          <span v-for="(char, index) in mainText" :key="index" 
                class="title-char" 
                :style="{ animationDelay: `${index * 0.05}s` }">
            {{ char === ' ' ? '\u00A0' : char }}
          </span>
        </h1>
        
        <!-- 副文案 -->
        <p class="welcome-subtitle">
          大小姐嫁到 · 把幸福穿在身上
        </p>
        
        <!-- 按钮组 -->
        <div class="welcome-buttons">
          <button 
            @click="handleMainButtonClick" 
            @mouseenter="onMainButtonHover"
            @mouseleave="onMainButtonLeave"
            class="welcome-btn welcome-btn-primary"
            :class="{ 'btn-shake': buttonShake }"
          >
            <span class="btn-text">{{ mainButtonText }}</span>
            <span class="btn-emoji">👑</span>
          </button>
          
          <button 
            @click="closeWelcomeModal" 
            class="welcome-btn welcome-btn-secondary"
          >
            <span class="btn-text">先偷偷看看</span>
            <span class="btn-emoji">👀</span>
          </button>
        </div>
        
        <!-- 点击按钮时的彩蛋文案 -->
        <transition name="sparkle">
          <div v-if="showSparkle" class="sparkle-text">
            ✨ 大小姐，欢迎回家 ✨
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getImages, deleteImage } from '../utils/api'
import { categories, getCategoryLabel } from '../utils/categories'

const router = useRouter()
const authStore = useAuthStore()

const images = ref([])
const loading = ref(true)
const selectedFilterCategory = ref('')
const previewImage = ref(null)
const layoutMode = ref('grid') // 'list' 或 'grid'
const showFilterModal = ref(false)

// 欢迎弹框相关
const showWelcomeModal = ref(false)
const mainText = '愿你披上婚纱这一刻，是大小姐正式出嫁的高光时刻。'
const mainButtonText = ref('本小姐要挑婚纱了')
const buttonShake = ref(false)
const showSparkle = ref(false)

const loadImages = async () => {
  loading.value = true
  try {
    const result = await getImages()
    if (result.success) {
      // 处理图片URL，确保是完整路径
      // 使用与 API 相同的地址检测逻辑
      const getApiBaseUrl = () => {
        if (import.meta.env.VITE_API_BASE_URL) {
          return import.meta.env.VITE_API_BASE_URL
        }
        if (import.meta.env.DEV) {
          const hostname = window.location.hostname
          if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            return `http://${hostname}:3001`
          }
          return 'http://localhost:3001'
        }
        return window.location.origin
      }
      
      const apiBaseUrl = getApiBaseUrl()
      images.value = result.data.map(img => ({
        ...img,
        url: img.url.startsWith('http') ? img.url : `${apiBaseUrl}${img.url}`
      }))
    }
  } catch (error) {
    console.error('加载图片失败:', error)
  } finally {
    loading.value = false
  }
}

// 从本地存储读取布局偏好
onMounted(() => {
  const savedLayout = localStorage.getItem('galleryLayoutMode')
  if (savedLayout === 'list' || savedLayout === 'grid') {
    layoutMode.value = savedLayout
  }
  loadImages()
  
  // 检查是否需要显示欢迎弹框（未登录用户首次访问）
  checkWelcomeModal()
})

// 检查是否显示欢迎弹框
const checkWelcomeModal = () => {
  // 如果已登录，不显示
  if (authStore.isAuthenticated) {
    return
  }
  
  // 检查是否已经显示过
  const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
  if (!hasSeenWelcome) {
    // 延迟一点显示，让页面先加载
    setTimeout(() => {
      showWelcomeModal.value = true
    }, 300)
  }
}

// 关闭欢迎弹框
const closeWelcomeModal = () => {
  showWelcomeModal.value = false
  localStorage.setItem('hasSeenWelcome', 'true')
}

// 主按钮点击
const handleMainButtonClick = () => {
  buttonShake.value = true
  showSparkle.value = true
  
  setTimeout(() => {
    buttonShake.value = false
    closeWelcomeModal()
  }, 500)
  
  setTimeout(() => {
    showSparkle.value = false
  }, 2000)
}

// 主按钮hover效果
const onMainButtonHover = () => {
  mainButtonText.value = '别催，本小姐来了'
}

const onMainButtonLeave = () => {
  mainButtonText.value = '本小姐要挑婚纱了'
}

// 生成粒子样式
const getParticleStyle = (index) => {
  const delay = index * 0.3
  const duration = 3 + Math.random() * 2
  const left = Math.random() * 100
  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

// 监听布局变化，保存到本地存储
watch(layoutMode, (newMode) => {
  localStorage.setItem('galleryLayoutMode', newMode)
})

// 根据筛选条件过滤图片
const filteredImages = computed(() => {
  if (!selectedFilterCategory.value) {
    return images.value
  }
  return images.value.filter(img => img.category === selectedFilterCategory.value)
})

const handleFilterChange = () => {
  // 筛选逻辑已在 computed 中处理
}

// 选择分类
const selectCategory = (value) => {
  selectedFilterCategory.value = value
  showFilterModal.value = false
}

const openPreview = (image) => {
  previewImage.value = image
  // 禁止背景滚动
  document.body.style.overflow = 'hidden'
}

const closePreview = () => {
  previewImage.value = null
  // 恢复背景滚动
  document.body.style.overflow = ''
}

// 删除确认相关
const showDeleteConfirmModal = ref(false)
const deleteTargetId = ref(null)

// 显示删除确认弹框
const showDeleteConfirm = (id) => {
  deleteTargetId.value = id
  showDeleteConfirmModal.value = true
}

// 关闭删除确认弹框
const closeDeleteConfirm = () => {
  showDeleteConfirmModal.value = false
  deleteTargetId.value = null
}

// 确认删除
const handleDelete = async () => {
  if (!deleteTargetId.value) return

  try {
    const result = await deleteImage(deleteTargetId.value)
    if (result.success) {
      images.value = images.value.filter(img => img.id !== deleteTargetId.value)
      closeDeleteConfirm()
    } else {
      alert('删除失败：' + (result.message || '未知错误'))
    }
  } catch (error) {
    alert('删除失败：' + error.message)
  } finally {
    deleteTargetId.value = null
  }
}

const goToUpload = () => {
  router.push('/upload')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

</script>

<style scoped>
.gallery-container {
  min-height: 100vh;
  padding: 20px 10px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.gallery-actions {
  display: flex;
  gap: 12px;
  position: relative;
  right: -50px;
}

.upload-link-button,
.login-link-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #D4A574 0%, #C19A6B 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.upload-link-button:hover,
.login-link-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(196, 154, 107, 0.4);
}

.upload-link-button svg,
.login-link-button svg {
  flex-shrink: 0;
}

/* 用户信息卡片 */
.user-info-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #D4A574 0%, #C19A6B 100%);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(196, 154, 107, 0.2);
  margin-bottom: 20px;
}

.user-avatar {
  width: 36px;
  height: 36px;
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
  min-width: 0;
}

.user-name {
  color: white;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  color: rgba(255, 255, 255, 0.8);
  font-size: 11px;
}

.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.logout-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.loading {
  text-align: center;
  padding: 60px;
  font-size: 18px;
  color: white;
}

.empty-gallery {
  background: linear-gradient(135deg, #FFF8F0 0%, #FFE4E1 100%);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(196, 154, 107, 0.15);
  padding: 80px 40px;
  text-align: center;
  color: #999;
  border: 1px solid rgba(212, 165, 116, 0.2);
}

.empty-gallery svg {
  stroke-width: 1.5;
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-gallery p {
  font-size: 18px;
  margin-bottom: 24px;
}

/* 列表布局 */
.gallery-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.gallery-item-list {
  background: linear-gradient(135deg, #FFF8F0 0%, #FFFFFF 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(196, 154, 107, 0.15);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  gap: 20px;
  padding: 20px;
  border: 1px solid rgba(212, 165, 116, 0.2);
}

.gallery-item-list:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(196, 154, 107, 0.25);
  border-color: rgba(212, 165, 116, 0.4);
}

/* 网格布局 */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
}

.gallery-item-grid {
  background: linear-gradient(135deg, #FFF8F0 0%, #FFFFFF 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(196, 154, 107, 0.15);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(212, 165, 116, 0.2);
}

.gallery-item-grid:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(196, 154, 107, 0.25);
  border-color: rgba(212, 165, 116, 0.4);
}

/* 列表布局的图片容器 */
.gallery-item-list .image-wrapper {
  position: relative;
  width: 50%;
  min-width: 300px;
  max-width: 500px;
  height: 300px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
}

.gallery-item-list .image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* 网格布局的图片容器 */
.image-wrapper-grid {
  position: relative;
  width: 100%;
  height: 150px;
  background: #f5f5f5;
  overflow: hidden;
  cursor: pointer;
}

.image-wrapper-grid img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
  pointer-events: none;
}

.image-wrapper:hover .image-overlay,
.image-wrapper-grid:hover .image-overlay {
  background: rgba(0, 0, 0, 0.3);
}

.preview-hint {
  color: white;
  font-size: 16px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.image-wrapper:hover .preview-hint,
.image-wrapper-grid:hover .preview-hint {
  opacity: 1;
}

/* 删除按钮（右下角垃圾箱图标） */
.delete-button-trash {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  background: rgba(244, 67, 54, 0.85);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0.8;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
}

.delete-button-trash:hover {
  background: rgba(244, 67, 54, 1);
  opacity: 1;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
}

.delete-button-trash:active {
  transform: scale(0.95);
}

.delete-button-trash svg {
  stroke-width: 2.5;
}

/* 列表布局的信息 */
.gallery-item-list .image-info {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

/* 网格布局的信息 */
.image-info-grid {
  padding: 8px;
  display: flex;
  flex-direction: column;
  position: relative;
  /* gap: 8px; */
}

.image-name {
  font-size: 12px;
  color: #555555;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-meta {
  font-size: 13px;
  color: #999;
  margin: 0;
}

@media (max-width: 768px) {

  .header-right {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .user-info-card {
    width: 100%;
  }

  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .gallery-list {
    gap: 16px;
  }

  /* 移动端网格布局改为单列 */
  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .gallery-item-list {
    flex-direction: column;
    padding: 16px;
  }

  .gallery-item-list .image-wrapper {
    width: 100%;
    min-width: auto;
    max-width: none;
    height: 250px;
  }

  .gallery-item-list .image-info {
    padding-top: 16px;
  }

  .gallery-item-grid {
    width: 100%;
  }
}

.filter-section {
  background: linear-gradient(135deg, #FFF8F0 0%, #FFE4E1 100%);
  padding: 24px 14px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(196, 154, 107, 0.15);
  margin-bottom: 24px;
  border: 1px solid rgba(212, 165, 116, 0.2);
}

.filter-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}

.filter-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #D4A574 0%, #C19A6B 100%);
  border-radius: 8px;
  color: white;
  flex-shrink: 0;
}

/* 筛选按钮 */
.filter-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border: 2px solid rgba(212, 165, 116, 0.3);
  border-radius: 10px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  min-width: 180px;
  color: #5a4a3a;
  font-weight: 500;
}

.filter-button:hover {
  border-color: #D4A574;
  background: #FFF8F0;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(212, 165, 116, 0.2);
}

.filter-button-text {
  flex: 1;
  text-align: left;
}

.filter-arrow {
  transition: transform 0.3s ease;
  color: #C19A6B;
}

.filter-button:hover .filter-arrow {
  transform: translateY(2px);
}

.filter-count {
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #D4A574 0%, #C19A6B 100%);
  border-radius: 20px;
  color: white;
  font-size: 13px;
  font-weight: 600;
}

.count-number {
  font-size: 16px;
  font-weight: 700;
}

.count-text {
  font-size: 12px;
  opacity: 0.9;
}

/* ========== 分类筛选弹框样式 ========== */
.filter-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
  padding: 20px;
  animation: modalFadeIn 0.3s ease;
}

.filter-modal-content {
  background: linear-gradient(135deg, #FFF8F0 0%, #FFFFFF 100%);
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(212, 165, 116, 0.4);
  border: 2px solid rgba(212, 165, 116, 0.25);
  animation: filterModalSlideIn 0.3s ease;
  overflow: hidden;
}

@keyframes filterModalSlideIn {
  from {
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.filter-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(212, 165, 116, 0.15);
}

.filter-modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #8B6F47;
  margin: 0;
  letter-spacing: 0.5px;
}

.filter-modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(212, 165, 116, 0.1);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8B6F47;
  transition: all 0.3s ease;
}

.filter-modal-close:hover {
  background: rgba(212, 165, 116, 0.2);
  transform: rotate(90deg);
}

.filter-modal-body {
  padding: 20px 28px 28px;
  overflow-y: auto;
  flex: 1;
}

/* 全部选项 */
.filter-option-all {
  margin-bottom: 24px;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: 600;
}

/* 分组标题 */
.filter-group-section {
  margin-bottom: 24px;
}

.filter-group-section:last-child {
  margin-bottom: 0;
}

.filter-group-title {
  font-size: 14px;
  font-weight: 600;
  color: #C19A6B;
  margin-bottom: 12px;
  padding-left: 4px;
  letter-spacing: 0.5px;
}

/* 分类选项网格 */
.filter-options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

/* 分类选项按钮 */
.filter-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 2px solid rgba(212, 165, 116, 0.25);
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.filter-option:hover {
  border-color: rgba(212, 165, 116, 0.5);
  background: #FFF8F0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
}

.filter-option.active {
  border-color: #D4A574;
  background: linear-gradient(135deg, rgba(212, 165, 116, 0.1) 0%, rgba(193, 154, 107, 0.1) 100%);
  box-shadow: 0 4px 12px rgba(212, 165, 116, 0.2);
}

.filter-option-text {
  font-size: 14px;
  font-weight: 500;
  color: #5a4a3a;
  flex: 1;
}

.filter-option.active .filter-option-text {
  color: #8B6F47;
  font-weight: 600;
}

.filter-option-check {
  color: #D4A574;
  display: flex;
  align-items: center;
  margin-left: 8px;
  animation: checkMarkIn 0.3s ease;
}

@keyframes checkMarkIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .filter-modal-content {
    max-width: 90%;
    max-height: 85vh;
  }

  .filter-modal-header {
    padding: 20px 20px;
  }

  .filter-modal-body {
    padding: 16px 20px 24px;
  }

  .filter-options-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .filter-option {
    padding: 10px 12px;
    font-size: 13px;
  }

  .filter-button {
    min-width: 150px;
    padding: 8px 12px;
  }
}

.layout-switcher {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(212, 165, 116, 0.2);
}

.layout-label {
  font-size: 14px;
  font-weight: 600;
  color: #8B6F47;
  margin-right: 4px;
  white-space: nowrap;
}

.layout-btn {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(212, 165, 116, 0.3);
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #8B6F47;
}

.layout-btn:hover {
  border-color: #D4A574;
  color: #D4A574;
  background: #FFF8F0;
  transform: translateY(-1px);
}

.layout-btn.active {
  border-color: #D4A574;
  background: linear-gradient(135deg, #D4A574 0%, #C19A6B 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(212, 165, 116, 0.3);
}

.image-tags {
  margin-bottom: 2px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.category-tag {
  display: inline-block;
  padding: 4px 10px;
  background: linear-gradient(135deg, #D4A574 0%, #C19A6B 100%);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 预览模态框 */
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.preview-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.preview-close {
  position: absolute;
  top: -40px;
  right: 0;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1001;
}

.preview-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.preview-img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.preview-info {
  margin-top: 20px;
  text-align: center;
  color: white;
  max-width: 600px;
}

.preview-info h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
  color: white;
}

.preview-tags {
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.preview-meta {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

@media (max-width: 768px) {
  .gallery-item {
    flex-direction: column;
    padding: 2px;
  }

  .image-wrapper {
    width: 100%;
    min-width: auto;
    max-width: none;
    height: 250px;
  }

  .image-info {
    padding-top: 16px;
  }

  .preview-img {
    max-height: 60vh;
  }

  .preview-info h3 {
    font-size: 20px;
  }
}

/* ========== 删除确认弹框样式 ========== */
.delete-confirm-modal {
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

.delete-confirm-content {
  background: linear-gradient(135deg, #FFF8F0 0%, #FFE4E1 100%);
  border-radius: 20px;
  padding: 40px 36px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 16px 48px rgba(212, 165, 116, 0.35);
  border: 2px solid rgba(212, 165, 116, 0.25);
  animation: contentSlideIn 0.3s ease;
}

.delete-confirm-icon {
  color: #f44336;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  animation: iconShake 0.5s ease;
}

@keyframes iconShake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

.delete-confirm-title {
  font-size: 20px;
  font-weight: 600;
  color: #8B6F47;
  margin: 0 0 32px 0;
  line-height: 1.5;
  letter-spacing: 0.5px;
}

.delete-confirm-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.delete-confirm-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.delete-confirm-btn-primary {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
}

.delete-confirm-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.5);
}

.delete-confirm-btn-primary:active {
  transform: translateY(0);
}

.delete-confirm-btn-cancel {
  background: rgba(255, 255, 255, 0.9);
  color: #8B6F47;
  border: 2px solid rgba(212, 165, 116, 0.3);
}

.delete-confirm-btn-cancel:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(212, 165, 116, 0.5);
  transform: translateY(-1px);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .delete-confirm-content {
    padding: 32px 24px;
    max-width: 90%;
  }

  .delete-confirm-title {
    font-size: 18px;
  }

  .delete-confirm-buttons {
    flex-direction: column;
  }

  .delete-confirm-btn {
    width: 100%;
  }
}

/* ========== 欢迎弹框样式 ========== */
.welcome-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
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

.welcome-content {
  position: relative;
  background: linear-gradient(135deg, #FFF8F0 0%, #FFE4E1 100%);
  border-radius: 24px;
  padding: 48px 40px;
  max-width: 520px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(212, 165, 116, 0.4);
  border: 2px solid rgba(212, 165, 116, 0.3);
  animation: contentSlideUp 0.3s ease;
}

@keyframes contentSlideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Logo 区域 */
.welcome-logo {
  margin-bottom: 32px;
  animation: logoScale 0.5s ease 0.2s both;
}

@keyframes logoScale {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.logo-img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(212, 165, 116, 0.3);
}

/* 主文案 */
.welcome-title {
  font-size: 28px;
  font-weight: 600;
  color: #8B6F47;
  line-height: 1.6;
  margin: 0 0 16px 0;
  letter-spacing: 1px;
}

.title-char {
  display: inline-block;
  opacity: 0;
  animation: charFadeIn 0.4s ease forwards;
}

@keyframes charFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 副文案 */
.welcome-subtitle {
  font-size: 16px;
  color: #C19A6B;
  margin: 0 0 40px 0;
  font-weight: 500;
  letter-spacing: 0.5px;
  animation: subtitleFadeIn 0.5s ease 0.8s both;
}

@keyframes subtitleFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 按钮组 */
.welcome-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: buttonsFadeIn 0.5s ease 1s both;
}

@keyframes buttonsFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-btn {
  width: 100%;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 18px;
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

.welcome-btn-primary {
  background: linear-gradient(135deg, #D4A574 0%, #C19A6B 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(212, 165, 116, 0.4);
}

.welcome-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(212, 165, 116, 0.5);
}

.welcome-btn-primary:active {
  transform: translateY(0);
}

.welcome-btn-secondary {
  background: rgba(255, 255, 255, 0.8);
  color: #D4A574;
  border: 2px solid rgba(212, 165, 116, 0.3);
}

.welcome-btn-secondary:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(212, 165, 116, 0.5);
  transform: translateY(-1px);
}

.btn-text {
  transition: all 0.3s ease;
}

.btn-emoji {
  font-size: 20px;
  transition: transform 0.3s ease;
}

.welcome-btn:hover .btn-emoji {
  transform: scale(1.2) rotate(5deg);
}

/* 按钮抖动效果 */
.btn-shake {
  animation: buttonShake 0.5s ease;
}

@keyframes buttonShake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-3px) rotate(-1deg); }
  20%, 40%, 60%, 80% { transform: translateX(3px) rotate(1deg); }
}

/* 彩蛋文案 */
.sparkle-text {
  position: absolute;
  top: -50px;
  right: 20px;
  font-size: 14px;
  color: #D4A574;
  font-weight: 600;
  animation: sparkleFloat 2s ease;
  pointer-events: none;
}

@keyframes sparkleFloat {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.8);
  }
  50% {
    opacity: 1;
    transform: translateY(-20px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-40px) scale(0.8);
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

/* 粒子效果 */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, rgba(212, 165, 116, 0.6) 0%, rgba(212, 165, 116, 0) 70%);
  border-radius: 50%;
  bottom: -10px;
  animation: particleFloat linear infinite;
  opacity: 0.6;
}

@keyframes particleFloat {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100vh) translateX(20px);
    opacity: 0;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .welcome-content {
    padding: 36px 24px;
    max-width: 90%;
  }

  .welcome-title {
    font-size: 22px;
  }

  .welcome-subtitle {
    font-size: 14px;
  }

  .welcome-btn {
    font-size: 16px;
    padding: 14px 20px;
  }

  .logo-img {
    width: 100px;
    height: 100px;
  }
}
</style>

