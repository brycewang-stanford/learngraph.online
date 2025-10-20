# Render 后端保活指南

Render 免费套餐会在 15 分钟无活动后自动休眠。本文档提供多种保活方案。

---

## 方案 1：GitHub Actions（推荐，已配置）

### 特点
- ✅ 完全免费
- ✅ 自动执行，无需维护
- ✅ 每 10 分钟自动 Ping 后端
- ✅ 集成在你的 GitHub 仓库中

### 配置步骤

1. **添加 GitHub Secret**：
   - 访问：https://github.com/brycewang-stanford/learngraph.online/settings/secrets/actions
   - 点击 **"New repository secret"**
   - **Name**: `RENDER_BACKEND_URL`
   - **Value**: 你的 Render 后端地址（例如：`https://your-backend.onrender.com`）
   - 点击 **"Add secret"**

2. **验证工作流**：
   - 访问：https://github.com/brycewang-stanford/learngraph.online/actions
   - 查看 **"Keep Render Backend Alive"** 工作流
   - 点击工作流，然后点击 **"Run workflow"** 手动测试

3. **完成**：
   - 工作流会每 10 分钟自动运行
   - 查看运行日志确认是否成功

---

## 方案 2：cron-job.org（备选方案）

### 特点
- ✅ 免费
- ✅ 界面友好
- ✅ 支持邮件通知

### 配置步骤

1. **注册**：https://cron-job.org/en/signup.php

2. **创建 Cronjob**：
   ```
   Title: Keep Render Backend Alive
   URL: https://your-backend.onrender.com/health
   Schedule: */10 * * * *
   HTTP Method: GET
   ```

3. **保存并启用**

---

## 方案 3：UptimeRobot（监控 + 保活）

### 特点
- ✅ 免费（50 个监控）
- ✅ 监控间隔最短 5 分钟
- ✅ 自动邮件/短信通知
- ✅ 提供正常运行时间统计

### 配置步骤

1. **注册**：https://uptimerobot.com/

2. **创建监控**：
   ```
   Monitor Type: HTTP(s)
   Friendly Name: Render Backend
   URL: https://your-backend.onrender.com/health
   Monitoring Interval: 5 minutes
   ```

3. **设置通知**（可选）：
   - 配置邮件通知
   - 后端宕机时自动发送通知

---

## 你的后端端点

你的 FastAPI 后端有两个可用的健康检查端点：

### 1. 根路径
```
GET https://your-backend.onrender.com/
```
返回：
```json
{
  "status": "healthy",
  "service": "Python Code Executor API",
  "version": "1.0.0"
}
```

### 2. 健康检查端点
```
GET https://your-backend.onrender.com/health
```
返回：
```json
{
  "status": "ok",
  "python_version": "3.11",
  "max_timeout": 30,
  "features": ["code_execution", "docker_sandbox"]
}
```

---

## 推荐方案

**优先使用 GitHub Actions**（方案 1）：
- 完全免费且自动化
- 已经为你配置好了工作流文件
- 只需添加一个 GitHub Secret 即可

**备用方案**：
- 如果 GitHub Actions 有问题，使用 UptimeRobot
- UptimeRobot 还提供监控和通知功能

---

## 验证

提交并推送代码后，检查 GitHub Actions：
```bash
git add .github/workflows/keep-render-alive.yml
git commit -m "添加：GitHub Actions 自动保活 Render 后端"
git push
```

然后访问：
https://github.com/brycewang-stanford/learngraph.online/actions

查看工作流运行情况。

---

## 注意事项

1. **Render 免费套餐限制**：
   - 每月 750 小时免费运行时间
   - 使用保活后，后端会持续运行
   - 确保在免费额度内

2. **GitHub Actions 限制**：
   - 免费账户每月 2000 分钟
   - 每 10 分钟运行一次，每月约消耗 72 分钟（远低于限制）

3. **调整频率**：
   - Render 15 分钟无活动会休眠
   - 建议每 10 分钟 Ping 一次（已配置）
   - 如需调整，修改 `cron: '*/10 * * * *'`

---

**问题反馈**：如有任何问题，请检查 GitHub Actions 运行日志。
