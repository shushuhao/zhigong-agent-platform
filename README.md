# 智工智能体平台

面向工业智能应用搭建场景的前端平台，聚焦智能体配置、可视化工作流编排、工业知识库管理、插件能力扩展、数据标注与用户权限管理等模块。

## 项目定位

智工智能体平台用于展示工业场景下 AI Agent Studio 的核心产品形态：

- `智能体配置`：角色设定、提示词模板、能力绑定、预览调试
- `工作流编排`：基于可视化节点画布组织 LLM、API、知识库、代码和分支流程
- `工业知识库`：管理设备手册、故障代码表、点检规范等文档内容
- `插件广场`：统一展示设备数据接入、故障解析、工单生成等插件能力
- `数据标注`：支持实体、关系、问答、排序、分类等标注任务页面
- `用户管理`：提供用户列表、角色配置与权限管理页面

当前项目主要呈现前端交互、页面组织、状态管理和服务层抽象。数据层以 mock/localStorage 方式模拟，后续可替换为真实后端接口、RAG 服务、模型服务和工作流执行引擎。

## 技术栈

- `Next.js 15`
- `React 19`
- `TypeScript`
- `Ant Design`
- `Tailwind CSS`
- `Zustand`
- `React Flow`
- `Dagre`
- `SSE` 流式响应

## 核心模块

### 智能体管理

- 智能体列表与详情
- 智能体编辑器
- 提示词模板配置
- 流式预览与调试日志

### 工作流编排

- 节点拖拽与连线
- 开始、结束、LLM、API、代码、分支、知识库、MCP 等节点类型
- 节点属性配置
- 运行面板与执行日志展示

### 工业知识库

- 知识库列表与创建
- 文档内容、目录树和分段展示
- 命中测试
- 工业设备手册、故障代码表和点检规范示例数据

### 插件广场

- 设备数据采集器
- 故障代码解析器
- 产线数据洞察
- 工业知识检索
- 维修工单生成器
- 模型接入 MCP

### 数据标注

- 标注任务列表
- 实体关系标注
- 问答标注
- 排序标注
- 分类标注

## 本地运行

建议使用 Node.js 20 LTS。

```bash
pnpm install
pnpm dev
```

或使用 npm：

```bash
npm install
npm run dev
```

启动后访问：

```bash
http://localhost:3000
```

## 生产构建

```bash
npm run build
npm run start
```

`start` 命令会监听 `0.0.0.0`，适合 Zeabur、Docker 或普通 Node 服务器部署。

## Zeabur 部署建议

推荐配置：

```text
Node.js: 20.x
Install Command: npm install
Build Command: npm run build
Start Command: npm run start
```

如果使用 pnpm，也可以配置为：

```text
Install Command: pnpm install
Build Command: pnpm build
Start Command: pnpm start
```

建议选择香港、日本或新加坡等亚洲区域，并在展示前提前访问一次进行预热。

## 普通服务器部署建议

```bash
npm install
npm run build
npm run start
```

生产环境建议使用 `pm2` 托管进程：

```bash
npm install -g pm2
pm2 start npm --name zhigong-agent-platform -- run start
pm2 save
```

如需通过 Nginx 反向代理，可转发到 Next.js 默认的 `3000` 端口。涉及 SSE 流式预览的接口建议关闭代理缓冲。

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 3600s;
    }
}
```

## 说明

当前版本用于展示工业智能体平台的前端产品形态。项目中部分数据为 mock 数据，适合用于产品原型、前端工程展示和后续接口对接前的交互验证。
