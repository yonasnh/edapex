# 🤝 Contributing to SchoolApex Modern UI

Thank you for your interest in contributing to SchoolApex Modern UI! This document provides guidelines and information for contributors.

## 🌟 Ways to Contribute

- **🐛 Bug Reports**: Report issues and bugs
- **💡 Feature Requests**: Suggest new features and improvements
- **📝 Documentation**: Improve documentation and guides
- **🔧 Code Contributions**: Submit bug fixes and new features
- **🧪 Testing**: Help improve test coverage
- **🎨 Design**: Contribute to UI/UX improvements

## 🚀 Getting Started

### Prerequisites

1. Read the [Installation Guide](./setup/INSTALLATION.md)
2. Set up your [Development Environment](./development/GETTING_STARTED.md)
3. Familiarize yourself with the [Code Guidelines](./development/CODE_GUIDELINES.md)

### First Contribution

1. **Find an Issue**: Look for issues labeled `good first issue` or `help wanted`
2. **Comment**: Let us know you're working on it
3. **Fork**: Fork the repository to your GitHub account
4. **Clone**: Clone your fork locally
5. **Branch**: Create a feature branch
6. **Code**: Make your changes
7. **Test**: Ensure all tests pass
8. **Submit**: Create a pull request

## 📋 Development Process

### 1. Setting Up Your Environment

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/schoolapex.git
cd schoolapex

# Add upstream remote
git remote add upstream https://github.com/yonasnh/schoolapex.git

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

### 2. Creating a Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### 3. Making Changes

- Follow our [Code Guidelines](./development/CODE_GUIDELINES.md)
- Write clear, concise commit messages
- Add tests for new functionality
- Update documentation as needed
- Ensure accessibility compliance (WCAG 2.1 AA)

### 4. Testing Your Changes

```bash
# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run linting
pnpm lint

# Check TypeScript
pnpm type-check

# Format code
pnpm format
```

### 5. Submitting Changes

```bash
# Commit your changes
git add .
git commit -m "feat: add new discussion filtering feature"

# Push to your fork
git push origin feature/your-feature-name

# Create a pull request on GitHub
```

## 📝 Pull Request Guidelines

### PR Title Format

Use conventional commit format:

- `feat: add new feature`
- `fix: resolve bug issue`
- `docs: update documentation`
- `style: improve UI/UX`
- `refactor: improve code structure`
- `test: add or update tests`
- `chore: update dependencies`

### PR Description Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed
- [ ] Accessibility testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes (or clearly documented)
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and checks
2. **Code Review**: Maintainers review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, your PR will be merged

## 🎯 Code Standards

### TypeScript

- Use strict TypeScript configuration
- Define proper types for all functions and components
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

```typescript
// Good
interface CourseCardProps {
  course: Course
  currentUser: User
  onEnroll?: (courseId: string) => Promise<void>
}

// Avoid
interface Props {
  data: any
  onClick: Function
}
```

### React Components

- Use functional components with hooks
- Follow Carbon Design System patterns
- Implement proper accessibility
- Write comprehensive prop types

```typescript
// Good component structure
export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  currentUser,
  onEnroll
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleEnroll = async () => {
    if (!onEnroll) return
    
    setIsLoading(true)
    try {
      await onEnroll(course.id)
    } catch (error) {
      console.error('Enrollment failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      role="article"
      aria-labelledby={`course-${course.id}-title`}
      className="course-card"
    >
      <h3 id={`course-${course.id}-title`}>
        {course.name}
      </h3>
      {/* Component content */}
    </div>
  )
}
```

### Testing

- Write tests for all new functionality
- Maintain high test coverage (>90%)
- Use descriptive test names
- Test accessibility features

```typescript
describe('CourseCard', () => {
  it('should display course name and description', () => {
    const course = { id: '1', name: 'Test Course', description: 'Test Description' }
    render(<CourseCard course={course} currentUser={mockUser} />)
    
    expect(screen.getByText('Test Course')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('should be accessible to screen readers', () => {
    const course = { id: '1', name: 'Test Course' }
    render(<CourseCard course={course} currentUser={mockUser} />)
    
    expect(screen.getByRole('article')).toHaveAttribute('aria-labelledby', 'course-1-title')
  })
})
```

## 🐛 Bug Reports

### Before Submitting

1. Check existing issues to avoid duplicates
2. Test with the latest version
3. Gather relevant information

### Bug Report Template

```markdown
**Describe the Bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 1.0.0]
- Node.js version: [e.g. 18.0.0]

**Additional Context**
Any other context about the problem.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context, mockups, or screenshots.

**Implementation Ideas**
If you have ideas about how to implement this feature.
```

## 📚 Documentation

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Keep documentation up-to-date
- Follow markdown best practices

### Documentation Structure

```
docs/
├── setup/           # Installation and setup guides
├── development/     # Development documentation
├── deployment/      # Deployment guides
├── api/            # API documentation
├── architecture/   # System architecture
├── guides/         # How-to guides
└── troubleshooting/ # Common issues and solutions
```

## 🏆 Recognition

Contributors are recognized in:

- **README.md**: Major contributors listed
- **CHANGELOG.md**: Contributors mentioned in releases
- **GitHub**: Contributor graphs and statistics
- **Releases**: Special thanks in release notes

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Pull Request Comments**: Code-specific discussions

### Response Times

- **Issues**: We aim to respond within 48 hours
- **Pull Requests**: Initial review within 72 hours
- **Security Issues**: Immediate attention (email maintainers)

## 📄 License

By contributing to SchoolApex Modern UI, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You

Thank you for contributing to SchoolApex Modern UI! Your contributions help make educational technology more accessible and enjoyable for everyone.

---

**Questions?** Feel free to reach out through GitHub Issues or Discussions. We're here to help! 🚀
