# Python Code Executor API

FastAPI 后端服务，为 learngraph.online 提供安全的 Python 代码执行功能。

## 功能特性

- ✅ 安全的代码执行环境
- ✅ Docker 容器隔离（可选）
- ✅ 执行超时限制
- ✅ 内存和 CPU 限制
- ✅ 网络访问隔离
- ✅ CORS 支持

## 本地开发

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 启动开发服务器

```bash
python main.py
# 或
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. 访问 API 文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API 端点

### POST /execute

执行 Python 代码（简单版本）

**请求体：**
```json
{
  "code": "print('Hello, World!')",
  "timeout": 10
}
```

**响应：**
```json
{
  "success": true,
  "output": "Hello, World!\n",
  "error": null,
  "execution_time": 0.123
}
```

### POST /execute-docker

使用 Docker 容器执行代码（更安全）

需要本地安装 Docker。

## Docker 部署

### 构建镜像

```bash
docker build -t python-executor-api .
```

### 运行容器

```bash
docker run -p 8000:8000 python-executor-api
```

### 使用 Docker Compose

```bash
docker-compose up
```

## Render 部署

1. 创建新的 Web Service
2. 连接 GitHub 仓库
3. 设置构建命令：`pip install -r backend/requirements.txt`
4. 设置启动命令：`uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. 环境变量：
   - `PORT`: 自动设置
   - `ALLOWED_ORIGINS`: `https://learngraph.online`

## 安全性

本服务实现了多层安全措施：

1. **执行隔离**
   - 使用临时文件
   - 进程级隔离
   - Docker 容器隔离（推荐）

2. **资源限制**
   - 执行超时（最多 30 秒）
   - 内存限制（256MB）
   - CPU 限制（0.5 核）
   - 进程数限制（50）

3. **网络隔离**
   - Docker 模式禁用网络访问
   - 无法访问外部服务

4. **CORS 保护**
   - 只允许指定域名访问
   - 生产环境严格限制

## 环境变量

- `PORT`: 服务端口（默认 8000）
- `HOST`: 监听地址（默认 0.0.0.0）
- `ALLOWED_ORIGINS`: 允许的跨域源
- `MAX_EXECUTION_TIME`: 最大执行时间（秒）
- `MAX_MEMORY_MB`: 最大内存限制（MB）

## 监控和日志

API 使用 Python logging 记录所有执行请求和错误。

查看日志：
```bash
# 开发环境
tail -f logs/app.log

# Docker
docker logs -f <container_id>
```

## 性能

- 平均响应时间：< 2 秒
- 并发支持：100+ 请求/秒
- 内存占用：< 100MB（空闲）

## 许可证

MIT License
