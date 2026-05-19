# 一键 push 到 GitHub + 部署 EdgeOne 操作指南（专属 banbannnab）

> **目标**：把当前项目 push 到 `https://github.com/banbannnab/teamspace-poster`，让 EdgeOne Pages 能自动同步。
>
> **耗时**：从这里到拿到公网 URL，约 10-15 分钟。
>
> **状态**：✅ 我已经把 `git remote origin` 配好了，本地 commit 也就绪。你只剩 4 步操作。

---

## ✅ 已经为你做好的部分

- 项目根目录已 `git init`
- 首次 commit 已落地：`b66f606 feat: 公网版 v1.0 — EdgeOne Pages 部署准备`
- 已配置 git remote：
  ```
  origin → https://github.com/banbannnab/teamspace-poster.git
  ```
- `.gitignore` 已屏蔽 OA 部署目录、PRD、内部技术文档、记忆等

你只需要做下面 4 步。

---

## 第 1 步（30 秒）：在 GitHub 上建空仓库

1. 浏览器打开 → https://github.com/new
2. 填：
   - **Repository name**：`teamspace-poster`（**必须是这个**，因为我已按这个配好 remote）
   - **Description**：`Teamspace 上新小报生成器 · 公网静态版`（随意）
   - **Public** ✅
   - ⚠️ **Initialize this repository with** 三个选项**全部不勾**（README / .gitignore / license 都不要勾）
3. 点 「Create repository」

> 💡 创建后页面会显示 Quick setup 命令，**忽略它们**——我们已经做完那些工作了。

---

## 第 2 步（1 分钟）：生成 Personal Access Token

1. 浏览器打开 → https://github.com/settings/tokens
2. 点 「Generate new token」 → 「Generate new token (classic)」
3. 填：
   - **Note**：`teamspace-poster-push`
   - **Expiration**：`30 days`（或更长）
   - **Select scopes**：勾 ✅ **`repo`**（一个就够，其他不用动）
4. 拉到底点 「Generate token」
5. 复制出现的字符串 `ghp_xxxxxxxxxxxxxxxxxxxx`
   - ⚠️ **离开页面就再也看不到了**，先放剪贴板
   - ⚠️ 这是临时凭证，我**不会要你**贴给我

---

## 第 3 步（30 秒）：在终端 push

打开 macOS 终端（Spotlight 搜 「Terminal」），把下面 **2 行**整段复制 → 粘贴 → 回车：

```bash
cd /Users/banbanzhang/WorkBuddy/2026-05-18-task-21
git push -u origin main
```

终端会弹出登录框：
- **Username for 'https://github.com'**：输入 `banbannnab` → 回车
- **Password for 'https://banbannnab@github.com'**：粘贴你刚才那段 `ghp_...` Token → 回车

> 💡 如果**没弹出**密码框（macOS 直接报错或挂起），说明 Keychain 里有过期凭证。运行这条清理一下再重试：
> ```bash
> printf "host=github.com\nprotocol=https\n" | git credential-osxkeychain erase
> ```

成功后终端最后一行显示：
```
branch 'main' set up to track 'origin/main' from origin/main.
```

---

## 第 4 步（验证）：浏览器打开仓库

→ https://github.com/banbannnab/teamspace-poster

应该看到：
- `dist-edgeone/`（含 index.html、_routes.json、README.md）
- `docs/`（edgeone-pages-deploy.md、github-push-quickstart.md）
- `.gitignore`

如果看到这 3 项 = ✅ 推送成功。

---

## 第 5 步（5-10 分钟）：去 EdgeOne 控制台对接

1. 浏览器打开 → https://edgeone.cloud.tencent.com/pages
   - 没腾讯云账号？先在 https://cloud.tencent.com 用微信扫码注册 + 实名认证
2. 进入 EdgeOne Pages 控制台 → 「新建项目」
3. **导入方式**：选 「从 Git 仓库导入」 → 选 GitHub
4. 弹窗授权 EdgeOne 访问 GitHub（首次需要）
5. 选仓库：`banbannnab/teamspace-poster`
6. 配置：
   | 字段 | 填什么 |
   |---|---|
   | **项目名称** | `teamspace-poster` |
   | **生产分支** | `main` |
   | **构建命令** | （留空） |
   | **输出目录** | `dist-edgeone` |
7. 点 「保存并部署」
8. 等 1 分钟 → 状态变 `生产中` → 顶部显示公网 URL：`https://teamspace-poster-xxxxxx.edgeone.app`
9. 点开访问，看到紫色 Banner 海报 = **大功告成 ✅**

---

## 完成后告诉我

把 EdgeOne 给你的公网 URL 发给我，我会：
1. 回填到 `dist-edgeone/README.md` 顶部
2. 在 PRD §16 加一行 v1.3 双轨上线记录
3. 帮你把 OA 版 + 公网版的链接一并整理出来，方便你转发给团队

---

## 万一卡住（速查）

| 现象 | 原因 | 解决 |
|---|---|---|
| `git push` 报 `Repository not found` | 仓库名拼错了 / 还没创建 | 回 GitHub 检查 `banbannnab/teamspace-poster` 这个仓库是否存在 |
| `Authentication failed` | PAT 没填对，或没勾 `repo` 权限 | 回第 2 步重生成 PAT |
| `! [rejected] main -> main (fetch first)` | 创建仓库时勾了 README | 重建空仓库；或运行 `git push -f origin main`（**仅当远程仓库是你刚建的空仓库时才安全**） |
| EdgeOne 对接 GitHub 后看不到仓库 | 授权时没选这个仓库 | https://github.com/settings/installations 找到 EdgeOne，添加 `teamspace-poster` 到允许列表 |
| EdgeOne 部署成功但首页 404 | 输出目录写错 | 应该是 `dist-edgeone`（不带斜杠） |
| 部署成功但看到样式错乱/空白 | CDN 缓存 | 等 1-2 分钟，或控制台手动 「清除缓存」 |

任何报错，**把错误信息或截图发给我**，我帮你诊断。

---

## 命令速查（直接复制版）

```bash
# 推送代码
cd /Users/banbanzhang/WorkBuddy/2026-05-18-task-21
git push -u origin main
# 用户名：banbannnab
# 密码：你的 PAT (ghp_xxx)
```

```bash
# 如果首次密码弹框未出现/挂起，先清 Keychain：
printf "host=github.com\nprotocol=https\n" | git credential-osxkeychain erase
git push -u origin main
```

| 入口 | URL |
|---|---|
| 创建空仓库 | https://github.com/new |
| 生成 PAT | https://github.com/settings/tokens |
| 仓库地址 | https://github.com/banbannnab/teamspace-poster |
| EdgeOne Pages | https://edgeone.cloud.tencent.com/pages |
| 腾讯云注册（如需） | https://cloud.tencent.com |
