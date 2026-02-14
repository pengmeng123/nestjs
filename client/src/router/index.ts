import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Articles from '../views/Articles'
import ArticleDetail from '../views/ArticleDetail'
import Login from '../views/Login'
import Register from '../views/Register'
import NewArticle from '../views/NewArticle'
import Categories from '../views/Categories'
import Tags from '../views/Tags'
import TagGroups from '../views/TagGroups'

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
    { path: '/categories', component: Categories },
    { path: '/tags', component: Tags },
    { path: '/tag-groups', component: TagGroups },
  ]
  return createRouter({
    history: createWebHistory(),
    routes,
  })
}

const router = createAppRouter()
export default router
