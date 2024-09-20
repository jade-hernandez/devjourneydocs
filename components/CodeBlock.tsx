import React from "react";
import { Highlight, themes } from "prism-react-renderer";
import type { Language } from "prism-react-renderer";

interface CodeBlockProps {
  children: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className }) => {
  let language = className?.replace(/language-/, "") ?? "typescript";

  const validLanguages: Language[] = [
    "markup",
    "bash",
    "clike",
    "c",
    "cpp",
    "css",
    "javascript",
    "jsx",
    "coffeescript",
    "actionscript",
    "css-extr",
    "diff",
    "git",
    "go",
    "graphql",
    "handlebars",
    "json",
    "less",
    "makefile",
    "markdown",
    "objectivec",
    "ocaml",
    "python",
    "reason",
    "sass",
    "scss",
    "sql",
    "stylus",
    "typescript",
    "wasm",
    "yaml"
  ];

  if (!validLanguages.includes(language)) {
    console.warn(
      `Unsupported language "${language}" provided to CodeBlock. Falling back to "text".`
    );
    language = "text";
  }

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
            overflow: "auto"
          }}
        >
          {tokens.map((line, i) => (
            <div
              key={i}
              {...getLineProps({ line, key: i })}
            >
              {line.map((token, key) => (
                <span
                  key={key}
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
