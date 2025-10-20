# GitHub OAuth 配置指南

## 概述

本项目使用 GitHub OAuth 进行管理员身份验证。通过智能环境检测，可以在本地开发和生产环境中使用同一个 OAuth App。

## 工作原理

前端代码会自动检测运行环境：
- 如果 hostname 是 `localhost` 或 `127.0.0.1`，使用 `http://localhost:5173` 作为回调地址
- 否则使用 `https://learngraph.online` 作为回调地址

## 配置步骤

### 1. 创建 GitHub OAuth App

访问 https://github.com/settings/developers 创建新的 OAuth App：

- **Application name**: `LangGraph Online` (或任意名称)
- **Homepage URL**: `https://learngraph.online`
- **Authorization callback URLs**: 添加两个地址（GitHub 支持多个回调地址）
  - `http://localhost:5173`
  - `https://learngraph.online`

### 2. 配置环境变量

#### 本地开发 (.env)

```bash
# GitHub OAuth
VITE_GITHUB_CLIENT_ID=your_actual_client_id_here
```

#### 生产环境 (Vercel)

在 Vercel 项目设置中添加环境变量：
- `VITE_GITHUB_CLIENT_ID`: 你的 GitHub OAuth App Client ID

### 3. 后端配置

在 `backend/.env` 中配置：

```bash
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

## 代码实现

```typescript
// 自动检测环境
const isLocalDev = window.location.hostname === 'localhost' ||
                   window.location.hostname === '127.0.0.1'

const REDIRECT_URI = isLocalDev
  ? 'http://localhost:5173'
  : 'https://learngraph.online'
```

## 优势

✅ **单一配置**: 本地和生产使用同一个 OAuth App
✅ **自动切换**: 无需手动修改环境变量
✅ **易于调试**: 本地开发完整支持 GitHub 登录
✅ **安全性**: Client Secret 仅在后端使用

## 故障排查

### 问题：登录后显示 "redirect_uri_mismatch"

**原因**: GitHub OAuth App 中未配置当前环境的回调地址

**解决方案**:
1. 访问 https://github.com/settings/developers
2. 编辑你的 OAuth App
3. 确保 Authorization callback URLs 中包含：
   - `http://localhost:5173` (本地)
   - `https://learngraph.online` (生产)

### 问题：本地登录成功但生产环境失败

**原因**: Vercel 环境变量未配置

**解决方案**:
1. 访问 Vercel 项目设置
2. 添加 `VITE_GITHUB_CLIENT_ID` 环境变量
3. 重新部署

## 安全注意事项

⚠️ **不要将 Client Secret 暴露在前端代码中**
⚠️ **不要提交包含真实 Client ID 的 `.env` 文件到 Git**
⚠️ **定期轮换 Client Secret**
