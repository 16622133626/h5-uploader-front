import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 用户列表（包含角色信息）
const USERS = [
  { username: 'admin', password: 'admin123', role: 'owner', displayName: '老板娘' },
  { username: 'uploader', password: 'upload123', role: 'owner', displayName: '管理员' },
  { username: 'customer', password: 'customer123', role: 'customer', displayName: '客户' }
]

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const currentUser = ref(null)
  const userRole = ref(null)
  const userDisplayName = ref(null)

  // 初始化时检查本地存储
  const initAuth = () => {
    const savedAuth = localStorage.getItem('isAuthenticated')
    const savedUser = localStorage.getItem('currentUser')
    const savedRole = localStorage.getItem('userRole')
    const savedDisplayName = localStorage.getItem('userDisplayName')
    
    if (savedAuth === 'true' && savedUser) {
      isAuthenticated.value = true
      currentUser.value = savedUser
      userRole.value = savedRole || 'customer'
      userDisplayName.value = savedDisplayName || '客户'
    }
  }

  // 登录
  const login = (username, password) => {
    const user = USERS.find(
      u => u.username === username && u.password === password
    )
    if (user) {
      isAuthenticated.value = true
      currentUser.value = username
      userRole.value = user.role
      userDisplayName.value = user.displayName
      
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('currentUser', username)
      localStorage.setItem('userRole', user.role)
      localStorage.setItem('userDisplayName', user.displayName)
      
      return { success: true }
    }
    return { success: false, message: '用户名或密码错误' }
  }

  // 登出
  const logout = () => {
    isAuthenticated.value = false
    currentUser.value = null
    userRole.value = null
    userDisplayName.value = null
    
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userDisplayName')
  }

  // 判断是否为老板娘（可以上传）
  const isOwner = computed(() => {
    return userRole.value === 'owner'
  })

  // 判断是否为客户（只能查看）
  const isCustomer = computed(() => {
    return userRole.value === 'customer'
  })

  // 初始化
  initAuth()

  return {
    isAuthenticated,
    currentUser,
    userRole,
    userDisplayName,
    isOwner,
    isCustomer,
    login,
    logout
  }
})






