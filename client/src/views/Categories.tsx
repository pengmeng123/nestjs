import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Card, Table, Button, Modal, Form, Input, message, Popconfirm } from 'ant-design-vue'
import http from '../api/http'

export default defineComponent({
  name: 'Categories',
  setup() {
    const loading = ref(false)
    const data = ref<any[]>([])
    const visible = ref(false)
    const editing = ref<any | null>(null)
    const formRef = ref()
    const form = reactive({ name: '' })

    async function fetchList() {
      loading.value = true
      try {
        const { data: list } = await http.get('/category')
        data.value = list || []
      } finally {
        loading.value = false
      }
    }

    function openCreate() {
      editing.value = null
      form.name = ''
      visible.value = true
    }
    function openEdit(row: any) {
      editing.value = row
      form.name = row.name
      visible.value = true
    }
    async function handleOk() {
      try {
        await formRef.value?.validate()
        if (editing.value) {
          await http.put(`/category/${editing.value.id}`, { name: form.name.trim() })
          message.success('更新成功')
        } else {
          await http.post('/category', { name: form.name.trim() })
          message.success('创建成功')
        }
        visible.value = false
        fetchList()
      } catch (e: any) {
        if (e?.errorFields) return
        message.error(e?.response?.data?.message || '操作失败')
      }
    }
    async function remove(row: any) {
      await http.delete(`/category/${row.id}`)
      message.success('已删除')
      fetchList()
    }

    const columns = [
      {
        title: '序号',
        key: 'index',
        width: 80,
        customRender: ({ index }: any) => index + 1,
      },
      { title: '名称', dataIndex: 'name', key: 'name' },
      {
        title: '操作',
        key: 'action',
        width: 180,
        customRender: ({ record }: any) => (
          <div class="space-x-2">
            <Button size="small" onClick={() => openEdit(record)}>编辑</Button>
            <Popconfirm title="确定删除该分类？" onConfirm={() => remove(record)}>
              <Button size="small" danger>删除</Button>
            </Popconfirm>
          </div>
        ),
      },
    ]

    onMounted(fetchList)

    const rules = {
      name: [{ required: true, message: '请输入分类名称' }],
    }

    return () => (
      <div class="p-6 max-w-5xl mx-auto">
        <Card title="分类管理" extra={<Button type="primary" onClick={openCreate}>新建分类</Button>}>
          <Table rowKey="id" loading={loading.value} dataSource={data.value} columns={columns as any} pagination={false} />
        </Card>
        <Modal
          title={editing.value ? '编辑分类' : '新建分类'}
          open={visible.value}
          onOk={handleOk}
          onCancel={() => (visible.value = false)}
          destroyOnClose
        >
          <Form ref={formRef} model={form} layout="vertical" rules={rules}>
            <Form.Item label="名称" name="name">
              <Input v-model:value={form.name} placeholder="请输入分类名称" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  },
})
