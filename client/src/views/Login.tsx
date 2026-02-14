import { defineComponent, reactive, ref } from 'vue'
import { Card, Form, Input, Button, message } from 'ant-design-vue'
import { useAuthStore } from '../stores/auth'
import { useRouter, RouterLink } from 'vue-router'

/**
 * 登录页（TSX）
 */
export default defineComponent({
  name: 'Login',
  setup() {
    const auth = useAuthStore()
    const router = useRouter()
    const loading = ref(false)
    const form = reactive({ name: '', password: '' })

    async function onSubmit() {
      try {
        loading.value = true
        await auth.login(form)
        message.success('登录成功')
        router.push('/articles')
      } catch (e: any) {
        message.error(e?.response?.data?.message || '登录失败')
      } finally {
        loading.value = false
      }
    }

    return () => (
      <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <Card title="登录" class="w-full max-w-sm">
          <Form layout="vertical">
            <Form.Item label="用户名">
              <Input v-model:value={form.name} placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item label="密码">
              <Input.Password v-model:value={form.password} placeholder="请输入密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" block onClick={onSubmit} loading={loading.value}>
                登录
              </Button>
            </Form.Item>
            <div class="text-right">
              <RouterLink to="/register">没有账号？去注册</RouterLink>
            </div>
          </Form>
        </Card>
      </div>
    )
  },
})
