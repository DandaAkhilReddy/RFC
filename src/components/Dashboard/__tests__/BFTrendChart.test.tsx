import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BFTrendChart from '../BFTrendChart';
import * as scansModule from '../../../lib/firestore/scans';

// Mock AuthProvider
vi.mock('../../AuthProvider', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-123', email: 'test@example.com' },
    loading: false
  })
}));

// Mock firestore scans module
vi.mock('../../../lib/firestore/scans');

describe('BFTrendChart Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(scansModule.getTrendData).mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    );

    render(<BFTrendChart />);

    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
  });

  it('should display "No scan data yet" when no data available', async () => {
    vi.mocked(scansModule.getTrendData).mockResolvedValue({
      dates: Array(14).fill(null).map((_, i) => `2025-10-${String(i + 1).padStart(2, '0')}`),
      bfPercents: Array(14).fill(null),
      lbms: Array(14).fill(null)
    });

    render(<BFTrendChart />);

    await waitFor(() => {
      expect(screen.getByText(/no scan data yet/i)).toBeInTheDocument();
    });
  });

  it('should display chart with trend data', async () => {
    vi.mocked(scansModule.getTrendData).mockResolvedValue({
      dates: ['2025-10-07', '2025-10-06', '2025-10-05'],
      bfPercents: [0.15, 0.155, 0.16],
      lbms: [150, 149, 148]
    });

    render(<BFTrendChart />);

    await waitFor(() => {
      expect(screen.getByText(/Body Fat % Trend/i)).toBeInTheDocument();
    });
  });

  it('should show "Decreasing" trend indicator when BF% is going down', async () => {
    vi.mocked(scansModule.getTrendData).mockResolvedValue({
      dates: ['2025-10-07', '2025-10-06', '2025-10-05'],
      bfPercents: [0.15, 0.155, 0.16], // Decreasing trend
      lbms: [150, 149, 148]
    });

    render(<BFTrendChart />);

    await waitFor(() => {
      expect(screen.getByText(/Decreasing/i)).toBeInTheDocument();
    });
  });

  it('should show "Increasing" trend indicator when BF% is going up', async () => {
    vi.mocked(scansModule.getTrendData).mockResolvedValue({
      dates: ['2025-10-07', '2025-10-06', '2025-10-05'],
      bfPercents: [0.16, 0.155, 0.15], // Increasing trend
      lbms: [148, 149, 150]
    });

    render(<BFTrendChart />);

    await waitFor(() => {
      expect(screen.getByText(/Increasing/i)).toBeInTheDocument();
    });
  });

  it('should switch between 14 and 30 day periods', async () => {
    const getTrendDataMock = vi.mocked(scansModule.getTrendData);

    getTrendDataMock.mockResolvedValue({
      dates: Array(14).fill(null).map((_, i) => `2025-10-${String(i + 1).padStart(2, '0')}`),
      bfPercents: Array(14).fill(0.15),
      lbms: Array(14).fill(150)
    });

    const user = userEvent.setup();
    render(<BFTrendChart />);

    await waitFor(() => {
      expect(screen.getByText(/Body Fat % Trend/i)).toBeInTheDocument();
    });

    // Click 30 Days button
    const thirtyDaysButton = screen.getByRole('button', { name: /30 Days/i });
    await user.click(thirtyDaysButton);

    // Should call getTrendData with 30
    await waitFor(() => {
      expect(getTrendDataMock).toHaveBeenCalledWith('test-user-123', 30);
    });
  });
});
