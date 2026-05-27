import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const MOCK_THOUGHT_STEPS = [
  '识别设备类型、故障现象、报警代码和现场参数。',
  '从工业设备手册中匹配电机过热、轴承振动或变频器报警场景。',
  '检索故障代码表，提取可能原因和建议处理动作。',
  '按安全优先原则组织排查顺序，先降载停机再检查部件。',
  '生成可给现场人员执行的检查清单。',
  '补充后续接入真实设备数据和模型 API 的说明。',
];

const createChunks = (text: string, size = 10) => {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
};

const shouldMockError = (content: string) => /error|错误|失败/i.test(content);

const buildRichReply = (content: string) => {
  const normalized = content?.trim() || '电机运行 20 分钟后外壳温度升高，并伴随轻微异响';
  const isVibration = /振动|震动|异响|轴承|E203/i.test(normalized);
  const isInverter = /变频|E307|E410|报警|代码/i.test(normalized);

  const focus = isVibration
    ? '轴承振动异常'
    : isInverter
      ? '变频器/风扇报警'
      : '电机过热';

  return [
    `根据您描述的「${normalized}」，当前更接近 **${focus}** 场景。以下为工业知识库中的 mock 诊断示例：`,
    '',
    '## 1. 初步判断',
    isVibration
      ? '- 可能与轴承润滑不足、联轴器不对中、地脚螺栓松动或负载不平衡有关。'
      : isInverter
        ? '- 可能与变频器参数、散热风扇、输出电流波动或通风环境有关。'
        : '- 根据您描述的电机过热现象，建议优先检查散热风扇、通风道、负载端和三相电流。',
    '- 当前回答为前端 SSE mock，用于展示智能体在工业场景中的交互效果。',
    '',
    '## 2. 建议排查步骤',
    '| 顺序 | 检查项 | 处理建议 |',
    '| --- | --- | --- |',
    '| 1 | 安全状态 | 先确认设备可降载或停机，执行断电挂牌流程 |',
    '| 2 | 散热系统 | 检查散热风扇是否转动，清理风罩与通风道积尘 |',
    '| 3 | 负载与轴承 | 检查负载端是否卡滞，确认轴承温度和润滑状态 |',
    '| 4 | 电气参数 | 读取三相电流、变频器频率和报警代码 |',
    '| 5 | 复测记录 | 记录温度、振动、电流变化，作为后续维护依据 |',
    '',
    '## 3. 关联故障代码',
    '- **E101**：电机温度过高，检查风扇、负载、电流与通风环境。',
    '- **E203**：轴承振动偏高，检查轴承润滑、同轴度与地脚螺栓。',
    '- **E410**：风扇转速低，清理风道，检查风扇电源与叶轮。',
    '',
    '## 4. 建议回复给现场人员',
    '请先确认设备是否允许降载运行；若温度持续升高或伴随焦味、明显异响，应立即停机并通知维护人员复检。优先检查散热风扇、通风道积尘、轴承润滑和三相电流是否平衡。',
    '',
    '## 5. 面试说明',
    '这个 demo 的后端目前是 mock SSE 流式接口，接口形态已经按真实模型输出预留。后续可以接入工业设备台账、向量知识库、实时传感器数据和大模型 API。',
  ].join('\n');
};

const buildSseMessage = (event: string, payload: Record<string, unknown>) =>
  `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const content = searchParams.get('message') ?? '';
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let timer: ReturnType<typeof setTimeout> | null = null;
      let closed = false;
      let thoughtIndex = 0;
      let chunkIndex = 0;
      const thoughtChunks = createChunks(MOCK_THOUGHT_STEPS.join(' '), 8);
      const answerChunks = createChunks(buildRichReply(content), 24);

      const clearTimer = () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      };

      const closeStream = () => {
        if (closed) return;
        closed = true;
        clearTimer();
        controller.close();
      };

      const pushEvent = (event: string, payload: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(buildSseMessage(event, payload)));
      };

      const abortHandler = () => {
        closeStream();
      };

      request.signal.addEventListener('abort', abortHandler);

      if (shouldMockError(content)) {
        timer = setTimeout(() => {
          pushEvent('error', { message: '模拟服务异常，请稍后重试。' });
          closeStream();
        }, 400);
        return;
      }

      const tick = () => {
        if (closed) return;

        if (thoughtIndex < thoughtChunks.length) {
          pushEvent('thought', { chunk: thoughtChunks[thoughtIndex] });
          thoughtIndex += 1;
        } else if (chunkIndex < answerChunks.length) {
          pushEvent('chunk', { chunk: answerChunks[chunkIndex] });
          chunkIndex += 1;
        } else {
          pushEvent('done', { message: 'done' });
          closeStream();
          return;
        }

        timer = setTimeout(tick, 160);
      };

      timer = setTimeout(tick, 200);
    },
    cancel() {
      // 连接被关闭时，ReadableStream 会自动清理。
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}