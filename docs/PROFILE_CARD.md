# ProfileCard 身份卡（2026-10-09）

## 工程分析与架构决策

用户提供方形卡通头像，要求接入 React Bits ProfileCard JS-CSS。项目为 React / Vite / TypeScript 配置驱动单页，About 左列原为小头像身份、简介、方向与数据，右列为骷髅视觉和终端。仅替换左侧小身份块，新增 DeveloperProfileCard 包装，不改变项目、履历、组队表单和其它模块。

Architect 审核确认保持现有结构，身份从 profile 读取，视觉配置独立。主要风险：官方尺寸基于 svh，可能超出列宽；方图可能被上下文字覆盖；document.hasFocus 会造成 RAF 常驻；root CSS 变量和 avatar 类可能影响已有样式；手机 touch-action:none 阻止滚动；mini avatar 失败后重试同一地址；CSS 光纹需要单独处理离屏和减少动画。

采用 width:100% / max340px / 官方宽高比的局部身份卡，正方形头像在姓名和底栏之间完整显示。官方原版归档，运行版做生命周期和资源降级修复；包装层控制 JS 与 CSS。Tester 只读审查发现快速重入会留下旧 leave RAF，已在 pointerenter 取消。

## 官方来源与依赖

[文档](https://reactbits.dev/components/profile-card)、[JS-CSS registry](https://reactbits.dev/r/ProfileCard-JS-CSS.json)。已获取实际 registry、阅读完整源码并安装到项目；dependencies 和 registryDependencies 均为空，无需新增 npm 包或修改 shadcn 配置。

原版逐字归档 `docs/vendor/ProfileCard.original.jsx` 与 `ProfileCard.original.css`。运行组件在 `src/components/react-bits/ProfileCard.jsx/.css`，同目录 `.d.ts` 提供 TypeScript props。

## 内容与素材

- 当前 `src/data/profile.ts` 的 avatar 配置为 `/images/eeehy-avatar.webp`，640×640 / 26,620 bytes；2026-10-10性能审查仅缩放与编码，完整构图不裁切。原1080×1080 / 141,141 bytes JPG副本保留，微信附件原件未修改。DPR2视觉、实际请求与图片解码已检查，见 [PERFORMANCE_AUDIT.md](PERFORMANCE_AUDIT.md)。下方原1080图片验收为早期接入记录。
- 姓名为 Eeehy / **琳，身份为软件工程 · 大二，组队状态读取 openToTeam。2026-10-10 已按本人要求隐去学校；university空值不产生多余分隔符。@Eeehy 只展示个人代号，不假装提供 GitHub 入口或实时在线状态。
- `src/data/profileCard.ts` 管理蓝紫 innerGradient、淡蓝背光、本地代码纹样、无 grain 和头像缺图路径。保留用户指定 innerGradient，配合全站淡蓝色。
- `public/images/profile-code-pattern.svg` 为本地代码符号纹样，不请求缺失的示例 iconpattern.png。`avatar-unavailable.svg` 为明确的缺图占位。
- 联系入口为真实 `mailto:eehye59@gmail.com?subject=…`，按钮以原生链接实现，可键盘激活，点击区域至少44px。打开访客邮件客户端草稿，由访客发送；不自动发送。邮箱清空时导航到真实 #team。

## 运行版适配

- JS 删除 document.hasFocus 常驻条件，只在尚未收敛时续 RAF；dt 上限50ms，首次入场一次。
- enableTilt 关闭时清理 engine / leave RAF / enter timer，重置中心与 active / entering；快速重入取消旧 leave 检查，避免旧状态影响新交互。
- 默认 avatar 使用本地占位，icon / grain 默认空；主头像和 mini avatar 失败仅尝试一次占位，二次失败隐藏图像但保留布局。mini avatar alt 为空，避免重复朗读。
- CSS root 变量改为 pc-card-wrapper 局部；原 avatar 类改为 pc-avatar，避免已有80px头像样式影响；touch-action 改为 pan-y。
- 局部包装控制卡片尺寸、方图完整空间、文字对比、底栏、44px联系链接及焦点。装饰背光、shine、glare 添加 aria-hidden。
- 靠近视口才加载官方组件；JS 仅桌面细指针、实际入屏、页面可见且非 reduced 时启用；手机禁止传感器。CSS 光纹同样仅此状态循环，其它状态静态，无新增暂停控件。
- 组件加载失败显示可读的原生头像身份卡，保留真实联系链接。近视口 / visibility observer 和媒体监听卸载清理。

## 验证与限制

TypeScript / Vite 构建通过。独立 Chrome 41项检查通过，页面无异常 / baseline console 警告；身份卡 axe 无违规。实际截图查看确认完整方图、姓名和底栏不重叠，颜色和布局符合现有页面。

验证桌面倾斜、光纹、鼠标和键盘激活、清晰焦点、44px点击区域、静止后无 JS style 写入；离屏和模拟 hidden 同时停止 CSS 与 JS，恢复正常；实时减少动画禁用倾斜和光纹。320 / 390 / 958 / 1920px 无页面溢出，手机为 pan-y、无 orientation 监听，头像不被底栏遮住。模拟头像失败后两处均使用本地占位，未发生重试循环；首页不请求组件，没有示例资源请求。

邮件测试拦截实际唤起客户端，仅验证真实 href 及鼠标 / 键盘激活，不发送邮件。hidden 使用受控 visibility 事件，手机为浏览器触摸模拟；不代表真实手机传感器、邮件客户端、设备 GPU、持续帧率或屏幕阅读器实机验收。新组件 JS 约2.52KB gzip、CSS约2.58KB gzip，无新依赖。
