import { defineComponent, ref, computed, onMounted } from 'vue'
import { Breadcrumb, Card } from 'ant-design-vue'
import { useRoute, RouterLink } from 'vue-router'
import http from '../api/http'
import dayjs from 'dayjs'
import CommentList from '../components/CommentList'

/**
 * 文章详情页（TSX）
 */
export default defineComponent({
  name: 'ArticleDetail',
  setup() {
    const route = useRoute()
    const id = Number(route.params.id)
    const article = ref<any>(null)

    async function fetchArticle() {
      const { data } = await http.get(`/article/${id}`)
      article.value = data
    }

    const contentHtml = computed(() => (article.value?.content || '').replace(/\\n/g, '<br/>'))
    const formatDate = (d?: string) => (d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '')

    onMounted(fetchArticle)

    return () => (
      <div class="p-6 max-w-4xl mx-auto">
        <Breadcrumb class="mb-4">
          <Breadcrumb.Item>
            <RouterLink to="/articles">文章</RouterLink>
          </Breadcrumb.Item>
          <Breadcrumb.Item>详情</Breadcrumb.Item>
        </Breadcrumb>

        <Card title={article.value?.title || `文章 #${id}`} class="mb-6">
          <div class="prose max-w-none" innerHTML={contentHtml.value}></div>
          <div class="text-gray-500 text-sm mt-4">发布于：{formatDate(article.value?.createDate)}</div>
        </Card>

        <Card title="评论">
          <CommentList articleId={id} />
        </Card>
      </div>
    )
  },
})

