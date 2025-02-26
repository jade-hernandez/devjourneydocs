"use client";

import React, { useState } from "react";
import styles from "@/styles/quiz.module.css";

interface QuizProps {
  question: string;
  options: string[];
  correctAnswer: string;
}

export const Quiz: React.FC<QuizProps> = ({
  question,
  options,
  correctAnswer
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setIsCorrect(answer === correctAnswer);
  };

  const resetQuiz = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  return (
    <div className={styles.quizContainer}>
      <h3 className={styles.question}>{question}</h3>
      <div className={styles.optionsGrid}>
        {options.map(option => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            className={`${styles.optionButton} ${
              selectedAnswer === option ? styles.selected : ""
            }`}
            disabled={isCorrect !== null}
          >
            {option}
          </button>
        ))}
      </div>
      {isCorrect !== null && (
        <div className={styles.feedbackContainer}>
          <p
            className={`${styles.feedback} ${
              isCorrect ? styles.correct : styles.incorrect
            }`}
          >
            {isCorrect ? "✅ Correct!" : "❌ Try again!"}
          </p>
          <button
            onClick={resetQuiz}
            className={styles.tryAgainButton}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};
