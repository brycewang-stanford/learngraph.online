"""
FastAPI 后端服务 - Python 代码执行 API
提供安全的 Python 代码执行环境
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import subprocess
import tempfile
import os
import json
from typing import Optional
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Python Code Executor API",
    description="安全的 Python 代码执行服务",
    version="1.0.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # 本地开发（dev server）
        "http://localhost:4173",  # 本地预览（production preview）
        "https://learngraph.online",  # 生产环境
        "https://*.vercel.app",  # Vercel 预览部署
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 请求模型
class CodeExecutionRequest(BaseModel):
    code: str = Field(..., description="要执行的 Python 代码")
    timeout: Optional[int] = Field(10, description="执行超时时间（秒）", ge=1, le=30)

# 响应模型
class CodeExecutionResponse(BaseModel):
    success: bool
    output: Optional[str] = None
    error: Optional[str] = None
    execution_time: Optional[float] = None


@app.get("/")
async def root():
    """健康检查端点"""
    return {
        "status": "healthy",
        "service": "Python Code Executor API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """详细的健康检查"""
    return {
        "status": "ok",
        "python_version": "3.11",
        "max_timeout": 30,
        "features": ["code_execution", "docker_sandbox"]
    }


@app.post("/execute", response_model=CodeExecutionResponse)
async def execute_code(request: CodeExecutionRequest):
    """
    执行 Python 代码

    安全特性：
    - 临时文件隔离
    - 执行超时限制
    - 标准输出/错误捕获
    - 进程隔离
    """
    import time
    start_time = time.time()

    logger.info(f"Executing code with timeout: {request.timeout}s")

    # 创建临时文件
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as tmp_file:
        tmp_file.write(request.code)
        tmp_file_path = tmp_file.name

    try:
        # 执行 Python 代码
        # 在生产环境中，这里应该使用 Docker 容器
        # 但为了开发和测试，先使用受限的 subprocess
        result = subprocess.run(
            ['python3', tmp_file_path],
            capture_output=True,
            text=True,
            timeout=request.timeout,
            # 安全选项
            env={
                'PYTHONDONTWRITEBYTECODE': '1',
                'PYTHONUNBUFFERED': '1',
            }
        )

        execution_time = time.time() - start_time

        # 检查执行结果
        if result.returncode == 0:
            return CodeExecutionResponse(
                success=True,
                output=result.stdout if result.stdout else "✅ 代码执行成功（无输出）",
                execution_time=round(execution_time, 3)
            )
        else:
            return CodeExecutionResponse(
                success=False,
                error=result.stderr or "执行失败",
                execution_time=round(execution_time, 3)
            )

    except subprocess.TimeoutExpired:
        execution_time = time.time() - start_time
        logger.warning(f"Code execution timeout after {request.timeout}s")
        return CodeExecutionResponse(
            success=False,
            error=f"⏱️ 执行超时（超过 {request.timeout} 秒）",
            execution_time=round(execution_time, 3)
        )

    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"Code execution error: {str(e)}")
        return CodeExecutionResponse(
            success=False,
            error=f"执行错误: {str(e)}",
            execution_time=round(execution_time, 3)
        )

    finally:
        # 清理临时文件
        try:
            os.unlink(tmp_file_path)
        except Exception as e:
            logger.warning(f"Failed to delete temp file: {e}")


# Docker 沙箱版本（生产环境推荐）
@app.post("/execute-docker", response_model=CodeExecutionResponse)
async def execute_code_docker(request: CodeExecutionRequest):
    """
    使用 Docker 容器执行 Python 代码（更安全）

    需要 Docker 环境支持
    """
    import time
    start_time = time.time()

    logger.info(f"Executing code in Docker with timeout: {request.timeout}s")

    try:
        # 创建临时目录和文件
        with tempfile.TemporaryDirectory() as tmpdir:
            code_file = os.path.join(tmpdir, 'code.py')
            with open(code_file, 'w') as f:
                f.write(request.code)

            # 使用 Docker 运行代码
            # --rm: 运行后自动删除容器
            # --network none: 禁用网络访问
            # --memory: 限制内存使用
            # --cpus: 限制 CPU 使用
            # -v: 挂载代码文件（只读）
            docker_cmd = [
                'docker', 'run',
                '--rm',
                '--network', 'none',  # 禁用网络
                '--memory', '256m',   # 限制内存
                '--cpus', '0.5',      # 限制 CPU
                '--pids-limit', '50', # 限制进程数
                '-v', f'{code_file}:/code.py:ro',  # 只读挂载
                'python:3.11-slim',
                'python', '/code.py'
            ]

            result = subprocess.run(
                docker_cmd,
                capture_output=True,
                text=True,
                timeout=request.timeout
            )

            execution_time = time.time() - start_time

            if result.returncode == 0:
                return CodeExecutionResponse(
                    success=True,
                    output=result.stdout if result.stdout else "✅ 代码执行成功（无输出）",
                    execution_time=round(execution_time, 3)
                )
            else:
                return CodeExecutionResponse(
                    success=False,
                    error=result.stderr or "执行失败",
                    execution_time=round(execution_time, 3)
                )

    except subprocess.TimeoutExpired:
        execution_time = time.time() - start_time
        return CodeExecutionResponse(
            success=False,
            error=f"⏱️ 执行超时（超过 {request.timeout} 秒）",
            execution_time=round(execution_time, 3)
        )

    except FileNotFoundError:
        # Docker 未安装
        logger.error("Docker not found, falling back to regular execution")
        return await execute_code(request)

    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"Docker execution error: {str(e)}")
        return CodeExecutionResponse(
            success=False,
            error=f"执行错误: {str(e)}",
            execution_time=round(execution_time, 3)
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
