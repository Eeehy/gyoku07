# Eeehy / 开发者数字实验室

面向大学生竞赛合作的个人技术网站 MVP。React + Vite + TypeScript + Tailwind CSS + React Three Fiber / Three.js + Motion + Lucide。已配置 Eeehy（**琳）、大二软件工程与本人提供的邮箱；学校已隐去，GitHub 暂不提供。项目与参赛经历仍保留真实状态或概念示例标记。

## 启动

需要 Node.js 22.12+（本次使用 Node.js 24.18.0）。进入本文件所在目录：

```sh
npm install
npm run dev
```

打开终端输出的本地地址，默认 `http://127.0.0.1:5173/`。

```sh
npm run typecheck # TypeScript 检查
npm run build     # 生成 dist/
npm run preview   # 预览生产构建
```

`package-lock.json` 已提供；需要严格复现依赖时使用 `npm ci`。首次安装需要网络，运行时字体、图形与依赖均来自本地资源，不依赖外部图片服务。

## 修改内容

资料使用 **`src/data/`** 下的独立配置文件，`portfolio.ts` 统一导出；修改后开发页面自动刷新。

| 配置 | 修改内容 |
| --- | --- |
| `profile.ts` → `profile` | 姓名、代号、专业、学校、简介、学习方向、头像、邮箱、GitHub、组队开放状态 |
| `projects.ts` → `projects` | 项目背景、职责、难点、成果、技术栈、封面与链接 |
| `skills.ts` → `skillGroups` | 技术分类、实际经验、关联项目 ID |
| `competitions.ts` → `competitions` | 真实赛事经历，可添加已完成 / 进行中 / 计划中的记录 |
| `competitions.ts` → `explorationPlans` | 关注方向与计划，不作为参赛履历 |
| `profile.ts` → `team` | 合作方向、寻找的队友类型和合作方式 |
| `profile.ts` → `navigation` | 保留的原版导航配置；当前精简首屏导航在 `Header.tsx` 中维护 |
| `heroMedia.ts` → `heroMedia` | 首屏桌面 / 手机背景视频与静态封面路径 |
| `films.ts` → `films` | 项目展示后的影片名称、说明、时长、视频与封面路径 |
| `driftWall.ts` | 图片墙的六种本地素材、墙面序列和漂移参数 |
| `profileCard.ts` | About 头像身份卡的光纹、配色和本地纹样；姓名与头像仍读取 profile.ts |
| `motionDesign.ts` | 首屏揭幕、章节标题 / 卡片时长、先后间隔、错峰与图片视差幅度 |

姓名、专业、年级、宣言和邮箱已填写。后续修改 `profile` 即可，终端、关于区、页脚与联系方式读取同一份配置。姓名保留本人提供的遮蔽形式；学校按本人要求隐去，`university` 留空时身份卡与终端不展示学校，也不显示待补充提示。邮件地址只填写邮箱本身；GitHub 留空则隐藏个人主页入口，提供时填写完整的 `https://github.com/用户名`。`team.directions` 控制邀请表单的方向与默认选项，当前按 AIGC → 数学建模 → 电赛 → 创新创业排列。

头像与截图推荐使用压缩过的 WebP / AVIF，放入 `public/images/`。例如 `avatar: '/images/avatar.webp'`、项目 `cover: '/images/my-project.webp'`。封面使用 `loading="lazy"`。建议封面比例约 16:9；主项目是宽幅展示，留意裁切。

项目 `isDemo: true` 会显示概念示例标记，成果不可虚构。只有填入真实项目后才改成 `false`。缺少 GitHub / demo 链接时显示待补充提示，不生成无效链接。`visual` 指定没有截图时的内置演示预览：`space` / `ai` / `flow`。

新增项目只需追加一条配置；`skillGroups.projectIds` 引用项目 `id`。当前筛选按 `visual` 分为 AI 与软件交互，若未来增加技术分类，可在 `Projects.tsx` 中改为独立分类字段。

真实竞赛示例结构（仅填写已核实信息）：

```ts
{ title: '真实赛事名称', type: '真实参赛经历', status: '已完成',
  detail: '项目内容与真实结果', role: '你实际承担的职责' }
```

## 可实际操作的交互

- 首页：Eeehy 标识开场、三片错位遮幕上揭、视频轻微拉远，衬线标题以遮罩 / 位移 / 压缩归位；完整开场约 3.2 秒。当前页面返回首页不重复开场，刷新根地址可重看；滚动或键盘访问会直接完成开场。原星空视频、导航与项目 / 组队入口保留，动画默认播放。
- 章节：英文大标题逐行从遮罩中展开，内容随后错峰进入；项目与影片封面揭示，桌面项目图有轻微滚动视差。保留中文标题描边特效；原生滚动，不锁定页面。配置与替换说明见 `docs/EDITORIAL_MOTION.md`。
- 简介：原创丝绸波纹文字，鼠标 / 轻触产生局部起伏，文本仍可选择；绘制跟随浏览器刷新，离屏或隐藏时自动停止。实现与调整见 `docs/SILK_TEXT.md`，并非 React Bits Pro 付费组件。
- 导航：进入第二屏后固定悬浮于顶部，使用淡蓝描边、圆角和磨砂玻璃；手机菜单在悬浮栏下方展开。回到首页恢复透明导航。
- 终端：`whoami` / `skills` / `projects` / `contact` / `help` / `clear`，↑↓ 历史与 Tab 补全。只解析预设命令，不执行脚本。
- 身份卡：About 左侧接入官方 React Bits ProfileCard，使用本人提供的完整卡通头像，显示 Eeehy / **琳、软件工程大二与组队状态。桌面倾斜 / 蓝紫光纹，手机与减少动画静态；联系链接打开真实邮箱草稿。头像在 `profile.ts`，视觉在 `profileCard.ts`，详见 `docs/PROFILE_CARD.md`。
- 项目：筛选、指针倾斜、详情弹窗、Esc 关闭，原生对话框管理焦点与 Tab 范围。
- 动态实验：Projects 后的 `#films` 展示两部本人提供的视频，点击封面播放；保留声音、进度、全屏与原生控制，同一时间只播放一部。首页与滚动经过时不下载视频主体。网页资源已压缩，原件不变；在 `films.ts` 替换或追加，详见 `docs/MOTION_STUDIES.md`。
- 项目名称：ParticleText 悬浮 / 键盘聚焦粒子聚合，淡蓝高亮；按小标题字号适配，原文可读。配置在 `src/data/projectTitleEffect.ts`，源码与说明见 `docs/PARTICLE_TEXT.md`。
- 漂移图片墙：About 与 Projects 之间使用 React Bits DriftWall，五列 CSS 3D 画面默认缓慢漂移，鼠标视差与悬浮提亮 / 抬升；无暂停按钮。已移除原照片木马与六张网站照片，改用本站截图、明确标注的界面概念与数字艺术。配置在 `src/data/driftWall.ts`，手机 / 粗指针 / 减少动画使用六图静态网格。来源、素材与修改说明见 `docs/DRIFT_WALL.md`。
- 技术：节点可点击与键盘选择，显示经验说明和关联项目。
- 组队：验证姓名、邮箱及至少 10 字的想法，生成草稿并复制。**没有后端，不会上传、保存或自动发送信息。**
- 邮箱留空：明确提示待配置；填写邮箱后，草稿区出现“打开邮件”，使用 `mailto:` 唤起访客邮件客户端，由访客发送。

## 架构与性能

主色为淡蓝 `#b8dcff`；在 `src/styles.css` 的 `:root` 修改 `--accent`、`--accent-hover`、`--accent-ink` 可调整主色、悬浮色与实心按钮文字。按钮悬浮及键盘聚焦会平滑变色，减少动画模式保留颜色反馈并取消过渡。

```text
src/
├── data/                   独立内容配置与数据类型
│   ├── profile.ts          个人资料、合作方向与导航
│   ├── projects.ts         项目与占位状态
│   ├── skills.ts           技术节点与项目关联
│   ├── competitions.ts     赛事记录与探索计划
│   └── portfolio.ts        统一导出入口
├── components/
│   ├── Hero.tsx            首页与视频播放 / 静态降级
│   ├── Header.tsx          公告条、精简导航与手机菜单
│   ├── CoreScene.tsx       保留的数字天际线场景，当前不加载
│   ├── Terminal.tsx        预设命令解释器
│   ├── Projects.tsx        项目筛选、预览与详情
│   ├── Skills.tsx          技术节点网络
│   ├── TeamInvite.tsx      邀请表单与邮件草稿
│   ├── EditorialHeading.tsx  英文章节大标题的局部遮罩
│   └── Experience.tsx      光标与磁吸
├── hooks/useExperience.ts  媒体查询与页面可见性
├── hooks/useEditorialMotion.ts  懒加载、媒体变化与安全降级
├── motion/editorialMotion.ts    GSAP / ScrollTrigger 统一编排
├── App.tsx                 组合全部页面模块
├── styles.css              视觉变量、布局、响应式
├── hero.css                首屏独立样式与横屏适配
├── editorial.css           开场遮幕、章节标题与图片遮罩
└── main.tsx                本地字体与应用入口
```

- 首屏桌面视频为 1280×720 / 30fps / 2.14MB，手机与 Save-Data 使用 640×360 / 24fps / 0.68MB；均为约19.9s的 H.264 MP4，无音轨、faststart、静音循环与行内播放。`heroMedia.video` / `mobileVideo` 分别配置两个版本，替换时一起检查画质与体积。
- 视频就绪前显示同一视频提取的 WebP 封面（约 27 KiB）；播放失败或自动播放被阻止时回退封面。
- `prefers-reduced-motion` 仅显示封面，不请求视频。先绘制文字 / 封面，再为可见首页选择一次视频源；初始深链接先定位模块，不请求Hero视频。首屏可见不足15%或页面隐藏时停止解码，返回自动继续，无暂停按钮。
- 当前首屏不加载 Three.js；旧场景与数字天空素材作为可复用设计保留，未删除。
- 字体在 `src/fonts.css` 使用本地 WOFF2，`index.html` 预加载首屏三组字体，生产URL与CSS一致。首屏标题、介绍、CTA 在 `Hero.tsx` 修改，公告与三项导航在 `Header.tsx` 修改；个人资料与其余模块仍读取原数据配置。
- 动画主要使用 transform / opacity，指针状态通过引用更新，不每帧触发 React 重渲染。Particles / Dither 指针测量合并到既有绘制帧；粒子DPR1、骷髅上限1.5且不分配深度缓冲。开场结束即移除专用scroll监听，保留共享插件。
- GSAP 统一管理首屏与章节入场，逐次播放后清理变换和临时 will-change；图片遮罩仅入场阶段使用。桌面当前最多三张项目图使用 scrub，手机取消图片 scrub 并缩小位移。过滤项目独立重建 context，避免旧节点与动画累积。实时减少动画会恢复内容并移除本动效的 triggers，资源加载失败显示完整原文。
- About、Projects、Skills、Competitions 的章节标题使用 React Bits StrokeText：描边后填充，进入视口播放一次；减少动画时显示原文。修改文案用 `SectionTitle` 的 `text`，换行使用 `\n`，字号仍由章节样式控制。官方来源、包装层与性能处理见 `docs/STROKE_TEXT.md`。
- About 终端上方新增 DitherVeil 骷髅数字肖像：桌面鼠标揭示原图、点击扩散；手机、减少动画及 WebGL 失败使用静态图。素材与配色在 `src/data/portrait.ts` 替换，位置 / 高度在 `SkullPortrait.tsx` / `.css` 修改。生成提示词、官方来源与安全适配见 `docs/DITHER_VEIL.md`。
- Hero 以下全部内容共享 React Bits Particles 背景，200 个白色粒子，设置在 `src/data/particles.ts`；单个视口大小的 Canvas，不拦截导航、终端、项目和组队操作。初始首屏不加载，后续内容桌面可见时默认播放；手机、减少动画和 WebGL 故障静态降级。方案与验证见 `docs/CONTENT_PARTICLES.md`。
- 桌面最高版心 1700px，手机简化图形；焦点可见、跳过导航、原生表单与 dialog、终端输出提示已实现。
- 当前主 JS 约 136.35 KB gzip，已不包含旧场景包；GSAP / ScrollTrigger 共享懒加载包约 45.16 KB gzip，统一编排约 3.14 KB gzip，中文描边约 2.18 KB gzip。非减少动画模式在开场时加载共享包，描边复用；初始减少动画不加载编排。DitherVeil场景约8.80KB gzip，OGL共享图形包约12.85KB；粒子场景约3.15KB；ParticleText仅交互时加载约3.27KB；DriftWall近图片墙加载约2.51KB，以上不含图片资源。
- 身份卡使用完整640px WebP约27KB，原1080px JPG保留；图片墙六种缩略图总计约77KB。资源体积、冷缓存请求、WebGL / 滚动 / GSAP审查与实测限制见 [性能审查记录](docs/PERFORMANCE_AUDIT.md)。
- 60 FPS 是优化目标，实际受设备和浏览器影响。测试报告不代表所有硬件的性能保证。

## 发布前

首屏排版、素材提示词与替换方法见 `docs/HERO_DESIGN.md`。

继续补充真实项目、截图与参赛经历；头像、具体技术工具、合作时间和 GitHub 可按意愿提供。检查所有链接，后续修改身份时同步更新 `index.html` 标题 / 描述。静态主机可部署 `dist/`，本版本不需要服务端。第一阶段交付为本地源码与预览，未部署公共站点。当前已启用邮箱入口，生成邀请后由访客邮件客户端发送，网站不自动投递。

当前体验、决策与验证记录见 `docs/ENGINEERING.md`、`docs/VALIDATION.md`。设计与实现参考 [React Three Fiber 官方文档](https://r3f.docs.pmnd.rs/getting-started/introduction)、[Tailwind Vite 官方接入说明](https://tailwindcss.com/docs/installation/using-vite)、[Motion 减少动画说明](https://motion.dev/docs/react-use-reduced-motion)。
