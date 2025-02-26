# React Concepts Documentation Website

A comprehensive documentation website built to help developers learn React concepts from beginner to advanced levels. The content is structured in a clear progression path, making it ideal for both self-paced learning and reference.

## Features

- Progressive learning path from junior to principal level React concepts
- Interactive code examples using react-live
- Built with Next.js and Nextra for optimal performance and developer experience
- Fully searchable documentation
- Mobile-responsive design

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (Latest LTS version recommended)
- Yarn package manager (v4.4.1 or higher)

## Installation

1. Clone the repository:

```bash
git clone [your-repository-url]
cd documentation-website

```

1. Install dependencies:

```bash
yarn install

```

## Development

To start the development server:

```bash
yarn dev

```

The site will be available at `http://localhost:3000`

## Building for Production

To create a production build:

```bash
yarn build

```

To start the production server:

```bash
yarn start

```

## Scripts

- `yarn dev` - Start development server
- `yarn build` - Create production build
- `yarn start` - Start production server
- `yarn prettier:check` - Check code formatting
- `yarn prettier:fix` - Fix code formatting

## Content Structure

The documentation is organized into four main levels:

### Level 1 (Junior Developer) 🟢

- Introduction to React
- JSX
- Components
- State
- React Hooks and Custom Hooks

### Level 2 (Mid-Level Developer) 🟡

- Handling Events
- Conditional Rendering
- Lists and Keys
- useState
- Forms in React
- Styling in React

### Level 3 (Senior Developer) 🟠

- useEffect
- Context API & useContext
- useRef and forwardRef
- React Fragments
- Composition Pattern
- Plus more advanced concepts

### Level 4 (Lead/Principal Developer) 🟣

- React Router
- Performance Optimization
- Suspense
- State Management Libraries
- Server-Side Rendering (SSR)
- Concurrent Mode
