# 历史记录：CircularCarousel（已移除）

2026-10-09 按用户新要求，整个照片木马区域和六张网站照片已移除，替换为 DriftWall。下文仅记录旧实现，不作为当前配置说明；当前入口为 `src/data/driftWall.ts`，见 [DRIFT_WALL.md](DRIFT_WALL.md)。微信附件原件保留，官方原版 JS 仅作为来源历史归档。

# CircularCarousel 照片画廊（2026-10-09）

## 需求与内容状态

在 About 与 Projects 之间新增独立画廊，为个人介绍和工程作品之间留出视觉过渡。用户指定 React Bits CircularCarousel JS-CSS，并要求使用其照片。

已收到用户提供的六张 JPG 照片，并按附件顺序复制到 `public/images/gallery/photo-01.jpg` 至 `photo-06.jpg`。`src/data/gallery.ts` 已配置全部六张，原文件保持不变，合计约 1.08MiB。标题和 alt 仅描述可见场景，不推断姓名、城市、日期或摄影归属。画廊不再显示演示提示；旧本站预览素材保留为未来空数据时的明确演示备选，不与这六张照片混排。

## 工程分析与架构决策

现有 React / Vite / TypeScript 配置驱动单页，在 `App.tsx` 顺序组合页面模块。照片不是项目或参赛记录，独立 `PhotoGallery` 和 `gallery.ts` 避免混入个人经历数据。原生 dialog 放大照片，无需路由或后端。

Architect 评估：位置合理；组件为 CSS 3D，不需 WebGL 或新依赖。主要风险为照片资源尺寸、每张照片前后共 16 个切片的图层成本、预载异步清理和静止时持续调度。保持用户配置，并在包装层提供移动端 / 减少动画静态路径。图片缺失明确占位，避免官方默认外部照片。

## 来源与安装

[官方文档](https://reactbits.dev/components/circular-carousel)、[JS-CSS registry](https://reactbits.dev/r/CircularCarousel-JS-CSS.json)。实际下载 registry 后写入文件，其 `dependencies` 和 `registryDependencies` 均为空，无需增加 npm 依赖，也未修改 shadcn 配置。

原 JavaScript 逐字归档 `docs/vendor/CircularCarousel.original.jsx`，原 CSS 保留在 `src/components/react-bits/CircularCarousel.css`。运行版位于同目录 `.jsx`，TypeScript 通过 `.d.ts` 使用其 props / item 类型。

## 配置与替换照片

将照片放入 `public/images/gallery/`，在 `src/data/gallery.ts` 填写 `galleryPhotos`，例如：

```ts
export const galleryPhotos: CarouselItem[] = [
  {
    src: "/images/gallery/photo-01.jpg",
    alt: "按实际照片填写简短描述",
    title: "按需要填写标题",
    subtitle: "仅填写已确认的地点或说明",
  },
];
```

上例为编辑格式，照片文件需实际存在。数组有内容后自动取消演示素材及提示。建议少量精选照片、适当压缩大图；不截断或删除用户数据。单张图片使用静态浏览，多张图片可构成旋转圆柱。放大框展示同一配置资源。

默认：`preset="cylinder"`、`intro="rise"`、`cardWidth={220}`、`aspectRatio={1}`、`speed={14}`、`captions`。桌面舞台 560px，配色淡蓝；`pauseOnHover=false`，遵循用户默认播放、不加暂停按钮的要求。鼠标拖拽带惯性；左右方向键、Home / End 切换，Enter / Space 放大，Escape 关闭。标题、字幕保持稳定显示，避免自动切换时文字反复淡至不可读。

## 最小运行适配

- 预载图片的 2400ms 超时与回调在卸载时清理；异步取消不更新状态。
- cleanup 清空 `wakeRef` / `measureRef` 并使用 disposed 守卫，防止旧闭包重开循环。
- 修复 off + snap 已对齐时反复设置相同 target 的调度；dialog 打开后停止背景运动，关闭恢复播放与焦点。
- 保留官方离屏 / 文档隐藏停止机制；包装层接近视口时才懒加载。手机、粗指针和减少动画使用横向 scroll-snap 静态列表，不请求 3D 组件。
- aria-live 只发布主动键盘切换的结果，自动播放不持续播报；装饰切片不重复朗读。
- 元数据也进入 itemsKey，修改标题、alt 或说明时更新文案。
- 图片失败使用本地 `photo-unavailable.svg` 明确占位；不替换为外部他人照片。

修改 `App.tsx` 添加一处模块；新增包装组件、局部样式、独立数据、官方组件及类型声明、原版归档和占位资源。没有删除文件、修改核心架构或新增依赖。

## 验证与限制

验证记录见 `VALIDATION.md`。源码审核及 TypeScript / Vite 构建通过。独立 Chrome 验证桌面自动旋转、悬浮继续播放、拖动不误开弹窗、键盘导航、点击放大、Escape / Tab / 焦点恢复、离屏、实时减少动画、320 / 390 / 958 / 1920px 布局及图片失败；画廊区域 axe 无违规项，页面异常为 0。截图已实际查看。

六张照片为竖向构图：旋转卡片保留正方形居中裁切，点击放大使用完整原比例。此次只更新图片资源、画廊数据和文档，没有调整动画组件、个人头像或核心资料。尚未对实体设备做帧率验收；照片数量和分辨率会影响图层与内存成本。官方布局支持多项，建议精选内容，保持既有项目与组队入口清晰。
