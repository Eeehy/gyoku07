# 编辑式开场与滚动编排（2026-10-10）

## Engineering Analysis Report

网站沿用 React / Vite / TypeScript / Tailwind 单页，资料在 data 配置，由 App 组合模块；视频、身份卡、描边、粒子与项目弹窗已有独立生命周期。原入场分散在 Motion 的 Hero / 项目、Experience 的 IntersectionObserver 与章节描边，存在多个系统控制同一节点的风险。StrokeTitleEffect 原有全局 ScrollTrigger.disable 会使新滚动系统失效。

用户要求创意机构式的完整开场、英文巨型章节标题、明显位移与遮罩、错峰内容及图像视差。范围仅显示和动效；不改变履历、项目数据、邮件流程、共享粒子架构或原始媒体。优先级是统一节奏，其次保证快滚、触屏、键盘与失败回退。

主要风险：长开场阻碍访问、过量 scrub 消耗 GPU、GSAP 与悬停争抢 transform、过滤导致旧节点引用累积、布局变化造成触发点失效。需要架构评估统一动画所有权、懒加载策略、动态项目与背景层边界。

## Architecture Decision

Architect 只读评估认可复用现有 GSAP 与单页架构，不需要更换滚动容器或增加依赖。每一层只由一个系统负责；开场有 pending / running / complete 及统一完成入口。标题与内容使用同一局部时间基准，避免同帧触发时卡片先于标题。项目列表独立 context，筛选整套清理；RO / 字体刷新合并到一帧。保留原生滚动，局部遮罩不能包裹 sticky 粒子祖先。

## 实现与可编辑入口

- `src/data/motionDesign.ts`：开场和章节时长、标题领先内容的间隔、stagger、桌面 / 手机位移、缓动与图片视差。默认 power4.out / power3.inOut，无弹跳。
- `src/hooks/useEditorialMotion.ts`：按媒体设置懒加载运行时，generation 取消旧回调，首屏一次开场、初始化超时及故障回退。
- `src/motion/editorialMotion.ts`：统一 GSAP timeline / ScrollTrigger、项目过滤清理、局部焦点访问及布局刷新。
- `src/components/EditorialHeading.tsx` / `src/editorial.css`：英文标题逐行遮罩；文案在 App、Projects、Skills、VisualWall、MotionStudies 对应 JSX 的 text 中修改，换行用 `\n`。原语义中文 h2 保留，装饰英文不重复朗读。
- `Hero.tsx`：约3.2秒开场，Eeehy 标识、三片错位上揭遮幕、背景轻微拉远、两行标题由压缩 / 偏移归位，再接简介与 CTA。
- `Projects.tsx`：卡片入场、图片 shell 一次遮罩、内层 drift 轻微视差、原 cover 指针倾斜三层独立。影片封面仅一次揭示，不添加持续视差或自动播放。
- `Header.tsx` / `Experience.tsx`：移除重复的普通入场，保留浮动玻璃导航、菜单、光标与磁吸。`StrokeTitleEffect.tsx` 不再关闭共享 ScrollTrigger。

初始 CSS 保持可见，只有动态脚本登记 pending 时显示遮幕。慢加载超过1.6秒先恢复页面，运行中超过4.7秒强制完成；滚动、hash 跳转、Tab / 程序聚焦和页面隐藏都可完成开场，不阻止用户滚动。再次回顶不重播；刷新根地址可重看，带模块 hash 的初次访问直接显示该模块。

键盘聚焦会完成所在章节 / 内容组，透明内容仍保留键盘可达性。普通指针聚焦不会强制把祖先动画直接跳到终点，避免 pointerdown 与 pointerup 之间按钮移位。手机缩小标题位移、关闭图片 scrub，静态布局适配320px。

## 性能与资源管理

当前桌面最多三张项目图做轻微 scrub；文字和卡片入场仅一次，结束移除临时 transform / opacity / will-change。不新增 WebGL 或 Canvas，不在每帧 setState；图片 clip-path 只在入场阶段使用。项目筛选 revert 独立 context 后重新创建，不在根 context 里无限追加；WeakSet 记录已完成元素，不强引用移除的 DOM。

实时减少动画撤销本编排的 timeline 与 triggers，恢复原文；初始减少动画不请求编排模块。共享 ScrollTrigger 内部调度仍可能存在，不能由描边组件全局 disable。各原组件继续按自己的离屏 / hidden 策略管理视频、粒子、图片墙与 Canvas。

构建主 JS136.19KB gzip；GSAP / ScrollTrigger 共享懒加载包45.16KB gzip，统一编排3.12KB，描边2.18KB。相比旧描边按章节才加载，共享包现在正常模式在开场加载；保留了初始 reduced 不加载的路径。

## 验证与限制

TypeScript / Vite 构建通过。独立 Chrome 验证42项：完整开场和干净终态、实际标题变换、终端与学校隐藏、单共享背景 Canvas、懒加载描边不禁用滚动插件、卡片倾斜与图片遮罩恢复、项目 dialog / Escape、三轮筛选无脱离 DOM 的 trigger 且只有三组 parallax、全部章节、表单焦点与局部 axe、回顶不重复开场、实时 reduced / 恢复、320 / 390 / 958 / 1920px 无溢出、手机无 scrub、快滚、深链接与运行时加载失败。基准页面异常、控制台警告 / 错误均0。

另一个纯键盘会话：首次 Tab 完成开场，40次 Tab 到达组队姓名输入，没有聚焦在不可见的动画组；无页面异常。最终受控性能观察在 #projects 稳定后1.803秒：本编排节点 style 写入0、布局0次，整页 ScriptDuration 增量5.49ms。六次滚轮与等待合计5.117秒：整页 script46.30ms、layout47次、style88次，包含原有标题、背景、媒体和其他组件，不能当成本次新增动效的独立成本或帧率。

生产预览6项检查通过：共享分包实际加载、项目大标题完成、项目弹窗 / Esc、点击导航后表单聚焦可见、页面异常及控制台警告 / 错误0。此轮发现固定120ms的指针保护会误拦点击后的程序聚焦，改为仅 pointerdown 到 pointerup / cancel 期间保护；Tab同样解除，开发与生产回归均通过。

截图实际查看了开场中间态、Hero、About、项目与手机布局。Tester只读复审无必修项。上述为隔离 headless Chrome / SwiftShader 和模拟屏幕；不代表真实 GPU 持续60FPS、所有移动浏览器或完整屏幕阅读器验收。长按时正常动画仍会移动目标，需要后续真机体验观察。

参考：[GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)、[GSAP 媒体查询与清理](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/)。实现采用现有原生媒体 hook + context，无新依赖。
