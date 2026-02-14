import { defineComponent, reactive, ref, onMounted } from 'vue'
import { Card, Form, Input, Select, Button, message } from 'ant-design-vue'
import http from '../api/http'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

/**
 * 新建文章（TSX）
 */
export default defineComponent({
  name: 'NewArticle',
  setup() {
    const router = useRouter()
    const auth = useAuthStore()
    const loading = ref(false)
    const cats = ref<any[]>([])
    const tags = ref<any[]>([])
    const form = reactive<{ title: string; content: string; categoryId?: number; tagIds: number[] }>({
      title: '',
      content: '',
      categoryId: undefined,
      tagIds: [],
    })
    const formRef = ref()
    const rules = {
      title: [{ required: true, message: '请输入标题' }],
      categoryId: [{ required: true, message: '请选择分类' }],
      content: [{ required: true, message: '请输入内容' }],
    }

    async function loadMeta() {
      const [{ data: catList }, { data: tagList }] = await Promise.all([
        http.get('/category'),
        http.get('/tag/all'),
      ])
      cats.value = catList || []
      tags.value = tagList || []
    }

    async function onSubmit() {
      if (!auth.token) {
        message.warning('请先登录')
        return
      }
      try {
        loading.value = true
        await formRef.value?.validate()
        const payload = {
          title: form.title?.trim(),
          content: form.content?.trim(),
          categoryId: form.categoryId,
          tagIds: form.tagIds,
        }
        await http.post('/article', payload)
        message.success('发布成功')
        router.push('/articles')
      } catch (e: any) {
        message.error(e?.response?.data?.message || '发布失败')
      } finally {
        loading.value = false
      }
    }

    onMounted(loadMeta)

    return () => (
      <div class="p-6 max-w-4xl mx-auto">
        <Card title="新建文章">
          <Form ref={formRef} layout="vertical" model={form} rules={rules}>
            <Form.Item label="标题" name="title">
              <Input v-model:value={form.title} placeholder="请输入标题" />
            </Form.Item>
            <Form.Item label="分类" name="categoryId">
              <Select
                v-model:value={form.categoryId}
                options={cats.value.map((c) => ({ label: c.name, value: c.id }))}
                placeholder="选择分类"
              />
            </Form.Item>
            <Form.Item label="标签">
              <Select
                mode="multiple"
                v-model:value={form.tagIds}
                options={tags.value.map((t) => ({ label: t.name, value: t.id }))}
                placeholder="选择标签"
              />
            </Form.Item>
            <Form.Item label="内容" name="content">
              <Input.TextArea v-model:value={form.content} rows={8} placeholder="支持纯文本" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={onSubmit} loading={loading.value}>
                发布
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    )
  },
})
