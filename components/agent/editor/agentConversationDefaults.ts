// Defaults shared by conversation editor and preview.
export const DEFAULT_OPENING_STATEMENT = '你好，我是设备故障排查助手。请描述设备类型、故障现象、报警代码和现场数据，我会给出排查建议。';

export const MAX_SUGGESTED_QUESTIONS = 3;

export const DEFAULT_SUGGESTED_QUESTIONS = [
  '电机运行 20 分钟后过热怎么办？',
  '变频器报 E101 如何处理？',
  '轴承振动异常要先检查什么？',
];

// Preserve defaults so callers can safely mutate the returned array.
export const getFallbackSuggestedQuestions = () =>
  [...DEFAULT_SUGGESTED_QUESTIONS].slice(0, MAX_SUGGESTED_QUESTIONS);

// Normalize and filter blanks for preview/quick-ask usage.
export const normalizeSuggestedQuestions = (questions?: string[]) => {
  const normalized = (questions ?? []).map((question) => question.trim()).filter(Boolean);
  const limited = normalized.slice(0, MAX_SUGGESTED_QUESTIONS);
  return limited.length ? limited : [...DEFAULT_SUGGESTED_QUESTIONS].slice(0, MAX_SUGGESTED_QUESTIONS);
};