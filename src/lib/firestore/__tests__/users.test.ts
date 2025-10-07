import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createUserProfile,
  getUserProfile,
  getUserBySlug,
  updatePrivacySettings,
  rotateQRSlug,
  updateStreak
} from '../users';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

vi.mock('firebase/firestore');
vi.mock('../../firebase', () => ({
  db: { _firestore: 'mock' }
}));

describe('Users Firestore Helpers - Unit Tests', () => {
  const mockUserId = 'test-user-123';
  const mockSlug = 'user-abc123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUserProfile', () => {
    it('should create a new user profile with default privacy settings', async () => {
      const profileData = {
        uid: mockUserId,
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg'
      };

      vi.mocked(doc).mockReturnValue({ id: mockUserId } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      await createUserProfile(profileData);

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          uid: mockUserId,
          email: 'test@example.com',
          displayName: 'Test User',
          streak: 0,
          privacy: expect.objectContaining({
            showWeek: true,
            showBfTrend: true,
            showLastInsight: true,
            showWeight: false,
            showBadges: true
          })
        })
      );
    });

    it('should generate a unique slug for the user', async () => {
      const profileData = {
        uid: mockUserId,
        email: 'test@example.com',
        displayName: 'Test User'
      };

      vi.mocked(doc).mockReturnValue({ id: mockUserId } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      await createUserProfile(profileData);

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          slug: expect.stringMatching(/^[a-z0-9-]+$/)
        })
      );
    });
  });

  describe('getUserProfile', () => {
    it('should return null if profile does not exist', async () => {
      vi.mocked(doc).mockReturnValue({ id: mockUserId } as any);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false
      } as any);

      const result = await getUserProfile(mockUserId);

      expect(result).toBeNull();
    });

    it('should return user profile if exists', async () => {
      const mockProfile = {
        uid: mockUserId,
        email: 'test@example.com',
        displayName: 'Test User',
        slug: mockSlug,
        streak: 5
      };

      vi.mocked(doc).mockReturnValue({ id: mockUserId } as any);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => mockProfile
      } as any);

      const result = await getUserProfile(mockUserId);

      expect(result).toMatchObject({
        uid: mockUserId,
        email: 'test@example.com',
        streak: 5
      });
    });
  });

  describe('getUserBySlug', () => {
    it('should find user by slug', async () => {
      const mockProfile = {
        uid: mockUserId,
        email: 'test@example.com',
        slug: mockSlug
      };

      vi.mocked(collection).mockReturnValue('userProfiles' as any);
      vi.mocked(query).mockReturnValue({} as any);
      vi.mocked(where).mockReturnValue({} as any);
      vi.mocked(getDocs).mockResolvedValue({
        docs: [{
          id: mockUserId,
          data: () => mockProfile
        }]
      } as any);

      const result = await getUserBySlug(mockSlug);

      expect(result).toMatchObject({
        uid: mockUserId,
        slug: mockSlug
      });
    });

    it('should return null if slug not found', async () => {
      vi.mocked(collection).mockReturnValue('userProfiles' as any);
      vi.mocked(query).mockReturnValue({} as any);
      vi.mocked(getDocs).mockResolvedValue({
        docs: []
      } as any);

      const result = await getUserBySlug('non-existent-slug');

      expect(result).toBeNull();
    });
  });

  describe('updatePrivacySettings', () => {
    it('should update user privacy settings', async () => {
      const privacySettings = {
        showWeek: false,
        showBfTrend: true,
        showLastInsight: false,
        showWeight: true,
        showBadges: true
      };

      vi.mocked(doc).mockReturnValue({ id: mockUserId } as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await updatePrivacySettings(mockUserId, privacySettings);

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          privacy: privacySettings
        })
      );
    });
  });

  describe('rotateQRSlug', () => {
    it('should generate a new slug for user', async () => {
      vi.mocked(doc).mockReturnValue({ id: mockUserId } as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      const newSlug = await rotateQRSlug(mockUserId);

      expect(newSlug).toMatch(/^[a-z0-9-]+$/);
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          slug: newSlug
        })
      );
    });

    it('should generate different slug each time', async () => {
      vi.mocked(doc).mockReturnValue({ id: mockUserId } as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      const slug1 = await rotateQRSlug(mockUserId);
      const slug2 = await rotateQRSlug(mockUserId);

      expect(slug1).not.toBe(slug2);
    });
  });

  describe('updateStreak', () => {
    it('should update user streak count', async () => {
      vi.mocked(doc).mockReturnValue({ id: mockUserId } as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await updateStreak(mockUserId, 7);

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          streak: 7
        })
      );
    });

    it('should handle streak of 0', async () => {
      vi.mocked(doc).mockReturnValue({ id: mockUserId } as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await updateStreak(mockUserId, 0);

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          streak: 0
        })
      );
    });
  });
});
