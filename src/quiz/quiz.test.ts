import { describe, expect, it } from "vitest";
import { conjugate } from "../domain/conjugate";
import { verbs } from "../data/verbs";
import { checkAnswer, createQuestion, createQuestions } from "./quiz";

describe("createQuestion", () => {
  it("rng=0 时选中词库第一个动词与第一个形态（ます形）", () => {
    const q = createQuestion(verbs, undefined, () => 0);
    expect(q.verb).toBe(verbs[0]);
    expect(q.form).toBe("masu");
    expect(q.answer).toEqual(conjugate(verbs[0], "masu"));
  });

  it("随机出题的答案始终与活用引擎一致", () => {
    for (let i = 0; i < 50; i++) {
      const q = createQuestion();
      expect(q.answer).toEqual(conjugate(q.verb, q.form));
    }
  });

  it("支持限定词库范围出题", () => {
    const pool = verbs.filter((v) => v.type === "kuru");
    for (let i = 0; i < 10; i++) {
      expect(createQuestion(pool).verb.type).toBe("kuru");
    }
  });
});

describe("createQuestions（回合内不重复）", () => {
  it("10 题的动词×形态组合两两不同，且答案与引擎一致", () => {
    const questions = createQuestions(10);
    expect(questions).toHaveLength(10);
    const keys = questions.map((q) => `${q.verb.id}:${q.form}`);
    expect(new Set(keys).size).toBe(10);
    for (const q of questions) {
      expect(q.answer).toEqual(conjugate(q.verb, q.form));
    }
  });

  it("可以取满全部组合（23 动词 × 4 形态 = 92）", () => {
    const questions = createQuestions(verbs.length * 4);
    expect(new Set(questions.map((q) => `${q.verb.id}:${q.form}`)).size).toBe(92);
  });

  it("超出组合数时抛错", () => {
    expect(() => createQuestions(93)).toThrow(/超过可用组合数/);
  });

  it("限定词库后组合数按词库计算", () => {
    const pool = verbs.filter((v) => v.type === "kuru");
    expect(createQuestions(4, pool).every((q) => q.verb.type === "kuru")).toBe(true);
    expect(() => createQuestions(5, pool)).toThrow();
  });
});

describe("checkAnswer", () => {
  const answer = { kanji: "書いて", kana: "かいて" };

  it("接受汉字作答", () => {
    expect(checkAnswer("書いて", answer)).toBe(true);
  });

  it("接受假名作答", () => {
    expect(checkAnswer("かいて", answer)).toBe(true);
  });

  it("忽略首尾与中间的空白（含全角空格）", () => {
    expect(checkAnswer("　書いて ", answer)).toBe(true);
  });

  it("拒绝错误答案与空输入", () => {
    expect(checkAnswer("書きて", answer)).toBe(false);
    expect(checkAnswer("", answer)).toBe(false);
    expect(checkAnswer("   ", answer)).toBe(false);
  });

  it("来る：汉字与读音两种表记都接受", () => {
    const kite = { kanji: "来て", kana: "きて" };
    expect(checkAnswer("来て", kite)).toBe(true);
    expect(checkAnswer("きて", kite)).toBe(true);
  });
});
