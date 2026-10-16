import { conjugate, PHASE1_FORMS } from "../domain/conjugate";
import type { ConjugatedForm, FormId, Verb } from "../domain/types";
import { verbs } from "../data/verbs";

/** 一道练习题：动词 + 目标形态 + 标准答案 */
export interface Question {
  verb: Verb;
  form: FormId;
  answer: ConjugatedForm;
}

/**
 * 随机出一道题。可注入词库 / 形态范围 / 随机源（测试时可固定）。
 * 后续按级别、动词类型筛选题目时扩展 pool 参数即可。
 */
export function createQuestion(
  pool: Verb[] = verbs,
  forms: readonly FormId[] = PHASE1_FORMS,
  rng: () => number = Math.random,
): Question {
  const verb = pool[Math.floor(rng() * pool.length)];
  const form = forms[Math.floor(rng() * forms.length)];
  return { verb, form, answer: conjugate(verb, form) };
}

/**
 * 生成 count 道「动词 × 形态」组合互不重复的题目。
 * 对全部组合做 Fisher-Yates 洗牌后取前 count 个，
 * 保证同一回合内不会重复考查同一个动词的同一个形态。
 */
export function createQuestions(
  count: number,
  pool: Verb[] = verbs,
  forms: readonly FormId[] = PHASE1_FORMS,
  rng: () => number = Math.random,
): Question[] {
  const combos: Array<{ verb: Verb; form: FormId }> = [];
  for (const verb of pool) {
    for (const form of forms) combos.push({ verb, form });
  }
  if (count > combos.length) {
    throw new Error(`题目数 ${count} 超过可用组合数 ${combos.length}`);
  }
  for (let i = combos.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [combos[i], combos[j]] = [combos[j], combos[i]];
  }
  return combos
    .slice(0, count)
    .map(({ verb, form }) => ({ verb, form, answer: conjugate(verb, form) }));
}

/**
 * 判分：汉字作答或假名作答都算对（忽略首尾与中间空白）。
 * 例如 て形「来て」答「きて」也正确。
 */
export function checkAnswer(input: string, answer: ConjugatedForm): boolean {
  const normalized = input.replace(/\s+/g, "");
  return normalized.length > 0 && (normalized === answer.kanji || normalized === answer.kana);
}
