import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendChatMessage, transcribeAudio } from '../lib/aiService';
import type { UserContext } from '../lib/aiService';

describe('AI Service - Unit Tests', () => {
  const mockUserContext: UserContext = {
    name: 'Test User',
    email: 'test@example.com',
    startWeight: 85,
    currentWeight: 80,
    targetWeight: 70,
    fitnessGoal: 'Weight Loss',
    currentLevel: 'Beginner',
    dailyCalories: 1500,
    dailyProtein: 150,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendChatMessage', () => {
    it('should send chat message and return AI response', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Great question! Here is my fitness advice...',
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await sendChatMessage(
        'What should I eat today?',
        mockUserContext
      );

      expect(result).toBe('Great question! Here is my fitness advice...');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: { message: 'API Error' },
        }),
      } as Response);

      await expect(
        sendChatMessage('Test message', mockUserContext)
      ).rejects.toThrow();
    });

    it('should include conversation history in request', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Response' } }],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const conversationHistory = [
        { role: 'user' as const, content: 'Previous question' },
        { role: 'assistant' as const, content: 'Previous answer' },
      ];

      await sendChatMessage('New question', mockUserContext, conversationHistory);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.messages).toHaveLength(4); // system + 2 history messages + new message
    });

    it('should include user context in system prompt', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Response' } }],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await sendChatMessage('Test', mockUserContext);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      const systemMessage = requestBody.messages[0].content;

      expect(systemMessage).toContain(mockUserContext.name);
      expect(systemMessage).toContain(mockUserContext.currentWeight.toString());
      expect(systemMessage).toContain(mockUserContext.targetWeight.toString());
    });
  });

  describe('transcribeAudio', () => {
    it('should transcribe audio blob successfully', async () => {
      const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });
      const mockResponse = {
        text: 'Transcribed text from audio',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await transcribeAudio(mockBlob);

      expect(result).toBe('Transcribed text from audio');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/audio/transcriptions',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should handle transcription errors', async () => {
      const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: { message: 'Transcription failed' },
        }),
      } as Response);

      await expect(transcribeAudio(mockBlob)).rejects.toThrow();
    });
  });
});
