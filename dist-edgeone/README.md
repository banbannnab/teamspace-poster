# Teamspace 上新小报生成器 — EdgeOne Pages 公网版

> WXG HR 秘书知识库内部工具的公网版本。司外/家里/不挂 VPN 也能访问。

## 在线访问

- **公网版（EdgeOne Pages）**：https://teamspace-poster-tqkcq8qk0j.edgeone.cool
  - 司外、家里、手机 4G 都能直接打开，无需 VPN 或 OA 登录
  - ⚠️ 首次部署后如果不带 token 报 401，需在 EdgeOne 控制台把项目设为「公开」
- **司内版（OA 认证）**：https://hrai.prod.hrainative.woa.com/codebuddy-app-detail/teamspace-poster-20260518-200007
  - 适合 WXG 员工司内访问，免登录（SSO 自动透传）

## 这个目录是什么

`dist-edgeone/` 是 EdgeOne Pages 的部署根目录，**纯静态、零依赖**：

- `index.html` — 完整海报生成器单页应用（1294 行）
- `_routes.json` — SPA fallback 配置（404 路径返回 index.html）

## 部署方式

### 路径①：连接 GitHub 仓库（推荐，自动同步）
1. 在 EdgeOne 控制台 → Pages → 新建项目 → 选择 Git 仓库
2. 仓库选当前仓库
3. 部署目录：`dist-edgeone`
4. 构建命令：留空
5. 输出目录：`/`
6. 部署 → 拿到 `xxx.edgeone.app`

### 路径②：本地直传（最快）
1. 把整个 `dist-edgeone/` 目录打成 zip
2. EdgeOne 控制台 → Pages → 新建项目 → 上传文件
3. 部署 → 拿到 `xxx.edgeone.app`

详细图文步骤见 `../docs/edgeone-pages-deploy.md`。

## 数据安全

- 所有内容均在浏览器侧处理，**不上报任何后端**
- localStorage 存草稿，导出 JSON 备份
- 适合公网，不含任何内部敏感数据
