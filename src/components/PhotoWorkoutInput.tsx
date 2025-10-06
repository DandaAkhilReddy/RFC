import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader, Dumbbell, Activity, Timer, Flame, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { analyzeWorkoutPhotoWithGemini, WorkoutAnalysis, UserContext } from '../lib/geminiService';
import { storeWorkoutMemory } from '../lib/supermemoryService';

interface PhotoWorkoutInputProps {
  onAnalysisComplete: (result: WorkoutAnalysis & { photoUrl: string }) => void;
  onCancel: () => void;
  userContext: UserContext;
}

export default function PhotoWorkoutInput({ onAnalysisComplete, onCancel, userContext }: PhotoWorkoutInputProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<WorkoutAnalysis | null>(null);
  const [error, setError] = useState<string>('');
  const [editableResult, setEditableResult] = useState<WorkoutAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Max dimensions
          const maxWidth = 800;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to base64 JPEG
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          resolve(base64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setPhoto(file);
    setError('');

    try {
      // Create preview
      const preview = await compressImage(file);
      setPhotoPreview(preview);

      // Start analysis
      setAnalyzing(true);
      const result = await analyzeWorkoutPhotoWithGemini(preview, userContext);

      setAnalysisResult(result);
      setEditableResult(result);
      setAnalyzing(false);
    } catch (err) {
      console.error('Error analyzing workout photo:', err);
      setError('Failed to analyze image. Please try again.');
      setAnalyzing(false);
    }
  };

  const handleConfirm = async () => {
    if (editableResult && photoPreview) {
      // Store workout in Supermemory for AI long-term memory
      let memoryId: string | null = null;
      try {
        memoryId = await storeWorkoutMemory({
          userId: userContext.email,
          date: new Date().toISOString().split('T')[0],
          exercise: editableResult.exercise,
          duration: editableResult.duration,
          caloriesBurned: editableResult.calories,
          intensity: editableResult.intensity,
          workoutType: editableResult.equipment || undefined,
          userNotes: editableResult.notes,
        });
      } catch (error) {
        console.error('Failed to store workout memory:', error);
        // Don't block the UI if memory storage fails
      }

      onAnalysisComplete({
        ...editableResult,
        photoUrl: photoPreview,
        memoryId: memoryId || undefined
      });
    }
  };

  const handleRetry = () => {
    setPhoto(null);
    setPhotoPreview('');
    setAnalyzing(false);
    setAnalysisResult(null);
    setEditableResult(null);
    setError('');
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // No photo selected - show upload options
  if (!photo) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Photo Workout Tracking</h3>
          <p className="text-gray-600">Take a photo of your treadmill display or workout</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoSelect}
          className="hidden"
        />

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-3 font-semibold text-lg"
          >
            <Camera className="w-6 h-6" />
            <span>Take Photo</span>
          </button>

          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.removeAttribute('capture');
                fileInputRef.current.click();
              }
            }}
            className="p-4 bg-white border-2 border-blue-500 text-blue-600 rounded-2xl hover:bg-blue-50 transition-all flex items-center justify-center space-x-3 font-semibold"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Photo</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-red-700 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        <button
          onClick={onCancel}
          className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 transition"
        >
          Cancel
        </button>

        {/* Tips */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-cyan-800 mb-2">💡 Tips for best results:</p>
          <ul className="text-sm text-cyan-700 space-y-1">
            <li>• Capture treadmill/bike display clearly</li>
            <li>• Include visible metrics (calories, time, distance)</li>
            <li>• Good lighting helps AI read numbers</li>
            <li>• Works with gym equipment photos too!</li>
          </ul>
        </div>
      </div>
    );
  }

  // Analyzing state
  if (analyzing) {
    return (
      <div className="space-y-6 text-center">
        <div className="relative">
          <img
            src={photoPreview}
            alt="Workout preview"
            className="w-full h-64 object-cover rounded-2xl opacity-60"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8">
              <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Analyzing your workout...</h3>
              <p className="text-gray-600 animate-pulse">AI is detecting exercise and metrics</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Analysis complete - show results
  if (analysisResult && editableResult) {
    return (
      <div className="space-y-6">
        {/* Photo Preview */}
        <div className="relative">
          <img
            src={photoPreview}
            alt="Workout preview"
            className="w-full h-48 object-cover rounded-2xl"
          />
          <button
            onClick={handleRetry}
            className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Success Header */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 flex items-center space-x-3">
          <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-blue-900">Workout Detected!</h4>
            <p className="text-sm text-blue-700">Review and adjust if needed</p>
          </div>
        </div>

        {/* Exercise Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Exercise</label>
          <input
            type="text"
            value={editableResult.exercise}
            onChange={(e) => setEditableResult({...editableResult, exercise: e.target.value})}
            className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl text-lg font-bold text-blue-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Flame className="w-4 h-4 mr-1 text-orange-500" />
              Calories
            </label>
            <input
              type="number"
              value={editableResult.calories}
              onChange={(e) => setEditableResult({...editableResult, calories: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl text-lg font-bold text-orange-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Timer className="w-4 h-4 mr-1 text-purple-500" />
              Duration (min)
            </label>
            <input
              type="number"
              value={editableResult.duration}
              onChange={(e) => setEditableResult({...editableResult, duration: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl text-lg font-bold text-purple-600 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Distance (optional) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
            Distance (km) - Optional
          </label>
          <input
            type="number"
            step="0.1"
            value={editableResult.distance || ''}
            onChange={(e) => setEditableResult({...editableResult, distance: parseFloat(e.target.value) || undefined})}
            placeholder="e.g., 5.2"
            className="w-full px-4 py-3 border-2 border-green-300 rounded-xl text-lg font-bold text-green-600 focus:outline-none focus:border-green-500"
          />
        </div>

        {/* Intensity */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Activity className="w-4 h-4 mr-1" />
            Intensity
          </p>
          <div className="flex space-x-2">
            {['Low', 'Medium', 'High'].map((level) => (
              <button
                key={level}
                onClick={() => setEditableResult({...editableResult, intensity: level as any})}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  editableResult.intensity === level
                    ? `${getIntensityColor(level)} text-white`
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment (if available) */}
        {editableResult.equipment && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-indigo-700 mb-1">Equipment</p>
            <p className="text-indigo-900 font-medium">{editableResult.equipment}</p>
          </div>
        )}

        {/* Notes */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-700 mb-1">AI Notes</p>
          <p className="text-blue-900 text-sm italic">{editableResult.notes}</p>
        </div>

        {/* Recommendations */}
        {editableResult.recommendations.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-green-800 mb-3">💪 Recommendations</p>
            <ul className="space-y-2">
              {editableResult.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-green-700 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleConfirm}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-xl transition-all font-semibold"
          >
            Confirm & Add
          </button>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return null;
}
