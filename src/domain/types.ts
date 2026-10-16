/**
 * 动词类别。
 * 日语动词不存在绝对的「不规则」分类，多数不规则变化可归结为：
 * 五段的个别例外（行く、ある）与サ变/カ变两个独立类别。
 */
export type VerbType =
  | "godan" // 五段动词（一类动词）：書く、飲む、帰る…
  | "ichidan" // 一段动词（二类动词）：食べる、見る…
  | "suru" // サ变动词：する，以及 勉強する 等「名词+する」复合词
  | "kuru"; // カ变动词：来る（日语中仅此一个）

/**
 * 活用形 ID。
 * 第一阶段仅实现 4 种；后续按此枚举扩展：
 * potential(可能) / volitional(意向) / imperative(命令) / conditional(条件)
 * passive(受身) / causative(使役) / causativePassive(使役受身) 等。
 */
export type FormId = "masu" | "nai" | "te" | "ta";

/** verbs.json 中单个动词的数据结构 */
export interface Verb {
  /** 唯一 ID（罗马音），如 "taberu"、"benkyou-suru" */
  id: string;
  /** 辞书形（汉字表记），如 "食べる"；无汉字时与 kana 相同 */
  kanji: string;
  /** 辞书形（假名表记 / 读音），如 "たべる"。活用规则以此为准 */
  kana: string;
  /** 中文释义 */
  meaning: string;
  /** 动词类别（判别规则见引擎注释，如 帰る/走る/ある 是五段而非一段） */
  type: VerbType;
  /** JLPT 级别（可选，便于以后按级别出题） */
  level?: "N5" | "N4" | "N3" | "N2" | "N1";
}

/** 一个活用结果：同时给出汉字书写与假名读音 */
export interface ConjugatedForm {
  kanji: string;
  kana: string;
}

/** verbs.json 顶层结构 */
export interface VerbBank {
  meta: {
    version: number;
    description?: string;
  };
  verbs: Verb[];
}
