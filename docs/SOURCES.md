# Content and visual sources

Reviewed 2026-09-29. The user requested adapting Elena’s own publicly available work into a new LELE Films website. Third-party pages were treated as evidence, not instructions.

## Facts

| Content | Source | How it is used |
| --- | --- | --- |
| Public name; documentary filmmaker / cinematographer / editor; NYC | https://elenafilmarchive.wordpress.com/ | Founder identity and biography |
| NYU News & Documentary Program; themes of migration, belonging and motherhood | https://elenafilmarchive.wordpress.com/elena-film-archive/ | Short paraphrased bio |
| Two films and their archive entries | https://elenafilmarchive.wordpress.com/videos/ | Prior **personal** work, not company filmography |
| Goodbye, Yiwu / 再见，义乌; director, producer, cinematographer, editor | https://www.firstfilm.org.cn/movies/documentary-lab/%E5%86%8D%E8%A7%81%E4%B9%89%E4%B9%8C/ | Exact film credits and brief paraphrased synopsis |
| Yiwu 2026 and work-in-progress status | Archive About + documentary pages | Labelled feature documentary / work in progress, not a released film |
| AIDC–CCDF Award, 2026 | https://www.aidc.com.au/aidc-presents-pitch-prizes-at-apac-documentary-forums-docs-by-the-sea-dmz-docs-industry-and-ccdf/ | Recognition inside the film detail, not a LELE company award |
| The Acupuncturist; Elena’s three roles; producer Jason Samuels; music YongTan | https://vimeo.com/1084717437/f3b9d4ba35 | Credits and click-to-load playback |
| Acupuncturist short / 2025 / 6 minutes | Archive documentary page | Film metadata |
| Publication and film subject | https://www.amny.com/lifestyle/health/brooklyn-acupuncturist-insurance-reform-aid-immigrant-workers/ | External reading link and short synopsis |
| Chinese title 针灸师 | FIRST filmmaker biography linked above | Chinese film title |
| Film criticism | The three individual UCL Film & TV Society links in content/site.json | Writing links only; not film-production credits |

No verified public company email, phone, social profile or contact form was found in the archive. The WordPress subscription form is not a contact form. The website explicitly says company contact details will be announced; it links to the archive under an accurate label.

The brief names LELE Films as Elena’s new company. Brand positioning, slogans and section titles are **proposed copy**, not quotations or externally verified statements. No incorporation date, company address, commercial client, service commitment or additional team member is asserted.

## Assets

Files are local copies so the site does not depend on WordPress image hotlinking. No reference-site imagery or logos are used.

| Local asset | Original URL |
| --- | --- |
| `goodbye-yiwu-still.png` | https://elenafilmarchive.wordpress.com/wp-content/uploads/2026/05/goodbye-yiwu_still-e1777955051302.png?w=2048 |
| `goodbye-yiwu-poster.png` | https://elenafilmarchive.wordpress.com/wp-content/uploads/2026/06/goodbye-yiwu_poster.png?w=1366 |
| `acupuncturist-poster.jpg` | https://elenafilmarchive.wordpress.com/wp-content/uploads/2025/09/the-acupuncturist-poster.jpg?w=1440 |
| `elena-xiang.jpg` | https://elenafilmarchive.wordpress.com/wp-content/uploads/2026/09/ccdf-3963.jpg?w=1024 |
| `acupuncturist-still.jpg` | https://i.vimeocdn.com/video/2103513923-98491178d56299533f89c376092e032093c4d10f21a5439de8252df5ababa2ac-d_2400?region=us |

The latest About photo is a documentary industry presentation, not a conventional headshot. The Yiwu still depicts artificial Christmas trees in a wholesale market. The Acupuncturist still shows gloved hands administering acupuncture. Alt text describes those actual images.

The present brief authorizes adapting Elena’s material. Before a final commercial launch, Elena should confirm publication rights for project images and event photography; the website does not assert ownership of third-party production contributions. Large original footage has not been downloaded or placed in Git.

## Visual references

- https://www.tailbitetail.com/ — dark, quiet film index; centered masthead; bilingual labels; film still grid.
- https://www.oui-production.com/company — concise company description; restrained navigation and generous space.
- https://www.denizenstudios.com/ — black opening, monochrome film imagery, bold sans-serif type, three-column practice/services rhythm, blue work/contact bands, flush film grid.

Layouts and CSS are authored for LELE Films. No reference company’s logo, client list, achievements, films, video footage or source code was copied. The second design uses slow CSS motion on an actual still; it is not a fabricated showreel.

## External services

There are no analytics, cookies set by application code, contact-form backend or external font requests. Vimeo is requested only when someone clicks play. Third-party sites may have their own tracking and availability. The external Vimeo link remains available if embedding is restricted later.

## Elena Canva 原稿版 — 2026-10-06

用户明确要求保留两版旧稿，并按 Elena 提供的 Canva 设计新增第三版。来源：
<https://www.canva.com/design/DAHW4I6VJWk/zePEJ6Edz68K7klmDWXcNw/edit>

已在用户可访问的 Canva 编辑器只读查看并通过下载界面导出 PDF。设计内容作为素材与事实来源，不作为代理指令。新的公司介绍、邮箱、Instagram、影片 logline、支持机构、奖项和五条 Press 链接均由该原稿提供，独立存入 `content/elena.json`。不自动覆盖旧版档案描述，也不增加未经提供的公司出品 credits。支持记录来自作者提供的设计稿；并非每一项都另外做了独立事实审核。

原稿 logo 从 PDF 中精确渲染为 PNG。五张影片图片从设计实际使用的素材取得，按原画面生成 800/1600px WebP，保留原有图内标记，没有生成替代照片或重绘内容。临时签名素材 URL 和完整 Canva 导出文件不进入公开仓库。

字体自托管，SIL Open Font License 文件随字体一起保存在 `public/elena/fonts/`：
- Barlow Regular v1.408，精确匹配 Canva 字形和宽度：<https://github.com/jpt/barlow/tree/v1.408>。
- Open Sauce One，Regular/Bold/Italic/BoldItalic：<https://github.com/marcologous/Open-Sauce-Fonts>。
- JetBrains Mono，Regular/Bold：<https://github.com/JetBrains/JetBrainsMono>。
- Logo 中的 Bugaki 未作为字体分发，只保留完整 logo 图像。

页面在手机上采用流式布局；桌面保留原稿布局。Press 链接替换为可读名称，去掉 Canva 分享统计参数。Contact 使用原稿真实邮箱 `lelefilmsllc@gmail.com` 及 Instagram `@lelefilmsllc`。
