import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Leaderboard from '../Leaderboard';
import * as leaderboardService from '../../lib/leaderboardService';

// Mock leaderboardService
vi.mock('../../lib/leaderboardService');

describe('Leaderboard Component - Button Tests', () => {
  const mockUserId = 'test-user-123';

  const mockLeaderboardData: leaderboardService.LeaderboardEntry[] = [
    {
      rank: 1,
      userId: 'user-1',
      name: 'Top User',
      photoUrl: 'photo1.jpg',
      city: 'Seattle',
      country: 'USA',
      points: 1000,
      isCurrentUser: false
    },
    {
      rank: 2,
      userId: mockUserId,
      name: 'Test User',
      photoUrl: 'photo2.jpg',
      city: 'Seattle',
      country: 'USA',
      points: 900,
      isCurrentUser: true
    },
    {
      rank: 3,
      userId: 'user-3',
      name: 'Third User',
      photoUrl: 'photo3.jpg',
      city: 'Portland',
      country: 'USA',
      points: 800,
      isCurrentUser: false
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(leaderboardService.getLeaderboardByScope).mockResolvedValue(mockLeaderboardData);
  });

  describe('Scope Selector Buttons', () => {
    it('should render all scope selector buttons', async () => {
      render(<Leaderboard userId={mockUserId} showScopeSelector={true} />);

      await waitFor(() => {
        expect(screen.getByText('Friends')).toBeInTheDocument();
        expect(screen.getByText('City')).toBeInTheDocument();
        expect(screen.getByText('Country')).toBeInTheDocument();
        expect(screen.getByText('Global')).toBeInTheDocument();
      });
    });

    it('should highlight the active scope button (Friends by default)', async () => {
      render(<Leaderboard userId={mockUserId} scope="friends" showScopeSelector={true} />);

      await waitFor(() => {
        const friendsButton = screen.getByText('Friends').closest('button');
        expect(friendsButton).toHaveClass('bg-orange-500');
        expect(friendsButton).toHaveClass('text-white');
      });
    });

    it('should switch to City scope when City button is clicked', async () => {
      render(<Leaderboard userId={mockUserId} showScopeSelector={true} />);

      await waitFor(() => {
        const cityButton = screen.getByText('City').closest('button');
        fireEvent.click(cityButton!);
      });

      await waitFor(() => {
        expect(leaderboardService.getLeaderboardByScope).toHaveBeenCalledWith(
          'city',
          mockUserId,
          'weekly',
          20
        );

        const cityButton = screen.getByText('City').closest('button');
        expect(cityButton).toHaveClass('bg-orange-500');
      });
    });

    it('should switch to Country scope when Country button is clicked', async () => {
      render(<Leaderboard userId={mockUserId} showScopeSelector={true} />);

      await waitFor(() => {
        const countryButton = screen.getByText('Country').closest('button');
        fireEvent.click(countryButton!);
      });

      await waitFor(() => {
        expect(leaderboardService.getLeaderboardByScope).toHaveBeenCalledWith(
          'country',
          mockUserId,
          'weekly',
          20
        );

        const countryButton = screen.getByText('Country').closest('button');
        expect(countryButton).toHaveClass('bg-orange-500');
      });
    });

    it('should switch to Global scope when Global button is clicked', async () => {
      render(<Leaderboard userId={mockUserId} showScopeSelector={true} />);

      await waitFor(() => {
        const globalButton = screen.getByText('Global').closest('button');
        fireEvent.click(globalButton!);
      });

      await waitFor(() => {
        expect(leaderboardService.getLeaderboardByScope).toHaveBeenCalledWith(
          'global',
          mockUserId,
          'weekly',
          20
        );

        const globalButton = screen.getByText('Global').closest('button');
        expect(globalButton).toHaveClass('bg-orange-500');
      });
    });

    it('should not show scope selector when showScopeSelector is false', () => {
      render(<Leaderboard userId={mockUserId} showScopeSelector={false} />);

      expect(screen.queryByText('Friends')).not.toBeInTheDocument();
      expect(screen.queryByText('City')).not.toBeInTheDocument();
    });
  });

  describe('Leaderboard Display', () => {
    it('should display leaderboard entries with correct ranks', async () => {
      render(<Leaderboard userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('Top User')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Third User')).toBeInTheDocument();
      });
    });

    it('should highlight current user entry', async () => {
      render(<Leaderboard userId={mockUserId} />);

      await waitFor(() => {
        const currentUserEntry = screen.getByText('Test User').closest('div');
        expect(currentUserEntry).toHaveClass('bg-gradient-to-r');
        expect(currentUserEntry).toHaveClass('from-orange-100');
      });
    });

    it('should show YOU badge for current user', async () => {
      render(<Leaderboard userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('YOU')).toBeInTheDocument();
      });
    });

    it('should display medal icons for top 3', async () => {
      render(<Leaderboard userId={mockUserId} />);

      await waitFor(() => {
        const content = screen.getByText('Top User').parentElement?.parentElement;
        expect(content?.textContent).toContain('🥇');
      });
    });

    it('should display user points correctly', async () => {
      render(<Leaderboard userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('1,000')).toBeInTheDocument();
        expect(screen.getByText('900')).toBeInTheDocument();
        expect(screen.getByText('800')).toBeInTheDocument();
      });
    });

    it('should display city and country when available', async () => {
      render(<Leaderboard userId={mockUserId} />);

      await waitFor(() => {
        expect(screen.getByText('Seattle, USA')).toBeInTheDocument();
        expect(screen.getByText('Portland, USA')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner while fetching data', async () => {
      vi.mocked(leaderboardService.getLeaderboardByScope).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockLeaderboardData), 100))
      );

      render(<Leaderboard userId={mockUserId} />);

      expect(screen.getByText('Loading rankings...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Loading rankings...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no rankings available', async () => {
      vi.mocked(leaderboardService.getLeaderboardByScope).mockResolvedValue([]);

      render(<Leaderboard userId={mockUserId} scope="friends" />);

      await waitFor(() => {
        expect(screen.getByText('No rankings available yet.')).toBeInTheDocument();
        expect(screen.getByText('Add friends to compete with them!')).toBeInTheDocument();
      });
    });

    it('should show different empty message for non-friends scopes', async () => {
      vi.mocked(leaderboardService.getLeaderboardByScope).mockResolvedValue([]);

      render(<Leaderboard userId={mockUserId} scope="global" />);

      await waitFor(() => {
        expect(screen.getByText('Start tracking activities to appear on the leaderboard!')).toBeInTheDocument();
      });
    });
  });

  describe('Period Display', () => {
    it('should show "This Week" for weekly period', async () => {
      render(<Leaderboard userId={mockUserId} period="weekly" />);

      await waitFor(() => {
        expect(screen.getByText('This Week')).toBeInTheDocument();
      });
    });

    it('should show "This Month" for monthly period', async () => {
      render(<Leaderboard userId={mockUserId} period="monthly" />);

      await waitFor(() => {
        expect(screen.getByText('This Month')).toBeInTheDocument();
      });
    });

    it('should show "All Time" for allTime period', async () => {
      render(<Leaderboard userId={mockUserId} period="allTime" />);

      await waitFor(() => {
        expect(screen.getByText('All Time')).toBeInTheDocument();
      });
    });
  });

  describe('Re-fetching on Scope Change', () => {
    it('should re-fetch leaderboard when switching scopes', async () => {
      render(<Leaderboard userId={mockUserId} showScopeSelector={true} />);

      await waitFor(() => {
        expect(leaderboardService.getLeaderboardByScope).toHaveBeenCalledTimes(1);
      });

      const cityButton = screen.getByText('City').closest('button');
      fireEvent.click(cityButton!);

      await waitFor(() => {
        // Initial load + city click
        expect(leaderboardService.getLeaderboardByScope).toHaveBeenCalledTimes(2);
      });

      const globalButton = screen.getByText('Global').closest('button');
      fireEvent.click(globalButton!);

      await waitFor(() => {
        // Initial load + city click + global click
        expect(leaderboardService.getLeaderboardByScope).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Profile Photos', () => {
    it('should display user profile photos when available', async () => {
      render(<Leaderboard userId={mockUserId} />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThan(0);
        expect(images[0]).toHaveAttribute('src', 'photo1.jpg');
      });
    });
  });

  describe('Current User Below Rank 7', () => {
    it('should show current user separately if ranked below 7', async () => {
      const longLeaderboard = [
        ...Array(10).fill(null).map((_, i) => ({
          rank: i + 1,
          userId: `user-${i}`,
          name: `User ${i}`,
          points: 1000 - (i * 50),
          isCurrentUser: i === 8
        }))
      ] as any;

      vi.mocked(leaderboardService.getLeaderboardByScope).mockResolvedValue(longLeaderboard);

      render(<Leaderboard userId={mockUserId} />);

      await waitFor(() => {
        const yourRankBadges = screen.getAllByText('YOUR RANK');
        expect(yourRankBadges.length).toBeGreaterThan(0);
      });
    });
  });
});
