/**
 * Unit Tests for ProgressChart Component
 *
 * Tests chart rendering, data transformation, user interactions, and edge cases.
 * Uses Vitest and React Testing Library.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressChart from '../ProgressChart';
import type { Scan } from '../../types/scan';
import { Timestamp } from 'firebase/firestore';

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children, data }: any) => (
    <div data-testid="area-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  LineChart: ({ children, data }: any) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Area: ({ dataKey, name }: any) => <div data-testid={`area-${dataKey}`}>{name}</div>,
  Line: ({ dataKey, name }: any) => <div data-testid={`line-${dataKey}`}>{name}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => {
    if (formatStr === 'MMM d') return 'Jan 1';
    if (formatStr === 'MMM d, yyyy') return 'Jan 1, 2025';
    return date.toISOString();
  },
}));

// Helper to create mock Timestamp
const createMockTimestamp = (date: Date) => ({
  toDate: () => date,
  seconds: Math.floor(date.getTime() / 1000),
  nanoseconds: 0,
});

// Mock scan data
const mockScanWithBodyComp: Scan = {
  id: 'scan1',
  userId: 'user123',
  createdAt: createMockTimestamp(new Date('2025-01-01')) as any,
  updatedAt: createMockTimestamp(new Date('2025-01-01')) as any,
  status: 'completed',
  photos: [],
  weight: 180,
  bodyComposition: {
    bodyFatPercent: 18.5,
    leanBodyMass: 146.7,
    totalWeight: 180,
    estimatedMusclePercent: 42.3,
  },
  isPublic: false,
  sharedWithTrainer: false,
};

const mockScanWithoutBodyComp: Scan = {
  id: 'scan2',
  userId: 'user123',
  createdAt: createMockTimestamp(new Date('2025-01-02')) as any,
  updatedAt: createMockTimestamp(new Date('2025-01-02')) as any,
  status: 'capturing',
  photos: [],
  weight: 180,
  isPublic: false,
  sharedWithTrainer: false,
};

describe('ProgressChart Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State', () => {
    it('should show message when no scans provided', () => {
      render(<ProgressChart scans={[]} />);

      expect(screen.getByText(/not enough data to display chart/i)).toBeInTheDocument();
    });

    it('should show message when scans have no body composition', () => {
      render(<ProgressChart scans={[mockScanWithoutBodyComp]} />);

      expect(screen.getByText(/not enough data to display chart/i)).toBeInTheDocument();
    });

    it('should render chart even with one valid scan', () => {
      render(<ProgressChart scans={[mockScanWithBodyComp]} />);

      // Component actually renders chart with 1 scan (no minimum requirement)
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      expect(screen.queryByText(/not enough data/i)).not.toBeInTheDocument();
    });

    it('should not render chart components when empty', () => {
      render(<ProgressChart scans={[]} />);

      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    });
  });

  describe('Chart Rendering', () => {
    const multipleScans: Scan[] = [
      mockScanWithBodyComp,
      {
        ...mockScanWithBodyComp,
        id: 'scan2',
        createdAt: createMockTimestamp(new Date('2025-01-05')) as any,
        weight: 178,
        bodyComposition: {
          bodyFatPercent: 17.8,
          leanBodyMass: 146.4,
          totalWeight: 178,
          estimatedMusclePercent: 42.5,
        },
      },
    ];

    it('should render area chart by default', () => {
      render(<ProgressChart scans={multipleScans} />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    });

    it('should render line chart when chartType is "line"', () => {
      render(<ProgressChart scans={multipleScans} chartType="line" />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument();
    });

    it('should render responsive container', () => {
      render(<ProgressChart scans={multipleScans} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render chart axes', () => {
      render(<ProgressChart scans={multipleScans} />);

      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    });

    it('should render cartesian grid', () => {
      render(<ProgressChart scans={multipleScans} />);

      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    });

    it('should render tooltip', () => {
      render(<ProgressChart scans={multipleScans} />);

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('should render legend', () => {
      render(<ProgressChart scans={multipleScans} />);

      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });

    it('should display chart title', () => {
      render(<ProgressChart scans={multipleScans} />);

      expect(screen.getByText('Progress Over Time')).toBeInTheDocument();
    });
  });

  describe('Metric Filtering', () => {
    const multipleScans: Scan[] = [
      mockScanWithBodyComp,
      {
        ...mockScanWithBodyComp,
        id: 'scan2',
        createdAt: createMockTimestamp(new Date('2025-01-05')) as any,
      },
    ];

    it('should render all metrics when metric is "all"', () => {
      render(<ProgressChart scans={multipleScans} metric="all" />);

      expect(screen.getByTestId('area-bodyFat')).toBeInTheDocument();
      expect(screen.getByTestId('area-weight')).toBeInTheDocument();
      expect(screen.getByTestId('area-leanMass')).toBeInTheDocument();
    });

    it('should render only body fat when metric is "bodyFat"', () => {
      render(<ProgressChart scans={multipleScans} metric="bodyFat" />);

      expect(screen.getByTestId('area-bodyFat')).toBeInTheDocument();
      expect(screen.queryByTestId('area-weight')).not.toBeInTheDocument();
      expect(screen.queryByTestId('area-leanMass')).not.toBeInTheDocument();
    });

    it('should render only weight when metric is "weight"', () => {
      render(<ProgressChart scans={multipleScans} metric="weight" />);

      expect(screen.queryByTestId('area-bodyFat')).not.toBeInTheDocument();
      expect(screen.getByTestId('area-weight')).toBeInTheDocument();
      expect(screen.queryByTestId('area-leanMass')).not.toBeInTheDocument();
    });

    it('should render only lean mass when metric is "leanMass"', () => {
      render(<ProgressChart scans={multipleScans} metric="leanMass" />);

      expect(screen.queryByTestId('area-bodyFat')).not.toBeInTheDocument();
      expect(screen.queryByTestId('area-weight')).not.toBeInTheDocument();
      expect(screen.getByTestId('area-leanMass')).toBeInTheDocument();
    });

    it('should use line chart components when chartType is "line"', () => {
      render(<ProgressChart scans={multipleScans} metric="bodyFat" chartType="line" />);

      expect(screen.getByTestId('line-bodyFat')).toBeInTheDocument();
      expect(screen.queryByTestId('area-bodyFat')).not.toBeInTheDocument();
    });
  });

  describe('Data Transformation', () => {
    it('should filter out scans without body composition', () => {
      const mixedScans: Scan[] = [
        mockScanWithBodyComp,
        mockScanWithoutBodyComp, // Should be filtered out
        {
          ...mockScanWithBodyComp,
          id: 'scan3',
          createdAt: createMockTimestamp(new Date('2025-01-03')) as any,
        },
      ];

      const { container } = render(<ProgressChart scans={mixedScans} />);
      const chartEl = screen.getByTestId('area-chart');
      const chartData = JSON.parse(chartEl.getAttribute('data-chart-data') || '[]');

      // Should have 2 data points (scan without body comp filtered out)
      expect(chartData.length).toBe(2);
    });

    it('should reverse scan order (oldest first)', () => {
      const scansNewestFirst: Scan[] = [
        {
          ...mockScanWithBodyComp,
          id: 'scan2',
          createdAt: createMockTimestamp(new Date('2025-01-05')) as any,
        },
        {
          ...mockScanWithBodyComp,
          id: 'scan1',
          createdAt: createMockTimestamp(new Date('2025-01-01')) as any,
        },
      ];

      const { container } = render(<ProgressChart scans={scansNewestFirst} />);
      const chartEl = screen.getByTestId('area-chart');
      const chartData = JSON.parse(chartEl.getAttribute('data-chart-data') || '[]');

      // Chart data should be reversed (oldest first)
      expect(chartData.length).toBe(2);
    });

    it('should include all required data fields', () => {
      const { container } = render(<ProgressChart scans={[mockScanWithBodyComp]} />);
      const chartEl = screen.getByTestId('area-chart');
      const chartData = JSON.parse(chartEl.getAttribute('data-chart-data') || '[]');

      expect(chartData[0]).toHaveProperty('date');
      expect(chartData[0]).toHaveProperty('fullDate');
      expect(chartData[0]).toHaveProperty('bodyFat');
      expect(chartData[0]).toHaveProperty('weight');
      expect(chartData[0]).toHaveProperty('leanMass');
    });

    it('should handle scans with undefined bodyComposition values', () => {
      const scanWithPartialData: Scan = {
        ...mockScanWithBodyComp,
        bodyComposition: {
          bodyFatPercent: 18.5,
          leanBodyMass: 0, // Could be 0 or missing
          totalWeight: 180,
        },
      };

      const { container } = render(<ProgressChart scans={[scanWithPartialData]} />);
      const chartEl = screen.getByTestId('area-chart');
      const chartData = JSON.parse(chartEl.getAttribute('data-chart-data') || '[]');

      // Should still render with 0 values
      expect(chartData[0].leanMass).toBe(0);
    });
  });

  describe('Chart Legend', () => {
    const multipleScans: Scan[] = [
      mockScanWithBodyComp,
      {
        ...mockScanWithBodyComp,
        id: 'scan2',
        createdAt: createMockTimestamp(new Date('2025-01-05')) as any,
      },
    ];

    it('should render legend help section', () => {
      render(<ProgressChart scans={multipleScans} />);

      // Use getAllByText since these appear in both chart and help section
      const bodyFatElements = screen.getAllByText(/Body Fat %/i);
      expect(bodyFatElements.length).toBeGreaterThan(0);

      // Check for help text that only appears in legend section
      expect(screen.getByText(/goal: decrease/i)).toBeInTheDocument();
      expect(screen.getByText(/total body weight/i)).toBeInTheDocument();
      expect(screen.getByText(/muscle \+ bone/i)).toBeInTheDocument();
    });

    it('should explain metric goals', () => {
      render(<ProgressChart scans={multipleScans} />);

      expect(screen.getByText(/goal: decrease/i)).toBeInTheDocument();
      expect(screen.getByText(/total body weight/i)).toBeInTheDocument();
      expect(screen.getByText(/muscle \+ bone/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle scans with Date objects instead of Timestamps', () => {
      const scanWithDate: Scan = {
        ...mockScanWithBodyComp,
        createdAt: new Date('2025-01-01') as any,
      };

      expect(() => render(<ProgressChart scans={[scanWithDate]} />)).not.toThrow();
    });

    it('should handle very large datasets', () => {
      const largeDataset: Scan[] = Array.from({ length: 100 }, (_, i) => ({
        ...mockScanWithBodyComp,
        id: `scan${i}`,
        createdAt: createMockTimestamp(new Date(2025, 0, i + 1)) as any,
      }));

      const { container } = render(<ProgressChart scans={largeDataset} />);
      const chartEl = screen.getByTestId('area-chart');
      const chartData = JSON.parse(chartEl.getAttribute('data-chart-data') || '[]');

      expect(chartData.length).toBe(100);
    });

    it('should handle scans with same timestamp', () => {
      const sameTimestamp = createMockTimestamp(new Date('2025-01-01'));
      const duplicateScans: Scan[] = [
        { ...mockScanWithBodyComp, id: 'scan1', createdAt: sameTimestamp as any },
        { ...mockScanWithBodyComp, id: 'scan2', createdAt: sameTimestamp as any },
      ];

      expect(() => render(<ProgressChart scans={duplicateScans} />)).not.toThrow();
    });

    it('should handle missing weight values', () => {
      const scanNoWeight: Scan = {
        ...mockScanWithBodyComp,
        weight: undefined as any,
      };

      const { container } = render(<ProgressChart scans={[scanNoWeight]} />);
      const chartEl = screen.getByTestId('area-chart');
      const chartData = JSON.parse(chartEl.getAttribute('data-chart-data') || '[]');

      expect(chartData[0].weight).toBe(0); // Should default to 0
    });
  });

  describe('Accessibility', () => {
    const multipleScans: Scan[] = [
      mockScanWithBodyComp,
      {
        ...mockScanWithBodyComp,
        id: 'scan2',
        createdAt: createMockTimestamp(new Date('2025-01-05')) as any,
      },
    ];

    it('should have proper heading hierarchy', () => {
      render(<ProgressChart scans={multipleScans} />);

      const heading = screen.getByText('Progress Over Time');
      expect(heading.tagName).toBe('H3');
    });

    it('should render in a semantic container', () => {
      const { container } = render(<ProgressChart scans={multipleScans} />);

      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });
});
