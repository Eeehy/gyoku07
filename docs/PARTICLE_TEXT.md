# 项目名称的 ParticleText（2026-10-09）

## 需求与范围

为 Projects 卡片名称加入鼠标悬浮粒子聚合与排斥效果。真实 `h3`、项目名称、卡片比例、筛选和详情按钮继续由原组件提供；不修改个人资料、其它章节标题或弹窗标题。

来源：[React Bits 文档](https://reactbits.dev/text-animations/particle-text)、[JS-CSS registry](https://reactbits.dev/r/ParticleText-JS-CSS.json)。读取实际 registry 内容后直接写入对应源文件，未执行 shadcn 命令。registry 的 `dependencies` 是空数组，不需要额外安装依赖。官方 JavaScript 原版归档于 `vendor/ParticleText.original.jsx`，原版 CSS 位于 `src/components/react-bits/ParticleText.css`。

## 项目分析与架构决策

现有项目为配置驱动 React / Vite / TypeScript 单页，`Projects.tsx` 读取 `src/data/projects.ts`，使用原生 dialog 展示详情。官方演示面向大标题，包含最小 240px 容器和常驻 Canvas2D 循环，直接使用会破坏卡片比例并增加后台绘制。

Architect 评估：局部包装保留真实标题，以装饰画布提供反馈，按实际 DOM 换行和字体定位。使用字号缩放运动幅度，避免 180px 散开侵入封面与标签。中文细笔画需要密集采样，同时保留淡化原文以承载辨识度。无需路由、全局状态或核心架构调整。

## 文件与参数

- `ProjectParticleTitle.tsx` / `.css`：只用于项目卡片名称。桌面悬浮或按钮聚焦时懒加载效果；原文字一直存在，所有画布首帧成功后淡化到 58%。Canvas 层 `aria-hidden`、不拦截点击、不增加焦点。
- `react-bits/ParticleText.jsx` / `.d.ts`：使用官方 Canvas2D 算法，增加 ready/error、按钮交互引用、字距、左对齐定位，以及异步卸载保护。按时间差平滑跟随，适应不同刷新率。
- `src/data/projectTitleEffect.ts`：白色粒子、淡蓝高亮 `#b8dcff`，粒子 1.2px、采样间隔 2px；聚合 1600ms、错峰 420ms、漂移 0.7、hover 与 glow。
- 字体和字重继承标题（当前桌面 25px / 500，手机 22px）。散开幅度为字号 × 0.65，排斥强度 × 0.3，半径 × 1.5，替代大型演示的 180 / 40 / 120。
- `Projects.tsx` 仅将原项目 `h3` 替换为包装组件，数据和查看详情逻辑保持原样。没有删除文件，没有新增 npm 依赖。

DOM Range 测量每行文字、位置和尺寸，画布按行定位。布局改变时统一刷新挂载版本，防止沿用旧行导致 readiness 不完整。画布 DPR 保持官方最大 2；每帧只更新绘制，不触发 React 重渲染。双事件状态允许 hover 与 focus 同时存在。

## 降级与生命周期

没有悬浮和焦点时不挂载效果，也不启动标题绘制循环。离屏、页面隐藏、手机 / 粗指针、实时减少动画时卸载画布。普通文本不依赖效果模块、字体采样或 Canvas 成功。异步字体加载在卸载后不会开启循环；采样、初始化和绘制失败恢复原文。没有新增暂停按钮。

## 验证与限制

TypeScript / Vite 生产构建通过，ParticleText 单独懒加载约 3.27KB gzip。独立 Chrome 会话验证三张卡片实际像素绘制、聚合后截图、离开恢复、无标题尺寸改变、鼠标点击与键盘 Enter 打开正确详情、Escape 关闭、实时减少动画、离屏卸载、320 / 390 / 958 / 1920px 布局。项目卡片区域 axe WCAG 2 A / AA 和 2.1 AA 无违规项；页面异常为 0。

追加窗口缩放、8 次快速 hover、退出后无持续绘制、Canvas2D 失败回退和字体延迟卸载检查通过。短时调度中位数 16.7ms、P95 16.8ms，属于独立 headless Chrome 的观测。详细测试记录在 `VALIDATION.md`。测试截图保存在交付目录的 `nexus-particle-title-preview.png`。无真实硬件 60 FPS 保证，中文字体在不同设备上的栅格化会有差别；未来项目长标题应按实际内容复查换行。
