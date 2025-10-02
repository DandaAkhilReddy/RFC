import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedDashboard from '../components/EnhancedDashboard';
import { AuthProvider } from '../components/AuthProvider';

/**
 * Integration Test Suite for ReddyFit Application
 * 10 Comprehensive Test Agents
 */

describe('ReddyFit Integration Tests - 10 Test Agents', () => {

  // Test Agent 1: Dashboard Rendering Agent
  describe('Agent 1: Dashboard Rendering', () => {
    it('should render dashboard with all main sections', async () => {
      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Fitness Suite/i)).toBeInTheDocument();
      });
    });

    it('should display organized feature sections', async () => {
      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Active Features/i)).toBeInTheDocument();
        expect(screen.getByText(/Health & Analytics/i)).toBeInTheDocument();
        expect(screen.getByText(/Nutrition & Training/i)).toBeInTheDocument();
        expect(screen.getByText(/Advanced AI Tools/i)).toBeInTheDocument();
      });
    });
  });

  // Test Agent 2: AI Features Interaction Agent
  describe('Agent 2: AI Features Interaction', () => {
    it('should navigate to AI Chatbot when clicked', async () => {
      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      const chatbotCard = screen.getByText(/AI Chatbot/i);
      fireEvent.click(chatbotCard);

      await waitFor(() => {
        expect(screen.getByText(/Chat with Reddy/i)).toBeInTheDocument();
      });
    });

    it('should show alerts for coming soon features', async () => {
      const alertSpy = vi.spyOn(window, 'alert');

      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      const photoAnalysisCard = screen.getByText(/AI Photo Analysis/i);
      fireEvent.click(photoAnalysisCard);

      expect(alertSpy).toHaveBeenCalled();
    });
  });

  // Test Agent 3: Navigation Testing Agent
  describe('Agent 3: Navigation System', () => {
    it('should switch between dashboard pages', async () => {
      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      const aiAgentsButton = screen.getByText(/AI Agents/i);
      fireEvent.click(aiAgentsButton);

      await waitFor(() => {
        expect(screen.getByText(/AI-Powered Fitness Suite/i)).toBeInTheDocument();
      });
    });

    it('should toggle sidebar open and close', async () => {
      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      const menuButton = screen.getByRole('button', { name: /menu/i });
      fireEvent.click(menuButton);

      await waitFor(() => {
        const sidebar = screen.getByRole('navigation');
        expect(sidebar).toHaveClass('hidden');
      });
    });
  });

  // Test Agent 4: User Settings Agent
  describe('Agent 4: User Settings Management', () => {
    it('should update calorie goals', async () => {
      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      const editButton = screen.getByLabelText(/edit calorie goal/i);
      fireEvent.click(editButton);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '2500' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/2500/i)).toBeInTheDocument();
      });
    });

    it('should update workout goals', async () => {
      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      const editButton = screen.getByLabelText(/edit workout goal/i);
      fireEvent.click(editButton);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '7' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/7/i)).toBeInTheDocument();
      });
    });
  });

  // Test Agent 5: Community Features Agent
  describe('Agent 5: Community Interactions', () => {
    it('should like community posts', async () => {
      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      const communityButton = screen.getByText(/Community/i);
      fireEvent.click(communityButton);

      await waitFor(() => {
        const likeButton = screen.getAllByLabelText(/like post/i)[0];
        fireEvent.click(likeButton);

        expect(likeButton).toHaveClass('text-red-500');
      });
    });

    it('should display community posts correctly', async () => {
      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      const communityButton = screen.getByText(/Community/i);
      fireEvent.click(communityButton);

      await waitFor(() => {
        expect(screen.getByText(/Community Feed/i)).toBeInTheDocument();
      });
    });
  });

  // Test Agent 6: Workout Buddies Agent
  describe('Agent 6: Workout Buddies System', () => {
    it('should display workout buddy recommendations', async () => {
      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      const buddiesButton = screen.getByText(/Workout Buddies/i);
      fireEvent.click(buddiesButton);

      await waitFor(() => {
        expect(screen.getByText(/Find Workout Partners/i)).toBeInTheDocument();
      });
    });

    it('should show buddy distance and activities', async () => {
      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      const buddiesButton = screen.getByText(/Workout Buddies/i);
      fireEvent.click(buddiesButton);

      await waitFor(() => {
        const distanceElements = screen.getAllByText(/km/i);
        expect(distanceElements.length).toBeGreaterThan(0);
      });
    });
  });

  // Test Agent 7: Dating Matches Agent
  describe('Agent 7: Dating Matches System', () => {
    it('should display dating match cards', async () => {
      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      const datingButton = screen.getByText(/Dating/i);
      fireEvent.click(datingButton);

      await waitFor(() => {
        expect(screen.getByText(/Today's Matches/i)).toBeInTheDocument();
      });
    });

    it('should show compatibility scores', async () => {
      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      const datingButton = screen.getByText(/Dating/i);
      fireEvent.click(datingButton);

      await waitFor(() => {
        const compatibilityElements = screen.getAllByText(/%/i);
        expect(compatibilityElements.length).toBeGreaterThan(0);
      });
    });
  });

  // Test Agent 8: Onboarding Flow Agent
  describe('Agent 8: Onboarding Experience', () => {
    it('should show onboarding for first-time users', async () => {
      localStorage.removeItem('hasSeenOnboarding');

      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Welcome to ReddyFit Club/i)).toBeInTheDocument();
      });
    });

    it('should not show onboarding for returning users', async () => {
      localStorage.setItem('hasSeenOnboarding', 'true');

      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText(/Welcome to ReddyFit Club/i)).not.toBeInTheDocument();
      });
    });
  });

  // Test Agent 9: Responsive Design Agent
  describe('Agent 9: Responsive Layout', () => {
    it('should adapt to mobile viewport', async () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      await waitFor(() => {
        const sidebar = screen.getByRole('navigation');
        expect(sidebar).toHaveClass('hidden', 'md:block');
      });
    });

    it('should show mobile menu button on small screens', async () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      await waitFor(() => {
        const menuButton = screen.getByLabelText(/toggle sidebar/i);
        expect(menuButton).toBeVisible();
      });
    });
  });

  // Test Agent 10: Performance & Accessibility Agent
  describe('Agent 10: Performance & Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      await waitFor(() => {
        const navigation = screen.getByRole('navigation');
        expect(navigation).toHaveAttribute('aria-label');
      });
    });

    it('should load within acceptable time', async () => {
      const startTime = performance.now();

      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      await waitFor(() => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;

        expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
      });
    });

    it('should have keyboard navigation support', async () => {
      render(
        <AuthProvider>
          <EnhancedDashboard />
        </AuthProvider>
      );

      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();

      expect(document.activeElement).toBe(firstButton);

      fireEvent.keyDown(firstButton, { key: 'Tab' });

      expect(document.activeElement).not.toBe(firstButton);
    });
  });
});
