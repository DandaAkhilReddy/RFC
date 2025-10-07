import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  awardMealPoints,
  awardWorkoutPoints,
  getUserPoints,
  awardStreakPoints,
  awardGoalPoints,
  awardSocialPoints,
  POINTS
} from '../pointsService';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore');
vi.mock('../firebase', () => ({
  db: {},
  Collections: {
    USER_POINTS: 'user_points'
  }
}));

describe('Points Service - Unit Tests', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('awardMealPoints', () => {
    it('should award 30 points for meal without photo', async () => {
      const mockUserPoints = {
        userId: mockUserId,
        totalPoints: 100,
        weeklyPoints: 50,
        monthlyPoints: 75
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockUserPoints
      } as any);

      vi.mocked(setDoc).mockResolvedValueOnce(undefined);

      await awardMealPoints(mockUserId, false);

      expect(setDoc).toHaveBeenCalled();
      const call = vi.mocked(setDoc).mock.calls[0];
      const updatedPoints = call[1] as any;

      // Should add 30 points (MEAL_LOGGED)
      expect(updatedPoints.totalPoints).toBe(130);
    });

    it('should award 50 points for meal with photo', async () => {
      const mockUserPoints = {
        userId: mockUserId,
        totalPoints: 100,
        weeklyPoints: 50,
        monthlyPoints: 75
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockUserPoints
      } as any);

      vi.mocked(setDoc).mockResolvedValueOnce(undefined);

      await awardMealPoints(mockUserId, true);

      expect(setDoc).toHaveBeenCalled();
      const call = vi.mocked(setDoc).mock.calls[0];
      const updatedPoints = call[1] as any;

      // Should add 30 (MEAL_LOGGED) + 20 (photo bonus) = 50 points
      expect(updatedPoints.totalPoints).toBe(150);
    });

    it('should create new user points record if none exists', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false
      } as any);

      vi.mocked(setDoc).mockResolvedValueOnce(undefined);

      await awardMealPoints(mockUserId, false);

      expect(setDoc).toHaveBeenCalled();
      const call = vi.mocked(setDoc).mock.calls[0];
      const newPoints = call[1] as any;

      expect(newPoints.userId).toBe(mockUserId);
      expect(newPoints.totalPoints).toBe(30);
    });
  });

  describe('awardWorkoutPoints', () => {
    it('should award 50 base points for workout', async () => {
      const mockUserPoints = {
        userId: mockUserId,
        totalPoints: 100,
        weeklyPoints: 50,
        monthlyPoints: 75
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockUserPoints
      } as any);

      vi.mocked(setDoc).mockResolvedValueOnce(undefined);

      await awardWorkoutPoints(mockUserId, 300);

      expect(setDoc).toHaveBeenCalled();
      const call = vi.mocked(setDoc).mock.calls[0];
      const updatedPoints = call[1] as any;

      expect(updatedPoints.totalPoints).toBe(150); // 100 + 50
    });

    it('should award bonus points for 500+ calories burned', async () => {
      const mockUserPoints = {
        userId: mockUserId,
        totalPoints: 100,
        weeklyPoints: 50,
        monthlyPoints: 75
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockUserPoints
      } as any);

      vi.mocked(setDoc).mockResolvedValueOnce(undefined);

      await awardWorkoutPoints(mockUserId, 600);

      expect(setDoc).toHaveBeenCalled();
      const call = vi.mocked(setDoc).mock.calls[0];
      const updatedPoints = call[1] as any;

      // 50 (base) + 25 (500+ cal bonus) = 75
      expect(updatedPoints.totalPoints).toBe(175);
    });

    it('should award max bonus for 1000+ calories burned', async () => {
      const mockUserPoints = {
        userId: mockUserId,
        totalPoints: 100,
        weeklyPoints: 50,
        monthlyPoints: 75
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockUserPoints
      } as any);

      vi.mocked(setDoc).mockResolvedValueOnce(undefined);

      await awardWorkoutPoints(mockUserId, 1200);

      expect(setDoc).toHaveBeenCalled();
      const call = vi.mocked(setDoc).mock.calls[0];
      const updatedPoints = call[1] as any;

      // 50 (base) + 25 (500+ bonus) + 50 (1000+ bonus) = 125
      expect(updatedPoints.totalPoints).toBe(225);
    });
  });

  describe('getUserPoints', () => {
    it('should return user points if they exist', async () => {
      const mockUserPoints = {
        userId: mockUserId,
        totalPoints: 500,
        weeklyPoints: 150,
        monthlyPoints: 300
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockUserPoints
      } as any);

      const result = await getUserPoints(mockUserId);

      expect(result).toEqual(mockUserPoints);
    });

    it('should return default points if user has no points record', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false
      } as any);

      const result = await getUserPoints(mockUserId);

      expect(result.userId).toBe(mockUserId);
      expect(result.totalPoints).toBe(0);
      expect(result.weeklyPoints).toBe(0);
      expect(result.monthlyPoints).toBe(0);
    });
  });

  describe('awardStreakPoints', () => {
    it('should award 20 points for daily streak', async () => {
      const mockUserPoints = {
        userId: mockUserId,
        totalPoints: 100,
        weeklyPoints: 50,
        monthlyPoints: 75
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockUserPoints
      } as any);

      vi.mocked(setDoc).mockResolvedValueOnce(undefined);

      await awardStreakPoints(mockUserId, 1);

      expect(setDoc).toHaveBeenCalled();
      const call = vi.mocked(setDoc).mock.calls[0];
      const updatedPoints = call[1] as any;

      expect(updatedPoints.totalPoints).toBe(120); // 100 + 20
    });

    it('should award 100 points for 7-day streak', async () => {
      const mockUserPoints = {
        userId: mockUserId,
        totalPoints: 100,
        weeklyPoints: 50,
        monthlyPoints: 75
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockUserPoints
      } as any);

      vi.mocked(setDoc).mockResolvedValueOnce(undefined);

      await awardStreakPoints(mockUserId, 7);

      expect(setDoc).toHaveBeenCalled();
      const call = vi.mocked(setDoc).mock.calls[0];
      const updatedPoints = call[1] as any;

      expect(updatedPoints.totalPoints).toBe(200); // 100 + 100
    });

    it('should award 500 points for 30-day streak', async () => {
      const mockUserPoints = {
        userId: mockUserId,
        totalPoints: 100,
        weeklyPoints: 50,
        monthlyPoints: 75
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockUserPoints
      } as any);

      vi.mocked(setDoc).mockResolvedValueOnce(undefined);

      await awardStreakPoints(mockUserId, 30);

      expect(setDoc).toHaveBeenCalled();
      const call = vi.mocked(setDoc).mock.calls[0];
      const updatedPoints = call[1] as any;

      expect(updatedPoints.totalPoints).toBe(600); // 100 + 500
    });
  });

  describe('awardGoalPoints', () => {
    it('should award 100 points for hitting a goal', async () => {
      const mockUserPoints = {
        userId: mockUserId,
        totalPoints: 100,
        weeklyPoints: 50,
        monthlyPoints: 75
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockUserPoints
      } as any);

      vi.mocked(setDoc).mockResolvedValueOnce(undefined);

      await awardGoalPoints(mockUserId, 'calories');

      expect(setDoc).toHaveBeenCalled();
      const call = vi.mocked(setDoc).mock.calls[0];
      const updatedPoints = call[1] as any;

      expect(updatedPoints.totalPoints).toBe(200); // 100 + 100
    });
  });

  describe('awardSocialPoints', () => {
    it('should award 50 points for social actions', async () => {
      const mockUserPoints = {
        userId: mockUserId,
        totalPoints: 100,
        weeklyPoints: 50,
        monthlyPoints: 75
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockUserPoints
      } as any);

      vi.mocked(setDoc).mockResolvedValueOnce(undefined);

      await awardSocialPoints(mockUserId, 'Friend request accepted');

      expect(setDoc).toHaveBeenCalled();
      const call = vi.mocked(setDoc).mock.calls[0];
      const updatedPoints = call[1] as any;

      expect(updatedPoints.totalPoints).toBe(150); // 100 + 50
    });
  });

  describe('Points Constants', () => {
    it('should have correct point values', () => {
      expect(POINTS.DAILY_WORKOUT).toBe(50);
      expect(POINTS.MEAL_LOGGED).toBe(30);
      expect(POINTS.PROGRESS_PHOTO).toBe(40);
      expect(POINTS.DAILY_STREAK).toBe(20);
      expect(POINTS.WEEK_STREAK).toBe(100);
      expect(POINTS.MONTH_STREAK).toBe(500);
      expect(POINTS.GOAL_HIT).toBe(100);
      expect(POINTS.WEIGHT_MILESTONE).toBe(200);
      expect(POINTS.FRIEND_INVITE).toBe(50);
      expect(POINTS.CHALLENGE_COMPLETE).toBe(150);
    });
  });
});
