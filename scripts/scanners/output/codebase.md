## .editorconfig
```
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
trim_trailing_whitespace = true
insert_final_newline = true
```

## .prettierignore
```
# **/*.mdx
```

## .yarnrc.yml
```
yarnPath: .yarn/releases/yarn-4.4.1.cjs

```

## auto-codebase.js
```
/* eslint-disable @typescript-eslint/no-var-requires */
import { createWriteStream, promises as fsp } from "fs";
import { join, extname, dirname } from "path";
import { createInterface } from "readline";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

const defaultOutputFilePath = "./scripts/scanners/output/codebase.md";

// Directories to ignore by default
const defaultIgnoreDirs = [
  "cicd",
  "node_modules",
  "public",
  "build",
  "dist",
  "helm",
  "verdaccio",
  "types",
  "coverage"
];

// Files to ignore by default
const defaultIgnoreFiles = [
  ".DS_Store",
  ".env",
  ".gitignore",
  ".prettierrc",
  ".eslintrc.js",
  "yarn.lock",
  "package-lock.json",
  "tsconfig.json",
  "jest.config.js",
  "webpack.config.js",
  "babel.config.js",
  "verdaccio.yaml",
  "Dockerfile",
  "docker-compose.yml",
  "Jenkinsfile",
  "Makefile",
  "README.md"
];

// Function to recursively get all file paths based on specified conditions
async function getAllFiles(
  dir,
  includeExtensions = [],
  excludeExtensions = [],
  ignoreDirs = [],
  ignoreFiles = [],
  files = []
) {
  let items;
  try {
    items = await fsp.readdir(dir);
  } catch (err) {
    console.error(`Error reading directory ${dir}: ${err.message}`);
    return files;
  }

  for (const item of items) {
    const fullPath = join(dir, item);
    let stats;
    try {
      stats = await fsp.stat(fullPath);
    } catch (err) {
      console.error(`Error getting stats of ${fullPath}: ${err.message}`);
      continue;
    }

    if (stats.isDirectory() && !ignoreDirs.includes(item)) {
      await getAllFiles(
        fullPath,
        includeExtensions,
        excludeExtensions,
        ignoreDirs,
        ignoreFiles,
        files
      );
    } else if (stats.isFile() && !ignoreFiles.includes(item)) {
      const fileExt = extname(fullPath);
      const include =
        includeExtensions.length === 0 || includeExtensions.includes(fileExt);
      const exclude = excludeExtensions.includes(fileExt);
      if (include && !exclude) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

// Function to write file paths and their content to the output file
async function writeContentToFile(files, outputFilePath) {
  // Create the output directory if it doesn't exist
  const outputDir = dirname(outputFilePath);
  try {
    await fsp.mkdir(outputDir, { recursive: true });
  } catch (err) {
    console.error(`Error creating directory ${outputDir}: ${err.message}`);
    return;
  }

  const outputStream = createWriteStream(outputFilePath, { flags: "w" });

  for (const file of files) {
    try {
      const content = await fsp.readFile(file, "utf8");
      outputStream.write(`## ${file}\n\`\`\`\n${content}\n\`\`\`\n\n`);
    } catch (err) {
      console.error(`Error reading file ${file}: ${err.message}`);
    }
  }

  outputStream.end(() => {
    console.log(
      `Content of the selected files has been written to ${outputFilePath}`
    );
  });
}

// Function to prompt user input
function promptUser() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(
    "Enter the directory to scan (default is current directory): ",
    inputDir => {
      rl.question(
        "Specify file types to include (comma-separated, e.g., .ts,.js) (default is all files): ",
        includeTypes => {
          rl.question(
            "Specify file types to exclude (comma-separated, e.g., .spec.ts) (default is none): ",
            excludeTypes => {
              rl.question(
                "Specify additional directories to ignore (comma-separated): ",
                additionalIgnoreDirs => {
                  rl.question(
                    "Specify additional files to ignore (comma-separated): ",
                    additionalIgnoreFiles => {
                      rl.question(
                        `Specify the output file path (default is ${defaultOutputFilePath}): `,
                        outputPath => {
                          const directoryToScan = inputDir || ".";
                          const includeExtensions = includeTypes
                            .split(",")
                            .map(ext => ext.trim())
                            .filter(ext => ext);
                          const excludeExtensions = excludeTypes
                            .split(",")
                            .map(ext => ext.trim())
                            .filter(ext => ext);
                          const ignoreDirs = defaultIgnoreDirs.concat(
                            additionalIgnoreDirs
                              .split(",")
                              .map(dir => dir.trim())
                              .filter(dir => dir)
                          );
                          const ignoreFiles = defaultIgnoreFiles.concat(
                            additionalIgnoreFiles
                              .split(",")
                              .map(file => file.trim())
                              .filter(file => file)
                          );
                          const outputFilePath =
                            outputPath || defaultOutputFilePath;

                          (async () => {
                            try {
                              const files = await getAllFiles(
                                directoryToScan,
                                includeExtensions,
                                excludeExtensions,
                                ignoreDirs,
                                ignoreFiles
                              );
                              await writeContentToFile(files, outputFilePath);
                            } catch (error) {
                              console.error(
                                `Error processing files: ${error.message}`
                              );
                            } finally {
                              rl.close();
                            }
                          })();
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
}

// Parse command-line arguments
const argv = yargs(hideBin(process.argv)).argv;
const autoConfirm = argv.y;

if (autoConfirm) {
  // Use default values without prompts
  const directoryToScan = "./src";
  const includeExtensions = [];
  const excludeExtensions = [];
  const ignoreDirs = defaultIgnoreDirs;
  const ignoreFiles = defaultIgnoreFiles;
  const outputFilePath = defaultOutputFilePath;

  (async () => {
    try {
      const files = await getAllFiles(
        directoryToScan,
        includeExtensions,
        excludeExtensions,
        ignoreDirs,
        ignoreFiles
      );
      await writeContentToFile(files, outputFilePath);
    } catch (error) {
      console.error(`Error processing files: ${error.message}`);
    }
  })();
} else {
  promptUser();
}

```

## components/Callout.tsx
```
import React from "react";

type CalloutType = "info" | "warning" | "error" | "tip";

interface CalloutProps {
  children: React.ReactNode;
  type?: CalloutType;
  emoji?: string;
}

const typeStyles: Record<CalloutType, string> = {
  info: "bg-blue-100 border-blue-500 text-blue-900",
  warning: "bg-yellow-100 border-yellow-500 text-yellow-900",
  error: "bg-red-100 border-red-500 text-red-900",
  tip: "bg-green-100 border-green-500 text-green-900"
};

const Callout: React.FC<CalloutProps> = ({
  children,
  type = "info",
  emoji
}) => {
  return (
    <div className={`p-4 my-4 border-l-4 ${typeStyles[type]}`}>
      <div className='flex items-center'>
        {emoji && <span className='text-2xl mr-2'>{emoji}</span>}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Callout;

```

## components/CodeBlock.tsx
```
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

```

## components/CustomCodeComponents.tsx
```
import React from "react";
import { Pre, Inline, HighlightedCode } from "codehike/code";

interface MyCodeProps {
  codeblock: HighlightedCode;
}

export const MyCode: React.FC<MyCodeProps> = ({ codeblock }) => {
  return <Pre code={codeblock} />;
};

export const MyInlineCode: React.FC<MyCodeProps> = ({ codeblock }) => {
  return (
    <Inline
      code={codeblock}
      style={codeblock.style}
    />
  );
};

```

## components/ProgressTracker.tsx
```
import React from "react";

interface ProgressTrackerProps {
  completed: number;
  total: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  completed,
  total
}) => {
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className='mt-4'>
      <div className='flex justify-between mb-1'>
        <span className='text-base font-medium text-blue-700 dark:text-white'>
          Learning Progress
        </span>
        <span className='text-sm font-medium text-blue-700 dark:text-white'>
          {percentage}%
        </span>
      </div>
      <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700'>
        <div
          className='bg-blue-600 h-2.5 rounded-full'
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className='text-sm text-gray-500 mt-1'>
        {completed} of {total} topics completed
      </div>
    </div>
  );
};

export default ProgressTracker;

```

## docs/Roadmap.md
```
# React Concepts Roadmap

## Table of Contents

- [React Concepts Roadmap](#react-concepts-roadmap)
  - [Table of Contents](#table-of-contents)
  - [Level 1](#level-1)
  - [Level 2](#level-2)
  - [Level 3](#level-3)
  - [Level 4](#level-4)
  - [Color legend](#color-legend)

---

## Level 1

1. **Introduction to React** 🟢 ✅

   - What is React?
   - How does it differ from VanillaJS + HTML?
   - What advantages does it offer?
   - Virtual DOM (ShadowDOM, DOM)
   - React's core philosophy
     - Why was it created, in which context and for what purpose?
     - Which problems does it solve?

2. **JSX** 🟢 ✅

   - What is it?
   - Syntax and usage
   - Embedding expressions
   - JSX vs vanilla HTML

3. **Components** 🟢 ✅

   - Functional Components
   - Class Components ⛔️ -> Why are functional Components preferred over class Components
   - Props & children prop
   - children vs Children
   - Local State

4. **State** 🟢 💡 Revoir les exemples de codes (multiple State variables & Lifting State up)

   - What is what?
   - Global & local State (Refresh on the notion of Scope in JavaScript)
   - Why and how to use each one?
   - In which context?
   - For what purpose?

5. **React Hooks and custom Hooks** 🟡 ✅

   - What is what?
   - Why and how to use each one?
   - In which context?
   - For what purpose?
   - How does it differ to VanillaJS?
   - What value does these bring to our codebase?
   - Creating custom hooks
   - Reusing logic across components
   - Best practices for custom hooks

---

## Level 2

1. **Handling Events** 🟢 ✅

   - Event handlers in React (vs in HTML)
   - Synthetic events
     - What are these?
     - What they do?
     - Why do they exist in the first place?

2. **Conditional Rendering** 🟢 ✅

   - If Statements

     `if (condition === true) return true`

     ```javascript
     if (condition === true) {
       return true;
     } else {
       return false;
     }
     ```

     - VanillaJS usage comparison
     - When to use these?

   - Ternary operators
     `return condition ? true : false;`

     - Why its convenient to use?
     - When to use traditional `if` Statements over `ternaries`?

   - Logical operators
     `variable is non null, variable value applies ?? otherwise this "default" value will`

     - When and where to use these?

   - Switch Statements
   - When and where to use these?

   ```javascript
   switch (expression) {
     case "a":
       // code block
       break;
     default:
     // default code block
   }
   ```

3. **Lists and Keys** 🟢 ✅

   - Rendering lists (Arrays or Objects, What is a map and why it's super important?)
   - Importance of keys (Why do they exist? How uniqueness is of primary importance? What use React has of these?)

4. **useState** 🟢 ✅

   - What is it?
   - Why does it exist?
   - For which purpose?

5. **Forms in React** 🟡 ✅ TODO: Revoir les exemples de codes

   - Controlled Components
   - Uncontrolled Components
   - formState
   - Refresh on HTML form, input, label, button tags and their APIs

6. **Styling in React** 🟡 ✅
   - Inline styles (React way -> bad)
   - Inline styles (Tailwind way -> Why does it exist? For which usage? In which context?)
   - CSS modules, SCSS, vanilla CSS, PostCSS (What is what? Why each does it exist? For which usage? In which context?)
   - CSS-in-JS -> Styled-Components, Emotion and others (What is what? Why does it exist? For which usage? In which context?)

---

## Level 3

1. **useEffect** 🟡 ✅

   - What is it?
   - Why does it exist?
   - For which purpose?
   - Why was it created in the first place?
   - When was it created?
   - Cleanup functions
     - What are these?
     - When to use one?
   - Lifecycle methods
     - What are these?
     - How was the lifecycle handled in Class Components?
     - How is it handled in Functional Components?
     - What control do we have over it?

2. **Context API & useContext** 🟡 ✅

   - What is it?
   - Why does it exist?
   - For which purpose?
   - Creating context
   - Creating Providers and consuming context
   - useContext hook

3. **useRef and forwardRef** 🟡 TODO: A réexpliquer

   - What is it?
   - Why does it exist?
   - For which purpose?
   - Store mutable values

   - What is a ref? How do we create one? For which usage?
   - Accessing DOM nodes -> In other words, accessing the children from the parent component
   - Forwarding refs -> What are these? What do they allow? When to use one?

4. **React Fragments** 🟢 ✅

   - What are React Fragments?
   - Using <React.Fragment> vs. shorthand syntax <>
   - When and why to use Fragments

5. **Composition pattern** 🟡 ✅

   - What is it?
   - What does it allow?
   - When to use it?

6. **Render Props** 🟡 TODO: Réexpliquer les exemples, A quel moment on le met en place?

- Pattern explanation
- Comparison with HOCs

1. **Testing React Applications** 🟡 TODO: A expliquer

   - Why do we need to test our applications?
   - Jest
   - React Testing Library
   - Component testing strategies

2. **Higher-Order Components (HOCs)** 🟠 TODO: Revoir les exemples de code

   - Concept and usage
   - Why do we need these?
   - When to leverage them?

3. **useReducer** 🟠 TODO: Revoir les exemples de code (useReducer with Complex State)

   - What is it?
   - Why does it exist?
   - For which purpose?

4. **Error Boundaries** 🟠 TODO: A quel moment on l'utilise? L'utilise-t-on tout le temps? Exemple concret

   - Catching JavaScript errors
   - Fallback UI

5. **Loading State** 🟠 TODO: A revoir(Gérer l'état de chargement, donner un feedback à l'utilisateur)

   - Handling loading States
   - Fallback UI

6. **Portals** 🟠 TODO: A Expliquer

   - What are these? Why do we need portals?
   - Rendering children into different DOM subtrees

7. **Code Splitting** 🟠 TODO: A réexpliquer (pour améliorer les performances des applications )

   - Dynamic imports
   - React.lazy and Suspense

8. **useLayoutEffect** 🟣 TODO: A revoir (version de useEffect qui fonctionne de manière synchrone, cad immédiatement, le reste du programme attend avant de s'executer)

   - What is it?
   - Why does it exist?
   - For which purpose?

9. **useImperativeHandle** TODO: A expliquer

- What is it?
- Why does it exist?
- For which purpose?
- Unit vs Integration vs E2E testing

---

## Level 4

1. **React Router** 🟡 (Bibliothèque React pour la navigation)

   - Setting up routes
   - Navigation
   - Route parameters

2. **Performance Optimization** 🟠

   - useMemo
   - useCallback
   - memo
   - Profiler API -> What is it? Why does it exist? For which purpose?

3. **Suspense** 🟠

   - Data fetching with Suspense

4. **State Management Libraries** 🟣

   - Redux
   - Redux Toolkit
   - Zustand

5. **Server-Side Rendering (SSR)** 🟣

   - Concepts and benefits
   - Implementation with frameworks like Next.js

6. **Concurrent Mode** 🔴
   - Concurrent rendering

---

## Color legend

- 🟢: L1 - Junior
- 🟡: L2 - Mid leve
- 🟠: L3 - Denior
- 🟣: L4 - Lead
- 🔴: L5 - Lead or Principal

```

## next-env.d.ts
```
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/pages/building-your-application/configuring/typescript for more information.

```

## next.config.mjs
```
import nextra from "nextra";
// import remarkGfm from "remark-gfm";
// import rehypePrism from "@mapbox/rehype-prism";
// import { remarkCodeHike, recmaCodeHike } from "codehike/mdx";

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx"
  // mdxOptions: {
  //   remarkPlugins: [
  //     remarkGfm,
  //     [
  //       remarkCodeHike,
  //       {
  //         theme: "github-dark"
  //       }
  //     ]
  //   ],
  //   recmaPlugins: [recmaCodeHike],
  //   rehypePlugins: [rehypePrism]
  // }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

export default withNextra(nextConfig);
// import remarkGfm from "remark-gfm";
// import rehypePrism from "@mapbox/rehype-prism";
// import { remarkCodeHike, recmaCodeHike } from "codehike/mdx";
// import nextMDX from "@next/mdx";
// import nextra from "nextra";

// const withNextra = nextra({
//   theme: "nextra-theme-docs",
//   themeConfig: "./theme.config.tsx"
// });

// /** @type {import('codehike/mdx').CodeHikeConfig} */
// const chConfig = {
//   components: {
//     code: "MyCode",
//     inlineCode: "MyInlineCode"
//   },
//   syntaxHighlighting: {
//     theme: "github-dark"
//   }
// };

// const withMDX = nextMDX({
//   extension: /\.mdx?$/,
//   options: {
//     remarkPlugins: [[remarkCodeHike, chConfig], remarkGfm],
//     recmaPlugins: [[recmaCodeHike, chConfig]],
//     rehypePlugins: [rehypePrism],
//     jsx: true
//   }
// });

// const nextConfig = {
//   pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
//   experimental: { esmExternals: true }
// };

// export default withNextra(withMDX(nextConfig));

```

## package.json
```
{
  "name": "documentation-website",
  "type": "module",
  "packageManager": "yarn@4.4.1",
  "scripts": {
    "dev": "next",
    "build": "next build",
    "start": "next start",
    "prettier:check": "prettier --check --config ./.prettierrc '{public,src,pages,components}/**/*.{htm,html,js,jsx,ts,tsx,css,md,mdx}'",
    "prettier:fix": "prettier --write --list-different --config ./.prettierrc '{public,src,pages,components}/**/*.{htm,html,js,jsx,ts,tsx,css,md,mdx}'"
  },
  "dependencies": {
    "@mapbox/rehype-prism": "^0.9.0",
    "@mdx-js/loader": "^3.0.1",
    "@mdx-js/react": "^3.0.1",
    "@next/mdx": "^14.2.14",
    "codehike": "^1.0.2",
    "fs": "^0.0.1-security",
    "next": "^14.2.9",
    "nextra": "^3.0.7",
    "nextra-theme-docs": "^3.0.7",
    "prism-react-renderer": "^2.4.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "remark-gfm": "^4.0.0",
    "yargs": "^17.7.2"
  },
  "devDependencies": {
    "@types/mapbox__rehype-prism": "^0",
    "@types/node": "^22.5.4",
    "@types/react": "^18.3.5",
    "prettier": "^3.3.3",
    "typescript": "^5.6.2"
  }
}

```

## pages/_app.tsx
```
// import { MyCode, MyInlineCode } from "../components/CustomCodeComponents";
import type { AppProps } from "next/app";

import "./global.css";
// import "codehike/styles.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Component
      {...pageProps}
      style={{ margin: "0 auto", maxWidth: "800px", background: "red" }}
      // components={{
      //   MyCode,
      //   MyInlineCode
      // }}
    />
  );
}

```

## pages/_meta.js
```
export default {
  react: "React",
  "styled-components": "Styled Components",
  typescript: "TypeScript",
  jest: "Jest",
  storybook: "Storybook"
};

```

## pages/global.css
```

```

## pages/index.mdx
```
# Welcome to my personal documentation

Hello, world!

```

## pages/jest/_meta.js
```
export default {};

```

## pages/jest/setup.mdx
```

```

## pages/jest/writing-tests.mdx
```

```

## pages/react/L1-junior/_meta.js
```
export default {
  "introduction-to-react": "Introduction to React",
  jsx: "JSX syntax",
  components: "Components",
  state: "State",
  "react-hooks-and-custom-hooks": "React Hooks and Custom Hooks"
};

```

## pages/react/L1-junior/components.mdx
```
import { Callout } from "nextra/components";

# React Components

## Brief Overview

<Callout emoji='💡'>
  React Components are reusable, self-contained pieces of UI. They can be as
  simple as a button or as complex as an entire page. Components can be composed
  together to create more complex UIs, promoting code reuse and separation of
  concerns.
</Callout>

## Detailed Explanation

### What are React Components?

React Components are JavaScript functions or classes that return a piece of UI (User Interface). They encapsulate the structure (JSX), behavior (event handlers), and sometimes the style of a part of your application.

### Types of Components

1. **Functional Components**:

   - JavaScript functions that return JSX
   - Simpler and more concise
   - Can use Hooks for state and lifecycle features

2. **Class Components**:
   - JavaScript classes that extend `React.Component`
   - Have their own state and lifecycle methods
   - Less commonly used in modern React development

<Callout emoji='🔍'>
  While both types are still supported, functional components are generally
  preferred in modern React development due to their simplicity and the
  introduction of Hooks.
</Callout>

### Key Concepts in React Components

1. **Props**:

   - Short for "properties"
   - How parent components pass data to child components
   - Read-only in the child component

2. **State**:

   - Data that can change over time
   - Managed within the component (for class components) or with Hooks (for functional components)

3. **Lifecycle** (for class components):

   - Methods that run at different stages of a component's life
   - E.g., `componentDidMount`, `componentDidUpdate`, `componentWillUnmount`

4. **Hooks** (for functional components):
   - Functions that let you use state and other React features without writing a class
   - E.g., `useState`, `useEffect`, `useContext`

### Why Use Components?

1. **Reusability**: Components can be reused throughout your application, reducing code duplication.
2. **Maintainability**: By breaking your UI into components, you make your code more modular and easier to maintain.
3. **Separation of Concerns**: Each component can focus on a specific part of the UI, making your code more organized.
4. **Testing**: Components can be tested in isolation, making it easier to write and maintain tests.

## Code Examples

### 1. Basic Functional Component

```jsx
import React from "react";

function Greeting(props) {
  return <h1>Hello, {props.name}!</h1>;
}

export default Greeting;
```

This simple functional component takes a `name` prop and renders a greeting.

### 2. Basic Class Component

```jsx
import React from "react";

class Greeting extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}!</h1>;
  }
}

export default Greeting;
```

This class component does the same thing as the functional component above.

### 3. Component with State (using Hooks)

```jsx
import React, { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}

export default Counter;
```

This functional component uses the `useState` Hook to manage its own state.

### 4. Component Composition

```jsx
import React from "react";

function Header() {
  return <header>My App Header</header>;
}

function Footer() {
  return <footer>© 2023 My App</footer>;
}

function Content() {
  return <main>This is the main content</main>;
}

function App() {
  return (
    <div>
      <Header />
      <Content />
      <Footer />
    </div>
  );
}

export default App;
```

This example shows how smaller components (`Header`, `Content`, `Footer`) can be composed into a larger component (`App`).

<Callout emoji='🧩'>
  Component composition is a powerful feature in React. It allows you to build
  complex UIs from simpler, reusable parts. This approach makes your code more
  maintainable and easier to understand.
</Callout>

## Best Practices

1. **Keep Components Small and Focused**: Each component should ideally do one thing well.
2. **Use Functional Components and Hooks**: They're simpler and cover most use cases.
3. **Use Default Props**: Provide default values for props to make components more robust.
4. **Follow the Single Responsibility Principle**: Each component should have a single reason to change.

## Common Pitfalls

<Callout>

1. Modifying Props:

   - Mistake: Trying to change prop values directly within a component.
   - Why: Props are meant to be read-only. Modifying them can lead to unexpected behavior.
   - Solution: If you need to modify data passed down as props, consider lifting the state up or using a state management solution.

</Callout>

<Callout>

2. Overusing Class Components:

   - Mistake: Using class components when functional components would suffice.
   - Why: Class components are more verbose and can be harder to understand and test.
   - Solution: Prefer functional components with Hooks for most cases.

</Callout>

<Callout>

3. Not Using Keys in Lists:

   - Mistake: Rendering lists of elements without providing a unique `key` prop.
   - Why: Keys help React identify which items have changed, been added, or been removed.
   - Solution: Always provide a unique key when rendering lists of elements.

</Callout>

<Callout>

4. Mutating State Directly:
   - Mistake: Changing state without using `setState` or the state updater function.
   - Why: React may not re-render the component, leading to unexpected behavior.
   - Solution: Always use `setState` (in class components) or the state updater function (in functional components with `useState`).

</Callout>

## Related Concepts

1. **JSX**: The syntax used to describe the UI in React components.
2. **Virtual DOM**: React's mechanism for efficiently updating the UI, closely tied to how components work.
3. **React Hooks**: Functions that let you use state and other React features in functional components.
4. **Higher-Order Components (HOCs)**: Advanced pattern for reusing component logic.
5. **Context API**: A way to pass data through the component tree without passing props manually at every level.

## Further Resources

<Callout emoji='📚'>

1. [Your First Component](https://react.dev/learn/your-first-component):
   Official React documentation on creating your first component.

2. [Passing
   Props to a Component](https://react.dev/learn/passing-props-to-a-component):
   Learn how to use props in React components.

3. [Conditional
   Rendering](https://react.dev/learn/conditional-rendering): Guide on rendering
   components conditionally.

4. [Rendering
   Lists](https://react.dev/learn/rendering-lists): Learn how to render lists of
   components.

5. [Keeping Components
   Pure](https://react.dev/learn/keeping-components-pure): Understand the
   importance of pure components in React.

</Callout>

```

## pages/react/L1-junior/introduction-to-react.mdx
```
import { Callout } from "nextra/components";

# Introduction to React

## Brief Overview

<Callout emoji='💡'>
  React is a JavaScript library for building user interfaces, particularly for
  single-page applications. It allows developers to create reusable UI
  components that manage their own state, resulting in complex UIs from small,
  isolated pieces of code.
</Callout>

## Detailed Explanation

### What is React and How Does it Work?

React is an open-source JavaScript library developed by Facebook for building user interfaces. It works by allowing developers to create reusable UI components that efficiently update and render when data changes. React uses a virtual DOM (Document Object Model) to improve performance by minimizing direct manipulation of the browser's DOM.
React was designed to solve the problem of building large applications with data that changes over time. It aimed to be simple, declarative, and composable.

### Why Was React Introduced?

React was introduced to solve several problems in web development:

1. Complexity in building large-scale, dynamic web applications
2. Performance issues with frequent DOM updates
3. Difficulty in maintaining and reusing UI code

### React vs. Vanilla JavaScript and HTML

<Callout emoji='🔍'>
  Unlike vanilla JavaScript and HTML, where developers often directly manipulate
  the DOM, React provides a declarative approach. You describe how your UI
  should look based on the current application state, and React efficiently
  updates and renders the right components when the data changes.
</Callout>

### Advantages of React

1. Component-Based Architecture: Encourages reusable, modular code
2. Virtual DOM: Improves performance by minimizing actual DOM manipulation
3. Unidirectional Data Flow: Makes it easier to track and debug state changes
4. Rich Ecosystem: Vast library of tools, extensions, and community support
5. React Native: Allows for native mobile app development with the same principles

### Virtual DOM

<Callout emoji='🚀'>
  The Virtual DOM is a lightweight copy of the actual DOM. When state changes
  occur, React first updates this virtual DOM, compares it with the previous
  version (a process called "diffing"), and then efficiently updates only the
  necessary parts of the actual DOM. This process significantly improves
  performance, especially in applications with frequent updates.
</Callout>

### Evolution of React

Since its introduction, React has evolved significantly:

- Introduction of JSX (2013)
- React Native for mobile development (2015)
- Hooks for state management in functional components (2019)
- Concurrent Mode for improved rendering (ongoing development)

## Code Examples

### 1. "Hello, World!" in React

```js copy showLineNumbers
import React from "react";
import ReactDOM from "react-dom";

function HelloWorld() {
  return <h1>Hello, World!</h1>;
}

ReactDOM.render(<HelloWorld />, document.getElementById("root"));
```

This example demonstrates the basic structure of a React component and how it's rendered to the DOM.

### 2. Component-Based Architecture

```jsx
import React from "react";

function Header() {
  return <header>My App Header</header>;
}

function Content() {
  return <main>This is the main content</main>;
}

function Footer() {
  return <footer>© 2023 My App</footer>;
}

function App() {
  return (
    <div>
      <Header />
      <Content />
      <Footer />
    </div>
  );
}

export default App;
```

<Callout emoji='🧩'>
  This example showcases how React's component-based architecture allows for
  modular, reusable UI elements. Each part of the UI is encapsulated in its own
  component, making the code more maintainable and easier to understand.
</Callout>

### 3. React vs. Vanilla JavaScript

React:

```jsx
import React, { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

Vanilla JavaScript:

```javascript
let count = 0;
const counterElement = document.getElementById("counter");
const buttonElement = document.getElementById("button");

function updateCounter() {
  counterElement.textContent = `You clicked ${count} times`;
}

buttonElement.addEventListener("click", () => {
  count++;
  updateCounter();
});

updateCounter();
```

<Callout emoji='⚖️'>
  The React version is more declarative and encapsulates state management within
  the component, leading to more maintainable code. It demonstrates how React
  simplifies UI updates by automatically re-rendering when the state changes.
</Callout>

## Best Practices

1. **Use Functional Components and Hooks**: They're simpler, more readable, and
   easier to test.
2. **Keep Components Small and Focused**: This improves
   reusability and makes debugging easier.
3. **Lift State Up When Necessary**: If multiple components need the same state, move it to their
   closest common ancestor.
4. **Use Keys in Lists**: Always use keys when rendering
   lists of elements to help React identify which items have changed.

## Common Pitfalls

<Callout>

1. **Modifying State Directly**:

   - Mistake: Changing state without using setState or the state updater function.
   - Why: React may not re-render the component, leading to unexpected behavior.
   - Solution: Always use setState or the state updater function provided by useState.

</Callout>

<Callout>

2. **Overusing State**:

   - Mistake: Storing everything in state, including data that can be computed from props or other state.
   - Why: This can lead to inconsistencies and make the component harder to maintain.
   - Solution: Derive values from props or state when possible, use useMemo for expensive computations.

</Callout>

<Callout>

3. **Not Understanding React's Lifecycle**:

   - Mistake: Misusing useEffect or not cleaning up side effects.
   - Why: Can lead to memory leaks or unexpected behavior.
   - Solution: Understand and properly use useEffect, including the cleanup function when necessary.

</Callout>

<Callout>

4. **Prop Drilling**:

   - Mistake: Passing props through multiple levels of components that don't need them.
   - Why: Makes code harder to maintain and understand.
   - Solution: Use Context API for global state or consider state management libraries for complex applications.

</Callout>

## Related Concepts

1. **JSX**: A syntax extension for JavaScript that looks similar to XML/HTML and is used to describe what the UI should look like.
2. **State Managemen**t: Beyond React's built-in state, libraries like Redux or MobX are often used for managing complex application state.
3. **React Router**: A standard routing library for React, used to handle navigation in single-page applications.
4. **React Hooks**: Functions that let you use state and other React features in functional components.

## Further Resources

<Callout emoji='📚'>

1. [React Official Documentation](https://react.dev/learn): Comprehensive
   guide to all React concepts and APIs.

2. [Egghead.io's Beginner's Guide to
   React](https://egghead.io/courses/the-beginner-s-guide-to-react): Free video
   course covering React basics.

3. [Overreacted](https://overreacted.io/): Blog
   by Dan Abramov, a core React team member, offering deep dives into React
   concepts.

</Callout>

```

## pages/react/L1-junior/jsx.mdx
```
import { Callout } from "nextra/components";

# JSX in React

## Brief Overview

<Callout emoji='💡'>
  JSX is a syntax extension for JavaScript that looks similar to XML or HTML. It
  allows you to write HTML-like code in your JavaScript files, making it easier
  to describe the structure of UI components in React applications.
</Callout>

## Detailed Explanation

### What is JSX and How Does it Work in React?

JSX (JavaScript XML) is a syntax extension for JavaScript recommended by React. It allows you to write HTML-like code directly in your JavaScript files. When a file containing JSX is compiled, the JSX is transformed into regular JavaScript function calls.

### Why Was JSX Introduced?

JSX was introduced to solve several problems in React development:

1. Improve readability and writeability of React components
2. Provide a familiar syntax for defining component structure (similar to HTML)
3. Enable static analysis and type checking with tools like ESLint

### JSX vs. Vanilla HTML and JavaScript

<Callout emoji='🔍'>
  Unlike vanilla HTML, JSX is not valid JavaScript on its own. It needs to be
  transpiled into JavaScript before it can be run in a browser. JSX provides a
  more declarative and intuitive way to describe UI components.
</Callout>

### Key Features of JSX

1. XML-like syntax
2. Ability to embed JavaScript expressions
3. Represents objects (React elements)
4. Supports attributes (similar to HTML)
5. Can contain child elements

### JSX Transformation

JSX is transformed into regular JavaScript by tools like Babel. For example:

```jsx
const element = <h1>Hello, world!</h1>;
```

is transformed into:

```javascript
const element = React.createElement("h1", null, "Hello, world!");
```

<Callout emoji='🔧'>
  Understanding this transformation is crucial for debugging and optimizing your
  React applications. It helps you grasp what's happening under the hood when
  you write JSX.
</Callout>

### Syntax and Usage of JSX

#### Basic Syntax Rules

- JSX tags can contain children
- JSX must return a single root element (or use fragments)
- JSX uses camelCase property naming instead of HTML attribute names

#### Embedding Expressions in JSX

You can embed any JavaScript expression in JSX by wrapping it in curly braces:

```jsx
const name = "John";
const element = <h1>Hello, {name}</h1>;
```

#### JSX Attributes

JSX uses camelCase for attribute names and can take string literals or JavaScript expressions as values:

```jsx
const element = (
  <div
    className='container'
    style={{ backgroundColor: "blue" }}
  >
    Content
  </div>
);
```

### Limitations and Gotchas

<Callout emoji='⚠️'>
  - JSX is not HTML and has some syntax differences (e.g., `className` instead
  of `class`) - JSX expressions must be wrapped in parentheses when spanning
  multiple lines - All tags must be closed (including self-closing tags like `
  <img />` )
</Callout>

## Code Examples

### 1. Basic JSX Syntax

```jsx
function Greeting() {
  return <h1>Hello, World!</h1>;
}
```

This simple example shows the basic syntax of JSX, demonstrating how HTML-like code can be written directly in a JavaScript function.

### 2. Embedding Expressions in JSX

```jsx
function Greeting(props) {
  const name = props.name;
  return <h1>Hello, {name}!</h1>;
}
```

This example shows how to embed JavaScript expressions (in this case, a variable) within JSX using curly braces.

### 3. Complex JSX with Nested Elements and Attributes

```jsx
function UserProfile(props) {
  return (
    <div className='user-profile'>
      <img
        src={props.avatarUrl}
        alt={props.name}
        className='avatar'
      />
      <h2>{props.name}</h2>
      <p>Age: {props.age}</p>
      <ul>
        {props.hobbies.map((hobby, index) => (
          <li key={index}>{hobby}</li>
        ))}
      </ul>
    </div>
  );
}
```

This more complex example demonstrates nested elements, attribute usage, and embedding of expressions including a map function to generate a list.

### 4. JSX vs. Vanilla JavaScript

JSX:

```jsx
const element = (
  <div className='greeting'>
    <h1>Hello, World!</h1>
    <p>Welcome to React</p>
  </div>
);
```

Equivalent vanilla JavaScript:

```javascript
const element = React.createElement(
  "div",
  { className: "greeting" },
  React.createElement("h1", null, "Hello, World!"),
  React.createElement("p", null, "Welcome to React")
);
```

<Callout emoji='💡'>
  This comparison highlights how JSX simplifies the creation of React elements
  compared to using `React.createElement()` directly, making your code more
  readable and maintainable.
</Callout>

## Best Practices

1. **Use Parentheses for Multiline JSX**: Improves readability and prevents issues with automatic semicolon insertion.
2. **Use Fragments to Return Multiple Elements**: Avoids unnecessary DOM nesting.
3. **Use Semantic HTML Elements in JSX**: Improves accessibility and SEO.
4. **Always Close Tags**: Even for elements that are self-closing in HTML.
5. **Use camelCase for Attribute Names**: Follows JavaScript convention and avoids conflicts with reserved words.

<Callout emoji='🌟'>
  Following these best practices will not only make your JSX code more readable
  and maintainable but also help prevent common errors and improve your
  application's performance and accessibility.
</Callout>

## Common Pitfalls

<Callout>

1. Forgetting to Import React:

   - Mistake: Not importing React when using JSX.
   - Why: JSX is transformed into `React.createElement()` calls, requiring React to be in scope.
   - Solution: Always import React in files using JSX (not necessary in newer versions of React).

</Callout>

<Callout>

2. Using `class` Instead of `className`:

   - Mistake: Using the HTML `class` attribute in JSX.
   - Why: `class` is a reserved word in JavaScript.
   - Solution: Use `className` for CSS classes in JSX.

</Callout>

<Callout>

3. Incorrect Closing of Self-Closing Tags:

   - Mistake: Not properly closing tags like `<img>` or `<input>`.
   - Why: JSX requires all tags to be explicitly closed.
   - Solution: Use self-closing syntax: `<img />` or `<input />`.

</Callout>

<Callout>

4. Rendering Objects Directly:
   - Mistake: Trying to render JavaScript objects directly in JSX.
   - Why: JSX can only render primitive values (strings, numbers) directly.
   - Solution: Convert objects to strings or use object properties individually.

</Callout>

## Related Concepts

1. **React Elements**: JSX is used to create React elements, which are the building blocks of React applications.
2. **Babel**: The tool commonly used to transform JSX into standard JavaScript.
3. **Virtual DOM**: JSX is used to describe the structure of the Virtual DOM in React.
4. **React Components**: JSX is extensively used within React components to define their structure and content.

## Further Resources

<Callout emoji='📚'>

1. [Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx):
   Official introduction to JSX in React.

2. [JavaScript in JSX with Curly
   Braces](https://react.dev/learn/javascript-in-jsx-with-curly-braces): Learn
   how to use JavaScript expressions in JSX.

3. [Babel's JSX
   Documentation](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx):
   Detailed explanation of how Babel transforms JSX.

</Callout>

```

## pages/react/L1-junior/react-hooks-and-custom-hooks.mdx
```
import { Callout } from "nextra/components";

# React Hooks and Custom Hooks

## Brief Overview

<Callout emoji='💡'>
  React Hooks are functions that let you "hook into" React state and lifecycle
  features from functional components. They enable you to use state and other
  React features without writing a class. Custom Hooks allow you to extract
  component logic into reusable functions.
</Callout>

## Detailed Explanation

### What is what?

1. **React Hooks**: Built-in functions provided by React to add state and lifecycle features to functional components (useState, useEffect, useContext, etc.).

2. **Custom Hooks**: User-defined functions that leverage one or more React Hooks to encapsulate and reuse stateful logic across components.

### Why and how to use each one?

1. **useState**:

   - Why: To add state to functional components.
   - How: `const [state, setState] = useState(initialState);`

2. **useEffect**:

   - Why: To perform side effects in functional components.
   - How: `useEffect(() => { /* effect */ }, [dependencies]);`

3. **useContext**:

   - Why: To consume context in functional components.
   - How: `const value = useContext(MyContext);`

4. **useReducer**:

   - Why: For complex state logic that involves multiple sub-values.
   - How: `const [state, dispatch] = useReducer(reducer, initialState);`

5. **useCallback**:

   - Why: To memoize functions for performance optimization.
   - How: `const memoizedCallback = useCallback(() => { /* function */ }, [dependencies]);`

6. **useMemo**:

   - Why: To memoize expensive computations.
   - How: `const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);`

7. **useRef**:
   - Why: To persist values across renders without causing re-renders.
   - How: `const refContainer = useRef(initialValue);`

### In which context?

- Hooks are used in functional components to add features that were previously only available in class components.
- They are used throughout a React application for state management, side effects, context consumption, and performance optimization.

### For what purpose?

- To simplify component logic and make it more readable.
- To reuse stateful logic between components without changing component hierarchy.
- To split one complex component into smaller functions based on related pieces.
- To use React features without classes, making the code more concise and easier to understand.

### What value do these bring to our codebase?

- Improved code reusability and organization.
- Reduced complexity compared to class components and lifecycle methods.
- Easier to test and maintain due to separation of concerns.
- Better performance optimization capabilities.
- More intuitive sharing of stateful logic between components.

### Creating custom hooks

Custom hooks are JavaScript functions that use one or more React hooks. They allow you to extract component logic into reusable functions.

Example of a custom hook:

```jsx
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}
```

### Reusing logic across components

Custom hooks allow you to reuse logic across multiple components without changing their structure.

Example of reusing the custom hook:

```jsx
function WindowWidth() {
  const width = useWindowWidth();
  return <div>Window width: {width}</div>;
}

function AnotherComponent() {
  const width = useWindowWidth();
  return <div>The window is {width > 1000 ? "large" : "small"}</div>;
}
```

### Best practices for custom hooks

1. **Name custom hooks with 'use' prefix**: This convention helps identify hooks and ensures the rules of hooks are enforced.

2. **Keep hooks focused**: Each custom hook should have a single responsibility.

3. **Compose hooks**: Build complex custom hooks by composing simpler ones.

4. **Handle cleanup**: If your custom hook sets up subscriptions or timers, make sure to clean them up.

5. **Use TypeScript**: Define clear interfaces for your custom hooks to improve usability and catch errors early.

6. **Document your hooks**: Provide clear documentation on what the hook does, its parameters, and return values.

7. **Test your hooks**: Write unit tests for your custom hooks to ensure they behave correctly.

## Code Examples

### Basic useState Example

```jsx
import React, { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

Explanation:

- This example demonstrates the basic usage of the `useState` hook.
- `useState(0)` initializes a state variable `count` with an initial value of 0.
- It returns an array with two elements: the current state value (`count`) and a function to update it (`setCount`).
- The `onClick` handler uses `setCount` to increment the count by 1 each time the button is clicked.
- React re-renders the component after each state update, displaying the new count.

### useEffect for Data Fetching

```jsx
import React, { useState, useEffect } from "react";

function DataFetcher() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("https://api.example.com/data")
      .then(response => response.json())
      .then(data => setData(data));
  }, []); // Empty dependency array means this effect runs once on mount

  if (!data) return <div>Loading...</div>;

  return <div>{JSON.stringify(data)}</div>;
}
```

Explanation:

- This example shows how to use `useEffect` for data fetching.
- `useState(null)` initializes a `data` state variable to store the fetched data.
- `useEffect` is used to perform the side effect of fetching data.
- The empty dependency array `[]` ensures that the effect only runs once when the component mounts.
- While data is being fetched (when `data` is still null), a loading message is displayed.
- Once data is fetched, it's displayed by converting it to a JSON string.
- This pattern is common for handling asynchronous operations in functional components.

### Custom Hook Example

```jsx
import { useState, useEffect } from "react";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // Perform search here
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      placeholder='Search...'
    />
  );
}
```

Explanation:

- This example demonstrates creating and using a custom hook `useDebounce`.
- `useDebounce` takes a value and a delay, and returns a debounced version of the value.
- Inside `useDebounce`, `useEffect` sets up a timer that updates the debounced value after the specified delay.
- The cleanup function in `useEffect` clears the timeout if the value changes before the delay has passed.
- In `SearchComponent`, `useDebounce` is used to create a debounced version of the search term.
- This prevents the search from being performed on every keystroke, instead waiting for a pause in typing.
- The `useEffect` in `SearchComponent` will only trigger a search when the debounced search term changes.
- This pattern is useful for performance optimization in scenarios like search inputs or auto-saving forms.

## Best Practices

1. **Follow the Rules of Hooks**: Only call Hooks at the top level and only from React function components or custom Hooks.

2. **Keep Hooks Simple**: Each Hook should ideally do one thing well.

3. **Memoize Expensive Computations**: Use useMemo for expensive calculations to prevent unnecessary re-computation.

4. **Optimize Event Handlers**: Use useCallback to memoize event handlers when passing them to optimized child components.

5. **Prefer Hooks Over HOCs and Render Props**: Hooks often provide a simpler way to reuse logic compared to these patterns.

## Common Pitfalls

<Callout>

1. Ignoring Dependencies:

   - Mistake: Not including all necessary dependencies in useEffect's dependency array.
   - Why: This can lead to stale closures and bugs that are hard to track down.
   - Solution: Use the exhaustive-deps ESLint rule and include all variables from the component scope that the effect uses.

</Callout>

<Callout>

2. Overusing useEffect:

   - Mistake: Using useEffect for synchronous operations that could be done directly in the render phase.
   - Why: This can lead to unnecessary re-renders and complicates the component logic.
   - Solution: Only use useEffect for side effects and asynchronous operations.

</Callout>

<Callout>

3. Incorrect Dependency Array in useMemo and useCallback:

   - Mistake: Not including all dependencies or including unnecessary ones.
   - Why: This can lead to unexpected behavior or negate the performance benefits.
   - Solution: Carefully consider what the callback or computation depends on.

</Callout>

<Callout>

4. Creating Hooks Inside Components:
   - Mistake: Defining custom hooks inside component functions.
   - Why: This creates a new hook on every render, defeating the purpose of hooks.
   - Solution: Always define custom hooks outside of and before your component functions.

</Callout>

## Related Concepts

1. **Functional Components**: Hooks are designed to be used in functional components.
2. **State Management**: Hooks like useState and useReducer are fundamental to state management in React.
3. **Side Effects**: useEffect is crucial for handling side effects in functional components.
4. **Context API**: useContext hook is used to consume React context.
5. **Memoization**: useMemo and useCallback are used for performance optimization through memoization.

## Further Resources

<Callout emoji='📚'>

1. [Hooks API Reference](https://react.dev/reference/react): Official React documentation on Hooks.

2. [Hooks at a Glance](https://react.dev/learn/hooks-overview): A quick introduction to Hooks from the React docs. 🚨🚨🚨🚨🚨🚨

3. [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks): React documentation on creating and using custom Hooks.

4. [Hooks FAQ](https://legacy.reactjs.org/docs/hooks-faq.html): Answers to frequently asked questions about Hooks.

5. [useHooks](https://usehooks.com/): A collection of reusable React Hooks.

6. [React Hooks in Action](https://www.manning.com/books/react-hooks-in-action): A book dedicated to understanding and mastering React Hooks.

7. [Thinking in React Hooks](https://2019.wattenberger.com/blog/react-hooks): A visual guide to understanding Hooks.

</Callout>

```

## pages/react/L1-junior/state.mdx
```
import { Callout } from "nextra/components";

# React State

## Brief Overview

<Callout emoji='💡'>
  State in React represents the parts of your application that can change over
  time. It's similar to props, but it's private and fully controlled by the
  component. When state changes, the component re-renders.
</Callout>

## Detailed Explanation

### What is State in React?

State is a JavaScript object that holds data which may change over time. It represents the values that should be tracked in an application or component. When the state object changes, the component re-renders.

### Why is State Important?

1. **Interactivity**: State allows components to be dynamic and respond to user actions or other events.
2. **Data Management**: It provides a way to store and manage data within a component.
3. **Component Communication**: While props are used for parent-to-child communication, state can be used for communication between components.
4. **Rendering Control**: State changes trigger re-renders, allowing you to control when and how your UI updates.

### State in Class Components vs Functional Components

1. **Class Components**:

   - Use `this.state` to define initial state
   - Use `this.setState()` to update state
   - Have access to lifecycle methods

2. **Functional Components**:
   - Use the `useState` Hook to define and update state
   - Can use multiple state variables
   - Generally preferred in modern React development

<Callout emoji='🔍'>
  While both approaches are valid, functional components with Hooks are
  generally preferred in modern React development due to their simplicity and
  the additional capabilities provided by Hooks.
</Callout>

### Key Concepts in React State

1. **Immutability**:

   - State should never be modified directly
   - Always use `setState` or the state updater function to change state

2. **Asynchronous Updates**:

   - State updates may be batched for performance reasons
   - Don't rely on previous state values for calculating the next state

3. **Lifting State Up**:

   - When multiple components need to share state, move it to their closest common ancestor

4. **Derived State**:
   - When possible, compute values from existing state and props instead of storing them in state

## Code Examples

### 1. State in a Class Component

```jsx
import React from "react";

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  increment = () => {
    this.setState(prevState => ({
      count: prevState.count + 1
    }));
  };

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.increment}>Increment</button>
      </div>
    );
  }
}

export default Counter;
```

This example shows how to define and update state in a class component.

### 2. State in a Functional Component (using Hooks)

```jsx
import React, { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(prevCount => prevCount + 1);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

export default Counter;
```

This example demonstrates the use of the `useState` Hook in a functional component.

### 3. Multiple State Variables

```jsx
import React, { useState } from "react";

function UserForm() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    console.log(`Name: ${name}, Age: ${age}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type='text'
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder='Name'
      />
      <input
        type='number'
        value={age}
        onChange={e => setAge(e.target.value)}
        placeholder='Age'
      />
      <button type='submit'>Submit</button>
    </form>
  );
}

export default UserForm;
```

This example shows how to use multiple state variables in a functional component.

### 4. Lifting State Up

```jsx
import React, { useState } from "react";

// LightbulbControl component for individual bulbs
const LightbulbControl = ({ name, isOn, onToggle }) => {
  return (
    <div>
      <span>
        {name}: {isOn ? "On" : "Off"}
      </span>
      <button onClick={onToggle}>Toggle</button>
    </div>
  );
};

// VirtualInterruptor component to control both bulbs
const VirtualInterruptor = ({ onToggleAll, allOn }) => {
  return <button onClick={onToggleAll}>Turn All {allOn ? "Off" : "On"}</button>;
};

// Main App component
const App = () => {
  // Lifting the state up to the parent component
  const [bulbStates, setBulbStates] = useState({
    livingRoom: false,
    bedroom: false
  });

  // Function to toggle individual bulb
  const toggleBulb = bulb => {
    setBulbStates(prevState => ({
      ...prevState,
      [bulb]: !prevState[bulb]
    }));
  };

  // Function to toggle all bulbs
  const toggleAll = () => {
    const allCurrentlyOn = Object.values(bulbStates).every(state => state);
    setBulbStates({
      livingRoom: !allCurrentlyOn,
      bedroom: !allCurrentlyOn
    });
  };

  // Check if all bulbs are on
  const allOn = Object.values(bulbStates).every(state => state);

  return (
    <div>
      <h1>Smart Home Lighting Control</h1>
      <LightbulbControl
        name='Living Room'
        isOn={bulbStates.livingRoom}
        onToggle={() => toggleBulb("livingRoom")}
      />
      <LightbulbControl
        name='Bedroom'
        isOn={bulbStates.bedroom}
        onToggle={() => toggleBulb("bedroom")}
      />
      <VirtualInterruptor
        onToggleAll={toggleAll}
        allOn={allOn}
      />
    </div>
  );
};

export default App;
```

This example demonstrates the concept of lifting state up to a common ancestor component.

<Callout emoji='🧩'>
  Lifting state up is a powerful pattern in React. It allows you to share state
  between components that don't have a direct parent-child relationship. This
  approach helps maintain a single source of truth for your data.
</Callout>

## Best Practices

1. **Use Functional Components and Hooks**: They provide a more straightforward way to use state.
2. **Keep State DRY**: Don't Repeat Yourself - avoid duplicating state data.
3. **Minimize State**: Only use state for data that actually needs to cause re-renders.
4. **Use Immutable Updates**: Always create new objects/arrays when updating state, don't modify existing ones.
5. **Lift State Up When Necessary**: If multiple components need the same state, move it to their closest common ancestor (aka their parent).

## Common Pitfalls

<Callout>

**Modifying State Directly:**

- Mistake: Changing state without using setState or the state updater function.
- Why: React may not re-render the component, leading to unexpected behavior.
- Solution: Always use setState (in class components) or the state updater function (in functional components).

</Callout>

<Callout>

**Assuming State Updates are Immediate:**

- Mistake: Expecting to see updated state values immediately after calling setState.
- Why: State updates in React can be asynchronous for performance reasons.
- Solution: Use the useEffect Hook or setState callback to perform actions after state has been updated.

</Callout>

<Callout>

**Overusing State:**

- Mistake: Storing everything in state, including data that can be computed from other state or props.
- Why: This can lead to inconsistencies and make the component harder to maintain.
- Solution: Derive values from existing state and props when possible.

</Callout>

<Callout>

**Not Using a Functional Update:**

- Mistake: Updating state based on the previous state without using a functional update.
- Why: This can lead to incorrect updates if multiple state updates are batched together.
- Solution: Use the functional form of setState or state updater function when the new state depends on the previous state.

</Callout>

## Related Concepts

1. **Props**: While state is internal and controlled by the component, props are external and controlled by whatever renders the component.
2. **Lifecycle Methods**: In class components, these methods allow you to run code at particular times in the rendering process.
3. **Hooks**: Functions that let you use state and other React features in functional components.
4. **Context**: Provides a way to pass data through the component tree without having to pass props down manually at every level.
5. **Redux and other State Management Libraries**: For managing state in large applications.

## Further Resources

<Callout emoji='📚'>

1. [State: A Component's
   Memory](https://react.dev/learn/state-a-components-memory): Official React
   documentation on state.

2. [Render and
   Commit](https://react.dev/learn/render-and-commit): Understand how React
   updates the UI.

3. [State as a
   Snapshot](https://react.dev/learn/state-as-a-snapshot): Learn about the
   behavior of state in React.

4. [Queueing a Series of State
   Updates](https://react.dev/learn/queueing-a-series-of-state-updates): Advanced
   guide on managing multiple state updates.

5. [Updating Objects in
   State](https://react.dev/learn/updating-objects-in-state): Learn how to
   correctly update object state in React.

6. [A Visual Guide to React Mental
   Models](https://obedparla.com/code/a-visual-guide-to-react-mental-models/):
   Helpful visualizations for understanding React concepts, including state.

7. [Redux Documentation](https://redux.js.org/): While not part of React core,
   Redux is a popular state management library often used with React.

</Callout>

```

## pages/react/L2-mid/_meta.js
```
export default {
  "handling-events": "Handling Events",
  "conditional-rendering": "Conditional Rendering",
  "lists-and-keys": "Lists and Keys",
  "use-state": "useState Hook",
  "forms-in-react": "Forms in React",
  "styling-in-react": "Styling in React"
};

```

## pages/react/L2-mid/conditional-rendering.mdx
```
import { Callout } from "nextra/components";

# Conditional Rendering in React

## Brief Overview

<Callout emoji='💡'>
  Conditional rendering in React allows you to create dynamic user interfaces
  that display different components or elements based on certain conditions.
  This is a fundamental technique for creating interactive and responsive React
  applications.
</Callout>

## Detailed Explanation

### What is Conditional Rendering in React?

Conditional rendering in React refers to the practice of showing different UI elements or components based on certain conditions. This allows you to create dynamic interfaces that respond to changes in state, props, or other data.

### Key Concepts in React Conditional Rendering

1. **Using JavaScript Operators**:

   - Leverage JavaScript's logical operators (&&, ||) and ternary operator (?:) for simple conditions.

2. **Element Variables**:

   - Store JSX in variables and use these variables in your render method.

3. **Conditional Statements**:

   - Use if-else statements to determine what to render.

4. **Conditional Rendering of Child Components**:

   - Render or not render child components based on conditions.

5. **Switch Statements**:
   - Use switch statements for multiple conditions.

### Importance of Conditional Rendering

**Conditional rendering is crucial for**:

1. Creating dynamic user interfaces
2. Handling loading states
3. Implementing user authentication flows
4. Displaying error messages
5. Optimizing performance by rendering only necessary components

<Callout emoji='🔍'>
  Effective use of conditional rendering can significantly improve the user
  experience of your React application by showing relevant content and
  responding to user actions and application state.
</Callout>

## Code Examples

### 1. Using the Ternary Operator

```jsx
import React from "react";

function Greeting({ isLoggedIn }) {
  return (
    <div>{isLoggedIn ? <h1>Welcome back!</h1> : <h1>Please sign in.</h1>}</div>
  );
}

export default Greeting;
```

This example demonstrates using the ternary operator for a simple conditional render.

### 2. Using Logical && Operator

```jsx
import React from "react";

function ItemList({ items }) {
  return (
    <div>
      <h1>Item List</h1>
      {items.length > 0 && (
        <ul>
          {items.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}
      {items.length === 0 && <p>No items to display</p>}
    </div>
  );
}

export default ItemList;
```

This example shows how to use the logical AND operator for conditional rendering.

### 3. Using If-Else Statements

```jsx
import React from "react";

function LoginButton({ isLoggedIn, onLoginClick, onLogoutClick }) {
  if (isLoggedIn) {
    return <button onClick={onLogoutClick}>Logout</button>;
  } else {
    return <button onClick={onLoginClick}>Login</button>;
  }
}

function Welcome({ isLoggedIn }) {
  let content;
  if (isLoggedIn) {
    content = <h1>Welcome back!</h1>;
  } else {
    content = <h1>Please sign in.</h1>;
  }

  return (
    <div>
      {content}
      <LoginButton isLoggedIn={isLoggedIn} />
    </div>
  );
}

export default Welcome;
```

This example demonstrates using if-else statements for more complex conditional rendering scenarios.

### 4. Switch Statement for Multiple Conditions

```jsx
import React from "react";

function StatusMessage({ status }) {
  let message;
  switch (status) {
    case "loading":
      message = <p>Loading...</p>;
      break;
    case "success":
      message = <p>Data loaded successfully!</p>;
      break;
    case "error":
      message = <p>An error occurred. Please try again.</p>;
      break;
    default:
      message = <p>Unknown status</p>;
  }

  return <div className='status-message'>{message}</div>;
}

export default StatusMessage;
```

This example shows how to use a switch statement for handling multiple conditional rendering scenarios.

<Callout emoji='🧩'>
  The choice between these different methods of conditional rendering often
  depends on the complexity of your conditions and personal preferences. For
  simple conditions, ternary operators or logical AND are often preferred for
  their conciseness. For more complex logic, if-else statements or switch
  statements can be more readable and maintainable.
</Callout>

## Best Practices

1. **Keep It Simple**: Use the simplest form of conditional rendering that meets your needs.
2. **Avoid Nested Ternaries**: They can quickly become hard to read. Consider using if-else statements for complex conditions.
3. **Use Short-Circuit Evaluation**: The `&&` operator is great for rendering an element only if a condition is true.
4. **Extract Complex Logic**: If your conditional rendering logic becomes complex, consider extracting it into a separate function or component.
5. **Be Mindful of Performance**: Avoid unnecessary re-renders by using memoization techniques like `React.memo` or `useMemo` for expensive computations.

## Common Pitfalls

<Callout>

1. Returning `null` in Logical AND Operations:

   - Mistake: Using `&&` with a non-boolean left operand that could be falsy (like 0).
   - Why: In JavaScript, `0 && <SomeComponent />` evaluates to 0, which React will try to render.
   - Solution: Ensure the left operand is always a boolean, e.g., `items.length > 0 && <ItemList items={items} />`.

</Callout>

<Callout>

2. Overusing Conditional Rendering:

   - Mistake: Using conditional rendering for every small variation in a component.
   - Why: This can lead to complex, hard-to-maintain code.
   - Solution: Consider using props to configure a more generic component instead.

</Callout>

<Callout>

3. Forgetting to Handle All Cases:

   - Mistake: Not accounting for all possible states in your conditional rendering.
   - Why: This can lead to unexpected UI behavior or errors.
   - Solution: Always include a default or "else" case in your conditionals.

</Callout>

<Callout>

4. Inconsistent Component Mounting/Unmounting:
   - Mistake: Frequently toggling between different components can lead to performance issues and unexpected behavior with lifecycle methods.
   - Why: Mounting and unmounting components is expensive and can reset internal state.
   - Solution: Consider using the same component structure and conditionally rendering its contents instead.

</Callout>

## Related Concepts

1. **State Management**: Often used in conjunction with conditional rendering to determine what should be displayed.
2. **Props**: Frequently used to pass down conditions for rendering.
3. **React.Fragment**: Useful for grouping elements without adding extra nodes to the DOM, often used in conditional rendering.
4. **Higher-Order Components (HOCs)**: Can be used to add conditional rendering logic to components.
5. **Hooks**: `useMemo` and `useCallback` can be used to optimize performance in conditional rendering scenarios.

## Further Resources

<Callout emoji='📚'>

1. [Conditional Rendering](https://react.dev/learn/conditional-rendering):
   Official React documentation on conditional rendering.

2. [A Complete Guide to
   Conditional Rendering in
   React](https://blog.logrocket.com/conditional-rendering-in-react-c6b0e5af381e/):
   Comprehensive guide covering various conditional rendering techniques.

3. [React Conditional Rendering
   Patterns](https://www.robinwieruch.de/conditional-rendering-react): In-depth
   look at different patterns for conditional rendering in React.

4. [React Patterns](https://reactpatterns.com/): A collection of common React
   patterns, including several related to conditional rendering.

</Callout>

```

## pages/react/L2-mid/forms-in-react.mdx
```
import { Callout } from "nextra/components";

# Forms in React

## Brief Overview

<Callout emoji='💡'>
  In React, forms provide a way to collect user input. React offers two main
  approaches to handling form data: controlled components and uncontrolled
  components. Each approach has its use cases, and understanding both is crucial
  for effective React development.
</Callout>

## Detailed Explanation

Forms in React work similarly to regular HTML forms, but with the added power of JavaScript. React can control the form's internal state, validate user input, and handle form submission.

### Key Concepts in React Forms

1. **Controlled Components**:

   - Form elements whose values are controlled by React state
   - React is the "single source of truth" for the input value

2. **Uncontrolled Components**:

   - Form elements that maintain their own internal state
   - Values are accessed using refs

3. **Form State**:

   - The current values of all form inputs
   - Can be managed manually or with libraries like Formik or React Hook Form

4. **Form Submission**:
   - Handled by preventing the default form submission and using JavaScript to process the data

### Controlled vs Uncontrolled Components

<Callout emoji='🔍'>
  The main difference between controlled and uncontrolled components is where
  the form data is stored. In controlled components, form data is handled by
  React state. In uncontrolled components, form data is handled by the DOM
  itself.
</Callout>

## Code Examples

### 1. Controlled Component Form

```jsx
import React, { useState } from "react";

function ControlledForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = event => {
    event.preventDefault();
    console.log("Submitted:", { name, email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input
          type='text'
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </label>
      <label>
        Email:
        <input
          type='email'
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </label>
      <button type='submit'>Submit</button>
    </form>
  );
}

export default ControlledForm;
```

This example demonstrates a controlled component form where React state manages the form data.

### 2. Uncontrolled Component Form

```jsx
import React, { useRef } from "react";

function UncontrolledForm() {
  const nameRef = useRef();
  const emailRef = useRef();

  const handleSubmit = event => {
    event.preventDefault();
    console.log("Submitted:", {
      name: nameRef.current.value,
      email: emailRef.current.value
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input
          type='text'
          ref={nameRef}
        />
      </label>
      <label>
        Email:
        <input
          type='email'
          ref={emailRef}
        />
      </label>
      <button type='submit'>Submit</button>
    </form>
  );
}

export default UncontrolledForm;
```

This example shows an uncontrolled component form where the DOM handles the form data.

### 3. Form with Multiple Inputs

```jsx
import React, { useState } from "react";

function MultiInputForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });

  const handleChange = event => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = event => {
    event.preventDefault();
    console.log("Submitted:", formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        First Name:
        <input
          type='text'
          name='firstName'
          value={formData.firstName}
          onChange={handleChange}
        />
      </label>
      <label>
        Last Name:
        <input
          type='text'
          name='lastName'
          value={formData.lastName}
          onChange={handleChange}
        />
      </label>
      <label>
        Email:
        <input
          type='email'
          name='email'
          value={formData.email}
          onChange={handleChange}
        />
      </label>
      <button type='submit'>Submit</button>
    </form>
  );
}

export default MultiInputForm;
```

This example demonstrates handling multiple inputs in a controlled component form using a single state object.

### 4. Form with Basic Validation

```jsx
import React, { useState } from "react";

function ValidatedForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = event => {
    event.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", { email, password });
    } else {
      console.log("Form has errors");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type='email'
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        {errors.email && <span>{errors.email}</span>}
      </div>
      <div>
        <label>Password:</label>
        <input
          type='password'
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {errors.password && <span>{errors.password}</span>}
      </div>
      <button type='submit'>Submit</button>
    </form>
  );
}

export default ValidatedForm;
```

This example shows a form with basic client-side validation.

<Callout emoji='🧩'>
  While these examples demonstrate the basics of form handling in React, for
  more complex forms, consider using libraries like Formik or React Hook Form.
  These libraries provide powerful tools for managing form state, validation,
  and submission.
</Callout>

## HTML Form Elements Refresher

Here's a quick refresher on common HTML form elements and their key attributes:

1. **`<form>`**:

   - Attributes: `action`, `method`, `onSubmit`
   - Example: `<form onSubmit={handleSubmit}>`

2. **`<input>`**:

   - Types: `text`, `password`, `email`, `number`, `checkbox`, `radio`, etc.
   - Attributes: `type`, `name`, `value`, `placeholder`, `onChange`
   - Example: `<input type="text" name="username" value={username} onChange={handleChange} />`

3. **`<textarea>`**:

   - Attributes: `name`, `value`, `onChange`
   - Example: `<textarea name="comment" value={comment} onChange={handleChange}></textarea>`

4. **`<select>`**:

   - Attributes: `name`, `value`, `onChange`
   - Example:

   ```jsx
   <select
     name='country'
     value={country}
     onChange={handleChange}
   >
     <option value='us'>United States</option>
     <option value='ca'>Canada</option>
   </select>
   ```

5. **`<label>`**:

   - Attributes: `for` (use `htmlFor` in JSX)
   - Example: `<label htmlFor="email">Email:</label>`

6. **`<button>`**:
   - Types: `submit`, `reset`, `button`
   - Example: `<button type="submit">Submit</button>`

## Best Practices

1. **Use Controlled Components**: They provide more control and make it easier to modify or validate user input.
2. **Handle Form Submission**: Always handle form submission with `onSubmit` on the form, not `onClick` on the submit button.
3. **Validate User Input**: Implement both client-side and server-side validation for security.
4. **Use Appropriate Input Types**: Use the right input type (e.g., `email`, `number`) for better user experience and built-in validation.
5. **Provide Feedback**: Give users clear feedback on their input and any errors.

## Common Pitfalls

<Callout>

1. Not Preventing Default Form Submission:

   - Mistake: Forgetting to call `event.preventDefault()` in the submit handler.
   - Why: This can cause the page to reload, losing all form data.
   - Solution: Always call `event.preventDefault()` in your form submit handler.

</Callout>

<Callout>

2. Forgetting to Update State:

   - Mistake: Not updating state on input change in controlled components.
   - Why: This makes the form unresponsive to user input.
   - Solution: Always include an `onChange` handler that updates state for controlled inputs.

</Callout>

<Callout>

3. Using the Wrong Value for Checkboxes:

   - Mistake: Using `value` instead of `checked` for checkbox inputs.
   - Why: Checkboxes use `checked` to determine their state, not `value`.
   - Solution: Use `checked={isChecked}` for checkboxes, not `value={isChecked}`.

</Callout>

<Callout>

4. Not Handling All Form States:
   - Mistake: Forgetting to handle loading, success, and error states of form submission.
   - Why: This can lead to poor user experience and confusion.
   - Solution: Implement proper state management for all possible form states.

</Callout>

## Related Concepts

1. **State Management**: Forms often involve managing complex state.
2. **Event Handling**: Understanding events is crucial for form interactions.
3. **Refs**: Used in uncontrolled components to access DOM nodes.
4. **React Hooks**: `useState` and `useRef` are commonly used in form handling.
5. **Component Lifecycle**: Understanding when components update is important for form behavior.

## Further Resources

<Callout emoji='📚'>

1. [Managing State in
   Forms](https://react.dev/learn/managing-state#reacting-to-input-with-state):
   Official React documentation on managing form state.

2. [Formik](https://formik.org/): A popular library for building forms in React.

3. [React Hook Form](https://react-hook-form.com/): Another popular form
   library with a focus on performance.

4. [Controlled and Uncontrolled
   Components](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components):
   An overview of controlled and uncontrolled components in the new React docs.

5. [HTML Forms](https://developer.mozilla.org/en-US/docs/Learn/Forms): MDN Web
   Docs guide on HTML forms for a deeper understanding of form elements.

</Callout>

```

## pages/react/L2-mid/handling-events.mdx
```
# Handling Events in React

import { Callout } from "nextra/components";

## Brief Overview

<Callout emoji='💡'>
  Event handling in React is similar to handling events on DOM elements, but
  with some syntactic differences. React events are named using camelCase and
  passed as functions rather than strings.
</Callout>

## Detailed Explanation

### What is Event Handling in React?

Event handling in React refers to how you manage and respond to user interactions such as clicks, form submissions, key presses, etc. React wraps the browser's native event system in a synthetic event system for better cross-browser compatibility and improved performance.

### Key Concepts in React Event Handling

1. **Synthetic Events**:

   - React's cross-browser wrapper around the browser's native event
   - Follows the same interface as native events
   - Pools events for performance

2. **Naming Convention**:

   - React events are named using camelCase (e.g., `onClick` instead of `onclick`)

3. **Passing Functions as Event Handlers**:

   - Event handlers are passed as functions, not strings

4. **Preventing Default Behavior**:
   - Must explicitly call `preventDefault()` to prevent default browser behavior

### React Events vs DOM Events

While React's event system is similar to the DOM's, there are some key differences:

1. React events are named using camelCase, rather than lowercase.
2. With JSX you pass a function as the event handler, rather than a string.
3. You cannot return `false` to prevent default behavior in React. You must call `preventDefault` explicitly.

<Callout emoji='🔍'>
  React's synthetic event system ensures that events work identically across all
  browsers. This abstraction simplifies development and improves performance.
</Callout>

## Code Examples

### 1. Basic Click Event Handler

```jsx
import React from "react";

function Button() {
  const handleClick = () => {
    console.log("Button clicked!");
  };

  return <button onClick={handleClick}>Click me</button>;
}

export default Button;
```

This example shows a simple click event handler in a functional component.

### 2. Event Handler with Parameters

```jsx
import React from "react";

function ItemList() {
  const handleItemClick = item => {
    console.log(`You clicked ${item}`);
  };

  return (
    <ul>
      <li onClick={() => handleItemClick("apple")}>Apple</li>
      <li onClick={() => handleItemClick("banana")}>Banana</li>
      <li onClick={() => handleItemClick("orange")}>Orange</li>
    </ul>
  );
}

export default ItemList;
```

This example demonstrates how to pass parameters to event handlers.

### 3. Form Submission in React

```jsx
import React, { useState } from "react";

function Form() {
  const [name, setName] = useState("");

  const handleSubmit = event => {
    event.preventDefault();
    console.log(`Form submitted with name: ${name}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type='text'
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder='Enter your name'
      />
      <button type='submit'>Submit</button>
    </form>
  );
}

export default Form;
```

This example shows how to handle form submission and prevent the default form submission behavior.

## Best Practices

1. **Use Functional Components and Hooks**: They provide a simpler way to handle events.
2. **Keep Event Handlers Close to Related State**: This improves readability and maintainability.
3. **Use Event Delegation**: For lists of items, attach the event handler to the parent element instead of each child.
4. **Avoid Inline Function Definitions**: Where possible, define event handler functions outside the JSX to avoid unnecessary re-renders.
5. **Use TypeScript for Better Type Checking**: This can help catch errors related to event handling at compile-time.

## Common Pitfalls

<Callout>

1. Forgetting to Prevent Default Behavior:

   - Mistake: Not calling `preventDefault()` when necessary (e.g., form submissions).
   - Why: This can lead to unexpected page reloads or other default browser behaviors.
   - Solution: Always call `event.preventDefault()` when you want to stop the default action.

</Callout>

<Callout>

2. Adding Event Listeners Directly to the DOM:

   - Mistake: Using `addEventListener` directly instead of React's event system.
   - Why: This can lead to memory leaks and make your code harder to manage.
   - Solution: Use React's built-in event handling system (`onClick`, `onSubmit`, etc.).

</Callout>

<Callout>

3. Overusing Event Handlers:
   - Mistake: Creating separate event handlers for very similar actions.
   - Why: This can lead to code duplication and make components harder to maintain.
   - Solution: Create more generic event handlers that can handle multiple cases based on parameters.

</Callout>

## Related Concepts

1. **Synthetic Events**: React's cross-browser wrapper for handling events.
2. **State and Props**: Often used in conjunction with event handling to update component state or pass information to parent components.
3. **Hooks**: `useEffect` and custom hooks can be used for more complex event handling scenarios.
4. **Event Bubbling and Capturing**: Understanding these DOM concepts can help with advanced event handling techniques.

## Further Resources

<Callout emoji='📚'>

1. [Responding to Events](https://react.dev/learn/responding-to-events):
   Official React documentation on event handling.

2. [Event Reference](https://react.dev/reference/react-dom/components/common#event-handler):
   React's documentation on Event properties.

3. [React Event Handling](https://www.robinwieruch.de/react-event-handler): A comprehensive
   guide to event handling in React.

4. [Understanding React's Synthetic Events](https://blog.logrocket.com/a-guide-to-react-onclick-event-handlers-d411943b14dd/):
   In-depth look at React's event system (updated link).

5. [React TypeScript Cheatsheet](https://github.com/typescript-cheatsheets/react):
   Useful resource for handling events with TypeScript in React.

</Callout>

```

## pages/react/L2-mid/lists-and-keys.mdx
```
import { Callout } from "nextra/components";

# Lists and Keys in React

## Brief Overview

<Callout emoji='💡'>
  In React, lists are commonly used to render multiple similar components based
  on a collection of data. Keys are special attributes used to give elements in
  a list a stable identity, which helps React identify which items have changed,
  been added, or been removed.
</Callout>

## Detailed Explanation

### What are Lists in React?

Lists in React refer to the pattern of rendering multiple similar components based on an array of data. This is typically done using the `map()` function to transform each item in the array into a React element.

### What are Keys in React?

Keys are special string attributes you need to include when creating lists of elements in React. They help React identify which items in a list have changed, been added, or been removed. Keys should be unique among siblings, but they don't need to be globally unique.

### Importance of Keys

1. **Performance**: Keys help React optimize rendering by reusing existing DOM elements when possible.
2. **State Preservation**: Keys help React maintain component state across re-renders.
3. **Reconciliation**: Keys are crucial for React's reconciliation process, which determines what needs to be updated in the DOM.

### Rules for Keys

1. Keys must be unique among siblings.
2. Keys should be stable, predictable, and unique.
3. Don't use indexes as keys if the order of items may change.

<Callout emoji='🔍'>
  While using the index as a key is tempting and may seem to work, it can lead
  to subtle bugs and performance issues if the list order can change. Always try
  to use a unique identifier from your data as the key.
</Callout>

## Code Examples

### 1. Basic List Rendering

```jsx
import React from "react";

function FruitList() {
  const fruits = ["Apple", "Banana", "Cherry", "Date"];

  return (
    <ul>
      {fruits.map((fruit, index) => (
        <li key={index}>{fruit}</li>
      ))}
    </ul>
  );
}

export default FruitList;
```

This example demonstrates basic list rendering using the `map()` function. Note that we're using the index as a key here, which is okay for static lists that won't change.

### 2. List with Unique IDs as Keys

```jsx
import React from "react";

function TodoList() {
  const todos = [
    { id: 1, text: "Learn React" },
    { id: 2, text: "Build a project" },
    { id: 3, text: "Deploy to production" }
  ];

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}

export default TodoList;
```

This example shows how to use unique IDs from your data as keys, which is the preferred approach.

### 3. Nested Lists

```jsx
import React from "react";

function NestedList() {
  const data = [
    { id: 1, name: "Category 1", items: ["Item 1", "Item 2"] },
    { id: 2, name: "Category 2", items: ["Item 3", "Item 4"] }
  ];

  return (
    <ul>
      {data.map(category => (
        <li key={category.id}>
          {category.name}
          <ul>
            {category.items.map((item, index) => (
              <li key={`${category.id}-${index}`}>{item}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export default NestedList;
```

This example demonstrates how to handle nested lists, using a combination of unique IDs and indexes for keys.

### 4. List with Dynamic Updates

```jsx
import React, { useState } from "react";

function DynamicList() {
  const [items, setItems] = useState(["Item 1", "Item 2", "Item 3"]);

  const addItem = () => {
    setItems([...items, `Item ${items.length + 1}`]);
  };

  const removeItem = index => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <button onClick={addItem}>Add Item</button>
      <ul>
        {items.map((item, index) => (
          <li key={item}>
            {item}
            <button onClick={() => removeItem(index)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DynamicList;
```

This example shows a dynamic list where items can be added and removed. Note that we're using the item text as the key, assuming it's unique.

<Callout emoji='🧩'>
  When rendering lists, always strive to use unique, stable identifiers as keys.
  If your data doesn't have built-in unique IDs, consider generating them on the
  server or using a library like `uuid` to create unique keys. Avoid using
  indexes as keys for lists that can change, as this can lead to performance
  issues and bugs with component state.
</Callout>

## Best Practices

1. **Use Unique Identifiers**: Whenever possible, use unique and stable IDs from your data as keys.
2. **Avoid Using Indexes as Keys**: For dynamic lists, avoid using array indexes as keys.
3. **Keys Should Be Stable**: Keys should not change between renders unless the item they represent is replaced.
4. **Keep Keys Unique Among Siblings**: Keys must be unique only among sibling elements, not globally.
5. **Generate Keys on the Server**: For large lists, consider generating unique IDs on the server.

## Common Pitfalls

<Callout>

1. Using Array Index as Key for Dynamic Lists:

   - Mistake: Using array index as key for lists that can change.
   - Why: This can lead to performance issues and bugs with component state.
   - Solution: Use unique identifiers from your data or generate stable unique IDs.

</Callout>

<Callout>

2. Generating Keys on the Fly:

   - Mistake: Creating new keys (e.g., using `Math.random()`) during render.
   - Why: This defeats the purpose of keys, as they'll be different on every render.
   - Solution: Use stable identifiers or generate keys outside the render method.

</Callout>

<Callout>

3. Using Non-Unique Keys:

   - Mistake: Using keys that aren't unique among siblings.
   - Why: This can cause React to incorrectly match or fail to match elements between renders.
   - Solution: Ensure keys are unique among sibling elements.

</Callout>

<Callout>

4. Forgetting Keys Altogether:
   - Mistake: Not providing keys for list items.
   - Why: This can lead to warning messages and potential rendering issues.
   - Solution: Always provide keys when rendering lists of elements.

</Callout>

## Related Concepts

1. **React Reconciliation**: Understanding how React uses keys in its reconciliation process.
2. **Virtual DOM**: How React's virtual DOM relates to list rendering and keys.
3. **Component Lifecycle**: How keys affect mounting and unmounting of components in lists.
4. **Performance Optimization**: Using keys correctly can significantly impact your app's performance.
5. **Higher-Order Components (HOCs)**: HOCs that work with lists often need special consideration for keys.

## Further Resources

<Callout emoji='📚'>

1. [Rendering Lists](https://react.dev/learn/rendering-lists): Official React
   documentation on rendering lists.

2. [Index as a key is an
   anti-pattern](https://robinpokorny.com/blog/index-as-a-key-is-an-anti-pattern/):
   Article explaining why using index as a key is problematic (updated link).

3. [Understanding unique keys for array children in
   React](https://adhithiravi.medium.com/why-do-i-need-keys-in-react-lists-dbb522188bbb):
   Detailed explanation of the importance of keys in React.

4. [Preserving and
   Resetting State](https://react.dev/learn/preserving-and-resetting-state):
   Official documentation on React's state preservation, which is closely related
   to keys.

5. [Virtual DOM and
   Internals](https://legacy.reactjs.org/docs/faq-internals.html): Overview of
   React's Virtual DOM (note: this link is from the legacy docs as the new docs
   don't have a direct equivalent).

</Callout>

```

## pages/react/L2-mid/styling-in-react.mdx
```
import { Callout } from "nextra/components";

# Styling in React

## Brief Overview

<Callout emoji='💡'>
  React offers various approaches to styling components, from traditional CSS to
  more React-specific solutions. Each approach has its own strengths and use
  cases, and understanding them allows developers to choose the best solution
  for their specific needs.
</Callout>

## Detailed Explanation

### 1. Inline Styles in React

#### React Way (Generally Discouraged)

Inline styles in React involve passing a JavaScript object to the `style` prop of an element.

```jsx
function MyComponent() {
  return <div style={{ color: "blue", fontSize: "14px" }}>Hello, World!</div>;
}
```

**Why it exists**: It allows for dynamic styling based on component state or props.

**Usage**: Useful for small, dynamic style changes.

**Context**: Often used in prototyping or for styles that need to be computed at runtime.

**Drawbacks**:

- Doesn't support all CSS features (e.g., media queries, pseudo-selectors)
- Can lead to poor performance for complex styles
- Reduces code reusability

#### Tailwind CSS Way

Tailwind CSS is a utility-first CSS framework that can be used with React.

```jsx
function MyComponent() {
  return <div className='text-blue-500 text-sm'>Hello, World!</div>;
}
```

**Why it exists**: To provide a highly customizable, low-level CSS framework that promotes rapid UI development.

**Usage**: Building custom designs with consistent spacing, colors, and other design tokens.

**Context**: Ideal for projects that require a high degree of customization and want to avoid writing custom CSS.

**Benefits**:

- Rapid development
- Consistent designs
- Smaller CSS bundle size in production

### 2. CSS Modules, SCSS, Vanilla CSS, PostCSS

#### CSS Modules

CSS Modules allow you to write traditional CSS files, but with local scoping by default.

```css
/* Button.module.css */
.button {
  background: blue;
  color: white;
}
```

```jsx
import styles from "./Button.module.css";

function Button() {
  return <button className={styles.button}>Click me</button>;
}
```

**Why it exists**: To solve the problem of global scope in CSS.

**Usage**: When you want to write traditional CSS with the benefits of local scoping.

**Context**: Useful in large projects where style conflicts are a concern.

#### SCSS (Sass)

SCSS is a CSS preprocessor that adds features like variables, nesting, and mixins to CSS.

```scss
$primary-color: blue;

.button {
  background: $primary-color;
  &:hover {
    background: darken($primary-color, 10%);
  }
}
```

**Why it exists**: To add programming-like features to CSS, making it more maintainable and powerful.

**Usage**: When you need more powerful CSS features and want to structure your styles more efficiently.

**Context**: Often used in larger projects or when working with design systems.

#### Vanilla CSS

Traditional CSS files that are imported into React components.

```css
/* styles.css */
.button {
  background: blue;
  color: white;
}
```

```jsx
import "./styles.css";

function Button() {
  return <button className='button'>Click me</button>;
}
```

**Why it exists**: It's the standard way of styling web applications.

**Usage**: When you want to use traditional CSS without any additional tooling.

**Context**: Suitable for smaller projects or when working with existing CSS codebases.

#### PostCSS

PostCSS is a tool for transforming CSS with JavaScript plugins.

**Why it exists**: To allow developers to use future CSS features and optimize CSS.

**Usage**: When you need to add custom transformations to your CSS or use future CSS features.

**Context**: Often used in conjunction with other styling methods to optimize and transform CSS.

### 3. CSS-in-JS (Styled-Components, Emotion)

CSS-in-JS libraries allow you to write CSS directly in your JavaScript files.

#### Styled-Components

```jsx
import styled from "styled-components";

const Button = styled.button`
  background: blue;
  color: white;
  padding: 10px 20px;
`;

function MyComponent() {
  return <Button>Click me</Button>;
}
```

**Why it exists**: To provide a more component-oriented way of styling that leverages the full power of JavaScript.

**Usage**: When you want to create reusable, themed components with dynamic styles.

**Context**: Popular in React applications, especially those with complex theming requirements.

#### Emotion

Similar to Styled-Components, but with a focus on performance and flexibility.

```jsx
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

const buttonStyle = css`
  background: blue;
  color: white;
  padding: 10px 20px;
`;

function MyComponent() {
  return <button css={buttonStyle}>Click me</button>;
}
```

**Why it exists**: To provide a high-performance, flexible CSS-in-JS solution.

**Usage**: Similar to Styled-Components, but with some additional features and performance optimizations.

**Context**: Often chosen for projects that require high performance and flexibility in styling.

## Best Practices

1. **Choose the Right Tool for the Job**: Consider the size of your project, team preferences, and performance requirements when choosing a styling approach.
2. **Maintain Consistency**: Stick to one primary styling method throughout your project for maintainability.
3. **Consider Responsiveness**: Ensure your styling solution supports responsive design techniques.
4. **Think in Components**: Regardless of the styling method, organize your styles in a component-oriented way.
5. **Optimize for Performance**: Be mindful of the performance implications of your chosen styling method, especially for larger applications.

## Common Pitfalls

<Callout>

1. Overusing Inline Styles:

   - Mistake: Relying too heavily on inline styles for all styling needs.
   - Why: This can lead to poor performance and make styles harder to maintain.
   - Solution: Use inline styles sparingly, only for truly dynamic styles.

</Callout>

<Callout>

2. Neglecting CSS Fundamentals:

   - Mistake: Focusing too much on React-specific styling solutions without understanding CSS basics.
   - Why: This can lead to inefficient and hard-to-maintain styles.
   - Solution: Ensure a solid understanding of CSS fundamentals regardless of the styling approach used.

</Callout>

<Callout>

3. Inconsistent Naming Conventions:

   - Mistake: Using different naming conventions across your styling files.
   - Why: This can make the codebase harder to understand and maintain.
   - Solution: Establish and stick to a consistent naming convention for your styles.

</Callout>

<Callout>

4. Not Considering Scale:
   - Mistake: Choosing a styling solution without considering how it will scale with your project.
   - Why: Some solutions that work well for small projects may become unwieldy in larger applications.
   - Solution: Consider the long-term scalability of your chosen styling approach.

</Callout>

## Related Concepts

1. **React Components**: Styling is closely tied to component structure in React.
2. **Theming**: Many styling solutions in React offer theming capabilities.
3. **CSS Architecture**: Concepts like BEM or ITCSS can be applied to React projects.
4. **Performance Optimization**: Different styling methods can affect your app's performance.
5. **Build Tools**: Many styling solutions require specific webpack or other build tool configurations.

## Further Resources

<Callout emoji='📚'>

1. [CSS Modules](https://github.com/css-modules/css-modules):
   Official documentation for CSS Modules.

2. [Styled-Components Documentation](https://styled-components.com/docs):
   Comprehensive guide to using Styled-Components.

3. [Tailwind CSS Documentation](https://tailwindcss.com/docs):
   Official Tailwind CSS docs.

4. [Emotion Documentation](https://emotion.sh/docs/introduction):
   Guide to using Emotion for CSS-in-JS.

5. [A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/):
   Helpful resource for understanding flexbox layouts, which are commonly used in React.

6. [CSS Tricks](https://css-tricks.com/):
   Great resource for learning about CSS techniques that can be applied to React projects.

</Callout>

```

## pages/react/L2-mid/use-state.mdx
```
import { Callout } from "nextra/components";

# useState Hook in React

## Brief Overview

<Callout emoji='💡'>
  The useState Hook allows you to add state to functional components. It returns
  a stateful value and a function to update it, allowing you to use state
  without writing a class.
</Callout>

## Detailed Explanation

### What is the useState Hook?

useState is a Hook that lets you add React state to functional components. It returns an array with two elements: the current state value and a function that lets you update it.

### Syntax

```jsx
const [state, setState] = useState(initialState);
```

- `state`: The current state value
- `setState`: A function to update the state
- `initialState`: The initial state value (can be a value or a function)

### Key Concepts

1. **State Updates**:

   - setState replaces the previous state rather than merging it.
   - You can pass a function to setState if the new state depends on the previous state.

2. **Multiple State Variables**:

   - You can use useState multiple times in a single component.

3. **Lazy Initial State**:

   - You can pass a function to useState for the initial state if it's expensive to compute.

4. **State Updates are Asynchronous**:
   - React may batch multiple setState calls for performance reasons.

<Callout emoji='🔍'>
  Unlike the class-based this.setState, useState doesn't automatically merge
  update objects. You can replicate this behavior by using the spread operator.
</Callout>

## Code Examples

### 1. Basic useState Example

```jsx
import React, { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}

export default Counter;
```

This example demonstrates a simple counter using useState.

### 2. useState with Object State

```jsx
import React, { useState } from "react";

function UserForm() {
  const [user, setUser] = useState({ name: "", age: "" });

  const handleChange = e => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: value
    }));
  };

  return (
    <form>
      <input
        name='name'
        value={user.name}
        onChange={handleChange}
        placeholder='Name'
      />
      <input
        name='age'
        value={user.age}
        onChange={handleChange}
        placeholder='Age'
      />
      <p>
        Name: {user.name}, Age: {user.age}
      </p>
    </form>
  );
}

export default UserForm;
```

This example shows how to use useState with an object and update it partially.

### 3. Multiple useState Hooks

```jsx
import React, { useState } from "react";

function RGBSelector() {
  const [red, setRed] = useState(0);
  const [green, setGreen] = useState(0);
  const [blue, setBlue] = useState(0);

  const setColor = (color, value) => {
    switch (color) {
      case "red":
        setRed(value);
        break;
      case "green":
        setGreen(value);
        break;
      case "blue":
        setBlue(value);
        break;
    }
  };

  return (
    <div>
      {["red", "green", "blue"].map(color => (
        <div key={color}>
          <label>{color}</label>
          <input
            type='range'
            min='0'
            max='255'
            value={eval(color)}
            onChange={e => setColor(color, Number(e.target.value))}
          />
        </div>
      ))}
      <div
        style={{
          width: "100px",
          height: "100px",
          backgroundColor: `rgb(${red},${green},${blue})`
        }}
      />
    </div>
  );
}

export default RGBSelector;
```

This example demonstrates using multiple useState Hooks in a single component.

<Callout emoji='🧩'>
  While you can use multiple useState calls for different pieces of state, for
  complex state logic, you might want to consider using useReducer instead.
  useReducer is often preferable if you have complex state logic that involves
  multiple sub-values or when the next state depends on the previous one.
</Callout>

## Best Practices

1. **Use Functional Updates**: When new state depends on old state, pass a function to setState.
2. **Keep State Minimal**: Only include values in state that you need for rendering.
3. **Group Related State**: If you have state variables that often change together, consider combining them into a single state object.
4. **Avoid Redundant State**: Don't store values in state that can be computed from props or other state.
5. **Use Lazy Initial State**: For expensive initial state computations, pass a function to useState.

## Common Pitfalls

<Callout>

1. Directly Modifying State:

   - Mistake: Trying to modify state directly without using the setState function.
   - Why: React won't re-render the component and the UI won't update.
   - Solution: Always use the setState function to update state.

</Callout>

<Callout>

2. Assuming State Updates are Immediate:

   - Mistake: Expecting to see updated state values immediately after calling setState.
   - Why: State updates in React can be asynchronous for performance reasons.
   - Solution: Use useEffect or the setState callback function to perform actions after state has been updated.

</Callout>

<Callout>

3. Not Using Functional Updates:

   - Mistake: Updating state based on previous state without using a functional update.
   - Why: This can lead to incorrect updates if multiple setState calls are batched together.
   - Solution: Use the functional form of setState when the new state depends on the previous state.

</Callout>

<Callout>

4. Initializing State with Props:
   - Mistake: Initializing state with props in a way that the state won't update if the prop changes.
   - Why: The state is only initialized once when the component mounts.
   - Solution: If you need state to update based on prop changes, use the useEffect Hook.

</Callout>

## Related Concepts

1. **useEffect**: Often used in conjunction with useState for side effects.
2. **useReducer**: An alternative to useState for more complex state logic.
3. **Custom Hooks**: Can encapsulate useState logic for reuse across components.
4. **Context API**: Can be used with useState for global state management.
5. **Lifting State Up**: A pattern often used with useState to share state between components.

## Further Resources

<Callout emoji='📚'>

1. [useState Hook](https://react.dev/reference/react/useState): Official React
   documentation on useState.

2. [State: A Component's
   Memory](https://react.dev/learn/state-a-components-memory): Comprehensive
   guide on state in React, including useState.

3. [React Hooks: What's going to
   happen to my
   tests?](https://kentcdodds.com/blog/react-hooks-whats-going-to-happen-to-my-tests):
   Article about testing components that use Hooks.

4. [useHooks](https://usehooks.com/):
   Collection of custom Hooks, many of which use useState.

</Callout>

```

## pages/react/L3-senior/_meta.js
```
export default {
  "use-effect": "useEffect Hook",
  "context-api": "Context API & useContext Hook",
  "useRef-forwardRef": "useRef Hook & forwardRef",
  "react-fragement": "React Fragment",
  "composition-patterns": "Composition Patterns",
  "render-props": "Render Props",
  "testing-react-applications": "Testing React Applications",
  "higher-order-components": "Higher Order Components",
  useReducer: "useReducer Hook",
  "error-boundaries": "Error Boundaries",
  "loading-states": "Loading States",
  portals: "Portals",
  "code-splitting": "Code Splitting",
  useLayoutEffect: "useLayoutEffect Hook",
  useImperativeHandle: "useImperativeHandle Hook"
};

```

## pages/react/L3-senior/code-splitting.mdx
```
import { Callout } from "nextra/components";

# Code Splitting in React

## Brief Overview

<Callout emoji='💡'>
  Code Splitting is a technique used to improve the performance of React
  applications by splitting the bundle into smaller chunks and loading them on
  demand. This is achieved through dynamic imports and React's built-in
  `React.lazy` and `Suspense` features.
</Callout>

## Detailed Explanation

### Dynamic Imports

Dynamic imports allow you to load JavaScript modules (including React components) on demand, rather than loading everything upfront. This can significantly improve the initial load time of your application.

In JavaScript, you can use the `import()` function to dynamically import a module:

```javascript
import("./MyComponent").then(module => {
  const MyComponent = module.default;
  // Use MyComponent
});
```

### React.lazy and Suspense

React provides a more convenient way to use dynamic imports for components through the `React.lazy` function and `Suspense` component.

- **React.lazy**: This function lets you render a dynamic import as a regular component.
- **Suspense**: This component lets you specify a loading indicator while waiting for the lazy component to load.

Together, they provide a seamless way to implement code splitting in React applications.

## Code Examples

### Basic Usage of React.lazy and Suspense

Here's a simple example of how to use `React.lazy` and `Suspense`:

```jsx
import React, { Suspense } from "react";

const OtherComponent = React.lazy(() => import("./OtherComponent"));

function MyComponent() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <OtherComponent />
      </Suspense>
    </div>
  );
}
```

### Code Splitting with React Router

Here's an example of how to use code splitting with React Router:

```jsx
import React, { Suspense } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

const Home = React.lazy(() => import("./routes/Home"));
const About = React.lazy(() => import("./routes/About"));
const Contact = React.lazy(() => import("./routes/Contact"));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Switch>
          <Route
            exact
            path='/'
            component={Home}
          />
          <Route
            path='/about'
            component={About}
          />
          <Route
            path='/contact'
            component={Contact}
          />
        </Switch>
      </Suspense>
    </Router>
  );
}
```

### Error Boundaries with Code Splitting

It's a good practice to use Error Boundaries with code splitting to handle errors in lazy-loaded components:

```jsx
import React, { Suspense } from "react";

const OtherComponent = React.lazy(() => import("./OtherComponent"));

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

function MyComponent() {
  return (
    <div>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <OtherComponent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
```

## Best Practices

1. **Route-based Splitting**: Start with route-based code splitting as it usually provides the best bang for your buck.

2. **Anticipate User Actions**: Try to predict where users are likely to navigate and preload those components.

3. **Named Exports**: When using `React.lazy`, remember it currently only supports default exports.

4. **Avoid Over-splitting**: Don't split your code into too many small chunks, as this can actually decrease performance due to the overhead of multiple requests.

5. **Use Error Boundaries**: Always wrap your lazy-loaded components in Error Boundaries to gracefully handle loading failures.

6. **Meaningful Loading States**: Provide informative loading states in your Suspense fallback to improve user experience.

7. **Performance Monitoring**: Use tools like Chrome DevTools and React DevTools to monitor the impact of your code splitting.

## Common Pitfalls

<Callout>

1. Overusing Code Splitting:

   - Mistake: Applying code splitting to every small component.
   - Why: This can lead to too many small chunks and actually decrease performance.
   - Solution: Focus on larger, less frequently used parts of your application.

</Callout>

<Callout>

2. Forgetting Server-Side Rendering:

   - Mistake: Not accounting for server-side rendering when using `React.lazy`.
   - Why: `React.lazy` and `Suspense` are not yet supported for server-side rendering.
   - Solution: Use a library like Loadable Components for SSR support with code splitting.

</Callout>

<Callout>

3. Ignoring Loading Performance:

   - Mistake: Not optimizing the loading experience for users.
   - Why: Poor loading experiences can negatively impact user perception of your app.
   - Solution: Use meaningful loading indicators and consider techniques like skeleton screens.

</Callout>

<Callout>

4. Not Handling Errors:
   - Mistake: Failing to handle potential errors in lazy-loaded components.
   - Why: Network issues or other problems can cause lazy loading to fail.
   - Solution: Always use Error Boundaries with lazy-loaded components.

</Callout>

## Related Concepts

1. **Webpack**: The most common bundler used with React, which handles the actual code splitting.
2. **Performance Optimization**: Code splitting is part of the broader topic of React app performance optimization.
3. **React Router**: Often used in conjunction with code splitting for route-based splitting.
4. **Error Boundaries**: Used to catch errors in lazy-loaded components.
5. **React Suspense**: A key feature for handling asynchronous operations, including code splitting.

## Further Resources

<Callout emoji='📚'>

1. [React.lazy](https://react.dev/reference/react/lazy): React documentation for the lazy function.

2. [Suspense](https://react.dev/reference/react/Suspense): React documentation for the Suspense component.

3. [Lazy Loading Routes](https://reactrouter.com/en/main/route/lazy): React Router documentation on lazy loading routes.

4. [Webpack Code Splitting](https://webpack.js.org/guides/code-splitting/): Webpack's guide on code splitting.

</Callout>

```

## pages/react/L3-senior/composition-patterns.mdx
```
import { Callout } from "nextra/components";

# Composition Pattern in React

## Brief Overview

<Callout emoji='💡'>
  The Composition pattern in React refers to the practice of creating components
  that can be easily combined and nested to build complex UIs. It emphasizes
  creating small, focused components that can be composed together, rather than
  large, monolithic components.
</Callout>

## Detailed Explanation

### What is the Composition pattern?

The Composition pattern in React is an approach to building user interfaces where components are designed to be flexible, reusable, and easily combined. Instead of creating large, complex components that handle many responsibilities, the Composition pattern encourages developers to create smaller, more focused components that can be composed together to create complex UIs.

### What does it allow?

**The Composition pattern allows for**:

1. **Greater flexibility**: Components can be easily rearranged and reused in different contexts.
2. **Improved readability**: Smaller, focused components are often easier to understand and maintain.
3. **Better separation of concerns**: Each component can focus on doing one thing well.
4. **Easier testing**: Smaller components with clear responsibilities are typically easier to test.
5. **Enhanced reusability**: Well-composed components can be reused across different parts of an application or even in different projects.

### When to use it?

**You should consider using the Composition pattern**:

1. When you find yourself creating large, complex components that are difficult to understand or maintain.
2. When you notice duplicate code across different components.
3. When you need to create flexible layouts that can adapt to different contexts.
4. When you want to improve the reusability of your components.
5. When you're building a component library or design system.

## Code Examples

### Basic Composition

Here's a simple example of composition:

```jsx
function Button({ children, ...props }) {
  return <button {...props}>{children}</button>;
}

function IconButton({ icon, children, ...props }) {
  return (
    <Button {...props}>
      {icon} {children}
    </Button>
  );
}

function App() {
  return (
    <div>
      <Button>Click me</Button>
      <IconButton icon={<span>🚀</span>}>Launch</IconButton>
    </div>
  );
}
```

In this example, `IconButton` composes `Button`, adding an icon to it.

### Composition with Children Prop

The `children` prop is a powerful tool for composition:

```jsx
function Card({ title, children }) {
  return (
    <div className='card'>
      <h2>{title}</h2>
      <div className='card-content'>{children}</div>
    </div>
  );
}

function App() {
  return (
    <Card title='Welcome'>
      <p>This is some content inside the card.</p>
      <Button>Click me</Button>
    </Card>
  );
}
```

Here, `Card` is a generic container that can wrap any content passed as its children.

### Specialized Components

You can create specialized components by composing more generic ones:

```jsx
function Dialog({ title, content, onClose }) {
  return (
    <Card title={title}>
      <p>{content}</p>
      <Button onClick={onClose}>Close</Button>
    </Card>
  );
}

function App() {
  return (
    <Dialog
      title='Terms of Service'
      content="By clicking 'I agree', you agree to our terms of service."
      onClose={() => console.log("Dialog closed")}
    />
  );
}
```

In this example, `Dialog` is a more specialized version of `Card`.

## Best Practices

1. **Keep components focused**: Each component should ideally do one thing well.
2. **Use the children prop**: It's a powerful way to create flexible, reusable components.
3. **Prefer composition over inheritance**: In React, composition is generally more flexible than inheritance.
4. **Design for reusability**: When creating components, think about how they might be used in different contexts.
5. **Use propTypes or TypeScript**: This helps ensure that composed components are used correctly.

## Common Pitfalls

<Callout>

1. Overcomplicating Simple Components:

   - Mistake: Breaking down components into too many small pieces.
   - Why: This can lead to unnecessary complexity and make the codebase harder to navigate.
   - Solution: Strike a balance. Components should be small enough to be reusable but large enough to be meaningful.

</Callout>

<Callout>

2. Prop Drilling:

   - Mistake: Passing props through many levels of components.
   - Why: This can make your code harder to maintain and understand.
   - Solution: Consider using Context API or state management libraries for deeply nested data.

</Callout>

<Callout>

3. Inflexible Component Design:

   - Mistake: Creating components that are too specific and hard to reuse.
   - Why: This defeats the purpose of composition and leads to duplicate code.
   - Solution: Design components to be as generic and flexible as possible, using props to specialize their behavior.

</Callout>

<Callout>

4. Overusing HOCs or Render Props:
   - Mistake: Using Higher-Order Components or Render Props when simple composition would suffice.
   - Why: These patterns can add unnecessary complexity.
   - Solution: Start with basic composition, and only reach for more advanced patterns when needed.

</Callout>

## Related Concepts

1. **Higher-Order Components (HOCs)**: Another pattern for component reuse, often used alongside composition.
2. **Render Props**: A pattern that uses a prop whose value is a function to share code between components.
3. **Context API**: Can be used with composition to avoid prop drilling.
4. **Hooks**: Custom hooks are another way to compose behavior in React.
5. **Container and Presentational Components**: A pattern that separates data fetching and rendering, often implemented through composition.

## Further Resources

<Callout emoji='📚'>

1. [Composition vs Inheritance](https://react.dev/learn/composition-vs-inheritance): Official React documentation on why composition is preferred over inheritance.

2. [Passing JSX as children](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children): Guide on using the children prop for composition.

3. [Extracting Components](https://react.dev/learn/extracting-components): Learn how to break down components, which is key to effective composition.

4. [Thinking in React](https://react.dev/learn/thinking-in-react): A guide that touches on component composition as part of the React mindset.

5. [A deep dive into children in React](https://mxstbr.blog/2017/02/react-children-deepdive/): An in-depth look at the children prop and its uses in composition.

6. [React Composition Patterns](https://www.robinwieruch.de/react-component-composition/): A comprehensive guide to various composition patterns in React.

7. [Composing Components](https://dev.to/bouhm/thinking-in-react-component-composition-fp5): A practical guide to component composition in React.

</Callout>

```

## pages/react/L3-senior/context-api.mdx
```
import { Callout } from "nextra/components";

# Context API & useContext in React

## Brief Overview

<Callout emoji='💡'>
  The Context API in React provides a way to pass data through the component
  tree without having to pass props down manually at every level. The useContext
  hook allows functional components to consume this context easily.
</Callout>

## Detailed Explanation

### What is the Context API?

The Context API is a feature in React that allows you to share values like themes, user authentication status, or any other global data across many components without explicitly passing props through every level of the component tree.

### Why does it exist?

The Context API exists to solve the problem of prop drilling - the process of passing props through multiple levels of components that don't need those props themselves but only pass them along to lower components.

### For which purpose?

**The main purposes of the Context API are**:

1. Sharing global data across many components
2. Avoiding prop drilling
3. Providing a way to manage global state in React applications

### Creating Context

To create a context, you use the `createContext` function from React:

```jsx
import React from "react";

const ThemeContext = React.createContext("light");
```

### Creating Providers and Consuming Context

A Provider is a React component that allows consuming components to subscribe to context changes. Here's an example of creating and using a Provider:

```jsx
function App() {
  return (
    <ThemeContext.Provider value='dark'>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}
```

### useContext Hook

The `useContext` hook provides a way to consume context in functional components:

```jsx
import React, { useContext } from "react";

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return (
    <button style={{ background: theme }}>I am styled by theme context!</button>
  );
}
```

## Basic Usage

Here's a complete example demonstrating the Context API and useContext:

```jsx
import React, { createContext, useContext, useState } from "react";

// Create a context
const ThemeContext = createContext();

// Create a provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// A component that consumes the context
function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button
      style={{
        background: theme === "light" ? "#fff" : "#000",
        color: theme === "light" ? "#000" : "#fff"
      }}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      Toggle Theme
    </button>
  );
}

// App component
function App() {
  return (
    <ThemeProvider>
      <div>
        <h1>My App</h1>
        <ThemedButton />
      </div>
    </ThemeProvider>
  );
}

export default App;
```

## Best Practices

1. **Use Context for Global State**: Context is best for data that can be considered "global" for a tree of React components.
2. **Keep Context Usage Simple**: Avoid putting too much data or complex logic in a single context.
3. **Split Contexts**: If you have multiple independent pieces of global state, create separate contexts for each.
4. **Memoize Context Value**: If you're passing objects as context value, consider memoizing them to prevent unnecessary re-renders.
5. **Use Context Judiciously**: While Context can solve prop drilling, it can also make component reuse more difficult. Use it when it genuinely simplifies your code.

## Common Pitfalls

<Callout>

1. Overusing Context:

   - Mistake: Using Context for every piece of shared state.
   - Why: This can lead to performance issues and make components less reusable.
   - Solution: Use Context for truly global state, and consider component composition or lifting state up for more localized sharing.

</Callout>

<Callout>

2. Ignoring Re-renders:

   - Mistake: Not considering that all consumers will re-render when the context value changes.
   - Why: This can lead to performance issues in large applications.
   - Solution: Use memoization techniques (like useMemo) for context values, and split contexts if necessary.

</Callout>

<Callout>

3. Forgetting to Wrap Providers:

   - Mistake: Not wrapping components that need access to the context with the Provider.
   - Why: Components outside the Provider can't access the context.
   - Solution: Ensure that all components that need access to the context are descendants of a Provider component.

</Callout>

<Callout>

4. Modifying Context Value Directly:
   - Mistake: Changing the context value without using setState or a similar method.
   - Why: This won't trigger re-renders in consuming components.
   - Solution: Always use state updating methods (like those returned by useState) to modify context values.

</Callout>

## Related Concepts

1. **Redux**: Another popular state management solution that can be used alongside or instead of Context.
2. **useReducer**: Often used with Context for more complex state management.
3. **Prop Drilling**: The problem that Context aims to solve.
4. **Higher-Order Components**: An alternative pattern for sharing behavior between components.
5. **Render Props**: Another pattern for sharing code between React components.

## Further Resources

<Callout emoji='📚'>

1. [Context](https://react.dev/learn/passing-data-deeply-with-context): Official React documentation on Context from the new React docs.

2. [useContext](https://react.dev/reference/react/useContext): Official documentation on the useContext hook.

3. [Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context): Guide on combining useReducer with Context for scalable state management.

4. [Before You Use Context](https://react.dev/learn/passing-data-deeply-with-context#before-you-use-context): Important considerations before using Context.

5. [Keeping Components Pure](https://react.dev/learn/keeping-components-pure): Understanding component purity, which is important when working with Context.

6. [Application State Management with React](https://kentcdodds.com/blog/application-state-management-with-react): A comprehensive guide on state management in React, including the use of Context.

7. [How to use React Context effectively](https://kentcdodds.com/blog/how-to-use-react-context-effectively): Advanced patterns for using Context effectively in React applications.

</Callout>

```

## pages/react/L3-senior/error-boundaries.mdx
```
import { Callout } from "nextra/components";

# Error Boundaries in React (Functional Components)

## Brief Overview

<Callout emoji='💡'>
  Error Boundaries in React are components that catch JavaScript errors anywhere
  in their child component tree, log those errors, and display a fallback UI
  instead of the component tree that crashed. While React doesn't provide a
  built-in hook for error boundaries, we can use third-party libraries to
  implement them in functional components.
</Callout>

## Detailed Explanation

### Catching JavaScript Errors

Error Boundaries in React are designed to catch errors that occur during rendering, in effects, and in custom hooks of components. They work like a JavaScript `catch {}` block, but for components.

**Key points about Error Boundaries**:

1. They catch errors in their child components.
2. They do not catch errors in event handlers.
3. They do not catch errors in asynchronous code (e.g., `setTimeout` or `requestAnimationFrame` callbacks).
4. They do not catch errors thrown in the error boundary itself (rather than its children).

To create an Error Boundary with functional components, we'll use the `react-error-boundary` library, which provides a `useErrorBoundary` hook and an `ErrorBoundary` component.

### Fallback UI

When an error is caught, an Error Boundary can render a fallback UI instead of the component tree that crashed. This allows you to provide a better user experience by displaying an error message or a simplified version of the UI, rather than a completely broken page.

## Code Examples

### Basic Error Boundary

Here's how to implement an Error Boundary using the `react-error-boundary` library:

```jsx
import React from "react";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role='alert'>
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function MyComponent() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your app here
      }}
    >
      <ComponentThatMightThrow />
    </ErrorBoundary>
  );
}

// Usage
function App() {
  return (
    <div>
      <h1>My App</h1>
      <MyComponent />
    </div>
  );
}
```

### Error Boundary with Logging

Here's an example that includes error logging:

```jsx
import React from "react";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role='alert'>
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function logError(error, info) {
  // Log the error to an error reporting service
  console.error("Caught an error:", error, info);
}

function MyComponent() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your app here
      }}
      onError={logError}
    >
      <ComponentThatMightThrow />
    </ErrorBoundary>
  );
}
```

## Best Practices

1. **Use Multiple Error Boundaries**: Place Error Boundaries strategically to isolate different parts of your application.

2. **Provide Meaningful Error Messages**: Make sure your fallback UI provides useful information to the user.

3. **Log Errors**: Use the `onError` prop to log errors to an error reporting service.

4. **Graceful Degradation**: Design your fallback UI to allow users to continue using other parts of the application if possible.

5. **Don't Overuse**: Error Boundaries are for unexpected errors. Don't use them for control flow.

6. **Test Error Scenarios**: Deliberately cause errors in your components to ensure your Error Boundaries work as expected.

## Common Pitfalls

<Callout>

1. Trying to Catch Event Handler Errors:

   - Mistake: Expecting Error Boundaries to catch errors in event handlers.
   - Why: Error Boundaries only catch errors during rendering, in effects, and in custom hooks.
   - Solution: Use try-catch blocks in event handlers.

</Callout>

<Callout>

2. Placing Error Boundary Too High:

   - Mistake: Wrapping the entire application in a single Error Boundary.
   - Why: This can lead to the entire app being replaced by the fallback UI even for small, isolated errors.
   - Solution: Use multiple Error Boundaries to isolate different parts of your app.

</Callout>

<Callout>

3. Not Providing Enough Information:

   - Mistake: Showing a generic error message without any context or recovery options.
   - Why: This can frustrate users and make debugging difficult.
   - Solution: Provide meaningful error messages and, if possible, ways for the user to recover or report the error.

</Callout>

<Callout>

4. Forgetting to Reset Error State:
   - Mistake: Not providing a way to reset the error state when attempting to recover.
   - Why: This can lead to the fallback UI being stuck even after the error condition might have been resolved.
   - Solution: Implement a reset mechanism, like the `resetErrorBoundary` function provided by react-error-boundary.

</Callout>

## Related Concepts

1. **Error Handling in JavaScript**: Understanding how errors propagate in JavaScript is crucial for effective use of Error Boundaries.
2. **React Hooks**: Error Boundaries with functional components rely on hooks and custom hooks.
3. **React Component Composition**: Error Boundaries rely on component composition.
4. **Defensive Programming**: Error Boundaries are a form of defensive programming in React applications.
5. **Monitoring and Logging**: Error Boundaries are often used in conjunction with error monitoring and logging services.

## Further Resources

<Callout emoji='📚'>

1. [Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary): Official React documentation on Error Boundaries.

2. [react-error-boundary](https://github.com/bvaughn/react-error-boundary): The library we used for implementing Error Boundaries with hooks.

3. [Use React Error Boundaries to Handle Errors in React Components](https://egghead.io/lessons/react-use-react-error-boundaries-to-handle-errors-in-react-components): Video tutorial on implementing Error Boundaries.

4. [Resilient React Error Handling with Error Boundaries and Hooks](https://kentcdodds.com/blog/use-react-error-boundary-to-handle-errors-in-react): Article by Kent C. Dodds on advanced Error Boundary usage.

5. [Error Boundaries for React Functional Components](https://dev.to/devlargs/error-boundaries-for-react-functional-components-3gf9): A guide on using Error Boundaries with functional components.

6. [Handling API Errors with React Error Boundaries](https://blog.logrocket.com/handling-api-errors-react-error-boundaries/): Article on using Error Boundaries for API error handling.

7. [React Error Boundaries in Depth](https://react.Christmas/2020/4): In-depth explanation of Error Boundaries and their use cases.

</Callout>

```

## pages/react/L3-senior/higher-order-components.mdx
```
import { Callout } from "nextra/components";

# Higher-Order Components (HOCs) in React

## Brief Overview

<Callout emoji='💡'>
  A Higher-Order Component (HOC) is an advanced technique in React for reusing
  component logic. It's not a part of the React API, but a pattern that emerges
  from React's compositional nature. Essentially, a HOC is a function that takes
  a component and returns a new component with some additional functionality.
</Callout>

## Detailed Explanation

### Concept and Usage

A Higher-Order Component is a function that takes a component as an argument and returns a new component that wraps the original one. The HOC adds some additional functionality or props to the wrapped component.

The basic structure of a HOC looks like this:

```javascript
function withExtraFunctionality(WrappedComponent) {
  return function (props) {
    // Add extra functionality here
    return <WrappedComponent {...props} />;
  };
}
```

You would use it like this:

```javascript
const EnhancedComponent = withExtraFunctionality(OriginalComponent);
```

### Why do we need these?

While Hooks have largely replaced the need for HOCs in modern React development, understanding HOCs is still valuable:

1. **Legacy Codebase Maintenance**: Many existing React projects still use HOCs.
2. **Complex Compositions**: Some scenarios might be more elegantly solved with HOCs than with Hooks.
3. **Library Integration**: Some third-party libraries still use the HOC pattern.
4. **Cross-Cutting Concerns**: HOCs can be useful for applying consistent behavior across many components.

### When to leverage them?

Consider using HOCs in the following scenarios:

1. **When working with class components in legacy code**: HOCs can be a powerful tool for code reuse with class components.
2. **For complex prop manipulations**: When you need to significantly transform props passed to a component.
3. **When integrating with certain external libraries**: Some libraries still use the HOC pattern for React integration.
4. **When you need to wrap the entire component**: Unlike Hooks, HOCs can wrap the entire component, including its lifecycle or effects.

## Code Examples

### Basic HOC Example

Here's a simple HOC that adds a loading state to a component:

```jsx
import React, { useState, useEffect } from "react";

function withLoading(WrappedComponent) {
  return function (props) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
      return <div>Loading...</div>;
    }
    return <WrappedComponent {...props} />;
  };
}

// Usage
const MyComponent = ({ name }) => <div>Hello, {name}!</div>;
const MyComponentWithLoading = withLoading(MyComponent);

// In your app
function App() {
  return <MyComponentWithLoading name='John' />;
}
```

### HOC with Additional Props

This HOC adds an extra prop to the wrapped component:

```jsx
import React from "react";

function withExtraProp(WrappedComponent) {
  return function (props) {
    return (
      <WrappedComponent
        {...props}
        extraProp='I am an extra prop!'
      />
    );
  };
}

// Usage
const MyComponent = ({ name, extraProp }) => (
  <div>
    <p>Hello, {name}!</p>
    <p>{extraProp}</p>
  </div>
);

const EnhancedComponent = withExtraProp(MyComponent);

// In your app
function App() {
  return <EnhancedComponent name='John' />;
}
```

### Composing Multiple HOCs

You can compose multiple HOCs together:

```jsx
import React from "react";
import { compose } from "redux"; // or implement your own compose function

const withLoading = WrappedComponent => props => {
  // ... loading logic here
};

const withExtraProp = WrappedComponent => props => {
  // ... extra prop logic here
};

const enhance = compose(
  withLoading,
  withExtraProp
  // more HOCs...
);

const MyComponent = ({ name, extraProp }) => (
  <div>
    <p>Hello, {name}!</p>
    <p>{extraProp}</p>
  </div>
);

const EnhancedComponent = enhance(MyComponent);

function App() {
  return <EnhancedComponent name='John' />;
}
```

## Best Practices

1. **Use Functional Components**: When creating HOCs, use functional components and hooks instead of class components.
2. **Pass Unrelated Props Through**: HOCs should pass through props that are unrelated to their specific concern.
3. **Maximize Composability**: HOCs should be composable with other HOCs.
4. **Use Meaningful Display Names**: Use the `React.displayName` property for easier debugging.
5. **Don't Use HOCs Inside the Render Method**: Apply HOCs outside the component definition.
6. **Handle Ref Properly**: Use the `React.forwardRef` API to forward refs to the wrapped component.
7. **Consider Hooks First**: For new code, consider if the same functionality can be achieved more simply with hooks.

## Common Pitfalls

<Callout>

1. Overusing HOCs:

   - Mistake: Using HOCs for every small piece of shared functionality.
   - Why: This can lead to "wrapper hell" and make your component tree unnecessarily deep.
   - Solution: Consider using Hooks or other patterns for simpler cases of code reuse.

</Callout>

<Callout>

2. Props Collision:

   - Mistake: Not handling potential prop name collisions between different HOCs.
   - Why: This can lead to props being accidentally overwritten.
   - Solution: Be explicit about prop names and consider using a namespace for HOC-specific props.

</Callout>

<Callout>

3. Losing Component Identity:

   - Mistake: Not preserving the original component's name and prop-types.
   - Why: This can make debugging more difficult.
   - Solution: Use the `React.displayName` property and forward prop-types and default props.

</Callout>

<Callout>

4. Performance Concerns:
   - Mistake: Creating new components in the render method.
   - Why: This can lead to unnecessary re-renders and negatively impact performance.
   - Solution: Create HOC-wrapped components outside of the render method.

</Callout>

## Related Concepts

1. **Render Props**: Another pattern for sharing code between React components.
2. **React Hooks**: Introduced in React 16.8 as a simpler alternative to HOCs and render props.
3. **Function Composition**: The programming concept that HOCs are based on.
4. **Decorators**: A proposed JavaScript feature that can be used to implement HOCs more elegantly.
5. **Custom Hooks**: A modern alternative to HOCs for reusing stateful logic between components.

## Further Resources

<Callout emoji='📚'>

1. [Higher-Order Components](https://reactjs.org/docs/higher-order-components.html): Official React documentation on HOCs (note: this is from the older React docs).

2. [React Patterns](https://reactpatterns.com/): A collection of React patterns, including HOCs.

3. [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks): An alternative to HOCs for reusing component logic.

4. [Higher Order Components in React](https://www.robinwieruch.de/react-higher-order-components/): A comprehensive guide to understanding and implementing HOCs.

</Callout>

```

## pages/react/L3-senior/loading-states.mdx
```
import { Callout } from "nextra/components";

# Loading State in React

## Brief Overview

<Callout emoji='💡'>
  Loading State in React refers to the practice of managing and displaying the
  status of asynchronous operations, typically data fetching. It involves
  handling the period between when a request is initiated and when the data is
  available, providing feedback to the user during this time.
</Callout>

## Detailed Explanation

### Handling Loading States

Managing loading states effectively is crucial for creating a smooth user experience. Here are key aspects of handling loading states:

1. **Initiating the Loading State**: Set a loading flag when starting an asynchronous operation.
2. **Updating the UI**: Use conditional rendering to show a loading indicator while the operation is in progress.
3. **Handling Completion**: Update the UI with the fetched data and remove the loading indicator when the operation completes.
4. **Error Handling**: Account for potential errors and display appropriate messages.

### Fallback UI

A fallback UI is what's shown to the user while the main content is loading. This can range from simple loading spinners to more complex skeleton screens. The goal is to provide visual feedback to the user that something is happening, reducing perceived wait times and improving user experience.

Types of fallback UIs:

1. **Spinners or Loading Icons**: Simple animated indicators.
2. **Progress Bars**: Useful when you can estimate the loading time.
3. **Skeleton Screens**: Placeholder layouts that mimic the structure of the loading content.
4. **Text Indicators**: Simple "Loading..." text for less complex scenarios.

## Code Examples

### Basic Loading State with useState

Here's a simple example using `useState` to manage loading state:

```jsx
import React, { useState, useEffect } from "react";

function DataFetchingComponent() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("https://api.example.com/data");
      const result = await response.json();
      setData(result);
    } catch (error) {
      setError("An error occurred while fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      {/* Render your data here */}
      {JSON.stringify(data)}
    </div>
  );
}
```

### Loading State with Suspense and React.lazy

React's Suspense feature allows you to specify fallback content while waiting for some code or data to load:

```jsx
import React, { Suspense } from "react";

const LazyComponent = React.lazy(() => import("./LazyComponent"));

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    </div>
  );
}
```

### Skeleton Loading UI

Here's an example of a skeleton loading UI:

```jsx
import React, { useState, useEffect } from "react";
import "./SkeletonLoading.css";

function SkeletonLoading() {
  return (
    <div className='skeleton-wrapper'>
      <div className='skeleton-header' />
      <div className='skeleton-content'>
        <div className='skeleton-line' />
        <div className='skeleton-line' />
        <div className='skeleton-line' />
      </div>
    </div>
  );
}

function Content({ data }) {
  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.content}</p>
    </div>
  );
}

function DataComponent() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Simulate API call
    setTimeout(() => {
      setData({ title: "Hello", content: "World" });
      setIsLoading(false);
    }, 2000);
  };

  return isLoading ? <SkeletonLoading /> : <Content data={data} />;
}
```

## Best Practices

1. **Provide Immediate Feedback**: Show loading indicators as soon as an action is initiated.
2. **Use Appropriate Loading Indicators**: Choose loading UIs that match the expected wait time and content type.
3. **Handle Error States**: Always account for potential errors and display user-friendly error messages.
4. **Avoid Flash of Loading State**: For quick operations, consider delaying the display of loading indicators to prevent flickering.
5. **Use Skeleton Screens for Complex UIs**: They provide a smoother perceived transition than simple spinners.
6. **Optimize Performance**: Implement techniques like debouncing and caching to minimize loading times.
7. **Accessibility**: Ensure loading indicators are accessible to screen readers.

## Common Pitfalls

<Callout>

1. Forgetting to Handle Errors:

   - Mistake: Only considering the loading and success states.
   - Why: This can lead to a poor user experience when errors occur.
   - Solution: Always include error handling in your loading state management.

</Callout>

<Callout>

2. Overusing Loading Indicators:

   - Mistake: Showing loading indicators for very quick operations.
   - Why: This can make the application feel slower than it actually is.
   - Solution: Consider using instant optimistic UI updates for quick operations.

</Callout>

<Callout>

3. Not Cancelling Requests:

   - Mistake: Failing to cancel pending requests when a component unmounts.
   - Why: This can lead to memory leaks and errors.
   - Solution: Use AbortController or cleanup functions in useEffect to cancel pending requests.

</Callout>

<Callout>

4. Inconsistent Loading UI:
   - Mistake: Using different loading UIs across the application.
   - Why: This can create a disjointed user experience.
   - Solution: Standardize your loading UIs across the application for consistency.

</Callout>

## Related Concepts

1. **Asynchronous JavaScript**: Understanding Promises and async/await is crucial for managing loading states.
2. **React Suspense**: A React feature for declarative data fetching and code splitting.
3. **Error Boundaries**: Often used in conjunction with loading states to handle errors in React applications.
4. **Optimistic UI Updates**: A technique to improve perceived performance by updating the UI before an operation completes.
5. **Debouncing and Throttling**: Techniques to control the rate of data fetching and loading state changes.

## Further Resources

<Callout emoji='📚'>

1. [Suspense for Data Fetching (Experimental)](https://react.dev/reference/react/Suspense): React documentation on the Suspense feature.

2. [Skeleton Screen Loading](https://www.lukew.com/ff/entry.asp?1797): Article explaining the concept of skeleton screens.

3. [React Loading Skeleton](https://github.com/dvtng/react-loading-skeleton): A popular library for creating skeleton loading states in React.

4. [Loading State and Error Handling in React](https://www.robinwieruch.de/react-fetching-data/): Comprehensive guide to handling loading states and errors in React applications.

5. [Designing For The Appearance Of Speed](https://www.smashingmagazine.com/2015/09/why-performance-matters-the-perception-of-time/): Article on creating perceived performance improvements through UI design.

</Callout>

```

## pages/react/L3-senior/portals.mdx
```
import { Callout } from "nextra/components";

# Portals in React

## Brief Overview

<Callout emoji='💡'>
  Portals in React provide a way to render children into a DOM node that exists
  outside the DOM hierarchy of the parent component. This allows for more
  flexible rendering of components, especially useful for modals, tooltips, and
  other overlay-style UI elements.
</Callout>

## Detailed Explanation

### What are Portals? Why do we need them?

Portals are a feature in React that allows you to render a component's children into a different part of the DOM tree, outside of the component's own hierarchy.

**We need Portals for several reasons**:

1. **Breaking Out of Container**: Sometimes, a component needs to visually "break out" of its container. For example, modals, tooltips, or floating menus.

2. **Avoiding CSS Limitations**: Portals can help overcome CSS limitations related to stacking contexts and z-index.

3. **Rendering to Different Parts of the DOM**: In some cases, you might need to render content to a specific part of the DOM for semantic or accessibility reasons.

4. **Avoiding Conflicts**: Portals can help avoid conflicts with parent component's CSS or layout.

### Rendering children into different DOM subtrees

Portals allow you to render children into a different DOM subtree while maintaining the React component hierarchy. This means:

1. The portal component still exists in the React component tree, maintaining context and event bubbling.
2. The rendered output appears in a different place in the actual DOM.

The syntax for creating a portal is:

```jsx
ReactDOM.createPortal(child, container);
```

Where `child` is any renderable React child, and `container` is a DOM element.

## Code Examples

### Basic Portal Example

Here's a simple example of a modal using a Portal:

```jsx
import React from "react";
import ReactDOM from "react-dom";

function Modal({ children, onClose }) {
  return ReactDOM.createPortal(
    <div className='modal-overlay'>
      <div className='modal-content'>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body
  );
}

function App() {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <div>
      <h1>My App</h1>
      <button onClick={() => setShowModal(true)}>Show Modal</button>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2>This is a modal</h2>
          <p>It's rendered outside the App component's DOM tree.</p>
        </Modal>
      )}
    </div>
  );
}
```

### Portal with Event Bubbling

This example demonstrates how events from portals bubble up through the React tree:

```jsx
import React from "react";
import ReactDOM from "react-dom";

function Child() {
  return (
    <div className='modal'>
      <button>Click</button>
    </div>
  );
}

function Parent() {
  const [clicks, setClicks] = React.useState(0);
  const handleClick = () => setClicks(c => c + 1);

  return (
    <div onClick={handleClick}>
      <p>Number of clicks: {clicks}</p>
      {ReactDOM.createPortal(<Child />, document.body)}
    </div>
  );
}
```

In this example, clicking the button inside the portal will increment the click count in the parent component, demonstrating that event bubbling works through portals.

## Best Practices

1. **Use Portals Sparingly**: Only use portals when necessary, such as for modals, tooltips, or floating menus.

2. **Keep Accessibility in Mind**: Ensure that content rendered through portals is still accessible, especially for screen readers.

3. **Manage Focus**: When using portals for modals or dialogs, manage focus correctly for keyboard navigation.

4. **Clean Up**: Always clean up and unmount portals when they're no longer needed to prevent memory leaks.

5. **Consider Server-Side Rendering**: Be aware that portals may require special handling in server-side rendering scenarios.

6. **Maintain React's Unidirectional Data Flow**: Even though the DOM structure changes, maintain React's principles of unidirectional data flow.

## Common Pitfalls

<Callout>

1. Overusing Portals:

   - Mistake: Using portals for layout purposes when CSS could solve the problem.
   - Why: This can complicate your component structure unnecessarily.
   - Solution: Only use portals when you need to break out of the DOM hierarchy for a specific reason.

</Callout>

<Callout>

2. Forgetting About Event Bubbling:

   - Mistake: Assuming events in portals are isolated from the rest of the app.
   - Why: Events from portals still bubble up through the React component tree.
   - Solution: Be aware of event bubbling and handle events appropriately.

</Callout>

<Callout>

3. Not Cleaning Up Portals:

   - Mistake: Failing to unmount or clean up portals when they're no longer needed.
   - Why: This can lead to memory leaks or unexpected behavior.
   - Solution: Always ensure portals are properly unmounted and cleaned up.

</Callout>

<Callout>

4. Ignoring Accessibility:
   - Mistake: Not considering accessibility when using portals.
   - Why: Content in portals can be difficult for screen readers to navigate.
   - Solution: Ensure proper ARIA attributes and focus management for portal content.

</Callout>

## Related Concepts

1. **React.createRef**: Often used to get references to DOM nodes for portal targets.
2. **useEffect Hook**: Useful for managing the lifecycle of portals in functional components.
3. **Event Bubbling**: Understanding how events bubble through portals is crucial.
4. **React Context**: Context still works as expected through portals.
5. **CSS Stacking Contexts**: Portals can help manage complex stacking contexts.

## Further Resources

<Callout emoji='📚'>

1. [Portals](https://react.dev/reference/react-dom/createPortal): Official React documentation on Portals.

2. [Rendering to the DOM](https://react.dev/reference/react-dom/render): React documentation on rendering, which includes information about createPortal.

3. [Creating and Using Portals](https://react.dev/learn/using-portals): A guide on using portals in React applications.

4. [Portals in React](https://blog.logrocket.com/learn-react-portals-by-example/): A comprehensive guide to understanding and using portals in React.

5. [Modal Dialogs in React](https://reactjs.org/docs/portals.html#usage): Official React documentation example of using portals for modal dialogs.

6. [Accessibility in React](https://reactjs.org/docs/accessibility.html): React's accessibility guide, which is relevant when working with portals.

7. [Managing Focus in Portals](https://www.w3.org/TR/wai-aria-practices/#dialog_modal): W3C guidelines on managing focus in modal dialogs, which often use portals.

</Callout>

```

## pages/react/L3-senior/react-fragement.mdx
```
import { Callout } from "nextra/components";

# React Fragments

## Brief Overview

<Callout emoji='💡'>
  React Fragments allow you to group multiple elements without adding an extra
  node to the DOM. They provide a cleaner way to return multiple elements from a
  component's render method.
</Callout>

## Detailed Explanation

### What are React Fragments?

React Fragments are a feature in React that allow you to group multiple children elements without adding an extra DOM element. They solve the problem of having to wrap multiple elements in a single parent element when returning JSX from a component.

### Using `<React.Fragment>` vs. shorthand syntax `<>`

There are two ways to use Fragments in React:

1. The explicit `<React.Fragment>` syntax:

```jsx
import React from "react";

function Example() {
  return (
    <React.Fragment>
      <h1>Title</h1>
      <p>Paragraph</p>
    </React.Fragment>
  );
}
```

2. The shorthand syntax `<>`:

```jsx
function Example() {
  return (
    <>
      <h1>Title</h1>
      <p>Paragraph</p>
    </>
  );
}
```

The main difference is that the `<React.Fragment>` syntax allows you to pass a `key` prop when rendering lists of Fragments. The shorthand syntax doesn't support keys or attributes.

### When and why to use Fragments

You should use Fragments in the following situations:

1. **Returning multiple elements**: When a component needs to return multiple elements without wrapping them in a container div.

```jsx
function Example() {
  return (
    <>
      <h1>Title</h1>
      <p>Paragraph 1</p>
      <p>Paragraph 2</p>
    </>
  );
}
```

2. **Avoiding unnecessary DOM nodes**: When you want to group elements without adding extra nodes to the DOM.

3. **Creating table rows**: When you need to group `<td>` elements without an extra wrapping element.

```jsx
function Table() {
  return (
    <table>
      <tr>
        <React.Fragment>
          <td>Cell 1</td>
          <td>Cell 2</td>
        </React.Fragment>
      </tr>
    </table>
  );
}
```

4. **Conditional rendering**: When you need to conditionally render multiple elements.

```jsx
function ConditionalRender({ isLoggedIn }) {
  return (
    <>
      <h1>Welcome</h1>
      {isLoggedIn && (
        <>
          <p>You are logged in.</p>
          <button>Logout</button>
        </>
      )}
    </>
  );
}
```

## Best Practices

1. **Use the shorthand syntax when possible**: For better readability, use `<>` instead of `<React.Fragment>` unless you need to pass a key.
2. **Avoid unnecessary Fragments**: If you're already returning a single element, there's no need to wrap it in a Fragment.
3. **Use Fragments to improve component structure**: Fragments can help you create more logical groupings of elements without affecting the DOM structure.
4. **Remember Fragments when working with lists**: When mapping over arrays to create lists of elements, Fragments can be useful for grouping related items.

## Common Pitfalls

<Callout>

1. Forgetting that Fragments don't render to the DOM:

   - Mistake: Trying to style a Fragment directly.
   - Why: Fragments don't produce a DOM element, so they can't be styled.
   - Solution: If you need to style a group of elements, use a container div instead of a Fragment.

</Callout>

<Callout>

2. Using the shorthand syntax when a key is needed:

   - Mistake: Using `<>` when rendering a list of Fragments that require keys.
   - Why: The shorthand syntax doesn't support attributes, including keys.
   - Solution: Use the full `<React.Fragment>` syntax when you need to add a key.

</Callout>

<Callout>

3. Overusing Fragments:

   - Mistake: Wrapping every group of elements in Fragments unnecessarily.
   - Why: This can make your code harder to read without providing any benefit.
   - Solution: Only use Fragments when you actually need to group elements without adding a DOM node.

</Callout>

<Callout>

4. Forgetting to import React when using the full syntax:
   - Mistake: Using `<React.Fragment>` without importing React.
   - Why: The full syntax requires React to be in scope.
   - Solution: Always import React when using the full Fragment syntax, or use the shorthand syntax.

</Callout>

## Related Concepts

1. **JSX**: Fragments are a feature of JSX and are closely related to how JSX works.
2. **Keys in React**: Understanding how keys work is important when using Fragments in lists.
3. **Conditional Rendering**: Fragments are often useful in conditional rendering scenarios.
4. **Component Composition**: Fragments can help with creating more flexible component structures.
5. **React.Children**: This API is sometimes used in conjunction with Fragments for advanced component patterns.

## Further Resources

<Callout emoji='📚'>

1. [Fragments](https://react.dev/reference/react/Fragment): Official React documentation on Fragments.

2. [Rendering Lists](https://react.dev/learn/rendering-lists): Guide on rendering lists in React, which often involves using Fragments.

3. [Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx): Comprehensive guide on JSX, including the use of Fragments.

4. [Keeping Components Pure](https://react.dev/learn/keeping-components-pure): Discusses how Fragments can help in writing pure components.

5. [React Fragments: What and Why](https://www.robinwieruch.de/react-fragment/): A detailed article explaining the concept and use cases of React Fragments.

6. [Understanding React Fragments](https://www.digitalocean.com/community/tutorials/react-fragments-in-react): A tutorial on React Fragments with practical examples.

7. [React's Fragments in 2 Minutes](https://dev.to/tumee/react-s-fragments-in-2-minutes-or-less-3ec6): A quick overview of React Fragments for those who prefer brevity.

</Callout>

```

## pages/react/L3-senior/render-props.mdx
```
import { Callout } from "nextra/components";

# Render Props in React

## Brief Overview

<Callout emoji='💡'>
  Render Props is a pattern in React where a component receives a function as a
  prop and uses this function to render its content. This pattern allows for
  greater component reusability and flexibility in sharing behavior between
  components.
</Callout>

## Detailed Explanation

### Pattern Explanation

The Render Props pattern involves a component receiving a function as one of its props. This function returns a React element and is used to render the component's content. The term "render prop" refers to a technique for sharing code between React components using a prop whose value is a function.

Here's a basic structure of a component using Render Props:

```jsx
import React, { useState, useEffect } from "react";

function DataProvider({ render }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulating data fetching
    setTimeout(() => {
      setData("Some data");
    }, 1000);
  }, []);

  return render(data);
}

// Usage
function App() {
  return (
    <DataProvider
      render={data => <div>{data ? <h1>{data}</h1> : <p>Loading...</p>}</div>}
    />
  );
}
```

In this example, `DataProvider` is a component that manages some data. Instead of rendering its own UI, it calls the function passed to it as the render prop, passing along its data.

### Key Benefits of Render Props

1. **Code Reuse**: Allows you to share behavior between components without inheritance.
2. **Flexibility**: Provides more control over how the shared functionality is used.
3. **Composition**: Works well with React's compositional nature.
4. **Avoiding Naming Collisions**: Unlike HOCs, Render Props don't create new components, reducing the risk of prop naming collisions.

### Common Use Cases

1. Sharing stateful logic between components
2. Abstracting cross-cutting concerns (like data fetching or subscription handling)
3. Creating controllable and flexible components

## Code Examples

### Basic Render Prop

```jsx
import React, { useState } from "react";

function Counter({ render }) {
  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);

  return render(count, increment);
}

function App() {
  return (
    <Counter
      render={(count, increment) => (
        <div>
          <p>Count: {count}</p>
          <button onClick={increment}>Increment</button>
        </div>
      )}
    />
  );
}
```

This example shows a `Counter` component that manages a count state and provides an increment function. It uses a render prop to allow the parent component to decide how to render the counter.

### Render Props with Children

Instead of using a prop called `render`, you can use the `children` prop:

```jsx
import React, { useState } from "react";

function ToggleButton({ children }) {
  const [isOn, setIsOn] = useState(false);

  const toggle = () => setIsOn(!isOn);

  return children(isOn, toggle);
}

function App() {
  return (
    <ToggleButton>
      {(isOn, toggle) => (
        <button onClick={toggle}>{isOn ? "ON" : "OFF"}</button>
      )}
    </ToggleButton>
  );
}
```

This approach can lead to cleaner JSX in some cases, and it's a common variation of the render props pattern.

## Comparison with Higher-Order Components (HOCs)

Both Render Props and Higher-Order Components are patterns for reusing component logic. Here's a comparison:

1. **Implementation**:

   - HOC: A function that takes a component and returns a new component
   - Render Props: A component that takes a function as a prop and calls it in its render method

2. **Composability**:

   - HOC: Can be challenging to compose multiple HOCs
   - Render Props: Easier to compose multiple render props

3. **Debugging**:

   - HOC: Can make debugging more difficult due to component wrapping
   - Render Props: Generally easier to debug as the component hierarchy is more explicit

4. **Prop Naming Collisions**:

   - HOC: Can lead to prop naming collisions when composing multiple HOCs
   - Render Props: Avoids this issue as it doesn't automatically pass through props

5. **Static Typing**:

   - HOC: Can be challenging to type correctly, especially with complex compositions
   - Render Props: Generally easier to type correctly

6. **Performance**:
   - HOC: Creates an additional component wrapper, which can impact performance in deeply nested structures
   - Render Props: Doesn't create additional component wrappers

## Best Practices

1. **Use Descriptive Prop Names**: While `render` is common, use a name that describes what the render prop does (e.g., `renderItem`, `children`).
2. **Avoid Anonymous Functions in JSX**: Define render prop functions outside JSX to prevent unnecessary re-renders.
3. **Consider Using the Children Prop**: Using `children` as a function can lead to cleaner JSX.
4. **Combine with Other Patterns**: Render props can be combined with other React patterns for powerful abstractions.
5. **Be Mindful of Performance**: Like any pattern, overuse of render props can lead to performance issues. Use judiciously.

## Common Pitfalls

<Callout>

1. Overuse Leading to Deeply Nested Code:

   - Mistake: Using too many render props, leading to "callback hell".
   - Why: This can make code harder to read and maintain.
   - Solution: Consider combining render props or using hooks for simpler cases.

</Callout>

<Callout>

2. Unnecessary Re-renders:

   - Mistake: Defining the render prop function inline in JSX.
   - Why: This creates a new function on every render, potentially causing unnecessary re-renders.
   - Solution: Define the render prop function outside the JSX or memoize it.

</Callout>

<Callout>

3. Incorrect Typing with TypeScript:

   - Mistake: Not properly typing the render prop function.
   - Why: This can lead to type errors or missed type checking benefits.
   - Solution: Carefully type your render prop functions, considering both input and output types.

</Callout>

<Callout>

4. Forgetting to Pass Down Props:
   - Mistake: Not passing necessary props through the render prop.
   - Why: This can lead to components not having access to needed data or functions.
   - Solution: Ensure all necessary props are passed through the render prop function.

</Callout>

## Related Concepts

1. **Higher-Order Components (HOCs)**: Another pattern for component logic reuse, often compared with Render Props.
2. **Hooks**: Hooks can often replace the need for render props in simpler scenarios.
3. **Function as Child Component (FaCC)**: A specific implementation of render props using the `children` prop.
4. **Compound Components**: Often used alongside render props to create flexible component APIs.
5. **Context API**: Can be used with render props to avoid prop drilling.

## Further Resources

<Callout emoji='📚'>

1. [Render Props](https://reactjs.org/docs/render-props.html): Official React documentation on Render Props (note: this is from the older React docs).

2. [Use Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks): Guide on reusing logic with custom hooks, which can be an alternative to render props in some cases.

3. [Passing data with Render Props](https://react.dev/reference/react/cloneElement#passing-data-with-a-render-prop): Understanding using render props.

4. [React Patterns](https://reactpatterns.com/): A collection of React patterns, including render props.

5. [Render Props in React, Frontend System Design](https://dev.to/jeetvora331/render-props-in-react-frontend-system-design-3f3b): A detailed article on using render props in React.

</Callout>

```

## pages/react/L3-senior/testing-react-applications.mdx
```
import { Callout } from "nextra/components";

# Testing React Applications

## Brief Overview

<Callout emoji='💡'>
  Testing React applications involves writing and running automated tests to
  verify that your application behaves as expected. This includes unit tests for
  individual components, integration tests for component interactions, and
  end-to-end tests for complete user flows.
</Callout>

## Detailed Explanation

### Why do we need to test our applications?

Testing is a crucial part of software development for several reasons:

1. **Catch Bugs Early**: Tests help identify issues before they reach production, saving time and resources.
2. **Improve Code Quality**: Writing tests often leads to better-designed, more modular code.
3. **Facilitate Refactoring**: Tests provide confidence when making changes to existing code.
4. **Document Code Behavior**: Tests serve as executable documentation of how your code should behave.
5. **Enable Continuous Integration/Continuous Deployment (CI/CD)**: Automated tests are essential for implementing robust CI/CD pipelines.
6. **Enhance Developer Confidence**: A good test suite gives developers confidence in their code and reduces stress during deployments.

### Jest

Jest is a popular JavaScript testing framework that works well with React applications. It's often the default choice for testing React apps due to its simplicity and powerful features.

Key features of Jest:

- **Zero Config**: Works out of the box for most JavaScript projects.
- **Snapshot Testing**: Allows you to easily capture and verify the structure of your components.
- **Mocking**: Provides powerful mocking capabilities for functions and modules.
- **Fast and Parallel**: Runs tests in parallel, making the test suite faster.

Example of a simple Jest test:

```javascript
import { sum } from "./math";

test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3);
});
```

### React Testing Library

React Testing Library is a set of helpers that let you test React components without relying on their implementation details. It encourages better testing practices by focusing on testing your application as users would use it.

Key principles of React Testing Library:

- **Querying Elements**: Provides queries to find elements by their label text, role, or test ID.
- **User-centric**: Encourages testing from the user's perspective.
- **Accessibility**: Promotes writing accessible applications by querying the DOM in ways that users would.

Example of a React Testing Library test:

```jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Counter from "./Counter";

test("increments counter", () => {
  render(<Counter />);
  const button = screen.getByText("Increment");
  userEvent.click(button);
  expect(screen.getByText("Count: 1")).toBeInTheDocument();
});
```

### Component Testing Strategies

When testing React components, consider the following strategies:

1. **Unit Testing**: Test individual components in isolation.

   - Focus on the component's props, state, and rendered output.
   - Use shallow rendering to limit the test scope.

2. **Integration Testing**: Test how components work together.

   - Render parent components with their children.
   - Test interactions between components.

3. **Snapshot Testing**: Capture a component's rendered output and compare it to a stored snapshot.

   - Useful for detecting unintended changes in UI.
   - Be cautious of overuse, as it can lead to brittle tests.

4. **Behavior Testing**: Focus on testing the component's behavior rather than its implementation.

   - Use React Testing Library to interact with components as a user would.
   - Test user flows and interactions.

5. **Mocking**: Use mocks for external dependencies, API calls, or complex logic.

   - Helps isolate the component being tested.
   - Useful for testing error states or loading behaviors.

6. **Coverage Testing**: Measure how much of your code is covered by tests.
   - Aim for high coverage, but don't treat it as the only metric of test quality.

## Code Examples

### Jest Example: Testing a Utility Function

```javascript
// math.js
export function sum(a, b) {
  return a + b;
}

// math.test.js
import { sum } from "./math";

describe("sum function", () => {
  it("adds two numbers correctly", () => {
    expect(sum(1, 2)).toBe(3);
    expect(sum(-1, 1)).toBe(0);
    expect(sum(5, 5)).toBe(10);
  });

  it("handles floating point numbers", () => {
    expect(sum(0.1, 0.2)).toBeCloseTo(0.3);
  });
});
```

### React Testing Library Example: Testing a Counter Component

```jsx
// Counter.js
import React, { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// Counter.test.js
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Counter from "./Counter";

describe("Counter component", () => {
  it("renders initial count", () => {
    render(<Counter />);
    expect(screen.getByText("Count: 0")).toBeInTheDocument();
  });

  it("increments count when button is clicked", () => {
    render(<Counter />);
    const button = screen.getByText("Increment");
    userEvent.click(button);
    expect(screen.getByText("Count: 1")).toBeInTheDocument();
  });
});
```

## Best Practices

1. **Write Tests First (TDD)**: Consider writing tests before implementing features to ensure better test coverage and design.
2. **Keep Tests Simple**: Each test should ideally check one specific behavior.
3. **Use Descriptive Test Names**: Test names should clearly describe what is being tested and the expected outcome.
4. **Avoid Testing Implementation Details**: Focus on testing behavior and outputs rather than internal workings.
5. **Maintain Test Independence**: Each test should be able to run independently of others.
6. **Use Continuous Integration**: Run your tests automatically on every code change.
7. **Keep Tests Fast**: Slow tests discourage frequent running. Optimize for speed where possible.

## Common Pitfalls

<Callout>

1. Over-reliance on Snapshot Tests:

   - Mistake: Using snapshot tests for everything.
   - Why: Snapshots can be brittle and don't necessarily test behavior.
   - Solution: Use snapshots judiciously, primarily for stable components.

</Callout>

<Callout>

2. Testing Implementation Details:

   - Mistake: Writing tests that are tightly coupled to component internals.
   - Why: This makes tests brittle and can hinder refactoring.
   - Solution: Focus on testing component behavior and output.

</Callout>

<Callout>

3. Insufficient Test Coverage:

   - Mistake: Only testing the happy path.
   - Why: This leaves edge cases and error scenarios untested.
   - Solution: Test various scenarios, including error states and edge cases.

</Callout>

<Callout>

4. Ignoring Accessibility in Tests:
   - Mistake: Not considering accessibility when writing tests.
   - Why: This can lead to inaccessible applications.
   - Solution: Use queries that encourage accessible markup, like `getByRole`.

</Callout>

## Related Concepts

1. **Continuous Integration/Continuous Deployment (CI/CD)**: Automated testing is a key component of CI/CD pipelines.
2. **Test-Driven Development (TDD)**: A development process relying on a short development cycle where tests are written before the code.
3. **Mocking**: Creating fake versions of external services or modules to isolate the code being tested.
4. **Code Coverage**: A measure of how much of your code is executed during your tests.
5. **End-to-End Testing**: Testing the entire application flow, often using tools like Cypress or Selenium.

## Further Resources

<Callout emoji='📚'>

1. [Jest Documentation](https://jestjs.io/docs/getting-started): Comprehensive guide to using Jest for JavaScript testing.

2. [Testing React Apps](https://jestjs.io/docs/tutorial-react): Jest's tutorial on testing React applications.

3. [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/): Official documentation for React Testing Library.

4. [Common Mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library): An article by Kent C. Dodds on avoiding common pitfalls when using React Testing Library.

5. [Static vs Unit vs Integration vs E2E Testing](https://kentcdodds.com/blog/static-vs-unit-vs-integration-vs-e2e-tests): An article explaining different types of tests and when to use each.

</Callout>

```

## pages/react/L3-senior/use-effect.mdx
```
import { Callout } from "nextra/components";

# useEffect Hook in React

## Brief Overview

<Callout emoji='💡'>
  The `useEffect` hook in React allows you to perform side effects in functional
  components. It serves as a replacement for several lifecycle methods found in
  class components and is a key part of the Hooks API.
</Callout>

## Detailed Explanation

### What is useEffect?

`useEffect` is a hook in React that allows you to perform side effects in functional components. Side effects can include data fetching, subscriptions, or manually changing the DOM.

### Why does useEffect exist?

`useEffect` exists to handle side effects in functional components. It provides a way to replicate lifecycle methods that were previously only available in class components.

### For which purpose?

**The main purposes of `useEffect` are**:

1. Performing side effects after rendering
2. Controlling when side effects run
3. Cleaning up side effects

### Why was it created in the first place?

**`useEffect` was created to solve several problems**:

1. Code duplication across different lifecycle methods in class components
2. The difficulty of handling side effects in functional components
3. The complexity of managing related code that was split across different lifecycle methods

### When was it created?

`useEffect` was introduced in React 16.8, which was released in February 2019. This release introduced Hooks, allowing state and other React features to be used in functional components.

### Basic Usage

```jsx
import React, { useEffect, useState } from "react";

function ExampleComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // This effect runs after every render
    fetchData().then(result => setData(result));
  }, []); // Empty dependency array means this effect runs once on mount

  return <div>{data ? <p>{data}</p> : <p>Loading...</p>}</div>;
}
```

### Cleanup Functions

Cleanup functions are return functions from effects that run before the component is removed from the UI and before re-running the effect on subsequent renders.

#### What are cleanup functions?

Cleanup functions are used to clean up side effects. They can be used to unsubscribe from subscriptions, cancel network requests, or clean up any other side effects that might lead to memory leaks.

#### When to use a cleanup function?

Use a cleanup function when your effect creates resources that need to be cleaned up. Common scenarios include:

- Clearing timers (set by `setInterval` or `setTimeout`)
- Unsubscribing from external data sources
- Cancelling network requests

Example with a cleanup function:

```jsx
useEffect(() => {
  const subscription = someExternalDataSource.subscribe();

  // Cleanup function
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Lifecycle Methods

Lifecycle methods are special methods that automatically get called as your component gets created, updated, or deleted.

#### What are lifecycle methods?

Lifecycle methods are functions that get called at different stages of a component's life. They allow you to run code at specific points in a component's existence.

#### How was the lifecycle handled in Class Components?

In class components, React provided several lifecycle methods:

- Mounting: `constructor`, `render`, `componentDidMount`
- Updating: `render`, `componentDidUpdate`
- Unmounting: `componentWillUnmount`

Example of lifecycle methods in a class component:

```jsx
class ExampleComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  componentDidMount() {
    console.log("Component mounted");
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.count !== prevState.count) {
      console.log("Count updated");
    }
  }

  componentWillUnmount() {
    console.log("Component will unmount");
  }

  render() {
    return <div>{this.state.count}</div>;
  }
}
```

#### How is it handled in Functional Components?

In functional components, the `useEffect` hook is used to handle side effects and replicate lifecycle behavior:

```jsx
function ExampleComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Component mounted");
    return () => console.log("Component will unmount");
  }, []); // Runs once on mount, cleanup on unmount

  useEffect(() => {
    console.log("Count updated");
  }, [count]); // Runs when count changes

  return <div>{count}</div>;
}
```

#### What control do we have over it?

With `useEffect`, we have fine-grained control over when effects run:

1. Run after every render: `useEffect(() => {})`
2. Run only once after mount: `useEffect(() => {}, [])`
3. Run when specific values change: `useEffect(() => {}, [dep1, dep2])`

We can also control cleanup by returning a function from the effect.

## Best Practices

1. **Use Multiple Effects for Unrelated Logic**: Separate concerns by using multiple `useEffect` calls.
2. **Be Careful with Object and Array Dependencies**: They can cause unnecessary effect runs. Consider using primitive values or memoization.
3. **Avoid Infinite Loops**: Be cautious when setting state in an effect that depends on that state.
4. **Use the Exhaustive Deps ESLint Rule**: This helps ensure all dependencies are correctly specified.
5. **Cleanup When Necessary**: Always clean up subscriptions and async tasks to prevent memory leaks.

## Common Pitfalls

<Callout>

1. Missing Dependencies:

   - Mistake: Not including all variables from the component scope that the effect uses.
   - Why: This can lead to stale closures and bugs that are hard to track down.
   - Solution: Include all variables from the component scope that the effect uses in the dependency array, or use the exhaustive-deps ESLint rule.

</Callout>

<Callout>

2. Overusing useEffect:

   - Mistake: Using `useEffect` for logic that doesn't involve side effects.
   - Why: This can lead to unnecessary re-renders and complicates the component logic.
   - Solution: Only use `useEffect` for true side effects. For calculations, consider using `useMemo` or moving the logic outside the component.

</Callout>

<Callout>

3. Not Cleaning Up:

   - Mistake: Forgetting to clean up subscriptions, timers, or other side effects.
   - Why: This can lead to memory leaks or unexpected behavior.
   - Solution: Always return a cleanup function from your effect when dealing with subscriptions, timers, or other long-living side effects.

</Callout>

<Callout>

4. Incorrect Dependency Array:
   - Mistake: Using an empty array `[]` when the effect actually depends on props or state.
   - Why: This can lead to bugs where the effect doesn't re-run when it should.
   - Solution: Carefully consider what your effect depends on and include those dependencies in the array.

</Callout>

## Related Concepts

1. **useState**: Often used in conjunction with `useEffect` to manage and respond to state changes.
2. **useLayoutEffect**: Similar to `useEffect`, but fires synchronously after all DOM mutations.
3. **useMemo and useCallback**: Can be used to optimize the dependency array of `useEffect`.
4. **Custom Hooks**: Often built using `useEffect` to encapsulate reusable side effect logic.
5. **React.StrictMode**: Can cause effects to run twice in development to help spot issues.

## Further Resources

<Callout emoji='📚'>

1. [useEffect Documentation](https://react.dev/reference/react/useEffect):
   Official React documentation on the useEffect hook from the new React docs.

1. [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects):
   Comprehensive guide on understanding and using effects in the new React docs.

1. [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects):
   Detailed explanation of the lifecycle of effects in React.

1. [Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies):
   Guide on how to think about and manage effect dependencies.

1. [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks):
   Tutorial on creating custom hooks, which often use useEffect.

1. [A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/):
   Comprehensive article by Dan Abramov on understanding useEffect.

1. [How to Fetch Data with React Hooks](https://www.robinwieruch.de/react-hooks-fetch-data):
   Tutorial on using useEffect for data fetching.

</Callout>

```

## pages/react/L3-senior/useImperativeHandle.mdx
```
import { Callout } from "nextra/components";

# useImperativeHandle Hook in React

## Brief Overview

<Callout emoji='💡'>
  `useImperativeHandle` is a React hook that customizes the instance value that
  is exposed to parent components when using `ref`. It's used in conjunction
  with `forwardRef` to expose a custom API for a component's imperative
  behavior.
</Callout>

## Detailed Explanation

### What is useImperativeHandle?

`useImperativeHandle` is a hook that allows you to customize the instance value that is exposed when a parent component uses a `ref` on your component. It gives you fine-grained control over what is accessible via the `ref`.

### Why does useImperativeHandle exist?

`useImperativeHandle` exists to solve the problem of exposing a limited, custom API to parent components when using refs, instead of exposing the entire DOM node or component instance. This allows for better encapsulation and more controlled interactions between components.

### For which purpose?

The main purposes of `useImperativeHandle` are:

1. **Customizing Ref Value**: To expose a custom set of methods or properties through a ref.

2. **Encapsulation**: To hide internal implementation details and expose only necessary functionality.

3. **Performance Optimization**: To prevent unnecessary re-renders by exposing specific methods instead of entire component instances.

4. **Creating Declarative APIs for Imperative Code**: To wrap imperative code (like DOM manipulations) in a more React-friendly, declarative API.

5. **Integration with Third-party Libraries**: To create React-friendly wrappers around imperative APIs of external libraries.

## Code Examples

### Basic useImperativeHandle Usage

Here's a simple example demonstrating the use of `useImperativeHandle`:

```jsx
import React, { useRef, useImperativeHandle, forwardRef } from "react";

const FancyInput = forwardRef((props, ref) => {
  const inputRef = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    },
    setValue: value => {
      inputRef.current.value = value;
    }
  }));

  return <input ref={inputRef} />;
});

function App() {
  const fancyInputRef = useRef();

  const handleClick = () => {
    fancyInputRef.current.focus();
    fancyInputRef.current.setValue("Hello, World!");
  };

  return (
    <div>
      <FancyInput ref={fancyInputRef} />
      <button onClick={handleClick}>Focus and Set Value</button>
    </div>
  );
}
```

In this example, `useImperativeHandle` is used to expose custom `focus` and `setValue` methods on the `FancyInput` component.

### Conditional Ref Handling

Here's an example that conditionally exposes different methods based on a prop:

```jsx
import React, { useRef, useImperativeHandle, forwardRef } from "react";

const ConditionalHandle = forwardRef(({ editable }, ref) => {
  const inputRef = useRef();

  useImperativeHandle(ref, () => {
    if (editable) {
      return {
        focus: () => inputRef.current.focus(),
        getValue: () => inputRef.current.value
      };
    } else {
      return {
        getValue: () => inputRef.current.value
      };
    }
  }, [editable]);

  return (
    <input
      ref={inputRef}
      readOnly={!editable}
    />
  );
});

function App() {
  const editableRef = useRef();
  const readOnlyRef = useRef();

  return (
    <div>
      <ConditionalHandle
        ref={editableRef}
        editable={true}
      />
      <ConditionalHandle
        ref={readOnlyRef}
        editable={false}
      />
    </div>
  );
}
```

This example demonstrates how `useImperativeHandle` can be used to expose different methods based on the component's props.

## Best Practices

1. **Use Sparingly**: Prefer props and state for most parent-child communications. Use `useImperativeHandle` only when necessary.

2. **Keep the API Minimal**: Expose only what's absolutely necessary through the imperative handle.

3. **Combine with forwardRef**: Always use `useImperativeHandle` in conjunction with `forwardRef`.

4. **Memoize the Handle**: If the handle doesn't depend on props or state, you can memoize it for better performance.

5. **Document the Exposed API**: Clearly document what methods and properties are exposed through the imperative handle.

## Common Pitfalls

<Callout>

1. Overusing Imperative Code:

   - Mistake: Relying too heavily on imperative handles instead of declarative React patterns.
   - Why: This can make components harder to understand and maintain.
   - Solution: Use imperative handles sparingly and prefer props and state for most use cases.

</Callout>

<Callout>

2. Exposing Too Much:

   - Mistake: Exposing too many methods or internal state through the imperative handle.
   - Why: This can break encapsulation and make the component harder to refactor.
   - Solution: Expose only what's necessary and keep the imperative API minimal.

</Callout>

<Callout>

3. Forgetting Dependencies:

   - Mistake: Not including all necessary dependencies in the dependency array of useImperativeHandle.
   - Why: This can lead to stale closures and unexpected behavior.
   - Solution: Ensure all variables used in the imperative handle are included in the dependency array.

</Callout>

<Callout>

4. Misusing with Functional Components:
   - Mistake: Trying to use useImperativeHandle without forwardRef.
   - Why: Functional components don't have instances, so refs need to be explicitly forwarded.
   - Solution: Always use useImperativeHandle in combination with forwardRef.

</Callout>

## Related Concepts

1. **forwardRef**: Used in conjunction with `useImperativeHandle` to forward refs to function components.
2. **useRef**: Often used inside components to reference DOM elements or store mutable values.
3. **React.memo**: Can be used with `useImperativeHandle` to optimize performance of components with imperative handles.
4. **Higher-Order Components**: An alternative pattern for adding capabilities to components.
5. **Render Props**: Another pattern for sharing code between React components.

## Unit vs Integration vs E2E Testing

When working with components that use `useImperativeHandle`, different testing strategies apply:

1. **Unit Testing**:

   - Focus on testing the individual methods exposed by `useImperativeHandle`.
   - Mock any internal dependencies.
   - Ensure the exposed API behaves as expected under different conditions.

2. **Integration Testing**:

   - Test how components using `useImperativeHandle` interact with parent components.
   - Verify that the exposed methods work correctly in the context of larger component trees.
   - Check that changes made through imperative handles correctly update the component's state and UI.

3. **End-to-End (E2E) Testing**:
   - Test the entire application flow, including components with imperative handles.
   - Ensure that imperative actions (like focusing an input) work correctly in the context of user interactions.
   - Verify that the application behaves correctly when imperative methods are called as part of complex user flows.

## Further Resources

<Callout emoji='📚'>

1. [useImperativeHandle](https://react.dev/reference/react/useImperativeHandle): Official React documentation on useImperativeHandle.

2. [forwardRef](https://react.dev/reference/react/forwardRef): React documentation on forwardRef, which is often used with useImperativeHandle.

3. [Hooks API Reference](https://react.dev/reference/react): Comprehensive guide to all React Hooks.

4. [Advanced React Patterns](https://reactpatterns.com/): A collection of React patterns, including some that use useImperativeHandle.

5. [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/): A guide to testing React components, including those with imperative handles.

6. [Testing React Applications](https://jestjs.io/docs/tutorial-react): Jest's guide to testing React applications, covering unit and integration testing.

7. [Cypress for End-to-End Testing](https://docs.cypress.io/guides/component-testing/react/overview): A guide to E2E testing React applications with Cypress.

</Callout>

```

## pages/react/L3-senior/useLayoutEffect.mdx
```
import { Callout } from "nextra/components";

# useLayoutEffect Hook in React

## Brief Overview

<Callout emoji='💡'>
  `useLayoutEffect` is a version of `useEffect` that fires synchronously after
  all DOM mutations. It can be used to read layout from the DOM and
  synchronously re-render. Updates scheduled inside `useLayoutEffect` will be
  flushed synchronously, before the browser has a chance to paint.
</Callout>

## Detailed Explanation

### What is useLayoutEffect?

`useLayoutEffect` is a Hook in React that is similar to `useEffect`, but it fires synchronously after all DOM mutations. This means that it runs immediately after React has performed all DOM mutations, but before the browser has a chance to paint those changes.

### Why does useLayoutEffect exist?

`useLayoutEffect` exists to handle situations where you need to perform DOM measurements and mutations that should be applied synchronously before the browser repaints. It addresses scenarios where `useEffect` might cause flickering or unwanted visual artifacts due to its asynchronous nature.

### For which purpose?

**The main purposes of `useLayoutEffect` are**:

1. **DOM Measurements**: When you need to measure the layout of DOM elements and use that information for rendering.

2. **Synchronous DOM Mutations**: When you need to make DOM changes that should be applied before the browser paints.

3. **Preventing Flickering**: In cases where `useEffect` might cause a brief flicker due to asynchronous updates.

4. **Animations**: For certain types of animations that require precise timing with DOM updates.

5. **Third-party DOM Library Integration**: When working with libraries that manipulate the DOM and require synchronous operations.

## Code Examples

### Basic useLayoutEffect Usage

Here's a simple example demonstrating the use of `useLayoutEffect`:

```jsx
import React, { useLayoutEffect, useState, useRef } from "react";

function Measure() {
  const [width, setWidth] = useState(0);
  const ref = useRef();

  useLayoutEffect(() => {
    setWidth(ref.current.clientWidth);
  }, []);

  return (
    <div>
      <div ref={ref}>Hello, world!</div>
      <p>The above div is {width}px wide</p>
    </div>
  );
}
```

In this example, `useLayoutEffect` is used to measure the width of a DOM element immediately after render, ensuring the measurement is accurate before the browser paints.

### Comparing useEffect and useLayoutEffect

This example shows the difference between `useEffect` and `useLayoutEffect`:

```jsx
import React, { useState, useEffect, useLayoutEffect } from "react";

function ComparisonExample() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("useEffect");
  });

  useLayoutEffect(() => {
    console.log("useLayoutEffect");
  });

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}
```

In this example, you'll see that 'useLayoutEffect' is always logged before 'useEffect', demonstrating its synchronous nature.

### Preventing Flicker

Here's an example where `useLayoutEffect` prevents a flickering issue:

```jsx
import React, { useState, useLayoutEffect } from "react";

function FlickerPrevention() {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const newWidth = Math.random() * 100 + 100;
    setWidth(newWidth);
  }, []);

  return (
    <div style={{ width: width, margin: "0 auto", background: "red" }}>
      <h2>Resize Me</h2>
    </div>
  );
}
```

In this case, using `useLayoutEffect` ensures that the width is set before the component is painted, preventing any visible flickering that might occur if `useEffect` were used instead.

## Best Practices

1. **Prefer useEffect**: In most cases, `useEffect` is the right choice. Only use `useLayoutEffect` when `useEffect` causes visual problems.

2. **Minimize Usage**: Because `useLayoutEffect` runs synchronously, overusing it can impact performance.

3. **Be Cautious with SSR**: `useLayoutEffect` doesn't run during server-side rendering, which can lead to hydration mismatches.

4. **Measure Performance**: Always measure the performance impact of using `useLayoutEffect` vs `useEffect`.

5. **Keep it Simple**: Try to keep the logic inside `useLayoutEffect` as simple and fast as possible to avoid blocking the paint.

## Common Pitfalls

<Callout>

1. Overusing useLayoutEffect:

   - Mistake: Using `useLayoutEffect` when `useEffect` would suffice.
   - Why: This can unnecessarily block visual updates and impact performance.
   - Solution: Only use `useLayoutEffect` when you specifically need its synchronous behavior.

</Callout>

<Callout>

2. Complex Computations:

   - Mistake: Performing heavy computations inside `useLayoutEffect`.
   - Why: This can delay painting and cause performance issues.
   - Solution: Keep the logic in `useLayoutEffect` minimal and move heavy computations elsewhere.

</Callout>

<Callout>

3. Infinite Loops:

   - Mistake: Updating state in `useLayoutEffect` without proper dependency array.
   - Why: This can cause infinite re-renders.
   - Solution: Ensure you have the correct dependencies in the dependency array.

</Callout>

<Callout>

4. Server-Side Rendering Issues:
   - Mistake: Relying on `useLayoutEffect` for critical rendering logic in SSR scenarios.
   - Why: `useLayoutEffect` doesn't run on the server, which can cause hydration mismatches.
   - Solution: Consider alternatives like `useEffect` with `useIsomorphicLayoutEffect` for SSR compatibility.

</Callout>

## Related Concepts

1. **useEffect**: The asynchronous counterpart to `useLayoutEffect`.
2. **React Rendering Lifecycle**: Understanding when different hooks and effects are called.
3. **DOM Mutations**: Knowledge of how and when React applies changes to the DOM.
4. **Browser Painting Process**: Understanding how browsers render content.
5. **Server-Side Rendering**: Considerations when using `useLayoutEffect` with SSR.

## Further Resources

<Callout emoji='📚'>

1. [useLayoutEffect](https://react.dev/reference/react/useLayoutEffect): Official React documentation on useLayoutEffect.

2. [useEffect vs useLayoutEffect](https://kentcdodds.com/blog/useeffect-vs-uselayouteffect): A detailed comparison by Kent C. Dodds.

3. [A Visual Guide to useEffect and useLayoutEffect](https://alexsidorenko.com/blog/useeffect-uselayouteffect/): Animated explanations of the differences between these hooks.

4. [React Hooks: The Complete Guide](https://react.dev/learn/synchronizing-with-effects): Comprehensive guide to React Hooks, including useLayoutEffect.

5. [When to useLayoutEffect Instead of useEffect](https://daveceddia.com/useeffect-vs-uselayouteffect/): Practical advice on choosing between these hooks.

6. [Understanding React's useLayoutEffect](https://blog.logrocket.com/useeffect-uselayouteffect-explained/): In-depth explanation of useLayoutEffect and its use cases.

7. [React Hooks Pitfalls](https://reactjs.org/docs/hooks-faq.html#what-are-the-differences-between-useeffect-and-uselayouteffect): Official React FAQ addressing common issues with hooks, including useLayoutEffect.

</Callout>

```

## pages/react/L3-senior/useReducer.mdx
```
import { Callout } from "nextra/components";

# useReducer Hook in React

## Brief Overview

<Callout emoji='💡'>
  `useReducer` is a React hook that provides an alternative to `useState` for
  managing complex state logic in functional components. It's particularly
  useful when the next state depends on the previous one, or when you have
  multiple sub-values in your state.
</Callout>

## Detailed Explanation

### What is useReducer?

`useReducer` is a hook that allows you to manage state in your React components using a reducer function. It's similar to how Redux manages state, but scoped to a single component.

The basic syntax of `useReducer` is:

```javascript
const [state, dispatch] = useReducer(reducer, initialState);
```

Where:

- `state` is the current state
- `dispatch` is a function to trigger state updates
- `reducer` is a function that specifies how the state gets updated
- `initialState` is the initial value of the state

### Why does useReducer exist?

`useReducer` exists to address several needs in React development:

1. **Managing Complex State Logic**: When state logic becomes too complex for `useState`, `useReducer` provides a more structured way to manage it.

2. **Predictable State Updates**: By centralizing state update logic in a reducer function, state changes become more predictable and easier to understand.

3. **Optimization**: For components with complex state logic, `useReducer` can lead to better performance than `useState`.

4. **Testing**: Reducer functions are pure functions, making them easy to test in isolation.

### For which purpose?

The main purposes of `useReducer` are:

1. **Managing Complex State**: When your state contains multiple sub-values or when the next state depends on the previous one.

2. **Centralizing Update Logic**: To keep all your state update logic in one place, making it easier to understand and maintain.

3. **Sharing Logic**: Reducer functions can be shared between components, promoting code reuse.

4. **Implementing Undo/Redo**: The predictable nature of reducers makes it easier to implement features like undo/redo.

5. **Optimizing Performance**: For components that trigger many state updates, `useReducer` can be more efficient than `useState`.

## Code Examples

### Basic useReducer Example

Here's a simple counter implemented with `useReducer`:

```jsx
import React, { useReducer } from "react";

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
    </>
  );
}
```

### useReducer with Complex State

Here's an example of managing a more complex state with `useReducer`:

```jsx
import React, { useReducer } from "react";

const initialState = {
  name: "",
  email: "",
  isSubmitting: false,
  error: null
};

function reducer(state, action) {
  switch (action.type) {
    case "field":
      return { ...state, [action.field]: action.value };
    case "submit":
      return { ...state, isSubmitting: true, error: null };
    case "success":
      return { ...state, isSubmitting: false };
    case "error":
      return { ...state, isSubmitting: false, error: action.error };
    default:
      return state;
  }
}

function Form() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleSubmit = async e => {
    e.preventDefault();
    dispatch({ type: "submit" });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      dispatch({ type: "success" });
    } catch (error) {
      dispatch({ type: "error", error: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type='text'
        value={state.name}
        onChange={e =>
          dispatch({
            type: "field",
            field: "name",
            value: e.target.value
          })
        }
      />
      <input
        type='email'
        value={state.email}
        onChange={e =>
          dispatch({
            type: "field",
            field: "email",
            value: e.target.value
          })
        }
      />
      <button
        type='submit'
        disabled={state.isSubmitting}
      >
        Submit
      </button>
      {state.error && <p>{state.error}</p>}
    </form>
  );
}
```

## Best Practices

1. **Keep Reducers Pure**: Reducers should be pure functions without side effects.

2. **Use Action Constants**: Define action types as constants to avoid typos and make maintenance easier.

3. **Combine useReducer with useContext**: For managing global state across components.

4. **Split Reducers**: For complex state, consider splitting your reducer into smaller, more manageable functions.

5. **Use Immer**: Consider using Immer with `useReducer` for easier state updates, especially with nested state.

6. **Initialize State Lazily**: Use the lazy initialization form of `useReducer` for expensive initial state computations.

## Common Pitfalls

<Callout>

1. Overusing useReducer:

   - Mistake: Using `useReducer` for simple state that could be managed with `useState`.
   - Why: This can overcomplicate your code unnecessarily.
   - Solution: Use `useReducer` only when state logic becomes sufficiently complex.

</Callout>

<Callout>

2. Mutating State in Reducer:

   - Mistake: Directly modifying state in the reducer instead of returning a new state object.
   - Why: This can lead to unexpected behavior and break React's rendering optimizations.
   - Solution: Always return a new state object, using the spread operator or Object.assign().

</Callout>

<Callout>

3. Forgetting to Handle All Action Types:

   - Mistake: Not including a default case in the reducer switch statement.
   - Why: This can lead to silent failures when an unknown action type is dispatched.
   - Solution: Always include a default case that either returns the current state or throws an error.

</Callout>

<Callout>

4. Putting Too Much Logic in Reducers:
   - Mistake: Including complex business logic or side effects in reducers.
   - Why: This makes reducers harder to test and understand.
   - Solution: Keep reducers focused on state updates. Use other hooks or functions for complex logic.

</Callout>

## Related Concepts

1. **useState**: The simpler state management hook that `useReducer` builds upon.
2. **Redux**: A popular state management library that uses the reducer pattern.
3. **Context API**: Often used in conjunction with `useReducer` for global state management.
4. **Finite State Machines**: The reducer pattern is similar to the concept of state machines.
5. **Immutable Update Patterns**: Important for correctly updating state in reducers.

## Further Resources

<Callout emoji='📚'>

1. [useReducer](https://react.dev/reference/react/useReducer): Official React documentation on the useReducer hook.

2. [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer): Guide on when and how to use reducers in React.

3. [useReducer vs useState](https://react.dev/learn/extracting-state-logic-into-a-reducer#comparing-usestate-and-usereducer): Comparison between useReducer and useState.

4. [A Complete Guide to useReducer](https://daveceddia.com/usereducer-hook-examples/): Comprehensive guide to understanding and using useReducer.

5. [How to implement useState with useReducer](https://kentcdodds.com/blog/how-to-implement-usestate-with-usereducer): An article that helps understand useReducer by implementing useState with it.

</Callout>

```

## pages/react/L3-senior/useRef-forwardRef.mdx
```
import { Callout } from "nextra/components";

# useRef and forwardRef in React

## Brief Overview

<Callout emoji='💡'>
  `useRef` is a hook that provides a way to store mutable values and access DOM
  elements directly. `forwardRef` is a function that allows components to pass
  refs down to their children, enabling more flexible component composition.
</Callout>

## Detailed Explanation

### What is useRef?

`useRef` is a hook in React that returns a mutable ref object. This object has a `current` property that can hold any value and persists for the full lifetime of the component.

### Why does useRef exist?

**`useRef` exists to solve two main problems**:

1. Accessing DOM elements directly in functional components
2. Storing mutable values that don't require re-renders when they change

### Store Mutable Values

Unlike state, changing the `current` value of a ref doesn't cause a re-render. This makes refs useful for storing values that you want to persist across renders without triggering updates.

```jsx
function Timer() {
  const intervalRef = useRef();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      // some operation
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // ...
}
```

### What is a ref? How do we create one? For which usage?

A ref in React is an object with a `current` property that can point to any value. You create a ref using the `useRef` hook:

```jsx
const myRef = useRef(initialValue);
```

Refs are commonly used for:

1. Storing DOM element references
2. Keeping previous values
3. Storing timers or subscriptions

### Accessing DOM nodes

To access a DOM node, you can attach a ref to a React element:

```jsx
function TextInputWithFocusButton() {
  const inputEl = useRef(null);

  const onButtonClick = () => {
    // `current` points to the mounted text input element
    inputEl.current.focus();
  };

  return (
    <>
      <input
        ref={inputEl}
        type='text'
      />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}
```

### What is forwardRef?

`forwardRef` is a function in React that allows components to take a `ref` and forward it to a child component.

### Why does forwardRef exist?

`forwardRef` exists to solve the problem of passing refs through multiple levels of components, especially when working with higher-order components or when you want to expose a child component's DOM node to a parent component.

### For which purpose?

The main purposes of `forwardRef` are:

1. Allowing parent components to access child component's DOM nodes
2. Creating reusable component libraries that can manage refs
3. Implementing advanced patterns like compound components

### Forwarding refs

Ref forwarding is a technique for automatically passing a ref through a component to one of its children. Here's an example:

```jsx
const FancyButton = React.forwardRef((props, ref) => (
  <button
    ref={ref}
    className='FancyButton'
  >
    {props.children}
  </button>
));

// You can now get a ref directly to the DOM button:
const ref = useRef();
<FancyButton ref={ref}>Click me!</FancyButton>;
```

You should use ref forwarding when:

1. You're building a reusable component library
2. You need to access a child component's DOM node from a parent component
3. You're working with higher-order components and need to pass refs through them

## Best Practices

1. **Use refs sparingly**: While refs are powerful, they should be used judiciously. Often, declarative solutions are preferable.
2. **Don't overuse forwardRef**: Only use `forwardRef` when you genuinely need to forward a ref to a child component.
3. **Be cautious with DOM manipulation**: When using refs to access DOM nodes, be careful not to conflict with React's rendering cycle.
4. **Use functional updates with useRef**: If you need to update a ref based on its previous value, use a function to ensure you're working with the latest value.
5. **Consider useImperativeHandle**: When using `forwardRef`, you can use `useImperativeHandle` to customize the instance value that is exposed to parent components.

## Common Pitfalls

<Callout>

1. Overusing Refs for State Management:

   - Mistake: Using refs to manage state that should trigger re-renders.
   - Why: This can lead to unexpected behavior and components not updating properly.
   - Solution: Use `useState` for values that should trigger re-renders when they change.

</Callout>

<Callout>

2. Accessing Ref Value Too Early:

   - Mistake: Trying to access the `current` value of a ref before it's been set.
   - Why: The ref might not be initialized yet, especially on the first render.
   - Solution: Always check if `ref.current` exists before using it, or use an effect to perform operations after the ref has been set.

</Callout>

<Callout>

3. Mutating Ref Values Directly in Render:

   - Mistake: Changing `ref.current` during rendering.
   - Why: This can lead to inconsistent behavior and conflicts with React's rendering cycle.
   - Solution: Only mutate refs in event handlers or effects.

</Callout>

<Callout>

4. Forwarding Refs Unnecessarily:
   - Mistake: Using `forwardRef` for components that don't need to forward refs.
   - Why: This adds unnecessary complexity to your components.
   - Solution: Only use `forwardRef` when you actually need to forward a ref to a child component.

</Callout>

## Related Concepts

1. **useEffect**: Often used in conjunction with `useRef` for DOM manipulations after render.
2. **useImperativeHandle**: Used with `forwardRef` to customize the exposed instance value.
3. **Higher-Order Components**: `forwardRef` is often useful when working with HOCs.
4. **Uncontrolled Components**: Refs are commonly used in uncontrolled components to access form values.
5. **React.memo**: Can be used with `forwardRef` to optimize performance of forwarded ref components.

## Further Resources

<Callout emoji='📚'>

1. [Referencing Values with Refs](https://react.dev/learn/referencing-values-with-refs): Official React documentation on using refs.

2. [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs): Guide on how to use refs to work with DOM elements.

3. [forwardRef](https://react.dev/reference/react/forwardRef): Official documentation on the forwardRef API.

4. [useRef](https://react.dev/reference/react/useRef): Detailed explanation of the useRef hook.

5. [useImperativeHandle](https://react.dev/reference/react/useImperativeHandle): Documentation on useImperativeHandle, which is often used with forwardRef.

6. [Refs and the DOM](https://reactjs.org/docs/refs-and-the-dom.html): Additional information about refs and their interaction with the DOM.

7. [How to Use React Refs](https://www.robinwieruch.de/react-ref/): A comprehensive guide on using refs in various scenarios.

</Callout>

```

## pages/react/L4-lead/_meta.js
```
export default {
  "react-router": "React Router",
  "performance-optimization": "Performance Optimization",
  "suspense-and-lazy": "Suspense and Lazy",
  "state-management-libraries": "State Management Libraries",
  "server-side-rendering": "Server Side Rendering",
  "concurrent-mode": "Concurrent Mode"
};

```

## pages/react/L4-lead/concurrent-mode.mdx
```
import { Callout } from "nextra/components";

# Concurrent Mode in React

## Brief Overview

<Callout emoji='💡'>
  Concurrent Mode is a set of new features in React that help apps stay
  responsive and gracefully adjust to the user's device capabilities and network
  speed. It allows React to interrupt a long-running render to handle a
  high-priority event, making apps more responsive.
</Callout>

## Detailed Explanation

### Concurrent Rendering

Concurrent rendering is the core feature of Concurrent Mode. It allows React to work on multiple versions of the UI at the same time, which enables several key capabilities:

1. **Interruptible Rendering**: React can pause rendering work to handle more urgent updates, then resume where it left off.

2. **Prioritization**: Different updates can be assigned different priorities, ensuring that high-priority updates (like user input) are processed quickly.

3. **Suspense**: Allows components to "wait" for something before rendering, with the ability to show fallback content during the wait.

4. **Progressive Loading**: The ability to show a more complete version of the content as more data streams in, rather than an all-or-nothing approach.

Key Concepts:

- **Time Slicing**: The ability to split rendering work into chunks and spread it out over multiple frames.
- **Suspense**: A mechanism for declaratively specifying loading states in the UI.
- **Concurrent Renders**: The ability to render multiple versions of a component tree simultaneously.

<Callout emoji='⚠️'>
  Concurrent Mode is still an experimental feature. Always check the latest
  React documentation for the current status and best practices.
</Callout>

## Code Examples

### Basic Usage of Concurrent Mode

```jsx
import React, { Suspense } from "react";
import { createRoot } from "react-dom";

const root = createRoot(document.getElementById("root"));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SlowComponent />
    </Suspense>
  );
}

root.render(<App />);
```

### Prioritizing Updates

```jsx
import React, { useState, useTransition } from "react";

function App() {
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => {
      setCount(c => c + 1);
    });
  }

  return (
    <div>
      <button onClick={handleClick}>Increment</button>
      {isPending ? " Loading..." : null}
      <div>Count: {count}</div>
    </div>
  );
}
```

### Suspense for Data Fetching

```jsx
import React, { Suspense } from "react";
import { fetchUser } from "./api";

const resource = fetchUser();

function ProfileDetails() {
  const user = resource.read();
  return <h1>{user.name}</h1>;
}

function ProfilePage() {
  return (
    <Suspense fallback={<h1>Loading profile...</h1>}>
      <ProfileDetails />
    </Suspense>
  );
}
```

## Best Practices

1. **Use Suspense Boundaries Wisely**: Place Suspense boundaries strategically to create a good loading experience.

2. **Leverage useTransition**: Use `useTransition` for updates that may take a while but don't need to block the UI.

3. **Implement Progressive Loading**: Design your app to show increasingly complete content as data loads.

4. **Prioritize Critical Updates**: Use concurrent features to ensure that critical user interactions remain responsive.

5. **Test Thoroughly**: Concurrent Mode can introduce new edge cases. Test your app thoroughly, especially under poor network conditions.

6. **Consider Server-Side Rendering**: Concurrent Mode works well with server-side rendering for even better performance.

7. **Profile and Optimize**: Use React's profiling tools to identify and optimize rendering bottlenecks.

## Common Pitfalls

<Callout>

1. Overusing Suspense:

   - Mistake: Wrapping every component in Suspense.
   - Why: This can lead to a poor user experience with too many loading indicators.
   - Solution: Use Suspense judiciously, typically at layout boundaries.

</Callout>

<Callout>

2. Ignoring Error Boundaries:

   - Mistake: Not using Error Boundaries with Suspense.
   - Why: This can lead to uncaught errors and broken UI states.
   - Solution: Always pair Suspense with Error Boundaries for robust error handling.

</Callout>

<Callout>

3. Misunderstanding Transitions:

   - Mistake: Using transitions for every state update.
   - Why: Some updates should be immediate for a responsive feel.
   - Solution: Use transitions only for updates that may take a while but shouldn't block the UI.

</Callout>

<Callout>

4. Neglecting Traditional Optimization Techniques:
   - Mistake: Relying solely on Concurrent Mode for performance.
   - Why: Concurrent Mode is not a silver bullet for all performance issues.
   - Solution: Continue to use traditional optimization techniques alongside Concurrent Mode features.

</Callout>

## Related Concepts

1. **React Fiber**: The underlying architecture that enables Concurrent Mode.
2. **Suspense**: A key feature of Concurrent Mode for handling asynchronous operations.
3. **Time Slicing**: The technique React uses to split work into small chunks.
4. **Render-as-You-Fetch**: A pattern enabled by Concurrent Mode for improved data fetching.
5. **Algebraic Effects**: A computer science concept that inspired some aspects of Concurrent Mode.

## Further Resources

<Callout emoji='📚'>

1. [Concurrent Rendering in React](https://react.dev/blog/2022/03/29/react-v18#what-is-concurrent-react): Official React documentation on Concurrent Rendering.

2. [useTransition Hook](https://react.dev/reference/react/useTransition): Detailed explanation of the useTransition hook.

3. [Suspense for Data Fetching](https://react.dev/reference/react/Suspense): React documentation on using Suspense for data fetching.

4. [Concurrent Mode Adoption](https://react.dev/blog/2022/03/29/react-v18#gradually-adopting-concurrent-features): Guide on how to gradually adopt Concurrent Mode features.

5. [Inside React Fiber](https://github.com/acdlite/react-fiber-architecture): A deep dive into React Fiber, the architecture enabling Concurrent Mode.

</Callout>

```

## pages/react/L4-lead/performance-optimization.mdx
```
import { Callout } from "nextra/components";

# Performance Optimization in React

## Brief Overview

<Callout emoji='💡'>
  Performance optimization in React involves techniques and tools to improve the
  efficiency and responsiveness of React applications. This includes using hooks
  like useMemo and useCallback, higher-order components like memo, and
  diagnostic tools like the Profiler API.
</Callout>

## Detailed Explanation

### useMemo

`useMemo` is a hook that memoizes the result of a computation. It's useful for expensive calculations that don't need to be re-run on every render.

```jsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

Use `useMemo` when:

- You have a computationally expensive operation
- The operation depends on props or state that don't change often
- You want to avoid unnecessary re-computations

### useCallback

`useCallback` is similar to `useMemo`, but it memoizes callback functions instead of values.

```jsx
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

Use `useCallback` when:

- You're passing callbacks to optimized child components that rely on reference equality to prevent unnecessary renders
- The callback is used in an effect's dependency array

### memo

`memo` is a higher-order component that can be used to wrap components that don't need to re-render when their parent re-renders, as long as their props haven't changed.

```jsx
const MemoizedComponent = memo(MyComponent);
```

Use `memo` when:

- Your component renders often with the same props
- Your component is expensive to render
- You want to prevent unnecessary re-renders of child components

### Profiler API

The Profiler API is a tool for measuring rendering performance in React applications.

What is it?

- A built-in profiling tool in React for measuring rendering performance

Why does it exist?

- To help developers identify performance bottlenecks in React applications
- To provide detailed timing information about component rendering

For which purpose?

- Measuring the frequency and duration of component renders
- Identifying which parts of an application are slow and need optimization
- Comparing performance before and after optimization attempts

## Code Examples

### useMemo Example

```jsx
import React, { useMemo, useState } from "react";

function ExpensiveComponent({ data, filter }) {
  const filteredData = useMemo(() => {
    console.log("Filtering data...");
    return data.filter(item => item.includes(filter));
  }, [data, filter]);

  return (
    <ul>
      {filteredData.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function App() {
  const [data] = useState(["apple", "banana", "cherry", "date"]);
  const [filter, setFilter] = useState("");

  return (
    <div>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder='Filter fruits'
      />
      <ExpensiveComponent
        data={data}
        filter={filter}
      />
    </div>
  );
}
```

### useCallback Example

```jsx
import React, { useState, useCallback } from "react";

const ExpensiveComponent = React.memo(({ onClick }) => {
  console.log("ExpensiveComponent rendered");
  return <button onClick={onClick}>Click me</button>;
});

function App() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log("Button clicked");
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <ExpensiveComponent onClick={handleClick} />
    </div>
  );
}
```

### memo Example

```jsx
import React, { useState, memo } from "react";

const ExpensiveComponent = memo(({ data }) => {
  console.log("ExpensiveComponent rendered");
  return <div>{data.join(", ")}</div>;
});

function App() {
  const [count, setCount] = useState(0);
  const [data] = useState(["apple", "banana", "cherry"]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <ExpensiveComponent data={data} />
    </div>
  );
}
```

### Profiler API Example

```jsx
import React, { Profiler } from "react";

function onRenderCallback(
  id, // the "id" prop of the Profiler tree that has just committed
  phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
  actualDuration, // time spent rendering the committed update
  baseDuration, // estimated time to render the entire subtree without memoization
  startTime, // when React began rendering this update
  commitTime, // when React committed this update
  interactions // the Set of interactions belonging to this update
) {
  console.log(`${id} phase: ${phase}`);
  console.log(`Actual duration: ${actualDuration}`);
}

function App() {
  return (
    <Profiler
      id='App'
      onRender={onRenderCallback}
    >
      <MyComponent />
    </Profiler>
  );
}
```

## Best Practices

1. **Measure First**: Always profile your application before optimizing. Don't optimize prematurely.

2. **Use Production Builds**: Always test performance using production builds of React.

3. **Virtualize Long Lists**: Use libraries like `react-window` for rendering large lists efficiently.

4. **Avoid Inline Function Definitions**: Define functions outside the render method to prevent unnecessary re-creation.

5. **Lazy Loading**: Use `React.lazy()` and `Suspense` for code-splitting and lazy loading components.

6. **Debounce and Throttle**: Use these techniques for handling frequent updates (e.g., search inputs).

7. **Optimize Context**: Be mindful of when context values change to prevent unnecessary re-renders.

## Common Pitfalls

<Callout>

1. Over-optimization:

   - Mistake: Applying performance optimizations everywhere without measuring.
   - Why: This can lead to more complex, harder to maintain code without significant performance gains.
   - Solution: Profile first, optimize where it matters most.

</Callout>

<Callout>

2. Incorrect Dependency Arrays:

   - Mistake: Not including all necessary dependencies in useMemo and useCallback.
   - Why: This can lead to stale closures and incorrect memoization.
   - Solution: Ensure all variables used in the callback are included in the dependency array.

</Callout>

<Callout>

3. Misusing memo:

   - Mistake: Wrapping every component with memo.
   - Why: This can actually decrease performance due to the overhead of prop comparison.
   - Solution: Use memo only for components that render often with the same props.

</Callout>

<Callout>

4. Ignoring the Virtual DOM:
   - Mistake: Manually manipulating the DOM instead of letting React handle it.
   - Why: This bypasses React's optimizations and can lead to inconsistencies.
   - Solution: Always use React's declarative approach for updating the UI.

</Callout>

## Related Concepts

1. **React Reconciliation**: Understanding how React updates the DOM efficiently.
2. **Virtual DOM**: The concept underlying React's performance optimizations.
3. **Code Splitting**: Technique for improving initial load time by splitting code into smaller chunks.
4. **Server-Side Rendering (SSR)**: Can improve perceived performance for initial page loads.
5. **Web Workers**: Can be used to offload heavy computations from the main thread.

## Further Resources

<Callout emoji='📚'>

1. [Optimizing Performance](https://react.dev/learn/render-and-commit): Official React documentation on performance optimization.

2. [useMemo](https://react.dev/reference/react/useMemo): React documentation on the useMemo hook.

3. [useCallback](https://react.dev/reference/react/useCallback): React documentation on the useCallback hook.

4. [memo](https://react.dev/reference/react/memo): React documentation on the memo higher-order component.

</Callout>

```

## pages/react/L4-lead/react-router.mdx
```
import { Callout } from "nextra/components";

# React Router

## Brief Overview

<Callout emoji='💡'>
  React Router is a standard routing library for React applications. It enables
  navigation among views in a React application, allows changing the browser
  URL, and keeps the UI in sync with the URL.
</Callout>

## Detailed Explanation

### Setting up Routes

Setting up routes in React Router involves defining which component should be rendered for each URL path. This is typically done using the `<Route>` component.

Basic route setup:

```jsx
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path='/'
          element={<Home />}
        />
        <Route
          path='/about'
          element={<About />}
        />
        <Route
          path='/contact'
          element={<Contact />}
        />
      </Routes>
    </Router>
  );
}
```

### Navigation

React Router provides several ways to handle navigation:

1. **Link Component**: For declarative navigation.
2. **useNavigate Hook**: For programmatic navigation.
3. **NavLink Component**: Similar to Link, but with active state styling.

Example of navigation:

```jsx
import { Link, useNavigate } from "react-router-dom";

function Navigation() {
  const navigate = useNavigate();

  return (
    <nav>
      <Link to='/'>Home</Link>
      <Link to='/about'>About</Link>
      <button onClick={() => navigate("/contact")}>Contact</button>
    </nav>
  );
}
```

### Route Parameters

Route parameters allow you to pass data through the URL. They are defined in the route path and can be accessed using the `useParams` hook.

Example of route parameters:

```jsx
import { useParams } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path='/user/:id'
          element={<UserProfile />}
        />
      </Routes>
    </Router>
  );
}

function UserProfile() {
  const { id } = useParams();
  return <div>User Profile for user {id}</div>;
}
```

## Code Examples

### Basic Routing Setup

```jsx
import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

function Home() {
  return <h2>Home</h2>;
}

function About() {
  return <h2>About</h2>;
}

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to='/'>Home</Link>
            </li>
            <li>
              <Link to='/about'>About</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route
            path='/about'
            element={<About />}
          />
          <Route
            path='/'
            element={<Home />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

### Nested Routes

```jsx
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Outlet
} from "react-router-dom";

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to='/'>Home</Link>
            </li>
            <li>
              <Link to='/users'>Users</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route
            path='/'
            element={<Home />}
          />
          <Route
            path='users'
            element={<Users />}
          >
            <Route
              path=':id'
              element={<UserProfile />}
            />
            <Route
              path='new'
              element={<NewUser />}
            />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

function Users() {
  return (
    <div>
      <h2>Users</h2>
      <nav>
        <Link to='new'>New User</Link>
      </nav>
      <Outlet />
    </div>
  );
}

function UserProfile() {
  const { id } = useParams();
  return <h3>User Profile: {id}</h3>;
}

function NewUser() {
  return <h3>New User Form</h3>;
}

function Home() {
  return <h2>Home</h2>;
}

export default App;
```

### Programmatic Navigation

```jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function LoginForm() {
  const navigate = useNavigate();

  const handleSubmit = event => {
    event.preventDefault();
    // Perform login logic here
    // If login is successful:
    navigate("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type='submit'>Login</button>
    </form>
  );
}
```

## Best Practices

1. **Use Semantic URLs**: Create meaningful and descriptive URLs for better user experience and SEO.

2. **Implement Code-Splitting**: Use React's lazy loading with Suspense for route-based code splitting.

3. **Handle 404 Routes**: Always include a catch-all route to handle 404 (Not Found) errors.

4. **Use Exact Path Matching**: For more precise routing, use the `exact` prop on `<Route>` components.

5. **Protect Routes**: Implement authentication checks for protected routes.

6. **Use Route Constants**: Define route paths as constants to avoid typos and ease maintenance.

7. **Optimize for Performance**: Use `<Link>` instead of `<a>` tags for internal navigation to leverage SPA benefits.

## Common Pitfalls

<Callout>

1. Forgetting to Use `<Router>`:

   - Mistake: Using React Router components without wrapping the app in a `<Router>` component.
   - Why: This will cause runtime errors as the routing context is not available.
   - Solution: Always wrap your app or the part using routing in a `<Router>` component.

</Callout>

<Callout>

2. Incorrect Order of Routes:

   - Mistake: Placing more specific routes after less specific ones.
   - Why: React Router matches routes in order, so more specific routes can be overshadowed.
   - Solution: Place more specific routes before less specific ones.

</Callout>

<Callout>

3. Not Handling 404 Cases:

   - Mistake: Failing to provide a fallback route for unmatched URLs.
   - Why: This can lead to blank pages or unexpected behavior for invalid URLs.
   - Solution: Always include a catch-all route at the end of your `<Routes>` component.

</Callout>

<Callout>

4. Overusing URL Parameters:
   - Mistake: Using URL parameters for data that should be in the state.
   - Why: This can lead to overly complex URLs and unnecessary re-renders.
   - Solution: Use URL parameters for essential routing information, and keep other data in component state or global state management.

</Callout>

## Related Concepts

1. **Single Page Applications (SPAs)**: React Router is fundamental in creating SPAs.
2. **Code Splitting**: Often used with React Router for performance optimization.
3. **History API**: React Router uses the browser's History API under the hood.
4. **State Management**: Often used alongside routing for managing application state.
5. **Server-Side Rendering (SSR)**: React Router can be used in SSR scenarios with some additional configuration.

## Further Resources

<Callout emoji='📚'>

1. [React Router Documentation](https://reactrouter.com/): Official documentation for React Router.

2. [React Router Tutorial](https://reactrouter.com/docs/en/v6/getting-started/tutorial): A step-by-step tutorial from the official docs.

3. [React Router v6 Overview](https://blog.logrocket.com/react-router-v6/): A comprehensive guide to the features of React Router v6.

4. [Advanced React Router Techniques](https://ui.dev/react-router-tutorial): In-depth tutorial covering advanced routing concepts.

5. [Server Rendering with React Router](https://reactrouter.com/docs/en/v6/guides/ssr): Guide on implementing server-side rendering with React Router.

6. [React Router Testing](https://testing-library.com/docs/example-react-router/): Guide on testing React components that use React Router.

</Callout>

```

## pages/react/L4-lead/server-side-rendering.mdx
```
import { Callout } from "nextra/components";

# Server-Side Rendering (SSR) in React

## Brief Overview

<Callout emoji='💡'>
  Server-Side Rendering (SSR) is a technique where the initial content of a
  React application is generated on the server rather than in the browser. This
  can lead to faster initial page loads, improved SEO, and better performance on
  low-powered devices.
</Callout>

## Detailed Explanation

### Concepts and Benefits

#### What is SSR?

Server-Side Rendering is the process of taking a React component tree and rendering it to static HTML on the server. This HTML is then sent to the client, where React takes over (a process called hydration) to make the page interactive.

#### Key Concepts

1. **Initial Render**: The server generates the initial HTML content.
2. **Hydration**: The process where React attaches event listeners to the server-rendered HTML.
3. **State Management**: Handling the transfer of initial state from server to client.
4. **Routing**: Managing routes between server and client.

#### Benefits of SSR

1. **Improved Initial Load Time**: Users see content faster, especially on slow connections.
2. **Better SEO**: Search engines can crawl the fully rendered content.
3. **Enhanced Performance on Low-Powered Devices**: Less JavaScript needs to be parsed and executed on the client.
4. **Improved Accessibility**: Content is available even if JavaScript fails or is disabled.
5. **Consistent Performance**: More predictable performance across different devices and network conditions.

### Implementation with Next.js

Next.js is a popular React framework that provides built-in support for SSR. It simplifies many of the complexities involved in implementing SSR from scratch.

**Key Features of Next.js for SSR**:

- Automatic code splitting
- File-system based routing
- API routes
- Built-in CSS support
- Easy deployment

## Code Examples

### Basic SSR with Next.js

```jsx
// pages/index.js
import React from "react";

function Home({ serverData }) {
  return (
    <div>
      <h1>Welcome to my SSR App</h1>
      <p>Server data: {serverData}</p>
    </div>
  );
}

export async function getServerSideProps() {
  // Fetch data from an API
  const res = await fetch("https://api.example.com/data");
  const data = await res.json();

  // Pass data to the page via props
  return { props: { serverData: data.message } };
}

export default Home;
```

### SSR with Dynamic Routes

```jsx
// pages/posts/[id].js
import React from "react";

function Post({ post }) {
  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  // Fetch post data based on id
  const res = await fetch(`https://api.example.com/posts/${params.id}`);
  const post = await res.json();

  return { props: { post } };
}

export default Post;
```

### Combining SSR with Client-Side Rendering

```jsx
// pages/dashboard.js
import React, { useState, useEffect } from "react";

function Dashboard({ initialData }) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    // Client-side data fetching for real-time updates
    const fetchData = async () => {
      const res = await fetch("https://api.example.com/live-data");
      const newData = await res.json();
      setData(newData);
    };

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Data: {data}</p>
    </div>
  );
}

export async function getServerSideProps() {
  const res = await fetch("https://api.example.com/initial-data");
  const initialData = await res.json();

  return { props: { initialData } };
}

export default Dashboard;
```

## Best Practices

1. **Selective SSR**: Not all pages need SSR. Use it judiciously where it provides clear benefits.

2. **Efficient Data Fetching**: Optimize server-side data fetching to minimize Time to First Byte (TTFB).

3. **Code Splitting**: Utilize dynamic imports to load only necessary JavaScript.

4. **Caching**: Implement effective caching strategies to reduce server load and improve response times.

5. **Error Handling**: Implement robust error handling for both server and client-side errors.

6. **Performance Monitoring**: Regularly monitor SSR performance and optimize as necessary.

7. **SEO Optimization**: Ensure proper meta tags and structured data are included in server-rendered content.

## Common Pitfalls

<Callout>

1. Over-fetching Data:

   - Mistake: Fetching too much data on the server for pages that don't need it.
   - Why: This can slow down the initial page load.
   - Solution: Only fetch data that's necessary for the initial render.

</Callout>

<Callout>

2. Ignoring Client-Side State:

   - Mistake: Not properly handling the transfer of state from server to client.
   - Why: This can lead to inconsistencies between server and client renders.
   - Solution: Ensure proper hydration and state transfer techniques are used.

</Callout>

<Callout>

3. Mishandling Browser-Only APIs:

   - Mistake: Using browser-only APIs (like `window`) in code that runs on the server.
   - Why: This will cause errors during server-side rendering.
   - Solution: Use conditional checks or move browser-specific code to lifecycle methods that only run on the client.

</Callout>

<Callout>

4. Neglecting Performance Monitoring:
   - Mistake: Not monitoring the performance impact of SSR.
   - Why: SSR can sometimes negatively impact performance if not implemented correctly.
   - Solution: Regularly profile and optimize your SSR implementation.

</Callout>

## Related Concepts

1. **Static Site Generation (SSG)**: An alternative to SSR where pages are generated at build time.
2. **Incremental Static Regeneration (ISR)**: A hybrid approach combining benefits of SSG and SSR.
3. **Hydration**: The process of attaching event listeners to server-rendered HTML.
4. **Code Splitting**: Technique for improving performance by splitting the bundle into smaller chunks.
5. **Edge Computing**: Running server-side code closer to the user for improved performance.

## Further Resources

<Callout emoji='📚'>

1. [Next.js Documentation](https://nextjs.org/docs): Official documentation for Next.js, including SSR guides.

2. [React Server Components](https://react.dev/blog/2020/12/21/data-fetching-with-react-server-components): Information about the future of server-side React with Server Components.

3. [Server-Side Rendering with React and Node.js](https://www.digitalocean.com/community/tutorials/react-server-side-rendering): A comprehensive guide to implementing SSR from scratch.

4. [The Benefits of Server Side Rendering Over Client Side Rendering](https://medium.com/walmartglobaltech/the-benefits-of-server-side-rendering-over-client-side-rendering-5d07ff2cefe8): An article discussing the advantages of SSR.

5. [Server-Side Rendering with React and Redux](https://redux.js.org/recipes/server-rendering): Official Redux documentation on implementing SSR.

</Callout>

```

## pages/react/L4-lead/state-management-libraries.mdx
```
import { Callout } from "nextra/components";

# State Management Libraries in React

## Brief Overview

<Callout emoji='💡'>
  State management libraries provide solutions for managing application state
  outside of React components. They offer centralized stores, predictable state
  updates, and often come with developer tools for easier debugging and state
  tracking.
</Callout>

## Detailed Explanation

### Redux

Redux is a predictable state container for JavaScript apps, often used with React. It helps you write applications that behave consistently, run in different environments, and are easy to test.

**Key concepts**:

- Single source of truth (the store)
- State is read-only
- Changes are made with pure functions (reducers)

### Redux Toolkit

Redux Toolkit is the official, opinionated, batteries-included toolset for efficient Redux development. It simplifies many common Redux use cases, including store setup, creating reducers, immutable update logic, and even creating entire "slices" of state at once.

**Key features**:

- Simplified store setup
- Includes useful utilities like `createSlice`
- Built-in support for immer for easy immutable updates

### Zustand

Zustand is a small, fast, and scalable bearbones state management solution. It has a simple API based on hooks, isn't boilerplate-heavy, and doesn't suffer from the performance overhead found in most Redux-based solutions.

**Key features**:

- Minimal API
- No providers needed
- Can be used with vanilla JS as well as React

## Code Examples

### Redux Example

```jsx
import { createStore } from "redux";
import { Provider, useSelector, useDispatch } from "react-redux";

// Reducer
const counterReducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 };
    case "DECREMENT":
      return { count: state.count - 1 };
    default:
      return state;
  }
};

// Store
const store = createStore(counterReducer);

// Component
function Counter() {
  const count = useSelector(state => state.count);
  const dispatch = useDispatch();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch({ type: "INCREMENT" })}>+</button>
      <button onClick={() => dispatch({ type: "DECREMENT" })}>-</button>
    </div>
  );
}

// App
function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}
```

### Redux Toolkit Example

```jsx
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { Provider, useSelector, useDispatch } from "react-redux";

// Slice
const counterSlice = createSlice({
  name: "counter",
  initialState: { count: 0 },
  reducers: {
    increment: state => {
      state.count += 1;
    },
    decrement: state => {
      state.count -= 1;
    }
  }
});

// Store
const store = configureStore({
  reducer: counterSlice.reducer
});

// Component
function Counter() {
  const count = useSelector(state => state.count);
  const dispatch = useDispatch();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch(counterSlice.actions.increment())}>
        +
      </button>
      <button onClick={() => dispatch(counterSlice.actions.decrement())}>
        -
      </button>
    </div>
  );
}

// App
function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}
```

### Zustand Example

```jsx
import create from "zustand";

// Store
const useStore = create(set => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 }))
}));

// Component
function Counter() {
  const { count, increment, decrement } = useStore();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}

// App
function App() {
  return <Counter />;
}
```

## Best Practices

1. **Choose the Right Tool**: Select a state management library based on your application's complexity and team's familiarity.

2. **Normalize State**: Keep your state normalized to avoid data duplication and inconsistencies.

3. **Immutable Updates**: Always update state immutably to prevent unexpected behavior.

4. **Use Selectors**: Implement selectors to efficiently derive data from your state.

5. **Middleware for Side Effects**: Use middleware (like Redux-Thunk or Redux-Saga) for handling side effects.

6. **DevTools Integration**: Utilize developer tools for debugging and time-travel debugging.

7. **Modular State**: Organize your state into logical modules or slices for better maintainability.

## Common Pitfalls

<Callout>

1. Over-centralization:

   - Mistake: Putting every piece of state in the global store.
   - Why: This can lead to unnecessary complexity and performance issues.
   - Solution: Only put truly global state in your store; keep component-specific state local.

</Callout>

<Callout>

2. Deeply Nested State:

   - Mistake: Creating deeply nested state structures.
   - Why: This makes updates more complex and error-prone.
   - Solution: Keep your state flat and normalized.

</Callout>

<Callout>

3. Ignoring Performance:

   - Mistake: Not optimizing renders in connected components.
   - Why: This can lead to unnecessary re-renders and poor performance.
   - Solution: Use memoization techniques and efficient selectors.

</Callout>

<Callout>

4. Overusing Middleware:
   - Mistake: Using middleware for simple synchronous operations.
   - Why: This adds unnecessary complexity to your application.
   - Solution: Only use middleware for complex async operations or side effects.

</Callout>

## Related Concepts

1. **Flux Architecture**: The architectural pattern that inspired Redux.
2. **Immutability**: A core concept in most state management solutions.
3. **Observables**: Used in some state management libraries like MobX.
4. **Context API**: React's built-in solution for passing data through the component tree.
5. **Reselect**: A library for creating memoized selectors, often used with Redux.

## Further Resources

<Callout emoji='📚'>

1. [Redux Documentation](https://redux.js.org/): Official documentation for Redux.

2. [Redux Toolkit Documentation](https://redux-toolkit.js.org/): Official documentation for Redux Toolkit.

3. [Zustand Documentation](https://github.com/pmndrs/zustand): GitHub repository and documentation for Zustand.

4. [You Might Not Need Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367): A thoughtful article by Dan Abramov on when to use Redux.

5. [Comparison of State Management Solutions](https://github.com/reduxjs/redux/issues/1287): A GitHub issue with a comprehensive comparison of state management solutions.

6. [Redux Style Guide](https://redux.js.org/style-guide/style-guide): Best practices for Redux development.

7. [Practical Redux](https://blog.isquaredsoftware.com/series/practical-redux/): A series of in-depth articles on Redux best practices and techniques.

</Callout>

```

## pages/react/L4-lead/suspense-and-lazy.mdx
```
import { Callout } from "nextra/components";

# Suspense in React

## Brief Overview

<Callout emoji='💡'>
  Suspense is a React feature that allows components to "suspend" rendering
  while they're waiting for something (like data or code) to load. It enables
  declarative loading states and helps in creating a smoother user experience
  during data fetching.
</Callout>

## Detailed Explanation

### Data Fetching with Suspense

Suspense for data fetching is designed to simplify the process of handling asynchronous operations in React components. It allows you to declaratively specify loading states for your components while waiting for data to be fetched.

**Key concepts**:

1. **Suspend Rendering**: Components can suspend rendering while waiting for data.
2. **Fallback UI**: Specify a fallback UI to show while data is loading.
3. **Streaming Server-Side Rendering**: Enhances server-side rendering capabilities.
4. **Concurrent Mode**: Works best with React's Concurrent Mode for smoother updates.

## Code Examples

### Basic Suspense Usage

Here's a basic example of how Suspense might be used for data fetching:

```jsx
import React, { Suspense } from "react";
import { fetchData } from "./api";

// This component is written to be "suspense-ready"
const DataComponent = () => {
  const data = fetchData(); // This function throws a promise if data isn't ready
  return <div>{data}</div>;
};

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <DataComponent />
      </Suspense>
    </div>
  );
}
```

### Suspense with Error Boundaries

Combining Suspense with Error Boundaries for better error handling:

```jsx
import React, { Suspense } from "react";
import ErrorBoundary from "./ErrorBoundary";
import { fetchData } from "./api";

const DataComponent = () => {
  const data = fetchData();
  return <div>{data}</div>;
};

function App() {
  return (
    <div>
      <ErrorBoundary fallback={<div>Error loading data</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <DataComponent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
```

### Multiple Suspense Boundaries

Using multiple Suspense boundaries for different parts of your UI:

```jsx
import React, { Suspense } from "react";
import { fetchUserData, fetchPosts } from "./api";

const UserInfo = () => {
  const user = fetchUserData();
  return <div>{user.name}</div>;
};

const Posts = () => {
  const posts = fetchPosts();
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
};

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading user info...</div>}>
        <UserInfo />
      </Suspense>
      <Suspense fallback={<div>Loading posts...</div>}>
        <Posts />
      </Suspense>
    </div>
  );
}
```

## Best Practices

1. **Use with Concurrent Mode**: Suspense works best when used with React's Concurrent Mode.

2. **Graceful Degradation**: Provide fallback UIs that give users meaningful information about what's loading.

3. **Appropriate Granularity**: Use multiple Suspense boundaries to load different parts of the UI independently.

4. **Combine with Error Boundaries**: Always use Error Boundaries with Suspense to handle errors gracefully.

5. **Avoid Waterfalls**: Try to parallelize data fetching where possible to avoid request waterfalls.

6. **Optimize the Fallback UI**: Make sure your fallback UI closely resembles the final content to reduce layout shifts.

7. **Consider Server-Side Rendering**: Suspense can enhance server-side rendering capabilities, improving initial load times.

## Common Pitfalls

<Callout>

1. Overusing Suspense:

   - Mistake: Wrapping every component in Suspense.
   - Why: This can lead to a confusing user experience with too many loading states.
   - Solution: Use Suspense judiciously, typically at layout boundaries.

</Callout>

<Callout>

2. Ignoring Error Handling:

   - Mistake: Not using Error Boundaries with Suspense.
   - Why: This can lead to uncaught errors and broken UI states.
   - Solution: Always combine Suspense with Error Boundaries.

</Callout>

<Callout>

3. Creating Request Waterfalls:

   - Mistake: Nesting Suspense boundaries in a way that creates sequential data fetching.
   - Why: This can significantly slow down your application.
   - Solution: Structure your components to allow parallel data fetching where possible.

</Callout>

<Callout>

4. Forgetting about Race Conditions:
   - Mistake: Not handling potential race conditions in data fetching.
   - Why: This can lead to stale or incorrect data being displayed.
   - Solution: Implement proper cancellation and deduplication strategies in your data fetching logic.

</Callout>

## Related Concepts

1. **Concurrent Mode**: Suspense is designed to work optimally with React's Concurrent Mode.
2. **Code Splitting**: Suspense can be used for code splitting with React.lazy().
3. **Error Boundaries**: Often used in conjunction with Suspense for error handling.
4. **React.lazy**: Used with Suspense for component-level code splitting.
5. **Server-Side Rendering**: Suspense enhances SSR capabilities in React.

## Further Resources

<Callout emoji='📚'>

1. [Suspense for Data Fetching](https://react.dev/reference/react/Suspense): Official React documentation on Suspense.

2. [Concurrent Mode](https://react.dev/learn/managing-state): React documentation on Concurrent Mode, which works closely with Suspense.

3. [A Complete Guide to React Suspense](https://hygraph.com/blog/react-suspense): A comprehensive guide to understanding and using Suspense.

4. [Async React using React Suspense](https://reactjs.org/blog/2018/11/27/react-16-roadmap.html#react-16x-mid-2019-the-one-with-suspense-for-data-fetching): React team's vision for asynchronous rendering with Suspense.

</Callout>

```

## pages/react/_meta.js
```
export default {
  "L1-junior": "L1 - Junior",
  "L2-mid": "L2 - Mid level",
  "L3-senior": "L3 - Senior",
  "L4-lead": "L4 - Lead"
};

```

## pages/storybook/_meta.js
```
export default {};
```

## pages/storybook/introduction.mdx
```

```

## pages/storybook/writing-stories.mdx
```

```

## pages/styled-components/_meta.js
```
export default {};

```

## pages/styled-components/advanced-techniques.mdx
```

```

## pages/styled-components/basics.mdx
```

```

## scaffold_devjourneydocs.sh
```
#!/bin/bash

# Create main directory structure
mkdir -p pages/{react,nextjs,styled-components,storybook,jest} components styles

# Create placeholder files
touch pages/index.mdx
touch pages/_meta.json
touch pages/react/{_meta.json,basics.mdx,hooks.mdx,advanced-concepts.mdx}
touch pages/nextjs/{_meta.json,getting-started.mdx,routing.mdx,data-fetching.mdx}
touch pages/styled-components/{_meta.json,basics.mdx,advanced-techniques.mdx}
touch pages/storybook/{_meta.json,introduction.mdx,writing-stories.mdx}
touch pages/jest/{_meta.json,setup.mdx,writing-tests.mdx}

touch pages/react/L4-lead/{react-router.mdx,perforrmance-optimization.mdx,suspense-and-lazy.mdx,state-management-libraries.mdx,server-side-rendering.mdx,concurrent-mode.mdx}

# Create component files
touch components/{CodeBlock.js,Callout.js,ProgressTracker.js}

# Create styles file
touch styles/globals.css

# Create config files (if they don't exist already)
[ ! -f theme.config.jsx ] && touch theme.config.jsx
[ ! -f next.config.js ] && touch next.config.js
[ ! -f package.json ] && touch package.json

echo "DevJourneyDocs project structure has been created successfully!"
```

## theme.config.tsx
```
export default {
  logo: <span>My Personal Documentation</span>,
  project: {
    link: "https://github.com/TheFernande"
  }
  // primaryHue: { light: 300, dark: 800 },
  // shikiTokenKeyword: "#00eaff"
  // --shiki-token-keyword
  // ... other theme options
};
// import { useRouter } from 'next/router'
// import type { DocsThemeConfig } from 'nextra-theme-docs'
// import { Link, useConfig } from 'nextra-theme-docs'

// const logo = (
//   <svg
//     height="20"
//     viewBox="0 0 361 70"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//   >
//     <path
//       d="M114.913 33.2763v28.7642h-11.57V12.9496h11.059v8.3416h.575c1.129-2.7485 2.93-4.9325 5.401-6.5518 2.493-1.6193 5.572-2.429 9.237-2.429 3.388 0 6.339.7244 8.853 2.1733 2.535 1.4489 4.496 3.5476 5.88 6.2962 1.407 2.7486 2.099 6.0831 2.078 10.0035v31.2571h-11.57V32.5732c0-3.2813-.852-5.8487-2.557-7.7024-1.683-1.8537-4.016-2.7806-6.999-2.7806-2.024 0-3.824.4475-5.401 1.3424-1.556.8736-2.781 2.1413-3.676 3.8032-.873 1.662-1.31 3.6755-1.31 6.0405Zm61.407 29.723c-4.922 0-9.172-1.0227-12.752-3.0681-3.558-2.0668-6.296-4.9858-8.214-8.7572-1.917-3.7926-2.876-8.2563-2.876-13.3913 0-5.0497.959-9.4815 2.876-13.2954 1.939-3.8353 4.645-6.8182 8.118-8.9489 3.473-2.152 7.553-3.228 12.241-3.228 3.026 0 5.881.4901 8.565 1.4702 2.706.9588 5.093 2.4503 7.159 4.4744 2.088 2.0242 3.729 4.6023 4.922 7.7344 1.193 3.1108 1.79 6.8182 1.79 11.1221v3.5476h-40.238v-7.7983h29.148c-.021-2.2159-.501-4.1868-1.438-5.9126-.938-1.7472-2.248-3.1215-3.931-4.1229-1.662-1.0014-3.601-1.5021-5.817-1.5021-2.365 0-4.443.5753-6.232 1.7258-1.79 1.1293-3.186 2.6208-4.187 4.4745-.98 1.8324-1.481 3.8459-1.502 6.0405v6.8075c0 2.8551.522 5.3054 1.566 7.3508 1.044 2.0242 2.503 3.5796 4.378 4.6662 1.875 1.0654 4.07 1.598 6.584 1.598 1.683 0 3.207-.2343 4.57-.7031 1.364-.49 2.546-1.2038 3.548-2.1413 1.001-.9375 1.758-2.0987 2.269-3.4837l10.803 1.2145c-.682 2.8551-1.982 5.348-3.9 7.4787-1.896 2.1094-4.325 3.75-7.286 4.9219-2.962 1.1506-6.35 1.7258-10.164 1.7258Zm34.777-50.0497 9.908 18.1215 10.067-18.1215h12.241l-14.798 24.5455 15.054 24.5454h-12.177l-10.387-17.674-10.291 17.674h-12.273l14.957-24.5454-14.574-24.5455h12.273Zm63.878 0v8.9489h-28.221v-8.9489h28.221ZM253.722 1.18825h11.569V47.2749c0 1.5554.235 2.7486.704 3.5795.49.8097 1.129 1.3637 1.917 1.662s1.662.4474 2.621.4474c.724 0 1.385-.0532 1.981-.1598.618-.1065 1.087-.2024 1.407-.2876l1.949 9.0447c-.618.2131-1.502.4475-2.652.7031-1.13.2557-2.515.4049-4.155.4475-2.898.0852-5.508-.3516-7.831-1.3104-2.322-.9801-4.165-2.4929-5.529-4.5383-1.342-2.0455-2.003-4.6023-1.981-7.6705V1.18825Zm29.129 60.85225V12.9496h11.218v8.1818h.512c.895-2.8338 2.429-5.0177 4.602-6.5518 2.173-1.5554 4.677-2.3331 7.511-2.3331 1.321 0 2.535.1598 3.643.4794 1.108.3196 2.088.7564 2.94 1.3104l-3.579 9.588c-.618-.2983-1.3-.5433-2.046-.7351-.745-.1917-1.587-.2876-2.524-.2876-2.003 0-3.814.4474-5.434 1.3423-1.619.8949-2.908 2.1414-3.867 3.7394-.937 1.5767-1.406 3.4091-1.406 5.4971v28.8601h-11.57Zm51.222.863c-3.856 0-7.308-.9908-10.355-2.9723-3.047-1.9816-5.454-4.858-7.223-8.6293-1.768-3.7713-2.652-8.3523-2.652-13.7429 0-5.4546.894-10.0568 2.684-13.8068 1.811-3.7713 4.251-6.6158 7.319-8.5334 3.068-1.9389 6.488-2.9084 10.259-2.9084 2.877 0 5.242.4901 7.095 1.4702 1.854.9588 3.324 2.12 4.411 3.4836 1.087 1.3424 1.928 2.6101 2.525 3.8033h.479v-8.1179h11.602v49.0909h-11.378v-7.7343h-.703c-.597 1.1931-1.46 2.4609-2.589 3.8032-1.129 1.321-2.621 2.4503-4.474 3.3878-1.854.9375-4.187 1.4063-7 1.4063Zm3.228-9.4922c2.451 0 4.539-.6605 6.265-1.9816 1.725-1.3423 3.036-3.2066 3.931-5.593s1.342-5.1669 1.342-8.3416c0-3.1747-.447-5.934-1.342-8.2777-.874-2.3438-2.174-4.1655-3.9-5.4652-1.704-1.2997-3.803-1.9496-6.296-1.9496-2.578 0-4.73.6712-6.456 2.0135s-3.025 3.196-3.899 5.5611c-.873 2.365-1.31 5.071-1.31 8.1179 0 3.0682.437 5.8061 1.31 8.2138.895 2.3863 2.205 4.272 3.931 5.6569 1.747 1.3636 3.889 2.0455 6.424 2.0455Z"
//       fill="currentColor"
//     />
//     <path
//       d="m64.8833 1.81335-2.8464 2.84638C47.1274 19.5692 22.9543 19.5692 8.04485 4.65972L5.19848 1.81335c-.93479-.93478-2.45037-.93478-3.38515 0-.93479.93478-.93478 2.45037 0 3.38515L4.6597 8.04487c14.9095 14.90953 14.9095 39.08263 0 53.99213l-2.84637 2.8463c-.93479.9348-.93479 2.4504 0 3.3852.93478.9348 2.45037.9348 3.38515 0l2.84637-2.8464c14.90955-14.9095 39.08255-14.9095 53.99205 0l2.8464 2.8464c.9348.9348 2.4504.9348 3.3852 0 .9347-.9348.9347-2.4504 0-3.3852l-2.8464-2.8463c-14.9095-14.9095-14.9095-39.0826 0-53.99213l2.8464-2.84637c.9347-.93478.9347-2.45037 0-3.38515-.9348-.93478-2.4504-.93478-3.3852 0Z"
//       fill="currentColor"
//       stroke="currentColor"
//       strokeWidth="2"
//     />
//     <style jsx>{`
//       svg {
//         mask-image: linear-gradient(
//           60deg,
//           black 25%,
//           rgba(0, 0, 0, 0.2) 50%,
//           black 75%
//         );
//         mask-size: 400%;
//         mask-position: 0%;
//       }
//       svg:hover {
//         mask-position: 100%;
//         transition:
//           mask-position 1s ease,
//           -webkit-mask-position 1s ease;
//       }
//     `}</style>
//   </svg>
// )

// const config: DocsThemeConfig = {
//   banner: {
//     key: '3.0-release',
//     content: (
//       <div className='before:content-["🎉_"]'>
//         Nextra 3.0 is released.{' '}
//         <Link
//           href="https://the-guild.dev/blog/nextra-3"
//           className='after:content-["_→"]'
//         >
//           Read more
//         </Link>
//       </div>
//     )
//   },
//   project: {
//     link: 'https://github.com/shuding/nextra'
//   },
//   docsRepositoryBase: 'https://github.com/shuding/nextra/tree/main/docs',
//   logo,
//   head: function useHead() {
//     const config = useConfig()
//     const { route } = useRouter()
//     const isDefault = route === '/' || !config.title
//     const image =
//       'https://nextra.site/' +
//       (isDefault ? 'og.jpeg' : `api/og?title=${config.title}`)

//     const description =
//       config.frontMatter.description ||
//       'Make beautiful websites with Next.js & MDX.'
//     const title = config.title + (route === '/' ? '' : ' - Nextra')

//     return (
//       <>
//         <title>{title}</title>
//         <meta property="og:title" content={title} />
//         <meta name="description" content={description} />
//         <meta property="og:description" content={description} />
//         <meta property="og:image" content={image} />

//         <meta name="msapplication-TileColor" content="#fff" />
//         <meta httpEquiv="Content-Language" content="en" />
//         <meta name="twitter:card" content="summary_large_image" />
//         <meta name="twitter:site:domain" content="nextra.site" />
//         <meta name="twitter:url" content="https://nextra.site" />
//         <meta name="apple-mobile-web-app-title" content="Nextra" />
//         <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
//         <link rel="icon" href="/favicon.png" type="image/png" />
//         <link
//           rel="icon"
//           href="/favicon-dark.svg"
//           type="image/svg+xml"
//           media="(prefers-color-scheme: dark)"
//         />
//         <link
//           rel="icon"
//           href="/favicon-dark.png"
//           type="image/png"
//           media="(prefers-color-scheme: dark)"
//         />
//       </>
//     )
//   },
//   editLink: {
//     content: 'Edit this page on GitHub →'
//   },
//   feedback: {
//     content: 'Question? Give us feedback →',
//     labels: 'feedback'
//   },
//   sidebar: {
//     defaultMenuCollapseLevel: 1,
//     toggleButton: true
//   },
//   footer: {
//     content: (
//       <div className="flex w-full flex-col items-center sm:items-start">
//         <div>
//           <a
//             className="nextra-focus flex items-center gap-1 text-current"
//             target="_blank"
//             rel="noreferrer"
//             title="vercel.com homepage"
//             href="https://vercel.com?utm_source=nextra.site"
//           >
//             <span>Powered by</span>
//             <svg height={20} viewBox="0 0 283 64" fill="none">
//               <title>Vercel</title>
//               <path
//                 fill="currentColor"
//                 d="M141.04 16c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.46 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM248.72 16c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.45 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM200.24 34c0 6 3.92 10 10 10 4.12 0 7.21-1.87 8.8-4.92l7.68 4.43c-3.18 5.3-9.14 8.49-16.48 8.49-11.05 0-19-7.2-19-18s7.96-18 19-18c7.34 0 13.29 3.19 16.48 8.49l-7.68 4.43c-1.59-3.05-4.68-4.92-8.8-4.92-6.07 0-10 4-10 10zm82.48-29v46h-9V5h9zM36.95 0L73.9 64H0L36.95 0zm92.38 5l-27.71 48L73.91 5H84.3l17.32 30 17.32-30h10.39zm58.91 12v9.69c-1-.29-2.06-.49-3.2-.49-5.81 0-10 4-10 10V51h-9V17h9v9.2c0-5.08 5.91-9.2 13.2-9.2z"
//               />
//             </svg>
//           </a>
//         </div>
//         <p className="mt-6 text-xs">
//           © {new Date().getFullYear()} The Nextra Project.
//         </p>
//       </div>
//     )
//   }
// }

// export default config

```

