# Elena 原稿版维护说明

新版入口：<https://lele-films-designs.carissa-conny.chatgpt.site/elena/>

这一版依据 Elena 2026 年 10 月提供的 Canva 设计。首页、Works、作品详情和 Contact 是四个真正的网页，各自可以分享、刷新和返回。前两版保留在 `/quiet/` 和 `/studio/`，比较入口仍然在 `/`。

## 用自然语言修改

在 Codex 中打开这个 GitHub 仓库，直接说希望发生什么。例如：

- “只修改 Elena 原稿版，把公司介绍替换成下面这段，保留 logo 和版式。”
- “给《再见，义乌》增加一条新的电影节入选记录，使用下面的正式名称和报道链接。”
- “把第二张剧照换成我上传的图片，保留原比例并压缩到适合网页加载的大小。”
- “加入第二部作品，按照现有 Works 的样式，并为它建立独立详情页。”
- “先给我看本地效果，暂时不要发布。”
- “确认了，把这些改动同步到 GitHub，再更新现有网站。”

只说事实和想要的变化即可，不需要指定程序语言。新作品的 credits、机构、奖项和联系方式请提供真实内容。

## 内容在哪里

- `content/elena.json`：公司介绍、邮箱、Instagram、影片信息、支持机构、剧照顺序和新闻链接。
- `public/elena/images/lele-logo.png`：从原 Canva PDF 精确提取的 logo；不是重新绘制。
- `public/elena/images/`：五张原始剧照的网页版本，800px 和 1600px 两种大小。
- `src/elena.mjs`：页面和导航；新增作品时也需要增加路线和模板。
- `src/elena.css`：字体、间距、手机布局和短暂的页面过渡。
- `src/elena.js`：在鼠标或键盘即将打开站内链接时预先准备页面，不拦截点击。

普通文本修改后运行 `npm run build` 和 `npm run check`。本地预览使用 `npm run dev`，打开 <http://localhost:4173/elena/>。修改后重新 build 并刷新即可。

## 设计与浏览行为

保留原稿的 Barlow、Open Sauce One、JetBrains Mono 字体以及橙色 `#ff751f`、蓝色 `#002fa7`。字体和图片随网站提供，不依赖 Canva 登录或临时素材链接。Canva 的商业 logo 字体没有作为字体文件分发，logo 以完整图片保留。

电脑端以原稿比例和留白为准；手机端重新排版首页导航，剧照改为单列。Press 中冗长的网址改为简短的可读报道名称，仍指向 Elena 提供的五个来源。没有新增片花、假播放按钮或申请表。

支持浏览器的原生页面过渡；不支持时使用普通页面跳转。尊重“减少动态效果”设置，不加入滚动劫持或必须等待的开场。邮箱链接会打开访问者设置的邮件应用。

## 保存与发布

GitHub 保存可编辑的源文件和生成的 `dist/`。网站发布使用已有 Site，不要新建替代项目，也不要删除旧版本。GitHub push 不等于网站自动更新，发布还需要执行 Sites 更新。

这些仍是设计预览，保留 noindex。`lelefilms.com` 的域名和 DNS 未在这次更新中变更。
