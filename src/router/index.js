import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Upload from '../views/Upload.vue'
import Gallery from '../views/Gallery.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/upload',
      name: 'Upload',
      component: Upload,
      meta: { requiresAuth: true, requiresOwner: true }
    },
    {
      path: '/gallery',
      name: 'Gallery',
      component: Gallery
    },
    {
      path: '/',
      redirect: '/gallery'
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 需要登录的路由
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // 需要老板娘权限的路由（上传页面）
  if (to.meta.requiresOwner && !authStore.isOwner) {
    // 如果是客户，重定向到列表页
    next('/gallery')
    return
  }

  next()
})

export default router






