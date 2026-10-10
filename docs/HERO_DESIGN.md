# Digital Horizon 首屏设计与工程记录

日期：2026-10-09。范围：Header、Hero、首屏动态背景；保留个人资料、项目、技能、竞赛与联系流程。

## 当前版本：用户提供的背景视频

最新交互：用户明确要求动画默认播放，不再显示手动暂停按钮。文字流畅度调整见 `SILK_TEXT.md`；离屏 / 页面隐藏和减少动画仍作为自动资源控制。

用户后续要求将 `b409ab26859fa79d2d4c7ef5a067e858.mp4` 用作首屏背景。已保留既有排版，改为浅色文字与温和深色遮罩，提高星空夜景上的可读性。资源配置在 `src/data/heroMedia.ts`。

- `public/videos/hero-background.mp4`：1280×720、30fps、19.9s，4025329 bytes；由原 HEVC 转为 H.264 / yuv420p，使用 faststart，移除音轨。
- `public/images/hero-video-poster.webp`：从视频首帧提取，27870 bytes；用于加载和静态降级。
- 桌面与手机静音循环、行内播放；离屏与页面隐藏时自动暂停。浏览器禁止自动播放时使用封面降级。
- 减少动画模式不挂载视频、不请求 MP4。视频失败时保留封面、文字与操作入口。
- 当前不挂载 Three.js，保留原场景文件及素材供后续迭代。无新增依赖，不改个人资料、后续分区及联系流程。

以下 Digital Horizon 记录保留为上一个版本的设计决策。

## 工程分析

既有工程为配置驱动的 React 单页，首屏与 Three.js 场景可独立替换。此次目标是借鉴用户 OCEAN 截图的左侧排版、远处地平线、自然光和负空间，建立软件工程与 AI 开发者的电影感数字身份。背景采用数字地面，不复制海洋波浪。

优先级：P0 保留导航与联系入口；P1 左侧巨型衬线标题、静谧空间背景、全屏比例与深色衔接；P2 轻微视差与有节奏的文字入场。主要风险为持续 GPU 开销、素材加载、窄屏文字裁切和横屏可用高度。

Architect Agent 输入：是否沿用现有懒加载场景、如何隔离首屏样式、何时切入 WebGL、100svh 内如何包含固定 Header。评估确认无需更换核心架构，使用独立 Header、命名隔离的首屏 CSS，以及始终可用的静态底图。纹理加载完成后切入动画，手机与减少动画模式跳过场景包。Tester Agent 只读审查补充了短横屏风险，已通过紧凑排版修正。

## 视觉系统

- 公告条 30px，主导航 82px，首屏严格为 100svh。桌面版心最高 1700px，内侧留白 6%。
- 文案位于左侧约 55% 区域。主标题 Instrument Serif，第二行斜体；说明与操作使用 Inter，中文回退系统字体。字体来自本地依赖。
- 墨蓝 `#0a243b`、浅蓝天空、右侧温和自然光。数字地平线约在高度 65.6%，下部逐渐衔接 `#08090d` 内容区。
- Motion 入场顺序：导航 → Eyebrow → 两行标题 → 简介 → 两个 CTA。仅 transform / opacity；没有弹跳和霓虹描边。
- 滚动后公告条退出，导航增加模糊底色；继续下滚切换为深色。锚点保留原有分区 ID。

## 动态背景与资源

背景使用内置 image_gen 生成设计素材，再压缩为本地 WebP。该素材是抽象数字空间，不代表真实项目成果。它没有从参考截图提取图片。

保存文件：

- `public/images/digital-horizon.webp`：1672×941，113470 bytes。
- `public/images/digital-horizon-mobile.webp`：1280×720，56750 bytes。

使用的提示词方向（可供重做）：

> Create a cinematic editorial background for a developer portfolio, wide landscape composition. A vast open digital horizon, natural deep blue to pale blue sky, delicate atmospheric clouds and soft volumetric sunlight concentrated on the right. Keep the left upper and middle half quiet and uncluttered for large dark typography. Place the horizon around 68% of image height. Below it, a matte dark blue digital ground with a restrained perspective grid extending to infinity, tiny sparse light points and atmospheric depth. Sophisticated photoreal light, spacious, calm, subtle warm glow on the far right, no ocean, no waves, no water, no planet, no glowing sphere, no text, no interface, no logos.

Three.js 用一个全屏平面采样天空纹理，并加入幅度很小的天空流动、鼠标缓动和抗锯齿透视网格。DPR 上限 1.25，不使用模型与后处理。动态导入延迟 450ms，不阻塞首次文字显示。静态底图为加载状态与降级内容，移动端使用较小图片。

暂停、离屏和页面隐藏时改为按需渲染。低于 768px、减少动画、WebGL 不支持或上下文丢失时使用静态底图。指针位置和着色器时间用 ref / uniform 更新，避免每帧 React 重渲染。

## 后续修改

`Header.tsx` 修改公告、三项链接与联系按钮；`Hero.tsx` 修改首屏标题、说明、CTA；`hero.css` 修改排版与响应式；`CoreScene.tsx` 调整流动、视差与网格。个人别名与合作状态仍读取 `profile`。

替换背景时同时更新桌面 / 手机图片，优先保留安静的左侧与相同地平线高度。若桌面图片比例变化，更新着色器 `imageAspect`；若地平线位置变化，同步调整 `floorDepth`，避免动态网格与背景错位。首屏图片由 `index.html` 预加载。

## 交付与限制

新增 Header、hero.css、两张背景资源与本文档；修改 Hero、CoreScene、App、main、index 及字体依赖。没有修改个人资料和项目数据，没有删除后续页面模块。最终验证记录见 `VALIDATION.md`。

静态底图带有网格，动态层追加非常轻的网格流动；暂停时只停止动态背景，滚动提示仍遵循普通 / 减少动画设置。软件 WebGL 测试证明场景可运行，不构成实体 GPU 60 FPS 保证。Three.js 懒加载包仍是主要体积成本。
