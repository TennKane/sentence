# Remember — 语句摘录

记录打动你的每一句话。树木纸页风格的个人语句摘录管理工具，支持 AI 语义搜索。

---

## 技术栈

### 核心框架

| 技术 | 用途 |
|---|---|
| **Next.js 16** (App Router) | 全栈框架，服务端渲染 + API 路由 |
| **React 19** | UI 框架 |
| **TypeScript 5** (strict) | 类型安全 |
| **Tailwind CSS 4** | 原子化 CSS，`@theme` 自定义设计令牌 |

### 样式与 UI

| 技术 | 用途 |
|---|---|
| **tailwind-merge** + **clsx** | className 合并工具 (`cn()`) |
| **class-variance-authority** (CVA) | 组件变体管理（PaperButton, PaperCard） |
| **lucide-react** | 图标库 |
| **next-themes** | 主题切换 |
| **sonner** | Toast 通知 |
| **Noto Serif SC** + **Ma Shan Zheng** | Google Fonts 中文字体 |

### 表单与校验

| 技术 | 用途 |
|---|---|
| **react-hook-form** | 表单状态管理 |
| **zod** | Schema 校验 |
| **@hookform/resolvers** | 桥接 react-hook-form 与 zod |

### 数据库

| 技术 | 用途 |
|---|---|
| **Drizzle ORM** | 类型安全的 ORM |
| **drizzle-kit** | 数据库迁移工具 |
| **@libsql/client** | libSQL（Turso）客户端 |
| **SQLite** | 本地开发数据库 |
| **Turso** | 生产环境边缘托管数据库 |

### AI 搜索

| 技术 | 用途 |
|---|---|
| **Anthropic Claude API** (Sonnet) | 自然语言语义搜索 |

---

## 功能列表

### 已完成（一期）

- [x] **用户认证** — 邮箱登录（next-auth v5 + bcryptjs），路由保护，暂不开放注册
- [x] **句子管理** — 增删改查完整 CRUD
- [x] **句子列表** — 分页展示、按标签过滤、内容搜索
- [x] **句子表单** — 内容、来源（可选）、标签（可选，逗号分隔），zod 校验
- [x] **语义搜索** — 用自然语言描述查找匹配句子，显示匹配理由
- [x] **树木纸页风格 UI** — 暖色纸张底色、SVG 纹理、木质 accent、手写体标题、引号装饰
- [x] **响应式布局** — 适配移动端和桌面端

### 待后续

- [ ] **数据统计**（recharts 月度/标签统计）
- [ ] **数据导入导出**（JSON / Markdown）
- [ ] **暗色主题优化**
- [ ] **PWA 支持**

---

## 首次使用

注册已关闭，首次部署后需要手动创建管理员账号。

**本地 SQLite：**

```bash
node -e "
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');
const client = createClient({ url: 'file:./data/local.db' });
const hash = bcrypt.hashSync('你的密码', 10);
client.execute({
  sql: 'INSERT INTO users (email, name, password) VALUES (?, ?, ?)',
  args: ['your@email.com', 'Admin', hash]
}).then(() => console.log('用户创建成功'));
"
```

**Turso（生产环境）：**

```bash
# 设好 DATABASE_URL 和 DATABASE_AUTH_TOKEN 环境变量后运行
node -e "
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');
const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN
});
const hash = bcrypt.hashSync('你的密码', 10);
client.execute({
  sql: 'INSERT INTO users (email, name, password) VALUES (?, ?, ?)',
  args: ['your@email.com', 'Admin', hash]
}).then(() => console.log('用户创建成功'));
"
```

---

## 页面路由

| 路由 | 功能 |
|------|------|
| `/` | 首页 — 树枝装饰 + 快捷入口 |
| `/sentences` | 句子列表 — 搜索、分页、标签过滤 |
| `/sentences/new` | 新增句子 |
| `/sentences/[id]` | 句子详情 |
| `/sentences/[id]/edit` | 编辑句子 |
| `/search` | AI 搜索 |

## API 路由

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/sentences?page=&pageSize=&tag=&q=` | 句子列表（分页/标签/搜索） |
| POST | `/api/sentences` | 新增句子 |
| GET | `/api/sentences/[id]` | 句子详情 |
| PUT | `/api/sentences/[id]` | 编辑句子 |
| DELETE | `/api/sentences/[id]` | 删除句子 |
| POST | `/api/search` | AI 语义搜索 |

---

## UI 组件

```
src/components/
├── ui/                        # 基础组件
│   ├── paper-card.tsx         # 纸张风格卡片（flat/raised/lifted 三级高度）
│   ├── paper-button.tsx       # 纸张风格按钮（primary/secondary/ghost × sm/md/lg）
│   ├── paper-input.tsx        # 纸张风格输入框（含错误提示）
│   ├── paper-textarea.tsx     # 纸张风格文本域（含错误提示）
│   └── tag-badge.tsx          # 标签徽标（可移除/可链接）
├── layout/
│   ├── header.tsx             # 顶部导航
│   └── footer.tsx             # 底部
├── sentence/
│   ├── sentence-card.tsx      # 句子卡片（含引号装饰、悬停操作）
│   ├── sentence-form.tsx      # 新增/编辑表单（react-hook-form + zod）
│   └── sentence-list-page.tsx # 句子列表页逻辑
└── search/
    └── search-panel.tsx       # AI 搜索面板
```

---

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发（SQLite）
npm run dev

# 数据库迁移（本地）
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 环境变量

创建 `.env.local`：

```env
# 本地开发：SQLite 文件
DATABASE_URL="file:./data/local.db"

# AI 搜索
ANTHROPIC_API_KEY="your-api-key"
```

### Vercel 部署环境变量

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | `libql://` Turso 数据库地址 |
| `DATABASE_AUTH_TOKEN` | Turso 认证令牌 |
| `NEXTAUTH_URL` | Vercel 会自动设置，无需手动填 |
| `NEXTAUTH_SECRET` | 任意随机字符串，用于加密 session（可用 `openssl rand -hex 32` 生成） |
| `ANTHROPIC_API_KEY` | Claude API 密钥（可选） |

---

## 风格设计

树木纸页风格的核心配色：

- **纸张底色**: `#fffbeb` (amber-50) — 暖黄纸色
- **墨色文字**: `#292524` (stone-800) — 温和黑
- **木质 accent**: `#b45309` (amber-700) — 暖棕
- **边框**: `#d6d3d1` (stone-300) — 柔和
- **字体**: Noto Serif SC（正文衬线）+ Ma Shan Zheng（手写标题）
- **纹理**: SVG 噪点滤镜模拟纸张纤维
- **装饰**: 树枝 SVG、引号装饰
