import { createApp, defineComponent } from 'vue'
import App from './App'
import './style.css'
import 'ant-design-vue/dist/reset.css'
import Antd from 'ant-design-vue'
import { createPinia } from 'pinia'
import router from './router'

/**
 * 应用入口（TSX）
 */
const Root = defineComponent({
  render: () => <App />,
})

function bootstrap() {
  const app = createApp(Root)
  app.use(createPinia())
  app.use(router)
  app.use(Antd)
  app.mount('#app')
}

bootstrap()

