import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  upsertDayLog,
  getDayLog,
  addNutritionItem,
  updateWorkout,
  updateHydration,
  getRecentDayLogs
} from '../dayLogs';
import { doc, getDoc, setDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

vi.mock('firebase/firestore');
vi.mock('../../firebase', () => ({
  db: { _firestore: 'mock' }
}));

describe('DayLogs Firestore Helpers - Unit Tests', () => {
  const mockUserId = 'test-user-123';
  const mockDate = '2025-10-07';
  const mockLogId = `${mockUserId}_${mockDate}`;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('upsertDayLog', () => {
    it('should create new day log if does not exist', async () => {
      const logData = {
        kcal: 2000,
        proteinG: 150,
        carbsG: 200,
        fatG: 70
      };

      vi.mocked(doc).mockReturnValue({ id: mockLogId } as any);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false
      } as any);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      const logId = await upsertDayLog(mockUserId, mockDate, logData);

      expect(logId).toBe(mockLogId);
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: mockUserId,
          date: mockDate,
          kcal: 2000,
          proteinG: 150
        })
      );
    });

    it('should update existing day log', async () => {
      const logData = {
        kcal: 2200,
        proteinG: 160
      };

      vi.mocked(doc).mockReturnValue({ id: mockLogId } as any);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ kcal: 2000, proteinG: 150 })
      } as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      const logId = await upsertDayLog(mockUserId, mockDate, logData);

      expect(logId).toBe(mockLogId);
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          kcal: 2200,
          proteinG: 160
        })
      );
    });
  });

  describe('getDayLog', () => {
    it('should return null if log does not exist', async () => {
      vi.mocked(doc).mockReturnValue({ id: mockLogId } as any);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false
      } as any);

      const result = await getDayLog(mockUserId, mockDate);

      expect(result).toBeNull();
    });

    it('should return day log if exists', async () => {
      const mockLog = {
        id: mockLogId,
        userId: mockUserId,
        date: mockDate,
        kcal: 2000,
        proteinG: 150,
        items: []
      };

      vi.mocked(doc).mockReturnValue({ id: mockLogId } as any);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => mockLog
      } as any);

      const result = await getDayLog(mockUserId, mockDate);

      expect(result).toMatchObject({
        userId: mockUserId,
        date: mockDate,
        kcal: 2000
      });
    });
  });

  describe('addNutritionItem', () => {
    it('should add nutrition item to day log', async () => {
      const nutritionItem = {
        name: 'Chicken Breast',
        kcal: 165,
        proteinG: 31,
        carbsG: 0,
        fatG: 3.6,
        servingSize: '100g',
        mealTime: '12:30' as const
      };

      vi.mocked(doc).mockReturnValue({ id: mockLogId } as any);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ items: [], kcal: 0, proteinG: 0 })
      } as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await addNutritionItem(mockUserId, mockDate, nutritionItem);

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              name: 'Chicken Breast',
              kcal: 165
            })
          ]),
          kcal: 165,
          proteinG: 31
        })
      );
    });
  });

  describe('updateWorkout', () => {
    it('should update workout data in day log', async () => {
      const workoutData = {
        type: 'Strength Training',
        durationMin: 60,
        caloriesBurned: 400,
        exercises: ['Bench Press', 'Squats', 'Deadlifts'],
        notes: 'Good session'
      };

      vi.mocked(doc).mockReturnValue({ id: mockLogId } as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await updateWorkout(mockUserId, mockDate, workoutData);

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          workout: workoutData
        })
      );
    });
  });

  describe('updateHydration', () => {
    it('should update hydration level', async () => {
      vi.mocked(doc).mockReturnValue({ id: mockLogId } as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await updateHydration(mockUserId, mockDate, 2.5);

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          hydrationL: 2.5
        })
      );
    });
  });

  describe('getRecentDayLogs', () => {
    it('should return recent day logs for user', async () => {
      const mockLogs = [
        { date: '2025-10-07', kcal: 2000 },
        { date: '2025-10-06', kcal: 2100 },
        { date: '2025-10-05', kcal: 1900 }
      ];

      vi.mocked(collection).mockReturnValue('dayLogs' as any);
      vi.mocked(query).mockReturnValue({} as any);
      vi.mocked(orderBy).mockReturnValue({} as any);
      vi.mocked(limit).mockReturnValue({} as any);
      vi.mocked(getDocs).mockResolvedValue({
        docs: mockLogs.map((log, i) => ({
          id: `log-${i}`,
          data: () => log
        }))
      } as any);

      const result = await getRecentDayLogs(mockUserId, 7);

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({ date: '2025-10-07' });
    });

    it('should return empty array if no logs', async () => {
      vi.mocked(collection).mockReturnValue('dayLogs' as any);
      vi.mocked(query).mockReturnValue({} as any);
      vi.mocked(getDocs).mockResolvedValue({
        docs: []
      } as any);

      const result = await getRecentDayLogs(mockUserId, 7);

      expect(result).toEqual([]);
    });
  });
});
