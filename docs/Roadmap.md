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
