import React from "react";
import { MyCode } from "./CustomCodeComponents";
import { HighlightedCode } from "codehike/code";

interface GuidedExerciseProps {
  title: string;
  description: string;
  steps: string[];
  codeSnippet?: HighlightedCode;
}

export const GuidedExercise: React.FC<GuidedExerciseProps> = ({
  title,
  description,
  steps,
  codeSnippet
}) => {
  // const codeSnippetObj = codeSnippet ? JSON.parse(codeSnippet) : null;

  return (
    <div className='guided-exercise'>
      <h2>{title}</h2>
      <p>{description}</p>
      <ol>
        {steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
      {codeSnippet && <MyCode codeblock={codeSnippet} />}
    </div>
  );
};
