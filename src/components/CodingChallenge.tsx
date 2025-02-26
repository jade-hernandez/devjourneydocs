"use client";

import React from "react";
import dynamic from "next/dynamic";
import { LiveProvider, LiveError, LivePreview } from "react-live";
import styles from "@/src/styles/coding-challenge.module.css";

const LiveEditorWithNoSSR = dynamic(
  () => import("react-live").then(mod => mod.LiveEditor),
  { ssr: false }
);

interface CodingChallengeProps {
  initialCode: string;
  solution: string;
}

export const CodingChallenge: React.FC<CodingChallengeProps> = ({
  initialCode,
  solution
}) => {
  const [editorCode, setEditorCode] = React.useState(initialCode);
  const [executedCode, setExecutedCode] = React.useState(initialCode);
  const [showSolution, setShowSolution] = React.useState(false);
  const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null);

  const handleToggleSolution = () => {
    setShowSolution(!showSolution);
    if (showSolution) {
      setEditorCode(initialCode);
      setExecutedCode(initialCode);
      setIsCorrect(null);
    }
  };

  const handleRunCode = () => {
    setExecutedCode(editorCode);
    const cleanCode = editorCode.replace(/\s/g, "");
    const cleanSolution = solution.replace(/\s/g, "");
    const isCorrect = cleanCode === cleanSolution;
    setIsCorrect(isCorrect);
  };

  return (
    <div className={styles.codingChallenge}>
      <LiveProvider
        code={executedCode}
        noInline={true}
      >
        <LiveEditorWithNoSSR
          onChange={updatedCode => setEditorCode(updatedCode)}
          code={editorCode}
        />
        <LiveError />
        <LivePreview />
      </LiveProvider>
      <div className={styles.buttonContainer}>
        <button
          onClick={handleRunCode}
          className={styles.runCodeBtn}
        >
          Run the code
        </button>
        <button
          onClick={handleToggleSolution}
          className={`${styles.toggleSolutionBtn} ${showSolution ? styles.hideSolutionBtn : ""}`}
        >
          {showSolution ? "Hide Solution" : "Show Solution"}
        </button>
      </div>
      {isCorrect !== null && (
        <p className={isCorrect ? styles.correct : styles.incorrect}>
          {isCorrect ? "Correct! 🚀" : "Oops Try again 😵‍💫"}
        </p>
      )}
      {showSolution && (
        <div className={styles.solutionContainer}>
          <h4>Solution:</h4>
          <LiveProvider
            code={solution}
            noInline={true}
          >
            <LiveEditorWithNoSSR disabled />
          </LiveProvider>
        </div>
      )}
    </div>
  );
};
