# Project Commands

## Development
- `npm run dev` - Start Next.js development server
- `npm run build` - Build Next.js application
- `npm run start` - Start production server

## Testing
- `npm test` - Run Vitest tests
- `npm run test:run` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- Run a single test: `npx vitest run path/to/file.test.ts -t "test name"` 

## Code Quality
- `npm run lint` - Run ESLint
- `npm run gen:schema` - Generate types from local Supabase schema
- `npm run gen:schema:remote` - Generate types from remote Supabase schema

# Code Style

## General
- Use TypeScript with strict mode enabled
- React function components with hooks
- Use TanStack Query for data fetching
- Tailwind CSS for styling

## Naming & Structure
- PascalCase for React components and interfaces
- camelCase for variables, functions and file names
- Use .tsx extension for React components
- Use .ts extension for utility functions

## Imports & Types
- Use absolute imports with @ alias for project root
- Define prop types with TypeScript interfaces
- Define explicit return types for functions