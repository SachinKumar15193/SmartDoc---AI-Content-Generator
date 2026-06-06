// src/components/QuizViewer.jsx
import { useState } from 'react';

// Props: quizData is an array of objects {question, options: [{label, text}], answer, explanation}
export const QuizViewer = ({ quizData }) => {
  const [selected, setSelected] = useState({}); // {index: optionLabel}
  const [showAnswer, setShowAnswer] = useState({}); // {index: true/false}

  const handleSelect = (qIdx, opt) => {
    setSelected(prev => ({ ...prev, [qIdx]: opt }));
  };

  const toggleAnswer = qIdx => {
    setShowAnswer(prev => ({ ...prev, [qIdx]: !prev[qIdx] }));
  };

  if (!quizData.length) {
    return <p className="text-gray-400 text-sm text-center py-10">No quiz data parsed.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {quizData.map((q, idx) => (
        <div key={idx} className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-medium text-white mb-3">Question {idx + 1}</h3>
          <p className="text-gray-200 mb-4">{q.question}</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {q.options.map(opt => (
              <button
                key={opt.label}
                onClick={() => handleSelect(idx, opt.label)}
                className={`p-3 rounded-xl border transition-all ${
                  selected[idx] === opt.label
                    ? 'border-brand-400 bg-brand-500/10 text-brand-300'
                    : 'border-white/10 text-gray-300 hover:border-white/20'}
                `}
              >
                <span className="font-bold mr-2">{opt.label})</span> {opt.text}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => toggleAnswer(idx)}
              disabled={!selected[idx]}
              className="btn-secondary !py-2 !px-4 !text-sm disabled:opacity-30 self-start"
            >
              {showAnswer[idx] ? 'Hide Answer' : 'Show Answer'}
            </button>
            {showAnswer[idx] && (
              <div className="text-sm text-gray-300">
                <p className="font-semibold">Correct: {q.answer}</p>
                <p className="italic">{q.explanation}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Parses AI‑generated markdown into a structured quiz data array.
 * Expected format:
 *   ### Question 1
 *   **Q:** What is 2+2?
 *   **A.** 3
 *   **B.** 4
 *   **C.** 5
 *   **D.** 6
 *   **Answer:** B
 *   **Explanation:** 4 is the sum of 2 and 2.
 */
export function parseQuizMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/).map(l => l.trim());
  const quizzes = [];
  let current = null;
  const optionRegex = /^(\*\*|\-)?\s*([A-D])\.\s*(.*)$/i;
  const answerRegex = /^\*\*Answer:\*\*\s*([A-D])$/i;
  const explanationRegex = /^\*\*Explanation:\*\*\s*(.*)$/i;
  const questionRegex = /^(###\s*)?Question\s*\d+\s*$/i;
  const qTextRegex = /^\*\*Q:\*\*\s*(.*)$/i;
  for (const line of lines) {
    if (!line) continue;
    if (questionRegex.test(line)) {
      if (current) quizzes.push(current);
      current = { question: '', options: [], answer: '', explanation: '' };
      continue;
    }
    const qMatch = qTextRegex.exec(line);
    if (qMatch && current) {
      current.question = qMatch[1];
      continue;
    }
    const optMatch = optionRegex.exec(line);
    if (optMatch && current) {
      const label = optMatch[2].toUpperCase();
      const text = optMatch[3];
      current.options.push({ label, text });
      continue;
    }
    const ansMatch = answerRegex.exec(line);
    if (ansMatch && current) {
      current.answer = ansMatch[1].toUpperCase();
      continue;
    }
    const explMatch = explanationRegex.exec(line);
    if (explMatch && current) {
      current.explanation = explMatch[1];
    }
  }
  if (current) quizzes.push(current);
  return quizzes;
}

