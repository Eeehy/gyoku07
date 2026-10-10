export type Competition = {
  title: string;
  type: string;
  status: "已完成" | "进行中" | "计划中";
  detail: string;
  role: string;
};
// 仅填写可核实的赛事经历；当前尚未提供，不伪造获奖或参赛记录。
export const competitions: Competition[] = [];
export const explorationPlans: Competition[] = [
  {
    title: "AIGC 等专业赛道",
    type: "第一优先 · 兴趣方向",
    status: "计划中",
    detail:
      "优先寻找 AIGC 等专业赛道的组队机会。具体赛事、创作形式与时间待确认。",
    role: "可承担：网页前端、框架设计与交互",
  },
  {
    title: "数学建模",
    type: "第二优先 · 兴趣方向",
    status: "计划中",
    detail: "关注数学建模赛道的组队机会。具体赛事、题目与合作分工待确认。",
    role: "具体分工与实践经历待补充",
  },
  {
    title: "电子设计竞赛",
    type: "第三优先 · 兴趣方向",
    status: "计划中",
    detail:
      "关注电赛合作机会，期待和电子、硬件方向的队友协作。具体赛事与任务待确认。",
    role: "可承担：网页展示、软件框架与交互；硬件经历未提供",
  },
  {
    title: "创新创业",
    type: "第四优先 · 兴趣方向",
    status: "计划中",
    detail:
      "关注创新创业项目，将创意转化为可展示、可交互的产品。具体项目待确认。",
    role: "可承担：前端原型、框架设计与交互实现",
  },
];
