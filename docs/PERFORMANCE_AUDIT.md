# 性能审查与优化（2026-10-10）

## 工程分析

目标为降低素材传输、视频解码和高分屏绘制负担，保留默认播放、开场、章节进场、图片墙与现有交互。工程是配置驱动的 React / Vite / TypeScript 单页：Hero 使用本地视频，后续模块共享一个视口大小的 OGL Particles，About 另有局部 DitherVeil；GSAP / ScrollTrigger 懒加载编排章节，项目过滤有独立 context。没有后端、路由迁移或新依赖。

阅读 Hero / Header、可见性 Hook、WebGL 源码、GSAP 生命周期、资源配置、字体入口与生产请求后，确认以下问题：

1. 手机与桌面下载同一个 4.03 MB Hero 视频；头像与墙面素材使用超出展示尺寸的图片。
2. 初始 `#team` 在 React 内容挂载前无法正常定位，造成错误停留在首屏并下载 / 播放视频。
3. About 锚点的滚动间距会留下约 37px Hero 边缘，原 2% 可见阈值仍播放视频，同时内容背景已运行。
4. Particles / Dither 的每次指针事件直接读取布局；高频设备的一帧内可以重复测量。Dither 原 DPR 上限 2，并分配了不需要的深度缓冲。
5. Opening 专用 scroll 监听在开场完成后仍保留；字体可以明确预加载首屏使用的实际 WOFF2 URL。

风险是压缩损失星空细节、降低 DPR 改变点阵尺寸、可见性边界误停 / 重载，以及清理 GSAP 时影响共享描边组件。优先局部修复，不重写模块，不覆盖用户原始附件。

## 架构决策与实施范围

Architect 只读评估确认保持现有单页和配置结构：将视频源选择与播放生命周期分离、为手机提供独立版本、复用现有动画帧合并指针测量、局部限制画布 DPR，并只清理自己的监听 / context。Header 已缓存 Hero 坐标，滚动回调只比较 scrollY、状态变化才 setState，采用 passive；无需重写。现有入场一次、三组桌面图片 scrub、手机无 scrub 和项目过滤清理策略继续保留。

## 1. 视频与图片

下列大小为文件字节，使用十进制 MB / KB；网络 encodedDataLength 另含响应头，不能混用。

| 资源 | 原文件 | 当前运行文件 | 减少 |
| --- | ---: | ---: | ---: |
| Hero 桌面视频 | 4,025,329 B | 2,139,728 B | 46.8% |
| Hero 手机视频（原与桌面共用） | 4,025,329 B | 681,159 B | 83.1% |
| 身份卡头像 | 141,141 B / 1080² JPG | 26,620 B / 640² WebP | 81.1% |
| 图片墙六种素材合计 | 350,028 B | 76,622 B | 78.1% |

桌面 Hero 保留 1280×720、30fps；手机 / Save-Data 使用 640×360、24fps。两者约 19.9 秒，H.264 / yuv420p、无音轨、faststart、静音循环与行内播放。完整 FFmpeg 解码通过，原版与压缩版 6 秒代表帧已查看。手机版牺牲背景细节换取较小传输和解码尺寸；文字与按钮不受视频分辨率影响。

头像完整构图不裁切，640px 对应最大340px身份卡；图片墙使用最长边600px、骷髅缩略图400px，六种 WebP 单文件约4–27KB。原 JPG / 完整数字天空 / 骷髅资源保留，不删除未知文件；墙面配置改为缩略图，About Dither 继续使用完整骷髅 WebP。实测无旧墙面 JPG 或旧头像请求。

两部影片当前分别5,203,693 B（1080p60fps、15秒）和16,366,756 B（720p30fps、96秒），此前已压缩。保留其声音与质量，滚动到影片区不会分配 video src；仅点击后下载，实测切换只播放一部，因此本次无需进一步降低影片画质。首页封面约28KB，影片封面与项目资源继续懒加载。

## 2. WebGL 动态背景

Particles 保持200个白色粒子、一个 viewport-size sticky Canvas、DPR1。不为每一屏新建场景，也不按整个页面高度分配缓冲。same-size resize 不重复 setSize。移动 / 粗指针 / reduced / 失败降级和离屏 / hidden 清理保持原样。

Dither 新增可配置 `maxPixelRatio`，默认1.5，关闭深度缓冲。DPR2、CSS 590×330 的实际 backing 为885×495，相比原1180×660减少43.75%的画布像素；这不等于同幅度的 FPS 增长。1.5也使默认2px点阵在物理像素取整后保持2px逻辑尺寸。鼠标揭示、点击扩散和高分屏视觉截图已检查。

两场景的 move handler 只记录最新坐标，在既有 render RAF 中最多测量一次当前布局，不增加持续循环；Dither 点击立即校准位置。浏览器同一任务派发100次 move 后，每场景实测仅1次 getBoundingClientRect。跨帧80次真实 mousemove仍会各读取80次，这是正确行为。两者原抗锯齿本来已关闭；本次明确写出该选项，没有将其计作优化收益。

## 3. 滚动监听

Header 的 passive 监听与初始化 / resize 坐标缓存保留。Hero 的 Motion useScroll 仍只驱动离场遮罩透明度；内容区依赖可见性观察，生命周期释放已有画布。

`useEditorialMotion` 在 layout effect 中仅为初始非 home 锚点、且未发生已有滚动时定位已挂载模块，发生于视口观察与视频源分配之前。随后导航仍使用原生锚点，保留恢复到非零位置的页面。Hero 延迟250ms分配 src，先让封面 / 文字绘制，再按手机 / Save-Data 选择一次源；resize不会重新下载另一版本。有效可见阈值提高到15%，避免第二屏仅剩首屏边缘时继续解码。返回首屏自动继续，不增加暂停按钮。

## 4. GSAP 动画

开场完成、快滚或键盘完成后移除本动效的专用 scroll 监听，并清理超时。生产浏览器检测完成后的此监听数量为0。章节保持一次播放；临时 transform / clipPath / will-change 在完成后清理；项目过滤独立 context revert，浏览器三轮筛选后没有断开节点 trigger，桌面仅三组图片 parallax，手机为0。

没有调用共享 ScrollTrigger.disable：描边标题和统一章节编排共用同一个插件，不能由局部组件关闭全站。ResizeObserver 尺寸变化与字体完成刷新合并到一帧；实时 reduced 只撤销本编排的 context，恢复可读内容。原开场与慢节奏缓动保留。

## 5. 首屏加载与测量

在 `fonts.css` 显式使用原九组本地 WOFF2 字体和 swap，保留字族 / 字重。index.html 预加载 Instrument Serif 正体 / 斜体和 Inter400；Vite转换为与CSS一致的生产URL，实测每个只请求一次。之前现代浏览器也使用WOFF2，此次主要消除构建中的WOFF回退文件、提前发现关键字体，没有声称字体请求数量减少。

同一台机器的隔离 Chrome、生产预览、缓存禁用、DPR1，网络idle后再观察4.2秒：

| 场景 | 优化前已完成请求字节 | 优化后已完成请求字节 | 优化后视频请求 |
| --- | ---: | ---: | --- |
| 桌面根首页1440×1000 | 3,511,309 B | 2,559,667 B | 仅桌面 Hero |
| 手机根首页390×844 | 4,559,879 B | 1,101,094 B | 仅手机 Hero |
| 桌面初始 #team | 4,559,879 B | 409,823 B | 无 |

桌面原视频在测量窗内只完成部分 range，不能将网络总量差当完整视频压缩比。原 #team 没有定位，前后可见内容不同，也不能比较其LCP。测量后的正常根首页默认视频时间均推进。

最终本机桌面根页LCP740ms、手机348ms、CLS均0；这些未经网络节流、包含opening期间的绘制，不代表3.2秒开场结束时间或线上Core Web Vitals。初始约156–169ms长任务仍存在，#team 软件WebGL测试出现约412ms长任务。鼠标 / 六次滚轮抽样ScriptDuration134.24→159.56ms，未证明CPU时间改善，不能声称帧率已提高或稳定60FPS。实体GPU、不同浏览器与真实网络仍需实机测量。

## 文件与验证

修改 Hero.tsx、heroMedia.ts、profile.ts、driftWall.ts、useEditorialMotion.ts、editorialMotion.ts、Particles.jsx、DitherVeil.jsx/.d.ts、main.tsx、index.html；新增 fonts.css、手机视频、头像WebP和六张墙面WebP。桌面已知网页视频副本在工作区备份后替换；用户附件及旧图片未改动，没有新增npm依赖或删除代码。

- TypeScript / Vite构建通过。当前主JS约136.35KB gzip、编排3.14KB、共享GSAP/ScrollTrigger45.16KB；构建大小并非浏览器执行耗时。
- 现有42项编辑动效回归通过，包含opening / 英文进场、项目过滤 / dialog、学校隐藏、组队、单粒子、reduced、快滚、320 / 390 / 958 / 1920px无溢出与Team局部axe。
- 生产25项性能功能回归通过：deep无视频、返回默认播放、About边缘暂停、DPR2 / depth / 高频指针、图片真实解码、两影片按需与互斥播放、离屏Dither释放、reduced静态、手机资源 / 布局。
- 9项加载专项通过：opening监听释放、字体preload复用、受控hidden/恢复、墙面缩略尺寸、Save-Data、视频失败封面与CTA。hidden为受控模拟，不是用户真实标签页后台验收。
- 三个生产采样场景页面异常 / 控制台警告和错误均0。失败注入的媒体网络错误为预期，不计入正常请求。
- 已实际查看视频代表帧、DPR2 About、手机首屏和最终图片墙截图；Tester只读复审无阻塞项。源码包在完成后刷新，不包含dist / node_modules。

工作区复现脚本：`work/performance-audit/prepare-media.py`、`work/browser-qa/perf-audit.cjs`、`perf-functional.cjs`、`perf-loading.cjs`；结果在`work/performance-audit/`，工具依赖不属于网站运行依赖。未来替换资源时重新检查文件体积与视口加载；扩大DPR或增加同时可见WebGL场景前再测量。
