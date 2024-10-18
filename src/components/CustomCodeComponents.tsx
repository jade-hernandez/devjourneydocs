// "use client";

// import React from "react";
// import { Pre, Inline, HighlightedCode } from "codehike/code";

// interface MyCodeProps {
//   codeblock: HighlightedCode;
// }

// export const MyCode: React.FC<MyCodeProps> = ({ codeblock }) => {
//   return <Pre code={codeblock} />;
// };

// export const MyInlineCode: React.FC<MyCodeProps> = ({ codeblock }) => {
//   return <Inline code={codeblock} />;
// };
import type { AnnotationHandler, RawCode } from "codehike/code";
import { Pre, highlight } from "codehike/code";

export interface MyCodeProps {
  codeblock: RawCode;
}

export async function MyCode({ codeblock }: Readonly<MyCodeProps>) {
  console.log("codeblock", codeblock, typeof codeblock);
  const highlighted = await highlight(codeblock, "github-dark");
  console.log("highlighted", highlighted, typeof highlighted);
  return (
    <Pre
      code={highlighted}
      handlers={[borderHandler, bgHandler]}
    />
  );
}

const borderHandler: AnnotationHandler = {
  name: "border",
  Block: ({ annotation, children }) => (
    <div style={{ border: "1px solid red" }}>{children}</div>
  )
};

const bgHandler: AnnotationHandler = {
  name: "bg",
  Inline: ({ annotation, children }) => (
    <span style={{ background: "#2d26" }}>{children}</span>
  )
};
