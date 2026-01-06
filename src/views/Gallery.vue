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
          <div class="filter-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
          </div>
          <select v-model="selectedFilterCategory" @change="handleFilterChange" class="filter-select">
            <option value="">全部分类</option>
            <optgroup v-for="group in categories" :key="group.group" :label="group.group">
              <option v-for="option in group.options" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </optgroup>
          </select>
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
          <button
            v-if="authStore.isAuthenticated"
            @click.stop="handleDelete(image.id)"
            class="delete-button"
            title="删除"
          >
            ×
          </button>
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
          <button
            v-if="authStore.isAuthenticated"
            @click.stop="handleDelete(image.id)"
            class="delete-button"
            title="删除"
          >
            ×
          </button>
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
})

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

const handleDelete = async (id) => {
  if (!window.confirm('确定要删除这张图片吗？')) {
    return
  }

  try {
    const result = await deleteImage(id)
    if (result.success) {
      images.value = images.value.filter(img => img.id !== id)
    } else {
      alert('删除失败：' + (result.message || '未知错误'))
    }
  } catch (error) {
    alert('删除失败：' + error.message)
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

.delete-button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(244, 67, 54, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0;
  z-index: 10;
}

.gallery-item-list:hover .delete-button,
.gallery-item-grid:hover .delete-button {
  opacity: 1;
}

.delete-button:hover {
  background: #d32f2f;
  transform: scale(1.1);
}

/* 列表布局的信息 */
.gallery-item-list .image-info {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 网格布局的信息 */
.image-info-grid {
  padding: 8px;
  display: flex;
  flex-direction: column;
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

.filter-select {
  padding: 10px 16px;
  border: 2px solid rgba(212, 165, 116, 0.3);
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  min-width: 200px;
  color: #5a4a3a;
  font-weight: 500;
}

.filter-select:focus {
  border-color: #D4A574;
  box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.15);
  background: #FFF8F0;
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
</style>

