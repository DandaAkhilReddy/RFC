import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_OPENAI_API_KEY: 'test-openai-key',
    VITE_GEMINI_API_KEY: 'test-gemini-key',
    VITE_AZURE_SPEECH_KEY: 'test-azure-key',
    VITE_AZURE_SPEECH_REGION: 'eastus',
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

// Mock MediaRecorder
global.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  ondataavailable: null,
  onstop: null,
})) as any;

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    }),
  },
  writable: true,
});
