# Jin Jiang — Academic Homepage

姜金 (Jin Jiang) 的个人学术主页，北京大学博士在读。

视觉风格参考 [julianlage.com](https://www.julianlage.com/)：极简暗色 hero、衬线大标题、暖色奶油背景、点缀式金色。

**在线地址**（部署后）：`https://jiangjin1999.github.io`

## 文件结构

```
.
├── index.html     # 页面结构 + 中英双语文案
├── styles.css     # 视觉系统
├── script.js      # 语言切换 / 滚动状态 / 入场动画
├── cv.pdf         # 公开 CV（建议脱敏手机号后再提交）
├── .nojekyll      # 让 GitHub Pages 原样服务静态文件
└── .gitignore     # 排除原始含隐私的 PDF
```

## 本地预览

```bash
# 方式 1：直接双击 index.html
# 方式 2：启一个本地服务器（避免某些浏览器缓存/CORS 问题）
python3 -m http.server 8000
# 访问 http://localhost:8000
```

## 部署到 GitHub Pages

本仓库是个人主页（user site），推荐仓库名 **`jiangjin1999.github.io`**，推到 `main` 分支后 GitHub 会自动托管，访问地址就是 `https://jiangjin1999.github.io`。

### 步骤

1. 在 GitHub 上新建一个仓库，命名为 `jiangjin1999.github.io`（public，不要勾选 "Add README"）。
2. 在本目录执行：

   ```bash
   git init
   git add .
   git commit -m "feat: launch academic homepage"
   git branch -M main
   git remote add origin https://github.com/jiangjin1999/jiangjin1999.github.io.git
   git push -u origin main
   ```

3. 去 GitHub 仓库 → Settings → Pages，确认 Source 是 `Deploy from a branch`，Branch 选 `main` / root。
4. 等 1–2 分钟，访问 `https://jiangjin1999.github.io` 就能看到。

### 自定义域名（可选）

如果未来想挂自己的域名（如 `jinjiang.ai`）：

```bash
echo "jinjiang.ai" > CNAME
git add CNAME && git commit -m "chore: add custom domain" && git push
```

然后去域名 DNS 配置 `A` 记录指向 GitHub Pages IP，或 `CNAME` 指向 `jiangjin1999.github.io`。

## 常见修改

### 新增一篇论文

在 `index.html` 的 `.pub-list` 里按现有 `<li class="pub">` 模板复制添加。Tag 可选：

```html
<span class="pub__tag pub__tag--oral">Oral</span>
<span class="pub__tag pub__tag--spot">Spotlight</span>
```

### 新增一条 News

在 `.news-list` 里复制一个 `<li class="news-item">`，只有两列：日期 + 文字（中英双语用 `data-en` / `data-zh`）。

### 默认语言改为中文

编辑 `script.js`：

```js
const saved = localStorage.getItem(STORAGE_KEY) || 'zh';  // 改这里
```

同时 `index.html` 顶部改成 `<html lang="zh-CN" data-lang="zh">`。

### 替换头像

`.about__photo-frame` 目前是 CSS 渐变占位。放一张真实头像后改成：

```css
.about__photo-frame {
  background: url("photo.jpg") center/cover no-repeat;
}
.about__photo-frame::after { content: none; }
```

### Google Scholar / GitHub / X 链接

`index.html` 底部 `.contact__links` 里的 `href="#"` 替换为真实地址（Google Scholar 首页 URL 现在是占位）。

## 待办

- [ ] 替换 `cv.pdf` 为脱敏版本（删除手机号）
- [ ] 放一张头像图 `photo.jpg`
- [ ] 填充真实的论文 PDF / arXiv / Code 链接（目前是 `#`）
- [ ] 填真实 Google Scholar 链接
