// .vitepress/theme/index.ts
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import FeedbackButton from './FeedbackButton.vue'
import SidebarToggle from './SidebarToggle.vue'
import PythonEditor from '../components/PythonEditor.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'layout-bottom': () => [h(FeedbackButton), h(SidebarToggle)]
    })
  },
  enhanceApp({ app, router, siteData }) {
    // 注册全局组件
    app.component('PythonEditor', PythonEditor)
  }
} satisfies Theme
