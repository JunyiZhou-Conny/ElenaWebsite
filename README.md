# LELE Films

给 Elena 的电影公司网站起点。四种独立设计，其中第三版忠实实现 Elena 提供的 Canva 稿；不需要付费框架、数据库或复杂后台。

| 版本 | 打开地址 | 设计方向 |
| --- | --- | --- |
| 01 · Quiet Cinema | `/quiet/` | Tail Bite Tail 的电影档案感 + Oui 的留白：暖黑底、衬线字体、双语导航、剧照 |
| 02 · The Studio | `/studio/` | Denizen 的黑白开场、粗体文字、通栏作品和亮蓝色区块 |
| 03 · Elena’s Design | `/elena/` | Elena 的 Canva 原稿：白底、橙蓝 logo、四个独立页面 |
| 04 · LeLe in Motion | `/motion/` | 按 Elena 10 月 8 日反馈简化：保留品牌、轻柔导航和作品反馈；静态剧照、导演介绍与简洁联系页 |
| 比较入口 | `/` | 四个方向的入口 |

正式网站：<https://junyizhou-conny.github.io/ElenaWebsite/>。

四版设计预览（与正式网站分开发布）：
- https://lele-films-designs.carissa-conny.chatgpt.site/motion/
- https://lele-films-designs.carissa-conny.chatgpt.site/elena/
- https://lele-films-designs.carissa-conny.chatgpt.site/quiet/
- https://lele-films-designs.carissa-conny.chatgpt.site/studio/

这些 Sites 地址是设计预览，**不是已绑定的 lelefilms.com**，也不会随 GitHub 更新自动重新发布。设计预览默认禁止搜索引擎索引。

正式网站选用第四版：`npm run build` 另外生成 `site/`（第四版放在网站根目录，可被搜索引擎收录，不含设计比较链接），合并到 `main` 后由 GitHub Actions 发布到 GitHub Pages。连接 lelefilms.com 的步骤、Elena 需要提供的信息和 DNS 记录见 `docs/LAUNCH-LELEFILMS.md`。

## 在自己的电脑上打开

需要 Node.js 20 或更新版本。项目没有第三方运行依赖，不需要 `npm install`。

在 Codex 打开这个仓库，然后输入：

```sh
npm run dev
```

浏览器打开 <http://localhost:4173/>。按 `Ctrl+C` 停止本地服务。

内容和样式改动后，在另一个终端运行 `npm run build`，再刷新浏览器。也可以直接让 Codex 完成这一步。

## 最常用的文件

| 文件 | 用途 |
| --- | --- |
| `content/elena.json` | 第三、四版的公司介绍、真实邮箱、影片文案、支持机构、剧照和报道链接；也保存第四版使用的导演介绍 |
| `src/motion.mjs` / `src/motion.css` / `src/motion.js` | 第四版独立结构、样式与互动；维护说明见 `docs/LELE-IN-MOTION.zh-CN.md` |
| `src/elena.mjs` / `src/elena.css` / `src/elena.js` | 第三版的页面、手机适配和轻量导航 |
| `public/elena/` | 第三版的原始 logo、压缩后的剧照、自托管字体和许可证 |
| `public/motion/images/` | 第四版导演介绍使用的作者照片 |
| `content/site.json` | 公司介绍、邮箱、创始人、作品、团队、服务、写作链接 |
| `public/images/` | 正式显示在网站上的剧照、海报、照片 |
| `src/templates.mjs` | 两套页面的结构 |
| `src/site.css` | 两套视觉样式和手机适配 |
| `src/site.js` | 作品弹窗、Vimeo 播放、开场图运动开关 |
| `dist/` | 自动生成的设计预览（四个版本）；不要在这里手工修改 |
| `site/` | 自动生成的正式网站（第四版，供 lelefilms.com 使用）；不要在这里手工修改 |
| `.github/workflows/publish-site.yml` | `main` 有更新时自动发布 `site/` 到 GitHub Pages |
| `docs/ELENA-GUIDE.zh-CN.md` | Elena 用自然语言维护网站的说明 |
| `docs/SOURCES.md` | 内容和素材来源、哪些是已验证事实 |
| `docs/CONTENT-TEMPLATE.json` | 添加项目和团队成员时使用的空模板 |

## 当前内容与边界

- 第四版与正式网站按 Elena 的 2026-10-08 review 去掉贴纸、照片桌和放大查看器；保留四张不可点击的剧照，在 Stills 与 Press 之间加入导演介绍。Works 单独显示 `(working title)`，状态为 `Work In Progress`，Press 显示原始 URL。联系页恢复 Canva 的正文大小，保留复制邮箱。
- 新增导演介绍逐字采用 Elena 在 review 中提供的设计截图。里面的经历与奖项是作者提供的内容，未在本次修改中逐项独立核实。导演照片取自同一截图；原始高清照片可在以后替换。
- 以下个人档案、播放弹窗和空白内容模板说明主要适用于 `/quiet/` 与 `/studio/`；这两版与 `/elena/` 原稿均保留原样。
- 《Goodbye, Yiwu》（2026，制作中）和《The Acupuncturist》（2025，6 分钟）来自 Elena 的公开个人档案。
- 这两部片都标为 **Elena’s personal work**。不会自动声称它们由 LELE Films 出品。
- 《The Acupuncturist》在用户点击播放后才载入 Vimeo；关掉弹窗会停止播放器，并保留外部 Vimeo 链接作为后备。
- 第一版的公司定位、标题和宣传语是设计草稿，供 Elena 修改确认；没有虚构客户、公司奖项、商业服务承诺或团队。
- 前两版的公司邮箱保持原先的空值，不显示假邮箱；第三版已使用 Elena 在 Canva 提供的 `lelefilmsllc@gmail.com`。填写 `company.email` 后，两套页面会自动显示邮件链接。
- `company.team`、`company.services`、`company.companyProjects` 默认空数组。填入真实内容后，页面会自动出现对应区块；没有空白卡片占位。
- 当前开场是取自真实作品的静态剧照，带可暂停的缓慢运动，不冒充视频 showreel。
- 海报可从每个项目详情打开。三篇影评作为 writing，未混同为执导作品。

## 验证与发布

```sh
npm run build
npm run check
```

项目输出为普通 HTML/CSS/JS。`dist/` 用于四版设计比较；`site/` 用于正式网站。页面使用相对路径，也能部署在 GitHub Pages 的项目子路径下。

当前 Sites 项目标识在 `.openai/hosting.json`，后续让 Codex 更新这个已有 Site，避免每次新建站点。GitHub push 本身不会自动更新 Sites；需要完成 Sites 发布。

正式网站已选用第四版，首页在 `/`，使用真实邮箱，不显示对比工具条。合并到 `main` 会由 GitHub Actions 构建并发布 `site/`；发布后检查工作流和公开页面。自定义域名仍须单独完成 DNS 连接，步骤见 `docs/LAUNCH-LELEFILMS.md`。

## Elena 原稿版（2026-10-06）

从 `/elena/` 首页可进入 Works 和 Contact，点击作品进入 `/elena/works/goodbye-yiwu/`。点击 logo 返回新版首页。第三版内容独立放在 `content/elena.json`，不会改动前两版的旧文案。维护说明见 `docs/ELENA-CANVA-GUIDE.zh-CN.md`。
