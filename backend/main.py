"""
FastAPI 后端服务 - Python 代码执行 API + GitHub 编辑功能
提供安全的 Python 代码执行环境和 GitHub 仓库编辑功能
"""

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import subprocess
import tempfile
import os
import json
import re
from typing import Optional, Dict
import logging
import requests
from github import Github, GithubException
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 导入代码验证器
from code_validator import CodeValidator

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# GitHub 配置
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID_PROD")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET_PROD")
GITHUB_REPO_OWNER = "brycewang-stanford"
GITHUB_REPO_NAME = "learngraph.online"
ADMIN_EMAIL = "brycew6m@gmail.com"

app = FastAPI(
    title="Python Code Executor API + GitHub Editor",
    description="安全的 Python 代码执行服务 + GitHub 仓库编辑功能",
    version="2.0.0"
)

# 配置 CORS - 使用正则表达式支持 Vercel 子域名
def is_allowed_origin(origin: str) -> bool:
    """检查请求来源是否允许"""
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:4173",
        "https://learngraph.online",
        "https://www.learngraph.online",
    ]

    # 检查是否在允许列表中
    if origin in allowed_origins:
        return True

    # 检查是否是 Vercel 部署域名
    vercel_pattern = r"^https://.*\.vercel\.app$"
    if re.match(vercel_pattern, origin):
        return True

    return False

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https://.*\.vercel\.app$",  # 支持所有 Vercel 子域名
    allow_origins=[
        "http://localhost:5173",  # 本地开发（dev server）
        "http://localhost:4173",  # 本地预览（production preview）
        "https://learngraph.online",  # 生产环境
        "https://www.learngraph.online",  # 生产环境 www
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
async def execute_code(
    request: CodeExecutionRequest,
    x_openai_api_key: Optional[str] = Header(None)
):
    """
    执行 Python 代码

    安全特性：
    - 代码安全验证（阻止危险操作）
    - 临时文件隔离
    - 执行超时限制
    - 标准输出/错误捕获
    - 进程隔离
    """
    import time
    start_time = time.time()

    logger.info(f"Executing code with timeout: {request.timeout}s")

    # 1. 代码安全验证
    is_safe, error_message = CodeValidator.validate(request.code)
    if not is_safe:
        logger.warning(f"Unsafe code rejected: {error_message}")
        return CodeExecutionResponse(
            success=False,
            error=error_message,
            execution_time=round(time.time() - start_time, 3)
        )

    # 创建临时文件
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as tmp_file:
        tmp_file.write(request.code)
        tmp_file_path = tmp_file.name

    try:
        # 构建环境变量
        env = {
            'PYTHONDONTWRITEBYTECODE': '1',
            'PYTHONUNBUFFERED': '1',
        }

        # 如果提供了 OpenAI API Key，添加到环境变量
        if x_openai_api_key:
            env['OPENAI_API_KEY'] = x_openai_api_key
            logger.info("OpenAI API Key provided")

        # 执行 Python 代码
        # 使用当前 Python 解释器（sys.executable）确保使用虚拟环境
        import sys
        python_executable = sys.executable

        result = subprocess.run(
            [python_executable, tmp_file_path],
            capture_output=True,
            text=True,
            timeout=request.timeout,
            env=env
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


# ============================================
# GitHub 认证和编辑功能
# ============================================

# GitHub 相关数据模型
class GitHubAuthRequest(BaseModel):
    code: str = Field(..., description="GitHub OAuth 授权码")

class GitHubAuthResponse(BaseModel):
    access_token: str
    user: Dict
    is_admin: bool

class FileUpdateRequest(BaseModel):
    file_path: str = Field(..., description="文件路径（相对于仓库根目录）")
    content: str = Field(..., description="新的文件内容")
    commit_message: str = Field(..., description="提交信息")

class FileUpdateResponse(BaseModel):
    success: bool
    message: str
    commit_sha: Optional[str] = None


# 验证管理员身份
async def verify_admin(authorization: Optional[str] = Header(None)) -> str:
    """验证用户是否为管理员（仅 brycew6m@gmail.com）"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="未授权：缺少访问令牌")

    token = authorization.replace("Bearer ", "")

    try:
        # 使用 token 获取用户信息
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get("https://api.github.com/user", headers=headers)

        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="未授权：无效的访问令牌")

        user_data = response.json()
        user_email = user_data.get("email")

        # 如果公开邮箱为空，尝试获取主邮箱
        if not user_email:
            email_response = requests.get("https://api.github.com/user/emails", headers=headers)
            if email_response.status_code == 200:
                emails = email_response.json()
                primary_email = next((e for e in emails if e.get("primary")), None)
                if primary_email:
                    user_email = primary_email.get("email")

        # 验证是否为管理员邮箱
        if user_email != ADMIN_EMAIL:
            logger.warning(f"Non-admin user attempted access: {user_email}")
            raise HTTPException(status_code=403, detail="禁止访问：仅限管理员")

        logger.info(f"Admin verified: {user_email}")
        return token

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Admin verification error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"验证失败: {str(e)}")


@app.post("/auth/github", response_model=GitHubAuthResponse)
async def github_auth(request: GitHubAuthRequest):
    """
    GitHub OAuth 认证
    使用授权码换取访问令牌
    """
    try:
        # 使用授权码换取访问令牌
        token_url = "https://github.com/login/oauth/access_token"
        token_data = {
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": request.code,
        }
        token_headers = {"Accept": "application/json"}

        token_response = requests.post(token_url, data=token_data, headers=token_headers)
        token_json = token_response.json()

        if "error" in token_json:
            raise HTTPException(status_code=400, detail=f"GitHub 认证失败: {token_json.get('error_description', 'Unknown error')}")

        access_token = token_json.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="未能获取访问令牌")

        # 获取用户信息
        user_headers = {"Authorization": f"Bearer {access_token}"}
        user_response = requests.get("https://api.github.com/user", headers=user_headers)
        user_data = user_response.json()

        user_email = user_data.get("email")

        # 如果公开邮箱为空，获取主邮箱
        if not user_email:
            email_response = requests.get("https://api.github.com/user/emails", headers=user_headers)
            if email_response.status_code == 200:
                emails = email_response.json()
                primary_email = next((e for e in emails if e.get("primary")), None)
                if primary_email:
                    user_email = primary_email.get("email")

        # 检查是否为管理员
        is_admin = user_email == ADMIN_EMAIL

        if not is_admin:
            logger.warning(f"Non-admin login attempt: {user_email}")
            raise HTTPException(status_code=403, detail="仅限管理员登录")

        logger.info(f"Admin logged in: {user_email}")

        return GitHubAuthResponse(
            access_token=access_token,
            user=user_data,
            is_admin=is_admin
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"GitHub auth error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"认证错误: {str(e)}")


@app.post("/github/update-file", response_model=FileUpdateResponse)
async def update_file(
    request: FileUpdateRequest,
    token: str = Depends(verify_admin)
):
    """
    更新 GitHub 仓库中的文件
    仅限管理员使用
    """
    try:
        # 使用 token 创建 GitHub 客户端
        g = Github(token)
        repo = g.get_repo(f"{GITHUB_REPO_OWNER}/{GITHUB_REPO_NAME}")

        # 获取文件
        try:
            file = repo.get_contents(request.file_path)
            # 更新现有文件
            result = repo.update_file(
                path=request.file_path,
                message=request.commit_message,
                content=request.content,
                sha=file.sha,
                branch="main"
            )
            logger.info(f"File updated: {request.file_path}")
        except GithubException as e:
            if e.status == 404:
                # 文件不存在，创建新文件
                result = repo.create_file(
                    path=request.file_path,
                    message=request.commit_message,
                    content=request.content,
                    branch="main"
                )
                logger.info(f"File created: {request.file_path}")
            else:
                raise

        return FileUpdateResponse(
            success=True,
            message="文件更新成功",
            commit_sha=result["commit"].sha
        )

    except GithubException as e:
        logger.error(f"GitHub API error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"GitHub 操作失败: {str(e)}")
    except Exception as e:
        logger.error(f"File update error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"文件更新失败: {str(e)}")


@app.get("/github/file/{file_path:path}")
async def get_file(file_path: str, token: str = Depends(verify_admin)):
    """
    获取 GitHub 仓库中的文件内容
    仅限管理员使用
    """
    try:
        g = Github(token)
        repo = g.get_repo(f"{GITHUB_REPO_OWNER}/{GITHUB_REPO_NAME}")

        file = repo.get_contents(file_path)
        content = file.decoded_content.decode('utf-8')

        return {
            "success": True,
            "content": content,
            "sha": file.sha,
            "path": file.path
        }

    except GithubException as e:
        if e.status == 404:
            raise HTTPException(status_code=404, detail="文件不存在")
        logger.error(f"GitHub API error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"GitHub 操作失败: {str(e)}")
    except Exception as e:
        logger.error(f"File get error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取文件失败: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
