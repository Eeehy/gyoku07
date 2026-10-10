# 骷髅数字肖像 / DitherVeil

## 范围与架构评估

用户要求接入 React Bits DitherVeil JS-CSS，并将图片换成骷髅形象、由开发者选择位置。新增在 About 右列、终端上方，独立标注「视觉实验」。身份数据与头像配置保持原样，骷髅不作为真人照片或个人经历。

Architect Agent 审核接受独立局部画布与静态降级，指出 WebGL2、DPR、触屏空闲、正常 loseContext 与初始化失败清理风险。实现沿用现有媒体查询和页面可见性 Hook，不改变核心架构或引入后端。

## 来源与安装

- 文档：https://reactbits.dev/animations/dither-veil
- 官方注册源：https://reactbits.dev/r/DitherVeil-JS-CSS.json
- 安装官方列出的 `ogl@^1.0.11`，记录在 package.json 与 lockfile。
- 注册源码先完整取出到本地；CSS 原样，官方原始 JS 原样保存在 `docs/vendor/DitherVeil.original.jsx`。
- 运行组件 `src/components/react-bits/DitherVeil.jsx` 在官方基础上增加局部安全处理：`onError` 回调、内部图片 onerror、shader link 检查、初始化 / 帧 / resize 异常捕获，以及正常卸载和异常路径共用的幂等 cleanup。绘制、抖动、揭示与点击扩散算法保留。
- `DitherVeil.d.ts` 为 JS 组件提供类型，不启用全局 allowJs。

Tester Agent 指出官方内部图片失败会留下黑色画布，以及初始化末尾报错可能残留监听和 observer。上述改动针对已审查的异常路径；清理按资源创建顺序登记，直接释放 renderer，避免在 DOM 移除后才查询 canvas。

## 配置与内容替换

`src/data/portrait.ts` 管理本地素材、alt、标签和颜色。当前 `public/images/skull-portrait.webp` 是 768×768、47,010 字节的 WebP。更换图片只需修改路径和 alt；真实头像仍由 `profile.avatar` 独立管理。

`SkullPortrait.tsx` 放置与管理效果；`SkullPortrait.css` 控制画布高度与排版。配置使用 Floyd、2px、softness 0.6、linger 1、点击扩散，颜色适配现有 `#08090d` / `#b8dcff`。约 300px 的窗口使用 revealRadius 160，避免示例 600px 容器的 200px 半径在这里完全覆盖主体。默认 wander=false，入场正常播放，无暂停按钮。

## 性能与降级

距视口 120px 时加载本地图片，解码完成、细指针桌面与 WebGL2 检查通过才懒加载 OGL / DitherVeil。离屏 200ms 后或页面隐藏时卸载并释放上下文；回到视口会重新初始化，200ms 延迟避免边界抖动。

手机、粗指针、减少动画模式使用静态原图。WebGL2 不可用、上下文丢失、纹理 / shader / 初始化失败回退原图；本地原图加载失败显示轻量骷髅轮廓，保留说明。正常卸载触发的上下文丢失不标记为故障。

2026-10-10 性能审查将运行版 `maxPixelRatio` 默认设为1.5，并关闭不需要的深度缓冲；原官方归档不变。DPR2实测CSS590×330、buffer885×495，鼠标揭示和2px逻辑点阵保留。move只记录最新坐标，在已有RAF中读取布局，点击立即校准。指针停留在窗口内仍持续绘制，这是实时揭示行为；移出后余迹衰减结束便停止。没有覆盖全局DPR或添加暂停按钮。当前审查与验证见 [PERFORMANCE_AUDIT.md](PERFORMANCE_AUDIT.md)；下方为早期接入测试记录。

## 素材生成记录

使用内置 imagegen，非 API / CLI 模式。项目素材保存于 `public/images/skull-portrait.webp`，先生成方形原图，再仅做网页尺寸缩放与 WebP 编码。提示词：

> Use case: stylized-concept. Create a refined 3D skull portrait asset for Eeehy's experimental software engineering portfolio. One intact human skull as a polished pale ceramic digital sculpture, jaw closed, nearly frontal with a very subtle three-quarter turn. Elegant, calm, non-gory. Skull centered, occupies roughly 72% of square canvas, complete crown and jaw uncropped with spacious margins. Pure deep charcoal background #08090d, no horizon, no extra objects. Soft icy pale-blue studio lighting #b8dcff from upper left, gentle rim light, deep eye sockets, beautifully sculpted cheekbones and teeth, restrained high contrast for later Floyd-Steinberg dithering. Smooth physically lit surface, photorealistic premium studio render, no neon glow, no text, no letters, no frame, no pre-applied halftone/dithering. Square 1024x1024 composition. Save the generated asset as a local file if supported.

## 验证（2026-10-09）

TypeScript / Vite 构建通过。独立 Chrome 软件 WebGL2 会话验证真实点阵画面、鼠标像素变化、点击扩散、移出后停帧、离屏卸载与单画布重建、DPR 2、减少动画实时切换、上下文丢失、WebGL 不可用、图片失败、320 / 390 / 958 / 1920px 无横向溢出，以及肖像区域 axe 无违规项。

异常注入验证内部纹理图片失败、shader 初始化失败、初次 layout 失败均恢复静态图；layout 失败后两个已创建 observer 计数归零。模拟 visibilitychange 验证隐藏卸载、恢复单画布，未冒充真实后台标签页设备测试。最终生产版本另外验证按需加载、实际揭示、离屏释放与恢复，页面异常与控制台错误为 0。

主包 406.42 KB / 131.72 KB gzip；独立效果包 68.68 KB / 21.25 KB gzip。软件渲染验证不代表所有实体设备的帧率保证。未声称本次完成全部页面的可访问性复验。
