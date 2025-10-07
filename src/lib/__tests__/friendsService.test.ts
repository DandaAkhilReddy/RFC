import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getUserFriends,
  getPendingRequests,
  areFriends,
  createFriendGroup,
  addGroupMember,
  removeGroupMember,
  getUserGroups,
  deleteFriendGroup
} from '../friendsService';
import { doc, getDoc, setDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore');
vi.mock('../firebase', () => ({
  db: {},
  Collections: {
    FRIENDS: 'friends',
    FRIEND_REQUESTS: 'friend_requests',
    FRIEND_GROUPS: 'friend_groups'
  }
}));

// Mock pointsService
vi.mock('../pointsService', () => ({
  awardSocialPoints: vi.fn()
}));

describe('Friends Service - Unit Tests', () => {
  const mockUserId = 'user-123';
  const mockFriendId = 'friend-456';
  const mockRequestId = 'request-789';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('sendFriendRequest', () => {
    it('should create a friend request successfully', async () => {
      // Mock no existing request
      vi.mocked(getDocs).mockResolvedValueOnce({
        empty: true,
        docs: []
      } as any);

      vi.mocked(setDoc).mockResolvedValueOnce(undefined);

      await sendFriendRequest(mockUserId, 'Test User', mockFriendId, 'photo.jpg');

      expect(setDoc).toHaveBeenCalled();
      const call = vi.mocked(setDoc).mock.calls[0];
      const requestData = call[1] as any;

      expect(requestData.from).toBe(mockUserId);
      expect(requestData.to).toBe(mockFriendId);
      expect(requestData.fromName).toBe('Test User');
      expect(requestData.status).toBe('pending');
    });

    it('should throw error if friend request already exists', async () => {
      // Mock existing request
      vi.mocked(getDocs).mockResolvedValueOnce({
        empty: false,
        docs: [{ data: () => ({ from: mockUserId, to: mockFriendId }) }]
      } as any);

      await expect(
        sendFriendRequest(mockUserId, 'Test User', mockFriendId)
      ).rejects.toThrow('Friend request already exists');
    });
  });

  describe('acceptFriendRequest', () => {
    it('should create bidirectional friendship', async () => {
      const mockRequest = {
        from: mockFriendId,
        to: mockUserId,
        status: 'pending',
        createdAt: '2025-01-01'
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockRequest
      } as any);

      vi.mocked(setDoc).mockResolvedValue(undefined);
      vi.mocked(updateDoc).mockResolvedValueOnce(undefined);

      await acceptFriendRequest(mockRequestId, mockUserId);

      // Should create 2 friend records (bidirectional)
      expect(setDoc).toHaveBeenCalledTimes(2);

      // Should update request status
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { status: 'accepted' }
      );
    });

    it('should throw error if request not found', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false
      } as any);

      await expect(
        acceptFriendRequest(mockRequestId, mockUserId)
      ).rejects.toThrow('Friend request not found');
    });

    it('should throw error if unauthorized to accept', async () => {
      const mockRequest = {
        from: mockFriendId,
        to: 'other-user',
        status: 'pending'
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockRequest
      } as any);

      await expect(
        acceptFriendRequest(mockRequestId, mockUserId)
      ).rejects.toThrow('Unauthorized to accept this request');
    });
  });

  describe('declineFriendRequest', () => {
    it('should update request status to declined', async () => {
      const mockRequest = {
        from: mockFriendId,
        to: mockUserId,
        status: 'pending'
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockRequest
      } as any);

      vi.mocked(updateDoc).mockResolvedValueOnce(undefined);

      await declineFriendRequest(mockRequestId, mockUserId);

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { status: 'declined' }
      );
    });

    it('should throw error if unauthorized to decline', async () => {
      const mockRequest = {
        from: mockFriendId,
        to: 'other-user',
        status: 'pending'
      };

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockRequest
      } as any);

      await expect(
        declineFriendRequest(mockRequestId, mockUserId)
      ).rejects.toThrow('Unauthorized to decline this request');
    });
  });

  describe('removeFriend', () => {
    it('should delete both friendship records', async () => {
      vi.mocked(deleteDoc).mockResolvedValue(undefined);

      await removeFriend(mockUserId, mockFriendId);

      // Should delete 2 friend records (bidirectional)
      expect(deleteDoc).toHaveBeenCalledTimes(2);
    });
  });

  describe('getUserFriends', () => {
    it('should return list of friend IDs', async () => {
      const mockFriends = [
        { data: () => ({ userId: mockUserId, friendId: 'friend-1', status: 'accepted' }) },
        { data: () => ({ userId: mockUserId, friendId: 'friend-2', status: 'accepted' }) },
        { data: () => ({ userId: mockUserId, friendId: 'friend-3', status: 'accepted' }) }
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        forEach: (callback: any) => mockFriends.forEach(callback)
      } as any);

      const result = await getUserFriends(mockUserId);

      expect(result).toEqual(['friend-1', 'friend-2', 'friend-3']);
    });

    it('should return empty array if no friends', async () => {
      vi.mocked(getDocs).mockResolvedValueOnce({
        forEach: () => {}
      } as any);

      const result = await getUserFriends(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('getPendingRequests', () => {
    it('should return list of pending friend requests', async () => {
      const mockRequests = [
        {
          data: () => ({
            id: 'req-1',
            from: 'user-1',
            to: mockUserId,
            status: 'pending',
            fromName: 'User One'
          })
        },
        {
          data: () => ({
            id: 'req-2',
            from: 'user-2',
            to: mockUserId,
            status: 'pending',
            fromName: 'User Two'
          })
        }
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        forEach: (callback: any) => mockRequests.forEach(callback)
      } as any);

      const result = await getPendingRequests(mockUserId);

      expect(result).toHaveLength(2);
      expect(result[0].fromName).toBe('User One');
    });
  });

  describe('areFriends', () => {
    it('should return true if users are friends', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ status: 'accepted' })
      } as any);

      const result = await areFriends(mockUserId, mockFriendId);

      expect(result).toBe(true);
    });

    it('should return false if users are not friends', async () => {
      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false
      } as any);

      const result = await areFriends(mockUserId, mockFriendId);

      expect(result).toBe(false);
    });
  });

  describe('Friend Groups', () => {
    describe('createFriendGroup', () => {
      it('should create a friend group with owner and members', async () => {
        vi.mocked(setDoc).mockResolvedValueOnce(undefined);

        const groupId = await createFriendGroup(
          mockUserId,
          'My Gym Buddies',
          'Weekend workout crew',
          ['friend-1', 'friend-2']
        );

        expect(setDoc).toHaveBeenCalled();
        const call = vi.mocked(setDoc).mock.calls[0];
        const groupData = call[1] as any;

        expect(groupData.name).toBe('My Gym Buddies');
        expect(groupData.ownerId).toBe(mockUserId);
        expect(groupData.members).toContain(mockUserId);
        expect(groupData.members).toContain('friend-1');
        expect(groupData.members).toContain('friend-2');
      });
    });

    describe('addGroupMember', () => {
      it('should add member to group if user is owner and member is friend', async () => {
        const mockGroup = {
          id: 'group-1',
          ownerId: mockUserId,
          members: [mockUserId]
        };

        vi.mocked(getDoc)
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => mockGroup
          } as any)
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ status: 'accepted' })
          } as any);

        vi.mocked(updateDoc).mockResolvedValueOnce(undefined);

        await addGroupMember('group-1', mockUserId, mockFriendId);

        expect(updateDoc).toHaveBeenCalled();
      });

      it('should throw error if not group owner', async () => {
        const mockGroup = {
          id: 'group-1',
          ownerId: 'other-user',
          members: ['other-user']
        };

        vi.mocked(getDoc).mockResolvedValueOnce({
          exists: () => true,
          data: () => mockGroup
        } as any);

        await expect(
          addGroupMember('group-1', mockUserId, mockFriendId)
        ).rejects.toThrow('Only group owner can add members');
      });
    });

    describe('removeGroupMember', () => {
      it('should remove member from group if user is owner', async () => {
        const mockGroup = {
          id: 'group-1',
          ownerId: mockUserId,
          members: [mockUserId, mockFriendId]
        };

        vi.mocked(getDoc).mockResolvedValueOnce({
          exists: () => true,
          data: () => mockGroup
        } as any);

        vi.mocked(updateDoc).mockResolvedValueOnce(undefined);

        await removeGroupMember('group-1', mockUserId, mockFriendId);

        expect(updateDoc).toHaveBeenCalled();
      });
    });

    describe('getUserGroups', () => {
      it('should return user\'s friend groups', async () => {
        const mockGroups = [
          {
            data: () => ({
              id: 'group-1',
              name: 'Gym Buddies',
              members: [mockUserId, 'friend-1']
            })
          },
          {
            data: () => ({
              id: 'group-2',
              name: 'Running Crew',
              members: [mockUserId, 'friend-2']
            })
          }
        ];

        vi.mocked(getDocs).mockResolvedValueOnce({
          forEach: (callback: any) => mockGroups.forEach(callback)
        } as any);

        const result = await getUserGroups(mockUserId);

        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('Gym Buddies');
      });
    });

    describe('deleteFriendGroup', () => {
      it('should delete group if user is owner', async () => {
        const mockGroup = {
          id: 'group-1',
          ownerId: mockUserId
        };

        vi.mocked(getDoc).mockResolvedValueOnce({
          exists: () => true,
          data: () => mockGroup
        } as any);

        vi.mocked(deleteDoc).mockResolvedValueOnce(undefined);

        await deleteFriendGroup('group-1', mockUserId);

        expect(deleteDoc).toHaveBeenCalled();
      });

      it('should throw error if not owner', async () => {
        const mockGroup = {
          id: 'group-1',
          ownerId: 'other-user'
        };

        vi.mocked(getDoc).mockResolvedValueOnce({
          exists: () => true,
          data: () => mockGroup
        } as any);

        await expect(
          deleteFriendGroup('group-1', mockUserId)
        ).rejects.toThrow('Only group owner can delete group');
      });
    });
  });
});
