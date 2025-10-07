import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import StreakBar from '../StreakBar';
import * as scansModule from '../../../lib/firestore/scans';
import * as usersModule from '../../../lib/firestore/users';

vi.mock('../../AuthProvider', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-123' },
    loading: false
  })
}));

vi.mock('../../../lib/firestore/scans');
vi.mock('../../../lib/firestore/users');

describe('StreakBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display current streak', async () => {
    vi.mocked(scansModule.calculateStreak).mockResolvedValue(7);
    vi.mocked(usersModule.getUserProfile).mockResolvedValue({
      bestStreak: 10
    } as any);

    render(<StreakBar />);

    await waitFor(() => {
      expect(screen.getByText(/7/)).toBeInTheDocument();
      expect(screen.getByText(/days?/i)).toBeInTheDocument();
    });
  });

  it('should display best streak', async () => {
    vi.mocked(scansModule.calculateStreak).mockResolvedValue(5);
    vi.mocked(usersModule.getUserProfile).mockResolvedValue({
      bestStreak: 15
    } as any);

    render(<StreakBar />);

    await waitFor(() => {
      expect(screen.getByText(/15/)).toBeInTheDocument();
      expect(screen.getByText(/Best/i)).toBeInTheDocument();
    });
  });

  it('should show 0 streak for new users', async () => {
    vi.mocked(scansModule.calculateStreak).mockResolvedValue(0);
    vi.mocked(usersModule.getUserProfile).mockResolvedValue({
      bestStreak: 0
    } as any);

    render(<StreakBar />);

    await waitFor(() => {
      expect(screen.getAllByText(/0/).length).toBeGreaterThan(0);
    });
  });

  it('should display loading state initially', () => {
    vi.mocked(scansModule.calculateStreak).mockImplementation(() =>
      new Promise(() => {})
    );

    render(<StreakBar />);

    // Should render without crashing
    expect(screen.getByText(/Streak/i)).toBeInTheDocument();
  });
});
