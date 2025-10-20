# LangGraph Streaming 详细解读

## 📚 概述

本文档详细解读 LangGraph 中的 **Streaming（流式输出）** 技术。Streaming 是构建交互式 AI 应用的核心能力，它允许我们在 Graph 执行过程中实时获取输出，而不是等待整个流程完成。这对于提升用户体验、实现人机交互至关重要。

## 🎯 核心概念

### 什么是 Streaming？

Streaming 是指在程序执行过程中，逐步输出结果的技术：

**传统方式（非流式）：**
```
用户提问 → [等待...] → 完整答案一次性返回
```

**流式方式：**
```
用户提问 → 第一个词 → 第二个词 → ... → 完成
               ↓         ↓           ↓
            实时显示  实时显示    实时显示
```

### 为什么需要 Streaming？

1. **更好的用户体验**
   - 类似 ChatGPT 的打字机效果
   - 让用户知道系统正在工作
   - 减少等待焦虑

2. **实时监控**
   - 观察 Graph 的执行流程
   - 调试每个节点的输出
   - 跟踪状态变化

3. **人机交互基础**
   - 在执行过程中暂停
   - 让用户确认或修改
   - 实现 Human-in-the-loop

---

## 🎭 实战案例：带记忆的聊天机器人

我们将构建一个完整的聊天机器人，演示 LangGraph 的所有 Streaming 模式。

### 系统架构

```
START
  ↓
[conversation] 调用 LLM
  ↓
判断消息数量
  ↓
├─ ≤ 6 条 → END
└─ > 6 条 → [summarize_conversation] → END
              (总结并删除旧消息)
```

**核心功能：**
1. 支持多轮对话
2. 自动总结长对话
3. 支持多种流式输出模式

---

## 🔧 代码实现详解

### 1. 环境配置

```python
import os, getpass

def _set_env(var: str):
    if not os.environ.get(var):
        os.environ[var] = getpass.getpass(f"{var}: ")

_set_env("OPENAI_API_KEY")
```

**说明：** 安全地设置 API 密钥，避免硬编码在代码中。

---

### 2. 定义状态

```python
from langgraph.graph import MessagesState

class State(MessagesState):
    summary: str
```

**LangGraph 知识点：MessagesState**

`MessagesState` 是 LangGraph 内置的状态类，专为聊天应用设计：

```python
class MessagesState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
```

**关键特性：**
- `messages` 字段自动使用 `add_messages` reducer
- 支持智能消息合并和去重
- 处理 `RemoveMessage` 等特殊操作

**我们的扩展：**
```python
class State(MessagesState):
    summary: str  # 添加对话摘要字段
```

---

### 3. 核心节点：call_model

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.runnables import RunnableConfig

model = ChatOpenAI(model="gpt-5-nano", temperature=0)

def call_model(state: State, config: RunnableConfig):
    # 获取摘要（如果存在）
    summary = state.get("summary", "")

    # 如果有摘要，添加到系统消息
    if summary:
        system_message = f"Summary of conversation earlier: {summary}"
        messages = [SystemMessage(content=system_message)] + state["messages"]
    else:
        messages = state["messages"]

    # 调用模型
    response = model.invoke(messages, config)
    return {"messages": response}
```

**Python 知识点：RunnableConfig**

`RunnableConfig` 是 LangChain 的配置对象，用于：
- 传递运行时配置（如 callbacks）
- 启用 Token 流式输出（Python < 3.11）
- 传递元数据

```python
# 为什么需要 config 参数？
# 1. 启用 token-level streaming
# 2. 传递回调函数
# 3. 配置超时、重试等
```

**摘要机制：**
1. 如果存在摘要，将其作为系统消息添加到对话开头
2. 这样 LLM 可以了解之前的对话内容
3. 但不需要处理完整的历史消息（节省 token）

---

### 4. 摘要节点：summarize_conversation

```python
from langchain_core.messages import RemoveMessage

def summarize_conversation(state: State):
    # 获取现有摘要
    summary = state.get("summary", "")

    # 创建摘要提示
    if summary:
        summary_message = (
            f"This is summary of the conversation to date: {summary}\n\n"
            "Extend the summary by taking into account the new messages above:"
        )
    else:
        summary_message = "Create a summary of the conversation above:"

    # 添加提示到消息列表
    messages = state["messages"] + [HumanMessage(content=summary_message)]
    response = model.invoke(messages)

    # 删除除最后 2 条之外的所有消息
    delete_messages = [RemoveMessage(id=m.id) for m in state["messages"][:-2]]

    return {"summary": response.content, "messages": delete_messages}
```

**LangGraph 知识点：RemoveMessage**

`RemoveMessage` 是特殊的消息类型，用于从状态中删除消息：

```python
# 创建删除消息
RemoveMessage(id=message_id)

# add_messages reducer 会自动处理
# 当遇到 RemoveMessage 时，会从状态中删除对应的消息
```

**为什么需要删除消息？**
- 避免消息列表无限增长
- 节省内存和 token 成本
- 保持对话窗口可控

**摘要策略：**
1. 保留最后 2 条消息（最新的交互）
2. 删除其他旧消息
3. 用摘要代替删除的内容

---

### 5. 条件判断：should_continue

```python
from langgraph.graph import END

def should_continue(state: State):
    """决定下一个节点"""
    messages = state["messages"]

    # 如果消息超过 6 条，进行总结
    if len(messages) > 6:
        return "summarize_conversation"

    # 否则结束
    return END
```

**LangGraph 知识点：条件边返回值**

条件函数可以返回：
1. **节点名称**（字符串）：`"summarize_conversation"`
2. **特殊常量**：`END`、`START`
3. **Send 对象**：用于动态并行（下一节课学习）

```python
# 示例
graph.add_conditional_edges(
    "conversation",      # 源节点
    should_continue,     # 条件函数
    {                    # 路由映射
        "summarize_conversation": "summarize_conversation",
        END: END
    }
)

# 简化写法（如果返回值就是节点名）
graph.add_conditional_edges("conversation", should_continue)
```

---

### 6. 构建 Graph

```python
from langgraph.graph import StateGraph, START
from langgraph.checkpoint.memory import MemorySaver

# 创建图
workflow = StateGraph(State)

# 添加节点
workflow.add_node("conversation", call_model)
workflow.add_node(summarize_conversation)

# 添加边
workflow.add_edge(START, "conversation")
workflow.add_conditional_edges("conversation", should_continue)
workflow.add_edge("summarize_conversation", END)

# 编译（带 checkpointer）
memory = MemorySaver()
graph = workflow.compile(checkpointer=memory)
```

**LangGraph 知识点：Checkpointer**

`MemorySaver` 是一个内存中的 checkpointer，用于：
- 保存每个节点执行后的状态
- 支持多轮对话（通过 thread_id）
- 启用 Streaming 和 Interruption 功能

```python
# Checkpointer 的作用
graph = workflow.compile(checkpointer=memory)
#                        ^^^^^^^^^^^^^^^^^^^^
#                        没有这个，无法：
#                        1. 保持对话状态
#                        2. 使用 thread_id
#                        3. 实现 human-in-the-loop
```

---

## 🌊 Streaming 模式详解

LangGraph 支持多种 streaming 模式，每种模式提供不同粒度的输出。

### 模式 1：stream_mode="updates"

**特点：** 只返回节点执行后的**状态更新**

```python
config = {"configurable": {"thread_id": "1"}}

for chunk in graph.stream(
    {"messages": [HumanMessage(content="hi! I'm Lance")]},
    config,
    stream_mode="updates"
):
    print(chunk)
```

**输出：**
```python
{
    'conversation': {
        'messages': AIMessage(
            content='Hi Lance! How can I assist you today?',
            id='run-6d58e31e-...'
        )
    }
}
```

**输出结构：**
```python
{
    '节点名称': {
        '更新的状态字段': 新值
    }
}
```

**适用场景：**
- 只关心状态变化
- 不需要完整状态
- 减少输出数据量

**更优雅的使用方式：**
```python
for chunk in graph.stream(..., stream_mode="updates"):
    chunk['conversation']["messages"].pretty_print()
```

输出：
```
================================== Ai Message ==================================
Hi Lance! How are you doing today?
```

---

### 模式 2：stream_mode="values"

**特点：** 返回节点执行后的**完整状态**

```python
config = {"configurable": {"thread_id": "2"}}
input_message = HumanMessage(content="hi! I'm Lance")

for event in graph.stream(
    {"messages": [input_message]},
    config,
    stream_mode="values"
):
    for m in event['messages']:
        m.pretty_print()
    print("---" * 25)
```

**输出：**
```
================================ Human Message =================================
hi! I'm Lance
---------------------------------------------------------------------------
================================ Human Message =================================
hi! I'm Lance
================================== Ai Message ==================================
Hi Lance! How can I assist you today?
---------------------------------------------------------------------------
```

**关键区别：**

| 特性 | updates | values |
|------|---------|--------|
| 输出内容 | 只有更新的部分 | 完整状态 |
| 输出次数 | 每个节点 1 次 | 每个节点 1 次（包含累积状态） |
| 数据量 | 小 | 大 |
| 用途 | 增量更新 | 状态检查、调试 |

**为什么 values 输出两次？**

1. **第一次**：初始状态（只有用户消息）
2. **第二次**：conversation 节点执行后（用户消息 + AI 回复）

这是 `values` 模式的特点：在每个节点前后都输出完整状态。

---

### 模式 3：astream_events（Token Streaming）⭐

**特点：** 流式输出**聊天模型的 token**（最接近 ChatGPT 的效果）

```python
config = {"configurable": {"thread_id": "3"}}
input_message = HumanMessage(content="Tell me about the 49ers NFL team")

async for event in graph.astream_events(
    {"messages": [input_message]},
    config,
    version="v2"
):
    print(f"Node: {event['metadata'].get('langgraph_node', '')}")
    print(f"Type: {event['event']}")
    print(f"Name: {event['name']}")
```

**Python 知识点：async/await**

```python
async for event in graph.astream_events(...):
    #^^^^                  ^^^^^^^^^^^^
    # 异步循环              异步方法
```

**为什么需要异步？**
- Streaming 是 I/O 密集型操作
- 异步可以在等待时处理其他任务
- LangChain/LangGraph 的 streaming 基于异步

**基本概念：**
```python
# 同步（阻塞）
for item in sync_generator():
    process(item)  # 等待每一项

# 异步（非阻塞）
async for item in async_generator():
    await process(item)  # 等待时可以切换任务
```

**事件类型：**

astream_events 会输出图执行过程中的**所有**事件：

```
Node: . Type: on_chain_start. Name: LangGraph
Node: conversation. Type: on_chain_start. Name: RunnableSequence
Node: conversation. Type: on_prompt_start. Name: ChatPromptTemplate
Node: conversation. Type: on_prompt_end. Name: ChatPromptTemplate
Node: conversation. Type: on_chat_model_start. Name: ChatOpenAI
Node: conversation. Type: on_chat_model_stream. Name: ChatOpenAI  ← 这个！
Node: conversation. Type: on_chat_model_stream. Name: ChatOpenAI  ← 这个！
Node: conversation. Type: on_chat_model_stream. Name: ChatOpenAI  ← 这个！
...
```

**关键事件：`on_chat_model_stream`**

这是我们要找的！它包含 LLM 生成的每个 token。

---

### 过滤 Token 事件

```python
node_to_stream = 'conversation'
config = {"configurable": {"thread_id": "4"}}
input_message = HumanMessage(content="Tell me about the 49ers NFL team")

async for event in graph.astream_events(
    {"messages": [input_message]},
    config,
    version="v2"
):
    # 过滤条件：
    # 1. 事件类型是 on_chat_model_stream
    # 2. 来自我们关心的节点
    if (event["event"] == "on_chat_model_stream" and
        event['metadata'].get('langgraph_node', '') == node_to_stream):
        print(event["data"])
```

**输出结构：**
```python
{
    'chunk': AIMessageChunk(content='The', id='run-...')
}
```

**提取 Token：**
```python
async for event in graph.astream_events(...):
    if event["event"] == "on_chat_model_stream" and ....:
        data = event["data"]
        print(data["chunk"].content, end="|")
```

**输出效果：**
```
The| San| Francisco| |49|ers| are| a| professional| American| football| team|...
```

**实现打字机效果：**
```python
import sys

async for event in graph.astream_events(...):
    if event["event"] == "on_chat_model_stream":
        token = event["data"]["chunk"].content
        print(token, end="", flush=True)
        #                      ^^^^^^^^^^
        #                      立即输出，不缓冲
```

---

## 🌐 使用 LangGraph API 的 Streaming

LangGraph 提供了部署和 API 服务能力，支持通过 HTTP 进行 streaming。

### 启动本地开发服务器

```bash
cd /path/to/studio
langgraph dev
```

**输出：**
```
- 🚀 API: http://127.0.0.1:2024
- 🎨 Studio UI: https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024
- 📚 API Docs: http://127.0.0.1:2024/docs
```

---

### 连接到 API

```python
from langgraph_sdk import get_client

URL = "http://127.0.0.1:2024"
client = get_client(url=URL)

# 查看所有 assistants（图）
assistants = await client.assistants.search()
```

**LangGraph 知识点：Assistants**

在 LangGraph API 中：
- **Assistant** = 一个编译后的 Graph
- 可以部署多个 assistants
- 每个 assistant 有独立的配置

---

### API Streaming：Values 模式

```python
# 创建线程
thread = await client.threads.create()

# 流式执行
input_message = HumanMessage(content="Multiply 2 and 3")
async for event in client.runs.stream(
    thread["thread_id"],
    assistant_id="agent",
    input={"messages": [input_message]},
    stream_mode="values"
):
    print(event)
```

**输出：**
```python
StreamPart(event='metadata', data={'run_id': '1ef6a3d0-...'})
StreamPart(event='values', data={'messages': [...]})
StreamPart(event='values', data={'messages': [..., tool_call_message]})
StreamPart(event='values', data={'messages': [..., tool_result]})
StreamPart(event='values', data={'messages': [..., final_answer]})
```

**StreamPart 结构：**
```python
StreamPart(
    event='...',  # 事件类型
    data={...}    # 状态数据
)
```

**提取消息：**
```python
from langchain_core.messages import convert_to_messages

async for event in client.runs.stream(...):
    messages = event.data.get('messages', None)
    if messages:
        # 转换为 LangChain 消息对象
        converted = convert_to_messages(messages)
        print(converted[-1])  # 最新消息
    print('=' * 25)
```

---

### API Streaming：Messages 模式 ⭐

**这是 API 独有的模式！** 本地 graph.stream() 不支持。

**特点：**
- 专为聊天应用优化
- 自动处理消息增量更新
- 更细粒度的 token streaming

```python
thread = await client.threads.create()
input_message = HumanMessage(content="Multiply 2 and 3")

async for event in client.runs.stream(
    thread["thread_id"],
    assistant_id="agent",
    input={"messages": [input_message]},
    stream_mode="messages"
):
    print(event.event)
```

**输出：**
```
metadata
messages/complete
messages/metadata
messages/partial  ← Token 流
messages/partial
messages/partial
...
messages/complete
```

**事件类型：**

| 事件 | 含义 | 数据 |
|------|------|------|
| `metadata` | 运行元数据 | run_id 等 |
| `messages/complete` | 完整消息 | 完整的消息对象 |
| `messages/partial` | 部分消息 | Token 或部分内容 |
| `messages/metadata` | 消息元数据 | finish_reason 等 |

---

### 处理 Messages 事件

```python
def format_tool_calls(tool_calls):
    """格式化工具调用"""
    if tool_calls:
        formatted_calls = []
        for call in tool_calls:
            formatted_calls.append(
                f"Tool Call ID: {call['id']}, "
                f"Function: {call['name']}, "
                f"Arguments: {call['args']}"
            )
        return "\n".join(formatted_calls)
    return "No tool calls"

async for event in client.runs.stream(..., stream_mode="messages"):
    # 处理元数据
    if event.event == "metadata":
        print(f"Metadata: Run ID - {event.data['run_id']}")
        print("-" * 50)

    # 处理部分消息（Token 流）
    elif event.event == "messages/partial":
        for data_item in event.data:
            # 用户消息
            if "role" in data_item and data_item["role"] == "user":
                print(f"Human: {data_item['content']}")

            # AI 响应
            else:
                tool_calls = data_item.get("tool_calls", [])
                content = data_item.get("content", "")
                response_metadata = data_item.get("response_metadata", {})

                if content:
                    print(f"AI: {content}")

                if tool_calls:
                    print("Tool Calls:")
                    print(format_tool_calls(tool_calls))

                if response_metadata:
                    finish_reason = response_metadata.get("finish_reason", "N/A")
                    print(f"Response Metadata: Finish Reason - {finish_reason}")

        print("-" * 50)
```

**输出效果：**
```
Metadata: Run ID - 1ef6a3da-687f-6253-915a-701de5327165
--------------------------------------------------
Tool Calls:
Tool Call ID: call_IL4M..., Function: multiply, Arguments: {}
--------------------------------------------------
Tool Calls:
Tool Call ID: call_IL4M..., Function: multiply, Arguments: {'a': 2}
--------------------------------------------------
Tool Calls:
Tool Call ID: call_IL4M..., Function: multiply, Arguments: {'a': 2, 'b': 3}
Response Metadata: Finish Reason - tool_calls
--------------------------------------------------
AI: The
--------------------------------------------------
AI: The result
--------------------------------------------------
AI: The result of
--------------------------------------------------
AI: The result of multiplying
--------------------------------------------------
...
AI: The result of multiplying 2 and 3 is 6.
Response Metadata: Finish Reason - stop
--------------------------------------------------
```

**观察要点：**
1. 工具调用的参数是逐步生成的：`{}` → `{'a': 2}` → `{'a': 2, 'b': 3}`
2. AI 回复是逐 token 生成的：`The` → `The result` → ...
3. 可以获取 finish_reason 等元数据

---

## 🎓 核心知识点总结

### LangGraph 特有概念

#### 1. Streaming 模式对比

| 模式 | 输出内容 | 粒度 | 用途 |
|------|---------|------|------|
| `updates` | 状态更新 | 节点级 | 追踪状态变化 |
| `values` | 完整状态 | 节点级 | 调试、状态检查 |
| `astream_events` | 所有事件 | 事件级 | Token streaming |
| `messages` (API) | 消息流 | Token 级 | 聊天应用 |

#### 2. 本地 vs API Streaming

| 特性 | 本地 (graph.stream) | API (client.runs.stream) |
|------|-------------------|------------------------|
| `updates` | ✅ | ✅ |
| `values` | ✅ | ✅ |
| `astream_events` | ✅ | ❌ |
| `messages` | ❌ | ✅ (推荐) |
| 部署需求 | 无 | 需要 LangGraph Server |

#### 3. MessagesState

```python
class MessagesState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
```

**特性：**
- 自动消息合并
- 支持 RemoveMessage
- 去重和排序

#### 4. RemoveMessage

```python
# 创建删除指令
delete_messages = [RemoveMessage(id=m.id) for m in old_messages]

# 返回更新
return {"messages": delete_messages}

# add_messages reducer 会自动处理删除
```

#### 5. Checkpointer

```python
from langgraph.checkpoint.memory import MemorySaver

memory = MemorySaver()
graph = workflow.compile(checkpointer=memory)

# 使用 thread_id 隔离对话
config = {"configurable": {"thread_id": "user123"}}
```

**作用：**
- 保存状态快照
- 支持多轮对话
- 启用 interruption（下一节课）

---

### Python 特有知识点

#### 1. async/await 基础

```python
# 定义异步函数
async def fetch_data():
    return await some_async_operation()

# 调用异步函数
result = await fetch_data()

# 异步循环
async for item in async_generator():
    process(item)
```

**关键概念：**
- `async def`：定义异步函数
- `await`：等待异步操作完成
- `async for`：异步迭代

**为什么需要异步？**
```python
# 同步（阻塞）- 总时间：3秒
result1 = fetch_url1()  # 1秒
result2 = fetch_url2()  # 1秒
result3 = fetch_url3()  # 1秒

# 异步（并发）- 总时间：1秒
results = await asyncio.gather(
    fetch_url1(),
    fetch_url2(),
    fetch_url3()
)
```

#### 2. RunnableConfig

```python
from langchain_core.runnables import RunnableConfig

def my_node(state: State, config: RunnableConfig):
    # 访问配置
    thread_id = config["configurable"]["thread_id"]

    # 传递给 LLM（启用 streaming）
    response = model.invoke(messages, config)

    return {"messages": response}
```

**用途：**
- 传递 callbacks
- 配置 streaming
- 超时和重试设置

#### 3. dict.get() 默认值

```python
summary = state.get("summary", "")
#                              ^^^
#                              默认值（如果 key 不存在）

# 等价于：
if "summary" in state:
    summary = state["summary"]
else:
    summary = ""
```

#### 4. 列表推导式

```python
# 创建删除消息列表
delete_messages = [RemoveMessage(id=m.id) for m in state["messages"][:-2]]
#                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#                  对每个消息创建 RemoveMessage 对象

# 等价于：
delete_messages = []
for m in state["messages"][:-2]:  # 除最后2条外的所有消息
    delete_messages.append(RemoveMessage(id=m.id))
```

#### 5. 切片操作

```python
messages = [m1, m2, m3, m4, m5]

messages[-2:]   # 最后2个：[m4, m5]
messages[:-2]   # 除最后2个：[m1, m2, m3]
messages[:3]    # 前3个：[m1, m2, m3]
messages[1:4]   # 索引1-3：[m2, m3, m4]
```

---

## 💡 最佳实践

### 1. 选择合适的 Streaming 模式

**场景 1：聊天应用**
```python
# ✅ 推荐：messages 模式（如果使用 API）
async for event in client.runs.stream(..., stream_mode="messages")

# ✅ 或：astream_events（本地）
async for event in graph.astream_events(..., version="v2"):
    if event["event"] == "on_chat_model_stream":
        print(event["data"]["chunk"].content, end="")
```

**场景 2：调试和开发**
```python
# ✅ 推荐：values 模式
for event in graph.stream(..., stream_mode="values"):
    print(event)  # 查看完整状态
```

**场景 3：状态监控**
```python
# ✅ 推荐：updates 模式
for chunk in graph.stream(..., stream_mode="updates"):
    for node, update in chunk.items():
        print(f"{node} updated: {update}")
```

---

### 2. Token Streaming 最佳实践

```python
async def stream_response(graph, input_message, node_name="conversation"):
    """优雅的 token streaming 封装"""

    config = {"configurable": {"thread_id": generate_thread_id()}}

    async for event in graph.astream_events(
        {"messages": [input_message]},
        config,
        version="v2"
    ):
        # 过滤目标节点的 token 事件
        if (event["event"] == "on_chat_model_stream" and
            event["metadata"].get("langgraph_node") == node_name):

            token = event["data"]["chunk"].content
            if token:  # 避免空 token
                yield token

# 使用
async for token in stream_response(graph, user_message):
    print(token, end="", flush=True)
```

---

### 3. 错误处理

```python
async def safe_stream(graph, input_data, config):
    """带错误处理的 streaming"""

    try:
        async for event in graph.astream_events(input_data, config, version="v2"):
            if event["event"] == "on_chat_model_stream":
                yield event["data"]["chunk"].content

    except Exception as e:
        print(f"\n[错误] Streaming 中断: {e}")
        # 可以选择返回部分结果或重试
        raise

# 使用
try:
    async for token in safe_stream(graph, input_data, config):
        print(token, end="")
except Exception:
    print("\n[系统] 请稍后重试")
```

---

### 4. 对话历史管理

```python
class ConversationManager:
    """管理对话历史和摘要"""

    def __init__(self, max_messages=6):
        self.max_messages = max_messages

    def should_summarize(self, state: State) -> bool:
        """判断是否需要总结"""
        return len(state["messages"]) > self.max_messages

    def get_messages_to_keep(self, messages, keep_last=2):
        """获取要保留的消息"""
        return messages[-keep_last:]

    def get_messages_to_delete(self, messages, keep_last=2):
        """获取要删除的消息"""
        return [RemoveMessage(id=m.id) for m in messages[:-keep_last]]

# 使用
manager = ConversationManager(max_messages=10)

def should_continue(state: State):
    if manager.should_summarize(state):
        return "summarize_conversation"
    return END
```

---

### 5. 线程管理

```python
import uuid

def create_thread_config(user_id: str, conversation_id: str = None):
    """创建线程配置"""

    # 使用用户 ID + 对话 ID 作为 thread_id
    if conversation_id is None:
        conversation_id = str(uuid.uuid4())

    thread_id = f"{user_id}:{conversation_id}"

    return {
        "configurable": {
            "thread_id": thread_id
        }
    }

# 使用
config = create_thread_config(user_id="alice", conversation_id="chat-001")
for event in graph.stream(input_data, config, stream_mode="updates"):
    ...
```

---

## 🚀 进阶技巧

### 1. 多节点 Token Streaming

如果 Graph 中有多个聊天模型节点，可以分别 stream：

```python
async def stream_all_nodes(graph, input_data, config):
    """Stream 所有节点的 tokens"""

    async for event in graph.astream_events(input_data, config, version="v2"):
        if event["event"] == "on_chat_model_stream":
            node_name = event["metadata"].get("langgraph_node", "unknown")
            token = event["data"]["chunk"].content

            # 根据节点区分输出
            print(f"[{node_name}] {token}", end="", flush=True)
```

---

### 2. 实时进度显示

```python
import sys

async def stream_with_progress(graph, input_data, config):
    """带进度提示的 streaming"""

    current_node = None

    async for event in graph.astream_events(input_data, config, version="v2"):
        # 节点开始
        if event["event"] == "on_chain_start":
            new_node = event["metadata"].get("langgraph_node")
            if new_node and new_node != current_node:
                current_node = new_node
                print(f"\n\n[{current_node}] ", end="", flush=True)

        # Token 输出
        elif event["event"] == "on_chat_model_stream":
            token = event["data"]["chunk"].content
            print(token, end="", flush=True)
```

---

### 3. 条件 Streaming

```python
async def conditional_stream(graph, input_data, config, stream_tokens=True):
    """根据条件决定是否 stream tokens"""

    if stream_tokens:
        # Token-level streaming
        async for event in graph.astream_events(input_data, config, version="v2"):
            if event["event"] == "on_chat_model_stream":
                yield event["data"]["chunk"].content
    else:
        # Node-level streaming
        async for chunk in graph.astream(input_data, config):
            yield chunk
```

---

### 4. 缓存和重放

```python
class StreamCache:
    """缓存 streaming 输出，支持重放"""

    def __init__(self):
        self.cache = []

    async def stream_and_cache(self, graph, input_data, config):
        """Stream 并缓存"""
        self.cache.clear()

        async for event in graph.astream_events(input_data, config, version="v2"):
            if event["event"] == "on_chat_model_stream":
                token = event["data"]["chunk"].content
                self.cache.append(token)
                yield token

    def replay(self, delay=0.05):
        """重放缓存的输出"""
        import time
        for token in self.cache:
            print(token, end="", flush=True)
            time.sleep(delay)

# 使用
cache = StreamCache()
async for token in cache.stream_and_cache(graph, input_data, config):
    print(token, end="")

# 稍后重放
cache.replay(delay=0.1)
```

---

## 📊 Streaming 性能优化

### 1. 减少事件过滤开销

```python
# ❌ 不高效 - 每次都检查多个条件
async for event in graph.astream_events(...):
    if (event["event"] == "on_chat_model_stream" and
        event["metadata"].get("langgraph_node") == "conversation" and
        event["data"] is not None and
        "chunk" in event["data"]):
        ...

# ✅ 高效 - 提前准备条件
target_event = "on_chat_model_stream"
target_node = "conversation"

async for event in graph.astream_events(...):
    if event["event"] == target_event:
        if event["metadata"].get("langgraph_node") == target_node:
            token = event["data"]["chunk"].content
            if token:
                yield token
```

---

### 2. 批量处理 Tokens

```python
async def batch_stream(graph, input_data, config, batch_size=5):
    """批量输出 tokens，减少 I/O"""

    buffer = []

    async for event in graph.astream_events(input_data, config, version="v2"):
        if event["event"] == "on_chat_model_stream":
            token = event["data"]["chunk"].content
            buffer.append(token)

            if len(buffer) >= batch_size:
                yield "".join(buffer)
                buffer.clear()

    # 输出剩余 tokens
    if buffer:
        yield "".join(buffer)

# 使用
async for batch in batch_stream(graph, input_data, config):
    print(batch, end="", flush=True)
```

---

## 🎯 实际应用案例

### 案例 1：聊天机器人 Web 应用

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

@app.post("/chat/stream")
async def chat_stream(message: str, user_id: str):
    """SSE (Server-Sent Events) 流式聊天"""

    async def event_generator():
        config = {"configurable": {"thread_id": user_id}}
        input_msg = HumanMessage(content=message)

        async for event in graph.astream_events(
            {"messages": [input_msg]},
            config,
            version="v2"
        ):
            if event["event"] == "on_chat_model_stream":
                token = event["data"]["chunk"].content
                if token:
                    # SSE 格式
                    yield f"data: {token}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

---

### 案例 2：命令行聊天工具

```python
import asyncio
from rich.console import Console
from rich.markdown import Markdown

console = Console()

async def cli_chat():
    """命令行聊天界面"""

    config = {"configurable": {"thread_id": "cli-session"}}

    while True:
        # 用户输入
        user_input = console.input("\n[bold green]You:[/bold green] ")
        if user_input.lower() in ["exit", "quit"]:
            break

        # AI 响应
        console.print("[bold blue]AI:[/bold blue] ", end="")

        response_text = ""
        async for event in graph.astream_events(
            {"messages": [HumanMessage(content=user_input)]},
            config,
            version="v2"
        ):
            if event["event"] == "on_chat_model_stream":
                token = event["data"]["chunk"].content
                if token:
                    console.print(token, end="", style="blue")
                    response_text += token

        print()  # 换行

# 运行
asyncio.run(cli_chat())
```

---

### 案例 3：多用户并发聊天

```python
import asyncio
from collections import defaultdict

class MultiUserChatManager:
    """管理多用户并发聊天"""

    def __init__(self, graph):
        self.graph = graph
        self.active_streams = defaultdict(int)

    async def stream_for_user(self, user_id: str, message: str):
        """为特定用户 stream 响应"""

        config = {"configurable": {"thread_id": user_id}}
        self.active_streams[user_id] += 1

        try:
            async for event in self.graph.astream_events(
                {"messages": [HumanMessage(content=message)]},
                config,
                version="v2"
            ):
                if event["event"] == "on_chat_model_stream":
                    token = event["data"]["chunk"].content
                    if token:
                        yield {
                            "user_id": user_id,
                            "token": token,
                            "timestamp": event["data"].get("timestamp")
                        }
        finally:
            self.active_streams[user_id] -= 1

    def get_active_users(self):
        """获取活跃用户列表"""
        return [uid for uid, count in self.active_streams.items() if count > 0]

# 使用
manager = MultiUserChatManager(graph)

# 并发处理多个用户
async def handle_multiple_users():
    async with asyncio.TaskGroup() as tg:
        tg.create_task(process_user("alice", "Hello!"))
        tg.create_task(process_user("bob", "Hi there!"))
        tg.create_task(process_user("charlie", "Good morning!"))

async def process_user(user_id, message):
    async for data in manager.stream_for_user(user_id, message):
        print(f"[{data['user_id']}] {data['token']}", end="")
```

---

## 📖 扩展阅读

- [LangGraph Streaming 官方文档](https://langchain-ai.github.io/langgraph/concepts/low_level/#streaming)
- [LangGraph API Streaming 文档](https://langchain-ai.github.io/langgraph/cloud/how-tos/stream-values/)
- [Python Async/Await 教程](https://realpython.com/async-io-python/)
- [Server-Sent Events (SSE) 规范](https://html.spec.whatwg.org/multipage/server-sent-events.html)

---

## 🔍 常见问题

### Q1: 为什么 astream_events 需要 version="v2"？

**答：** `astream_events` 有两个版本：
- **v1**（旧）：事件结构不同，已弃用
- **v2**（新）：标准化的事件结构，推荐使用

```python
# ✅ 正确
async for event in graph.astream_events(..., version="v2")

# ❌ 不推荐
async for event in graph.astream_events(...)  # 默认 v1
```

---

### Q2: stream 和 astream 有什么区别？

| 方法 | 类型 | 返回 | 用法 |
|------|------|------|------|
| `stream()` | 同步 | 生成器 | `for chunk in graph.stream(...)` |
| `astream()` | 异步 | 异步生成器 | `async for chunk in graph.astream(...)` |

**性能差异：**
- 对于单个请求，性能相近
- 对于并发场景，`astream` 更高效

---

### Q3: 如何在 Jupyter Notebook 中使用异步？

Jupyter 内置了事件循环，可以直接使用 `await`：

```python
# Jupyter 中可以直接这样写
async for event in graph.astream_events(...):
    print(event)

# 或
result = await some_async_function()
```

在普通 Python 脚本中，需要：
```python
import asyncio

asyncio.run(main())
```

---

### Q4: 为什么 token streaming 有时会输出空字符串？

LLM 在生成过程中可能产生空 token（如内部推理步骤），需要过滤：

```python
# ✅ 过滤空 token
async for event in graph.astream_events(...):
    if event["event"] == "on_chat_model_stream":
        token = event["data"]["chunk"].content
        if token:  # 检查非空
            print(token, end="")
```

---

### Q5: 如何在 stream 过程中获取完整消息？

**方法 1：累积 tokens**
```python
full_response = ""
async for event in graph.astream_events(...):
    if event["event"] == "on_chat_model_stream":
        token = event["data"]["chunk"].content
        full_response += token
        print(token, end="")

print(f"\n\n完整响应: {full_response}")
```

**方法 2：监听 on_chat_model_end**
```python
async for event in graph.astream_events(...):
    if event["event"] == "on_chat_model_end":
        full_message = event["data"]["output"]
        print(f"完整消息: {full_message.content}")
```

---

### Q6: messages 模式为什么只在 API 中可用？

`messages` 模式是 LangGraph API Server 的特殊优化，专为聊天应用设计：
- 自动处理消息差异
- 更高效的网络传输
- 与前端框架集成更简单

本地 `graph.stream()` 使用 `astream_events` 可以达到类似效果。

---

## 🎉 总结

Streaming 是 LangGraph 的核心能力，掌握它的关键：

1. **理解不同模式**
   - `updates`：状态更新
   - `values`：完整状态
   - `astream_events`：事件流（token streaming）
   - `messages`：API 专属，聊天优化

2. **选择合适的工具**
   - 本地开发：`astream_events`
   - 生产部署：LangGraph API + `messages` 模式

3. **掌握异步编程**
   - `async`/`await`
   - `async for`
   - 异步生成器

4. **最佳实践**
   - 错误处理
   - 性能优化
   - 用户体验（进度提示、批量输出）

通过 Streaming，我们可以构建类似 ChatGPT 的实时交互体验，这是现代 AI 应用的标配！

下一节课，我们将学习 **Interruption（人机交互）**，实现在 Graph 执行过程中暂停、让用户确认或修改的高级功能。
