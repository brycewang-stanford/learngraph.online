---
layout: home

hero:
  name: "智能体系统快速搭建"
  text: "案例先行，通俗易懂"
  tagline: AI时代，理解为王。摒弃非重要细节，直达 Agentic AI 思想内核
  image:
    src: /logo.svg
    alt: LearnGraph.online
  actions:
    - theme: brand
      text: 开始学习
      link: /module-0/0.0-LangGraph-上手案例
    - theme: alt
      text: 更新 Roadmap
      link: /本书更新-Roadmap

features:
  - icon: 🎯
    title: 零门槛上手
    details: 术语通俗易懂老少皆宜地用大白话解读，每个概念配有清晰定义、原理分析、代码示例、常见陷阱和最佳实践，零基础的用户也能快速上手，把握整体架构与核心概念
  - icon: 💻
    title: LangGraph 设计哲学
    details: 以图为核心，用可视化与函数式结构让多智能体系统的推理过程清晰、可控、可扩展。LangGraph 选择不做"另一个工作流构建器"，而是聚焦如何用代码与智能体结合，让 AI 从拼装工具走向真正的智能创造。
  - icon: 🤖
    title: 拒绝"拖拽式"工具幻觉，回归智能体本质
    details: LangChain 创始人 Harrison Chase 指出，拖拽式工作流工具追求的是可预测性，却无法真正构建具备自主决策的智能体。在他看来，OpenAI 的 AgentKit 以及市面上的Coze、LangFlow 和 Flowise 等，本质上都是可视化工作流构建器，而非真正的"智能体构建器"

---

<p align="center">
  <img src="/langgraph.png" alt="LangGraph Logo" width="500" />
</p>

## 课程结构

本书包含 6 个主要模块，从基础到高级，循序渐进：

### 第 0 章：基础入门
- **[0.0 LangGraph 快速案例](/module-0/0.0-LangGraph-上手案例)**：5 个从简单到复杂的实战案例，飞速上手
- **[0.1 Python 基础入门](/module-0/0.1-Python-基础入门)**：Python 核心概念和 AI/ML 库入门
- **[0.2 LangGraph 基础入门](/module-0/0.2-LangGraph-基础入门)**：LangChain 生态、Chat Models、工具集成
- **[0.3 LangChain 介绍](/module-0/0.3-LangChain-快速回顾)**：从 LangGraph 角度系统学习 LangChain 7 大核心组件

### 第 1 章：LangGraph 核心
- **[1.1 构建第一个 LangGraph](/module-1/1.1-simple-graph-最简图)**：一个最简单的图
- **[1.2 Chain](/module-1/1.2-chain-详细解读)**：核心概念 - Chain
- **[1.3 Router](/module-1/1.3-router-详细解读)**：核心概念 - Router
- **[1.4 Agent](/module-1/1.4-agent-详细解读)**：核心概念 - Agent
- **[1.5 Agent 记忆系统](/module-1/1.5-agent-memory-详细解读)**：多轮对话与持久化
- **[1.6 部署](/module-1/1.6-deployment-详细解读)**：部署详解

### 第 2 章：状态管理
- **[2.1 State Schema 设计](/module-2/2.1-state-schema-详细解读)**
- **[2.2 Reducers 的作用](/module-2/2.2-state-reducers-详细解读)**
- **[2.3 多模式状态管理](/module-2/2.3-multiple-schemas-详细解读)**
- **[2.4 消息过滤和裁剪](/module-2/2.4-trim-filter-messages-详细解读)**
- **[2.5 对话总结](/module-2/2.5-chatbot-summarization-详细解读)**
- **[2.6 外部记忆](/module-2/2.6-chatbot-external-memory-详细解读)**

### 第 3 章：人机协作
- **[3.1 断点调试](/module-3/breakpoints-详细解读)**
- **[3.2 动态断点](/module-3/dynamic-breakpoints-详细解读)**
- **[3.3 状态编辑与人工反馈](/module-3/edit-state-human-feedback-详细解读)**
- **[3.4 流式中断](/module-3/streaming-interruption-详细解读)**
- **[3.5 时间旅行调试](/module-3/time-travel-详细解读)**

### 第 4 章：高级模式
- **[4.1 并行执行优化](/module-4/4.1-parallelization-详细解读)**
- **[4.2 子图模块化设计](/module-4/4.2-sub-graph-详细解读)**
- **[4.3 Map-Reduce 模式](/module-4/4.3-map-reduce-详细解读)**
- **[4.4 构建研究助手](/module-4/4.4-research-assistant-详细解读)**

### 第 5 章：记忆系统
- **[5.1 Memory Agent](/module-5/5.1-memory_agent-详细解读)**
- **[5.2 Memory Store](/module-5/5.2-memory_store-详细解读)**
- **[5.3 Memory Schema - Profile](/module-5/5.3-memoryschema_profile-详细解读)**
- **[5.4 Memory Schema - Collection](/module-5/5.4-memoryschema_collection-详细解读)**

### 第 6 章：生产部署
- **[6.1 创建部署](/module-6/6.1-creating-详细解读)**
- **[6.2 连接管理](/module-6/6.2-connecting-详细解读)**
- **[6.3 双重文本处理](/module-6/6.3-double-texting-详细解读)**
- **[6.4 助手构建](/module-6/6.4-assistant-详细解读)**

## 适合人群
- **AI-Native 开发者**：想要快速掌握 LangGraph 的新手
- **Python 初学者**：需要详细 Python 知识点讲解
- **业务开发者**：希望将 AI 应用到实际业务场景
- **架构师**：探索 Multi-Agent 系统架构设计
- **产品经理**：了解 AI Agent 的能力边界和应用场景

## 🚀 快速开始

```bash
# 安装依赖
pip install langchain langchain-openai langchain-community langgraph tavily-python

# 配置 API 密钥
export OPENAI_API_KEY="your-api-key"
```

```python
from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from typing import TypedDict

class State(TypedDict):
    question: str
    answer: str

def answer_node(state: State):
    llm = ChatOpenAI(model="gpt-4o-mini")
    response = llm.invoke(state["question"])
    return {"answer": response.content}

graph = StateGraph(State)
graph.add_node("answer_node", answer_node)  # ✅ 改名
graph.add_edge(START, "answer_node")
graph.add_edge("answer_node", END)

app = graph.compile()
result = app.invoke({"question": "什么是维基百科？一句话回答"})
print(result["answer"])

# ---------- 可视化 ----------
# 使用 Mermaid 语法画出图，并以图片形式显示
# 注意：需要在 app.compile() 之后才能获取图结构
from IPython.display import Image, display
display(Image(app.get_graph().draw_mermaid_png()))
```

详细注释的版本：
```python
# 从 langgraph.graph 模块中导入 StateGraph、START、END
# StateGraph 是 LangGraph 中用于构建“状态图”的核心类
# START 和 END 分别代表图的起点与终点，用于定义流程的开始与结束
from langgraph.graph import StateGraph, START, END

# 从 langchain_openai 导入 ChatOpenAI
# 这是一个封装好的 OpenAI 接口类，可以直接调用 GPT 模型
from langchain_openai import ChatOpenAI

# 从 typing 模块导入 TypedDict，用于定义强类型字典（类似结构体）
## 另外一个常用的是类型定义工具是 pydantic.BaseModel
from typing import TypedDict

# 定义一个 State 类型，用来描述每个节点处理的数据结构
# 在这里，每个“状态”（state）是一个字典，包含两个字段：
# question（问题）和 answer（回答）
class State(TypedDict):
    question: str  # 用户输入的问题
    answer: str    # 模型生成的答案
    ## 简单结构，只能保存最新一轮对话的内容


# 定义一个节点函数 answer_node，用于处理输入状态并生成输出状态
def answer_node(state: State): # 这里 State 是类的名字，state 是一个实例化的变量名字
    # 创建一个 ChatOpenAI 实例，指定使用的模型是 gpt-4o-mini
    llm = ChatOpenAI(model="gpt-4o-mini")
    
    # 调用模型的 invoke 方法，将当前状态中的问题作为输入
    response = llm.invoke(state["question"])
    
    # 返回一个新的状态字典，只包含 "answer" 字段
    # response.content 是模型生成的文本内容
    return {"answer": response.content}


# 创建一个状态图对象，并指定状态类型为上面定义的 State
graph = StateGraph(State)

# 向图中添加一个节点，名称为 "answer_node"，对应的执行函数是 answer_node
graph.add_node("answer_node", answer_node)

# 添加边：定义图中节点之间的执行顺序
# 从 START 节点（起点）连到 "answer_node"
graph.add_edge(START, "answer_node")

# 从 "answer_node" 节点连到 END（终点）
graph.add_edge("answer_node", END)

# 编译图，将其转换为可执行的“应用”对象
app = graph.compile()

# 调用应用，传入初始状态（包含一个问题）
result = app.invoke({"question": "什么是维基百科？一句话回答"})

# 打印出模型生成的回答内容
print(result["answer"])


# 传入一个新的问题。AI 无法记忆上一个问题，因为我们这个简单图没有记忆机制
result = app.invoke({"question": "刚才我问了个什么问题？"})
# 打印出模型生成的回答内容
print()
print("第二个问题的回答： ")
print(result["answer"])

```

## 📖 与原课程的关系

本书是对 [LangChain Academy](https://academy.langchain.com/courses/intro-to-langgraph) 官方课程的深度解读和大幅扩展：
- **深度解读**：不是简单翻译，而是深入分析每个概念
- **内容扩展**：原课程基础上增加 3-5 倍的高质量容量
- **实战强化**：将演示级代码升级为生产级实现
- **本地化适配**：针对中文开发者的学习习惯和痛点

## 🤝 贡献与反馈

欢迎通过以下方式参与：
- [提交 Issue](https://github.com/brycewang-stanford/learngraph.online/issues) - 报告错误或提出建议
- [Pull Request](https://github.com/brycewang-stanford/learngraph.online/pulls) - 贡献代码或文档
- [Email 联系作者](mailto:brycew6m@gmail.com) - 直接反馈

---

**让我们一起，在生成式 AI 的助力下，快速掌握 Agentic AI！** 
