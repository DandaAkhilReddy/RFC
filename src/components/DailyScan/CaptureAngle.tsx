import { useState, useRef, useEffect } from 'react';
import { Camera, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ScanAngle } from '../../types/scan';

interface CaptureAngleProps {
  angle: ScanAngle;
  onCapture: (blob: Blob, angle: ScanAngle) => void;
  onRetake?: () => void;
  captured?: boolean;
}

const ANGLE_LABELS: Record<ScanAngle, string> = {
  front: 'Front View',
  back: 'Back View',
  left: 'Left Side',
  right: 'Right Side',
};

const ANGLE_INSTRUCTIONS: Record<ScanAngle, string> = {
  front: 'Face the camera. Keep your arms at your sides.',
  back: 'Turn around. Keep your arms at your sides.',
  left: 'Turn to your left. Stand sideways.',
  right: 'Turn to your right. Stand sideways.',
};

export default function CaptureAngle({
  angle,
  onCapture,
  onRetake,
  captured = false,
}: CaptureAngleProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string>('');
  const [capturing, setCapturing] = useState(false);
  const [lightingScore, setLightingScore] = useState<number>(0);

  // Start camera
  useEffect(() => {
    if (captured) return;

    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use rear camera
            width: { ideal: 1280 },
            height: { ideal: 1920 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
          setError('');

          // Start lighting check
          checkLighting();
        }
      } catch (err) {
        console.error('Camera error:', err);
        setError('Camera access denied. Please enable camera permissions.');
      }
    }

    startCamera();

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [captured]);

  // Check lighting quality
  const checkLighting = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 160; // Small sample
    canvas.height = 120;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      // Calculate relative luminance
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      totalBrightness += brightness;
    }

    const avgBrightness = totalBrightness / (data.length / 4);
    setLightingScore(avgBrightness);
  };

  // Capture photo
  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame
    ctx.drawImage(video, 0, 0);

    // Convert to blob
    canvas.toBlob(
      blob => {
        if (blob) {
          onCapture(blob, angle);
        }
        setCapturing(false);
      },
      'image/jpeg',
      0.9
    );
  };

  // Lighting quality indicator
  const getLightingStatus = () => {
    if (lightingScore < 0.3) {
      return { text: 'Too dark', color: 'text-red-500', icon: AlertCircle };
    } else if (lightingScore > 0.8) {
      return { text: 'Too bright', color: 'text-yellow-500', icon: AlertCircle };
    } else {
      return { text: 'Good lighting', color: 'text-green-500', icon: CheckCircle2 };
    }
  };

  const lightingStatus = getLightingStatus();
  const LightingIcon = lightingStatus.icon;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
        <p className="text-red-700 text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (captured) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle2 className="w-12 h-12 text-green-500 mb-2" />
        <p className="text-green-700 font-medium">✓ {ANGLE_LABELS[angle]} captured</p>
        {onRetake && (
          <button
            onClick={onRetake}
            className="mt-4 px-4 py-2 bg-white text-green-700 border border-green-300 rounded-lg hover:bg-green-50 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retake
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{ANGLE_LABELS[angle]}</h3>
        <p className="text-sm text-gray-600 mt-1">{ANGLE_INSTRUCTIONS[angle]}</p>
      </div>

      {/* Camera preview with overlay */}
      <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '3/4' }}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />

        {/* Silhouette overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <svg
            viewBox="0 0 100 200"
            className="h-full opacity-30"
            style={{ maxHeight: '90%' }}
          >
            {angle === 'front' || angle === 'back' ? (
              // Front/Back silhouette (symmetrical body)
              <path
                d="M50,10 L45,30 L40,50 L38,80 L40,120 L42,150 L40,180 L35,190 M50,10 L55,30 L60,50 L62,80 L60,120 L58,150 L60,180 L65,190"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              // Side silhouette (profile)
              <path
                d="M50,10 L55,30 L60,50 L62,80 L58,120 L55,150 L52,180 L50,190"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
            {/* Head circle */}
            <circle cx="50" cy="10" r="8" fill="none" stroke="#22d3ee" strokeWidth="2" />
          </svg>
        </div>

        {/* Lighting indicator */}
        {ready && (
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-2">
            <LightingIcon className={`w-4 h-4 ${lightingStatus.color}`} />
            <span className={`text-xs ${lightingStatus.color}`}>{lightingStatus.text}</span>
          </div>
        )}

        {/* Capture button */}
        {ready && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <button
              onClick={handleCapture}
              disabled={capturing}
              className="bg-white hover:bg-gray-100 disabled:bg-gray-300 rounded-full p-4 shadow-xl transition-transform active:scale-95"
              aria-label={`Capture ${angle} photo`}
            >
              <Camera className="w-8 h-8 text-gray-900" />
            </button>
          </div>
        )}

        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-white text-center">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p>Starting camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Tips */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-900">
          <strong>Tips:</strong> Ensure good lighting, wear fitted clothing, and align yourself with
          the outline.
        </p>
      </div>
    </div>
  );
}
