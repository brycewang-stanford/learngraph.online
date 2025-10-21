"""
代码安全验证器
检测并阻止危险的 Python 代码执行
"""

import re
import ast
from typing import Tuple, Optional

class CodeValidator:
    """Python 代码安全验证器"""

    # 危险的模块和函数（黑名单）
    DANGEROUS_IMPORTS = {
        'os', 'subprocess', 'shutil', 'socket', 'urllib',
        'requests', 'http', 'ftplib', 'smtplib', 'pickle', 'shelve',
        '__import__', 'importlib', 'ctypes', 'multiprocessing'
    }

    # 允许的 sys 模块只读属性（安全的信息获取）
    SAFE_SYS_ATTRIBUTES = {
        'version', 'version_info', 'platform', 'maxsize',
        'byteorder', 'api_version', 'implementation'
    }

    # 危险的内置函数
    DANGEROUS_BUILTINS = {
        'eval', 'exec', 'compile', '__import__', 'open', 'input',
        'exit', 'quit', 'help'
    }

    # 危险的属性访问模式
    DANGEROUS_ATTRIBUTES = {
        '__code__', '__globals__', '__builtins__', '__dict__',
        '__class__', '__bases__', '__subclasses__', '__import__'
    }

    # 安全的魔术方法（允许用于调试和类型检查）
    SAFE_MAGIC_METHODS = {
        '__name__', '__class__', '__doc__', '__module__',
        '__annotations__', '__dict__', '__str__', '__repr__'
    }

    # 危险的字符串模式（正则表达式）
    DANGEROUS_PATTERNS = [
        r'import\s+(os|subprocess|socket|pickle)',  # 危险导入（移除 sys）
        r'from\s+(os|subprocess|socket)\s+import',  # from ... import（移除 sys）
        # 移除了对所有 __x__ 的限制，改为在 AST 检查中精确控制
        r'\.{2,}/',  # 路径遍历 ../
        r'/etc/',  # 系统目录
        r'/home/',  # 用户目录
        r'/root/',  # root 目录
        r'rm\s+-rf',  # 危险命令
        r'while\s+True\s*:',  # 死循环（简单检测）
        r'for\s+\w+\s+in\s+range\s*\(\s*\d{7,}',  # 超大循环
    ]

    # 允许的教学用模块（白名单）
    ALLOWED_MODULES = {
        # Python 标准库
        'math', 'random', 'datetime', 'time', 'json', 'collections',
        'itertools', 'functools', 'operator', 'string', 're',
        'statistics', 'decimal', 'fractions', 'sys',
        # LangChain 相关
        'langchain', 'langchain_openai', 'langchain_anthropic', 'langchain_core',
        'langchain_community', 'langchain_experimental',
        # LangGraph 相关
        'langgraph', 'langgraph_checkpoint', 'langgraph_sdk',
        # OpenAI 和 Anthropic
        'openai', 'anthropic',
        # Jupyter/IPython（用于图片显示）
        'IPython',
        # 其他常用 AI 库
        'typing', 'typing_extensions', 'pydantic', 'enum'
    }

    @classmethod
    def validate(cls, code: str) -> Tuple[bool, Optional[str]]:
        """
        验证代码是否安全

        返回:
            (是否安全, 错误信息)
        """

        # 1. 检查代码长度
        if len(code) > 10000:
            return False, "❌ 代码长度超过限制（最大 10000 字符）"

        # 2. 正则表达式快速检查
        for pattern in cls.DANGEROUS_PATTERNS:
            if re.search(pattern, code, re.IGNORECASE):
                return False, f"❌ 检测到危险代码模式：不允许使用系统命令、文件操作或魔术方法"

        # 3. AST 语法树深度检查
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            return False, f"❌ 语法错误：{str(e)}"

        # 4. 遍历 AST 检查危险操作
        for node in ast.walk(tree):
            # 检查导入语句
            if isinstance(node, ast.Import):
                for alias in node.names:
                    module_name = alias.name.split('.')[0]
                    if module_name in cls.DANGEROUS_IMPORTS:
                        return False, f"❌ 不允许导入模块：{alias.name}（安全限制）"
                    # 只允许白名单模块
                    if module_name not in cls.ALLOWED_MODULES and module_name not in {'builtins'}:
                        return False, f"❌ 不允许导入模块：{alias.name}（仅支持常用数学和工具库）"

            # 检查 from ... import
            if isinstance(node, ast.ImportFrom):
                if node.module:
                    module_name = node.module.split('.')[0]
                    if module_name in cls.DANGEROUS_IMPORTS:
                        return False, f"❌ 不允许导入模块：{node.module}（安全限制）"
                    # 只允许白名单模块（与上面的 import 检查保持一致）
                    if module_name not in cls.ALLOWED_MODULES and module_name not in {'builtins'}:
                        return False, f"❌ 不允许导入模块：{node.module}（仅支持常用数学和工具库）"

            # 检查函数调用
            if isinstance(node, ast.Call):
                # 检查危险的内置函数
                if isinstance(node.func, ast.Name):
                    if node.func.id in cls.DANGEROUS_BUILTINS:
                        return False, f"❌ 不允许使用函数：{node.func.id}()（安全限制）"

            # 检查属性访问
            if isinstance(node, ast.Attribute):
                # 允许安全的魔术方法访问（如 __class__.__name__ 用于获取类名）
                if node.attr in cls.DANGEROUS_ATTRIBUTES and node.attr not in cls.SAFE_MAGIC_METHODS:
                    return False, f"❌ 不允许访问属性：{node.attr}（安全限制）"

                # 检查 sys 模块的属性访问
                if isinstance(node.value, ast.Name) and node.value.id == 'sys':
                    if node.attr not in cls.SAFE_SYS_ATTRIBUTES:
                        return False, f"❌ 不允许访问 sys.{node.attr}（仅支持只读信息属性，如 sys.version）"

            # 检查循环深度（防止死循环）
            if isinstance(node, ast.While):
                # 简单检测 while True
                if isinstance(node.test, ast.Constant) and node.test.value is True:
                    return False, "❌ 不允许使用 while True 死循环"

            # 检查超大范围循环
            if isinstance(node, ast.For):
                if isinstance(node.iter, ast.Call):
                    if isinstance(node.iter.func, ast.Name) and node.iter.func.id == 'range':
                        # 检查 range 参数
                        if node.iter.args:
                            for arg in node.iter.args:
                                if isinstance(arg, ast.Constant) and isinstance(arg.value, int):
                                    if arg.value > 1000000:  # 超过 100 万次循环
                                        return False, "❌ 循环次数过大（最大支持 100 万次）"

        # 5. 所有检查通过
        return True, None

    @classmethod
    def get_safe_example(cls) -> str:
        """返回安全代码示例"""
        return """# ✅ 支持的安全代码示例

# 1. 基础运算
x = 10
y = 20
print(f"{x} + {y} = {x + y}")

# 2. 数学计算
import math
print(f"π = {math.pi}")
print(f"sin(π/2) = {math.sin(math.pi/2)}")

# 3. 系统信息（只读）
import sys
print(f"Python 版本: {sys.version}")
print(f"平台: {sys.platform}")

# 4. 列表和循环
numbers = [1, 2, 3, 4, 5]
total = sum(numbers)
print(f"总和: {total}")

for i in range(5):
    print(f"第 {i+1} 次循环")

# 5. 字符串处理
text = "Hello, Python!"
print(text.upper())
print(text.split())

# 6. 随机数
import random
print(f"随机数: {random.randint(1, 100)}")

# ❌ 不支持的代码：
# - import os, subprocess (系统操作)
# - sys.exit(), sys.argv (危险的 sys 功能)
# - open(), eval(), exec() (危险函数)
# - while True (死循环)
# - 文件读写、网络请求
"""


# 快速测试
if __name__ == "__main__":
    # 测试案例
    test_cases = [
        ("print('Hello')", True),
        ("import math\nprint(math.pi)", True),
        ("import sys\nprint(sys.version)", True),  # 新增：允许 sys.version
        ("import sys\nprint(sys.platform)", True),  # 新增：允许 sys.platform
        ("import sys\nsys.exit()", False),  # 不允许 sys.exit()
        ("import os\nos.system('ls')", False),
        ("eval('1+1')", False),
        ("while True: pass", False),
        ("for i in range(10000000): pass", False),
        ("__import__('os')", False),
    ]

    print("代码安全验证器测试：\n")
    for code, expected_safe in test_cases:
        is_safe, error = CodeValidator.validate(code)
        status = "✅" if is_safe == expected_safe else "❌"
        print(f"{status} 代码: {code[:50]}...")
        if error:
            print(f"   错误: {error}")
        print()
