import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  Mic,
  MicOff,
  Image as ImageIcon,
  X,
  Bot,
  User as UserIcon,
  Upload,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { uploadImageToAzure, BlobContainers } from '../lib/storage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  image?: string;
}

interface ReddyAIAgentProps {
  onBack: () => void;
}

export default function ReddyAIAgent({ onBack }: ReddyAIAgentProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm Reddy, your personal AI fitness coach. I'm here to help you achieve your fitness goals! You can chat with me, send voice messages, or upload photos of your meals/workouts for analysis. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [trainingMode, setTrainingMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return;
    if (!user?.email) return;

    setIsLoading(true);

    try {
      // Upload image to Azure Blob if present
      let imageUrl = imagePreview;
      if (selectedImage && user?.email) {
        imageUrl = await uploadImageToAzure(
          selectedImage,
          BlobContainers.CHAT_ATTACHMENTS,
          user.email
        );
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: inputMessage,
        timestamp: new Date(),
        image: imageUrl || undefined
      };

      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');

      // Simulate AI response (replace with actual AI API call)
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: generateAIResponse(inputMessage, !!selectedImage),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);

        // Clear image after sending
        if (selectedImage) {
          setSelectedImage(null);
          setImagePreview('');
        }
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      alert('Failed to send message. Please try again.');
    }
  };

  const generateAIResponse = (userInput: string, hasImage: boolean): string => {
    if (hasImage) {
      return "I've analyzed your image! Based on what I see, here's my feedback:\n\n✅ Good portions and balanced meal\n🥗 Estimated: ~500 calories, 30g protein\n💡 Tip: Consider adding more leafy greens for nutrients\n\nWould you like a detailed nutritional breakdown or meal suggestions?";
    }

    const input = userInput.toLowerCase();

    if (input.includes('workout') || input.includes('exercise')) {
      return "I'd be happy to help with your workout! Based on your profile:\n\n🏋️ Recommended workout:\n- 5 min warm-up\n- 3 sets of compound exercises (squats, bench press, rows)\n- 15 min cardio\n- 5 min cool down\n\nWould you like me to create a detailed workout plan for this week?";
    }

    if (input.includes('diet') || input.includes('meal') || input.includes('food')) {
      return "Let me help with your nutrition! Based on your goals:\n\n🍽️ Daily targets:\n- Calories: 1,800-2,000\n- Protein: 140-160g\n- Carbs: 180-200g\n- Fats: 50-60g\n\nWould you like me to create a meal plan for you?";
    }

    if (input.includes('weight') || input.includes('progress')) {
      return "Great question about tracking progress! Here's what I recommend:\n\n📊 Track these metrics:\n- Weekly weigh-ins (same time)\n- Body measurements\n- Progress photos\n- How clothes fit\n\nRemember: Scale weight isn't everything! Focus on overall health and how you feel.";
    }

    return "I understand you're asking about fitness and health. Here's what I can help you with:\n\n💪 Workout plans\n🍽️ Meal planning & nutrition\n📈 Progress tracking\n🎯 Goal setting\n\nWhat specific area would you like to focus on?";
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Here you would send to speech-to-text API
        // For now, simulate transcription
        const transcription = "Sample transcribed text from voice";
        setInputMessage(transcription);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Reddy AI Coach</h1>
                  <p className="text-xs text-gray-500">Your Personal Fitness Assistant</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setTrainingMode(!trainingMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                trainingMode
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {trainingMode ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Training Mode ON
                </span>
              ) : (
                'Enable Training'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Training Mode Banner */}
      {trainingMode && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <AlertCircle className="w-4 h-4" />
              <span>
                Training Mode: Reddy is learning from your responses to provide better personalized advice.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-orange-600'
                    : 'bg-gradient-to-br from-orange-500 to-red-500'
                }`}
              >
                {message.role === 'user' ? (
                  <UserIcon className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex-1 max-w-2xl ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div
                  className={`inline-block px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-orange-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Uploaded"
                      className="max-w-xs rounded-lg mb-2"
                    />
                  )}
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="border-t bg-white">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview('');
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Image ready to send</p>
                <p className="text-xs text-gray-500">Add a message or send as is</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-end gap-3">
            {/* Image Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              title="Upload image"
            >
              <ImageIcon className="w-6 h-6" />
            </button>

            {/* Voice Input */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                isRecording
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? (
                <MicOff className="w-6 h-6 animate-pulse" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>

            {/* Text Input */}
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about fitness, nutrition, or workouts..."
                rows={1}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() && !selectedImage}
              className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {[
              'Create workout plan',
              'Suggest meals',
              'Track progress',
              'Analyze this photo',
              'Motivate me!'
            ].map((action) => (
              <button
                key={action}
                onClick={() => setInputMessage(action)}
                className="px-3 py-1 text-sm bg-orange-50 text-orange-700 rounded-full hover:bg-orange-100 transition-colors whitespace-nowrap"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-orange-50 border-t border-orange-100">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-start gap-2 text-sm text-orange-800">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">What Reddy can do:</p>
              <ul className="text-xs space-y-1 text-orange-700">
                <li>💬 Chat about fitness, nutrition, and wellness</li>
                <li>🎤 Voice messages (speak naturally)</li>
                <li>📸 Analyze meal photos for nutrition info</li>
                <li>🏋️ Analyze workout photos for form feedback</li>
                <li>🎯 Learn your preferences with Training Mode</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
