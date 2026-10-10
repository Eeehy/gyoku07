export type Project = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  status: string;
  description: string;
  stack: string[];
  role: string;
  challenge: string;
  outcome: string;
  cover?: string;
  github?: string;
  demo?: string;
  isDemo: boolean;
  visual: "ai" | "space" | "flow";
};
export const projects: Project[] = [
  {
    id: "nexus",
    title: "Eeehy / 数字实验室",
    subtitle: "把个人网站变成第一个技术作品。",
    category: "Creative development",
    status: "MVP",
    description:
      "面向大学生竞赛伙伴的个人介绍与作品展示网站。用可操作的终端、3D 场景和项目档案，让访客了解开发者并发起合作。",
    stack: ["React", "TypeScript", "Three.js", "Motion"],
    role: "当前个人网站 MVP，展示网页前端、组件结构与交互；其他项目职责待补充。",
    challenge:
      "将 WebGL 场景与内容展示解耦，并兼容小屏幕、键盘操作和减少动画设置。",
    outcome:
      "具备项目详情、技能探索、交互终端及组队邮件草稿功能。部署与真实资料补充待完成。",
    isDemo: false,
    visual: "space",
  },
  {
    id: "assistant",
    title: "Context / AI 知识助手",
    subtitle: "让知识不止被收藏，也能被找到。",
    category: "AI application",
    status: "概念示例",
    description:
      "演示内容：围绕资料检索与大模型问答的项目展示样例，用于示范如何介绍问题、技术决策与结果。",
    stack: ["Python", "RAG", "LLM", "React"],
    role: "待填写真实职责；该内容不代表已完成的个人项目。",
    challenge: "待补充真实的检索设计、引用来源与回答验证过程。",
    outcome: "待补充实际成果，不展示虚构指标。",
    isDemo: true,
    visual: "ai",
  },
  {
    id: "collab",
    title: "CoLab / 协作工作台",
    subtitle: "一个想法，一群人，一起向前。",
    category: "Full-stack exploration",
    status: "概念示例",
    description:
      "演示内容：面向学生团队的项目协作工具概念，展示任务、迭代与成员协作的产品方向。",
    stack: ["TypeScript", "React", "Node.js", "Git"],
    role: "待填写真实职责；界面是演示占位。",
    challenge: "待补充数据模型、任务状态管理与协作设计。",
    outcome: "待补充可运行链接、代码仓库和真实项目截图。",
    isDemo: true,
    visual: "flow",
  },
];
