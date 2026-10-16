import { useEffect, useReducer, useRef, useState } from "react";
import { createQuestion, type Question } from "../quiz/quiz";
import {
  answerSession,
  continueSession,
  createIdleSession,
  getElapsedMs,
  resetSession,
  startSession,
  DEFAULT_QUESTION_COUNT,
  type SessionState,
} from "./session";

type Action =
  | { type: "start"; total: number; now: number }
  | { type: "answer"; isCorrect: boolean; now: number }
  | { type: "continue" }
  | { type: "reset" };

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case "start":
      return startSession(action.total, action.now);
    case "answer":
      return answerSession(state, action.isCorrect, action.now);
    case "continue":
      return continueSession(state);
    case "reset":
      return resetSession(state);
    default:
      return state;
  }
}

export interface TrainingSession {
  state: SessionState;
  /** 本回合预生成的题目（开始时固定，不随答题变化） */
  questions: Question[];
  /** 当前题（finished 时为最后一题） */
  currentQuestion: Question | null;
  /** 已用毫秒（由时间戳计算，组件按此渲染） */
  elapsedMs: number;
  start: (total?: number) => void;
  answer: (isCorrect: boolean) => void;
  next: () => void;
  restart: () => void;
  home: () => void;
}

/**
 * 训练回合 Hook。
 * 计时数据只来自 startedAt/endedAt（Date.now 时间戳）；
 * 250ms 的 interval 仅用于驱动 UI 重新读取 Date.now() 显示已用时间，
 * 不参与任何计时累加。
 */
export function useTrainingSession(): TrainingSession {
  const [state, dispatch] = useReducer(reducer, undefined, createIdleSession);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const totalRef = useRef(DEFAULT_QUESTION_COUNT);

  useEffect(() => {
    if (state.phase !== "playing") return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [state.phase]);

  const begin = (total: number) => {
    totalRef.current = total;
    setQuestions(Array.from({ length: total }, () => createQuestion()));
    dispatch({ type: "start", total, now: Date.now() });
  };

  const currentQuestion = questions[state.index] ?? null;

  return {
    state,
    questions,
    currentQuestion,
    elapsedMs: getElapsedMs(state, now),
    start: (total = DEFAULT_QUESTION_COUNT) => begin(total),
    answer: (isCorrect) => dispatch({ type: "answer", isCorrect, now: Date.now() }),
    next: () => dispatch({ type: "continue" }),
    restart: () => begin(totalRef.current),
    home: () => dispatch({ type: "reset" }),
  };
}
