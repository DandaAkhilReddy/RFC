import { useState } from 'react';
import { ArrowLeft, ArrowRight, Upload, Loader, Sparkles } from 'lucide-react';
import CaptureAngle from './CaptureAngle';
import { createScan } from '../../lib/firestore/scans';
import { uploadBytes, ref as storageRef, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { useAuth } from '../AuthProvider';
import type { ScanAngle, AngleUrls } from '../../types/scan';

interface CapturedPhoto {
  blob: Blob;
  url: string; // Object URL for preview
}

type CapturedPhotos = Partial<Record<ScanAngle, CapturedPhoto>>;

const ANGLES: ScanAngle[] = ['front', 'back', 'left', 'right'];

export default function DailyScanWizard() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhotos>({});
  const [weight, setWeight] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');

  const currentAngle = ANGLES[currentStep];
  const isLastAngle = currentStep === ANGLES.length - 1;
  const allPhotosCaptured = ANGLES.every(angle => capturedPhotos[angle]);

  // Handle photo capture
  const handleCapture = (blob: Blob, angle: ScanAngle) => {
    const url = URL.createObjectURL(blob);
    setCapturedPhotos(prev => ({
      ...prev,
      [angle]: { blob, url },
    }));
  };

  // Handle retake
  const handleRetake = (angle: ScanAngle) => {
    setCapturedPhotos(prev => {
      const updated = { ...prev };
      // Revoke object URL to prevent memory leak
      if (updated[angle]) {
        URL.revokeObjectURL(updated[angle]!.url);
      }
      delete updated[angle];
      return updated;
    });
  };

  // Navigate steps
  const handleNext = () => {
    if (currentStep < ANGLES.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Upload photos to Firebase Storage
  const uploadPhotosToStorage = async (): Promise<AngleUrls | null> => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    const date = new Date().toISOString().split('T')[0];
    const timestamp = Date.now();
    const urls: Partial<AngleUrls> = {};

    try {
      for (const angle of ANGLES) {
        const photo = capturedPhotos[angle];
        if (!photo) {
          setError(`Missing photo: ${angle}`);
          return null;
        }

        setUploadProgress(`Uploading ${angle}...`);

        // Upload to Firebase Storage
        const path = `users/${user.uid}/scans/${date}/${timestamp}/${angle}.jpg`;
        const fileRef = storageRef(storage, path);
        await uploadBytes(fileRef, photo.blob);

        // Get download URL
        const downloadUrl = await getDownloadURL(fileRef);
        urls[angle] = downloadUrl;
      }

      if (urls.front && urls.back && urls.left && urls.right) {
        return urls as AngleUrls;
      } else {
        setError('Failed to upload all photos');
        return null;
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload photos');
      return null;
    }
  };

  // Submit scan
  const handleSubmit = async () => {
    if (!user || !allPhotosCaptured || !weight) {
      setError('Please complete all photos and enter your weight');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress('Preparing...');

    try {
      // Upload photos
      const angleUrls = await uploadPhotosToStorage();
      if (!angleUrls) {
        setUploading(false);
        return;
      }

      // Create scan document
      setUploadProgress('Creating scan record...');
      const date = new Date().toISOString().split('T')[0];
      const scanId = await createScan(user.uid, {
        date,
        weightLb: parseFloat(weight),
        angleUrls,
      });

      setUploadProgress('Processing complete!');

      // TODO: Trigger Temporal workflow via backend API
      // For now, the Temporal worker can watch for new scans in Firestore
      console.log('Scan created:', scanId);

      // Clean up object URLs
      Object.values(capturedPhotos).forEach(photo => {
        if (photo) URL.revokeObjectURL(photo.url);
      });

      // Navigate to scan dashboard with success message
      setTimeout(() => {
        window.location.href = '/scan-dashboard?scanCompleted=true';
      }, 2000);
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to submit scan');
      setUploading(false);
    }
  };

  // Show preview screen
  if (allPhotosCaptured && !uploading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Scan</h2>

          {/* Photo grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {ANGLES.map(angle => (
              <div key={angle} className="relative">
                <img
                  src={capturedPhotos[angle]?.url}
                  alt={`${angle} view`}
                  className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-white text-xs font-medium capitalize">{angle}</span>
                </div>
                <button
                  onClick={() => {
                    handleRetake(angle);
                    setCurrentStep(ANGLES.indexOf(angle));
                  }}
                  className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs hover:bg-white"
                >
                  Retake
                </button>
              </div>
            ))}
          </div>

          {/* Weight input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (lb) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="Enter your weight"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Weigh yourself first thing in the morning, before eating or drinking.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentStep(0)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Back to Photos
            </button>
            <button
              onClick={handleSubmit}
              disabled={!weight}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Submit & Analyze
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show uploading screen
  if (uploading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Your Scan</h3>
          <p className="text-gray-600">{uploadProgress}</p>
        </div>
      </div>
    );
  }

  // Show capture screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-orange-600 font-medium">Daily Scan</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Morning Body Scan</h1>
          <p className="text-gray-600 mt-1">
            Best results: 6:00 AM, before eating or drinking
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep + 1} of {ANGLES.length}</span>
            <span>{Math.round(((currentStep + 1) / ANGLES.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / ANGLES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Capture component */}
        <CaptureAngle
          angle={currentAngle}
          onCapture={handleCapture}
          onRetake={() => handleRetake(currentAngle)}
          captured={!!capturedPhotos[currentAngle]}
        />

        {/* Navigation */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!capturedPhotos[currentAngle] || isLastAngle}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnails of captured photos */}
        <div className="mt-6 flex gap-2 justify-center">
          {ANGLES.map(angle => (
            <div
              key={angle}
              className={`w-16 h-20 rounded border-2 ${
                capturedPhotos[angle]
                  ? 'border-green-500 bg-green-100'
                  : angle === currentAngle
                  ? 'border-orange-500 bg-orange-100'
                  : 'border-gray-300 bg-gray-100'
              } flex items-center justify-center`}
            >
              {capturedPhotos[angle] ? (
                <img
                  src={capturedPhotos[angle]!.url}
                  alt={angle}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <span className="text-xs text-gray-500 capitalize">{angle}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
