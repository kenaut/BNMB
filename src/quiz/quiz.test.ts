import { describe, expect, it } from "vitest";
import { conjugate } from "../domain/conjugate";
import { verbs } from "../data/verbs";
import { checkAnswer, createQuestion } from "./quiz";

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
