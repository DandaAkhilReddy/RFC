# 🧪 ReddyFit Testing Guide

## Overview
ReddyFit uses Vitest, React Testing Library, and Playwright for comprehensive test coverage.

## Quick Start
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npx playwright test
```

## Test Structure
- `src/lib/firestore/__tests__/` - Firestore helper tests
- `src/lib/__tests__/` - Service layer tests  
- `src/components/**/__tests__/` - Component tests
- `e2e/` - End-to-end tests

## Coverage Targets
- Daily Scan helpers: 90%+
- Service layer: 85%+
- Components: 70%+
- Overall: 80%+

## Writing Tests
See existing tests in `__tests__` directories for examples.

For detailed documentation, see inline comments in test files.
