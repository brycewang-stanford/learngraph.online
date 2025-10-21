---
layout: home

hero:
  name: "智能体系统快速搭建"
  text: "案例先行，通俗易懂"
  tagline: AI 时代，理解为王。摒弃非重要细节，直达 Agentic AI 思想内核
  image:
    src: /logo.svg
    alt: LearnGraph.online
  actions:
    - theme: brand
      text: 开始学习
      link: /module-0/0.0-LangGraph-上手案例

    - theme: alt
      text: 网站使用说明
      link: /module-0/0.-1-网站使用说明.html

features:
  - icon: 🎯
    title: 零门槛上手
    details: 术语通俗易懂老少皆宜地用大白话解读，每个概念配有清晰定义、原理分析、代码示例、常见陷阱和最佳实践，零基础的用户也能快速上手，把握整体架构与核心概念
  - icon: 💻
    title: LangGraph (1.0.1) 设计哲学
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
## LangChain/Graph 1.0 正式版于 2025.10.20 发布；-U 表示升级到最新版
pip install langchain langchain-openai langchain-community langgraph tavily-python -U 

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
    llm = ChatOpenAI(model="gpt-5-nano")
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
    # 创建一个 ChatOpenAI 实例，指定使用的模型是 gpt-5-nano
    llm = ChatOpenAI(model="gpt-5-nano")
    
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


# 传入一个新的问题。AI 无法记忆上一个问题，因为我们这个简单图没有记忆机制。
# 后面我们会详细介绍 LangGraph 的记忆机制
result = app.invoke({"question": "刚才我问了个什么问题？"})
# 打印出模型生成的回答内容
print()
print("第二个问题的回答： ")
print(result["answer"])

```

## 集成化的 Agent 快速案例

### 案例 1：基础 Agent - 工具调用

本案例展示如何使用 LangChain 1.0 的 `create_agent` API 快速创建一个能调用工具的 Agent。Agent 会自动进行推理、选择工具、执行工具，并返回最终答案。

**核心概念**：
- `create_agent` - LangChain 1.0 新 API，简化 Agent 创建
- 工具定义与绑定
- ReAct 循环（推理 + 行动）

```python
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI

# 定义工具 1：搜索工具
@tool
def search_web(query: str) -> str:
    """搜索网络信息。当需要查找最新信息或事实时使用此工具。"""
    # 模拟搜索结果
    search_results = {
        "天气": "今天北京天气晴朗，温度 20°C",
        "新闻": "AI 技术持续突破，LangGraph 1.0 正式发布",
        "股票": "科技股今日上涨 2.5%"
    }
    for key in search_results:
        if key in query:
            return search_results[key]
    return f"搜索结果：关于 '{query}' 的最新信息"

# 定义工具 2：计算器
@tool
def calculator(expression: str) -> str:
    """执行数学计算。输入格式：数字1 运算符 数字2，例如：'123 * 456'"""
    try:
        # 安全的计算方法：手动解析表达式
        parts = expression.strip().split()
        if len(parts) != 3:
            return "错误：请使用格式 '数字1 运算符 数字2'，如 '123 * 456'"

        num1, operator, num2 = parts
        num1, num2 = float(num1), float(num2)

        if operator == '+':
            result = num1 + num2
        elif operator == '-':
            result = num1 - num2
        elif operator == '*':
            result = num1 * num2
        elif operator == '/':
            result = num1 / num2 if num2 != 0 else "错误：除数不能为零"
        else:
            return f"错误：不支持的运算符 '{operator}'，仅支持 +, -, *, /"

        return f"计算结果：{expression} = {result}"
    except Exception as e:
        return f"计算错误：{str(e)}"

# 定义工具 3：天气查询
@tool
def get_weather(city: str) -> str:
    """查询指定城市的天气信息。"""
    weather_data = {
        "北京": "晴朗，20°C，空气质量良好",
        "上海": "多云，18°C，有轻微雾霾",
        "深圳": "阴天，25°C，湿度较高"
    }
    return weather_data.get(city, f"{city}：暂无天气数据")

# 创建 Agent（LangChain 1.0 新 API）
agent = create_agent(
    model=ChatOpenAI(model="gpt-5-nano", temperature=0),
    tools=[search_web, calculator, get_weather],
    system_prompt="你是一个智能助手，可以使用工具帮助用户解决问题。请先思考需要使用哪些工具，然后逐步执行。"
)

# 执行任务：需要多次工具调用
result = agent.invoke({
    "messages": [{"role": "user", "content": "北京今天天气怎么样？顺便帮我算一下 123 * 456 等于多少？"}]
})

print("=" * 50)
print("Agent 最终回答：")
print(result["messages"][-1].content)
print("=" * 50)

# 查看完整的推理过程（包括工具调用）
print("\n完整对话历史：")
for msg in result["messages"]:
    if hasattr(msg, 'content') and msg.content:
        print(f"\n[{msg.__class__.__name__}]: {msg.content}")
    elif hasattr(msg, 'tool_calls') and msg.tool_calls:
        print(f"\n[调用工具]: {[tc['name'] for tc in msg.tool_calls]}")
```

**运行结果示例**：
```
==================================================
Agent 最终回答：
北京今天天气晴朗，温度 20°C，空气质量良好。
123 * 456 的计算结果是 56088。
==================================================

完整对话历史：

[HumanMessage]: 北京今天天气怎么样？顺便帮我算一下 123 * 456 等于多少？

[调用工具]: ['get_weather', 'calculator']

[ToolMessage]: 晴朗，20°C，空气质量良好

[ToolMessage]: 计算结果：123 * 456 = 56088

[AIMessage]: 北京今天天气晴朗，温度 20°C，空气质量良好。
123 * 456 的计算结果是 56088。
```

**关键点说明**：
1. **ReAct 循环**：Agent 自动执行"推理（Reasoning）→ 行动（Acting）→ 观察（Observation）"循环
2. **并行工具调用**：Agent 可以同时调用多个工具（get_weather 和 calculator）
3. **自动规划**：不需要手动编排工具调用顺序，Agent 会自动决策

---

### 案例 2：高级 Agent - 结构化输出

这个案例展示如何让 Agent 返回结构化的输出，而不仅仅是文本。这在需要提取特定信息格式时非常有用。

**核心概念**：
- 结构化输出（Structured Output）
- Pydantic 模型定义
- ToolStrategy 和 ProviderStrategy

```python
# ==============================================================
# ReAct Agent 联系人信息提取（无 stop 参数 + 稳定输出）
# ==============================================================
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
import json

# --------------------------------------------------------------
# 一、定义输出模型
# --------------------------------------------------------------
class ContactInfo(BaseModel):
    name: str = Field(description="联系人姓名")
    email: str = Field(description="电子邮件地址")
    phone: str = Field(description="电话号码")
    company: str = Field(description="公司名称")
    completed: bool = Field(description="是否提取完成", default=False)

# --------------------------------------------------------------
# 二、定义工具
# --------------------------------------------------------------
@tool
def extract_contact(text: str) -> str:
    """从文本中提取联系人信息"""
    result = {}
    if "张三" in text:
        result["name"] = "张三"
    if "zhangsan@example.com" in text:
        result["email"] = "zhangsan@example.com"
    if "138-0000-0001" in text:
        result["phone"] = "138-0000-0001"
    if "科技公司" in text:
        result["company"] = "科技公司"
    status = "已完成" if len(result) == 4 else "部分完成"
    return json.dumps({"partial_result": result, "status": status})

@tool
def check_completion(result_text: str) -> str:
    """检查联系人信息是否完整"""
    try:
        data = json.loads(result_text)
        res = data.get("partial_result", {})
        if all(k in res for k in ["name", "email", "phone", "company"]):
            return "完成"
        return "未完成"
    except Exception:
        return "未完成"

# --------------------------------------------------------------
# 三、创建 Agent
# --------------------------------------------------------------
llm = ChatOpenAI(model="gpt-5-nano", temperature=0)

agent_contact = create_agent(
    model=llm,
    tools=[extract_contact, check_completion],
    system_prompt=(
        "你是一个联系人信息提取助手。\n"
        "任务：提取文本中的联系人信息（name, email, phone, company）。\n"
        "执行逻辑：\n"
        "1️⃣ 调用 extract_contact 提取信息。\n"
        "2️⃣ 调用 check_completion 检查是否完成。\n"
        "3️⃣ 如果返回“完成”，输出最终 JSON："
        "{\"name\":..., \"email\":..., \"phone\":..., \"company\":..., \"completed\": true}\n"
        "4️⃣ 如果三次检查后仍未完成，输出当前最完整结果，completed=false。\n"
        "不要调用工具超过 3 次。输出后立即结束。"
    )
)

# --------------------------------------------------------------
# 四、执行调用
# --------------------------------------------------------------
user_input = {
    "messages": [
        {
            "role": "user",
            "content": (
                "请帮我提取这段文本的联系人信息："
                "张三是我们公司的技术总监，他的邮箱是 zhangsan@example.com，"
                "电话是 138-0000-0001，在科技公司工作。"
            ),
        }
    ]
}

result = agent_contact.invoke(user_input, config={"recursion_limit": 10})

# --------------------------------------------------------------
# 五、解析输出
# --------------------------------------------------------------
# 👇 获取最后一条模型输出消息
final_message = result["messages"][-1].content

print("\n🧾 原始输出：")
print(final_message)

# 尝试解析为 JSON
try:
    structured = json.loads(final_message)
    contact = ContactInfo(**structured)
    print("\n✅ 提取结果（结构化）：")
    print(f"  姓名：{contact.name}")
    print(f"  邮箱：{contact.email}")
    print(f"  电话：{contact.phone}")
    print(f"  公司：{contact.company}")
    print(f"  是否完成：{contact.completed}")
except Exception:
    print("\n⚠️ 模型输出不是标准 JSON，请检查：")
    print(final_message)
```

**运行结果示例**：
```
🧾 原始输出：
{"name":"张三","email":"zhangsan@example.com","phone":"138-0000-0001","company":"科技公司","completed":false}

✅ 提取结果（结构化）：
  姓名：张三
  邮箱：zhangsan@example.com
  电话：138-0000-0001
  公司：科技公司
  是否完成：False

```

**关键点说明**：
1. **结构化输出的优势**：
   - 返回的数据格式固定，便于后续处理
   - 可以直接用于数据库存储或 API 响应
   - 类型安全，避免解析错误

2. **两种策略对比**：
   - `ToolStrategy`：使用"虚拟工具"实现，兼容所有支持工具调用的模型
   - `ProviderStrategy`：使用模型原生的结构化输出能力，更可靠但仅支持特定模型（如 OpenAI）

3. **实际应用场景**：
   - 信息提取（联系人、订单、产品信息）
   - 数据分类（情感分析、主题分类）
   - 任务规划（需求分析、时间估算）

## Agent vs 普通 Graph

| 特性 | 普通 Graph | Agent |
|------|-----------|-------|
| 执行流程 | 预定义的固定路径 | 动态决策，自主选择工具 |
| 适用场景 | 确定性流程（如工作流） | 不确定性任务（如研究、分析） |
| 复杂度 | 简单，易于调试 | 复杂，需要监控和优化 |
| 灵活性 | 低，需要修改代码改变流程 | 高，Agent 自主规划路径 |

**何时使用 Agent**：
- ✅ 任务步骤不确定，需要动态规划
- ✅ 需要根据中间结果调整策略
- ✅ 多工具组合使用，顺序不固定
- ❌ 简单的线性流程（用 Chain 更好）
- ❌ 对执行路径有严格要求（用 Graph 更好）

## 📖 与原课程的关系

本书是对 [LangChain Academy](https://academy.langchain.com/courses/intro-to-langgraph) 官方课程的深度解读，结合最新的行业发展和工业案例，进行大幅调整和扩展：
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
