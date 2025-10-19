/**
 * VitePress 性能优化配置
 */

export const performanceConfig = {
  // 构建优化
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 Vue 单独打包
          vue: ['vue'],
          // 将编辑器组件单独打包
          editor: ['@monaco-editor/loader', 'monaco-editor']
        }
      }
    },
    // 压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },

  // Vite 优化
  vite: {
    // SSR 配置 - 修复 mark.js 构建问题
    ssr: {
      noExternal: ['mark.js']
    },

    // 模块解析配置
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },

    optimizeDeps: {
      // 预构建依赖
      include: ['vue', 'mark.js'],
      // 排除大型依赖
      exclude: ['@monaco-editor/loader', 'monaco-editor']
    },

    // 开发服务器优化
    server: {
      fs: {
        // 允许访问
        allow: ['..']
      }
    },

    // 构建优化
    build: {
      // chunk 大小警告限制
      chunkSizeWarningLimit: 1000,
      // Rollup 选项
      rollupOptions: {
        output: {
          // 手动分包
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('monaco')) {
                return 'monaco'
              }
              if (id.includes('vue')) {
                return 'vue'
              }
              return 'vendor'
            }
          }
        }
      }
    }
  }
}
