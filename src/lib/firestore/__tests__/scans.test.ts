import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createScan,
  getScan,
  getScansForDate,
  getPreviousScans,
  getScanHistory,
  updateScanWithEstimation,
  updateScanWithDeltas,
  updateScanWithInsight,
  updateScanWithQC,
  calculateStreak,
  getTrendData,
  hasScannedToday,
  getLatestScan
} from '../scans';
import { doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where, orderBy, limit } from 'firebase/firestore';

// Mock Firebase Firestore
vi.mock('firebase/firestore');
vi.mock('../../firebase', () => ({
  db: { _firestore: 'mock' }
}));

describe('Scans Firestore Helpers - Unit Tests', () => {
  const mockUserId = 'test-user-123';
  const mockDate = '2025-10-07';
  const mockScanId = `scn_${mockDate}_1696704000000`;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createScan', () => {
    it('should create a new scan with all required fields', async () => {
      const scanData = {
        date: mockDate,
        angleUrls: {
          front: 'https://example.com/front.jpg',
          back: 'https://example.com/back.jpg',
          left: 'https://example.com/left.jpg',
          right: 'https://example.com/right.jpg'
        },
        weightLb: 180
      };

      vi.mocked(doc).mockReturnValue({ id: mockScanId } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      const scanId = await createScan(mockUserId, scanData);

      expect(scanId).toContain('scn_');
      expect(scanId).toContain(mockDate);
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: mockUserId,
          date: mockDate,
          weightLb: 180,
          bfPercent: null,
          lbmLb: null,
          qc: null,
          deltas: null,
          insight: null
        })
      );
    });
  });

  describe('getScan', () => {
    it('should return null if scan does not exist', async () => {
      vi.mocked(doc).mockReturnValue({ id: mockScanId } as any);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false
      } as any);

      const result = await getScan(mockScanId);

      expect(result).toBeNull();
    });

    it('should return scan data if exists', async () => {
      const mockScanData = {
        id: mockScanId,
        userId: mockUserId,
        date: mockDate,
        weightLb: 180,
        bfPercent: 15.5
      };

      vi.mocked(doc).mockReturnValue({ id: mockScanId } as any);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: mockScanId,
        data: () => mockScanData
      } as any);

      const result = await getScan(mockScanId);

      expect(result).toEqual(expect.objectContaining({
        id: mockScanId,
        userId: mockUserId,
        weightLb: 180
      }));
    });
  });

  describe('getScansForDate', () => {
    it('should return scans for a specific date', async () => {
      const mockScans = [
        { id: 'scan1', userId: mockUserId, date: mockDate },
        { id: 'scan2', userId: mockUserId, date: mockDate }
      ];

      vi.mocked(collection).mockReturnValue('scans' as any);
      vi.mocked(query).mockReturnValue({} as any);
      vi.mocked(where).mockReturnValue({} as any);
      vi.mocked(orderBy).mockReturnValue({} as any);
      vi.mocked(getDocs).mockResolvedValue({
        docs: mockScans.map(scan => ({
          id: scan.id,
          data: () => scan
        }))
      } as any);

      const result = await getScansForDate(mockUserId, mockDate);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ id: 'scan1', date: mockDate });
    });

    it('should return empty array if no scans found', async () => {
      vi.mocked(collection).mockReturnValue('scans' as any);
      vi.mocked(query).mockReturnValue({} as any);
      vi.mocked(getDocs).mockResolvedValue({
        docs: []
      } as any);

      const result = await getScansForDate(mockUserId, mockDate);

      expect(result).toEqual([]);
    });
  });

  describe('updateScanWithEstimation', () => {
    it('should update scan with BF estimation data', async () => {
      const estimationData = {
        bfPercent: 0.155,
        bfConfidence: 0.92,
        waistMetric: 32.5,
        lbmLb: 152.1
      };

      vi.mocked(doc).mockReturnValue({ id: mockScanId } as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await updateScanWithEstimation(mockScanId, estimationData);

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          bfPercent: 0.155,
          bfConfidence: 0.92,
          lbmLb: 152.1
        })
      );
    });
  });

  describe('updateScanWithDeltas', () => {
    it('should update scan with delta comparison data', async () => {
      const deltaData = {
        bf_d1: -0.3,
        bf_d2: -0.5,
        lbm_d1: 0.8,
        weight_d1: 0.5,
        slope_7day: -0.1
      };

      vi.mocked(doc).mockReturnValue({ id: mockScanId } as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await updateScanWithDeltas(mockScanId, deltaData, 'prev-scan-id', 'prev2-scan-id');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          deltas: deltaData,
          prevScanId: 'prev-scan-id',
          prev2ScanId: 'prev2-scan-id'
        })
      );
    });
  });

  describe('updateScanWithInsight', () => {
    it('should update scan with AI insight', async () => {
      const insightData = {
        summary: '# Great Progress!\n\n- BF% down 0.3%',
        flags: ['ok'],
        version: 1
      };

      vi.mocked(doc).mockReturnValue({ id: mockScanId } as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await updateScanWithInsight(mockScanId, insightData as any);

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          insight: expect.objectContaining({
            summary: insightData.summary,
            flags: insightData.flags
          })
        })
      );
    });
  });

  describe('updateScanWithQC', () => {
    it('should update scan with quality check results', async () => {
      const qcResult = {
        poseOK: true,
        lightingScore: 0.85,
        sameDressScore: 0.95,
        notes: ['Good lighting', 'Similar outfit']
      };

      vi.mocked(doc).mockReturnValue({ id: mockScanId } as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await updateScanWithQC(mockScanId, qcResult);

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          qc: qcResult
        })
      );
    });
  });

  describe('calculateStreak', () => {
    it('should calculate consecutive scan streak', async () => {
      const mockScanHistory = [
        { date: '2025-10-07' },
        { date: '2025-10-06' },
        { date: '2025-10-05' },
        { date: '2025-10-03' } // Break here
      ];

      vi.mocked(collection).mockReturnValue('scans' as any);
      vi.mocked(query).mockReturnValue({} as any);
      vi.mocked(getDocs).mockResolvedValue({
        docs: mockScanHistory.map((scan, i) => ({
          id: `scan-${i}`,
          data: () => scan
        }))
      } as any);

      const streak = await calculateStreak(mockUserId);

      expect(streak).toBe(3); // 3 consecutive days
    });

    it('should return 0 for no scans', async () => {
      vi.mocked(collection).mockReturnValue('scans' as any);
      vi.mocked(query).mockReturnValue({} as any);
      vi.mocked(getDocs).mockResolvedValue({
        docs: []
      } as any);

      const streak = await calculateStreak(mockUserId);

      expect(streak).toBe(0);
    });
  });

  describe('hasScannedToday', () => {
    it('should return true if user scanned today', async () => {
      const today = new Date().toISOString().split('T')[0];

      vi.mocked(collection).mockReturnValue('scans' as any);
      vi.mocked(query).mockReturnValue({} as any);
      vi.mocked(getDocs).mockResolvedValue({
        docs: [{ id: 'scan1', data: () => ({ date: today }) }]
      } as any);

      const result = await hasScannedToday(mockUserId);

      expect(result).toBe(true);
    });

    it('should return false if user has not scanned today', async () => {
      vi.mocked(collection).mockReturnValue('scans' as any);
      vi.mocked(query).mockReturnValue({} as any);
      vi.mocked(getDocs).mockResolvedValue({
        docs: []
      } as any);

      const result = await hasScannedToday(mockUserId);

      expect(result).toBe(false);
    });
  });

  describe('getTrendData', () => {
    it('should return trend data for specified period', async () => {
      const mockScans = [
        { date: '2025-10-07', bfPercent: 0.15, lbmLb: 150 },
        { date: '2025-10-06', bfPercent: 0.155, lbmLb: 149 },
        { date: '2025-10-05', bfPercent: 0.16, lbmLb: 148 }
      ];

      vi.mocked(collection).mockReturnValue('scans' as any);
      vi.mocked(query).mockReturnValue({} as any);
      vi.mocked(getDocs).mockResolvedValue({
        docs: mockScans.map((scan, i) => ({
          id: `scan-${i}`,
          data: () => scan
        }))
      } as any);

      const result = await getTrendData(mockUserId, 14);

      expect(result).toHaveProperty('dates');
      expect(result).toHaveProperty('bfPercents');
      expect(result).toHaveProperty('lbms');
      expect(result.dates).toHaveLength(14); // Should have 14 days
    });
  });
});
