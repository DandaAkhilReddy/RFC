import { describe, it, expect, vi } from 'vitest';
import { sendChatMessage, transcribeAudio } from '../lib/aiService';
import { analyzeProgressPhotoWithGemini, analyzeMealPhotoWithGemini } from '../lib/geminiService';

describe('Error Handling - Integration Tests', () => {
  const mockUserContext = {
    name: 'Test',
    email: 'test@test.com',
    startWeight: 80,
    currentWeight: 75,
    targetWeight: 70,
    fitnessGoal: 'Test',
    currentLevel: 'Test',
    dailyCalories: 1500,
    dailyProtein: 150,
  };

  describe('Network Errors', () => {
    it('should handle network timeout errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network timeout'));

      await expect(
        sendChatMessage('test', mockUserContext)
      ).rejects.toThrow('Network timeout');
    });

    it('should handle 500 server errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'Internal Server Error' } }),
      } as Response);

      await expect(
        sendChatMessage('test', mockUserContext)
      ).rejects.toThrow();
    });

    it('should handle 401 unauthorized errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Invalid API key' } }),
      } as Response);

      await expect(
        sendChatMessage('test', mockUserContext)
      ).rejects.toThrow();
    });

    it('should handle 429 rate limit errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: 'Rate limit exceeded' } }),
      } as Response);

      await expect(
        sendChatMessage('test', mockUserContext)
      ).rejects.toThrow();
    });
  });

  describe('Data Validation', () => {
    it('should handle invalid image data', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: { message: 'Invalid image format' } }),
      } as Response);

      await expect(
        analyzeProgressPhotoWithGemini('invalid-base64', mockUserContext)
      ).rejects.toThrow();
    });

    it('should handle empty responses', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await expect(
        sendChatMessage('test', mockUserContext)
      ).rejects.toThrow();
    });

    it('should handle malformed JSON in meal analysis', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'Not valid JSON' }],
              },
            },
          ],
        }),
      } as Response);

      const result = await analyzeMealPhotoWithGemini('data:image/jpeg;base64,test', mockUserContext);

      // Should return fallback values
      expect(result.calories).toBe(400);
      expect(result.quality).toBe(3);
      expect(result.foods).toEqual(['Analysis in progress']);
    });
  });

  describe('Audio Processing Errors', () => {
    it('should handle empty audio blob', async () => {
      const emptyBlob = new Blob([], { type: 'audio/webm' });

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: { message: 'No audio data' } }),
      } as Response);

      await expect(transcribeAudio(emptyBlob)).rejects.toThrow();
    });

    it('should handle unsupported audio format', async () => {
      const blob = new Blob(['data'], { type: 'audio/unsupported' });

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: { message: 'Unsupported format' } }),
      } as Response);

      await expect(transcribeAudio(blob)).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely long messages', async () => {
      const longMessage = 'a'.repeat(10000);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Response' } }],
        }),
      } as Response);

      const result = await sendChatMessage(longMessage, mockUserContext);
      expect(result).toBeDefined();
    });

    it('should handle special characters in messages', async () => {
      const specialMessage = '🚀 Test with émojis & spëcial çhars!';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Response' } }],
        }),
      } as Response);

      const result = await sendChatMessage(specialMessage, mockUserContext);
      expect(result).toBeDefined();
    });

    it('should handle zero and negative nutrition values', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      calories: -100,
                      protein: 0,
                      carbs: -50,
                      fats: 0,
                      quality: 0,
                      foods: [],
                      recommendations: [],
                    }),
                  },
                ],
              },
            },
          ],
        }),
      } as Response);

      const result = await analyzeMealPhotoWithGemini('data:image/jpeg;base64,test', mockUserContext);

      // Should handle negative/zero values
      expect(result).toBeDefined();
      expect(result.calories).toBeDefined();
    });
  });
});
