# GitHub OAuth 设置指南

本文档说明如何配置 GitHub OAuth 以启用管理员登录和页面编辑功能。

## 功能说明

- **管理员登录**: 仅限 `brycew6m@gmail.com` 账号登录
- **页面编辑**: 登录后可直接在网站上编辑 Markdown 文件并提交到 GitHub
- **实时更新**: 编辑后自动创建 Git commit 并推送到仓库

## 设置步骤

### 1. 创建 GitHub OAuth App

1. 访问 https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写以下信息：

   **本地开发环境:**
   - Application name: `learngraph.online (Local Dev)`
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:5173`

   **生产环境:**
   - Application name: `learngraph.online (Production)`
   - Homepage URL: `https://learngraph.online`
   - Authorization callback URL: `https://learngraph.online`

4. 点击 "Register application"
5. 记录 **Client ID**
6. 点击 "Generate a new client secret" 并记录 **Client Secret**

### 2. 配置本地环境

#### 前端配置 (`.env`)

```bash
# 编辑 /Users/brycewang/learngraph.online/.env
VITE_API_URL=http://localhost:8000
VITE_GITHUB_CLIENT_ID=你的_Client_ID
VITE_GITHUB_REDIRECT_URI=http://localhost:5173
```

#### 后端配置 (`backend/.env`)

```bash
# 编辑 /Users/brycewang/learngraph.online/backend/.env
GITHUB_CLIENT_ID=你的_Client_ID
GITHUB_CLIENT_SECRET=你的_Client_Secret
ADMIN_EMAIL=brycew6m@gmail.com
```

### 3. 配置生产环境

#### Vercel 环境变量

在 Vercel 项目设置中添加以下环境变量：

```
VITE_API_URL=https://learngraph-online.onrender.com
VITE_GITHUB_CLIENT_ID=生产环境的_Client_ID
VITE_GITHUB_REDIRECT_URI=https://learngraph.online
```

#### Render 环境变量

在 Render 后端服务设置中添加以下环境变量：

```
GITHUB_CLIENT_ID=生产环境的_Client_ID
GITHUB_CLIENT_SECRET=生产环境的_Client_Secret
ADMIN_EMAIL=brycew6m@gmail.com
```

### 4. 启动服务

```bash
# 启动后端
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 启动前端（新终端）
npm run docs:dev
```

### 5. 测试登录流程

1. 访问 http://localhost:5173
2. 点击导航栏的 "管理员登录" 按钮
3. 跳转到 GitHub 授权页面
4. 授权后自动跳回网站，显示登录状态
5. 右下角会出现 "✏️ 编辑页面" 按钮

### 6. 使用页面编辑功能

1. 登录后，点击右下角的 "✏️ 编辑页面" 按钮
2. 在弹出的编辑器中修改 Markdown 内容
3. 输入提交信息（commit message）
4. 点击 "💾 提交到 GitHub"
5. 等待提交完成，页面会自动刷新显示新内容

## 安全说明

- ✅ 只有 `brycew6m@gmail.com` 可以登录（后端验证）
- ✅ 所有 GitHub API 操作需要 token 认证
- ✅ Token 存储在 localStorage，仅限当前浏览器
- ✅ 每次编辑都会创建 Git commit，可追溯所有更改
- ✅ Client Secret 仅存储在服务器端，前端无法访问

## 故障排除

### 问题1: 登录后提示 "非管理员"

- 检查 `backend/.env` 中的 `ADMIN_EMAIL` 是否正确
- 确认 GitHub 账号的主邮箱是否为 `brycew6m@gmail.com`

### 问题2: GitHub 授权失败

- 检查 Client ID 和 Client Secret 是否正确
- 确认 OAuth App 的回调 URL 与当前访问地址一致

### 问题3: 文件更新失败

- 检查 GitHub token 是否有 `repo` 权限
- 确认文件路径格式正确（例如: `docs/index.md`）
- 查看后端日志获取详细错误信息

## API 端点

### 认证相关

- `POST /auth/github` - GitHub OAuth 认证
  - 请求: `{ "code": "授权码" }`
  - 响应: `{ "access_token": "...", "user": {...}, "is_admin": true }`

### 文件操作

- `POST /github/update-file` - 更新文件
  - Headers: `Authorization: Bearer {token}`
  - 请求: `{ "file_path": "...", "content": "...", "commit_message": "..." }`

- `GET /github/file/{file_path}` - 获取文件
  - Headers: `Authorization: Bearer {token}`

## 目录结构

```
learngraph.online/
├── .env                          # 前端环境变量
├── backend/
│   ├── .env                      # 后端环境变量
│   ├── main.py                   # 包含 GitHub API 接口
│   └── ...
├── docs/
│   └── .vitepress/
│       ├── components/
│       │   ├── AdminLogin.vue    # 登录组件
│       │   └── PageEditor.vue    # 页面编辑器
│       ├── utils/
│       │   └── github-api.ts     # GitHub API 工具函数
│       └── theme/
│           └── index.ts          # 主题配置（添加组件）
└── GITHUB_OAUTH_SETUP.md        # 本文档
```

## 注意事项

- 不要将 `.env` 文件提交到 Git
- Client Secret 必须保密，不要分享给他人
- 定期更换 OAuth App 的 Client Secret
- 编辑页面前建议先在本地测试

---

配置完成后，您就可以直接在网站上编辑内容并自动同步到 GitHub 了！🎉
