@echo off
echo ====================================================
echo 教学资源管理系统 - 部署脚本
echo ====================================================
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 未检测到Node.js，请先安装Node.js
    echo 您可以从 https://nodejs.org 下载并安装
    pause
    exit /b 1
)

REM 检查npm是否安装
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 未检测到npm，请确保Node.js正确安装
    pause
    exit /b 1
)

REM 安装依赖
echo [1/4] 安装项目依赖...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo 安装依赖失败，请检查网络连接或Node.js版本
    pause
    exit /b 1
)

REM 初始化数据
echo [2/4] 初始化项目数据...
node init-data.js
if %ERRORLEVEL% NEQ 0 (
    echo 初始化数据失败
    pause
    exit /b 1
)

REM 构建项目
echo [3/4] 构建项目...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo 构建项目失败
    pause
    exit /b 1
)

REM 启动项目
echo [4/4] 启动项目...
echo 项目将在 http://localhost:3000 运行
echo 默认管理员账户: admin
echo.
echo 按Ctrl+C可以停止服务器
echo ====================================================
call npm start