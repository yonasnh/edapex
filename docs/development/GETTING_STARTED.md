# 🛠️ Development Guide

Welcome to SchoolApex Modern UI development! This guide will help you get started with contributing to the project.

## Development Environment

### Prerequisites

Ensure you have completed the [Installation Guide](../setup/INSTALLATION.md) before proceeding.

### Project Structure

```
schoolapex/
├── 📱 apps/                    # Frontend applications
│   ├── classapex-lms/         # Main ClassApex LMS application
│   ├── schoolapex-lms/        # SchoolApex LMS application  
│   └── demo/                  # Demo application
├── 📦 packages/               # Shared packages
│   ├── components/            # UI component library
│   ├── core/                  # Core services and utilities
│   ├── lti-service/          # LTI 1.3 integration service
│   └── classapex-lms/        # GraphQL API server
├── 📚 docs/                   # Documentation
├── 🧪 tests/                  # End-to-end tests
└── 🛠️ scripts/               # Utility scripts
```

## Development Workflow

### 1. Start Development Environment

```bash
# Start all development servers
pnpm dev

# Or use the service management script for better control
./start-services.sh start
```

This starts:
- **Frontend Apps**: Vite dev servers with HMR
- **GraphQL API**: Node.js server with auto-reload
- **LTI Service**: Express server for Canvas integration
- **TypeScript Compilation**: Watch mode for shared packages

### 2. Development Scripts

```bash
# Development
pnpm dev              # Start all development servers
pnpm build            # Build all packages for production
pnpm type-check       # Run TypeScript type checking

# Testing
pnpm test             # Run unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:e2e         # Run end-to-end tests
pnpm test:e2e:ui      # Run E2E tests with UI

# Code Quality
pnpm lint             # Lint all packages
pnpm lint:fix         # Fix linting issues automatically
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting

# Utilities
pnpm clean            # Clean build artifacts
```

### 3. Working with Packages

The project uses a monorepo structure with pnpm workspaces:

```bash
# Install dependency to specific package
pnpm add react --filter @schoolapex/components

# Run script in specific package
pnpm --filter classapex-lms dev

# Build specific package
pnpm --filter @schoolapex/core build
```

## Code Organization

### Frontend Applications

#### ClassApex LMS (`apps/classapex-lms/`)

Main application with full Canvas integration:

```
src/
├── components/        # App-specific components
├── pages/            # Application pages
│   ├── Discussions.tsx
│   ├── Courses.tsx
│   ├── Analytics.tsx
│   └── ...
├── services/         # API integration
├── hooks/            # Custom React hooks
├── contexts/         # React contexts
└── styles/           # Application styles
```

#### Component Development

Components follow this structure:

```typescript
// packages/components/src/ui/Button/Button.tsx
import React from 'react'
import { Button as CarbonButton } from '@carbon/react'
import type { ButtonProps } from './Button.types'

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  return (
    <CarbonButton
      kind={variant}
      size={size}
      {...props}
    >
      {children}
    </CarbonButton>
  )
}

export default Button
```

### Backend Services

#### GraphQL API (`packages/classapex-lms/`)

```
src/
├── resolvers/        # GraphQL resolvers
├── schema/           # GraphQL schema definitions
├── context.ts        # GraphQL context
└── server.ts         # Express server setup
```

#### LTI Service (`packages/lti-service/`)

```
src/
├── routes/           # Express routes
├── lib/              # LTI utilities
├── types/            # TypeScript types
└── server.ts         # Express server
```

## Development Best Practices

### 1. TypeScript

- Use strict TypeScript configuration
- Define proper types for all components and functions
- Leverage type inference where appropriate
- Use generic types for reusable components

```typescript
// Good: Proper typing
interface CourseCardProps {
  course: Course
  currentUser: User
  onEnroll?: (courseId: string) => void
}

// Good: Generic component
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}
```

### 2. Component Development

- Follow Carbon Design System patterns
- Use composition over inheritance
- Implement proper accessibility attributes
- Write comprehensive tests

```typescript
// Good: Accessible component
export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  currentUser,
  onEnroll
}) => {
  return (
    <div
      role="article"
      aria-labelledby={`course-${course.id}-title`}
      className="course-card"
    >
      <h3 id={`course-${course.id}-title`}>
        {course.name}
      </h3>
      {/* ... */}
    </div>
  )
}
```

### 3. State Management

- Use React hooks for local state
- Implement custom hooks for shared logic
- Use Context API for global state
- Consider React Query for server state

```typescript
// Custom hook example
export const useCanvasApi = <T>(endpoint: string) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // API call logic
  }, [endpoint])

  return { data, loading, error }
}
```

### 4. Styling

- Use Carbon Design System tokens
- Follow BEM methodology for custom CSS
- Use CSS modules or styled-components
- Ensure responsive design

```css
/* Good: Using Carbon tokens */
.course-card {
  padding: var(--cds-spacing-05);
  background: var(--cds-background);
  border: 1px solid var(--cds-border-subtle);
  border-radius: var(--cds-border-radius);
}

/* Good: Responsive design */
@media (max-width: 768px) {
  .course-card {
    padding: var(--cds-spacing-03);
  }
}
```

## Testing

### Unit Testing

Use Vitest and React Testing Library:

```typescript
// components/Button/Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### E2E Testing

Use Playwright for end-to-end testing:

```typescript
// tests/e2e/discussions.spec.ts
import { test, expect } from '@playwright/test'

test('user can view discussions', async ({ page }) => {
  await page.goto('http://localhost:3005/discussions')
  
  await expect(page.getByRole('heading', { name: 'Discussions' })).toBeVisible()
  await expect(page.getByTestId('discussion-list')).toBeVisible()
})
```

## Debugging

### Browser DevTools

- Use React Developer Tools
- Monitor network requests
- Check console for errors
- Use Performance tab for optimization

### VS Code Setup

Recommended extensions:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "ms-playwright.playwright"
  ]
}
```

### Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug ClassApex LMS",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/classapex-lms/src/main.tsx",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

## Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
pnpm build
pnpm --filter classapex-lms analyze

# Check for duplicate dependencies
pnpm list --depth=0
```

### Code Splitting

```typescript
// Lazy load components
const AnalyticsPage = lazy(() => import('./pages/Analytics'))

// Route-based code splitting
const router = createBrowserRouter([
  {
    path: '/analytics',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <AnalyticsPage />
      </Suspense>
    )
  }
])
```

## Git Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages

Follow conventional commits:

```bash
feat: add discussion filtering functionality
fix: resolve Canvas API authentication issue
docs: update installation guide
refactor: improve component prop types
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes following code guidelines
3. Write/update tests
4. Update documentation
5. Submit PR with detailed description
6. Address review feedback
7. Merge after approval

## Next Steps

- Explore [Component Development Guide](./COMPONENTS.md)
- Learn about [API Integration](./API_INTEGRATION.md)
- Review [Testing Guide](./TESTING.md)
- Check [Code Guidelines](./CODE_GUIDELINES.md)

## Getting Help

- Check existing [GitHub Issues](https://github.com/yonasnh/schoolapex/issues)
- Join [GitHub Discussions](https://github.com/yonasnh/schoolapex/discussions)
- Review [Troubleshooting Guide](../troubleshooting/COMMON_ISSUES.md)
