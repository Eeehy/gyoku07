# DriftWall 数字视觉图片墙（2026-10-09）

## 需求与工程分析

用户要求删除 `#gallery` 中的整块照片木马、标题与照片，替换为 React Bits DriftWall JS-CSS，并选择合适的新图片。当前为配置驱动的 React / Vite / TypeScript 单页，区域由 App 在 About 与 Projects 之间组合；个人资料、项目详情与组队流程不受影响。

修改仅涉及此区域的包装组件、视觉数据、官方组件和网站素材。主要风险是持续 RAF、重复图片形成无效焦点、静态模式加载过多重复图、资源缺失和深色素材被官方 dim / overlay 进一步压暗。无需调整核心架构、路由或后端。

Architect 评估采用独立 VisualWall 包装：保持锚点和外置项目链接；墙面作为纯装饰，重复 tiles 不生成键盘操作或假链接；移动端、粗指针与减少动画采用六张静态图；可见性驱动 RAF。官方默认无悬停暂停，修复原实现即使 pauseOnHover=false 仍冻结被悬停列的问题。Tester 只读审查通过，浏览器验证单独执行。

## 来源与安装

- [官方文档](https://reactbits.dev/components/drift-wall)
- [JS-CSS registry JSON](https://reactbits.dev/r/DriftWall-JS-CSS.json)

已实际获取 registry 并读取全部源码；`dependencies` 和 `registryDependencies` 均为空，无需新增 npm 包或修改 shadcn 配置。原始 JS / CSS 逐字归档 `docs/vendor/DriftWall.original.jsx`、`DriftWall.original.css`。运行组件在 `src/components/react-bits/DriftWall.jsx`，TypeScript 声明为同目录 `.d.ts`。

## 新素材与配置

`src/data/driftWall.ts` 中的 `driftWallImages` 是六种素材，`driftWallItems` 是墙面顺序。墙面补充前四项形成十项序列，保证五列各有两种画面；不是新增十个个人项目。静态网格仅显示六种素材一次。

| 素材 | 来源与真实状态 |
| --- | --- |
| `public/images/drift-wall/portfolio-hero.webp` | 独立浏览器截取本站实际 Hero，包含已接入的首屏视频画面 |
| `digital-lab.webp` | 本站实际数字实验室项目预览截图 |
| `ai-concept.webp` | 本站 AI 知识助手的概念界面截图，不代表已完成该项目 |
| `collab-concept.webp` | 本站协作工作台的概念界面截图，不代表已完成该项目 |
| `digital-horizon.webp`（同drift-wall目录） | 本项目既有数字天空视觉素材的缩略图 |
| `skull-portrait.webp`（同drift-wall目录） | 本项目既有生成式骷髅雕塑视觉实验缩略图，不是个人头像 |

截图不包含浏览器工具栏。2026-10-10性能审查将六种运行图转为最长边600px（骷髅400px）的WebP，总计76,622字节，原图保留；不请求旧大图、Picsum / Unsplash或示例站点。静态网格明确标注概念与视觉实验；动态墙下方标注「数字视觉与界面概念」，真正项目内容通过「查看项目」跳转。体积与生产解码验证见 [PERFORMANCE_AUDIT.md](PERFORMANCE_AUDIT.md)。

用户指定参数保持：columns=5、tileWidth=200、tileHeight=132、gap=18、tilt=16、turn=-14、perspective=1200、depth=120、speed=42、direction=up、variance=0.45、parallax=0.6、lift=64、fade=0.6、dim=0.55、overlayColor=#060010。桌面舞台高度600px。因本站素材本身偏暗，包装 CSS 将未悬停图像的 brightness 调为1.65，悬停恢复1；dim、淡出与官方空间参数保留。

更换素材：将优化后的文件放入 public/images，修改 `driftWallImages` 的 image / title 即可。条目为视觉素材，不添加假履历。若改变数量，检查五列分配和静态布局。无需添加 href；真正可操作的项目入口独立保留。

## 运行适配与删除范围

- `VisualWall.tsx/.css`：近视口懒加载，实际入屏和 document visibility 控制 enabled，静态网格、错误边界与外置可访问链接。
- 官方运行 JS：增加 enabled / decorative / fallbackSrc；停用时不调度 RAF，恢复时重置上一帧时间；hover=false 时各列继续；指针位于间隙释放高亮；无 href 的 div 不作为假按钮；图片占位只尝试一次。
- 原 CSS 布局 / mask / lift 保留。指针不移动时高亮 tile 会随墙漂移，下一次指针移动或离开更新状态，沿用官方命中策略。
- `App.tsx` 只替换区域 import 与组件。旧 PhotoGallery.tsx / CSS、gallery.ts、CircularCarousel.jsx / CSS / d.ts 删除；旧原版 JS 归档与历史说明保留。
- 仅删除 `public/images/gallery/photo-01.jpg` 至 photo-06.jpg 六个网站副本，删除前检查路径处于项目内。用户微信附件原件未修改。
- 原画廊标题与弹窗一起移除；其它四组 SectionTitle / StrokeText 和项目 ParticleText 保留。

## 验收与限制

TypeScript / Vite 构建与独立 Chrome 测试通过：五列600px、配置、六种资源加载、持续漂移、hover 不停、提亮 / 抬升与指针视差、移出释放、项目跳转、无隐藏焦点、区域 axe 无违规。离屏 / 模拟 document.hidden 后 transform 写入停止，返回恢复；实时 reduced 切为静态，恢复仅挂载一组五列。320 / 390 / 958 / 1920px 无横向溢出，手机不请求 DriftWall 模块；图片请求失败使用本地占位且无重试循环；页面异常为0。桌面与手机截图已实际查看。

测试为本机独立 headless Chrome，hidden 用受控可见性事件模拟；未代表用户浏览器真实后台调度、设备 GPU、持续60FPS或屏幕阅读器实机验收。页面无新增手动暂停控件。构建拆分的 DriftWall 约2.51KB gzip，纯 CSS 3D / RAF，不新增 WebGL 场景。
