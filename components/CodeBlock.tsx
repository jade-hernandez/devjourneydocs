import React from "react";
import { Highlight, themes, type Language } from "prism-react-renderer";

interface CodeBlockProps {
  children: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className }) => {
  const language = (
    className ? className.replace(/language-/, "") : "typescript"
  ) as Language;

  return (
    <Highlight
      theme={themes.nightOwl}
      code={children.trim()}
      language={language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={className}
          style={{
            ...style,
            padding: "1rem",
            borderRadius: "0.5rem",
            overflow: "auto",
          }}
        >
          {tokens.map((line, i) => (
            <div key={`line-${i}`} {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span
                  key={`token-${i}-${key}`}
                  {...getTokenProps({ token, key })}
                />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};

export default CodeBlock;
