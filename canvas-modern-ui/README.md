# 🎓 ClassApex Modern UI

<div align="center">
  <img src="./classapex.png" alt="ClassApex Logo" width="160" height="160" style="border-radius: 24px; box-shadow: 0 12px 32px rgba(0,0,0,0.15)">

  **Revolutionary UI/UX system that transforms educational management with modern design and enhanced functionality**

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18.2+-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Carbon Design System](https://img.shields.io/badge/Carbon-Design-System-161616?logo=ibm&logoColor=white)](https://carbondesignsystem.com/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
  [![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
</div>

---

## 🌟 Overview

ClassApex Modern UI is a comprehensive, high-performance transformation of the Learning Management System experience, featuring multiple applications and services that provide a modern, intuitive, and accessible educational platform.

### 🎯 Key Applications

- **ClassApex LMS**: Primary modern interface with enhanced discussions, user administration, analytics, and rich user experience
- **SchoolApex LMS**: Secondary interface with specialized educational workflows
- **Demo Application**: Interactive showcase of all reusable Carbon components and features
- **GraphQL API**: Powerful backend service for low-latency widget and notification management

### ✨ Features

- **🎨 Modern Design**: Beautiful, intuitive interface built with IBM Carbon Design System
- **📱 Responsive**: Mobile-first design that works seamlessly across all devices
- **⚡ Performance**: Optimized for speed with lazy loading and efficient rendering
- **🔧 Component-Driven**: Reusable components for consistent user experience
- **🔗 Deep API Integration**: Real-time data synchronization with the Rails core API
- **♿ Accessible**: WCAG 2.1 AA compliant with comprehensive accessibility features
- **🔒 Secure**: Enterprise-grade security with OAuth2 and LTI integration
- **🧪 Tested**: Comprehensive testing with Playwright and Vitest

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 ClassApex Modern UI                     │
├─────────────────────────────────────────────────────────┤
│  ClassApex LMS  │  SchoolApex LMS  │  Demo App         │
├─────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Carbon Design System          │
├─────────────────────────────────────────────────────────┤
│  GraphQL API    │                  │  Rails REST API   │
├─────────────────────────────────────────────────────────┤
│                 ClassApex Core Engine                   │
└─────────────────────────────────────────────────────────┘
```

### 🎯 Core Principles

- **🔧 Component-Driven**: Reusable, composable components with educational-specific patterns
- **🎨 Design Excellence**: Beautiful, modern interface that sets new standards for educational UX
- **⚡ Performance First**: Optimized bundle sizes, lazy loading, and efficient rendering
- **♿ Accessibility**: WCAG 2.1 AA compliant with enhanced educational context features
- **🔗 API Integration**: Seamless backend API integration without modifications
- **📱 Mobile-First**: Responsive design optimized for all educational devices

## 📁 Project Structure

```
schoolapex/
├── 📱 apps/                    # Frontend applications
│   ├── classapex-lms/         # Main ClassApex LMS application
│   │   ├── src/pages/         # Application pages (Discussions, Courses, etc.)
│   │   ├── src/components/    # App-specific components
│   │   └── src/services/      # Canvas API integration
│   ├── classapex-lms/         # GraphQL API backend
│   └── demo/                  # Demo application
├── 📦 packages/               # Shared packages
│   ├── components/            # UI component library
│   │   ├── src/ui/           # Reusable UI components
│   │   ├── src/analytics/    # Analytics components
│   │   └── src/calendar/     # Calendar components
│   ├── core/                  # Core services and utilities
│   │   ├── src/services/     # Canvas API services
│   │   ├── src/hooks/        # React hooks
│   │   └── src/contexts/     # React contexts
│   └── classapex-lms/        # GraphQL API server
├── 📚 docs/                   # Documentation
│   ├── setup/                # Setup and installation guides
│   ├── development/          # Development documentation
│   ├── deployment/           # Deployment guides
│   ├── api/                  # API documentation
│   └── architecture/         # Architecture documentation
├── 🧪 tests/                  # End-to-end tests
├── 🛠️ scripts/               # Utility scripts
└── 🐳 docker-compose.yml     # Container orchestration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Canvas LMS** instance (for full functionality)

### Installation

```bash
# Clone the repository
git clone https://github.com/yonasnh/schoolapex.git
cd schoolapex

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

### 🌐 Access Applications

After starting the development server, access these applications:

- **ClassApex LMS**: http://localhost:3005/ (Main application)
- **SchoolApex LMS**: http://localhost:3003/ (Alternative interface)
- **Demo App**: http://localhost:3002/ (Demonstration)
- **GraphQL API**: http://localhost:4003/graphql (Backend API)

### Environment Configuration

```bash
# Canvas API Configuration (optional)
CANVAS_API_URL=http://localhost:3000
CANVAS_API_TOKEN=your_canvas_api_token

# Development
NODE_ENV=development
```

## 🧩 Core Packages

### @schoolapex/core

Core framework with Canvas integration utilities, type definitions, and API clients.

```typescript
import {
  CanvasApiClient,
  Course,
  User,
  useCanvasApi
} from '@schoolapex/core'

// Canvas API integration
const { data: courses, loading } = useCanvasApi('/api/v1/courses')
```

### @schoolapex/components

Reusable UI components with Carbon Design System integration.

```typescript
import {
  CourseCard,
  AssignmentCard,
  DiscussionCard,
  NavigationSidebar
} from '@schoolapex/components'

// Canvas-specific components
<CourseCard
  course={course}
  currentUser={currentUser}
  variant="dashboard"
  onEnroll={handleEnroll}
/>

<AssignmentCard
  assignment={assignment}
  dueDate={dueDate}
  submissionStatus={status}
/>
```

## 🎛️ Feature Flags

CMUI uses comprehensive feature flags for controlled rollout and A/B testing:

```typescript
// Enable Carbon components for gradual migration
const useCarbonComponents = useFeatureFlag('carbon_components')

// Feature-specific flags
const modernDashboard = useFeatureFlag('modern_dashboard')
const dragAndDrop = useFeatureFlag('drag_and_drop')

// Development utilities
if (process.env.NODE_ENV === 'development') {
  setFeatureFlag('carbon_components', true)
}
```

### Available Feature Flags

- **Design System**: `carbon_components`, `carbon_theme`, `instui_migration`
- **Components**: `modern_dashboard`, `modern_gradebook`, `modern_course_list`
- **Features**: `drag_and_drop`, `real_time_updates`, `offline_support`
- **Accessibility**: `enhanced_a11y`, `screen_reader_optimizations`
- **Performance**: `virtual_scrolling`, `lazy_loading`, `bundle_splitting`

## 🧪 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start all development servers
pnpm build            # Build all packages
pnpm type-check       # TypeScript type checking

# Testing
pnpm test             # Run unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:e2e         # Run end-to-end tests with Playwright
pnpm test:e2e:ui      # Run E2E tests with UI
pnpm test:security    # Run security audit
pnpm test:accessibility # Run accessibility audit

# Code Quality
pnpm lint             # Lint all packages
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting

# Services Management
./start-services.sh   # Start all services with proper setup
./start-services.sh stop # Stop all services
./start-services.sh status # Check service status
```

### 🧪 Testing Strategy

SchoolApex includes comprehensive testing:

- **Unit Tests**: Vitest + React Testing Library for component testing
- **Integration Tests**: Component integration with Canvas API mocking
- **E2E Tests**: Playwright for critical user journeys and workflows
- **Accessibility Tests**: axe-core integration for WCAG compliance
- **Security Tests**: Automated security vulnerability scanning

### 🔧 Code Quality

- **TypeScript**: Strict mode with comprehensive type checking
- **ESLint**: Educational-specific rules with accessibility checks
- **Prettier**: Consistent code formatting across all packages
- **Turbo**: Monorepo build system for efficient development

## 📚 Documentation

### 📖 Setup & Installation
- [Setup Guide](./docs/setup/INSTALLATION.md) - Complete installation and setup instructions
- [Canvas Integration](./docs/setup/CANVAS_INTEGRATION.md) - Canvas LMS integration setup
- [Environment Configuration](./docs/setup/ENVIRONMENT.md) - Environment variables and configuration

### 🛠️ Development
- [Development Guide](./docs/development/GETTING_STARTED.md) - Getting started with development
- [Component Development](./docs/development/COMPONENTS.md) - Creating and using components
- [API Integration](./docs/development/API_INTEGRATION.md) - Canvas API integration patterns
- [Testing Guide](./docs/development/TESTING.md) - Testing strategies and best practices

### 🚀 Deployment
- [Deployment Guide](./docs/deployment/DEPLOYMENT.md) - Production deployment instructions
- [Docker Setup](./docs/deployment/DOCKER.md) - Container deployment with Docker
- [Security Guide](./docs/deployment/SECURITY.md) - Security best practices

### 🏗️ Architecture
- [System Architecture](./docs/architecture/OVERVIEW.md) - High-level system architecture
- [Component Architecture](./docs/architecture/COMPONENTS.md) - Component design patterns
- [API Architecture](./docs/architecture/API.md) - API design and integration patterns

### 🔧 API Reference
- [GraphQL API](./docs/api/GRAPHQL.md) - GraphQL API documentation
- [Canvas API Integration](./docs/api/CANVAS.md) - Canvas API integration guide

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

### Quick Contributing Steps

1. **Fork the repository** and create a feature branch
2. **Follow our coding standards** - TypeScript, ESLint, Prettier
3. **Write comprehensive tests** - Maintain high test coverage
4. **Ensure accessibility** - WCAG 2.1 AA compliance required
5. **Update documentation** - Keep docs current with changes
6. **Submit a pull request** with detailed description

### Development Workflow

1. Create feature branch from `main`
2. Implement changes following our [Code Guidelines](./docs/development/CODE_GUIDELINES.md)
3. Write tests and ensure they pass
4. Update relevant documentation
5. Submit pull request with detailed description
6. Ensure all CI checks pass

## 🎯 Current Status

### ✅ Completed Features

- **Multiple LMS Applications**: ClassApex LMS, SchoolApex LMS, and Demo applications
- **Component Library**: 25+ production-ready components with Carbon Design System
- **Canvas Integration**: Real-time API integration with Canvas LMS
- **GraphQL API**: Powerful backend service for data management
- **Testing Infrastructure**: Comprehensive E2E testing with Playwright
- **Documentation**: Extensive documentation and setup guides
- **Accessibility**: WCAG 2.1 AA compliant components
- **Performance**: Optimized bundle sizes and lazy loading

### 🚧 In Progress

- **Enhanced Analytics**: Advanced reporting and analytics dashboard
- **Mobile Optimization**: Native mobile app development
- **Advanced Integrations**: Additional LMS platform support
- **AI Features**: Intelligent content recommendations and assistance

### 📋 Roadmap

- **Q1 2024**: Enhanced mobile experience and offline support
- **Q2 2024**: Advanced analytics and reporting features
- **Q3 2024**: AI-powered learning assistance
- **Q4 2024**: Multi-platform LMS support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Canvas LMS Team** - For the foundational platform and APIs
- **Carbon Design System** - For the modern, accessible design system
- **React Community** - For the powerful frontend framework
- **TypeScript Team** - For type safety and developer experience
- **Educational Technology Community** - For inspiration and feedback

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/yonasnh/schoolapex/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yonasnh/schoolapex/discussions)

---

<div align="center">
  <strong>SchoolApex Modern UI</strong><br>
  Bringing modern, accessible, and delightful user experiences to educational technology 🎓✨
</div>
