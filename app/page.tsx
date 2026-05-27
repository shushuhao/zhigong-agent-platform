import Link from 'next/link';
import { ArrowRightOutlined, RobotOutlined, ApartmentOutlined, BookOutlined, ToolOutlined } from '@ant-design/icons';

const quickLinks = [
  {
    title: '故障排查助手',
    description: '预设电机过热、振动异常、故障代码等工业设备诊断场景。',
    href: '/agent/list',
    icon: ToolOutlined,
    accent: 'from-orange-500/20 to-amber-400/10',
    border: 'border-orange-200',
  },
  {
    title: '智能体配置',
    description: '查看工业场景 Agent、角色提示词与 SSE 流式预览调试。',
    href: '/agent/list',
    icon: RobotOutlined,
    accent: 'from-teal-500/20 to-cyan-400/10',
    border: 'border-teal-200',
  },
  {
    title: '产线工作流编排',
    description: '体验可视化节点画布、设备诊断流程运行与状态反馈。',
    href: '/workflow/list',
    icon: ApartmentOutlined,
    accent: 'from-indigo-500/20 to-blue-400/10',
    border: 'border-indigo-200',
  },
  {
    title: '工业知识库',
    description: '进入设备手册、故障代码表、维护规范与命中测试模块。',
    href: '/knowledge/list',
    icon: BookOutlined,
    accent: 'from-emerald-500/20 to-lime-400/10',
    border: 'border-emerald-200',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.14),_transparent_28%),linear-gradient(180deg,#f6fffb_0%,#eef7f4_100%)] text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
        <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-12">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(20,184,166,0.12),transparent_42%,rgba(249,115,22,0.10))]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.35fr_0.9fr] lg:items-end">
            <div>
              <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-4 py-1 text-sm font-medium text-teal-700">
                Industrial AI Agent Platform
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
                智工智能体平台
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                面向工业互联网场景的 AI 应用平台，提供设备故障诊断、工业知识库问答、智能体编排、工作流可视化与插件化能力扩展。
              </p>
              <p className="mt-4 max-w-2xl rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3 text-sm leading-7 text-teal-800">
                覆盖设备告警分析、知识检索、诊断流程编排与运维协同，帮助团队更快定位异常并形成可追踪的处理建议。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/agent/list"
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  查看故障排查助手
                  <ArrowRightOutlined />
                </Link>
                <Link
                  href="/knowledge/list"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
                >
                  进入工业知识库
                </Link>
              </div>
            </div>

            <div className="grid gap-4 rounded-[28px] border border-slate-200/80 bg-slate-950 p-5 text-slate-50 shadow-2xl shadow-slate-950/10">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Industrial AI Snapshot</div>
                <div className="mt-3 text-2xl font-semibold">工业设备诊断 + Agent 编排演示平台</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-slate-400">核心场景</div>
                  <div className="mt-2 font-medium">故障诊断 + 知识问答</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-slate-400">前端重点</div>
                  <div className="mt-2 font-medium">流式交互、可视化、状态管理</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-slate-400">技术栈</div>
                  <div className="mt-2 font-medium">Next.js 15 / TS / Zustand / ReactFlow</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-slate-400">展示路线</div>
                  <div className="mt-2 font-medium">知识库 → Agent → 工作流</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-teal-700">模块导览</div>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">工业智能应用导航</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-500">
              从工业知识库、故障排查助手到工作流编排，形成设备异常分析、建议生成与流程协同的完整闭环。
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`group rounded-[28px] border ${item.border} bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]`}
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-slate-800`}>
                    <Icon className="text-xl" />
                  </div>
                  <div className="mt-4 text-lg font-semibold text-slate-900">{item.title}</div>
                  <p className="mt-2 min-h-[66px] text-sm leading-6 text-slate-500">{item.description}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                    进入模块
                    <ArrowRightOutlined className="transition group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="text-sm font-medium text-teal-700">工业场景</div>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">故障排查助手示例</h3>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
              <li><span className="font-medium text-slate-900">1. 工业知识库：</span> 统一管理设备手册、故障代码表与点检规范。</li>
              <li><span className="font-medium text-slate-900">2. Agent 流式回答：</span> 分段输出电机过热、振动异常等排查建议，便于现场人员跟进。</li>
              <li><span className="font-medium text-slate-900">3. 工作流编排：</span> 将告警输入、知识检索、诊断判断和处理建议串联为可配置流程。</li>
            </ul>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="text-sm font-medium text-teal-700">能力边界</div>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">可接入真实工业数据与模型服务</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              平台前端已覆盖工业知识库、Agent 配置、SSE 流式预览与工作流可视化等核心交互，后端接口形态可对接真实设备数据、向量检索服务和模型 API。
            </p>
            <div className="mt-5 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-100">
              示例：根据电机过热现象，检查散热风扇、轴承负载、温度传感器与报警代码。
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
