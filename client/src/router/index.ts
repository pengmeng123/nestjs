import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Articles from '../views/Articles'
import ArticleDetail from '../views/ArticleDetail'
import Login from '../views/Login'
import Register from '../views/Register'
import NewArticle from '../views/NewArticle'

/**
 * 创建并返回应用路由（TS）
 */
function createAppRouter() {
  const routes: RouteRecordRaw[] = [
    { path: '/', redirect: '/articles' },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/articles', component: Articles },
    { path: '/article/new', component: NewArticle },
    { path: '/article/:id', component: ArticleDetail, props: true },
  ]
  return createRouter({
    history: createWebHistory(),
    routes,
  })
}

const router = createAppRouter()
export default router
