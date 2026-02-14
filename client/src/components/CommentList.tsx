import { defineComponent, onMounted, ref } from 'vue'
import { List, Comment as AComment, Avatar, Button, Input, Pagination, message } from 'ant-design-vue'
import http from '../api/http'
import dayjs from 'dayjs'
import { useAuthStore } from '../stores/auth'

export default defineComponent({
  name: 'CommentList',
  props: {
    articleId: { type: Number, required: true },
  },
  setup(props) {
    const auth = useAuthStore()
    const list = ref<any[]>([])
    const loading = ref(false)
    const page = ref(1)
    const pageSize = ref(10)
    const total = ref(0)

    const newContent = ref('')
    const posting = ref(false)

    const replyTo = ref<any | null>(null)
    const replyContent = ref('')

    async function fetchComments() {
      loading.value = true
      try {
        const { data } = await http.get('/comment', {
          params: {
            articleId: props.articleId,
            page: page.value,
            pageSize: pageSize.value,
          },
        })
        list.value = data.list || []
        total.value = data.total || 0
      } finally {
        loading.value = false
      }
    }

    async function postRoot() {
      if (!auth.token) {
        message.warning('请先登录')
        return
      }
      if (!newContent.value.trim()) return
      try {
        posting.value = true
        await http.post('/comment', {
          content: newContent.value,
          articleId: props.articleId,
        })
        newContent.value = ''
        fetchComments()
      } catch {
        message.error('发布失败')
      } finally {
        posting.value = false
      }
    }

    async function toggleLike(c: any) {
      if (!auth.token) {
        message.warning('请先登录')
        return
      }
      try {
        const { data } = await http.post(`/comment/${c.id}/like`)
        c.isLiked = data.isLiked
        c.likeCount = data.likeCount
        fetchComments()
      } catch {
        message.error('操作失败')
      }
    }

    function startReply(c: any) {
      if (!auth.token) {
        message.warning('请先登录')
        return
      }
      replyTo.value = c
      replyContent.value = ''
    }

    function cancelReply() {
      replyTo.value = null
    }

    async function sendReply() {
      if (!replyTo.value || !replyContent.value.trim()) return
      try {
        posting.value = true
        await http.post('/comment', {
          content: replyContent.value,
          articleId: props.articleId,
          parentId: replyTo.value.id,
        })
        replyContent.value = ''
        replyTo.value = null
        fetchComments()
      } catch {
        message.error('回复失败')
      } finally {
        posting.value = false
      }
    }

    async function loadMoreReplies(root: any) {
      const { data } = await http.get('/comment/sub', {
        params: { parentId: root.id, page: 1, pageSize: 10 },
      })
      root.children = data.list || []
    }

    function onPageChange(p: number, ps: number) {
      page.value = p
      pageSize.value = ps
      fetchComments()
    }

    const formatDate = (d?: string) => (d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '')

    onMounted(fetchComments)

    return () => (
      <div>
        <div class="mb-4">
          <Input.TextArea v-model:value={newContent.value} rows={3} placeholder="友善发言，理性讨论" />
          <div class="mt-2 text-right">
            <Button type="primary" loading={posting.value} onClick={postRoot}>
              发布评论
            </Button>
          </div>
        </div>

        <List data-source={list.value} loading={loading.value}>
          {{
            renderItem: ({ item }: any) => (
              <div>
                <AComment
                  author={item.author?.name || '匿名'}
                  datetime={formatDate(item.createDate)}
                  content={
                    <div class="whitespace-pre-wrap">
                      {item.content}
                      <div class="flex items-center gap-3 mt-2">
                        <Avatar.Group maxCount={3}>
                          {(item.likedUsers || []).map((u: any) => (
                            <Avatar key={u.id} src={u.avatar}>
                              {u.name?.slice(0, 1)}
                            </Avatar>
                          ))}
                        </Avatar.Group>
                        <Button size="small" onClick={() => toggleLike(item)}>
                          👍 {item.likeCount} {item.isLiked ? <span class="text-blue-600">已赞</span> : null}
                        </Button>
                        <Button size="small" onClick={() => startReply(item)}>
                          回复
                        </Button>
                      </div>
                    </div>
                  }
                />

                <div class="pl-10">
                  {(item.children || []).map((c: any) => (
                    <AComment
                      key={c.id}
                      author={
                        <>
                          <span>{c.author?.name || '匿名'}</span>
                          {c.parent && c.parent.id !== item.id ? (
                            <span class="text-gray-500"> 回复 @{c.parent?.author?.name}</span>
                          ) : null}
                        </>
                      }
                      datetime={formatDate(c.createDate)}
                      content={
                        <div class="whitespace-pre-wrap">
                          {c.content}
                          <div class="flex items-center gap-3 mt-2">
                            <Avatar.Group maxCount={3}>
                              {(c.likedUsers || []).map((u: any) => (
                                <Avatar key={u.id} src={u.avatar}>
                                  {u.name?.slice(0, 1)}
                                </Avatar>
                              ))}
                            </Avatar.Group>
                            <Button size="small" onClick={() => toggleLike(c)}>
                              👍 {c.likeCount} {c.isLiked ? <span class="text-blue-600">已赞</span> : null}
                            </Button>
                            <Button size="small" onClick={() => startReply(c)}>
                              回复
                            </Button>
                          </div>
                        </div>
                      }
                    />
                  ))}
                  {item.replyCount > ((item.children && item.children.length) || 0) ? (
                    <div class="pl-2">
                      <Button type="link" onClick={() => loadMoreReplies(item)}>
                        更多回复（{item.replyCount}）
                      </Button>
                    </div>
                  ) : null}
                </div>

                {replyTo.value && replyTo.value.id === item.id ? (
                  <div class="pl-10 mt-2">
                    <Input.TextArea v-model:value={replyContent.value} rows={2} placeholder={`回复 @${item.author?.name || '匿名'}`} />
                    <div class="mt-2">
                      <Button size="small" type="primary" loading={posting.value} onClick={sendReply}>
                        发送
                      </Button>
                      <Button size="small" class="ml-2" onClick={cancelReply}>
                        取消
                      </Button>
                    </div>
                  </div>
                ) : null}

                {(item.children || []).map((c: any) =>
                  replyTo.value && replyTo.value.id === c.id ? (
                    <div class="pl-10 mt-2" key={`reply-input-${c.id}`}>
                      <Input.TextArea v-model:value={replyContent.value} rows={2} placeholder={`回复 @${c.author?.name || '匿名'}`} />
                      <div class="mt-2">
                        <Button size="small" type="primary" loading={posting.value} onClick={sendReply}>
                          发送
                        </Button>
                        <Button size="small" class="ml-2" onClick={cancelReply}>
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : null,
                )}
              </div>
            ),
            header: () => null,
          }}
        </List>

        <div class="mt-4 flex justify-center">
          <Pagination current={page.value} pageSize={pageSize.value} total={total.value} onChange={onPageChange} />
        </div>
      </div>
    )
  },
})
