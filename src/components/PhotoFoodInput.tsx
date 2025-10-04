import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader, Sparkles, Star, CheckCircle2, Edit2 } from 'lucide-react';
import { analyzeMealPhotoWithGemini, MealAnalysis, UserContext } from '../lib/geminiService';

interface PhotoFoodInputProps {
  onAnalysisComplete: (result: MealAnalysis & { photoUrl: string }) => void;
  onCancel: () => void;
  userContext: UserContext;
}

export default function PhotoFoodInput({ onAnalysisComplete, onCancel, userContext }: PhotoFoodInputProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MealAnalysis | null>(null);
  const [error, setError] = useState<string>('');
  const [editableResult, setEditableResult] = useState<MealAnalysis | null>(null);
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
      const result = await analyzeMealPhotoWithGemini(preview, userContext);

      setAnalysisResult(result);
      setEditableResult(result);
      setAnalyzing(false);
    } catch (err) {
      console.error('Error analyzing food photo:', err);
      setError('Failed to analyze image. Please try again.');
      setAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    if (editableResult && photoPreview) {
      onAnalysisComplete({
        ...editableResult,
        photoUrl: photoPreview
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

  // No photo selected - show upload options
  if (!photo) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Take a Food Photo</h3>
          <p className="text-gray-600">AI will instantly analyze calories and nutrition</p>
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
            className="p-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-3 font-semibold text-lg"
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
            className="p-4 bg-white border-2 border-green-500 text-green-600 rounded-2xl hover:bg-green-50 transition-all flex items-center justify-center space-x-3 font-semibold"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Photo</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={onCancel}
          className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 transition"
        >
          Cancel
        </button>
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
            alt="Food preview"
            className="w-full h-64 object-cover rounded-2xl opacity-60"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8">
              <Loader className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Analyzing your meal...</h3>
              <p className="text-gray-600 animate-pulse">AI is detecting foods and calculating nutrition</p>
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
            alt="Food preview"
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
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 flex items-center space-x-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-green-900">AI Analysis Complete!</h4>
            <p className="text-sm text-green-700">Review and adjust if needed</p>
          </div>
        </div>

        {/* Detected Foods */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-orange-500" />
            Detected Foods
          </label>
          <div className="flex flex-wrap gap-2">
            {editableResult.foods.map((food, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-semibold shadow-md"
              >
                {food}
              </span>
            ))}
          </div>
        </div>

        {/* Nutrition Values (Editable) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Calories</label>
            <input
              type="number"
              value={editableResult.calories}
              onChange={(e) => setEditableResult({...editableResult, calories: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none font-bold text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Protein (g)</label>
            <input
              type="number"
              value={editableResult.protein}
              onChange={(e) => setEditableResult({...editableResult, protein: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none font-bold text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Carbs (g)</label>
            <input
              type="number"
              value={editableResult.carbs}
              onChange={(e) => setEditableResult({...editableResult, carbs: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none font-bold text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fats (g)</label>
            <input
              type="number"
              value={editableResult.fats}
              onChange={(e) => setEditableResult({...editableResult, fats: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none font-bold text-lg"
            />
          </div>
        </div>

        {/* Quality Score */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Meal Quality Score</label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${star <= editableResult.quality ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">({editableResult.quality}/5)</span>
          </div>
        </div>

        {/* AI Recommendations */}
        {editableResult.recommendations && editableResult.recommendations.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Recommendations
            </h4>
            <ul className="space-y-1">
              {editableResult.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-blue-800 flex items-start">
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
            className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Add Meal</span>
          </button>
          <button
            onClick={handleRetry}
            className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition flex items-center space-x-2"
          >
            <Edit2 className="w-5 h-5" />
            <span>Retake</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}
