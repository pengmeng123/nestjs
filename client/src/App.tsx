import { defineComponent, onMounted } from 'vue'
import { Layout, Button } from 'ant-design-vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

/**
 * 根布局组件（TSX）
 */
export default defineComponent({
  name: 'App',
  setup() {
    const auth = useAuthStore()
    const router = useRouter()

    function logout() {
      auth.logout()
      router.push('/login')
    }

    onMounted(() => {
      if (auth.token && !auth.profile) {
        auth.fetchProfile()
      }
    })

    return () => (
      <Layout class="min-h-screen">
        <Layout.Header class="bg-white shadow px-6 flex items-center justify-between">
          <div class="font-semibold">MyBlog</div>
          <div class="flex items-center gap-3">
            <RouterLink to="/articles">文章</RouterLink>
            {auth.profile && (
              <RouterLink to="/article/new">
                <Button type="primary">写文章</Button>
              </RouterLink>
            )}
            {auth.profile ? (
              <span class="text-gray-700">{auth.profile.name}</span>
            ) : null}
            {auth.profile ? (
              <Button onClick={logout}>退出</Button>
            ) : (
              <>
                <RouterLink to="/login">
                  <Button>登录</Button>
                </RouterLink>
                <RouterLink to="/register">
                  <Button>注册</Button>
                </RouterLink>
              </>
            )}
          </div>
        </Layout.Header>
        <Layout.Content class="bg-gray-50">
          <RouterView />
        </Layout.Content>
      </Layout>
    )
  },
})
