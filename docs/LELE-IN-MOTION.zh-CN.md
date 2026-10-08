# 第四版：LeLe in Motion

正式网站：<https://junyizhou-conny.github.io/ElenaWebsite/>。本地设计比较入口为 `/motion/`。原稿版继续保留在 `/elena/`，前两版也保持原样。

本版按 Elena 的 [2026-10-08 review](https://docs.google.com/document/d/1-f73wim9Pho_ijqhMiOx4AFP_29Qpg175c1-yrFlYys/edit) 简化：去掉贴纸、照片桌和图片放大查看器，让作品与文字更容易阅读。

## 现在的页面

- 首页：保留公司介绍和品牌，在原来小字的位置显示 `© 2026 LeLe Films LLC. All rights reserved.`，不再显示贴纸或还原按钮。
- 导航与邮箱：鼠标靠近时文字有轻微位移，真实可点击区域保持不动。当前页面的导航文字有下划线。
- Works：剧照完整可见，不跟随鼠标。鼠标悬停或键盘选中作品时，剧照轻微放大，箭头和 “View film” 给出反馈，标题保持不动。`(working title)` 单独显示为灰色小字，约为英文标题的一半；中文标题为黑色，影片状态为 `Work In Progress`。点击作品进入影片页；浏览器支持时，剧照会过渡为影片封面。
- 影片页：Stills 下直接显示四张真实剧照，没有说明文字、拖动、切换或点击放大。之后依次是 Director 和 Press；Press 显示原始网址。页面末尾保留回到 Works 和前往联系页的链接。
- 联系页：按 Canva 的正文比例显示文字，桌面使用 20px Open Sauce One，手机使用 17px；保留 “Copy email address”，去掉装饰性的“乐”字。复制功能需要浏览器支持，并使用 HTTPS 或 localhost。

## 动效节奏

保留的轻量动效使用 `src/motion.css` 顶部的两个时长和一条缓动曲线：

| 名称 | 数值 | 用在哪里 |
| --- | --- | --- |
| `--motion-feedback` | 160ms | 悬停、按下和颜色变化 |
| `--motion-settle` | 320ms | 导航文字回到原位、Works 剧照放大 |
| `--ease-out` | cubic-bezier(.22,1,.36,1) | 开始快、结束轻 |

例如：“把第四版的 `--motion-settle` 改成 280ms，其余不变。”页面切换另用 180ms 的短过渡。`src/motion.js` 不再读取这些时长；它负责鼠标位移、页面预加载、图片载入和复制邮箱。系统开启“减少动态效果”时，磁吸、放大和页面过渡会停用，页面链接与内容照常使用。

## 文件在哪里

| 文件 | 用途 |
| --- | --- |
| `content/elena.json` | 第三、四版共用的内容，以及第四版使用的导演介绍等新增字段。修改已有共享字段可能同时更新两版；如果只想改第四版，请明确告诉 Codex。 |
| `src/motion.mjs` | 第四版四个页面的结构，同时生成正式网站 |
| `src/motion.css` | 第四版的视觉、手机排版与动效节奏 |
| `src/motion.js` | 轻柔导航、页面预加载、作品图片载入和复制邮箱 |
| `public/motion/images/elena-director.png` | 导演照片，从 Elena 提供的 review 截图提取，354 × 632px |
| `public/elena/` | 沿用的原始 logo、字体与真实剧照 |
| `public/motion/stickers/` | 早期设计的贴纸素材；当前页面不显示 |
| `docs/MOTION-STICKER-PROMPTS.json` | 早期贴纸实验的提示词，保留作为来源记录 |
| `dist/` | 自动生成的四版设计比较预览 |
| `site/` | 自动生成的正式网站，第四版位于根目录 |

第四版引入原稿的基础样式，再用自己的样式覆盖。若希望只调整第四版，请勿修改 `src/elena.css`。不要直接修改 `dist/` 或 `site/`，运行 `npm run build` 会重新生成两者。

## 自然语言修改示例

“把第四版的磁吸效果再收敛一点，保留第三版原稿不变。”

“Works 的剧照悬停时不要放大，只保留箭头和文字变色。”

“用我上传的原始高清照片替换导演介绍中的照片，保留现有比例和布局。”

“用我上传的新剧照替换第二张照片，更新给屏幕阅读器的图片说明，保持页面上没有图片标题。”

“更新第四版导演介绍中的这一段文字，保留原稿版，核对手机显示后发布到现有 GitHub Pages。”

## 素材与参考

早期第四版采用用户选中的三类参考：[Sticki](https://www.sticki.com.au/) 的贴纸趣味、[Denise Hermo](https://www.dehermo.com/) 的 Grid/Canvas 照片操作、[Dennis Snellenberg](https://dennissnellenberg.com/) 的磁吸与作品反馈。2026-10-07 的打磨中，Works 曾对比四种做法，最终选用固定剧照与轻微悬停反馈，让标题和鼠标保持清楚。2026-10-08 按 Elena 的反馈去掉了贴纸、照片桌和查看器，保留较轻的导航与作品反馈。实现为本项目新写的代码，未复制参考网站的品牌、图片或源代码。

历史贴纸中的绿叶、盒装娃娃、集装箱是 AI 生成的独立插画，以《Goodbye, Yiwu》真实剧照中的物件为题材，不是电影原始素材。它们目前不再出现在网站上，源素材与提示词保留。

导演介绍逐字采用 Elena 的 review 截图；其中的经历、奖项和支持记录是作者提供的内容，本次没有逐项做外部事实核查。导演照片从同一截图无损提取，未生成或重绘人物。以后可用原始高清照片替换。片中剧照继续使用 Elena 提供的真实素材，并保留给屏幕阅读器的图片说明。

## 维护与发布

页面保持原生滚动。没有 JavaScript 时，四页链接、文案、导演介绍和静态剧照仍可阅读，邮箱也可直接打开邮件客户端；复制按钮属于渐进增强功能。

修改 Works 布局时，`src/motion.mjs` 中图片的 `sizes` 描述了它在各宽度下的实际显示宽度；如果改了 CSS 中的列宽，请让 Codex 一并更新 `sizes`，避免下载过大或过小的图片。

修改后运行：

```sh
npm run build
npm run check
```

随后在浏览器查看首页、Works、影片页和联系页，检查键盘导航、复制邮箱、手机宽度与减少动态效果。结构检查通过不等于这些实际体验已经检查，测试范围见 `docs/VALIDATION.md`。

正式网站由 `.github/workflows/publish-site.yml` 发布：合并到 `main` 后自动构建并上传 `site/` 到现有 GitHub Pages。查看工作流完成状态，再打开公开页面确认。

Sites 上的四版比较预览是另一份部署，GitHub 更新不会自动更新它；需要时应更新 `.openai/hosting.json` 指向的已有 Site，不新建替代站点。`lelefilms.com` 的域名连接是另一项配置，不能由推送代码推断已经完成；见 `docs/LAUNCH-LELEFILMS.md`。
