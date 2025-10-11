---
layout: home

hero:
  name: "LangGraph Lightning"
  text: "⚡ 快速掌握 LangGraph"
  tagline: 基于 LangChain Academy 的深度解读与工程实战指南
  image:
    src: /logo.svg
    alt: LangGraph Lightning
  actions:
    - theme: brand
      text: 开始学习
      link: /module-0/0.2-LangGraph Basics-详细解读
    - theme: alt
      text: GitHub 仓库
      link: https://github.com/brycewang-stanford/langgraph-lightning

features:
  - icon: 📝
    title: 术语通俗化
    details: 对所有 Python 和 LangGraph 术语进行深入浅出的解读，让零基础的 AI-Native 用户也能快速上手
  - icon: 💻
    title: 代码实战化
    details: 在原课程基础上大规模扩展演示代码和工程案例，从演示级升级到生产级实现
  - icon: 🎯
    title: 场景落地化
    details: 展示如何将 Multi-Agent 系统应用到实际业务中，包含大量真实业务场景案例
  - icon: 🚀
    title: 门槛最小化
    details: 每个概念都配有清晰的定义、原理分析、代码示例、常见陷阱和最佳实践
  - icon: 🤖
    title: AI-Native 开发
    details: 展示如何利用 AI 加速开发，包括 AI 辅助编码、调试、学习和代码重构
  - icon: 🔄
    title: 持续更新
    details: 基于 LangChain Academy 官方课程，持续跟进最新内容和技术趋势
---

## 📚 课程结构

本书包含 6 个主要模块，从基础到高级，循序渐进：

### 第 0 章：基础入门
- Python 核心概念
- LangChain 和 LangGraph 生态
- Chat Models 使用
- 工具集成

### 第 1 章：LangGraph 核心
- 构建第一个 LangGraph
- Chain、Router 和 Agent
- 状态管理机制
- Agent 记忆系统

### 第 2 章：状态管理
- State Schema 设计
- Reducers 的作用
- 多模式状态管理
- 消息过滤和裁剪

### 第 3 章：人机协作
- 断点调试
- 状态编辑
- 流式中断
- 时间旅行调试

### 第 4 章：高级模式
- 并行执行优化
- 子图模块化设计
- Map-Reduce 模式
- 构建研究助手

### 第 5-6 章：生产实战
- 性能优化
- 监控和日志
- 安全性和权限
- 大规模部署

## 🎯 适合人群

- ✅ **AI-Native 开发者**：想要快速掌握 LangGraph 的新手
- ✅ **Python 初学者**：需要详细 Python 知识点讲解
- ✅ **业务开发者**：希望将 AI 应用到实际业务场景
- ✅ **架构师**：探索 Multi-Agent 系统架构设计
- ✅ **产品经理**：了解 AI Agent 的能力边界和应用场景

## 🚀 快速开始

```bash
# 安装依赖
pip install langchain langchain-openai langchain-community langgraph tavily-python

# 配置 API 密钥
export OPENAI_API_KEY="your-api-key"
```

```python
# 第一个 LangGraph
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, MessagesState

def chatbot(state: MessagesState):
    return {"messages": [ChatOpenAI(model="gpt-4o").invoke(state["messages"])]}

graph = StateGraph(MessagesState)
graph.add_node("chatbot", chatbot)
graph.set_entry_point("chatbot")
graph.set_finish_point("chatbot")

app = graph.compile()
response = app.invoke({"messages": [("user", "Hello!")]})
```

## 📖 与原课程的关系

本书是对 [LangChain Academy](https://academy.langchain.com/courses/intro-to-langgraph) 官方课程的深度解读和扩展：

- ✅ **深度解读**：不是简单翻译，而是深入分析每个概念
- ✅ **内容扩展**：原课程基础上增加 3-5 倍的内容量
- ✅ **实战强化**：将演示级代码升级为生产级实现
- ✅ **本地化适配**：针对中文开发者的学习习惯和痛点

## 🤝 贡献与反馈

欢迎通过以下方式参与：

- 📝 [提交 Issue](https://github.com/brycewang-stanford/langgraph-lightning/issues) - 报告错误或提出建议
- 💡 [Pull Request](https://github.com/brycewang-stanford/langgraph-lightning/pulls) - 贡献代码或文档
- 📧 [联系作者](mailto:brycewang2018@gmail.com) - 直接反馈

---

**让我们一起，在生成式 AI 的助力下，重塑这个世界的业务流程！** 🚀
