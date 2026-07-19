#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "binder_assets/10479/tech-diagrams");

const colors = {
  ink: "#102018",
  muted: "#58665e",
  green: "#52ad32",
  deep: "#2c7624",
  mint: "#e7f3e2",
  pale: "#f5f8f3",
  gold: "#efad00",
  blue: "#2f7295",
  red: "#c95a4a",
  line: "#bfd4b7",
  white: "#ffffff",
};

const esc = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const lines = (value, x, y, options = {}) => {
  const rows = Array.isArray(value) ? value : [value];
  const size = options.size || 24;
  const weight = options.weight || 600;
  const anchor = options.anchor || "middle";
  const fill = options.fill || colors.ink;
  const gap = options.gap || Math.round(size * 1.25);
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${fill}">${rows.map((row, index) => `<tspan x="${x}" dy="${index ? gap : 0}">${esc(row)}</tspan>`).join("")}</text>`;
};

const node = (x, y, width, height, label, options = {}) => {
  const fill = options.fill || colors.white;
  const stroke = options.stroke || colors.line;
  const textFill = options.textFill || colors.ink;
  return `<g><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="18" fill="${fill}" stroke="${stroke}" stroke-width="2"/>${lines(label, x + width / 2, y + height / 2 - (Array.isArray(label) ? 10 : -8), { size: options.size || 22, fill: textFill, gap: 28 })}</g>`;
};

const arrow = (x1, y1, x2, y2, options = {}) => `<path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="${options.stroke || colors.green}" stroke-width="${options.width || 4}" stroke-linecap="round" marker-end="url(#arrow)"${options.dash ? ' stroke-dasharray="10 9"' : ""}/>`;

const shell = (title, subtitle, body) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-labelledby="title description">
  <title id="title">${esc(title)}</title>
  <desc id="description">${esc(subtitle)}</desc>
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="${colors.green}"/></marker>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#18321a" flood-opacity="0.08"/></filter>
  </defs>
  <rect width="1200" height="720" fill="${colors.pale}"/>
  <rect x="54" y="46" width="1092" height="628" rx="28" fill="${colors.white}" stroke="${colors.line}" stroke-width="2" filter="url(#shadow)"/>
  ${lines(title, 92, 112, { anchor: "start", size: 34, weight: 700 })}
  ${lines(subtitle, 92, 150, { anchor: "start", size: 18, weight: 500, fill: colors.muted })}
  <path d="M92 178 H1108" stroke="${colors.line}" stroke-width="2"/>
  ${body}
</svg>`;

const horizontalFlow = ({ title, subtitle, nodes, footer, accent = colors.green }) => {
  const x0 = 92;
  const y = 278;
  const gap = 34;
  const width = (1016 - gap * (nodes.length - 1)) / nodes.length;
  let body = "";
  nodes.forEach((label, index) => {
    const x = x0 + index * (width + gap);
    body += node(x, y, width, 128, label, { fill: index === nodes.length - 1 ? colors.mint : colors.white, stroke: index === nodes.length - 1 ? accent : colors.line, size: 21 });
    if (index < nodes.length - 1) body += arrow(x + width + 6, y + 64, x + width + gap - 6, y + 64, { stroke: accent });
  });
  if (footer) body += `<rect x="92" y="476" width="1016" height="118" rx="18" fill="${colors.mint}"/>${lines(footer, 600, 523, { size: 20, fill: colors.deep, gap: 29 })}`;
  return shell(title, subtitle, body);
};

const architecture = shell("模块化程序架构", "统一调度，子系统独立管理硬件", `
  ${node(458, 218, 284, 78, "CommandScheduler", { fill: colors.mint, stroke: colors.green, size: 24 })}
  ${arrow(600, 296, 600, 350)}
  ${["Drive", "Intake", "Indexer", "双炮塔", "Vision"].map((label, index) => node(92 + index * 205, 354, 180, 92, label, { size: 21 })).join("")}
  ${[182, 387, 592, 797, 1002].map((x) => arrow(x, 446, x, 500, { stroke: colors.deep })).join("")}
  ${node(92, 504, 180, 80, ["Swerve", "motors + encoders"], { fill: colors.pale, size: 17 })}
  ${node(297, 504, 180, 80, ["rollers", "deployment"], { fill: colors.pale, size: 17 })}
  ${node(502, 504, 180, 80, ["hopper", "feeders"], { fill: colors.pale, size: 17 })}
  ${node(707, 504, 180, 80, ["turret + hood", "flywheels"], { fill: colors.pale, size: 17 })}
  ${node(912, 504, 180, 80, ["Limelight 4", "PoseEstimator"], { fill: colors.pale, size: 17 })}
  ${lines("每个子系统只暴露状态与命令边界，便于赛季中独立维护和扩展", 600, 628, { size: 18, fill: colors.muted })}
`);

const sensors = shell("三类观测源", "Pigeon 2.0、CANcoder 与 Limelight 4 进入同一位姿估计链路", `
  ${node(92, 232, 250, 142, ["Pigeon 2.0", "角速度 · 姿态"], { fill: colors.pale, size: 22 })}
  ${node(475, 232, 250, 142, ["4 × CANcoder", "150 Hz 里程计"], { fill: colors.pale, size: 22 })}
  ${node(858, 232, 250, 142, ["2 × Limelight 4", "MegaTag2 位姿"], { fill: colors.pale, size: 22 })}
  ${arrow(217, 374, 493, 480)}${arrow(600, 374, 600, 462)}${arrow(983, 374, 707, 480)}
  ${node(414, 464, 372, 116, ["PoseEstimator", "预测 + 置信度加权更新"], { fill: colors.mint, stroke: colors.green, size: 23 })}
  ${lines("局部里程计保持连续，视觉观测提供全局校正", 600, 626, { size: 19, fill: colors.deep })}
`);

const kalman = shell("卡尔曼滤波", "预测 - 测量 - 更新", `
  ${node(92, 238, 250, 118, ["运动模型", "先验位姿 + 协方差"], { size: 21 })}
  ${node(92, 430, 250, 118, ["视觉测量", "观测 + 噪声"], { size: 21 })}
  ${arrow(342, 297, 492, 357)}${arrow(342, 489, 492, 413)}
  ${node(492, 312, 250, 142, ["卡尔曼增益", "按不确定性分配权重"], { fill: colors.mint, stroke: colors.green, size: 21 })}
  ${arrow(742, 383, 858, 383)}
  ${node(858, 312, 250, 142, ["融合位姿", "更小的不确定性"], { fill: colors.mint, stroke: colors.green, size: 22 })}
  <path d="M983 454 C983 588 217 616 217 548" fill="none" stroke="${colors.deep}" stroke-width="3" stroke-dasharray="10 9" marker-end="url(#arrow)"/>
  ${lines("更新结果进入下一周期预测", 600, 621, { size: 18, fill: colors.muted })}
`);

const confidence = shell("动态置信度与拒绝门限", "质量先过门，再进入加权融合", `
  ${node(92, 224, 310, 100, ["视觉观测", "distance · tag count"], { size: 21 })}
  ${arrow(402, 274, 472, 274)}
  ${node(472, 224, 322, 100, ["置信度因子", "distance¹·² ÷ tags²"], { fill: colors.mint, stroke: colors.green, size: 21 })}
  ${arrow(794, 274, 864, 274)}
  ${node(864, 224, 244, 100, ["加权更新", "PoseEstimator"], { size: 21 })}
  <rect x="92" y="382" width="1016" height="170" rx="20" fill="${colors.pale}" stroke="${colors.line}" stroke-width="2"/>
  ${lines("直接拒绝", 126, 430, { anchor: "start", size: 22, weight: 700, fill: colors.red })}
  ${lines(["无 AprilTag", "单标签歧义 > 0.3"], 352, 446, { size: 20, gap: 34 })}
  ${lines(["高度误差 > 0.75 m", "位置超出场地边界"], 684, 446, { size: 20, gap: 34 })}
  ${lines(["角速度 > 600°/s", "炮塔转速升高则降权"], 985, 446, { size: 20, gap: 34 })}
  ${lines("低质量观测不会突然拖动整机位姿", 600, 611, { size: 19, fill: colors.deep })}
`);

const pathPlanning = shell("全局与局部路径规划", "启发搜索给出路线，LocalADStar 在 navgrid 上持续生成可行路径", `
  <rect x="92" y="218" width="474" height="350" rx="22" fill="${colors.pale}" stroke="${colors.line}" stroke-width="2"/>
  <rect x="634" y="218" width="474" height="350" rx="22" fill="${colors.pale}" stroke="${colors.line}" stroke-width="2"/>
  ${lines("全局规划", 126, 264, { anchor: "start", size: 24, weight: 700 })}${lines("局部规划", 668, 264, { anchor: "start", size: 24, weight: 700 })}
  <path d="M148 504 C230 454 226 330 342 350 S430 438 518 298" fill="none" stroke="${colors.blue}" stroke-width="7" stroke-linecap="round"/>
  ${[148,222,342,430,518].map((x,index)=>`<circle cx="${x}" cy="${[504,450,350,421,298][index]}" r="10" fill="${index===4?colors.gold:colors.green}"/>`).join("")}
  <g stroke="${colors.line}" stroke-width="1">${Array.from({length:8},(_,i)=>`<path d="M${672+i*52} 302 V526"/>`).join("")}${Array.from({length:5},(_,i)=>`<path d="M668 ${306+i*52} H1070"/>`).join("")}</g>
  <path d="M694 492 C758 466 784 358 872 390 S986 450 1058 318" fill="none" stroke="${colors.green}" stroke-width="7" stroke-linecap="round"/>
  <circle cx="694" cy="492" r="11" fill="${colors.green}"/><circle cx="1058" cy="318" r="11" fill="${colors.gold}"/>
  ${lines("离散路径点 · 欧氏距离启发", 329, 617, { size: 18, fill: colors.muted })}${lines("当前位姿到临时目标", 871, 617, { size: 18, fill: colors.muted })}
`);

const pid = shell("PID 与前馈控制", "反馈修正剩余误差，前馈预补偿预期运动", `
  <rect x="92" y="222" width="1016" height="126" rx="20" fill="${colors.mint}" stroke="${colors.green}" stroke-width="2"/>
  ${lines("u(t) = Kp·e(t) + Ki·∫e(t)dt + Kd·de(t)/dt + feedforward", 600, 300, { size: 30, weight: 650, fill: colors.deep })}
  ${node(92, 410, 226, 118, ["P", "响应当前误差"], { size: 21 })}${node(355, 410, 226, 118, ["I = 0", "不累积路径偏差"], { size: 21 })}${node(618, 410, 226, 118, ["D", "抑制误差变化"], { size: 21 })}${node(881, 410, 227, 118, ["FF", "运动学预补偿"], { fill: colors.pale, size: 21 })}
  ${lines("平移与旋转控制器分别计算误差并输出修正量", 600, 605, { size: 19, fill: colors.muted })}
`);

const bump = shell("自动过 Bump", "位姿选通道，pitch 判断阶段，恢复水平后结束", `
  <path d="M102 482 H270 L370 340 H768 L870 482 H1098" fill="none" stroke="${colors.ink}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M130 292 H1060" stroke="${colors.green}" stroke-width="5" marker-end="url(#arrow)"/>
  ${[[190,458,0],[340,362,-20],[570,316,0],[808,362,20],[1000,458,0]].map(([x,y,r],i)=>`<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-54" y="-26" width="108" height="52" rx="12" fill="${colors.mint}" stroke="${colors.deep}" stroke-width="3"/><circle cx="-34" cy="27" r="11" fill="${colors.ink}"/><circle cx="34" cy="27" r="11" fill="${colors.ink}"/></g>${lines(["对准","上坡","坡顶","下坡","水平结束"][i],x,560,{size:18,fill:i===4?colors.deep:colors.muted})}`).join("")}
`);

const current = shell("动态底盘电流限制", "按电压与比赛阶段为双炮塔保留供电余量", `
  ${node(92, 222, 310, 122, ["自动阶段 / > 10.5 V", "80 A"], { fill: colors.mint, stroke: colors.green, size: 23 })}
  ${node(445, 222, 310, 122, ["手动 · 7.5-10.5 V", "40 A"], { fill: "#fff7dd", stroke: colors.gold, size: 23 })}
  ${node(798, 222, 310, 122, ["手动 · < 7.5 V", "20 A"], { fill: "#fbe9e5", stroke: colors.red, size: 23 })}
  <path d="M106 522 H310 L430 478 L562 432 L700 386 L1094 386" fill="none" stroke="${colors.green}" stroke-width="7" stroke-linecap="round"/>
  ${lines("电压恢复后平滑回升", 92, 420, { anchor: "start", size: 22, weight: 700 })}
  ${lines("+1 A / 20 ms", 1108, 424, { anchor: "end", size: 22, weight: 700, fill: colors.deep })}
  ${lines("避免瞬时恢复造成新的电压跌落", 600, 608, { size: 19, fill: colors.muted })}
`);

const led = shell("8 × 8 LED 灯板", "状态优先级统一更新，机械动作与视觉反馈同步", `
  ${[[254,"常态","Powerhouse 绿色"],[600,"飞轮启动","天蓝 → 橙红"],[946,"比赛末段","粉色提醒"]].map(([x,title,label],panel)=>`<g><rect x="${x-120}" y="222" width="240" height="286" rx="20" fill="${colors.pale}" stroke="${colors.line}" stroke-width="2"/>${Array.from({length:64},(_,i)=>{const col=i%8,row=Math.floor(i/8);const palette=panel===0?[colors.green,colors.gold]:panel===1?["#68d8ed",colors.gold,"#ec6b42"]:["#ef7ab7","#f6b3d4"];return `<circle cx="${x-70+col*20}" cy="${278+row*20}" r="6" fill="${palette[(col+row+panel)%palette.length]}"/>`;}).join("")}${lines(title,x,462,{size:21,weight:700})}${lines(label,x,492,{size:16,fill:colors.muted})}</g>`).join("")}
  ${lines("额外功能：俄罗斯方块 · 贪吃蛇", 600, 594, { size: 19, fill: colors.deep })}
`);

const shotTable = shell("射击参数实测表", "距离、Hood 角度与飞轮速度由标定数据驱动", `
  <rect x="118" y="218" width="964" height="346" rx="18" fill="${colors.white}" stroke="${colors.line}" stroke-width="2"/>
  <rect x="118" y="218" width="964" height="64" rx="18" fill="${colors.mint}"/>
  ${["目标距离 m","Hood 角度","飞轮角速度 rad/s"].map((label,i)=>lines(label,[270,600,920][i],258,{size:20,weight:700,fill:colors.deep})).join("")}
  ${[["1.10","0.10 / 5.7°","250"],["1.94","0.12 / 6.9°","283"],["2.99","0.17 / 9.7°","319"],["3.52","0.21 / 12.0°","334"],["4.32","0.23 / 13.2°","364"],["5.60","-","413"]].map((row,r)=>`${row.map((cell,c)=>lines(cell,[270,600,920][c],324+r*42,{size:19,weight:500})).join("")}<path d="M148 ${340+r*42} H1052" stroke="${colors.line}" stroke-width="1"/>`).join("")}
  ${lines("程序在相邻实测点之间插值，避免参数跳变", 600, 622, { size: 19, fill: colors.muted })}
`);

const passing = shell("双炮塔动态传球规划", "根据机器人所在区域，为左右炮塔选择独立落点", `
  ${[212,600,988].map((x,i)=>`<g><rect x="${x-158}" y="224" width="316" height="328" rx="20" fill="${colors.pale}" stroke="${colors.line}" stroke-width="2"/>${lines(["场地上侧","场地中央","场地下侧"][i],x,266,{size:22,weight:700})}<rect x="${x-126}" y="304" width="252" height="88" rx="12" fill="${colors.mint}"/><path d="M${x-92} 500 C${x-86} 440 ${x-72} 402 ${x-64} 366" fill="none" stroke="${colors.blue}" stroke-width="4" stroke-dasharray="8 7" marker-end="url(#arrow)"/><path d="M${x+92} 500 C${x+86} 440 ${x+72} 402 ${x+64} 366" fill="none" stroke="${colors.green}" stroke-width="4" stroke-dasharray="8 7" marker-end="url(#arrow)"/><rect x="${x-48}" y="476" width="96" height="60" rx="12" fill="${colors.white}" stroke="${colors.ink}" stroke-width="2"/><circle cx="${x-70}" cy="345" r="12" fill="${colors.gold}"/><circle cx="${x+70}" cy="345" r="12" fill="${colors.gold}"/>${lines(i===0?"上侧目标":i===2?"下侧目标":"左右分流",x,526,{size:16,fill:colors.muted})}</g>`).join("")}
  ${lines("蓝：左炮塔  ·  绿：右炮塔  ·  轨迹避开 Hub", 600, 615, { size: 18, fill: colors.deep })}
`);

const readiness = shell("发射就绪判定", "解算持续运行；达到放行条件后 feeder 与 Indexer 才供料", `
  ${node(92, 224, 300, 110, ["驾驶员持续按下", "射击指令"], { size: 22 })}
  ${node(450, 224, 300, 110, ["至少一侧飞轮", "达到目标速度"], { size: 22 })}
  ${node(808, 224, 300, 110, ["Hood 与炮塔", "持续跟踪并记录状态"], { fill: colors.pale, size: 22 })}
  ${arrow(242, 334, 478, 448)}${arrow(600, 334, 600, 430)}
  ${node(410, 430, 380, 124, ["FIRE ALLOWED", "双 feeder + Indexer 供料"], { fill: colors.mint, stroke: colors.green, size: 24 })}
  <path d="M958 334 C958 500 864 492 790 492" fill="none" stroke="${colors.blue}" stroke-width="3" stroke-dasharray="9 8" marker-end="url(#arrow)"/>
  ${lines("条件不足时不放行 FUEL", 600, 616, { size: 19, fill: colors.deep })}
`);

const diagrams = {
  "architecture.svg": architecture,
  "autonomous.svg": horizontalFlow({ title: "自动模式", subtitle: "状态估计与路径控制紧密耦合", nodes: [["多传感器", "位姿估计"], ["PathPlanner", "路径生成"], ["Swerve 控制", "轨迹跟踪"], ["机构命令", "任务执行"]], footer: ["机器人持续记录当前位姿、目标位姿与路径", "用于调试和赛后复盘"] }),
  "teleop.svg": horizontalFlow({ title: "场地导向遥控", subtitle: "驾驶员输入始终映射到场地坐标系", nodes: [["摇杆输入", "vx · vy · ω"], ["陀螺仪朝向", "坐标变换"], ["速度 / 加速度", "限制"], ["Swerve", "模块目标状态"]], footer: ["机器人转向不会改变驾驶员对“前方”的理解", "限速与限加速度减少车轮打滑"] }),
  "sensors.svg": sensors,
  "kalman.svg": kalman,
  "confidence.svg": confidence,
  "path-planning.svg": pathPlanning,
  "pid-feedforward.svg": pid,
  "auto-bump.svg": bump,
  "current-limiting.svg": current,
  "led-board.svg": led,
  "shot-table.svg": shotTable,
  "dynamic-solver.svg": horizontalFlow({ title: "动态发射解算器", subtitle: "求解未来发射位置，而不是只瞄准当前位置", nodes: [["机器人位姿", "底盘速度"], ["飞行时间", "查表插值"], ["未来发射点", "位置预测"], ["双炮塔解", "角度 · Hood · 转速"]], footer: ["机器人移动和旋转产生的发射点速度都会进入补偿", "两套炮塔持续独立更新"] }),
  "iterative-solver.svg": horizontalFlow({ title: "20 轮耦合求解", subtitle: "距离影响飞行时间，位移又改变距离", nodes: [["当前距离", "初始估计"], ["估算", "飞行时间"], ["预测", "机器人位移"], ["重算", "目标距离"], ["重复 20 轮", "输出最终解"]], footer: ["每轮都更新距离、飞行时间与瞄准结果", "使用最后一轮形成动态射击参数"] }),
  "motion-compensation.svg": horizontalFlow({ title: "运动补偿", subtitle: "平移速度与炮塔偏移产生的旋转附加速度同时修正", nodes: [["底盘平移", "场地坐标速度"], ["炮塔偏移 × ω", "附加线速度"], ["真实发射点", "速度"], ["速度 × 飞行时间", "预测位移"]], footer: ["补偿后的瞄准方向指向 FUEL 抵达时的目标", "而不是发射瞬间的静态目标"] }),
  "shot-readiness.svg": readiness,
  "dynamic-passing.svg": passing,
};

await mkdir(output, { recursive: true });
await Promise.all(Object.entries(diagrams).map(([name, svg]) => writeFile(path.join(output, name), svg)));
console.log(`Generated ${Object.keys(diagrams).length} clean SVG diagrams in ${path.relative(root, output)}`);
