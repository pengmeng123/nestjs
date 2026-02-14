import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Card, Table, Button, Modal, Form, Input, Tag as ATag, message } from 'ant-design-vue'
import http from '../api/http'

export default defineComponent({
  name: 'TagGroups',
  setup() {
    const loading = ref(false)
    const data = ref<any[]>([])
    const visible = ref(false)
    const formRef = ref()
    const form = reactive<{ name: string }>({ name: '' })
    const rules = { name: [{ required: true, message: '请输入分组名称' }] }

    async function fetchList() {
      loading.value = true
      try {
        const { data: list } = await http.get('/tag/group')
        data.value = list || []
      } finally {
        loading.value = false
      }
    }

    async function createGroup() {
      try {
        await formRef.value?.validate()
        await http.post('/tag/group', { name: form.name.trim() })
        message.success('分组创建成功')
        visible.value = false
        form.name = ''
        fetchList()
      } catch (e: any) {
        if (e?.errorFields) return
        message.error(e?.response?.data?.message || '创建失败')
      }
    }

    onMounted(fetchList)

    const columns = [
      { title: '序号', key: 'index', width: 80, customRender: ({ index }: any) => index + 1 },
      { title: '名称', dataIndex: 'name', key: 'name' },
      {
        title: '标签',
        key: 'tags',
        customRender: ({ record }: any) =>
          (record.tags || []).length ? (
            <div class="flex flex-wrap gap-2">
              {record.tags.map((t: any) => (
                <ATag key={t.id}>{t.name}</ATag>
              ))}
            </div>
          ) : (
            <span class="text-gray-400">暂无标签</span>
          ),
      },
    ]

    return () => (
      <div class="p-6 max-w-6xl mx-auto">
        <Card title="标签分组" extra={<Button type="primary" onClick={() => (visible.value = true)}>新建分组</Button>}>
          <Table rowKey="id" loading={loading.value} dataSource={data.value} columns={columns as any} pagination={false} />
        </Card>
        <Modal title="新建分组" open={visible.value} onOk={createGroup} onCancel={() => (visible.value = false)} destroyOnClose>
          <Form ref={formRef} model={form} layout="vertical" rules={rules}>
            <Form.Item label="名称" name="name">
              <Input v-model:value={form.name} placeholder="请输入分组名称" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  },
})

