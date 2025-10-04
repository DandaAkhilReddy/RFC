import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader, Sparkles, CheckCircle2, AlertCircle, Volume2 } from 'lucide-react';
import { analyzeMealFromText, MealAnalysis, UserContext } from '../lib/geminiService';

interface VoiceNoteInputProps {
  onAnalysisComplete: (result: MealAnalysis) => void;
  onCancel: () => void;
  userContext: UserContext;
}

// Browser speech recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceNoteInput({ onAnalysisComplete, onCancel, userContext }: VoiceNoteInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MealAnalysis | null>(null);
  const [editableResult, setEditableResult] = useState<MealAnalysis | null>(null);
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Voice input is not supported in your browser. Please use Chrome, Safari, or Edge.');
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(prev => {
        if (finalTranscript) {
          return (prev + finalTranscript).trim();
        }
        return prev ? prev + ' ' + interimTranscript : interimTranscript;
      });
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);

      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else {
        setError('Error recognizing speech. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) return;

    setError('');
    setTranscript('');
    setIsRecording(true);

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setError('Could not start recording. Please try again.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError('Please say something about your meal first');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const result = await analyzeMealFromText(transcript, userContext);
      setAnalysisResult(result);
      setEditableResult(result);
      setAnalyzing(false);
    } catch (err: any) {
      console.error('Error analyzing meal:', err);
      setError(err.message || 'Failed to analyze meal. Please try again.');
      setAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    if (editableResult) {
      onAnalysisComplete(editableResult);
    }
  };

  const handleRetry = () => {
    setTranscript('');
    setAnalysisResult(null);
    setEditableResult(null);
    setError('');
  };

  // No support
  if (!isSupported) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Voice Not Supported</h3>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Analyzing state
  if (analyzing) {
    return (
      <div className="space-y-6 text-center">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-8">
          <Loader className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Analyzing your meal...</h3>
          <p className="text-gray-600 italic">"{transcript}"</p>
          <p className="text-sm text-purple-600 mt-4 animate-pulse">AI is calculating nutrition...</p>
        </div>
      </div>
    );
  }

  // Analysis complete - show results
  if (analysisResult && editableResult) {
    return (
      <div className="space-y-6">
        {/* Success Header */}
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 flex items-center space-x-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-green-900">Voice Analysis Complete!</h4>
            <p className="text-sm text-green-700">Review and adjust if needed</p>
          </div>
        </div>

        {/* What You Said */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-xs text-purple-600 font-semibold mb-2 flex items-center">
            <Volume2 className="w-3 h-3 mr-1" />
            You Said
          </p>
          <p className="text-gray-800 italic">"{transcript}"</p>
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
              className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl text-lg font-bold text-orange-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Protein (g)</label>
            <input
              type="number"
              value={editableResult.protein}
              onChange={(e) => setEditableResult({...editableResult, protein: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl text-lg font-bold text-blue-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Carbs (g)</label>
            <input
              type="number"
              value={editableResult.carbs}
              onChange={(e) => setEditableResult({...editableResult, carbs: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-3 border-2 border-yellow-300 rounded-xl text-lg font-bold text-yellow-600 focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fats (g)</label>
            <input
              type="number"
              value={editableResult.fats}
              onChange={(e) => setEditableResult({...editableResult, fats: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl text-lg font-bold text-green-600 focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        {/* Quality Score */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Meal Quality</p>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-2xl ${star <= editableResult.quality ? 'text-yellow-500' : 'text-gray-300'}`}
              >
                ★
              </span>
            ))}
            <span className="text-sm text-gray-600 ml-2">({editableResult.quality}/5)</span>
          </div>
        </div>

        {/* Recommendations */}
        {editableResult.recommendations.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-3">💡 Recommendations</p>
            <ul className="space-y-2">
              {editableResult.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-blue-700 flex items-start">
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
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-xl transition-all font-semibold"
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

  // Recording interface
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 transition-all ${
          isRecording
            ? 'bg-red-500 animate-pulse'
            : 'bg-gradient-to-r from-purple-500 to-indigo-500'
        }`}>
          {isRecording ? (
            <Mic className="w-12 h-12 text-white animate-pulse" />
          ) : (
            <Mic className="w-12 h-12 text-white" />
          )}
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {isRecording ? 'Listening...' : 'Voice Note Meal Entry'}
        </h3>
        <p className="text-gray-600">
          {isRecording
            ? 'Tell me what you ate...'
            : 'Say something like "I had a burger and fries"'
          }
        </p>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4">
          <p className="text-sm text-purple-600 font-semibold mb-2">Transcript:</p>
          <p className="text-gray-800 italic">"{transcript}"</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-red-700 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* Recording Button */}
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="w-full p-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl hover:shadow-xl transition-all transform hover:scale-105 font-semibold text-lg flex items-center justify-center space-x-3"
        >
          <Mic className="w-6 h-6" />
          <span>Start Recording</span>
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="w-full p-6 bg-red-500 text-white rounded-2xl hover:shadow-xl transition-all font-semibold text-lg flex items-center justify-center space-x-3 animate-pulse"
        >
          <Square className="w-6 h-6" />
          <span>Stop Recording</span>
        </button>
      )}

      {/* Analyze Button (shown when there's transcript) */}
      {transcript && !isRecording && (
        <button
          onClick={handleAnalyze}
          className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>Analyze Meal</span>
        </button>
      )}

      {/* Cancel Button */}
      <button
        onClick={onCancel}
        className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 transition"
      >
        Cancel
      </button>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-blue-800 mb-2">💡 Tips for best results:</p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Speak clearly and naturally</li>
          <li>• Mention portion sizes when possible</li>
          <li>• Examples: "2 scrambled eggs", "medium burger"</li>
          <li>• You can edit the nutrition values after analysis</li>
        </ul>
      </div>
    </div>
  );
}
