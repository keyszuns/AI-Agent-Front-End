# AI Agent 前端界面

这是一个基于React和TypeScript开发的AI代理前端界面，提供文档管理和查询功能，用户可以上传、管理和查询文档。

## 对应的后端
git clone git@github.com:keyszuns/AI-Agent.git

## 技术栈

- **前端框架**: React 19
- **编程语言**: TypeScript
- **构建工具**: Vite (使用rolldown-vite)
- **UI组件库**: MUI (Material-UI) 7
- **样式处理**: Emotion
- **代码质量工具**: ESLint, TypeScript ESLint

## 功能特点

1. **文档管理**
   - 上传多种类型的文档（文本文件、PDF、Word文档等）
   - 查看已上传文档列表
   - 删除不需要的文档

2. **文档查询**
   - 支持向AI提问获取答案
   - 基于上传的文档内容进行查询

3. **用户界面**
   - 响应式设计，适配不同设备
   - 使用Material Design风格，美观易用
   - 提供文件上传进度显示
   - 操作反馈通知系统

## 项目结构

```
├── src/
│   ├── App.tsx          # 应用主组件
│   ├── App.css          # 应用样式
│   ├── index.css        # 全局样式
│   ├── main.tsx         # 应用入口
│   └── assets/          # 静态资源
├── public/              # 静态资源目录
├── package.json         # 项目配置和依赖
├── tsconfig.json        # TypeScript配置
└── vite.config.ts       # Vite配置
```

## 安装指南

确保您已安装Node.js (推荐v16或更高版本)，然后执行以下命令：

```bash
# 安装项目依赖
npm install
```

## 运行指南

### 开发模式

启动本地开发服务器（默认端口：5173）：

```bash
npm run dev
```

服务器启动后，可以在浏览器中访问 `http://localhost:5173` 查看应用。

### 构建生产版本

```bash
npm run build
```

构建后的文件将位于 `dist` 目录，可以部署到任何静态文件服务器。

### 预览生产版本

```bash
npm run preview
```

在部署前可以使用此命令预览生产构建的效果。

### 代码检查

```bash
npm run lint
```

使用ESLint检查代码质量。

## 注意事项

1. **后端服务依赖**
   - 应用默认会尝试连接到本地的后端服务（`http://localhost:8081`）
   - 确保在运行前端应用前，后端服务已经启动

2. **文件上传限制**
   - 单文件最大支持100MB
   - 支持的文件类型：文本文件(.txt)、PDF文件(.pdf)、Word文档(.doc, .docx)

## 开发说明

- 使用TypeScript编写组件和逻辑
- 基于React Hooks管理组件状态和生命周期
- 使用MUI组件库构建用户界面
- 使用Emotion进行样式处理

## License

MIT