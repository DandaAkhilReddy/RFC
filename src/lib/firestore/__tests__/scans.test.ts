/**
 * Unit Tests for Firestore Scans Functions
 *
 * Tests CRUD operations, queries, and validation for scan data.
 * Uses mocked Firestore to avoid actual database calls.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createScan,
  getScan,
  getUserScans,
  getLatestScan,
  getCompletedScans,
  updateScanStatus,
  updateScanWithAnalysis,
  hasScannedToday,
  getScanCount,
  validateScanData,
  allPhotosCaptured,
} from '../scans';
import type { Scan, ScanPhoto, BodyComposition } from '../../../types/scan';

// Mock Firestore
vi.mock('../../../config/firebase', () => ({
  db: {
    collection: vi.fn(),
  },
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((db, name) => ({ _collectionName: name })),
  doc: vi.fn((coll, id) => ({
    id: id || 'mock-scan-id',
    _collectionName: coll._collectionName,
  })),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn((...args) => ({ _queryArgs: args })),
  where: vi.fn((field, op, value) => ({ _where: { field, op, value } })),
  orderBy: vi.fn((field, direction) => ({ _orderBy: { field, direction } })),
  limit: vi.fn((count) => ({ _limit: count })),
  Timestamp: {
    now: vi.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
    fromDate: vi.fn((date) => ({ seconds: date.getTime() / 1000, nanoseconds: 0 })),
  },
  serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
  deleteDoc: vi.fn(),
}));

// Mock data
const mockUserId = 'user123';
const mockScanId = 'scan456';
const mockTimestamp = { seconds: Date.now() / 1000, nanoseconds: 0 };

const mockScanPhoto: ScanPhoto = {
  angle: 'front',
  url: 'https://example.com/front.jpg',
  storagePath: 'scans/user123/scan456/front.jpg',
  capturedAt: new Date(),
  fileSize: 500000,
};

const mockBodyComp: BodyComposition = {
  bodyFatPercent: 18.5,
  leanBodyMass: 146.7,
  totalWeight: 180,
  estimatedMusclePercent: 42.3,
};

const mockScan: Scan = {
  id: mockScanId,
  userId: mockUserId,
  createdAt: mockTimestamp as any,
  updatedAt: mockTimestamp as any,
  status: 'completed',
  photos: [mockScanPhoto],
  weight: 180,
  notes: 'Feeling strong',
  bodyComposition: mockBodyComp,
  isPublic: false,
  sharedWithTrainer: false,
};

describe('Firestore Scans', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createScan', () => {
    it('should create a new scan with required fields', async () => {
      const { setDoc } = await import('firebase/firestore');

      const scanId = await createScan(mockUserId, 180, 'Test notes');

      expect(scanId).toBeDefined();
      expect(typeof scanId).toBe('string');
      expect(setDoc).toHaveBeenCalled();
    });

    it('should create scan without notes', async () => {
      const { setDoc } = await import('firebase/firestore');

      const scanId = await createScan(mockUserId, 180);

      expect(scanId).toBeDefined();
      expect(setDoc).toHaveBeenCalled();
    });

    it('should set initial status to capturing', async () => {
      const { setDoc } = await import('firebase/firestore');

      await createScan(mockUserId, 180);

      const callArgs = setDoc.mock.calls[0][1] as any;
      expect(callArgs.status).toBe('capturing');
    });

    it('should initialize empty photos array', async () => {
      const { setDoc } = await import('firebase/firestore');

      await createScan(mockUserId, 180);

      const callArgs = setDoc.mock.calls[0][1] as any;
      expect(callArgs.photos).toEqual([]);
    });

    it('should set privacy flags to false by default', async () => {
      const { setDoc } = await import('firebase/firestore');

      await createScan(mockUserId, 180);

      const callArgs = setDoc.mock.calls[0][1] as any;
      expect(callArgs.isPublic).toBe(false);
      expect(callArgs.sharedWithTrainer).toBe(false);
    });
  });

  describe('getScan', () => {
    it('should fetch scan by ID', async () => {
      const { getDoc } = await import('firebase/firestore');

      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockScan,
        id: mockScanId,
      });

      const scan = await getScan(mockScanId);

      expect(scan).toBeDefined();
      expect(getDoc).toHaveBeenCalled();
    });

    it('should return null if scan not found', async () => {
      const { getDoc } = await import('firebase/firestore');

      getDoc.mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      const scan = await getScan('nonexistent');

      expect(scan).toBeNull();
    });
  });

  describe('getUserScans', () => {
    it('should fetch all scans for a user', async () => {
      const { getDocs } = await import('firebase/firestore');

      getDocs.mockResolvedValue({
        docs: [
          { data: () => mockScan, id: 'scan1' },
          { data: () => ({ ...mockScan, id: 'scan2' }), id: 'scan2' },
        ],
      });

      const scans = await getUserScans(mockUserId);

      expect(scans).toHaveLength(2);
      expect(getDocs).toHaveBeenCalled();
    });

    it('should return empty array if no scans found', async () => {
      const { getDocs } = await import('firebase/firestore');

      getDocs.mockResolvedValue({
        docs: [],
      });

      const scans = await getUserScans(mockUserId);

      expect(scans).toEqual([]);
    });
  });

  describe('getLatestScan', () => {
    it('should fetch most recent scan', async () => {
      const { getDocs } = await import('firebase/firestore');

      getDocs.mockResolvedValue({
        docs: [{ data: () => mockScan, id: mockScanId }],
      });

      const scan = await getLatestScan(mockUserId);

      expect(scan).toBeDefined();
      expect(scan?.id).toBe(mockScanId);
    });

    it('should return null if no scans found', async () => {
      const { getDocs } = await import('firebase/firestore');

      getDocs.mockResolvedValue({
        docs: [],
      });

      const scan = await getLatestScan(mockUserId);

      expect(scan).toBeNull();
    });
  });

  describe('getCompletedScans', () => {
    it('should fetch only completed scans', async () => {
      const { getDocs } = await import('firebase/firestore');

      getDocs.mockResolvedValue({
        docs: [
          { data: () => ({ ...mockScan, status: 'completed' }), id: 'scan1' },
          { data: () => ({ ...mockScan, status: 'completed' }), id: 'scan2' },
        ],
      });

      const scans = await getCompletedScans(mockUserId);

      expect(scans.length).toBeGreaterThan(0);
      scans.forEach((scan) => {
        expect(scan.status).toBe('completed');
      });
    });

    it('should respect limit parameter', async () => {
      const { getDocs, limit } = await import('firebase/firestore');

      getDocs.mockResolvedValue({
        docs: [
          { data: () => mockScan, id: 'scan1' },
          { data: () => mockScan, id: 'scan2' },
        ],
      });

      await getCompletedScans(mockUserId, 10);

      expect(limit).toHaveBeenCalledWith(10);
    });
  });

  describe('updateScanStatus', () => {
    it('should update scan status', async () => {
      const { updateDoc } = await import('firebase/firestore');

      await updateScanStatus(mockScanId, 'processing');

      expect(updateDoc).toHaveBeenCalled();
      const callArgs = updateDoc.mock.calls[0][1] as any;
      expect(callArgs.status).toBe('processing');
    });

    it('should update scan status with error message', async () => {
      const { updateDoc } = await import('firebase/firestore');

      await updateScanStatus(mockScanId, 'failed', 'Analysis failed');

      const callArgs = updateDoc.mock.calls[0][1] as any;
      expect(callArgs.status).toBe('failed');
      expect(callArgs.errorMessage).toBe('Analysis failed');
    });

    it('should set updatedAt timestamp', async () => {
      const { updateDoc } = await import('firebase/firestore');

      await updateScanStatus(mockScanId, 'completed');

      const callArgs = updateDoc.mock.calls[0][1] as any;
      expect(callArgs.updatedAt).toBeDefined();
    });
  });

  describe('updateScanWithAnalysis', () => {
    it('should update scan with body composition', async () => {
      const { updateDoc } = await import('firebase/firestore');

      await updateScanWithAnalysis(mockScanId, {
        bodyComposition: mockBodyComp,
      });

      expect(updateDoc).toHaveBeenCalled();
      const callArgs = updateDoc.mock.calls[0][1] as any;
      expect(callArgs.bodyComposition).toEqual(mockBodyComp);
    });

    it('should update scan with quality check', async () => {
      const { updateDoc } = await import('firebase/firestore');

      const qualityCheck = {
        isValid: true,
        issues: [],
        confidence: 0.85,
      };

      await updateScanWithAnalysis(mockScanId, {
        qualityCheck,
      });

      const callArgs = updateDoc.mock.calls[0][1] as any;
      expect(callArgs.qualityCheck).toEqual(qualityCheck);
    });

    it('should update scan with delta', async () => {
      const { updateDoc } = await import('firebase/firestore');

      const delta = {
        bodyFatDelta: -1.5,
        leanMassDelta: 2.0,
        weightDelta: 0.5,
        trend: 'improving' as const,
      };

      await updateScanWithAnalysis(mockScanId, {
        delta,
      });

      const callArgs = updateDoc.mock.calls[0][1] as any;
      expect(callArgs.delta).toEqual(delta);
    });
  });

  describe('hasScannedToday', () => {
    it('should return true if scan exists today', async () => {
      const { getDocs } = await import('firebase/firestore');

      getDocs.mockResolvedValueOnce({
        docs: [{ data: () => mockScan, id: mockScanId }],
        size: 1,
      });

      const result = await hasScannedToday(mockUserId);

      expect(result).toBe(true);
    });

    it('should return false if no scan today', async () => {
      const { getDocs } = await import('firebase/firestore');

      getDocs.mockResolvedValueOnce({
        docs: [],
        size: 0,
        empty: true,
      });

      const result = await hasScannedToday(mockUserId);

      expect(result).toBe(false);
    });
  });

  describe('getScanCount', () => {
    it('should return total scan count', async () => {
      const { getDocs } = await import('firebase/firestore');

      getDocs.mockResolvedValue({
        size: 42,
      });

      const count = await getScanCount(mockUserId);

      expect(count).toBe(42);
    });

    it('should return 0 if no scans', async () => {
      const { getDocs } = await import('firebase/firestore');

      getDocs.mockResolvedValue({
        size: 0,
      });

      const count = await getScanCount(mockUserId);

      expect(count).toBe(0);
    });
  });

  describe('validateScanData', () => {
    it('should validate complete scan data', () => {
      const validScan = { ...mockScan, photos: [mockScanPhoto, mockScanPhoto, mockScanPhoto, mockScanPhoto] };
      const result = validateScanData(validScan);

      expect(result).toBe(true);
    });

    it('should detect missing weight', () => {
      const invalidScan = { ...mockScan, weight: 0 };

      const result = validateScanData(invalidScan);

      expect(result).toBe(false);
    });

    it('should detect missing userId', () => {
      const invalidScan = { ...mockScan, userId: '' };

      const result = validateScanData(invalidScan);

      expect(result).toBe(false);
    });

    it('should pass without photos validation when photos undefined', () => {
      const scanWithoutPhotos = { userId: mockUserId, weight: 180 };

      const result = validateScanData(scanWithoutPhotos);

      expect(result).toBe(true);
    });
  });

  describe('allPhotosCaptured', () => {
    it('should return true when all 4 photos present', () => {
      const scanWithAllPhotos: Scan = {
        ...mockScan,
        photos: [
          { ...mockScanPhoto, angle: 'front' },
          { ...mockScanPhoto, angle: 'back' },
          { ...mockScanPhoto, angle: 'left' },
          { ...mockScanPhoto, angle: 'right' },
        ],
      };

      const result = allPhotosCaptured(scanWithAllPhotos);

      expect(result).toBe(true);
    });

    it('should return false when photos missing', () => {
      const scanWithPartialPhotos: Scan = {
        ...mockScan,
        photos: [
          { ...mockScanPhoto, angle: 'front' },
          { ...mockScanPhoto, angle: 'back' },
        ],
      };

      const result = allPhotosCaptured(scanWithPartialPhotos);

      expect(result).toBe(false);
    });

    it('should return false with empty array', () => {
      const scanWithNoPhotos: Scan = {
        ...mockScan,
        photos: [],
      };

      const result = allPhotosCaptured(scanWithNoPhotos);

      expect(result).toBe(false);
    });

    it('should return false with duplicate angles', () => {
      const scanWithDuplicates: Scan = {
        ...mockScan,
        photos: [
          { ...mockScanPhoto, angle: 'front' },
          { ...mockScanPhoto, angle: 'front' },
          { ...mockScanPhoto, angle: 'front' },
          { ...mockScanPhoto, angle: 'front' },
        ],
      };

      const result = allPhotosCaptured(scanWithDuplicates);

      expect(result).toBe(false);
    });
  });
});
