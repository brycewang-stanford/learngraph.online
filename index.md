---
layout: home

hero:
  name: "LangGraph 飞速上手"

  text: "案例先行，面向 Agent 小白，工业级搭建"
  tagline: 基于官方系列课程的深度解读与大幅拓展
  image:
    src: /logo.svg
    alt: LangGraph Lightning
  actions:
    - theme: brand
      text: 开始学习
      link: /module-0/0.0-LangGraph-上手案例
    - theme: alt
      text: GitHub 仓库
      link: https://github.com/brycewang-stanford/langgraph-lightning
    - theme: brand
      text: 本书更新-Roadmap
      link: /本书更新-Roadmap

features:
  - icon: 🎯
    title: 零门槛上手
    details: 术语通俗易懂老少皆宜地用大白话解读，每个概念配有清晰定义、原理分析、代码示例、常见陷阱和最佳实践，零基础的用户也能快速上手，把握整体架构与核心概念
  - icon: 💻
    title: LangGraph 的设计哲学
    details: 以图为核心，用可视化与函数式结构让多智能体系统的推理过程清晰、可控、可扩展。LangGraph 选择不做"另一个工作流构建器"，而是聚焦如何用代码与智能体结合，让 AI 从拼装工具走向真正的智能创造。
  - icon: 🤖
    title: LangGraph：拒绝"拖拽式"工具带来的幻觉，回归智能体本质
    details: LangChain 创始人 Harrison Chase 指出，拖拽式工作流工具追求的是可预测性，却无法真正构建具备自主决策的智能体。在他看来，OpenAI 的 AgentKit 以及市面上的Coze、LangFlow 和 Flowise 等，本质上都是可视化工作流构建器，而非真正的"智能体构建器"

---

<p align="center">
  <img src="/langgraph.png" alt="LangGraph Logo" width="500" />
</p>

## 📚 课程结构

本书包含 6 个主要模块，从基础到高级，循序渐进：

### 第 0 章：基础入门
- **0.0 LangGraph 快速案例**：5 个从简单到复杂的实战案例，飞速上手
- **0.1 Python 基础入门**：Python 核心概念和 AI/ML 库入门
- **0.2 LangGraph 基础入门**：LangChain 生态、Chat Models、工具集成
- **0.3 LangChain 介绍**：从 LangGraph 角度系统学习 LangChain 7 大核心组件

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
- 📧 [Email 联系作者](mailto:brycew6m@gmail.com) - 直接反馈

---

**让我们一起，在生成式 AI 的助力下，重塑这个世界的业务流程！** 🚀
