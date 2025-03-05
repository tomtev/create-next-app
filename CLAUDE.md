# page.fun Code Guidelines for Claude

## Commands
- Development: `npm run dev`
- Build: `npm run build` (runs prisma generate first)
- Start: `npm run start`
- Format: `npm run format` (prettier on .ts, .tsx, .js, .jsx files)
- Lint: `npm run lint` (ESLint + prettier check + TypeScript check)

## Code Style
- Use functional React components with TypeScript (TSX)
- Component props interfaces: PascalCase (e.g., `AppMenuProps`)
- Helper functions: camelCase (e.g., `handleDragEnd`, `isPageIncomplete`)
- Constants: UPPERCASE_SNAKE_CASE
- Custom hooks follow `use-` prefix naming convention (e.g., `useThemeStyles`)
- Tailwind CSS for styling with `className` attributes and `cn()` utility for conditions

## Imports and Organization
- Group imports: React/Next.js first, then external libraries, then internal imports
- Follow logical file organization for new components
- Place shared utilities in lib/ directory

## TypeScript
- Use explicit interfaces with descriptive field names
- Use optional chaining with ? suffix for nullable fields
- Prefer early returns for validation/guard clauses
- Destructure props and state variables

## Error Handling
- Use try/catch blocks with typed error responses
- For user-facing errors, provide clear error messages

## Component Patterns
- Prefer reusable components for UI elements
- Use conditional rendering with ternary operators and logical && patterns
- Keep components focused on single responsibilities