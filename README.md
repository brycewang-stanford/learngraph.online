# 《LangGraph 飞速上手 v0.1》

> 案例先行，通俗易懂 —— 基于 LangChain Academy 的深度解读与工程实战指南

[![在线阅读](https://img.shields.io/badge/在线阅读-learngraph.online-blue)](https://www.learngraph.online)
![LangGraph](https://img.shields.io/badge/LangGraph-Latest-green)
![Python](https://img.shields.io/badge/Python-3.11+-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📖 项目简介

**AI 时代，理解为王：摒弃技术细节，直达 Agentic AI 思想内核**

本书是 [LangChain Academy](https://academy.langchain.com/courses/intro-to-langgraph) 官方课程的深度解读与工程实战指南。通过通俗易懂的语言、丰富的案例和在线可执行代码，帮助零基础用户快速掌握 LangGraph 和 Multi-Agent 系统开发。

### 🎯 核心特色

- ✅ **零门槛上手**：术语通俗易懂老少皆宜地用大白话解读
- ✅ **案例先行**：5 个从简单到复杂的实战案例，飞速上手
- ✅ **在线运行**：网页内置 Python 运行环境，边学边练
- ✅ **深度解读**：每个概念配有清晰定义、原理分析、代码示例、常见陷阱和最佳实践
- ✅ **工程实战**：从演示级代码到生产级实现的完整指南

---

## 🌐 在线阅读

**网站地址**：[https://www.learngraph.online](https://www.learngraph.online)

### 网站功能

- 📚 **完整课程内容**：6 大章节，30+ 篇详细解读文章
- 💻 **在线代码运行**：无需本地环境，网页直接运行 Python 代码
- 🔑 **API Key 管理**：安全存储 OpenAI、Anthropic、Tavily 等 API 密钥
- 💬 **评论反馈**：每页底部可留言交流学习心得
- 🎨 **响应式设计**：支持手机、平板、电脑多端访问

---

## 📚 课程结构

### 第 0 章：基础入门

- **0.0 LangGraph 上手案例**：5 个从简单到复杂的实战案例，飞速上手
- **0.1 Python 基础入门**：Python 核心概念和 AI/ML 库入门
- **0.2 LangGraph 基础入门**：LangChain 生态、Chat Models、工具集成
- **0.3 LangChain 快速回顾**：从 LangGraph 角度系统学习 LangChain 7 大核心组件

### 第 1 章：LangGraph 核心

- **1.1 构建第一个 LangGraph**：一个最简单的图
- **1.2 Chain**：顺序执行的工作流
- **1.3 Router**：条件分支与路由
- **1.4 Agent**：智能决策与工具调用
- **1.5 Agent 记忆系统**：多轮对话与持久化
- **1.6 部署指南**：本地开发与生产部署

### 第 2 章：状态管理

- **2.1 State Schema 设计**：定义图的数据结构
- **2.2 Reducers**：状态更新的合并策略
- **2.3 Multiple Schemas**：多模式状态管理
- **2.4 消息过滤和裁剪**：管理 Token 消耗
- **2.5 对话摘要**：长期记忆的实现
- **2.6 外部记忆存储**：集成向量数据库

### 第 3 章：人机协作

- **3.1 Breakpoints**：断点调试机制
- **3.2 Dynamic Breakpoints**：动态条件断点
- **3.3 状态编辑**：人工审核与修正
- **3.4 流式中断**：实时交互与介入
- **3.5 Time Travel**：时间旅行调试

### 第 4 章：高级模式

- **4.1 并行执行**：提升系统吞吐量
- **4.2 Sub-Graph**：模块化设计与复用
- **4.3 Map-Reduce**：批量处理模式
- **4.4 研究助手**：完整的实战案例

### 第 5 章：记忆系统

- **5.1 Memory Agent**：带记忆的智能体
- **5.2 Memory Store**：记忆存储机制
- **5.3 用户画像**：构建个性化记忆
- **5.4 记忆集合**：管理多维度记忆

### 第 6 章：生产部署

- **6.1 创建部署**：LangGraph Platform 快速上手
- **6.2 连接部署**：API 集成与调用
- **6.3 Double Texting**：并发请求处理
- **6.4 Assistants**：助手模式最佳实践

---

## 🚀 快速开始

### 在线学习（推荐）

直接访问 [https://www.learngraph.online](https://www.learngraph.online)，无需任何配置即可开始学习！

### 本地运行

```bash
# 1. 克隆仓库
git clone https://github.com/brycewang-stanford/learngraph.online.git
cd learngraph.online

# 2. 安装依赖
pip install langchain langchain-openai langchain-anthropic \
            langgraph tavily-python python-dotenv

# 3. 配置 API 密钥
cp .env.example .env
# 编辑 .env 文件，填入你的 API 密钥

# 4. 开始学习
# 按章节顺序阅读 module-0 到 module-6 中的 Markdown 文件
```

### 第一个 LangGraph

```python
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, MessagesState, START, END

# 定义聊天机器人节点
def chatbot(state: MessagesState):
    return {"messages": ChatOpenAI(model="gpt-5-nano").invoke(state["messages"])}

# 构建图
graph = StateGraph(MessagesState)
graph.add_node("chatbot", chatbot)
graph.add_edge(START, "chatbot")
graph.add_edge("chatbot", END)

# 编译并运行
app = graph.compile()
response = app.invoke({"messages": [("user", "你好！")]})
print(response["messages"][-1].content)
```

---

## 💡 学习建议

### 初学者路径（4-6 周）

1. **第 0 章（3-5 天）**：快速上手案例 + Python 基础
2. **第 1 章（1 周）**：理解 LangGraph 核心概念
3. **第 2 章（1 周）**：掌握状态管理
4. **第 3 章（3-5 天）**：学会调试技巧
5. **第 4 章（1 周）**：构建复杂系统
6. **第 5-6 章（1 周）**：生产部署实战

### 进阶开发者路径（1-2 周）

- 快速浏览第 0-1 章
- 深入学习第 2-4 章
- 重点关注第 5-6 章的生产实践
- 参考项目实战案例

### 在线学习技巧

1. **使用网站内置 Python 环境**：无需本地配置，直接运行代码
2. **配置 API Key**：在网站右上角配置你的 API 密钥
3. **逐章学习**：按顺序学习，每章都有详细的进度指引
4. **实践为主**：运行每个代码示例，观察输出结果
5. **留言交流**：在页面底部评论区提问和分享

---

## 🌟 项目亮点

### 1. LangGraph 的设计哲学

以图为核心，用可视化与函数式结构让多智能体系统的推理过程清晰、可控、可扩展。LangGraph 选择不做"另一个工作流构建器"，而是聚焦如何用代码与智能体结合，让 AI 从拼装工具走向真正的智能创造。

### 2. 拒绝"拖拽式"工具带来的幻觉

LangChain 创始人 Harrison Chase 指出，拖拽式工作流工具追求的是可预测性，却无法真正构建具备自主决策的智能体。在他看来，OpenAI 的 AgentKit 以及市面上的 Coze、LangFlow 和 Flowise 等，本质上都是可视化工作流构建器，而非真正的"智能体构建器"。

### 3. 通俗易懂的语言

- 每个术语都有通俗化解释
- 大量类比和生活化例子
- 避免晦涩的技术黑话
- 面向 AI-Native 开发者的学习习惯

### 4. 在线可执行代码

- 网页内置 Pyodide 环境
- 支持大部分 Python 库
- 安全的沙盒执行
- 即时查看运行结果

---

## 🤝 贡献指南

欢迎贡献！我们特别需要：

- 📝 **错误修正**：发现文档或代码中的问题
- 💡 **案例补充**：添加新的实战案例
- 🌏 **术语优化**：改进术语翻译和解释
- 🎨 **图表制作**：添加架构图和流程图
- 🔧 **代码改进**：优化示例代码

### 贡献流程

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-case`
3. 提交改动：`git commit -m 'Add: 添加精彩案例'`
4. 推送分支：`git push origin feature/amazing-case`
5. 提交 Pull Request

---

## 📊 技术栈

### 前端

- **VitePress**：静态网站生成器
- **Vue 3**：交互式组件
- **Pyodide**：浏览器端 Python 运行环境
- **Monaco Editor**：代码编辑器
- **Shiki**：语法高亮

### 后端

- **FastAPI**：Python 代码执行 API
- **Docker**：安全的代码执行环境
- **GitHub OAuth**：管理员登录

### 部署

- **Vercel**：前端托管
- **Render**：后端托管
- **Cloudflare**：CDN 加速
- **Google Analytics**：访问统计

---

## 📧 联系方式

- **作者**：王几行XING (Bryce Wang)
- **知乎**：[@王几行XING](https://www.zhihu.com/people/brycewang1898)
- **邮箱**：brycew6m@gmail.com
- **GitHub Issues**：欢迎提问和反馈
- **网站反馈**：每页底部评论区

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- 感谢 **LangChain AI 团队**创造了优秀的 LangGraph 框架和官方课程
- 感谢 **LangChain Academy** 提供了高质量的教学内容
- 感谢 **Pyodide 团队**让 Python 在浏览器中运行成为可能
- 感谢所有为本项目做出贡献的开发者和学习者

---

## 🌟 Star History

如果这个项目对你有帮助，请给我们一个 ⭐ Star！

[![Star History Chart](https://api.star-history.com/svg?repos=brycewang-stanford/learngraph.online&type=Date)](https://star-history.com/#brycewang-stanford/learngraph.online&Date)

---

**让我们一起，在 AI 时代，通过理解而非技术细节，直达 Agentic AI 的思想内核！** 🚀
