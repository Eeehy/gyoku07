# Eeehy 个人技术网站

目标：打造面向大学生竞赛组队的实验性数字名片。当前为第一阶段 MVP，真实项目、截图与竞赛记录仍待补充。

已确认资料：Eeehy（**琳），大二，软件工程专业；宣言「知不足而奋进，望远山而前进」；联系邮箱 eehye59@gmail.com；GitHub 暂不提供，不展示个人主页入口。2026-10-10 本人要求隐去学校，university留空，简介/身份行/页面描述同步移除学校；身份卡及终端在空学校时省略字段与分隔符，不显示学校待补充。姓名保留遮蔽形式，不推断完整信息。

能力与合作：普通比赛中偏综合型，侧重网页前端、框架设计与交互。赛道优先级为 AIGC 等专业赛道 → 数学建模 → 电赛 → 创新创业。不将赛道偏好写为参赛记录，不推断建模、硬件或特定 AI 工具经验。

技术：React 19、Vite 7、TypeScript、Tailwind CSS 4、React Three Fiber 9 / Three.js、Motion、Lucide。只有浏览器端，没有后端或数据库。

启动：在本目录执行 `npm install`、`npm run dev`；生产检查 `npm run build`。

资料：`src/data/profile.ts`、`projects.ts`、`skills.ts`、`competitions.ts` 独立编辑，`portfolio.ts` 统一导出。

关键约束：不编造履历与指标；空联系方式不能生成假链接；组队表单生成草稿，不声称自动发送；移动端与减少动画模式不加载 3D；不把共享 React 依赖手动划入 Three.js 包，避免破坏懒加载。

架构与可复用经验：`docs/ENGINEERING.md`。验证记录：`docs/VALIDATION.md`。内容替换与目录说明：`README.md`。

当前首屏为 Cinematic Editorial：Instrument Serif + Inter、左侧两行标题、用户提供的星空山景背景视频、精简三项导航。视频为本地 H.264 MP4，静音循环播放，离屏 / 页面隐藏时自动停止，减少动画与失败时显示同源封面。资源路径配置在 `src/data/heroMedia.ts`。旧 Digital Horizon 场景保留但不加载。首屏独立样式在 `src/hero.css`，个人数据结构保持不变。设计记录在 `docs/HERO_DESIGN.md`。

最新配色：主强调色淡蓝 `#b8dcff`，悬浮冰蓝 `#e0f0ff`，实心按钮文字深蓝 `#10283f`。保留视频与深色空间，标题、标记、边框、节点统一为蓝色系。按钮的鼠标悬浮与键盘聚焦有颜色反馈，减少动画模式取消过渡。变量集中在 `src/styles.css`，原 `--mint` 为 `--accent` 的兼容别名。

导航：首屏 Header 使用 absolute 融入视频；实际 Hero 底部离开视口后切换 `is-floating`，fixed 顶部 12px（手机 10px），隐藏公告条，显示圆角磨砂玻璃。blur 24px / saturate 160%，手机菜单位于玻璃栏下方。锚点预留导航高度，返回首屏恢复透明导航。

简介新增原创 `SilkText.tsx`：用户已选择原创版本，未接入 React Bits Pro。局部 Canvas2D 丝绸波纹与淡蓝高光，保留 DOM 原文与换行；鼠标 / 轻触反馈；减少动画和失败时显示普通文本。DPR≤1.5（取整误差除外），随浏览器刷新逐帧绘制，离屏 / 隐藏自动停止。用户明确要求动画默认播放、不显示暂停按钮。光标静止后停止循环，导航在初始化 / resize 时缓存 Hero 文档坐标。方案与授权选择见 `docs/SILK_TEXT.md`。

当前交付不涉及上级 AI 系统、配置或全局 Knowledge_Base 的修改。后续优先替换真实资料，再决定公共部署、进一步性能测量和实际比赛合作流程。

章节标题：About / Projects / Skills / Competitions 接入 React Bits StrokeText JS-CSS 官方源码。`SectionTitle.tsx` 保留 DOM 标题与中文换行，`StrokeTitleEffect.tsx` 校准 SVG 原生字号；淡蓝描边与 wipe 填充，入屏一次后卸载，减少动画与失败保留原文。2026-10-10 GSAP / ScrollTrigger 改由统一编排与描边共享，包装层不再调用全局 disable，避免使全站滚动动效失效。旧画廊标题随木马区域移除，其它章节标题效果保留。来源、配置与测试见 `docs/STROKE_TEXT.md`。

About 右列终端上方新增骷髅数字肖像，标注视觉实验。`SkullPortrait.tsx` 包装 React Bits DitherVeil，OGL / 场景懒加载，电脑鼠标揭示和点击扩散；手机、粗指针、减少动画及故障静态降级。原始官方 JS 归档 docs/vendor，运行版补充纹理错误与幂等资源清理。素材由内置 imagegen 生成，本地 WebP 47KB，路径 / alt / 配色在 `src/data/portrait.ts`。资源在离屏 / 隐藏后释放，无暂停按钮；2026-10-10性能审查将DPR上限由2降为1.5、关闭深度缓冲，指针测量合并至已有RAF。原身份和真实头像配置不变。详见 `docs/DITHER_VEIL.md`。

2026-10-10 已将 React Bits Particles 扩展到 Hero 以下全部区域，移除 Team 局部重复场景。ContentParticles.tsx/CSS 包装单个视口大小的 sticky 背景（height100svh、负margin抵消占位、pointer-events:none），App.post-hero-content / foreground 承载原宣言条到Footer，Hero视频保留。200白色粒子和原参数不变，src/data/particles.ts 的 contentParticles 管理；DPR1、OGL已安装、官方源码重新获取与归档匹配。实际入屏才探测/加载，hidden、离屏释放，手机/reduced/失败为共享静态背景。Projects渐变局部透明以显示粒子。IO只读取原生isIntersecting，避免.01阈值浮点误差导致再次进入不恢复。无手动暂停控件。源码、评估、验证与限制见docs/CONTENT_PARTICLES.md。

项目卡片名称使用 `ProjectParticleTitle.tsx` 包装 React Bits ParticleText JS-CSS。仅桌面悬浮或按钮聚焦时挂载 Canvas2D，继承真实 h3 布局与字体，淡蓝高亮，按小字号缩小散开和排斥范围；原文淡化保留可读和语义。离开、离屏、隐藏或减少动画卸载，失败回退。无新增 npm 依赖；原 JS 归档 docs/vendor；参数在 `src/data/projectTitleEffect.ts`。源码、架构评估、验证和限制见 `docs/PARTICLE_TEXT.md`。

About 与 Projects 之间已按用户要求将整个照片画廊替换为 `VisualWall.tsx` / React Bits DriftWall JS-CSS。保留 #gallery 锚点，删除旧大标题、木马、放大弹窗、运行组件 / 数据和六张项目内人物照片副本；微信原始附件未改动。使用四张本站截图 + 既有数字天空 / 骷髅艺术，共六种本地素材，在 `src/data/driftWall.ts` 维护。界面概念不作为真实项目成果。五列 / 200×132 / gap18 / tilt16 / turn-14 / speed42，默认漂移、悬停继续；近视口懒加载，离屏 / 隐藏停止 RAF，移动端 / 粗指针 / reduced 静态六图。官方原 JS/CSS 归档 docs/vendor，无新增依赖。实现与验证见 `docs/DRIFT_WALL.md`。

About 左列小身份块已替换为 `DeveloperProfileCard.tsx` 包装 React Bits ProfileCard JS-CSS。本人1080方形卡通狗头像JPG副本保留，2026-10-10性能审查改为640×640 / 26.6KB的 public/images/eeehy-avatar.webp，profile.avatar已配置，不裁切或修改原附件。姓名、学校、年级和组队状态仍读取profile；@Eeehy是代号，无Github假链接，不显示虚构实时在线。卡片最大340px，头像完整显示，真实mailto链接44px可点击 / 键盘操作。近视口懒加载，桌面细指针可见启用倾斜与CSS光纹；手机、hidden、离屏和reduced静态，禁传感器。官方源码归档、运行版取消hasFocus空转并清理/居中、修复重入检查、图片单次占位、scope变量和pc-avatar隔离；无新依赖。原骷髅/终端/简介/事实数据保留。数据src/data/profileCard.ts；来源、方案、验证见docs/PROFILE_CARD.md。

Projects 与 Skills 之间新增 `MotionStudies.tsx/CSS` 的 `#films` 动态实验，展示用户提供的 Eeehy / Controlled Experiment（15秒）和 Clawd / 嗜好（96秒）。独立 films.ts 配置，不增加真实项目计数。原片不改，生成 H264/AAC faststart 网页版分别5.20MB1080p60fps和16.37MB720p30fps，封面为原视频帧。点击前video无src，仅封面lazy；主动播放保留音轨和原生controls/playsInline，onPlay暂停另一部。焦点转交播放器，AbortError不误报，媒体失败恢复封面/重试/站内视频直链。减少动画仍允许用户播放，无新增Canvas或依赖。Architect/Tester只读审查和独立Chrome验证完成，详见docs/MOTION_STUDIES.md与VALIDATION.md。

2026-10-10 统一编辑式动效：useEditorialMotion 懒加载 motion/editorialMotion，使用已有 GSAP / ScrollTrigger；首屏约3.2秒 Eeehy 标识 / 三片遮幕 / 视频拉远 / 标题遮罩与压缩归位。章节新增 EditorialHeading，英文大字先进入，中文标题与内容随后错峰；项目与影片图揭示，桌面仅项目内层做三组轻微 scrub。旧 Motion / IO 普通入场移除，组件自身特效保留；不变换或裁切 post-hero-content / foreground，单视口 sticky 粒子仍有效。filter独立projectContext整套revert重建，字体 / 布局刷新合并到一帧，generation防异步旧回调。scroll / Tab / 深链接 / 超时 / 失败完成遮幕；实时 reduced 清自己的 triggers并恢复内容。配置motionDesign.ts，源码与验证docs/EDITORIAL_MOTION.md。保留默认播放、真实资料与学校隐藏，不增加依赖或核心架构。

2026-10-10 性能审查：桌面Hero4.03→2.14MB，独立手机 / Save-Data版0.68MB；头像141→27KB，墙面六图350→77KB。React layout effect修正初始深链接定位；仅可见首页延迟250ms分配视频源，选一次不因resize重载；视频可见阈值15%，About仅留边缘时停止解码，回顶默认恢复。Particles / Dither将高频指针测量合并至既有RAF，粒子同尺寸resize跳过setSize；Dither≤1.5、depth=false，DPR2画布像素减少43.75%。opening完成移除专用scroll监听，fonts.css保留九组本地WOFF2、首屏三组preload复用实际URL。不增加依赖 / 手动暂停控件，不更改原附件或核心架构。生产25项功能+9项加载专项和42项编辑动效回归通过；资源、测量、失败路径与真实GPU限制见docs/PERFORMANCE_AUDIT.md。
