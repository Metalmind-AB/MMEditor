# MMEditor Testing Guide

This document provides comprehensive information about testing in MMEditor, including test setup, guidelines, and best practices.

## Table of Contents

- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Types](#test-types)
- [Writing Tests](#writing-tests)
- [Test Utilities](#test-utilities)
- [CI/CD Integration](#cicd-integration)
- [Coverage Requirements](#coverage-requirements)
- [Troubleshooting](#troubleshooting)

## Test Structure

```
src/
├── __tests__/           # Integration, performance, security tests
│   ├── integration/     # Cross-component integration tests
│   ├── performance/     # Performance benchmarks
│   └── security/        # Security and XSS prevention tests
├── components/          # Component tests co-located with source
│   ├── Editor/
│   │   ├── Editor.tsx
│   │   ├── Editor.test.tsx
│   │   └── Editor.integration.test.tsx
│   └── Toolbar/
│       ├── Toolbar.tsx
│       └── Toolbar.test.tsx
├── modules/             # Module tests co-located with source
│   ├── sanitizer/
│   │   ├── sanitizer.ts
│   │   └── sanitizer.test.ts
│   └── ...
└── test/                # Test utilities and setup
    ├── setup.ts         # Global test configuration
    └── test-utils.tsx   # Custom testing utilities

e2e/                     # End-to-end tests
├── basic-functionality.spec.ts
└── ...
```

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests (no watch)
npm run test:unit
```

### Integration Tests
```bash
# Run security-specific tests
npm run test:security

# Run performance tests
npm run test:performance
```

### End-to-End Tests
```bash
# Run E2E tests headless
npm run test:e2e

# Run E2E tests with browser UI
npm run test:e2e:headed

# Run E2E tests with Playwright UI
npm run test:e2e:ui
```

### All Tests
```bash
# Run complete test suite
npm run test:all

# Quality check (lint + typecheck + coverage)
npm run quality-check
```

## Test Types

### 1. Unit Tests
- **Location**: Co-located with source files (`*.test.tsx`)
- **Purpose**: Test individual components and functions in isolation
- **Tools**: Vitest, Testing Library
- **Coverage**: 80% minimum threshold

**Example**:
```typescript
import { render, screen } from '../../test/test-utils';
import { Editor } from './Editor';

describe('Editor Component', () => {
  it('renders with placeholder', () => {
    render(<Editor placeholder="Type here..." />);
    expect(screen.getByRole('textbox')).toHaveAttribute('data-placeholder', 'Type here...');
  });
});
```

### 2. Integration Tests
- **Location**: `src/__tests__/integration/`
- **Purpose**: Test interactions between multiple components
- **Focus**: Complete user workflows

### 3. Performance Tests
- **Location**: `src/__tests__/performance/`
- **Purpose**: Ensure render times and memory usage meet requirements
- **Thresholds**: 
  - Initial render: < 50ms
  - Large content: < 200ms
  - Memory growth: < 50%

### 4. Security Tests
- **Location**: `src/__tests__/security/`
- **Purpose**: Validate XSS prevention and content sanitization
- **Coverage**: All known attack vectors

### 5. End-to-End Tests
- **Location**: `e2e/`
- **Purpose**: Test complete user workflows in real browsers
- **Tools**: Playwright

## Writing Tests

### Test Naming Conventions

```typescript
describe('ComponentName', () => {
  describe('feature group', () => {
    it('does something specific', () => {
      // test implementation
    });
  });
});
```

### Test Organization Patterns

1. **Arrange, Act, Assert (AAA)**
```typescript
it('applies bold formatting', () => {
  // Arrange
  render(<Editor />);
  const boldButton = screen.getByTitle('Bold (Ctrl+B)');
  
  // Act
  fireEvent.click(boldButton);
  
  // Assert
  expect(document.execCommand).toHaveBeenCalledWith('bold', false, undefined);
});
```

2. **Given, When, Then**
```typescript
it('shows active state when format is applied', () => {
  // Given a toolbar with bold formatting active
  const activeFormats = new Set(['bold']);
  render(<Toolbar activeFormats={activeFormats} />);
  
  // When we check the bold button
  const boldButton = screen.getByTitle('Bold (Ctrl+B)');
  
  // Then it should show as active
  expect(boldButton).toHaveAttribute('aria-pressed', 'true');
});
```

### Best Practices

1. **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByClassName`
2. **Test behavior, not implementation**: Focus on user interactions and outcomes
3. **Keep tests isolated**: Each test should be independent
4. **Use descriptive names**: Test names should clearly describe what they verify
5. **Mock external dependencies**: Use `vi.fn()` for external APIs

## Test Utilities

### Custom Render Function
```typescript
import { render, screen } from '../../test/test-utils';

// Automatically includes any providers needed
render(<Editor />);
```

### Editor Testing Utilities
```typescript
import { editorTestUtils } from '../../test/test-utils';

// Apply formatting
await editorTestUtils.applyFormat(boldButton);

// Type text
await editorTestUtils.typeText(editor, 'Hello World');

// Apply keyboard shortcuts
await editorTestUtils.applyShortcut(editor, '{Control>}b{/Control}');
```

### Performance Testing
```typescript
import { performanceUtils } from '../../test/test-utils';

const { time, result } = await performanceUtils.measureTime(() => {
  render(<Editor />);
  return screen.getByRole('textbox');
});

expect(time).toBeLessThan(50);
```

### Security Testing
```typescript
import { securityUtils } from '../../test/test-utils';

// Test XSS payloads
securityUtils.xssPayloads.forEach(payload => {
  render(<Editor value={payload} />);
  expect(securityUtils.isSanitized(editor.innerHTML, payload)).toBe(true);
});
```

## CI/CD Integration

### GitHub Actions

The project uses GitHub Actions for continuous testing:

- **Unit Tests**: Run on Node.js 18 and 20
- **E2E Tests**: Run on Ubuntu with Playwright
- **Security Audit**: Check for vulnerabilities
- **Performance Tests**: Validate performance requirements
- **Build Check**: Ensure library builds correctly

### Quality Gates

All tests must pass before merging:
- ✅ Linting (ESLint)
- ✅ Type checking (TypeScript)
- ✅ Unit tests (80% coverage minimum)
- ✅ Security tests (100% pass)
- ✅ E2E tests (100% pass)
- ✅ Build success

## Coverage Requirements

### Minimum Thresholds
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Excluded from Coverage
- Test files (`*.test.*`)
- Configuration files
- Type definitions (`*.d.ts`)
- E2E tests

### Viewing Coverage
```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html
```

## Troubleshooting

### Common Issues

#### "execCommand is not defined"
```typescript
// Mock is automatically set up in test/setup.ts
// If needed in specific tests:
document.execCommand = vi.fn(() => true);
```

#### "Cannot find module '@testing-library/jest-dom'"
```typescript
// Import is handled in test/setup.ts
// Ensure setup file is configured in vitest.config.ts
```

#### "Selection API not available"
```typescript
// Mock is available in test-utils
import { mockUtils } from '../../test/test-utils';
mockUtils.mockSelection();
```

### Performance Test Failures

If performance tests fail:
1. Check system load during test execution
2. Verify test environment consistency
3. Consider adjusting thresholds for CI environments
4. Use `performance.mark()` for detailed profiling

### E2E Test Failures

Common E2E issues:
1. **Timing issues**: Use `waitFor` instead of fixed timeouts
2. **Element not found**: Verify selectors and page state
3. **Browser differences**: Test in multiple browsers
4. **CI environment**: May need different configuration

### Debug Mode

```bash
# Run tests with debug output
DEBUG=1 npm run test

# Run specific test file
npm run test Editor.test.tsx

# Run with coverage and keep browser open
npm run test:e2e:headed
```

## Test Development Workflow

1. **Write failing test** (Red)
2. **Implement minimum code** to make it pass (Green)
3. **Refactor** while keeping tests green (Refactor)
4. **Update documentation** if needed
5. **Run full test suite** before committing

## Continuous Improvement

- Review test coverage regularly
- Add tests for bug fixes
- Update test utilities as patterns emerge
- Monitor performance test results
- Keep security tests updated with new attack vectors

---

For questions or improvements to this testing guide, please open an issue or submit a pull request.