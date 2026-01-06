// API 基础配置
// 开发环境：优先使用环境变量，否则根据当前访问地址自动判断
// 生产环境：使用当前域名
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  if (import.meta.env.DEV) {
    // 开发环境：如果通过IP访问，自动使用IP地址
    const hostname = window.location.hostname
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:3001`
    }
    return 'http://localhost:3001'
  }
  
  return window.location.origin
}

const API_BASE_URL = getApiBaseUrl()

/**
 * 通用请求函数
 */
async function request(url, options = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }))
    throw new Error(error.message || '请求失败')
  }

  return response.json()
}

/**
 * 上传图片
 */
export async function uploadImage(file, uploader, category, imageName) {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('uploader', uploader)
  formData.append('category', category)
  formData.append('imageName', imageName)

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '上传失败' }))
    throw new Error(error.message || '上传失败')
  }

  return response.json()
}

/**
 * 获取所有图片（支持按分类筛选）
 */
export async function getImages(category = '') {
  const url = category ? `/api/images?category=${encodeURIComponent(category)}` : '/api/images'
  return request(url)
}

/**
 * 删除图片
 */
export async function deleteImage(id) {
  return request(`/api/images/${id}`, {
    method: 'DELETE'
  })
}

/**
 * 健康检查
 */
export async function healthCheck() {
  return request('/api/health')
}

