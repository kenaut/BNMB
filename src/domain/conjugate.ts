import type { ConjugatedForm, FormId, Verb, VerbType } from "./types";

/**
 * 五段动词词尾音变表（以辞书形最后一个假名为键）。
 *
 * - a / i / e / o：五段活用各行词尾
 *   （第一阶段只用 a=未然形、i=连用形；e/o 为可能・命令・条件・意向等形态预留）
 * - te / ta：て形・た形，已包含音便结果：
 *     う/つ/る → 促音便「っ」
 *     む/ぶ/ぬ → 拨音便「ん」+ 浊音（で/だ）
 *     く/ぐ   → イ音便「い」（ぐ 随行浊音 で/だ）
 *     す      → 无音便「し」
 */
const GODAN_ROWS = {
  う: { a: "わ", i: "い", e: "え", o: "お", te: "って", ta: "った" },
  く: { a: "か", i: "き", e: "け", o: "こ", te: "いて", ta: "いた" },
  ぐ: { a: "が", i: "ぎ", e: "げ", o: "ご", te: "いで", ta: "いだ" },
  す: { a: "さ", i: "し", e: "せ", o: "そ", te: "して", ta: "した" },
  つ: { a: "た", i: "ち", e: "て", o: "と", te: "って", ta: "った" },
  ぬ: { a: "な", i: "に", e: "ね", o: "の", te: "んで", ta: "んだ" },
  ぶ: { a: "ば", i: "び", e: "べ", o: "ぼ", te: "んで", ta: "んだ" },
  む: { a: "ま", i: "み", e: "め", o: "も", te: "んで", ta: "んだ" },
  る: { a: "ら", i: "り", e: "れ", o: "ろ", te: "って", ta: "った" },
} as const;

type GodanEnding = keyof typeof GODAN_ROWS;
type GodanBase = keyof (typeof GODAN_ROWS)[GodanEnding];

/** 第一阶段形态 → 五段词尾所在行 */
const GODAN_FORM_BASE: Record<FormId, GodanBase> = {
  masu: "i",
  nai: "a",
  te: "te",
  ta: "ta",
};

/**
 * 五段动词的特殊变化（按辞书形假名 kana 匹配）。
 * 数据驱动：新增特殊动词时只需在此追加条目（如 問う→問うて）。
 */
const GODAN_EXCEPTIONS: Record<string, Partial<Record<FormId, ConjugatedForm>>> = {
  // 行く：て形/た形是促音便「行って/行った」，而非イ音便「行いて」
  いく: {
    te: { kanji: "行って", kana: "いって" },
    ta: { kanji: "行った", kana: "いった" },
  },
  // ある：ない形是「ない」，而非「あらない」
  ある: {
    nai: { kanji: "ない", kana: "ない" },
  },
};

/** 一段动词：去掉词尾「る」后直接接后缀 */
const ICHIDAN_SUFFIX: Record<FormId, string> = {
  masu: "ます",
  nai: "ない",
  te: "て",
  ta: "た",
};

/** サ变动词：把词尾「する」替换为「し～」 */
const SURU_FORM: Record<FormId, string> = {
  masu: "します",
  nai: "しない",
  te: "して",
  ta: "した",
};

/**
 * カ变动词「来る」：日语中仅此一个，其汉字与读音变化不一致
 * （きます=来ます / こない=来ない），直接给出完整形态。
 */
const KURU_FORM: Record<FormId, ConjugatedForm> = {
  masu: { kanji: "来ます", kana: "きます" },
  nai: { kanji: "来ない", kana: "こない" },
  te: { kanji: "来て", kana: "きて" },
  ta: { kanji: "来た", kana: "きた" },
};

/** 第一阶段支持的形态列表（按练习顺序） */
export const PHASE1_FORMS: readonly FormId[] = ["masu", "nai", "te", "ta"];

/** 形态的中文标签（UI 展示用） */
export const FORM_LABELS: Record<FormId, string> = {
  masu: "ます形",
  nai: "ない形",
  te: "て形",
  ta: "た形",
};

/** 动词类型的中文标签（UI 展示用） */
export const VERB_TYPE_LABELS: Record<VerbType, string> = {
  godan: "五段",
  ichidan: "一段",
  suru: "サ变",
  kuru: "カ变",
};

/** 去掉词尾 drop 个字符后拼接后缀（汉字/假名同步替换） */
function replaceEnding(verb: Verb, drop: number, suffix: string): ConjugatedForm {
  return {
    kanji: verb.kanji.slice(0, -drop) + suffix,
    kana: verb.kana.slice(0, -drop) + suffix,
  };
}

function conjugateGodan(verb: Verb, form: FormId): ConjugatedForm {
  const exception = GODAN_EXCEPTIONS[verb.kana]?.[form];
  if (exception) return exception;

  const ending = verb.kana.slice(-1) as GodanEnding;
  const row = GODAN_ROWS[ending];
  if (!row) {
    throw new Error(`无法识别的五段词尾「${ending}」（动词: ${verb.kanji} / ${verb.kana}）`);
  }

  const base = GODAN_FORM_BASE[form];
  const suffix =
    base === "i" ? row.i + "ます" : base === "a" ? row.a + "ない" : row[base];
  return replaceEnding(verb, 1, suffix);
}

/**
 * 动词活用入口：conjugate(verb, form)。
 *
 * @example conjugate(食べる, "te") // { kanji: "食べて", kana: "たべて" }
 * @example conjugate(行く, "ta")  // { kanji: "行った", kana: "いった" }
 */
export function conjugate(verb: Verb, form: FormId): ConjugatedForm {
  switch (verb.type) {
    case "ichidan":
      return replaceEnding(verb, 1, ICHIDAN_SUFFIX[form]);
    case "godan":
      return conjugateGodan(verb, form);
    case "suru":
      // 兼容 する 本体与 勉強する 等「名词+する」复合词
      return replaceEnding(verb, 2, SURU_FORM[form]);
    case "kuru":
      return KURU_FORM[form];
    default: {
      const exhaustive: never = verb.type;
      throw new Error(`未知动词类型: ${exhaustive as string}`);
    }
  }
}

/** 一次性算出某个动词在第一阶段的全部形态 */
export function conjugateAll(verb: Verb): Record<FormId, ConjugatedForm> {
  return {
    masu: conjugate(verb, "masu"),
    nai: conjugate(verb, "nai"),
    te: conjugate(verb, "te"),
    ta: conjugate(verb, "ta"),
  };
}
