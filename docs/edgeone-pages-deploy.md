# 五分钟 EdgeOne Pages 部署指南

> 把 Teamspace 上新小报生成器部署到腾讯云 EdgeOne Pages，拿到一个**公网可访问的 `xxx.edgeone.app` 链接**，**无需 OA / 不挂 VPN / 不用买域名**。

---

## 写在前面：三件事先确认

| 决策项 | 当前选择 |
|---|---|
| 部署平台 | **EdgeOne Pages**（腾讯云，国内最快，免费子域名） |
| 域名策略 | **使用平台子域名** `xxx.edgeone.app`，不自备 |
| 上线策略 | **双轨并行**：OA 内网版（司内员工） + EdgeOne 公网版（外部、自己家里） |
| 部署路径 | **连接 GitHub 仓库**（推荐，长期可自动同步） |

> 路径①（GitHub 同步）和路径②（本地直传）我都帮你准备好了，本指南以**路径①为主**，附路径②作为备用。

---

## 准备物（已就绪）

| 物料 | 路径 | 大小 |
|---|---|---|
| 部署目录（含 SPA fallback） | `/Users/banbanzhang/WorkBuddy/2026-05-18-task-21/dist-edgeone/` | 4 个文件 |
| 上传包（路径②备用） | `/tmp/teamspace-poster-edgeone.zip` | 18 KB |

`dist-edgeone/` 内容：
```
dist-edgeone/
├── index.html       # 主程序（1294 行，自包含）
├── _routes.json     # SPA fallback 配置
└── README.md        # 项目说明
```

---

## 路径①：连接 GitHub 仓库部署（推荐）

### Step 1 — 注册/登录腾讯云

入口：https://cloud.tencent.com

- 用 **微信扫码** 或 QQ 登录（用你自己的腾讯云账号，**不要用 WXG 内网账号**——目的是要个 "外网身份"）
- 完成实名认证（如果没做过的话；个人认证就行，几分钟出结果）

### Step 2 — 进入 EdgeOne Pages 控制台

入口：https://edgeone.cloud.tencent.com/pages

- 首次进入会让你**开通 EdgeOne 服务**（点确认即可，免费版无任何费用）
- 左侧菜单选 「Pages」 → 顶部右上角 「新建项目」

### Step 3 — 把代码推到 GitHub

> 如果你已经把当前项目放到 GitHub 了，跳过这一步。

在终端里执行：

```bash
cd /Users/banbanzhang/WorkBuddy/2026-05-18-task-21
git init
git add dist-edgeone/ docs/
git commit -m "feat: 公网版 v1.0 — EdgeOne Pages 部署"
git branch -M main

# 在 GitHub 创建新仓库（如名为 teamspace-poster），然后：
git remote add origin git@github.com:你的用户名/teamspace-poster.git
git push -u origin main
```

如果不熟悉 git，可以让我帮你做这一步——告诉我你的 GitHub 用户名 + 想要的仓库名。

### Step 4 — EdgeOne 连接仓库

在新建项目页面：

1. **导入方式**：选 「从 Git 仓库导入」
2. **授权 GitHub**：弹窗会跳转 GitHub 让你授权 EdgeOne 访问
3. **选仓库**：选刚才推的 `teamspace-poster`
4. **分支**：`main`

### Step 5 — 配置构建参数

| 字段 | 填什么 |
|---|---|
| **项目名称** | `teamspace-poster` |
| **生产分支** | `main` |
| **构建命令** | （留空，纯静态无需构建） |
| **输出目录** | `dist-edgeone` |
| **根目录** | （留空，使用仓库根） |

### Step 6 — 部署 + 出公网 URL

1. 点 「保存并部署」
2. 等 30 秒到 1 分钟，状态从 `部署中` 变 `生产中`
3. 顶部显示分配到的链接：`https://teamspace-poster-xxxxxxx.edgeone.app`
4. 点开访问 → 看到熟悉的紫色 Banner 海报 = **成功 ✅**

---

## 路径②：本地直传（最快，但不推荐长期）

如果你不想搞 GitHub，可以直接拖文件夹：

### Step 1-2：同上（注册腾讯云 + 进入 EdgeOne Pages）

### Step 3 — 上传文件夹

新建项目页面：
1. **导入方式**：选 「直接上传」或 「上传文件夹」
2. 拖入 `/Users/banbanzhang/WorkBuddy/2026-05-18-task-21/dist-edgeone/` 整个文件夹
3. 或上传 `/tmp/teamspace-poster-edgeone.zip`

### Step 4 — 部署
和路径①的 Step 6 一样。

> ⚠️ 路径②的限制：**以后每次改代码都要重新上传**。

---

## 部署成功后

### A. 把公网链接回填到几个地方
1. `dist-edgeone/README.md` 顶部 `https://_____.edgeone.app` 替换为真实 URL
2. （可选）告诉团队这个外部链接

### B. 验证清单
- [ ] 用手机 4G 访问（不走 WiFi/VPN）能打开
- [ ] 用司外朋友的电脑能打开
- [ ] 海报输入/预览/导出 PNG 正常
- [ ] 「跳到 CSV 粘贴」按钮工作
- [ ] localStorage 草稿保存正常

### C. 后续如何更新

**路径①（GitHub 同步）**：
```bash
# 改完代码后
git add .
git commit -m "feat: xxx"
git push
# EdgeOne 自动检测到 push，1 分钟内重新部署
```

**路径②（本地直传）**：
- 每次改完都要去控制台重新上传整个 `dist-edgeone/` 文件夹

---

## 常见问题

### Q1：必须备案吗？
**不需要**。`xxx.edgeone.app` 是腾讯云提供的二级域名，免备案。只有你想绑定自己的域名（如 `poster.banbanzhang.com`）时才要备案。

### Q2：免费版会不会被收费？
你这个工具流量极小（每月几十次访问），免费版完全够用。EdgeOne 免费版含：
- 100 GB/月 流量
- 30 万次/月 请求
- 全球 CDN 加速

> ⚠️ 万一未来流量起飞了，会变成 ¥0.5/GB 计费。但你这个场景下基本不可能触及。

### Q3：和 OA 内网版有冲突吗？
**没有**。两个版本完全独立运行：
- OA 版：AnyDev 容器 + Gateway 反代，司内 SSO
- 公网版：EdgeOne CDN，纯静态
- 同一份 V3 代码在两个地方都跑，互不干扰

### Q4：未来想买自己的域名？
- 国内云买（阿里云/腾讯云）→ 需备案 7-20 天
- 海外买（Namesilo/Cloudflare）→ 免备案
- 域名买好后，在 EdgeOne 控制台 → 自定义域名 → 添加，按提示改 DNS 解析（5 分钟生效）

### Q5：源码会泄漏吗？
**会，但无所谓**。前端代码部署后任何人都能在浏览器 「查看源码」 里看到，这是 Web 的本质。你这套海报工具：
- 不含任何司内敏感数据
- 不含任何 API key、token、密码
- 设计上就是可以对外的

所以放心部署。

---

## 我推荐的下一步

1. 路径①：花 10 分钟去 GitHub 注册（如已注册跳过）→ 告诉我用户名 → 我帮你 push 代码 → 你去 EdgeOne 控制台对接
2. 部署成功后把公网 URL 发给我，我帮你把 OA 版与公网版的"双轨"在 PRD 里记一笔
3. 用 1-2 周后再决定要不要买自己的域名

---

## 关键文件锚点

| 用途 | 路径 |
|---|---|
| 部署目录 | `/Users/banbanzhang/WorkBuddy/2026-05-18-task-21/dist-edgeone/` |
| 上传包（备用） | `/tmp/teamspace-poster-edgeone.zip`（18KB） |
| 部署指南（本文件） | `/Users/banbanzhang/WorkBuddy/2026-05-18-task-21/docs/edgeone-pages-deploy.md` |
| 主程序源 | `/Users/banbanzhang/WorkBuddy/2026-05-18-task-21/teamspace-poster-v3.html` |
| OA 版部署目录 | `/Users/banbanzhang/WorkBuddy/2026-05-18-task-21/teamspace-poster-20260518-200007/` |
