# Cloudflare Pages 部署指南

> **目标**：将 Teamspace 上新小报生成器部署到 Cloudflare Pages，获得公网可访问的链接（无需腾讯内网）

---

## 📋 前置准备

### ✅ 已完成
- [x] GitHub 仓库已创建：`https://github.com/banbannnab/teamspace-poster`
- [x] 代码已推送至 `main` 分支
- [x] `dist-edgeone/` 目录包含部署文件（`index.html` + `_routes.json`）

### 🔧 需要准备
- [ ] Cloudflare 账号（免费注册：https://dash.cloudflare.com/sign-up）
- [ ] GitHub 账号已登录（banbannnab）
- [ ] （可选）自定义域名 `poster.banbannn.top` 的 DNS 管理权限

---

## 🚀 部署步骤（预计 5 分钟）

### Step 1: 登录 Cloudflare

1. 访问 https://dash.cloudflare.com
2. 注册/登录 Cloudflare 账号
3. 进入主控制台

**参考截图**：
```
[Cloudflare 登录页面]
→ 点击 "Sign up" 或 "Log in"
→ 使用邮箱注册（推荐用 GitHub 关联账号）
```

---

### Step 2: 进入 Pages 服务

1. 在左侧菜单找到 **"Workers & Pages"**
2. 点击顶部 **"Pages"** 标签页
3. 点击 **"Create a project"** 按钮

**参考截图**：
```
Cloudflare 控制台
├─ Overview
├─ Analytics
├─ Websites
├─ Workers & Pages  ← 点这里
│   ├─ Overview
│   ├─ Workers
│   └─ Pages  ← 点这里
└─ ...
```

---

### Step 3: 连接 GitHub 仓库

1. 选择 **"Connect to Git"**
2. 授权 Cloudflare 访问 GitHub（首次需要授权）
3. 选择仓库：**banbannnab/teamspace-poster**
4. 点击 **"Begin setup"**

**⚠️ 注意**：
- 如果看不到仓库，检查 GitHub 授权范围（需要 `repo` 权限）
- 如果是私有仓库，确保 Cloudflare App 已安装到该仓库

---

### Step 4: 配置构建设置

在 **"Build settings"** 页面：

| 字段 | 值 |
|------|-----|
| **Project name** | `teamspace-poster`（可自定义） |
| **Production branch** | `main` |
| **Build command** | *（留空，静态站点无需构建）* |
| **Build output directory** | `dist-edgeone`（⚠️ 重要！） |
| **Root directory** | *（留空，使用根目录）* |
| **Environment variables** | *（无需添加）* |

**⚠️ 关键配置说明**：
- **Build output directory** 必须填写 `dist-edgeone`，因为部署文件在这个目录下
- **Build command** 留空（我们是纯静态 HTML，不需要 `npm run build`）

**参考截图**：
```
Build settings
├─ Project name: [teamspace-poster]
├─ Production branch: [main▼]
├─ Custom domains: (暂跳过)
├─ Build command: [                ]  ← 留空
├─ Build output directory: [dist-edgeone]  ← 填这个
└─ Environment variables: (无需)
```

---

### Step 5: 部署

1. 滚动到页面底部
2. 点击 **"Save and Deploy"** 按钮
3. 等待构建（通常 30-60 秒）
4. 看到 ✅ **"Success! Your site is live"** 即部署成功

**部署成功后**：
- 获得默认域名：`https://teamspace-poster.pages.dev`（或类似）
- 可以通过这个域名公网访问（全球 CDN，国内访问速度稍慢但可用）

---

### Step 6: 验证部署

1. 点击部署成功的域名链接
2. 确认页面正常加载
3. 测试核心功能：
   - [ ] 打开页面无 401 错误
   - [ ] 可以输入产品信息
   - [ ] 可以生成海报
   - [ ] 可以下载海报

**⚠️ 如果遇到问题**：
- 页面 404：检查 `Build output directory` 是否填写正确（`dist-edgeone`）
- 页面空白：检查 `dist-edgeone/index.html` 是否存在（可以在 GitHub 仓库确认）
- 样式错乱：检查浏览器控制台是否有资源加载失败

---

## 🌐 绑定自定义域名（可选）

如果你希望使用 `poster.banbannn.top` 作为访问地址：

### Step 1: 在 Cloudflare Pages 添加域名

1. 进入项目控制台（Pages → teamspace-poster）
2. 点击 **"Custom domains"** 标签页
3. 点击 **"Set up a domain"**
4. 输入：`poster.banbannn.top`
5. 点击 **"Continue"**

### Step 2: 配置 DNS（在域名服务商处）

Cloudflare 会提示你添加 **CNAME 记录**：

| 类型 | 名称 | 目标 | TTL |
|------|------|------|-----|
| CNAME | `poster` | `teamspace-poster.pages.dev` | Auto |

**操作步骤**（域名在腾讯云）：
1. 登录腾讯云 DNS 解析控制台
2. 找到 `banbannn.top` 域名
3. 添加记录：
   - 主机记录：`poster`
   - 记录类型：`CNAME`
   - 记录值：`teamspace-poster.pages.dev`（替换为你的实际 Pages 域名）
4. 保存

**⚠️ 注意**：
- DNS 生效需要 5-30 分钟
- Cloudflare 会自动配置 SSL 证书（免费）
- 无需 ICP 备案（Cloudflare 不要求）

---

## 📝 后续更新流程

每次修改代码后，只需：

1. 本地修改文件（例如 `teamspace-poster-v3.html`）
2. 复制到 `dist-edgeone/index.html`
3. 提交并推送到 GitHub：
   ```bash
   git add dist-edgeone/index.html
   git commit -m "feat: 更新公网版"
   git push origin main
   ```
4. Cloudflare Pages 会自动重新部署（无需手动操作）

---

## 🔍 故障排查

### 问题 1：构建失败（Build failed）

**可能原因**：
- `dist-edgeone/` 目录不存在
- `Build output directory` 填写错误

**解决方法**：
1. 检查 GitHub 仓库是否有 `dist-edgeone/index.html`
2. 在 Cloudflare Pages 项目设置中，确认 `Build output directory = dist-edgeone`

---

### 问题 2：页面 404

**可能原因**：
- `index.html` 文件名错误
- 文件路径不对

**解决方法**：
1. 确认 `dist-edgeone/index.html` 存在
2. 检查 Cloudflare 构建日志（Pages → 项目 → Deployments → 查看日志）

---

### 问题 3：国内访问慢

**原因**：
- Cloudflare CDN 在国内节点较少

**解决方法**（可选）：
- 使用默认域名 `xxx.pages.dev`（Cloudflare 自动优化）
- 或考虑国内 CDN 方案（需要 ICP 备案）

---

## ✅ 部署检查清单

完成后确认：

- [ ] Cloudflare Pages 项目已创建
- [ ] 默认域名可访问（全球，含国内）
- [ ] 自定义域名已绑定（可选）
- [ ] SSL 证书已自动配置（https）
- [ ] 本地修改 → Git 推送 → 自动部署流程已验证

---

## 📚 相关文档

- [Cloudflare Pages 官方文档](https://developers.cloudflare.com/pages/)
- [GitHub 仓库](https://github.com/banbannnab/teamspace-poster)
- [EdgeOne 部署指南](./edgeone-pages-deploy.md)（备用方案）

---

**最后更新**：2026-05-21
