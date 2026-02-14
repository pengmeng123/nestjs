import { defineComponent, reactive, ref } from 'vue'
import { Card, Form, Input, Button, message } from 'ant-design-vue'
import { useAuthStore } from '../stores/auth'
import { useRouter, RouterLink } from 'vue-router'

/**
 * 注册页（TSX）
 */
export default defineComponent({
  name: 'Register',
  setup() {
    const auth = useAuthStore()
    const router = useRouter()
    const loading = ref(false)
    const form = reactive({ name: '', email: '', password: '' })

    async function onSubmit() {
      try {
        loading.value = true
        await auth.register(form)
        message.success('注册成功，请登录')
        router.push('/login')
      } catch (e: any) {
        message.error(e?.response?.data?.message || '注册失败')
      } finally {
        loading.value = false
      }
    }

    return () => (
      <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <Card title="注册" class="w-full max-w-sm">
          <Form layout="vertical">
            <Form.Item label="用户名">
              <Input v-model:value={form.name} placeholder="3-20 位用户名" />
            </Form.Item>
            <Form.Item label="邮箱">
              <Input v-model:value={form.email} placeholder="请输入邮箱" />
            </Form.Item>
            <Form.Item label="密码">
              <Input.Password v-model:value={form.password} placeholder="6-32 位密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" block onClick={onSubmit} loading={loading.value}>
                注册
              </Button>
            </Form.Item>
            <div class="text-right">
              <RouterLink to="/login">已有账号？去登录</RouterLink>
            </div>
          </Form>
        </Card>
      </div>
    )
  },
})

