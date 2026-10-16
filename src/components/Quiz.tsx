import { useState } from "react";
import { createQuestion, type Question } from "../quiz/quiz";
import QuestionCard from "./QuestionCard";

/** 自由练习（不计分、不限题数）：原有功能，改为复用 QuestionCard */
export default function Quiz({ onBack }: { onBack?: () => void }) {
  const [question, setQuestion] = useState<Question>(() => createQuestion());

  return (
    <div>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            marginBottom: 12,
            border: "none",
            background: "none",
            color: "#0969da",
            cursor: "pointer",
            fontSize: 14,
            padding: 0,
          }}
        >
          ← 返回首页
        </button>
      )}
      <QuestionCard
        key={`${question.verb.id}-${question.form}`}
        question={question}
        onContinue={() => setQuestion(createQuestion())}
      />
    </div>
  );
}
