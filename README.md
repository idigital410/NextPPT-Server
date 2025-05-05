# NextPPT-Server

这是一个基于[Next.js](https://nextjs.org)开发的PPT资源管理服务端，用于管理和分享教学资料。

## 功能特点

- 教师资源上传与管理
- 分类浏览教学资源
- 用户权限管理
- 响应式设计，支持多种设备

## 安装与使用

### 前提条件

- Node.js 18.0.0 或更高版本
- npm 或 yarn 或 pnpm 或 bun

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/jsz243326623/NextPPT-Server.git
cd NextPPT-Server
```

2. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
# 或
bun install
```

3. 初始化数据

```bash
node init-data.js
```

或者使用提供的部署脚本：

```bash
# Windows用户
deploy.bat

# Linux/Mac用户
./deploy.sh
```

4. 运行开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

5. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
npm run build
npm run start
```

## 项目结构

```
/
├── public/          # 静态资源
│   └── uploads/     # 上传的文件
├── src/
│   ├── app/         # 页面组件
│   ├── components/  # 可复用组件
│   ├── lib/         # 工具函数
│   ├── types/       # TypeScript类型定义
│   └── utils/       # 实用工具
└── data/           # JSON数据文件
    ├── admin.json   # 管理员数据
    ├── categories.json # 分类数据
    ├── materials.json  # 教学资源数据
    └── teachers.json   # 教师数据
```

## 数据初始化

系统使用JSON文件存储数据。初始数据文件位于`data`目录下：

- `admin.json`: 包含默认管理员账户（用户名：admin）
- `categories.json`: 包含默认分类
- `materials.json`: 初始为空数组，用于存储教学资源
- `teachers.json`: 初始为空数组，用于存储教师信息

## 开发指南

### 添加新页面

在`src/app`目录下创建新的页面组件。

### 添加新组件

在`src/components`目录下创建新的可复用组件。

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

在将项目上传到GitHub或其他平台时，请选择适合您的开源协议。