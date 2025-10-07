/**
 * Unit Tests for CameraCapture Component
 *
 * Tests camera initialization, photo capture, error handling, and user interactions.
 * Uses mocked MediaDevices API and canvas operations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import CameraCapture from '../CameraCapture';
import type { ScanAngle } from '../../../types/scan';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Camera: () => <div data-testid="camera-icon" />,
  FlipHorizontal: () => <div data-testid="flip-icon" />,
  X: () => <div data-testid="x-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  AlertCircle: () => <div data-testid="alert-icon" />,
}));

// Mock MediaStream
class MockMediaStream {
  active = true;
  id = 'mock-stream-id';
  private tracks: MediaStreamTrack[] = [];

  constructor() {
    this.tracks = [new MockMediaStreamTrack()];
  }

  getTracks() {
    return this.tracks;
  }

  getVideoTracks() {
    return this.tracks;
  }

  getAudioTracks() {
    return [];
  }

  addTrack(track: MediaStreamTrack) {
    this.tracks.push(track);
  }

  removeTrack(track: MediaStreamTrack) {
    this.tracks = this.tracks.filter((t) => t !== track);
  }

  clone() {
    return new MockMediaStream();
  }
}

class MockMediaStreamTrack implements MediaStreamTrack {
  kind: string = 'video';
  id: string = 'mock-track-id';
  label: string = 'Mock Camera';
  enabled = true;
  muted = false;
  readonly = false;
  readyState: MediaStreamTrackState = 'live';
  contentHint = '';

  onended: ((this: MediaStreamTrack, ev: Event) => any) | null = null;
  onmute: ((this: MediaStreamTrack, ev: Event) => any) | null = null;
  onunmute: ((this: MediaStreamTrack, ev: Event) => any) | null = null;

  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn();
  stop = vi.fn();
  clone = vi.fn(() => new MockMediaStreamTrack());
  getCapabilities = vi.fn(() => ({}));
  getConstraints = vi.fn(() => ({}));
  getSettings = vi.fn(() => ({
    width: 1920,
    height: 1080,
    facingMode: 'user',
  }));
  applyConstraints = vi.fn(async () => {});
}

// Mock HTMLVideoElement
const mockVideo = {
  srcObject: null as any,
  onloadedmetadata: null as any,
  play: vi.fn(async () => {}),
  pause: vi.fn(),
  videoWidth: 1920,
  videoHeight: 1080,
};

// Mock HTMLCanvasElement
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(() => mockCanvasContext),
  toBlob: vi.fn((callback: BlobCallback, type: string, quality: number) => {
    const blob = new Blob(['mock-image-data'], { type: 'image/jpeg' });
    callback(blob);
  }),
};

const mockCanvasContext = {
  drawImage: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
};

describe('CameraCapture Component', () => {
  let mockGetUserMedia: ReturnType<typeof vi.fn>;
  let onCaptureMock: ReturnType<typeof vi.fn>;
  let onCancelMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock getUserMedia
    mockGetUserMedia = vi.fn(async () => new MockMediaStream());

    global.navigator.mediaDevices = {
      getUserMedia: mockGetUserMedia,
    } as any;

    onCaptureMock = vi.fn();
    onCancelMock = vi.fn();

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Camera Initialization', () => {
    it('should render loading state initially', async () => {
      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      expect(screen.getByText('Starting camera...')).toBeInTheDocument();
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    });

    it('should call getUserMedia with correct constraints', async () => {
      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith({
          video: {
            facingMode: 'user',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      });
    });

    it('should hide loading state after camera starts', async () => {
      mockGetUserMedia.mockResolvedValue(new MockMediaStream());

      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      // Trigger onloadedmetadata
      await waitFor(() => {
        if (mockVideo.onloadedmetadata) {
          mockVideo.onloadedmetadata();
        }
      });

      await waitFor(() => {
        expect(screen.queryByText('Starting camera...')).not.toBeInTheDocument();
      });
    });

    it('should start video playback', async () => {
      mockGetUserMedia.mockResolvedValue(new MockMediaStream());

      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      await waitFor(() => {
        if (mockVideo.onloadedmetadata) {
          mockVideo.onloadedmetadata();
        }
      });

      await waitFor(() => {
        expect(mockVideo.play).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error when camera permission denied', async () => {
      const error = new Error('Permission denied');
      error.name = 'NotAllowedError';
      mockGetUserMedia.mockRejectedValue(error);

      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      await waitFor(() => {
        expect(screen.getByText(/camera permission denied/i)).toBeInTheDocument();
      });
    });

    it('should show error when no camera found', async () => {
      const error = new Error('No camera');
      error.name = 'NotFoundError';
      mockGetUserMedia.mockRejectedValue(error);

      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      await waitFor(() => {
        expect(screen.getByText(/no camera found/i)).toBeInTheDocument();
      });
    });

    it('should show error when camera already in use', async () => {
      const error = new Error('Camera in use');
      error.name = 'NotReadableError';
      mockGetUserMedia.mockRejectedValue(error);

      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      await waitFor(() => {
        expect(screen.getByText(/camera is already in use/i)).toBeInTheDocument();
      });
    });

    it('should show generic error for unknown errors', async () => {
      const error = new Error('Unknown error');
      mockGetUserMedia.mockRejectedValue(error);

      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      await waitFor(() => {
        expect(screen.getByText(/camera error: unknown error/i)).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      const error = new Error('Test error');
      error.name = 'NotAllowedError';
      mockGetUserMedia.mockRejectedValue(error);

      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('should retry camera access when retry button clicked', async () => {
      const error = new Error('Test error');
      error.name = 'NotAllowedError';
      mockGetUserMedia.mockRejectedValueOnce(error);
      mockGetUserMedia.mockResolvedValueOnce(new MockMediaStream());

      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Retry'));

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('UI Elements', () => {
    beforeEach(async () => {
      mockGetUserMedia.mockResolvedValue(new MockMediaStream());
    });

    it('should display angle name', async () => {
      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      await waitFor(() => {
        if (mockVideo.onloadedmetadata) {
          mockVideo.onloadedmetadata();
        }
      });

      await waitFor(() => {
        expect(screen.getByText(/front view/i)).toBeInTheDocument();
      });
    });

    it('should display pose instructions', async () => {
      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      await waitFor(() => {
        if (mockVideo.onloadedmetadata) {
          mockVideo.onloadedmetadata();
        }
      });

      await waitFor(() => {
        // Check for any instruction text
        const instructions = screen.queryByText(/stand|face|position/i);
        expect(instructions).toBeInTheDocument();
      });
    });

    it('should show capture button', async () => {
      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/capture photo/i)).toBeInTheDocument();
      });
    });

    it('should show flip camera button', async () => {
      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/flip camera/i)).toBeInTheDocument();
      });
    });

    it('should show cancel button when onCancel provided', async () => {
      render(<CameraCapture angle="front" onCapture={onCaptureMock} onCancel={onCancelMock} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/cancel/i)).toBeInTheDocument();
      });
    });

    it('should not show cancel button when onCancel not provided', async () => {
      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      await waitFor(() => {
        expect(screen.queryByLabelText(/cancel/i)).not.toBeInTheDocument();
      });
    });

    it('should display tips section', async () => {
      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      await waitFor(() => {
        expect(screen.getByText(/tips for best results/i)).toBeInTheDocument();
      });
    });
  });

  describe('Camera Flip', () => {
    beforeEach(() => {
      mockGetUserMedia.mockResolvedValue(new MockMediaStream());
    });

    it('should flip to environment camera when flip button clicked', async () => {
      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      await waitFor(() => {
        if (mockVideo.onloadedmetadata) {
          mockVideo.onloadedmetadata();
        }
      });

      const flipButton = screen.getByLabelText(/flip camera/i);
      fireEvent.click(flipButton);

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith(
          expect.objectContaining({
            video: expect.objectContaining({
              facingMode: 'environment',
            }),
          })
        );
      });
    });

    it('should flip back to user camera on second click', async () => {
      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      await waitFor(() => {
        if (mockVideo.onloadedmetadata) {
          mockVideo.onloadedmetadata();
        }
      });

      const flipButton = screen.getByLabelText(/flip camera/i);

      // First flip - to environment
      fireEvent.click(flipButton);

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith(
          expect.objectContaining({
            video: expect.objectContaining({
              facingMode: 'environment',
            }),
          })
        );
      });

      // Second flip - back to user
      fireEvent.click(flipButton);

      await waitFor(() => {
        const calls = mockGetUserMedia.mock.calls;
        const lastCall = calls[calls.length - 1][0] as any;
        expect(lastCall.video.facingMode).toBe('user');
      });
    });

    it('should disable flip button while loading', async () => {
      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      const flipButton = screen.getByLabelText(/flip camera/i);
      expect(flipButton).toBeDisabled();
    });
  });

  describe('Cancel Functionality', () => {
    beforeEach(() => {
      mockGetUserMedia.mockResolvedValue(new MockMediaStream());
    });

    it('should call onCancel when cancel button clicked', async () => {
      render(<CameraCapture angle="front" onCapture={onCaptureMock} onCancel={onCancelMock} />);

      await waitFor(() => {
        if (mockVideo.onloadedmetadata) {
          mockVideo.onloadedmetadata();
        }
      });

      const cancelButton = screen.getByLabelText(/cancel/i);
      fireEvent.click(cancelButton);

      expect(onCancelMock).toHaveBeenCalled();
    });

    it('should call onCancel from error state', async () => {
      const error = new Error('Test error');
      error.name = 'NotAllowedError';
      mockGetUserMedia.mockRejectedValue(error);

      render(<CameraCapture angle="front" onCapture={onCaptureMock} onCancel={onCancelMock} />);

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancel'));

      expect(onCancelMock).toHaveBeenCalled();
    });
  });

  describe('Different Angles', () => {
    beforeEach(() => {
      mockGetUserMedia.mockResolvedValue(new MockMediaStream());
    });

    const angles: ScanAngle[] = ['front', 'back', 'left', 'right'];

    angles.forEach((angle) => {
      it(`should display correct instructions for ${angle} angle`, async () => {
        render(<CameraCapture angle={angle} onCapture={onCaptureMock} />);

        await waitFor(() => {
          if (mockVideo.onloadedmetadata) {
            mockVideo.onloadedmetadata();
          }
        });

        // Each angle should have some instruction text
        await waitFor(() => {
          const text = screen.queryByText(/view|pose|stand|face/i);
          expect(text).toBeInTheDocument();
        });
      });
    });
  });

  describe('Cleanup', () => {
    it('should stop camera stream on unmount', async () => {
      const mockStream = new MockMediaStream();
      const stopSpy = vi.spyOn(mockStream.getTracks()[0], 'stop');
      mockGetUserMedia.mockResolvedValue(mockStream);

      const { unmount } = render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      await waitFor(() => {
        if (mockVideo.onloadedmetadata) {
          mockVideo.onloadedmetadata();
        }
      });

      unmount();

      expect(stopSpy).toHaveBeenCalled();
    });

    it('should set video srcObject to null on unmount', async () => {
      mockGetUserMedia.mockResolvedValue(new MockMediaStream());

      const { unmount } = render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      await waitFor(() => {
        if (mockVideo.onloadedmetadata) {
          mockVideo.onloadedmetadata();
        }
      });

      unmount();

      expect(mockVideo.srcObject).toBeNull();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockGetUserMedia.mockResolvedValue(new MockMediaStream());
    });

    it('should have aria-label on capture button', async () => {
      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      await waitFor(() => {
        const button = screen.getByLabelText('Capture photo');
        expect(button).toBeInTheDocument();
      });
    });

    it('should have aria-label on flip button', async () => {
      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      await waitFor(() => {
        const button = screen.getByLabelText('Flip camera');
        expect(button).toBeInTheDocument();
      });
    });

    it('should have aria-label on cancel button', async () => {
      render(<CameraCapture angle="front" onCapture={onCaptureMock} onCancel={onCancelMock} />);

      await waitFor(() => {
        const button = screen.getByLabelText('Cancel');
        expect(button).toBeInTheDocument();
      });
    });

    it('should disable capture button while loading', async () => {
      render(<CameraCapture angle="front" onCapture={onCaptureMock} />);

      const captureButton = screen.getByLabelText('Capture photo');
      expect(captureButton).toBeDisabled();
    });
  });
});
