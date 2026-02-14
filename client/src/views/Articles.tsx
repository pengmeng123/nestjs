import { defineComponent, h, onMounted, ref } from 'vue'
import { List, Pagination, Button } from 'ant-design-vue'
import http from '../api/http'
import dayjs from 'dayjs'
import { useRouter, RouterLink } from 'vue-router'

/**
 * 文章列表页（TSX）
 */
export default defineComponent({
  name: 'Articles',
  setup() {
    const router = useRouter()
    const list = ref<any[]>([])
    const total = ref(0)
    const page = ref(1)
    const pageSize = ref(10)

    async function fetchArticles() {
      const { data } = await http.get('/article', {
        params: { page: page.value, pageSize: pageSize.value },
      })
      list.value = data.list || []
      total.value = data.total || 0
    }

    function onPageChange(p: number, ps: number) {
      page.value = p
      pageSize.value = ps
      fetchArticles()
    }

    const renderItemSlot = ({ item }: any) => {
      return h(
        'div',
        {
          class: 'p-4 hover:bg-gray-50 cursor-pointer',
          onClick: () => router.push(`/article/${item.id}`),
        },
        [
          h('div', { class: 'text-lg font-medium' }, item.title || `文章 #${item.id}`),
          h('div', { class: 'text-gray-500 text-sm mt-1' }, [
            item?.category ? `分类：${item.category.name} ` : '',
            item?.tags?.length ? ` ｜ 标签：${item.tags.map((t: any) => t.name).join(', ')}` : '',
            ` ｜ 发布于：${dayjs(item.createDate).format('YYYY-MM-DD HH:mm')}`,
          ]),
        ],
      )
    }

    onMounted(fetchArticles)

    return () => (
      <div class="p-6 max-w-5xl mx-auto">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl font-semibold">文章列表</h1>
        </div>
        <List dataSource={list.value} bordered v-slots={{ header: () => <div>共 {total.value} 篇文章</div>, renderItem: renderItemSlot }} />
        <div class="mt-4 flex justify-center">
          <Pagination
            current={page.value}
            pageSize={pageSize.value}
            total={total.value}
            onChange={onPageChange}
          />
        </div>
      </div>
    )
  },
})
