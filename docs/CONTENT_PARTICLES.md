# Hero 以下共享 Particles 背景（2026-10-10）

## 工程分析与架构决策

用户要求把 React Bits Particles 应用到首屏以下的全部区域。现有 App 为 Hero → 宣言条 → About → 图片墙 → Projects → Skills → Competitions → Team Up → Contact。此前仅 Team Up 使用200白色粒子，OGL依赖和官方运行版已有资源清理。个人资料、项目和表单数据不变。

Architect 评估使用一个视口大小的共享背景，避免每个章节创建一个 WebGL 场景，也避免生成数千像素高的 Canvas。App 的 Hero 后新增 post-hero-content，内部单一 sticky 粒子层和 z-index:1 的内容层。sticky height 与负 margin 都为100svh，抵消占位；外层不设置 overflow 或 transform，原滚动动画仅作用于前景。鼠标事件来自内容包装，但坐标仍按 Canvas 的视口矩形计算。

风险为透明背景遮挡关系、sticky 的定位环境、首次加载时机、重复 WebGL 与生命周期、锚点和表单。Tester 只读审查发现 Projects 原不透明渐变会遮住粒子，已在共享样式中局部改为透明度渐变，项目卡自身背景保留。

## 官方源码与依赖

已重新获取并读完 [JS-CSS registry](https://reactbits.dev/r/Particles-JS-CSS.json)，对应 [文档](https://reactbits.dev/backgrounds/particles)。dependencies 为 ogl@^1.0.11，项目已安装ogl1.0.11，无新增依赖。此次获取的 JS 与 docs/vendor/Particles.original.jsx 完全一致，另归档原始 CSS 为 Particles.original.css。继续使用 src/components/react-bits/Particles.jsx 中已有的官方适配版：ResizeObserver、错误回调、鼠标事件独立来源、delta限制和幂等资源释放；不重新覆盖这些修复。

## 修改范围

- TeamParticles.tsx / CSS 重命名为 ContentParticles.tsx / CSS，复用原包装与降级逻辑。
- App.tsx 只新增共享内容包装和单一场景；TeamInvite.tsx 移除局部粒子调用及无用 section ref。其它模块保留。
- src/data/particles.ts 的 teamParticles 改名 contentParticles，参数不变：白色、200粒子、spread10、speed0.1、baseSize100、hover移动、alphaParticles=false、disableRotation=false、pixelRatio1。
- 内容层覆盖宣言条、About、DriftWall、Projects、Skills、Competitions、Team Up、Contact及其Footer。背景层 pointer-events:none / aria-hidden，不生成焦点项。
- 舞台 sticky top0 / height100svh / margin-bottom:-100svh，缓慢旋转和鼠标视差默认播放，无暂停按钮；Canvas内部分辨率为实际视口乘DPR1，不随文档长度放大。背景整体透明度0.45，手机静态点阵0.35。
- 首次 WebGL 探测和模块加载以实际 inView 为门槛，初始Hero不加载粒子；离开后清理，回来重建。可见性 observer 使用 threshold:0.01，通过原生 isIntersecting 判断，避免额外浮点比较。
- 页面隐藏、手机/粗指针、减少动画、WebGL不支持和故障使用静态背景；动态Canvas存在时隐藏静态点阵，避免两种亮度叠加。

## 实测问题与可复用经验

2026-10-10性能审查追加：move handler仅保存最新坐标，在既有绘制RAF中读取容器布局，未新增循环；同一任务100次move实测仅1次rect测量。same-size resize跳过setSize，DPR1、200白色粒子和默认旋转不变。显式antialias=false与原OGL默认一致，不作为新增性能收益。当前生产验证见 [PERFORMANCE_AUDIT.md](PERFORMANCE_AUDIT.md)，下方为早期接入记录。

第一次回归发现回到Hero再点About时背景没有恢复。记录原生 observer 显示 entry.isIntersecting=true，而 intersectionRatio 为0.009999999776482582；重复手动检查 >=0.01 得到false，后续又没有新阈值事件。已去掉重复比较，依赖 observer 已配置的threshold与原生isIntersecting。回归验证初始Hero不加载、返回释放及重入恢复。

共享背景的父层不应设置会改变 sticky 环境的 overflow/transform。后续加入不透明 section 背景时，需要检查是否遮住共享粒子；卡片和表单保留独立不透明底色，以保证内容可读。

## 验证与限制

TypeScript/Vite构建通过。独立Chrome使用SwiftShader的55项验证通过：首次Hero无粒子Canvas/模块请求且视频保留；布局高度和内容起点不增加；实际WebGL绘制200粒子；About/图片墙/Projects/Skills/Competitions/Team/Contact逐个验证同一Canvas引用和视口尺寸；默认播放、背景不拦截输入。终端命令、技能选择、项目Dialog打开/Escape关闭、组队表单本地草稿及真实邮件入口正常。

隐藏页面释放且停止绘制，恢复只有一个场景；实时减少动画显示静态点阵；返回顶部释放背景并恢复视频，About导航再次恢复。958/1920px无溢出且buffer随视口调整；390/320px为共享静态背景，不请求Particles。WebGL不可用和context lost均回退，不无限重建；装饰层axe无违规，页面异常和baseline失败请求均为0。项目区、Contact和手机截图已实际查看。

以上为本机隔离的headless Chrome，WebGL使用软件渲染，页面隐藏为受控事件；没有发送邮件。不能据此保证真实GPU、实际浏览器后台调度或全站持续60FPS。后续性能测量应包含About已有骷髅、DriftWall和其它交互；这里的“单场景”仅指共享粒子背景，并非声称全页只有一个Canvas。
