# Render 后端保活指南

Render 免费套餐会在 15 分钟无活动后自动休眠。本项目使用 **cron-job.org** 保活。

---

## ✅ 当前方案：cron-job.org

### 配置信息

```
服务: cron-job.org
URL: https://learngraph-online.onrender.com/
执行频率: 每 10 分钟 (*/10 * * * *)
请求方法: GET
失败通知: 已启用
```

### 管理

访问 [cron-job.org](https://cron-job.org/) 查看执行历史和管理任务。

### 特点

- ✅ 完全免费
- ✅ 界面友好，易于配置
- ✅ 每 10 分钟自动 Ping 后端
- ✅ 支持邮件通知和失败重试
- ✅ 防止 Render 后端休眠

---

## 备选方案：UptimeRobot

如果需要更强大的监控功能，可以考虑 UptimeRobot：

### 特点

- ✅ 免费（50 个监控）
- ✅ 监控间隔最短 5 分钟
- ✅ 自动邮件/短信通知
- ✅ 提供正常运行时间统计
- ✅ 可创建公开状态页面

### 配置步骤

1. 注册：https://uptimerobot.com/
2. 创建监控：
   - Monitor Type: HTTP(s)
   - URL: `https://learngraph-online.onrender.com/health`
   - Interval: 5 minutes

---

## 后端健康检查端点

你的 FastAPI 后端提供两个健康检查端点：

### 1. 根路径（当前使用）
```
GET https://learngraph-online.onrender.com/
```
返回：
```json
{
  "status": "healthy",
  "service": "Python Code Executor API",
  "version": "1.0.0"
}
```

### 2. 详细健康检查
```
GET https://learngraph-online.onrender.com/health
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

## 验证保活是否工作

1. 访问 cron-job.org 控制台
2. 查看执行历史
3. 确认每 10 分钟成功执行，返回 200 状态码
4. 检查 Render 后端日志，应该能看到定期的 GET 请求

---

## 注意事项

### Render 免费套餐限制

- 每月 750 小时免费运行时间
- 使用保活后，后端会持续运行
- 计算：30 天 × 24 小时 = 720 小时（在免费额度内）

### 冷启动

- 即使有保活，首次访问仍可能遇到冷启动（如果刚重启）
- 冷启动通常需要 30-60 秒
- 保活确保正常运行时不会休眠

---

**保活机制已启用，后端将保持活跃状态！** 🚀
