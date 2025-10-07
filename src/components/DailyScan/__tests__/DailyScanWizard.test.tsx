/**
 * Unit Tests for DailyScanWizard Component
 *
 * Tests multi-step wizard flow, form validation, photo upload, AI analysis,
 * error handling, and success flow.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import DailyScanWizard from '../DailyScanWizard';

// Mock dependencies
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-123', email: 'test@example.com' },
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('lucide-react', () => ({
  Camera: () => <div data-testid="camera-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  CheckCircle: () => <div data-testid="check-icon" />,
  AlertCircle: () => <div data-testid="alert-icon" />,
  Upload: () => <div data-testid="upload-icon" />,
  Flame: () => <div data-testid="flame-icon" />,
}));

vi.mock('../CameraCapture', () => ({
  default: ({ angle, onCapture, onCancel }: any) => (
    <div data-testid="camera-capture">
      <p>Capturing {angle}</p>
      <button onClick={() => onCapture(new Blob())}>Capture</button>
      {onCancel && <button onClick={onCancel}>Cancel Camera</button>}
    </div>
  ),
}));

// Mock Firestore functions
const mockCreateScan = vi.fn();
const mockUpdateScanStatus = vi.fn();
const mockHasScannedToday = vi.fn();
const mockUpdateScanWithAnalysis = vi.fn();
const mockUpdateStreak = vi.fn();
const mockGetPreviousScan = vi.fn();
const mockCalculateScanDelta = vi.fn();

vi.mock('../../../lib/firestore/scans', () => ({
  createScan: (...args: any[]) => mockCreateScan(...args),
  updateScanStatus: (...args: any[]) => mockUpdateScanStatus(...args),
  hasScannedToday: (...args: any[]) => mockHasScannedToday(...args),
  updateScanWithAnalysis: (...args: any[]) => mockUpdateScanWithAnalysis(...args),
}));

vi.mock('../../../lib/firestore/scanHistory', () => ({
  updateStreak: (...args: any[]) => mockUpdateStreak(...args),
  getPreviousScan: (...args: any[]) => mockGetPreviousScan(...args),
  calculateScanDelta: (...args: any[]) => mockCalculateScanDelta(...args),
}));

// Mock AI analysis
const mockAnalyzeBodyComposition = vi.fn();

vi.mock('../../../services/geminiVision', () => ({
  analyzeBodyCompositionWithRetry: (...args: any[]) => mockAnalyzeBodyComposition(...args),
}));

// Mock storage service
const mockUploadAllScanPhotos = vi.fn();
const mockGetTotalPhotoSize = vi.fn();
const mockFormatBytes = vi.fn();

vi.mock('../../../services/storageService', () => ({
  uploadAllScanPhotos: (...args: any[]) => mockUploadAllScanPhotos(...args),
  getTotalPhotoSize: (...args: any[]) => mockGetTotalPhotoSize(...args),
  formatBytes: (...args: any[]) => mockFormatBytes(...args),
}));

describe('DailyScanWizard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHasScannedToday.mockResolvedValue(false);
    mockCreateScan.mockResolvedValue('scan-123');
    mockUpdateScanStatus.mockResolvedValue(undefined);
    mockUpdateScanWithAnalysis.mockResolvedValue(undefined);
    mockUpdateStreak.mockResolvedValue({ currentStreak: 5, longestStreak: 10 });
    mockGetPreviousScan.mockResolvedValue(null);
    mockGetTotalPhotoSize.mockReturnValue(5000000);
    mockFormatBytes.mockReturnValue('5 MB');
    mockAnalyzeBodyComposition.mockResolvedValue({
      success: true,
      bodyComposition: {
        bodyFatPercent: 18.5,
        leanBodyMass: 146.7,
        totalWeight: 180,
        estimatedMusclePercent: 42.3,
      },
      qualityCheck: {
        isValid: true,
        issues: [],
        confidence: 0.85,
      },
      confidence: 0.85,
      modelVersion: 'gemini-2.0-flash',
      processingTime: 1500,
    });
    mockUploadAllScanPhotos.mockResolvedValue([
      {
        angle: 'front',
        url: 'https://storage.example.com/front.jpg',
        storagePath: '/scans/scan-123/front.jpg',
        capturedAt: new Date(),
        fileSize: 1250000,
      },
      {
        angle: 'back',
        url: 'https://storage.example.com/back.jpg',
        storagePath: '/scans/scan-123/back.jpg',
        capturedAt: new Date(),
        fileSize: 1250000,
      },
      {
        angle: 'left',
        url: 'https://storage.example.com/left.jpg',
        storagePath: '/scans/scan-123/left.jpg',
        capturedAt: new Date(),
        fileSize: 1250000,
      },
      {
        angle: 'right',
        url: 'https://storage.example.com/right.jpg',
        storagePath: '/scans/scan-123/right.jpg',
        capturedAt: new Date(),
        fileSize: 1250000,
      },
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Step 1: Intro Screen', () => {
    it('should render intro screen on initial load', () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      expect(screen.getByText('Daily Body Scan')).toBeInTheDocument();
      expect(screen.getByText(/Track your body composition/i)).toBeInTheDocument();
    });

    it('should display what you need section', () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      expect(screen.getByText(/What you'll need:/i)).toBeInTheDocument();
      expect(screen.getByText(/4 photos/i)).toBeInTheDocument();
      expect(screen.getByText(/Good lighting/i)).toBeInTheDocument();
      expect(screen.getByText(/Form-fitting clothing/i)).toBeInTheDocument();
    });

    it('should render weight input field', () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      const weightInput = screen.getByPlaceholderText('Enter your weight');
      expect(weightInput).toBeInTheDocument();
      expect(weightInput).toHaveAttribute('type', 'number');
    });

    it('should render optional notes textarea', () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      const notesInput = screen.getByPlaceholderText(/How are you feeling/i);
      expect(notesInput).toBeInTheDocument();
    });

    it('should show Start Scan button', () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      expect(screen.getByText('Start Scan')).toBeInTheDocument();
    });

    it('should disable Start Scan button when weight not entered', () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      const startButton = screen.getByText('Start Scan').closest('button');
      expect(startButton).toBeDisabled();
    });

    it('should enable Start Scan button when valid weight entered', () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      const weightInput = screen.getByPlaceholderText('Enter your weight');
      fireEvent.change(weightInput, { target: { value: '180' } });

      const startButton = screen.getByText('Start Scan').closest('button');
      expect(startButton).not.toBeDisabled();
    });

    it('should show cancel button when onCancel provided', () => {
      const onCancel = vi.fn();

      render(
        <BrowserRouter>
          <DailyScanWizard onCancel={onCancel} />
        </BrowserRouter>
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should call onCancel when cancel button clicked', () => {
      const onCancel = vi.fn();

      render(
        <BrowserRouter>
          <DailyScanWizard onCancel={onCancel} />
        </BrowserRouter>
      );

      fireEvent.click(screen.getByText('Cancel'));
      expect(onCancel).toHaveBeenCalled();
    });

    it('should show privacy notice', () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      expect(screen.getByText(/Your scan photos are private by default/i)).toBeInTheDocument();
    });

    it('should check if user has scanned today on mount', async () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockHasScannedToday).toHaveBeenCalledWith('test-user-123');
      });
    });

    it('should show already scanned warning when user scanned today', async () => {
      mockHasScannedToday.mockResolvedValue(true);

      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/You've already scanned today!/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step 2: Starting Scan', () => {
    it('should create scan when Start button clicked', async () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      const weightInput = screen.getByPlaceholderText('Enter your weight');
      fireEvent.change(weightInput, { target: { value: '180' } });

      const startButton = screen.getByText('Start Scan');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(mockCreateScan).toHaveBeenCalledWith('test-user-123', 180, '');
      });
    });

    it('should include notes when creating scan', async () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      const weightInput = screen.getByPlaceholderText('Enter your weight');
      fireEvent.change(weightInput, { target: { value: '180' } });

      const notesInput = screen.getByPlaceholderText(/How are you feeling/i);
      fireEvent.change(notesInput, { target: { value: 'Feeling great!' } });

      const startButton = screen.getByText('Start Scan');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(mockCreateScan).toHaveBeenCalledWith('test-user-123', 180, 'Feeling great!');
      });
    });

    it('should show error when weight is 0', async () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      const weightInput = screen.getByPlaceholderText('Enter your weight');
      fireEvent.change(weightInput, { target: { value: '0' } });

      const startButton = screen.getByText('Start Scan');
      expect(startButton.closest('button')).toBeDisabled();
    });

    it('should show error when scan creation fails', async () => {
      mockCreateScan.mockRejectedValue(new Error('Network error'));

      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      const weightInput = screen.getByPlaceholderText('Enter your weight');
      fireEvent.change(weightInput, { target: { value: '180' } });

      const startButton = screen.getByText('Start Scan');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to start scan/i)).toBeInTheDocument();
      });
    });

    it('should move to capture step after scan created', async () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      const weightInput = screen.getByPlaceholderText('Enter your weight');
      fireEvent.change(weightInput, { target: { value: '180' } });

      const startButton = screen.getByText('Start Scan');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText(/Capture Front View/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step 3: Photo Capture', () => {
    beforeEach(async () => {
      const { container } = render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      const weightInput = screen.getByPlaceholderText('Enter your weight');
      fireEvent.change(weightInput, { target: { value: '180' } });

      const startButton = screen.getByText('Start Scan');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByTestId('camera-capture')).toBeInTheDocument();
      });
    });

    it('should render camera capture component', () => {
      expect(screen.getByTestId('camera-capture')).toBeInTheDocument();
    });

    it('should show progress indicator', () => {
      expect(screen.getByText(/1 of 4/i)).toBeInTheDocument();
    });

    it('should capture front photo first', () => {
      expect(screen.getByText(/Capturing front/i)).toBeInTheDocument();
    });

    it('should move to next angle after capture', async () => {
      const captureButton = screen.getByText('Capture');
      fireEvent.click(captureButton);

      await waitFor(() => {
        expect(screen.getByText(/Capturing back/i)).toBeInTheDocument();
      });
    });

    it('should update progress after each capture', async () => {
      const captureButton = screen.getByText('Capture');

      // Capture front
      fireEvent.click(captureButton);
      await waitFor(() => expect(screen.getByText(/2 of 4/i)).toBeInTheDocument());

      // Capture back
      fireEvent.click(screen.getByText('Capture'));
      await waitFor(() => expect(screen.getByText(/3 of 4/i)).toBeInTheDocument());

      // Capture left
      fireEvent.click(screen.getByText('Capture'));
      await waitFor(() => expect(screen.getByText(/4 of 4/i)).toBeInTheDocument());
    });

    it('should return to intro when cancel clicked', async () => {
      const cancelButton = screen.getByText('Cancel Camera');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText('Daily Body Scan')).toBeInTheDocument();
      });
    });
  });

  describe('Step 4: Upload Photos', () => {
    it('should upload photos after all 4 captured', async () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      // Start scan
      const weightInput = screen.getByPlaceholderText('Enter your weight');
      fireEvent.change(weightInput, { target: { value: '180' } });
      fireEvent.click(screen.getByText('Start Scan'));

      await waitFor(() => expect(screen.getByTestId('camera-capture')).toBeInTheDocument());

      // Capture all 4 photos
      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByText('Capture'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      await waitFor(() => {
        expect(mockUploadAllScanPhotos).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should show upload progress screen', async () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      const weightInput = screen.getByPlaceholderText('Enter your weight');
      fireEvent.change(weightInput, { target: { value: '180' } });
      fireEvent.click(screen.getByText('Start Scan'));

      await waitFor(() => expect(screen.getByTestId('camera-capture')).toBeInTheDocument());

      // Capture all 4 photos
      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByText('Capture'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      await waitFor(() => {
        expect(screen.getByText('Uploading Your Photos')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Step 5: AI Processing', () => {
    it('should analyze photos with Gemini after upload', async () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      const weightInput = screen.getByPlaceholderText('Enter your weight');
      fireEvent.change(weightInput, { target: { value: '180' } });
      fireEvent.click(screen.getByText('Start Scan'));

      await waitFor(() => expect(screen.getByTestId('camera-capture')).toBeInTheDocument());

      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByText('Capture'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      await waitFor(() => {
        expect(mockAnalyzeBodyComposition).toHaveBeenCalled();
      }, { timeout: 5000 });
    });

    it('should show processing screen', async () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      const weightInput = screen.getByPlaceholderText('Enter your weight');
      fireEvent.change(weightInput, { target: { value: '180' } });
      fireEvent.click(screen.getByText('Start Scan'));

      await waitFor(() => expect(screen.getByTestId('camera-capture')).toBeInTheDocument());

      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByText('Capture'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      await waitFor(() => {
        expect(screen.getByText(/Analyzing Your Body Composition/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should update scan with analysis results', async () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      const weightInput = screen.getByPlaceholderText('Enter your weight');
      fireEvent.change(weightInput, { target: { value: '180' } });
      fireEvent.click(screen.getByText('Start Scan'));

      await waitFor(() => expect(screen.getByTestId('camera-capture')).toBeInTheDocument());

      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByText('Capture'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      await waitFor(() => {
        expect(mockUpdateScanWithAnalysis).toHaveBeenCalledWith(
          'scan-123',
          expect.objectContaining({
            bodyComposition: expect.objectContaining({
              bodyFatPercent: 18.5,
              leanBodyMass: 146.7,
            }),
          })
        );
      }, { timeout: 5000 });
    });

    it('should update streak after completion', async () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      const weightInput = screen.getByPlaceholderText('Enter your weight');
      fireEvent.change(weightInput, { target: { value: '180' } });
      fireEvent.click(screen.getByText('Start Scan'));

      await waitFor(() => expect(screen.getByTestId('camera-capture')).toBeInTheDocument());

      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByText('Capture'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      await waitFor(() => {
        expect(mockUpdateStreak).toHaveBeenCalledWith('test-user-123');
      }, { timeout: 5000 });
    });
  });

  describe('Step 6: Results', () => {
    it('should show results screen after completion', async () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      const weightInput = screen.getByPlaceholderText('Enter your weight');
      fireEvent.change(weightInput, { target: { value: '180' } });
      fireEvent.click(screen.getByText('Start Scan'));

      await waitFor(() => expect(screen.getByTestId('camera-capture')).toBeInTheDocument());

      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByText('Capture'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      await waitFor(() => {
        expect(screen.getByText('Scan Complete!')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should show View Results button', async () => {
      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      const weightInput = screen.getByPlaceholderText('Enter your weight');
      fireEvent.change(weightInput, { target: { value: '180' } });
      fireEvent.click(screen.getByText('Start Scan'));

      await waitFor(() => expect(screen.getByTestId('camera-capture')).toBeInTheDocument());

      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByText('Capture'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      await waitFor(() => {
        expect(screen.getByText('View Results')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should call onComplete when provided', async () => {
      const onComplete = vi.fn();

      render(
        <BrowserRouter>
          <DailyScanWizard onComplete={onComplete} />
        </BrowserRouter>
      );

      const weightInput = screen.getByPlaceholderText('Enter your weight');
      fireEvent.change(weightInput, { target: { value: '180' } });
      fireEvent.click(screen.getByText('Start Scan'));

      await waitFor(() => expect(screen.getByTestId('camera-capture')).toBeInTheDocument());

      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByText('Capture'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      await waitFor(() => expect(screen.getByText('View Results')).toBeInTheDocument(), { timeout: 5000 });

      fireEvent.click(screen.getByText('View Results'));

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith('scan-123');
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error when upload fails', async () => {
      mockUploadAllScanPhotos.mockRejectedValue(new Error('Upload failed'));

      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      const weightInput = screen.getByPlaceholderText('Enter your weight');
      fireEvent.change(weightInput, { target: { value: '180' } });
      fireEvent.click(screen.getByText('Start Scan'));

      await waitFor(() => expect(screen.getByTestId('camera-capture')).toBeInTheDocument());

      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByText('Capture'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      await waitFor(() => {
        expect(screen.getByText(/Failed to process scan/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should show error when AI analysis fails', async () => {
      mockAnalyzeBodyComposition.mockResolvedValue({
        success: false,
        errorMessage: 'AI analysis failed',
        confidence: 0,
        modelVersion: 'gemini-2.0-flash',
        processingTime: 500,
        qualityCheck: {
          isValid: false,
          issues: ['Analysis failed'],
          confidence: 0,
        },
      });

      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      const weightInput = screen.getByPlaceholderText('Enter your weight');
      fireEvent.change(weightInput, { target: { value: '180' } });
      fireEvent.click(screen.getByText('Start Scan'));

      await waitFor(() => expect(screen.getByTestId('camera-capture')).toBeInTheDocument());

      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByText('Capture'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      await waitFor(() => {
        expect(screen.getByText(/Failed to process scan/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should update scan status to failed on error', async () => {
      mockAnalyzeBodyComposition.mockRejectedValue(new Error('Network error'));

      render(
        <BrowserRouter>
          <DailyScanWizard />
        </BrowserRouter>
      );

      const weightInput = screen.getByPlaceholderText('Enter your weight');
      fireEvent.change(weightInput, { target: { value: '180' } });
      fireEvent.click(screen.getByText('Start Scan'));

      await waitFor(() => expect(screen.getByTestId('camera-capture')).toBeInTheDocument());

      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByText('Capture'));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      await waitFor(() => {
        expect(mockUpdateScanStatus).toHaveBeenCalledWith(
          'scan-123',
          'failed',
          expect.any(String)
        );
      }, { timeout: 5000 });
    });
  });
});
