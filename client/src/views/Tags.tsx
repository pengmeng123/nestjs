import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Card, Table, Button, Modal, Form, Input, Select, message, Popconfirm, Tag as ATag } from 'ant-design-vue'
import http from '../api/http'

export default defineComponent({
  name: 'Tags',
  setup() {
    const loading = ref(false)
    const data = ref<any[]>([])
    const groups = ref<any[]>([])
    const visible = ref(false)
    const groupVisible = ref(false)
    const editing = ref<any | null>(null)
    const formRef = ref()
    const form = reactive<{ name: string; groupId?: number | null }>({ name: '', groupId: undefined })

    async function fetchList() {
      loading.value = true
      try {
        const [{ data: list }, { data: grp }] = await Promise.all([http.get('/tag/all'), http.get('/tag/group')])
        data.value = list || []
        groups.value = grp || []
      } finally {
        loading.value = false
      }
    }

    function openCreate() {
      editing.value = null
      form.name = ''
      form.groupId = undefined
      visible.value = true
    }
    function openEdit(row: any) {
      editing.value = row
      form.name = row.name
      form.groupId = row.group?.id
      visible.value = true
    }
    async function handleOk() {
      try {
        await formRef.value?.validate()
        if (editing.value) {
          // 后端不支持按 id 更新 name，这里仅允许修改所属分组
          await http.put('/tag/batch', { tags: [{ name: editing.value.name, groupId: form.groupId || null }] })
          message.success('更新成功（仅分组）')
        } else {
          await http.post('/tag', { name: form.name.trim(), groupId: form.groupId || null })
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
      await http.delete(`/tag/${row.id}`)
      message.success('已删除')
      fetchList()
    }

    // 新建分组（仅需要 name）
    const groupFormRef = ref()
    const groupForm = reactive<{ name: string }>({ name: '' })
    const groupRules = { name: [{ required: true, message: '请输入分组名称' }] }
    async function createGroup() {
      try {
        await groupFormRef.value?.validate()
        await http.post('/tag/group', { name: groupForm.name.trim() })
        message.success('分组创建成功')
        groupVisible.value = false
        groupForm.name = ''
        fetchList()
      } catch (e: any) {
        if (e?.errorFields) return
        message.error(e?.response?.data?.message || '创建失败')
      }
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
        title: '分组',
        key: 'group',
        customRender: ({ record }: any) => (record.group ? <ATag>{record.group.name}</ATag> : <span class="text-gray-400">无</span>),
      },
      {
        title: '操作',
        key: 'action',
        width: 220,
        customRender: ({ record }: any) => (
          <div class="space-x-2">
            <Button size="small" onClick={() => openEdit(record)}>编辑</Button>
            <Popconfirm title="确定删除该标签？" onConfirm={() => remove(record)}>
              <Button size="small" danger>删除</Button>
            </Popconfirm>
          </div>
        ),
      },
    ]

    onMounted(fetchList)

    const rules = {
      name: [{ required: true, message: '请输入标签名称' }],
    }

    return () => (
      <div class="p-6 max-w-5xl mx-auto">
        <Card
          title="标签管理"
          extra={
            <div class="space-x-2">
              <Button onClick={() => (groupVisible.value = true)}>新建分组</Button>
              <Button type="primary" onClick={openCreate}>新建标签</Button>
            </div>
          }
        >
          <Table rowKey="id" loading={loading.value} dataSource={data.value} columns={columns as any} pagination={false} />
        </Card>
        <Modal
          title={editing.value ? '编辑标签（仅修改分组）' : '新建标签'}
          open={visible.value}
          onOk={handleOk}
          onCancel={() => (visible.value = false)}
          destroyOnClose
        >
          <Form ref={formRef} model={form} layout="vertical" rules={rules}>
            {!editing.value ? (
              <Form.Item label="名称" name="name">
                <Input v-model:value={form.name} placeholder="请输入标签名称" />
              </Form.Item>
            ) : (
              <Form.Item label="名称">
                <Input value={form.name} disabled />
              </Form.Item>
            )}
            <Form.Item label="分组">
              <Select
                allowClear
                placeholder="选择分组（可选）"
                v-model:value={form.groupId}
                options={groups.value.map((g: any) => ({ label: g.name, value: g.id }))}
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="新建分组"
          open={groupVisible.value}
          onOk={createGroup}
          onCancel={() => (groupVisible.value = false)}
          destroyOnClose
        >
          <Form ref={groupFormRef} model={groupForm} layout="vertical" rules={groupRules}>
            <Form.Item label="名称" name="name">
              <Input v-model:value={groupForm.name} placeholder="请输入分组名称" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  },
})
