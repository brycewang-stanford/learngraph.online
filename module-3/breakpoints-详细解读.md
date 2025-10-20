# LangGraph Breakpoints 详细解读

## 📚 概述

本文档详细解读 LangGraph 中的 **Breakpoints（断点）** 机制。Breakpoints 是实现 **Human-in-the-Loop（人机协同）** 的基础工具，允许我们在 Agent 执行过程中暂停，获取用户确认，并继续执行。这是构建可控、可信 AI 应用的关键技术。

## 🎯 核心概念

### 什么是 Breakpoints？

Breakpoints（断点）是 LangGraph 提供的一种机制，允许你在图的执行过程中**主动暂停**，并在特定节点前**等待人工干预**。

**核心功能：**
1. **暂停执行**：在指定节点前停止图的执行
2. **检查状态**：查看当前图的状态
3. **人工决策**：由人类决定是否继续执行
4. **恢复执行**：批准后，从断点处继续运行

### Human-in-the-Loop 三大应用场景

根据教程介绍，Human-in-the-Loop 有三个主要应用场景：

#### 1. Approval（审批）
- **场景**：Agent 在执行敏感操作前，需要获得人工批准
- **示例**：
  - 调用支付 API 前确认
  - 删除数据前确认
  - 发送邮件前审查内容
  - 执行工具调用前验证

#### 2. Debugging（调试）
- **场景**：回放图的执行过程，定位问题
- **示例**：
  - 检查某个节点的输入输出
  - 分析 Agent 的决策路径
  - 重现错误场景

#### 3. Editing（编辑）
- **场景**：在执行过程中修改状态
- **示例**：
  - 纠正 Agent 的错误判断
  - 调整工具调用参数
  - 修改中间结果

**本教程重点：** 我们将聚焦于 **Approval（审批）** 场景，学习如何使用 Breakpoints 实现工具调用审批。

---

## 🎭 实战案例：带审批的数学助手

我们将构建一个数学计算 Agent，在调用任何工具前，都需要获得用户批准。

### 系统架构图

```
用户输入: "Multiply 2 and 3"
        ↓
   [assistant] 生成工具调用
        ↓
   🛑 BREAKPOINT (interrupt_before=["tools"])
        ↓
   等待用户批准...
        ↓
   用户输入: "yes"
        ↓
   [tools] 执行工具 (multiply)
        ↓
   [assistant] 生成最终答案
        ↓
   输出: "The result is 6"
```

---

## 🔧 代码实现详解

### 1. 定义工具和模型

```python
from langchain_openai import ChatOpenAI

def multiply(a: int, b: int) -> int:
    """Multiply a and b.

    Args:
        a: first int
        b: second int
    """
    return a * b

def add(a: int, b: int) -> int:
    """Adds a and b.

    Args:
        a: first int
        b: second int
    """
    return a + b

def divide(a: int, b: int) -> float:
    """Divide a by b.

    Args:
        a: first int
        b: second int
    """
    return a / b

tools = [add, multiply, divide]
llm = ChatOpenAI(model="gpt-5-nano")
llm_with_tools = llm.bind_tools(tools)
```

**说明：**
- 定义了三个简单的数学工具
- `llm.bind_tools(tools)` 将工具绑定到 LLM，使其能够生成工具调用

**Python 知识点：函数文档字符串（Docstring）**

```python
def multiply(a: int, b: int) -> int:
    """Multiply a and b.  # ← 简短描述

    Args:              # ← 参数说明
        a: first int
        b: second int
    """
    return a * b
```

在 LangChain 中，这个 docstring 会被传递给 LLM，帮助它理解如何使用工具：
- **描述**：告诉 LLM 这个工具的作用
- **参数**：说明每个参数的含义和类型
- **LLM 利用**：LLM 会根据这些信息决定何时调用工具，以及传递什么参数

---

### 2. 定义状态

```python
from langgraph.graph import MessagesState
```

**LangGraph 知识点：MessagesState**

`MessagesState` 是 LangGraph 预定义的状态类，专门用于聊天场景：

```python
class MessagesState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]
```

**关键特性：**
1. **自动消息管理**：使用 `add_messages` reducer，自动处理消息追加
2. **支持多种消息类型**：`HumanMessage`、`AIMessage`、`ToolMessage`、`SystemMessage`
3. **去重和更新**：根据消息 ID 自动去重和更新

**等价的手动定义：**
```python
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages

class MessagesState(TypedDict):
    messages: Annotated[list, add_messages]
```

---

### 3. 定义节点

```python
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

# System message
sys_msg = SystemMessage(content="You are a helpful assistant tasked with performing arithmetic on a set of inputs.")

# Node
def assistant(state: MessagesState):
    return {"messages": [llm_with_tools.invoke([sys_msg] + state["messages"])]}
```

**功能：**
- 接收当前对话历史 (`state["messages"]`)
- 添加系统提示词
- 调用 LLM 生成响应（可能包含工具调用）
- 返回新的 AIMessage

**Python 知识点：列表拼接**

```python
[sys_msg] + state["messages"]
# 相当于：
# [SystemMessage(...), HumanMessage(...), AIMessage(...), ...]
```

这样可以确保系统提示词总是在对话历史的开头。

---

### 4. 构建图（核心：添加 Breakpoint）

```python
from IPython.display import Image, display
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import START, StateGraph
from langgraph.prebuilt import tools_condition, ToolNode

# Graph
builder = StateGraph(MessagesState)

# Define nodes: these do the work
builder.add_node("assistant", assistant)
builder.add_node("tools", ToolNode(tools))

# Define edges: these determine the control flow
builder.add_edge(START, "assistant")
builder.add_conditional_edges(
    "assistant",
    tools_condition,
)
builder.add_edge("tools", "assistant")

memory = MemorySaver()
graph = builder.compile(interrupt_before=["tools"], checkpointer=memory)
```

**关键点分析：**

#### (1) interrupt_before=["tools"]

这是实现 Breakpoint 的核心！

```python
graph = builder.compile(interrupt_before=["tools"], checkpointer=memory)
#                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^
#                      在 "tools" 节点前中断
```

**效果：**
- 当图执行到 `tools` 节点前时，**自动暂停**
- 状态被保存到 checkpoint
- 等待用户调用 `graph.stream(None, ...)` 继续执行

**其他选项：**
```python
# 在节点后中断
interrupt_after=["assistant"]

# 同时使用
interrupt_before=["tools"]
interrupt_after=["assistant"]
```

#### (2) checkpointer=memory

**为什么需要 checkpointer？**

Breakpoints 依赖于状态持久化：
- **暂停时**：将当前状态保存到 checkpoint
- **恢复时**：从 checkpoint 加载状态，继续执行

```python
from langgraph.checkpoint.memory import MemorySaver

memory = MemorySaver()  # 内存存储（开发测试用）
# 生产环境可以使用：
# - PostgresSaver (数据库持久化)
# - RedisSaver (Redis 持久化)
```

#### (3) tools_condition

这是 LangGraph 预定义的条件函数：

```python
from langgraph.prebuilt import tools_condition
```

**功能：**
- 检查最新的 AIMessage 是否包含工具调用
- 如果有工具调用 → 路由到 `tools` 节点
- 如果没有工具调用 → 路由到 `END`

**等价的手动实现：**
```python
def tools_condition(state: MessagesState):
    last_message = state["messages"][-1]
    if isinstance(last_message, AIMessage) and last_message.tool_calls:
        return "tools"
    return END
```

#### (4) ToolNode

这是 LangGraph 预定义的工具执行节点：

```python
from langgraph.prebuilt import ToolNode

tools_node = ToolNode(tools)
```

**功能：**
- 自动执行 AIMessage 中的工具调用
- 返回 ToolMessage 结果
- 支持并行工具调用
- 内置错误处理

---

### 5. 第一次执行：触发 Breakpoint

```python
# Input
initial_input = {"messages": HumanMessage(content="Multiply 2 and 3")}

# Thread
thread = {"configurable": {"thread_id": "1"}}

# Run the graph until the first interruption
for event in graph.stream(initial_input, thread, stream_mode="values"):
    event['messages'][-1].pretty_print()
```

**输出：**
```
================================ Human Message =================================
Multiply 2 and 3

================================== Ai Message ==================================
Tool Calls:
  multiply (call_oFkGpnO8CuwW9A1rk49nqBpY)
 Call ID: call_oFkGpnO8CuwW9A1rk49nqBpY
  Args:
    a: 2
    b: 3
```

**执行流程：**
1. 用户输入 "Multiply 2 and 3"
2. `assistant` 节点生成 AIMessage，包含 `multiply` 工具调用
3. 图准备进入 `tools` 节点
4. **触发 breakpoint**，执行暂停 🛑
5. 返回当前状态（包含工具调用的 AIMessage）

**LangGraph 知识点：Thread 和状态隔离**

```python
thread = {"configurable": {"thread_id": "1"}}
```

**Thread 的作用：**
- 每个 `thread_id` 对应一个独立的对话会话
- 不同 thread 的状态完全隔离
- 支持并发执行多个对话

**示例：**
```python
# Thread 1
thread1 = {"configurable": {"thread_id": "1"}}
graph.stream({"messages": [HumanMessage("Hi")]}, thread1)

# Thread 2（完全独立）
thread2 = {"configurable": {"thread_id": "2"}}
graph.stream({"messages": [HumanMessage("Hello")]}, thread2)
```

---

### 6. 检查状态

```python
state = graph.get_state(thread)
print(state.next)
```

**输出：**
```
('tools',)
```

**LangGraph 知识点：get_state()**

```python
state = graph.get_state(thread)
```

**返回的 state 对象包含：**
- `state.values`：当前状态数据（如 `messages`）
- `state.next`：下一个要执行的节点（如果有 breakpoint）
- `state.tasks`：待执行的任务
- `state.config`：配置信息

**用途：**
- 检查图是否在 breakpoint 处暂停
- 查看当前状态
- 用于调试和监控

---

### 7. 恢复执行：继续从断点执行

```python
for event in graph.stream(None, thread, stream_mode="values"):
    event['messages'][-1].pretty_print()
```

**核心技巧：传入 `None` 作为输入！**

```python
graph.stream(None, thread, stream_mode="values")
#            ^^^^
#            关键：使用 None
```

**为什么使用 `None`？**

- `None` 告诉 LangGraph："不添加新输入，从上次暂停的地方继续"
- 图会从 checkpoint 加载状态
- 从 `state.next` 指定的节点（`tools`）继续执行

**输出：**
```
================================== Ai Message ==================================
Tool Calls:
  multiply (call_oFkGpnO8CuwW9A1rk49nqBpY)
 Call ID: call_oFkGpnO8CuwW9A1rk49nqBpY
  Args:
    a: 2
    b: 3

================================= Tool Message =================================
Name: multiply

6

================================== Ai Message ==================================
The result of multiplying 2 and 3 is 6.
```

**执行流程：**
1. **重新发出当前状态**：首先返回上次暂停时的 AIMessage（包含工具调用）
2. **执行 tools 节点**：调用 `multiply(2, 3)`，返回 `6`
3. **回到 assistant 节点**：生成最终答案
4. **结束**：没有更多工具调用，流程结束

**重要提示：为什么会重新发出 AIMessage？**

LangGraph 的设计哲学：
> "When we invoke the graph with `None`, it will re-emit the current state, which contains the `AIMessage` with tool call."

这样做的好处：
- **完整性**：确保用户看到完整的执行流程
- **透明性**：清楚地看到从哪里恢复的
- **调试友好**：便于理解图的执行状态

---

### 8. 完整的用户审批流程

```python
# Input
initial_input = {"messages": HumanMessage(content="Multiply 2 and 3")}

# Thread
thread = {"configurable": {"thread_id": "2"}}

# Run the graph until the first interruption
for event in graph.stream(initial_input, thread, stream_mode="values"):
    event['messages'][-1].pretty_print()

# Get user feedback
user_approval = input("Do you want to call the tool? (yes/no): ")

# Check approval
if user_approval.lower() == "yes":
    # If approved, continue the graph execution
    for event in graph.stream(None, thread, stream_mode="values"):
        event['messages'][-1].pretty_print()
else:
    print("Operation cancelled by user.")
```

**流程总结：**

```
1. 执行图 → 触发 breakpoint
2. 显示工具调用信息
3. 询问用户批准 → input("yes/no")
4. 如果批准 → stream(None, thread) 继续执行
5. 如果拒绝 → 取消操作
```

**实际输出示例：**
```
================================ Human Message =================================
Multiply 2 and 3

================================== Ai Message ==================================
Tool Calls:
  multiply (call_tpHvTmsHSjSpYnymzdx553SU)
 Call ID: call_tpHvTmsHSjSpYnymzdx553SU
  Args:
    a: 2
    b: 3

Do you want to call the tool? (yes/no): yes

================================== Ai Message ==================================
Tool Calls:
  multiply (call_tpHvTmsHSjSpYnymzdx553SU)
 Call ID: call_tpHvTmsHSjSpYnymzdx553SU
  Args:
    a: 2
    b: 3

================================= Tool Message =================================
Name: multiply

6

================================== Ai Message ==================================
The result of multiplying 2 and 3 is 6.
```

---

## 🌐 使用 LangGraph API 实现 Breakpoints

教程的第二部分介绍了如何在 **LangGraph Studio** 中使用 Breakpoints。

### LangGraph Studio 本地开发服务器

**启动方式：**

在 `/module-3/studio` 目录下运行：

```bash
langgraph dev
```

**输出：**
```
- 🚀 API: http://127.0.0.1:2024
- 🎨 Studio UI: https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024
- 📚 API Docs: http://127.0.0.1:2024/docs
```

**访问：**
在浏览器中打开 `https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024`

---

### 使用 SDK 连接到 API

```python
from langgraph_sdk import get_client

client = get_client(url="http://127.0.0.1:2024")
```

**LangGraph SDK 知识点：**

LangGraph SDK 提供了完整的 API 客户端，用于：
- **创建 threads**：`client.threads.create()`
- **运行图**：`client.runs.stream()`
- **获取状态**：`client.threads.get_state()`
- **更新状态**：`client.threads.update_state()`

---

### API 方式执行带 Breakpoint 的图

```python
initial_input = {"messages": HumanMessage(content="Multiply 2 and 3")}
thread = await client.threads.create()

async for chunk in client.runs.stream(
    thread["thread_id"],
    assistant_id="agent",
    input=initial_input,
    stream_mode="values",
    interrupt_before=["tools"],
):
    print(f"Receiving new event of type: {chunk.event}...")
    messages = chunk.data.get('messages', [])
    if messages:
        print(messages[-1])
    print("-" * 50)
```

**关键点：**

#### (1) interrupt_before 参数

```python
async for chunk in client.runs.stream(
    thread["thread_id"],
    assistant_id="agent",
    input=initial_input,
    stream_mode="values",
    interrupt_before=["tools"],  # ← 动态指定 breakpoint
):
```

**两种方式对比：**

| 方式 | 设置位置 | 灵活性 |
|------|---------|-------|
| **编译时** | `graph.compile(interrupt_before=["tools"])` | 固定，适合始终需要中断的场景 |
| **运行时** | `client.runs.stream(..., interrupt_before=["tools"])` | 灵活，可以根据请求动态决定 |

**最佳实践：**
- **开发/测试**：使用编译时设置
- **生产环境**：使用运行时设置，允许不同用户有不同的中断策略

#### (2) async for 流式输出

```python
async for chunk in client.runs.stream(...):
    print(chunk)
```

**Python 知识点：异步迭代器**

- `async for` 用于异步迭代
- 适合处理流式数据（如 LLM 输出、网络请求）
- 与 `for` 的区别：可以在等待数据时不阻塞其他操作

**同步版本（如果需要）：**
```python
for chunk in client.runs.stream_sync(...):  # 注意是 stream_sync
    print(chunk)
```

---

### API 方式恢复执行

```python
async for chunk in client.runs.stream(
    thread["thread_id"],
    "agent",
    input=None,  # ← 关键：使用 None
    stream_mode="values",
    interrupt_before=["tools"],
):
    print(f"Receiving new event of type: {chunk.event}...")
    messages = chunk.data.get('messages', [])
    if messages:
        print(messages[-1])
    print("-" * 50)
```

**与本地版本完全一致：**
- 使用 `input=None` 从断点恢复
- 图会从上次暂停的地方继续执行

---

## 🎓 核心知识点总结

### LangGraph 特有概念

#### 1. Breakpoints 机制

**编译时设置：**
```python
graph.compile(
    interrupt_before=["node1", "node2"],  # 节点前中断
    interrupt_after=["node3"],            # 节点后中断
    checkpointer=memory                    # 必需：状态持久化
)
```

**运行时设置：**
```python
client.runs.stream(
    thread_id,
    assistant_id,
    input=data,
    interrupt_before=["node1"]  # 动态设置
)
```

#### 2. 恢复执行的技巧

```python
# 关键：使用 None 作为输入
graph.stream(None, thread, stream_mode="values")
```

**原理：**
- 从 checkpoint 加载状态
- 从 `state.next` 指定的节点继续
- 不添加新的输入消息

#### 3. 状态检查

```python
state = graph.get_state(thread)

# 检查是否在 breakpoint 处
if state.next:
    print(f"Paused before: {state.next}")

# 查看当前状态
print(state.values)
```

#### 4. Thread 和会话管理

```python
thread = {"configurable": {"thread_id": "unique-id"}}
```

**最佳实践：**
- 每个用户会话使用唯一的 `thread_id`
- 使用 UUID 或时间戳生成 ID
- 在数据库中关联 `thread_id` 和用户信息

```python
import uuid

# 为每个新会话生成唯一 ID
thread_id = str(uuid.uuid4())
thread = {"configurable": {"thread_id": thread_id}}
```

---

### Python 特有知识点

#### 1. 函数类型注解

```python
def multiply(a: int, b: int) -> int:
    """..."""
    return a * b
```

**类型注解的作用：**
- **IDE 支持**：代码补全、错误检查
- **LangChain 工具**：自动生成工具 schema
- **文档**：清晰的接口定义

#### 2. Docstring 与工具集成

```python
def multiply(a: int, b: int) -> int:
    """Multiply a and b.  # ← LLM 会读取这个描述

    Args:
        a: first int   # ← LLM 会理解参数含义
        b: second int
    """
    return a * b
```

**LangChain 如何使用 Docstring：**
```python
tools = [multiply]
llm_with_tools = llm.bind_tools(tools)

# LangChain 会自动将 docstring 转换为工具描述：
# {
#   "name": "multiply",
#   "description": "Multiply a and b.",
#   "parameters": {
#     "a": {"type": "integer", "description": "first int"},
#     "b": {"type": "integer", "description": "second int"}
#   }
# }
```

#### 3. 列表推导式

```python
[sys_msg] + state["messages"]

# 等价于：
result = [sys_msg]
result.extend(state["messages"])
```

**用途：** 快速构建新列表，保持原列表不变（不可变性）

#### 4. 异步编程基础

```python
# 异步函数定义
async def my_function():
    result = await some_async_operation()
    return result

# 异步迭代
async for item in async_iterator:
    process(item)

# 运行异步代码
import asyncio
asyncio.run(my_function())
```

**何时使用异步：**
- API 请求（如 LangGraph API）
- 数据库操作
- I/O 密集型任务
- 需要并发处理多个任务

---

## 💡 最佳实践

### 1. 何时使用 Breakpoints？

✅ **推荐场景：**

1. **敏感操作审批**
   ```python
   # 支付、删除、发送邮件等操作前
   interrupt_before=["payment_tool", "delete_tool", "email_tool"]
   ```

2. **用户确认**
   ```python
   # 重要决策前让用户确认
   interrupt_before=["book_flight", "submit_order"]
   ```

3. **调试和开发**
   ```python
   # 检查每一步的输出
   interrupt_after=["every", "single", "node"]
   ```

4. **安全控制**
   ```python
   # 防止 Agent 执行危险操作
   interrupt_before=["system_command", "file_operations"]
   ```

❌ **不推荐场景：**

- 高频、低风险操作（会严重影响用户体验）
- 完全自动化的后台任务
- 需要实时响应的场景

### 2. Breakpoint 位置选择

**interrupt_before vs interrupt_after**

| 时机 | 适用场景 | 示例 |
|------|---------|------|
| `interrupt_before` | 在执行前审批 | 工具调用前确认 |
| `interrupt_after` | 查看执行结果 | 检查生成的内容 |

**示例：**

```python
# 场景 1：审批工具调用
interrupt_before=["tools"]  # 在工具执行前中断

# 场景 2：审查生成内容
interrupt_after=["generate_response"]  # 生成后中断，允许编辑

# 场景 3：组合使用
interrupt_before=["risky_operation"]
interrupt_after=["data_processing"]
```

### 3. 用户体验优化

#### 技巧 1：提供清晰的上下文信息

```python
for event in graph.stream(initial_input, thread, stream_mode="values"):
    last_msg = event['messages'][-1]

    if isinstance(last_msg, AIMessage) and last_msg.tool_calls:
        # 显示即将执行的工具
        tool = last_msg.tool_calls[0]
        print(f"Agent wants to call: {tool['name']}")
        print(f"With arguments: {tool['args']}")

        # 询问用户
        approval = input("Approve? (yes/no): ")

        if approval.lower() == "yes":
            # 继续执行
            for event in graph.stream(None, thread, stream_mode="values"):
                event['messages'][-1].pretty_print()
        else:
            print("Operation cancelled.")
```

#### 技巧 2：提供批准选项

```python
def get_user_approval(tool_call):
    print(f"\nAgent wants to: {tool_call['name']}({tool_call['args']})")
    print("Options:")
    print("  1. Approve")
    print("  2. Reject")
    print("  3. Edit parameters")

    choice = input("Choose (1/2/3): ")

    if choice == "1":
        return "approve"
    elif choice == "2":
        return "reject"
    elif choice == "3":
        return "edit"
    else:
        return "reject"  # 默认拒绝
```

#### 技巧 3：超时自动处理

```python
import signal

def timeout_handler(signum, frame):
    raise TimeoutError("User approval timeout")

def get_approval_with_timeout(timeout=30):
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(timeout)  # 30 秒超时

    try:
        approval = input("Approve? (yes/no): ")
        signal.alarm(0)  # 取消超时
        return approval.lower() == "yes"
    except TimeoutError:
        print("\nTimeout! Auto-rejecting...")
        return False
```

### 4. 错误处理

```python
try:
    # 执行图
    for event in graph.stream(initial_input, thread, stream_mode="values"):
        event['messages'][-1].pretty_print()

    # 获取用户批准
    approval = input("Approve? (yes/no): ")

    if approval.lower() == "yes":
        # 继续执行
        for event in graph.stream(None, thread, stream_mode="values"):
            event['messages'][-1].pretty_print()
    else:
        print("Operation cancelled by user.")

except KeyboardInterrupt:
    print("\nInterrupted by user. Cleaning up...")
    # 清理资源

except Exception as e:
    print(f"Error: {e}")
    # 记录错误日志
```

---

## 🚀 进阶技巧

### 1. 条件性 Breakpoint

根据不同条件决定是否中断：

```python
def should_interrupt(state: MessagesState) -> bool:
    """根据状态决定是否需要人工审批"""
    last_msg = state["messages"][-1]

    if isinstance(last_msg, AIMessage) and last_msg.tool_calls:
        tool_name = last_msg.tool_calls[0]['name']

        # 高风险工具需要审批
        high_risk_tools = ["delete", "payment", "send_email"]
        return tool_name in high_risk_tools

    return False

# 在运行时动态决定
if should_interrupt(state):
    # 使用 breakpoint
    graph_with_interrupt = graph.compile(interrupt_before=["tools"], checkpointer=memory)
else:
    # 不使用 breakpoint
    graph_with_interrupt = graph.compile(checkpointer=memory)
```

**注意：** LangGraph 本身不支持动态条件 breakpoint，需要在应用层实现。

### 2. 多级审批

对于关键操作，可以实现多级审批：

```python
# Level 1: 自动检查
def auto_check(state):
    """自动安全检查"""
    if not is_safe(state):
        return "reject"
    return "need_human_approval"

# Level 2: 人工审批
def human_approval(state):
    """人工审批"""
    approval = input("Level 1 passed. Final approval? (yes/no): ")
    return approval.lower() == "yes"

# 在图中实现
builder.add_conditional_edges(
    "auto_check",
    auto_check,
    {
        "reject": END,
        "need_human_approval": "human_approval_node"
    }
)
```

### 3. 审批历史记录

记录所有审批决策：

```python
from datetime import datetime

approval_log = []

def log_approval(tool_call, approved, user_id):
    """记录审批历史"""
    approval_log.append({
        "timestamp": datetime.now().isoformat(),
        "tool": tool_call['name'],
        "args": tool_call['args'],
        "approved": approved,
        "user": user_id
    })

# 使用
approval = input("Approve? (yes/no): ")
approved = approval.lower() == "yes"
log_approval(tool_call, approved, user_id="user123")

# 查看历史
for log in approval_log:
    print(f"{log['timestamp']}: {log['tool']} - {'✓' if log['approved'] else '✗'}")
```

### 4. 与 UI 集成

在 Web 应用中使用 Breakpoints：

```python
# FastAPI 示例
from fastapi import FastAPI, WebSocket

app = FastAPI()

@app.websocket("/ws/{thread_id}")
async def websocket_endpoint(websocket: WebSocket, thread_id: str):
    await websocket.accept()

    # 启动图执行
    thread = {"configurable": {"thread_id": thread_id}}

    for event in graph.stream(initial_input, thread, stream_mode="values"):
        # 发送消息到前端
        await websocket.send_json({
            "type": "message",
            "data": event['messages'][-1]
        })

    # 触发 breakpoint，请求批准
    await websocket.send_json({
        "type": "approval_required",
        "tool": tool_call
    })

    # 等待前端响应
    approval = await websocket.receive_json()

    if approval["approved"]:
        # 继续执行
        for event in graph.stream(None, thread, stream_mode="values"):
            await websocket.send_json({
                "type": "message",
                "data": event['messages'][-1]
            })
```

---

## 🎯 实际应用案例

### 案例 1：智能客服工单系统

**需求：** Agent 可以查询工单、创建工单，但提交工单需要人工确认。

```python
# 工具定义
def query_ticket(ticket_id: str) -> dict:
    """查询工单信息（低风险，无需审批）"""
    return {"ticket_id": ticket_id, "status": "open"}

def create_ticket(title: str, description: str) -> dict:
    """创建工单（高风险，需要审批）"""
    return {"ticket_id": "T123", "title": title}

tools = [query_ticket, create_ticket]

# 只对 create_ticket 设置 breakpoint
# 实现方式：使用自定义节点
def tools_with_approval(state: MessagesState):
    """带审批的工具节点"""
    tool_call = state["messages"][-1].tool_calls[0]

    # 高风险工具需要审批
    if tool_call['name'] == 'create_ticket':
        # 触发 breakpoint 逻辑
        return {"needs_approval": True}
    else:
        # 直接执行
        result = execute_tool(tool_call)
        return {"messages": [ToolMessage(content=result, tool_call_id=tool_call['id'])]}
```

### 案例 2：代码部署助手

**需求：** Agent 可以检查代码、运行测试，但部署到生产环境需要人工批准。

```python
# 构建图
builder = StateGraph(MessagesState)
builder.add_node("assistant", assistant)
builder.add_node("run_tests", run_tests_node)
builder.add_node("deploy", deploy_node)  # 部署节点

# 只在部署前中断
graph = builder.compile(
    interrupt_before=["deploy"],  # 只在部署前需要批准
    checkpointer=memory
)

# 执行
for event in graph.stream({"messages": [HumanMessage("Deploy to production")]}, thread):
    print(event)

# 检查即将部署的版本
state = graph.get_state(thread)
print(f"About to deploy version: {state.values['version']}")

# 获取批准
approval = input("Deploy to production? (yes/no): ")
if approval.lower() == "yes":
    for event in graph.stream(None, thread):
        print(event)
```

### 案例 3：数据分析助手

**需求：** Agent 可以查询数据、生成报告，但删除数据需要人工确认。

```python
def analyze_data(query: str) -> str:
    """分析数据（安全操作）"""
    return "Analysis result..."

def delete_data(table: str, condition: str) -> str:
    """删除数据（危险操作）"""
    return f"Deleted rows from {table}"

# 使用 interrupt_before
graph = builder.compile(
    interrupt_before=["delete_data_node"],
    checkpointer=memory
)

# 执行时
for event in graph.stream(initial_input, thread):
    last_msg = event['messages'][-1]

    if isinstance(last_msg, AIMessage) and last_msg.tool_calls:
        tool = last_msg.tool_calls[0]

        if tool['name'] == 'delete_data':
            # 显示即将删除的数据
            print(f"⚠️  WARNING: About to delete data!")
            print(f"   Table: {tool['args']['table']}")
            print(f"   Condition: {tool['args']['condition']}")

            # 需要输入确认文本
            confirmation = input("Type 'DELETE' to confirm: ")

            if confirmation == "DELETE":
                for event in graph.stream(None, thread):
                    print(event)
            else:
                print("Operation cancelled.")
```

---

## 📊 Breakpoints vs 其他控制机制

### 对比表

| 特性 | Breakpoints | 条件边 | 人工节点 |
|------|------------|--------|---------|
| **暂停执行** | ✅ 自动 | ❌ 不暂停 | ✅ 手动 |
| **继续执行** | `stream(None)` | 自动流转 | 显式调用 |
| **用户交互** | 在图外部 | 在图内部 | 在节点内部 |
| **灵活性** | 高 | 中 | 低 |
| **复杂度** | 低 | 中 | 高 |
| **适用场景** | 工具审批、调试 | 路由决策 | 复杂交互 |

### 使用建议

**使用 Breakpoints：**
```python
# 简单的批准/拒绝场景
graph.compile(interrupt_before=["tools"], checkpointer=memory)
```

**使用条件边：**
```python
# 基于状态的自动路由
def should_continue(state):
    if state["ready"]:
        return "continue"
    return "wait"

builder.add_conditional_edges("check", should_continue, {"continue": "next", "wait": END})
```

**使用人工节点：**
```python
# 需要在图内部处理用户输入
def human_input_node(state):
    user_input = get_user_input()  # 自定义输入逻辑
    return {"user_feedback": user_input}

builder.add_node("human_input", human_input_node)
```

---

## 🔍 常见问题

### Q1: Breakpoint 触发后，可以取消执行吗？

**是的！** 只需不调用 `stream(None)`：

```python
# 触发 breakpoint
for event in graph.stream(initial_input, thread):
    print(event)

# 获取批准
approval = input("Continue? (yes/no): ")

if approval.lower() == "yes":
    # 继续执行
    for event in graph.stream(None, thread):
        print(event)
else:
    # 不调用 stream(None)，执行就停止了
    print("Execution cancelled.")
```

**状态：** 图的状态仍然保存在 checkpoint 中，可以稍后恢复。

### Q2: 可以修改状态后再继续执行吗？

**可以！** 使用 `update_state()`：

```python
# 触发 breakpoint
for event in graph.stream(initial_input, thread):
    print(event)

# 修改状态（例如，修改工具参数）
state = graph.get_state(thread)
modified_messages = state.values["messages"].copy()

# 修改最后一条 AIMessage 的工具调用参数
last_msg = modified_messages[-1]
last_msg.tool_calls[0]['args']['a'] = 10  # 修改参数

# 更新状态
graph.update_state(thread, {"messages": modified_messages})

# 继续执行（使用修改后的状态）
for event in graph.stream(None, thread):
    print(event)
```

**注意：** 这是 **Editing（编辑）** 场景，后续教程会详细讲解。

### Q3: 可以在同一个图中设置多个 Breakpoints 吗？

**可以！**

```python
graph = builder.compile(
    interrupt_before=["tools", "generate_report", "send_email"],
    checkpointer=memory
)
```

**执行流程：**
- 每次遇到这些节点时，都会触发 breakpoint
- 需要多次调用 `stream(None)` 才能完成整个流程

**示例：**
```python
# 第一个 breakpoint（tools 前）
for event in graph.stream(initial_input, thread):
    print(event)

approval1 = input("Approve tool call? (yes/no): ")
if approval1.lower() == "yes":
    # 第二个 breakpoint（generate_report 前）
    for event in graph.stream(None, thread):
        print(event)

    approval2 = input("Approve report generation? (yes/no): ")
    if approval2.lower() == "yes":
        # 继续执行
        for event in graph.stream(None, thread):
            print(event)
```

### Q4: Breakpoint 和 streaming 兼容吗？

**完全兼容！**

```python
# 流式输出 + Breakpoint
for event in graph.stream(initial_input, thread, stream_mode="values"):
    # 实时显示每一步的输出
    event['messages'][-1].pretty_print()

# 触发 breakpoint 后，继续流式输出
for event in graph.stream(None, thread, stream_mode="values"):
    event['messages'][-1].pretty_print()
```

### Q5: 如何在生产环境中使用 Breakpoints？

**推荐架构：**

```
用户请求
   ↓
Web Server (FastAPI/Flask)
   ↓
LangGraph (with breakpoint)
   ↓
触发 breakpoint
   ↓
保存状态到数据库
   ↓
返回审批请求给用户
   ↓
用户批准
   ↓
从数据库加载状态
   ↓
继续执行 (stream with None)
   ↓
返回结果
```

**关键点：**
1. **异步处理**：不要阻塞 Web 请求
2. **持久化**：使用数据库 checkpoint (PostgreSQL, Redis)
3. **通知机制**：通过 WebSocket 或轮询通知用户
4. **超时处理**：设置审批超时自动拒绝

**示例代码：**
```python
from langgraph.checkpoint.postgres import PostgresSaver

# 使用 PostgreSQL 持久化
checkpointer = PostgresSaver(connection_string="postgresql://...")

graph = builder.compile(
    interrupt_before=["tools"],
    checkpointer=checkpointer  # 生产级持久化
)

# 异步执行
@app.post("/execute")
async def execute_graph(request: Request):
    thread_id = str(uuid.uuid4())
    thread = {"configurable": {"thread_id": thread_id}}

    # 后台执行
    asyncio.create_task(run_graph(thread))

    # 立即返回 thread_id
    return {"thread_id": thread_id, "status": "started"}

@app.post("/approve/{thread_id}")
async def approve(thread_id: str):
    thread = {"configurable": {"thread_id": thread_id}}

    # 继续执行
    for event in graph.stream(None, thread):
        # 处理结果
        pass

    return {"status": "completed"}
```

---

## 📖 扩展阅读

- [LangGraph Breakpoints 官方文档](https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/breakpoints/)
- [LangGraph Human-in-the-Loop 指南](https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/)
- [LangGraph Checkpointing](https://langchain-ai.github.io/langgraph/concepts/persistence/)
- [LangGraph Studio 文档](https://langchain-ai.github.io/langgraph/concepts/langgraph_studio/)

---

## 🎉 总结

Breakpoints 是 LangGraph 实现 Human-in-the-Loop 的基础工具：

1. **简单易用**：只需在 `compile()` 时添加 `interrupt_before/after` 参数
2. **灵活控制**：可以在编译时或运行时设置 breakpoint
3. **无缝恢复**：使用 `stream(None)` 轻松恢复执行
4. **状态持久化**：依赖 checkpointer，支持长时间异步审批

**核心技巧：**
- `interrupt_before=["node"]` 在节点前暂停
- `stream(None, thread)` 从断点继续
- `get_state(thread)` 检查暂停状态
- 配合 checkpointer 实现生产级应用

通过 Breakpoints，我们可以构建**可控、可信、安全**的 AI 应用，确保关键操作始终在人类监督下执行！
