# AGENTS.md - Coding Agent Guidelines

## Project Overview
GitHub Collab Manager - React + Vite application for managing GitHub repository collaborators.
Uses Ant Design (antd) for UI components and Tailwind CSS for styling.

## Build/Development Commands

```bash
# Start development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint

# Install dependencies
npm install
```

**Note:** No test framework is currently configured. To add tests, use Vitest (pairs well with Vite).

## Code Style Guidelines

### JavaScript/React
- **Module System:** ES modules only (`"type": "module"` in package.json)
- **Quotes:** Use double quotes for strings, JSX attributes, and imports
- **Indentation:** 2 spaces
- **Semicolons:** Required
- **Line endings:** LF

### Imports
- Use named imports from React: `import { useState, useCallback } from "react"`
- Group imports: React → Third-party (antd, etc.) → Local components/utils
- Example:
```jsx
import React, { useState, useCallback } from "react";
import { Card, Tabs, message } from "antd";
import { BookOutlined } from "@ant-design/icons";
import { useTheme } from "./context/ThemeContext";
import TokenInput from "./components/TokenInput";
```

### Tailwind CSS
- **Prefix required:** All Tailwind classes MUST use `tw-` prefix
- **Usage:** Use Tailwind for layout (flex, grid, spacing) and utilities
- **Example:** `<div className="tw-flex tw-gap-4 tw-p-6">`

### Styling Approach
- **Tailwind:** Layout, spacing, flex/grid utilities
- **CSS Custom Properties:** Colors, theme values (defined in `src/theme/tokens.js`)
- **Inline styles:** Ant Design component overrides, dynamic values
- **CSS file:** Global styles in `src/index.css`, Ant Design overrides

### Component Structure
- Use functional components with hooks
- Destructure props at component level
- Use JSDoc for context providers and utilities
- Example component pattern:
```jsx
const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(null);
  
  return (
    <div className="tw-flex">
      {/* JSX content */}
    </div>
  );
};

export default ComponentName;
```

### Naming Conventions
- **Components:** PascalCase (e.g., `TokenInput.jsx`)
- **Files:** Match component name (e.g., `UserManagementTab.jsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useTheme`, `useAdvancedFilter`)
- **Utilities:** camelCase (e.g., `dataTransform.js`)
- **Classes:** PascalCase (e.g., `class GitHubAPI`)

### Error Handling
- Use try/catch for async operations
- Log warnings for non-critical failures (e.g., `console.warn`)
- Use Ant Design's `message` for user-facing errors
- Re-throw errors that should bubble up

### State Management
- Use React hooks (useState, useCallback, useEffect)
- Use Context API for global theme state (`ThemeContext`)
- No Redux or other state management libraries

### API/Service Patterns
- Class-based services (e.g., `GitHubAPI`)
- Async methods with proper error handling
- Use `fetch` for HTTP requests
- Implement pagination where applicable

## Project Structure
```
src/
  components/     # React components (.jsx)
  context/        # React contexts
  hooks/          # Custom React hooks
  services/       # API services
  theme/          # Design tokens and theming
  utils/          # Utility functions
```

## Important Notes
- Token is stored only in memory (never persisted)
- Required GitHub scopes: `repo`, `read:org`
- Theme supports light/dark mode via CSS custom properties
- Follow existing patterns in similar files when adding new code
