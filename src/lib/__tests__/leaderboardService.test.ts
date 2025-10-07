import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getFriendsLeaderboard,
  getCityLeaderboard,
  getCountryLeaderboard,
  getGlobalLeaderboard,
  getLeaderboardByScope,
  getUserRank
} from '../leaderboardService';
import { getDoc, getDocs } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore');
vi.mock('../firebase', () => ({
  db: {}
}));

// Mock friendsService
vi.mock('../friendsService', () => ({
  getUserFriends: vi.fn()
}));

// Mock pointsService
vi.mock('../pointsService', () => ({
  getLeaderboard: vi.fn()
}));

import { getUserFriends } from '../friendsService';
import { getLeaderboard } from '../pointsService';

describe('Leaderboard Service - Unit Tests', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const mockUserProfile = {
    displayName: 'Test User',
    photoURL: 'photo.jpg'
  };

  const mockLocation = {
    city: 'Seattle',
    country: 'USA'
  };

  const mockUserPoints = {
    userId: 'user-1',
    totalPoints: 500,
    weeklyPoints: 150,
    monthlyPoints: 300
  };

  describe('getFriendsLeaderboard', () => {
    it('should return friends leaderboard with enriched profiles', async () => {
      const mockFriends = ['friend-1', 'friend-2'];

      vi.mocked(getUserFriends).mockResolvedValueOnce(mockFriends);
      vi.mocked(getLeaderboard).mockResolvedValueOnce([
        { userId: mockUserId, totalPoints: 500, weeklyPoints: 150, monthlyPoints: 300 },
        { userId: 'friend-1', totalPoints: 450, weeklyPoints: 140, monthlyPoints: 280 },
        { userId: 'friend-2', totalPoints: 400, weeklyPoints: 130, monthlyPoints: 260 }
      ] as any);

      // Mock profile lookups
      vi.mocked(getDoc)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ displayName: 'Current User', photoURL: 'photo1.jpg' })
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ city: 'Seattle', country: 'USA' })
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ displayName: 'Friend One', photoURL: 'photo2.jpg' })
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ city: 'Seattle', country: 'USA' })
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ displayName: 'Friend Two', photoURL: 'photo3.jpg' })
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ city: 'Portland', country: 'USA' })
        } as any);

      const result = await getFriendsLeaderboard(mockUserId, 'weekly', 50);

      expect(result).toHaveLength(3);
      expect(result[0].rank).toBe(1);
      expect(result[0].userId).toBe(mockUserId);
      expect(result[0].isCurrentUser).toBe(true);
      expect(result[1].rank).toBe(2);
      expect(result[2].rank).toBe(3);
    });

    it('should return only current user if no friends', async () => {
      vi.mocked(getUserFriends).mockResolvedValueOnce([]);

      vi.mocked(getDoc)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ userId: mockUserId, totalPoints: 200, weeklyPoints: 100, monthlyPoints: 150 })
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockUserProfile
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockLocation
        } as any);

      const result = await getFriendsLeaderboard(mockUserId, 'weekly', 50);

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(mockUserId);
      expect(result[0].rank).toBe(1);
    });
  });

  describe('getCityLeaderboard', () => {
    it('should return leaderboard for users in same city', async () => {
      // Mock current user location
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ city: 'Seattle', country: 'USA' })
      } as any);

      // Mock city users query
      const mockCityUsers = [
        { id: 'user-1', data: () => ({ city: 'Seattle', country: 'USA' }) },
        { id: 'user-2', data: () => ({ city: 'Seattle', country: 'USA' }) },
        { id: 'user-3', data: () => ({ city: 'Seattle', country: 'USA' }) }
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        forEach: (callback: any) => mockCityUsers.forEach(callback)
      } as any);

      // Mock points query
      const mockPointsDocs = [
        { data: () => ({ userId: 'user-1', totalPoints: 500, weeklyPoints: 150, monthlyPoints: 300 }) },
        { data: () => ({ userId: 'user-2', totalPoints: 450, weeklyPoints: 140, monthlyPoints: 280 }) },
        { data: () => ({ userId: 'user-3', totalPoints: 400, weeklyPoints: 130, monthlyPoints: 260 }) }
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        forEach: (callback: any) => mockPointsDocs.forEach(callback)
      } as any);

      // Mock profile lookups (simplified for test)
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ displayName: 'User', photoURL: 'photo.jpg' })
      } as any);

      const result = await getCityLeaderboard(mockUserId, 'weekly', 50);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].rank).toBe(1);
    });

    it('should return empty array if user has no city', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false
      } as any);

      const result = await getCityLeaderboard(mockUserId, 'weekly', 50);

      expect(result).toEqual([]);
    });
  });

  describe('getCountryLeaderboard', () => {
    it('should return leaderboard for users in same country', async () => {
      // Mock current user location
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ city: 'Seattle', country: 'USA' })
      } as any);

      // Mock country users query
      const mockCountryUsers = [
        { id: 'user-1' },
        { id: 'user-2' },
        { id: 'user-3' }
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        forEach: (callback: any) => mockCountryUsers.forEach(callback)
      } as any);

      // Mock points query
      const mockPointsDocs = [
        { data: () => ({ userId: 'user-1', totalPoints: 500, weeklyPoints: 150, monthlyPoints: 300 }) },
        { data: () => ({ userId: 'user-2', totalPoints: 450, weeklyPoints: 140, monthlyPoints: 280 }) },
        { data: () => ({ userId: 'user-3', totalPoints: 400, weeklyPoints: 130, monthlyPoints: 260 }) }
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        forEach: (callback: any) => mockPointsDocs.forEach(callback)
      } as any);

      // Mock profile lookups
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ displayName: 'User', photoURL: 'photo.jpg' })
      } as any);

      const result = await getCountryLeaderboard(mockUserId, 'weekly', 50);

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getGlobalLeaderboard', () => {
    it('should return global leaderboard', async () => {
      vi.mocked(getLeaderboard).mockResolvedValueOnce([
        { userId: 'user-1', totalPoints: 1000, weeklyPoints: 300, monthlyPoints: 600 },
        { userId: 'user-2', totalPoints: 900, weeklyPoints: 280, monthlyPoints: 550 },
        { userId: 'user-3', totalPoints: 800, weeklyPoints: 260, monthlyPoints: 500 }
      ] as any);

      // Mock profile lookups
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ displayName: 'User', photoURL: 'photo.jpg' })
      } as any);

      const result = await getGlobalLeaderboard(mockUserId, 'weekly', 100);

      expect(result).toHaveLength(3);
      expect(result[0].points).toBeGreaterThan(result[1].points);
      expect(result[1].points).toBeGreaterThan(result[2].points);
    });
  });

  describe('getLeaderboardByScope', () => {
    it('should call getFriendsLeaderboard for friends scope', async () => {
      vi.mocked(getUserFriends).mockResolvedValueOnce([]);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ totalPoints: 100 })
      } as any);

      const result = await getLeaderboardByScope('friends', mockUserId, 'weekly', 50);

      expect(getUserFriends).toHaveBeenCalled();
    });

    it('should call getGlobalLeaderboard for global scope', async () => {
      vi.mocked(getLeaderboard).mockResolvedValueOnce([]);

      await getLeaderboardByScope('global', mockUserId, 'weekly', 50);

      expect(getLeaderboard).toHaveBeenCalledWith('global', 'weekly');
    });
  });

  describe('getUserRank', () => {
    it('should return user rank and total users', async () => {
      vi.mocked(getUserFriends).mockResolvedValueOnce(['friend-1']);
      vi.mocked(getLeaderboard).mockResolvedValueOnce([
        { userId: 'friend-1', totalPoints: 500, weeklyPoints: 150, monthlyPoints: 300 },
        { userId: mockUserId, totalPoints: 450, weeklyPoints: 140, monthlyPoints: 280 }
      ] as any);

      // Mock profile lookups
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ displayName: 'User', photoURL: 'photo.jpg' })
      } as any);

      const result = await getUserRank(mockUserId, 'friends', 'weekly');

      expect(result).not.toBeNull();
      expect(result?.rank).toBe(2);
      expect(result?.total).toBe(2);
      expect(result?.points).toBe(140);
    });

    it('should return null if user not found', async () => {
      vi.mocked(getUserFriends).mockResolvedValueOnce([]);
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false
      } as any);

      const result = await getUserRank(mockUserId, 'friends', 'weekly');

      expect(result).toBeNull();
    });
  });

  describe('Period Filtering', () => {
    it('should use weekly points for weekly period', async () => {
      vi.mocked(getUserFriends).mockResolvedValueOnce([]);
      vi.mocked(getDoc)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ userId: mockUserId, totalPoints: 1000, weeklyPoints: 150, monthlyPoints: 500 })
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockUserProfile
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockLocation
        } as any);

      const result = await getFriendsLeaderboard(mockUserId, 'weekly', 50);

      expect(result[0].points).toBe(150); // weekly points
    });

    it('should use monthly points for monthly period', async () => {
      vi.mocked(getUserFriends).mockResolvedValueOnce([]);
      vi.mocked(getDoc)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ userId: mockUserId, totalPoints: 1000, weeklyPoints: 150, monthlyPoints: 500 })
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockUserProfile
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockLocation
        } as any);

      const result = await getFriendsLeaderboard(mockUserId, 'monthly', 50);

      expect(result[0].points).toBe(500); // monthly points
    });

    it('should use total points for all-time period', async () => {
      vi.mocked(getUserFriends).mockResolvedValueOnce([]);
      vi.mocked(getDoc)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ userId: mockUserId, totalPoints: 1000, weeklyPoints: 150, monthlyPoints: 500 })
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockUserProfile
        } as any)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockLocation
        } as any);

      const result = await getFriendsLeaderboard(mockUserId, 'allTime', 50);

      expect(result[0].points).toBe(1000); // total points
    });
  });
});
