/**
 * Python 代码块编辑功能
 * 允许用户编辑代码并运行编辑后的代码
 */

export function enableCodeBlockEditing() {
  if (typeof window === 'undefined') return

  console.log('[CodeBlockEditor] Starting to add edit buttons...')

  // 等待 DOM 加载完成，增加延迟时间
  setTimeout(() => {
    const pythonBlocks = document.querySelectorAll('div.language-python')

    console.log(`[CodeBlockEditor] Found ${pythonBlocks.length} Python blocks`)

    if (pythonBlocks.length === 0) {
      console.warn('[CodeBlockEditor] No Python blocks found! Retrying...')
      // 如果没找到，再试一次
      setTimeout(() => enableCodeBlockEditing(), 1000)
      return
    }

    pythonBlocks.forEach((block, index) => {
      // 避免重复处理
      if (block.hasAttribute('data-editor-initialized')) {
        return
      }
      block.setAttribute('data-editor-initialized', 'true')

      const codeElement = block.querySelector('code') as HTMLElement
      if (!codeElement) return

      // 保存原始代码
      const originalCode = codeElement.textContent || ''
      let isEditing = false

      // 创建编辑按钮 - 放在工具栏区域，复制按钮左边
      const editBtn = document.createElement('button')
      editBtn.className = 'code-edit-btn'
      editBtn.innerHTML = '✏️ 编辑'
      editBtn.title = '编辑代码（临时修改）'

      // 使用绝对定位，移到代码块上方工具栏区域，在 API Keys 按钮左边
      editBtn.style.position = 'absolute'
      editBtn.style.top = '-36px'
      editBtn.style.right = '130px'  // 在 API Keys 按钮（right: 0）左边
      editBtn.style.padding = '4px 12px'
      editBtn.style.background = '#2196F3'
      editBtn.style.color = 'white'
      editBtn.style.border = 'none'
      editBtn.style.borderRadius = '4px'
      editBtn.style.cursor = 'pointer'
      editBtn.style.fontSize = '12px'
      editBtn.style.zIndex = '10'
      editBtn.style.fontWeight = '500'

      // 切换编辑模式
      editBtn.addEventListener('click', () => {
        if (!isEditing) {
          // 进入编辑模式
          isEditing = true
          codeElement.contentEditable = 'true'
          codeElement.style.outline = '2px solid #4CAF50'
          codeElement.style.backgroundColor = '#f0f0f0'
          codeElement.focus()
          editBtn.innerHTML = '💾 完成'
          editBtn.style.background = '#4CAF50'
        } else {
          // 退出编辑模式
          isEditing = false
          codeElement.contentEditable = 'false'
          codeElement.style.outline = 'none'
          codeElement.style.backgroundColor = ''
          editBtn.innerHTML = '✏️ 编辑'
          editBtn.style.background = '#2196F3'
        }
      })

      // 添加按钮到代码块容器（与其他工具栏按钮一样）
      block.appendChild(editBtn)

      // 强制确保按钮可见
      setTimeout(() => {
        if (editBtn && editBtn.parentElement) {
          console.log(`[CodeBlockEditor] Button is visible for block ${index}`, editBtn)
        } else {
          console.error(`[CodeBlockEditor] Button NOT attached for block ${index}`)
        }
      }, 100)

      console.log(`[CodeBlockEditor] Added edit button to block ${index}`)
    })
  }, 1000)  // 增加延迟到 1 秒
}
