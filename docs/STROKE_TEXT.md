# 章节标题描边动画

## 项目分析与架构决策

用户选中 About 标题「保持好奇，持续构建。」并要求给这类章节标题接入 React Bits StrokeText 的 JS-CSS 版本。当前 React / TypeScript 页面通过原生 h2 展示标题；已有滚动揭示、中文换行、实时减少动画媒体查询。修改范围限定为 About、Projects、Skills、Competitions，不改变 Hero、Team Up 与 Contact 的巨型排版或个人数据。

风险是官方单行 SVG 的默认宽度缩放会改变原有字号；中文换行、文字语义和失败降级不能交给装饰 SVG。Architect Agent 评估采用局部包装层，保持官方源码与项目 TypeScript 检查。

## 官方来源与依赖

- 文档：https://reactbits.dev/text-animations/stroke-text
- 注册文件：https://reactbits.dev/r/StrokeText-JS-CSS.json
- `src/components/react-bits/StrokeText.jsx` 和 `StrokeText.css` 与下载的注册源码内容一致，未改动官方文件。
- 安装注册文件列出的 `gsap@^3.13.0`，由 package.json / package-lock.json 管理；独立 `StrokeText.d.ts` 提供类型，不启用全局 allowJs。

此处直接取出注册文件中的源码到本地组件目录，未引入 shadcn 的额外配置或 CLI 依赖。

## 包装层与显示配置

`SectionTitle.tsx` 保留可选择的 DOM 原文和 h2 语义；通过 DOM Range 获取实际中文行位置，支持自动换行和 `\n` 手动分行。等待字体就绪，使用 ResizeObserver 测量布局。`StrokeTitleEffect.tsx` 用原生 viewBox 尺寸校准装饰 SVG，避免组件默认满宽缩放；装饰层 aria-hidden，不重复朗读标题。

效果参数沿用 drawDuration 1.6、fillDelay 0.2、stagger 0.05、power2.out、wipe、strokeWidth 1.4。描边为 `var(--accent)` 淡蓝，填充为现有正文色；fontSize、fontWeight、letterSpacing 读取原章节样式，不使用演示的 128px / 800 / -4 破坏版式。

章节进入视口后按需加载组件和 GSAP，使用 `trigger="mount"` 播放一次。约 3 秒后卸载装饰，恢复原 DOM。再次滚动不会重播；播放中发生实际布局变化或开启减少动画时直接结束，避免窗口调整触发重复动画。微小浮点坐标变化保留 0.5px 容差。

## 性能与失败降级

官方源码会注册 ScrollTrigger，即使使用 mount 模式仍会初始化全局调度。2026-10-09 只有描边使用 GSAP 时，包装层曾关闭闲置插件；2026-10-10 已取消这个全局 disable，因为统一编辑式滚动编排正在使用 ScrollTrigger。描边只清理自身时间线，插件由共享运行时注册，不能从局部组件关闭。官方 JS/CSS 原文仍保持不变。新方案见 `EDITORIAL_MOTION.md`。

加载、渲染或 SVG 测量失败时保留原文；减少动画模式不加载效果。动画不加入暂停按钮，遵循用户现有默认播放要求。

## 实测验证（2026-10-09）

TypeScript / Vite 构建通过。独立 Chrome 会话验证描边偏移、填充裁剪宽度、实际截图、四组标题、技术能力两行、320 / 390 / 958 / 1920px 布局、再次滚动不重播、实时减少动画、组件资源失败和 About 区域 axe 检查。播放中从 1440px 改到 320px 会恢复普通文本，再扩大不重播。

最终生产预览另行确认效果资源按需请求、描边播放、结束后 DOM 原文可见，页面异常与控制台错误为 0。主 JS 403.01 KB / 130.64 KB gzip，独立效果包 118.72 KB / 47.07 KB gzip。

当时使用 rAF / interval 调度记录观察：效果完成并等待 7 秒后，再观察 2 秒，各回调计数均未增加；ScrollTrigger 的 250ms interval 不存在。此为 2026-10-09 的历史结果，新统一滚动编排保留共享插件调度，不再适用“全站无后台调度”的判断。初次全页 axe 扫描遇到其它区域入场中间态的对比度报告；最终检查限定当次修改的 About 区域，无违规项，不作为完整页面重新验收。
