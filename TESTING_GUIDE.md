# 🧪 ReddyFit Testing Guide

## Test Suite Overview

Comprehensive testing suite for the ReddyFit AI Fitness Dashboard including:
- ✅ **24 Unit Tests** - All passing
- ✅ **Integration Tests** - API and component integration
- ✅ **Error Handling Tests** - Edge cases and failure scenarios
- ✅ **Debugging Support** - Full error tracking and logging

---

## Quick Start

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Watch mode (auto-rerun on changes)
npm test -- --watch
```

---

## Test Structure

### Unit Tests (`src/test/`)

#### 1. **AI Service Tests** (`aiService.test.ts`)
Tests for OpenAI integration:

✅ **Chat Message Tests**
- Should send chat message and return AI response
- Should handle API errors gracefully
- Should include conversation history in request
- Should include user context in system prompt

✅ **Audio Transcription Tests**
- Should transcribe audio blob successfully
- Should handle transcription errors

**Coverage**: OpenAI GPT-4 API, Whisper API

#### 2. **Gemini Service Tests** (`geminiService.test.ts`)
Tests for Google Gemini Vision API:

✅ **Progress Photo Analysis**
- Should analyze progress photo and return body analysis
- Should handle malformed JSON response
- Should include previous analysis for comparison

✅ **Meal Photo Analysis**
- Should analyze meal photo and return nutrition data
- Should include user calorie and protein targets
- Should handle API errors gracefully

**Coverage**: Gemini Vision API, Image analysis

#### 3. **Error Handling Tests** (`errorHandling.test.ts`)
Comprehensive error scenario testing:

✅ **Network Errors**
- Network timeout errors
- 500 server errors
- 401 unauthorized errors
- 429 rate limit errors

✅ **Data Validation**
- Invalid image data
- Empty API responses
- Malformed JSON responses

✅ **Audio Processing Errors**
- Empty audio blob
- Unsupported audio format

✅ **Edge Cases**
- Extremely long messages (10,000+ chars)
- Special characters and emojis
- Zero and negative nutrition values

---

## Test Configuration

### `vitest.config.ts`
```typescript
{
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html']
  }
}
```

### Test Setup (`src/test/setup.ts`)
- Global mocks for `fetch`, `MediaRecorder`, `navigator.mediaDevices`
- Environment variable mocking
- Automatic cleanup after each test

---

## Error Handling Coverage

### API Errors
```typescript
// All services gracefully handle:
- Network timeouts
- Invalid API keys (401)
- Rate limits (429)
- Server errors (500)
- Malformed responses
```

### Data Validation
```typescript
// Input validation for:
- Image format and size
- Audio blob validity
- JSON parsing failures
- Null/undefined values
```

### User Experience
```typescript
// Fallback mechanisms:
- Default values for failed API calls
- User-friendly error messages
- Retry logic for transient errors
- Graceful degradation
```

---

## Debugging Features

### Console Logging
All services include detailed error logging:

```javascript
console.error('Error calling AI service:', error);
console.error('Error analyzing photo with Gemini:', error);
console.error('Error transcribing audio:', error);
```

### Error Messages
User-facing error messages:

| Error Type | User Message |
|------------|-------------|
| Mic Access Denied | "Could not access microphone. Please check permissions." |
| Audio Processing Failed | "Sorry, I couldn't process the audio. Please try again or type your message." |
| AI API Error | "Sorry, I encountered an error connecting to the AI. Please try again." |
| Photo Analysis Failed | "Sorry, I encountered an error analyzing your photo. Please try again." |

---

## Test Results Summary

```
✅ Test Files: 3 passed (3)
✅ Tests: 24 passed (24)
⏱️ Duration: ~1.4s
📊 Coverage: High
```

### Passing Tests Breakdown:
- **AI Service**: 6/6 ✅
- **Gemini Service**: 6/6 ✅
- **Error Handling**: 12/12 ✅

---

## Running Specific Tests

```bash
# Run only AI service tests
npm test -- aiService

# Run only error handling tests
npm test -- errorHandling

# Run only Gemini tests
npm test -- geminiService

# Run tests matching pattern
npm test -- --grep "should handle"
```

---

## Coverage Report

Generate detailed coverage:

```bash
npm run test:coverage
```

Coverage report locations:
- **Text**: Console output
- **HTML**: `coverage/index.html` (open in browser)
- **JSON**: `coverage/coverage-final.json`

---

## CI/CD Integration

### GitHub Actions
Tests run automatically on:
- Every push to `main`
- Every pull request
- Before deployment

Example workflow:
```yaml
- name: Run Tests
  run: npm test -- --run

- name: Generate Coverage
  run: npm run test:coverage
```

---

## Best Practices

### Writing New Tests

1. **Use descriptive test names**:
   ```typescript
   it('should handle 401 unauthorized errors', async () => {
     // Test implementation
   });
   ```

2. **Mock external dependencies**:
   ```typescript
   global.fetch = vi.fn().mockResolvedValue({...});
   ```

3. **Test both success and failure cases**:
   ```typescript
   // Success case
   it('should return data when API succeeds', ...);

   // Failure case
   it('should throw error when API fails', ...);
   ```

4. **Clean up after tests**:
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

---

## Known Issues & Limitations

### Current Limitations:
1. ⚠️ Azure Speech SDK integration not fully tested (requires real Azure credentials)
2. ⚠️ Real-time chat component tests pending (requires React Testing Library setup)
3. ⚠️ E2E tests not yet implemented

### Future Enhancements:
- [ ] Add E2E tests with Playwright/Cypress
- [ ] Increase coverage to 90%+
- [ ] Add performance benchmarks
- [ ] Add visual regression tests
- [ ] Add accessibility (a11y) tests

---

## Troubleshooting

### Test Failures

**Issue**: "Cannot find module '@testing-library/dom'"
```bash
# Solution:
npm install -D @testing-library/dom
```

**Issue**: "MediaRecorder is not defined"
```bash
# Solution: Already mocked in src/test/setup.ts
# Check setup file is loaded correctly
```

**Issue**: Tests timeout
```bash
# Solution: Increase timeout in vitest.config.ts
test: {
  testTimeout: 10000
}
```

---

## Manual Testing Checklist

### AI Chat Testing
- [ ] Type message → AI responds
- [ ] Voice record → Transcribed correctly
- [ ] Quick action buttons work
- [ ] Error messages display properly

### Photo Analysis Testing
- [ ] Upload progress photo → Body analysis shown
- [ ] Upload meal photo → Nutrition estimated
- [ ] AI Analyze button works
- [ ] Photos display correctly

### Meal Logging Testing
- [ ] Open meal modal
- [ ] Upload photo and analyze
- [ ] Manual entry of macros
- [ ] Daily totals update
- [ ] Confirmation message shown

### Error Scenarios
- [ ] No internet connection
- [ ] Invalid API key
- [ ] Mic permission denied
- [ ] Large file upload (>10MB)
- [ ] Malformed image file

---

## Performance Testing

### Metrics to Track:
```
- API response time: < 2s (95th percentile)
- UI interaction: < 100ms
- Image analysis: < 5s
- Audio transcription: < 3s
```

### Tools:
```bash
# Lighthouse (performance audit)
npm install -g lighthouse
lighthouse https://your-app-url

# Bundle analyzer
npm install -D rollup-plugin-visualizer
```

---

## Security Testing

### Checklist:
- [x] API keys not exposed in client code
- [x] User input sanitized
- [x] HTTPS only in production
- [x] No console.log of sensitive data
- [x] Error messages don't leak system info

---

## Contact & Support

For testing issues:
1. Check this guide
2. Review test output
3. Check GitHub Issues
4. Contact dev team

**Testing Status**: ✅ All systems operational
**Last Updated**: October 2025
**Test Suite Version**: 1.0.0
