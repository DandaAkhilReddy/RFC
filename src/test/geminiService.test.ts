import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyzeProgressPhotoWithGemini, analyzeMealPhotoWithGemini } from '../lib/geminiService';
import type { UserContext } from '../lib/geminiService';

describe('Gemini Service - Unit Tests', () => {
  const mockUserContext: UserContext = {
    name: 'Test User',
    email: 'test@example.com',
    startWeight: 85,
    currentWeight: 80,
    targetWeight: 70,
    fitnessGoal: 'Six-Pack',
    currentLevel: 'Intermediate',
    dailyCalories: 1500,
    dailyProtein: 150,
  };

  const mockImageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeProgressPhotoWithGemini', () => {
    it('should analyze progress photo and return body analysis', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    bodyFat: 18,
                    muscleMass: 'Good muscle definition',
                    posture: 'Excellent alignment',
                    faceAnalysis: 'Lean face with visible cheekbones',
                    recommendations: ['Keep training hard', 'Increase protein'],
                    comparison: 'Visible improvement',
                  }),
                },
              ],
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await analyzeProgressPhotoWithGemini(mockImageBase64, mockUserContext);

      expect(result.bodyFat).toBe(18);
      expect(result.muscleMass).toBe('Good muscle definition');
      expect(result.posture).toBe('Excellent alignment');
      expect(result.faceAnalysis).toBe('Lean face with visible cheekbones');
      expect(result.recommendations).toHaveLength(2);
    });

    it('should handle malformed JSON response', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Invalid JSON response' }],
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await analyzeProgressPhotoWithGemini(mockImageBase64, mockUserContext);

      expect(result.bodyFat).toBe(20); // Fallback value
      expect(result.muscleMass).toBe('Analysis in progress');
    });

    it('should include previous analysis for comparison', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    bodyFat: 16,
                    muscleMass: 'Improved',
                    posture: 'Good',
                    recommendations: ['Continue'],
                    comparison: '2% body fat reduction',
                  }),
                },
              ],
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const previousAnalysis = { bodyFat: 18 };
      const result = await analyzeProgressPhotoWithGemini(
        mockImageBase64,
        mockUserContext,
        previousAnalysis
      );

      expect(result.comparison).toBe('2% body fat reduction');

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      const promptText = requestBody.contents[0].parts[0].text;

      expect(promptText).toContain('Previous Analysis');
      expect(promptText).toContain('18');
    });
  });

  describe('analyzeMealPhotoWithGemini', () => {
    it('should analyze meal photo and return nutrition data', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    calories: 450,
                    protein: 35,
                    carbs: 40,
                    fats: 18,
                    quality: 4,
                    foods: ['Grilled chicken', 'Brown rice', 'Broccoli'],
                    recommendations: ['Great protein!', 'Add more veggies'],
                  }),
                },
              ],
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await analyzeMealPhotoWithGemini(mockImageBase64, mockUserContext);

      expect(result.calories).toBe(450);
      expect(result.protein).toBe(35);
      expect(result.carbs).toBe(40);
      expect(result.fats).toBe(18);
      expect(result.quality).toBe(4);
      expect(result.foods).toHaveLength(3);
      expect(result.recommendations).toHaveLength(2);
    });

    it('should include user calorie and protein targets in prompt', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    calories: 400,
                    protein: 30,
                    carbs: 35,
                    fats: 15,
                    quality: 3,
                    foods: ['Test food'],
                    recommendations: ['Test'],
                  }),
                },
              ],
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await analyzeMealPhotoWithGemini(mockImageBase64, mockUserContext);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      const promptText = requestBody.contents[0].parts[0].text;

      expect(promptText).toContain(mockUserContext.dailyCalories.toString());
      expect(promptText).toContain(mockUserContext.dailyProtein.toString());
    });

    it('should handle API errors gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: { message: 'API Error' },
        }),
      } as Response);

      await expect(
        analyzeMealPhotoWithGemini(mockImageBase64, mockUserContext)
      ).rejects.toThrow();
    });
  });
});
