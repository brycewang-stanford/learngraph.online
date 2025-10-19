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

const stringProcessCode = `# 字符串处理示例
text = 'Hello, LangGraph! Welcome to Python Playground.'

print('原始文本:', text)
print('长度:', len(text))
print('大写:', text.upper())
print('小写:', text.lower())
print('单词数:', len(text.split()))

# 统计字符
print('\\n字符统计:')
for char in set(text.lower()):
    if char.isalpha():
        count = text.lower().count(char)
        print(f'  {char}: {count}')`

const oopCode = `# 面向对象示例
class Student:
    def __init__(self, name, age, grade):
        self.name = name
        self.age = age
        self.grade = grade

    def introduce(self):
        return f'我叫{self.name}，今年{self.age}岁，成绩是{self.grade}分'

    def is_passing(self):
        return self.grade >= 60

# 创建学生对象
students = [
    Student('张三', 18, 85),
    Student('李四', 19, 92),
    Student('王五', 18, 58)
]

# 输出信息
for student in students:
    print(student.introduce())
    status = '及格' if student.is_passing() else '不及格'
    print(f'  状态: {status}\\n')`
</script>

# Python 在线编辑器 - 测试页面

欢迎来到 Python 在线编辑器！这个页面展示了如何在浏览器中直接运行 Python 代码。

## ✨ 功能特性

- 🎨 **Monaco Editor**: 提供专业的代码编辑体验
- 🐍 **Pyodide**: 在浏览器中运行 Python 3.12
- ⚡ **即时执行**: 无需后端服务器，代码在浏览器中执行
- 📝 **语法高亮**: 完整的 Python 语法高亮支持
- 🔧 **代码补全**: 智能代码提示和补全
- ⌨️ **快捷键**: 使用 `Ctrl/Cmd + Enter` 快速运行代码

## 🎯 基础示例

下面是一个简单的 Python 编辑器，您可以直接编辑和运行代码：

<PythonEditor />

## 📚 更多示例

### 示例 1: 斐波那契数列

<PythonEditor :initial-code="fibonacciCode" />

### 示例 2: 数据处理

<PythonEditor :initial-code="dataProcessCode" />

### 示例 3: 字符串处理

<PythonEditor :initial-code="stringProcessCode" />

### 示例 4: 面向对象编程

<PythonEditor :initial-code="oopCode" />

## 💡 使用说明

1. **编辑代码**: 直接在编辑器中修改 Python 代码
2. **运行代码**: 点击 "▶️ 运行代码" 按钮或使用快捷键 `Ctrl/Cmd + Enter`
3. **查看输出**: 运行结果会显示在编辑器下方的输出区域
4. **清空输出**: 点击 "🗑️ 清空输出" 按钮清除输出结果
5. **错误提示**: 如果代码有错误，会在输出区域显示错误信息

## ⚠️ 注意事项

- Pyodide 首次加载可能需要几秒钟，请耐心等待
- 某些 Python 库可能不可用（Pyodide 支持大部分标准库）
- 代码在浏览器中执行，不会保存到服务器
- 避免运行耗时过长或占用大量内存的代码

## 🔗 下一步

现在您已经可以在浏览器中运行 Python 代码了！接下来我们将添加：

- ✅ Phase 1: Python 代码运行（当前页面）
- ⏳ Phase 2: GitHub 登录认证
- ⏳ Phase 3: 内容编辑和保存功能
- ⏳ Phase 4: FastAPI 后端集成

---

*Powered by Monaco Editor + Pyodide*
