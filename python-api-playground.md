---
layout: doc
---

<script setup>
import { ref } from 'vue'

const fibonacciCode = `# 斐波那契数列
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 计算前 10 个斐波那契数
for i in range(10):
    print(f'fibonacci({i}) = {fibonacci(i)}')`

const dataProcessCode = `# 数据统计示例
data = [23, 45, 12, 67, 34, 89, 56, 78]

print('原始数据:', data)
print('最大值:', max(data))
print('最小值:', min(data))
print('平均值:', sum(data) / len(data))
print('总和:', sum(data))

# 排序
sorted_data = sorted(data)
print('排序后:', sorted_data)`
</script>

# Python 在线编辑器 - FastAPI 版本

欢迎使用 FastAPI 驱动的 Python 在线编辑器！代码在服务器端执行，性能更快、更稳定。

## ✨ 性能优势

| 特性 | Pyodide (浏览器) | FastAPI (服务器) |
|------|-----------------|------------------|
| 加载速度 | 5-10 秒 | 立即 ✅ |
| 执行速度 | 慢 | 快 ✅ |
| Python 库 | 有限 | 完整 ✅ |
| 用户体验 | 卡顿 | 流畅 ✅ |

## 🎯 基础示例

<PythonEditorAPI />

## 📚 更多示例

### 示例 1: 斐波那契数列

<PythonEditorAPI :initial-code="fibonacciCode" />

### 示例 2: 数据处理

<PythonEditorAPI :initial-code="dataProcessCode" />

## 💡 使用说明

1. **编辑代码**: 直接在编辑器中修改 Python 代码
2. **运行代码**: 点击 "▶️ 运行代码" 按钮或使用快捷键 `Ctrl/Cmd + Enter`
3. **查看输出**: 运行结果会显示在编辑器下方
4. **执行时间**: 查看代码执行耗时

## ⚙️ 技术架构

```
用户编辑代码
    ↓
点击"运行代码"
    ↓
HTTP POST → FastAPI 服务器
    ↓
服务器执行 Python 代码
    ↓
返回结果 (1-2 秒)
    ↓
显示输出
```

## 🔒 安全特性

- ✅ 执行超时限制（最多 30 秒）
- ✅ 内存限制（256MB）
- ✅ 进程隔离
- ✅ Docker 容器沙箱（可选）
- ✅ 网络访问限制

## ⚠️ 注意事项

- 代码在服务器端执行，需要网络连接
- 执行时间限制为 30 秒
- 内存限制为 256MB
- 避免运行恶意代码

## 🚀 后端 API

FastAPI 服务提供以下端点：

- `POST /execute` - 执行 Python 代码
- `POST /execute-docker` - 使用 Docker 沙箱执行
- `GET /health` - 健康检查

API 文档：http://localhost:8000/docs

---

*Powered by FastAPI + Docker 🐳*
