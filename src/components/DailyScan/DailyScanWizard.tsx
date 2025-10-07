/**
 * Daily Scan Wizard Component
 *
 * Multi-step wizard for capturing 4-angle body scan photos.
 * Steps: Intro → Capture Photos → Upload → Processing → Results
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createScan, updateScanStatus, hasScannedToday } from '../../lib/firestore/scans';
import type { WizardStep, ScanPhoto, ScanAngle } from '../../types/scan';
import { SCAN_ANGLE_ORDER, ANGLE_DISPLAY_NAMES } from '../../types/scan';

// We'll import these components after creating them
// import CameraCapture from './CameraCapture';
// import UploadProgress from './UploadProgress';

interface DailyScanWizardProps {
  onComplete?: (scanId: string) => void;
  onCancel?: () => void;
}

const DailyScanWizard: React.FC<DailyScanWizardProps> = ({ onComplete, onCancel }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('intro');
  const [capturedPhotos, setCapturedPhotos] = useState<ScanPhoto[]>([]);
  const [currentAngle, setCurrentAngle] = useState<ScanAngle>('front');
  const [weight, setWeight] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [scanId, setScanId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasScannedTodayState, setHasScannedTodayState] = useState(false);

  // Check if user has already scanned today
  useEffect(() => {
    if (user?.uid) {
      hasScannedToday(user.uid).then(setHasScannedTodayState);
    }
  }, [user?.uid]);

  // Start scan flow
  const handleStartScan = async () => {
    if (!user?.uid) {
      setError('You must be logged in to scan');
      return;
    }

    if (!weight || weight <= 0) {
      setError('Please enter your current weight');
      return;
    }

    try {
      setIsProcessing(true);
      const newScanId = await createScan(user.uid, weight, notes);
      setScanId(newScanId);
      setCurrentStep('capture');
      setError(null);
    } catch (err) {
      setError('Failed to start scan. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle photo captured
  const handlePhotoCaptured = (photo: ScanPhoto) => {
    setCapturedPhotos((prev) => [...prev, photo]);

    // Find next angle
    const currentIndex = SCAN_ANGLE_ORDER.indexOf(currentAngle);
    if (currentIndex < SCAN_ANGLE_ORDER.length - 1) {
      setCurrentAngle(SCAN_ANGLE_ORDER[currentIndex + 1]);
    } else {
      // All photos captured, move to upload
      setCurrentStep('upload');
    }
  };

  // Handle scan completion
  const handleScanComplete = () => {
    if (scanId) {
      updateScanStatus(scanId, 'completed').then(() => {
        if (onComplete) {
          onComplete(scanId);
        } else {
          navigate(`/scan/results/${scanId}`);
        }
      });
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'intro':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mb-4">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Daily Body Scan
              </h2>
              <p className="text-gray-600">
                Track your body composition with AI-powered precision
              </p>
            </div>

            {/* Already scanned today notice */}
            {hasScannedTodayState && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium">You've already scanned today!</p>
                    <p className="mt-1">
                      For best results, scan once per day at the same time.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                What you'll need:
              </h3>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>4 photos (front, back, left side, right side)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>Good lighting (natural light is best)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>Form-fitting clothing or undergarments</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>About 2 minutes of your time</span>
                </li>
              </ul>
            </div>

            {/* Weight input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Weight (lbs) *
              </label>
              <input
                type="number"
                value={weight || ''}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                placeholder="Enter your weight"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="0"
                step="0.1"
              />
            </div>

            {/* Optional notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How are you feeling today? Any changes to note?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex space-x-4">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleStartScan}
                disabled={isProcessing || !weight || weight <= 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span>Start Scan</span>
                  </>
                )}
              </button>
            </div>

            {/* Privacy notice */}
            <p className="text-xs text-gray-500 text-center">
              Your scan photos are private by default and never shared without your permission.
            </p>
          </div>
        );

      case 'capture':
        return (
          <div className="space-y-6">
            {/* Progress indicator */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Capture {ANGLE_DISPLAY_NAMES[currentAngle]}
                </h3>
                <span className="text-sm text-gray-600">
                  {capturedPhotos.length + 1} of 4
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(capturedPhotos.length / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Camera component (placeholder for now) */}
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg aspect-[3/4] flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Camera Component Will Go Here
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Current angle: {ANGLE_DISPLAY_NAMES[currentAngle]}
                </p>
              </div>
            </div>

            {/* Temporary skip button for testing */}
            <button
              onClick={() => {
                // Mock photo for testing
                const mockPhoto: ScanPhoto = {
                  angle: currentAngle,
                  url: 'https://via.placeholder.com/600x800',
                  storagePath: `scans/${scanId}/${currentAngle}.jpg`,
                  capturedAt: new Date(),
                  fileSize: 1024 * 500, // 500KB
                };
                handlePhotoCaptured(mockPhoto);
              }}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Skip (Test Mode)
            </button>
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-6 text-center">
            <Loader2 className="w-16 h-16 text-primary-500 mx-auto animate-spin" />
            <h3 className="text-2xl font-bold text-gray-900">
              Uploading Your Photos...
            </h3>
            <p className="text-gray-600">
              Please wait while we securely upload your scan photos
            </p>
            {/* Progress bars will go here */}
          </div>
        );

      case 'processing':
        return (
          <div className="space-y-6 text-center">
            <Loader2 className="w-16 h-16 text-primary-500 mx-auto animate-spin" />
            <h3 className="text-2xl font-bold text-gray-900">
              Analyzing Your Body Composition...
            </h3>
            <p className="text-gray-600">
              Our AI is analyzing your photos. This typically takes 30-60 seconds.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                ✨ Using Gemini 2.0 Flash for precision analysis
              </p>
            </div>
          </div>
        );

      case 'results':
        return (
          <div className="space-y-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-2xl font-bold text-gray-900">
              Scan Complete!
            </h3>
            <p className="text-gray-600">
              Your body composition has been analyzed
            </p>
            <button
              onClick={handleScanComplete}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              View Results
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default DailyScanWizard;
