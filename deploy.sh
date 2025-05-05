#!/bin/bash

# 教学资源管理系统 - 部署脚本
echo "===================================================="
echo "教学资源管理系统 - 部署脚本"
echo "===================================================="
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未检测到Node.js，请先安装Node.js"
    echo "您可以从 https://nodejs.org 下载并安装"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "错误: 未检测到npm，请确保Node.js正确安装"
    exit 1
fi

# 安装依赖
echo "[1/4] 安装项目依赖..."
npm install

# 初始化数据
echo "[2/4] 初始化项目数据..."
node init-data.js

# 构建项目
echo "[3/4] 构建项目..."
npm run build

# 启动项目
echo "[4/4] 启动项目..."
echo "项目将在 http://localhost:3000 运行"
echo "默认管理员账户: admin"
echo ""
echo "按Ctrl+C可以停止服务器"
echo "===================================================="
npm start