<template>
  <a
    href="https://github.com/brycewang-stanford/langgraph-lightning/issues"
    target="_blank"
    rel="noopener noreferrer"
    class="feedback-button"
    title="问题反馈"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
    <span>问题反馈</span>
  </a>
</template>

<script setup>
// 无需额外逻辑
</script>

<style scoped>
.feedback-button {
  position: fixed;
  right: 20px;
  bottom: 80px;
  z-index: 1000;

  display: flex;
  align-items: center;
  gap: 8px;

  padding: 12px 20px;
  background: var(--vp-c-brand-1, #3b82f6);
  color: white;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;

  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transition: all 0.3s ease;

  cursor: pointer;
}

.feedback-button:hover {
  background: var(--vp-c-brand-2, #2563eb);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
}

.feedback-button:active {
  transform: translateY(0);
}

.feedback-button svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .feedback-button {
    right: 16px;
    bottom: 60px;
    padding: 10px 16px;
    font-size: 13px;
  }

  .feedback-button svg {
    width: 18px;
    height: 18px;
  }
}

/* 超小屏幕只显示图标 */
@media (max-width: 480px) {
  .feedback-button span {
    display: none;
  }

  .feedback-button {
    padding: 12px;
    border-radius: 50%;
  }
}

/* 暗色模式适配 */
.dark .feedback-button {
  background: var(--vp-c-brand-1, #3b82f6);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.dark .feedback-button:hover {
  background: var(--vp-c-brand-2, #2563eb);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}
</style>
