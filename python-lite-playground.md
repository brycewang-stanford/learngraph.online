---
layout: doc
---

<script setup>
const fibCode = `# 斐波那契数列
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(f'fibonacci({i}) = {fibonacci(i)}')`

const dataCode = `# 数据处理
data = [23, 45, 12, 67, 34, 89, 56, 78]

print('原始数据:', data)
print('最大值:', max(data))
print('最小值:', min(data))
print('平均值:', sum(data) / len(data))
print('排序后:', sorted(data))`
</script>

# Python 编辑器 - 极速版 ⚡

**超轻量级设计，秒开无卡顿！**

## ✨ 特点

- ⚡ **零延迟**: 页面立即加载，无任何卡顿
- 🚀 **快速执行**: FastAPI 后端，1-2秒得到结果
- 🎯 **简洁**: 纯 textarea，无重量级编辑器
- ⌨️ **快捷键**: `Ctrl/Cmd + Enter` 运行代码

## 🎯 基础示例

<PythonEditorLite />

## 📚 更多示例

### 斐波那契数列

<PythonEditorLite :initial-code="fibCode" />

### 数据处理

<PythonEditorLite :initial-code="dataCode" />

## 💡 使用提示

- **Tab 键**: 插入 4 个空格
- **Ctrl/Cmd + Enter**: 快速运行
- **无需等待**: 立即开始编码

## ⚙️ 性能对比

| 版本 | 加载时间 | 编辑器大小 | 卡顿 |
|------|---------|-----------|------|
| Monaco 版本 | 2-3秒 | ~2MB | 有 |
| **极速版** | **立即** | **<10KB** | **无** ✨ |

---

*Powered by FastAPI - 极致性能体验*
