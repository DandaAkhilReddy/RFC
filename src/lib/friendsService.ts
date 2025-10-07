// Friends Management Service for ReddyFit Social Competition
// Handles friend requests, connections, and groups

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';
import { awardSocialPoints } from './pointsService';

export interface Friend {
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  createdAt: string;
  acceptedAt?: string;
}

export interface FriendRequest {
  id: string;
  from: string;
  fromName: string;
  fromPhoto?: string;
  to: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface FriendGroup {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Send a friend request
 */
export async function sendFriendRequest(
  fromUserId: string,
  fromUserName: string,
  toUserId: string,
  fromUserPhoto?: string
): Promise<void> {
  try {
    // Prevent self-friendship
    if (fromUserId === toUserId) {
      throw new Error('Cannot send friend request to yourself');
    }

    // Check if already friends
    const alreadyFriends = await areFriends(fromUserId, toUserId);
    if (alreadyFriends) {
      throw new Error('Already friends with this user');
    }

    // Check if already friends or request exists (bidirectional)
    const existingRequest1 = await getFriendRequest(fromUserId, toUserId);
    const existingRequest2 = await getFriendRequest(toUserId, fromUserId);
    if (existingRequest1 || existingRequest2) {
      throw new Error('Friend request already exists');
    }

    const requestRef = doc(collection(db, 'friend_requests'));
    await setDoc(requestRef, {
      id: requestRef.id,
      from: fromUserId,
      fromName: fromUserName,
      fromPhoto: fromUserPhoto || '',
      to: toUserId,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    console.log(`✅ Friend request sent from ${fromUserId} to ${toUserId}`);
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(requestId: string, userId: string): Promise<void> {
  try {
    const requestRef = doc(db, 'friend_requests', requestId);
    const requestDoc = await getDoc(requestRef);

    if (!requestDoc.exists()) {
      throw new Error('Friend request not found');
    }

    const request = requestDoc.data() as FriendRequest;

    // Verify this request is for the current user
    if (request.to !== userId) {
      throw new Error('Unauthorized to accept this request');
    }

    // Create bidirectional friendship
    const friend1Ref = doc(db, 'friends', `${request.from}_${request.to}`);
    const friend2Ref = doc(db, 'friends', `${request.to}_${request.from}`);

    const now = new Date().toISOString();

    await setDoc(friend1Ref, {
      userId: request.from,
      friendId: request.to,
      status: 'accepted',
      createdAt: request.createdAt,
      acceptedAt: now
    });

    await setDoc(friend2Ref, {
      userId: request.to,
      friendId: request.from,
      status: 'accepted',
      createdAt: request.createdAt,
      acceptedAt: now
    });

    // Update request status
    await updateDoc(requestRef, {
      status: 'accepted'
    });

    // Award points for making a friend
    await awardSocialPoints(userId, 'Accepted friend request');
    await awardSocialPoints(request.from, 'Friend request accepted');

    console.log(`✅ Friend request accepted: ${request.from} <-> ${request.to}`);
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
}

/**
 * Decline a friend request
 */
export async function declineFriendRequest(requestId: string, userId: string): Promise<void> {
  try {
    const requestRef = doc(db, 'friend_requests', requestId);
    const requestDoc = await getDoc(requestRef);

    if (!requestDoc.exists()) {
      throw new Error('Friend request not found');
    }

    const request = requestDoc.data() as FriendRequest;

    // Verify this request is for the current user
    if (request.to !== userId) {
      throw new Error('Unauthorized to decline this request');
    }

    await updateDoc(requestRef, {
      status: 'declined'
    });

    console.log(`✅ Friend request declined: ${requestId}`);
  } catch (error) {
    console.error('Error declining friend request:', error);
    throw error;
  }
}

/**
 * Remove a friend
 */
export async function removeFriend(userId: string, friendId: string): Promise<void> {
  try {
    const friend1Ref = doc(db, 'friends', `${userId}_${friendId}`);
    const friend2Ref = doc(db, 'friends', `${friendId}_${userId}`);

    await deleteDoc(friend1Ref);
    await deleteDoc(friend2Ref);

    console.log(`✅ Friendship removed: ${userId} <-> ${friendId}`);
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
}

/**
 * Get user's friends
 */
export async function getUserFriends(userId: string): Promise<string[]> {
  try {
    const friendsRef = collection(db, 'friends');
    const q = query(friendsRef, where('userId', '==', userId), where('status', '==', 'accepted'));
    const snapshot = await getDocs(q);

    const friendIds: string[] = [];
    snapshot.forEach((doc) => {
      const friend = doc.data() as Friend;
      friendIds.push(friend.friendId);
    });

    return friendIds;
  } catch (error) {
    console.error('Error getting user friends:', error);
    return [];
  }
}

/**
 * Get pending friend requests for a user
 */
export async function getPendingRequests(userId: string): Promise<FriendRequest[]> {
  try {
    const requestsRef = collection(db, 'friend_requests');
    const q = query(requestsRef, where('to', '==', userId), where('status', '==', 'pending'));
    const snapshot = await getDocs(q);

    const requests: FriendRequest[] = [];
    snapshot.forEach((doc) => {
      requests.push(doc.data() as FriendRequest);
    });

    return requests;
  } catch (error) {
    console.error('Error getting pending requests:', error);
    return [];
  }
}

/**
 * Check if a friend request exists
 */
async function getFriendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest | null> {
  try {
    const requestsRef = collection(db, 'friend_requests');
    const q = query(
      requestsRef,
      where('from', '==', fromUserId),
      where('to', '==', toUserId),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return snapshot.docs[0].data() as FriendRequest;
    }

    return null;
  } catch (error) {
    console.error('Error checking friend request:', error);
    return null;
  }
}

/**
 * Check if two users are friends
 */
export async function areFriends(userId: string, friendId: string): Promise<boolean> {
  try {
    const friendRef = doc(db, 'friends', `${userId}_${friendId}`);
    const friendDoc = await getDoc(friendRef);

    if (friendDoc.exists()) {
      const friend = friendDoc.data() as Friend;
      return friend.status === 'accepted';
    }

    return false;
  } catch (error) {
    console.error('Error checking friendship:', error);
    return false;
  }
}

// ===== FRIEND GROUPS =====

/**
 * Create a friend group
 */
export async function createFriendGroup(
  ownerId: string,
  name: string,
  description: string,
  initialMembers: string[] = []
): Promise<string> {
  try {
    const groupRef = doc(collection(db, 'friend_groups'));
    const now = new Date().toISOString();

    await setDoc(groupRef, {
      id: groupRef.id,
      name,
      description,
      ownerId,
      members: [...initialMembers, ownerId], // Owner is always a member
      createdAt: now,
      updatedAt: now
    });

    console.log(`✅ Friend group created: ${name} (${groupRef.id})`);
    return groupRef.id;
  } catch (error) {
    console.error('Error creating friend group:', error);
    throw error;
  }
}

/**
 * Add member to friend group
 */
export async function addGroupMember(groupId: string, userId: string, memberId: string): Promise<void> {
  try {
    const groupRef = doc(db, 'friend_groups', groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }

    const group = groupDoc.data() as FriendGroup;

    // Verify user is owner
    if (group.ownerId !== userId) {
      throw new Error('Only group owner can add members');
    }

    // Verify new member is friends with owner
    const isFriend = await areFriends(userId, memberId);
    if (!isFriend) {
      throw new Error('Can only add friends to group');
    }

    await updateDoc(groupRef, {
      members: arrayUnion(memberId),
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ Added ${memberId} to group ${groupId}`);
  } catch (error) {
    console.error('Error adding group member:', error);
    throw error;
  }
}

/**
 * Remove member from friend group
 */
export async function removeGroupMember(groupId: string, userId: string, memberId: string): Promise<void> {
  try {
    const groupRef = doc(db, 'friend_groups', groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }

    const group = groupDoc.data() as FriendGroup;

    // Verify user is owner
    if (group.ownerId !== userId) {
      throw new Error('Only group owner can remove members');
    }

    await updateDoc(groupRef, {
      members: arrayRemove(memberId),
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ Removed ${memberId} from group ${groupId}`);
  } catch (error) {
    console.error('Error removing group member:', error);
    throw error;
  }
}

/**
 * Get user's friend groups
 */
export async function getUserGroups(userId: string): Promise<FriendGroup[]> {
  try {
    const groupsRef = collection(db, 'friend_groups');
    const q = query(groupsRef, where('members', 'array-contains', userId));
    const snapshot = await getDocs(q);

    const groups: FriendGroup[] = [];
    snapshot.forEach((doc) => {
      groups.push(doc.data() as FriendGroup);
    });

    return groups;
  } catch (error) {
    console.error('Error getting user groups:', error);
    return [];
  }
}

/**
 * Delete a friend group
 */
export async function deleteFriendGroup(groupId: string, userId: string): Promise<void> {
  try {
    const groupRef = doc(db, 'friend_groups', groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      throw new Error('Group not found');
    }

    const group = groupDoc.data() as FriendGroup;

    // Verify user is owner
    if (group.ownerId !== userId) {
      throw new Error('Only group owner can delete group');
    }

    await deleteDoc(groupRef);

    console.log(`✅ Deleted group ${groupId}`);
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
}
