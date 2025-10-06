import React, { useState, useEffect, useRef } from 'react';
import { transition } from '@ssgoi/react';
import { fly } from '@ssgoi/react/transitions';
import {
  ArrowLeft,
  Send,
  Mic,
  MicOff,
  Image as ImageIcon,
  X,
  Bot,
  User as UserIcon,
  Volume2,
  VolumeX,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { uploadImageToAzure, BlobContainers } from '../lib/storage';
import { sendChatMessage, analyzeMealPhoto, type ChatMessage, type UserContext } from '../lib/aiService';
import { db, Collections } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getFullUserContext, storeConversationMemory } from '../lib/supermemoryService';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [hasCompletedSettings, setHasCompletedSettings] = useState(false);
  const [isCheckingSettings, setIsCheckingSettings] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  useEffect(() => {
    // Load user context from Firestore - NO automated messages
    const loadUserContext = async () => {
      if (!user?.email) {
        setIsCheckingSettings(false);
        return;
      }

      try {
        const settingsDoc = await getDoc(doc(db, Collections.USER_SETTINGS, user.email));

        if (settingsDoc.exists()) {
          const data = settingsDoc.data();

          // Check if all required fields are filled
          const hasAllSettings = data.weight &&
                                 data.targetWeight &&
                                 data.fitnessGoal &&
                                 data.currentFitnessLevel &&
                                 data.calorieGoal;

          if (hasAllSettings) {
            setUserContext({
              name: user.displayName || 'User',
              email: user.email,
              startWeight: data.weight,
              currentWeight: data.weight,
              targetWeight: data.targetWeight,
              fitnessGoal: data.fitnessGoal,
              currentLevel: data.currentFitnessLevel,
              dailyCalories: data.calorieGoal,
              dailyProtein: 150,
            });
            setHasCompletedSettings(true);
          } else {
            setHasCompletedSettings(false);
          }
        } else {
          setHasCompletedSettings(false);
        }

        setIsCheckingSettings(false);
      } catch (error) {
        console.error('Error loading user context:', error);
        setIsCheckingSettings(false);
      }
    };

    loadUserContext();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return;
    if (!user?.email) return;
    if (!hasCompletedSettings) return; // Silently don't send if settings not complete

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      image: imagePreview || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');

    if (selectedImage) {
      setSelectedImage(null);
      setImagePreview('');
    }

    setIsLoading(true);

    try {
      let aiContent: string;

      if (selectedImage && userContext) {
        // Image analysis
        const imageUrl = await uploadImageToAzure(selectedImage, BlobContainers.CHAT_ATTACHMENTS, user.email);
        const analysis = await analyzeMealPhoto(imageUrl, userContext);
        aiContent = formatMealAnalysis(analysis);
      } else if (userContext) {
        // Get user's full memory context from Supermemory
        let memoryContext = '';
        try {
          memoryContext = await getFullUserContext(user.email);
        } catch (error) {
          console.log('Supermemory context not available, continuing without it');
        }

        // Regular AI chat with memory-enhanced context
        const conversationHistory: ChatMessage[] = messages
          .filter(m => m.role !== 'system')
          .map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }));

        // Add memory context as a system message if available
        if (memoryContext && memoryContext !== 'No user context available.') {
          conversationHistory.unshift({
            role: 'user' as const,
            content: `[MEMORY CONTEXT - Use this to personalize your response]\n${memoryContext}`
          });
        }

        const rawResponse = await sendChatMessage(currentInput, userContext, conversationHistory);
        aiContent = formatAIResponse(rawResponse);
      } else {
        aiContent = generateIntelligentResponse(currentInput);
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);

      // Store conversation in Supermemory for future context
      if (userContext) {
        try {
          await storeConversationMemory({
            userId: user.email,
            date: new Date().toISOString().split('T')[0],
            userMessage: currentInput,
            aiResponse: aiContent,
            context: selectedImage ? 'image_analysis' : 'chat'
          });
        } catch (error) {
          console.error('Failed to store conversation memory:', error);
        }
      }

      // Auto-speak AI response (clean version without formatting)
      const cleanContent = aiContent.replace(/[#*•\-]/g, '').replace(/\n{2,}/g, '. ');
      speakText(cleanContent);
    } catch (error: any) {
      console.error('Error sending message:', error);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateIntelligentResponse(currentInput),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }
  };


  const formatMealAnalysis = (analysis: any): string => {
    return `Great photo! 📸 Here's my analysis:

ESTIMATED NUTRITION:
• Calories: ~${analysis.calories} cal
• Protein: ${analysis.protein}g
• Carbs: ${analysis.carbs}g
• Fats: ${analysis.fats}g

FOODS DETECTED:
${analysis.foods.map((f: string) => `• ${f}`).join('\n')}

RECOMMENDATIONS:
${analysis.recommendations.map((r: string) => `• ${r}`).join('\n')}

Want me to log this meal for you?`;
  };

  const formatAIResponse = (rawResponse: string): string => {
    // Remove excessive asterisks and clean up formatting
    return rawResponse
      .replace(/\*\*/g, '')  // Remove bold markers
      .replace(/\*/g, '')    // Remove italic markers
      .replace(/#{1,6}\s/g, '')  // Remove markdown headers
      .trim();
  };

  const generateIntelligentResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes('workout') || input.includes('exercise') || input.includes('train')) {
      return `Let's create your workout plan! 💪

WORKOUT STRUCTURE:
• Warm-up: 5-10 minutes dynamic stretching
• Main workout: 30-45 minutes strength/cardio
• Cool down: 5-10 minutes static stretching

SAMPLE BEGINNER ROUTINE:
• Push-ups: 3 sets of 10 reps
• Squats: 3 sets of 15 reps
• Plank: 3 sets of 30 seconds
• Lunges: 3 sets of 10 each leg

Would you like me to customize this based on your goals?`;
    }

    if (input.includes('diet') || input.includes('meal') || input.includes('food') || input.includes('eat') || input.includes('nutrition')) {
      return `Nutrition is key to reaching your goals! 🍽️

DAILY TARGETS (adjust based on your goals):
• Calories: 2000-2500 kcal
• Protein: 150-200g (1.6g per kg body weight)
• Carbs: 200-250g (complex carbs preferred)
• Fats: 60-80g (healthy fats)

MEAL TIMING:
• Breakfast: High protein + complex carbs
• Lunch: Balanced meal with all macros
• Snack: Protein-rich (nuts, yogurt, protein shake)
• Dinner: Lean protein + vegetables
• Post-workout: Protein + simple carbs

SAMPLE MEALS:
• Oatmeal with protein powder and berries
• Grilled chicken with rice and vegetables
• Greek yogurt with nuts and honey
• Salmon with sweet potato and broccoli

What specific nutrition guidance do you need?`;
    }

    return `I'm ready to help you!

AVAILABLE SERVICES:
• Workout Plans - Custom routines for your goals
• Nutrition Guidance - Meal plans and macro tracking
• Form Checks - Upload videos for technique analysis
• Progress Tracking - Monitor your transformation
• Motivation - Daily inspiration and support

What would you like to focus on today?`;
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
      audioStreamRef.current = stream;

      // Check if webkitSpeechRecognition is available (for Chrome/Edge)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; // Keep listening continuously
        recognition.interimResults = true; // Show interim results while speaking
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognitionRef.current = recognition;

        let finalTranscript = '';

        recognition.onstart = () => {
          setIsRecording(true);
          console.log('Voice recognition started. Speak now...');
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          // Update input with final + interim text
          setInputMessage(finalTranscript + interimTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            alert('Speech recognition error. Please try again.');
          }
        };

        recognition.onend = () => {
          // Only stop if user manually stopped it
          if (isRecording && recognitionRef.current) {
            console.log('Recognition ended but still recording - restarting...');
          }
        };

        recognition.start();
      } else {
        // Fallback to basic audio recording
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          setInputMessage("🎤 Voice message recorded (speech-to-text not available in this browser)");
        };

        mediaRecorder.start();
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    // Stop media recorder
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    // Stop audio stream
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    console.log('Recording stopped');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      // Stop recording if it's active
      if (isRecording) {
        stopRecording();
      }

      handleSendMessage();
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex flex-col">
      {/* Modern Gradient Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/10 rounded-xl transition-all hover:scale-105 backdrop-blur-sm"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white">Reddy AI</h1>
                  <p className="text-xs text-white/80 hidden sm:block">Your Personal Fitness Coach</p>
                </div>
              </div>
            </div>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur-sm"
              >
                <VolumeX className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages - Modern Card Style */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          {messages.length === 0 && !hasCompletedSettings && (
            <div className="flex items-center justify-center h-full px-4">
              <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-xl border border-orange-100">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Please fill in your fitness profile in Settings to start chatting with Reddy AI.
                </p>
                <button
                  onClick={onBack}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all hover:scale-105"
                >
                  Go to Settings →
                </button>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id}
              ref={transition({
                key: `message-${message.id}`,
                ...fly({
                  x: message.role === 'user' ? 100 : -100,
                  y: 0,
                  opacity: true
                })
              })}
              className="mb-4"
            >
              <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {/* AI Avatar (left side) */}
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`max-w-[75%] ${message.role === 'user' ? 'order-1' : 'order-2'}`}>
                  {message.image && (
                    <div className="mb-2">
                      <img
                        src={message.image}
                        alt="Uploaded"
                        className="max-w-sm rounded-2xl shadow-lg border-2 border-white"
                      />
                    </div>
                  )}

                  <div className={`rounded-2xl px-4 py-3 shadow-md ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-100'
                  }`}>
                    <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>

                  <div className={`text-xs text-gray-500 mt-1 px-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* User Avatar (right side) */}
                {message.role === 'user' && (
                  <div className="flex-shrink-0 order-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator - Modern Style */}
          {isLoading && (
            <div className="mb-4">
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="bg-white rounded-2xl px-4 py-3 shadow-md border border-gray-100">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="bg-white border-t shadow-lg">
          <div className="max-w-3xl mx-auto px-3 sm:px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg" />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview('');
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-md"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-900">Image ready</p>
                <p className="text-xs text-gray-500">Add a message or send</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Area - Modern Glassmorphism Style */}
      <div className="border-t border-white/20 bg-gradient-to-r from-orange-50 to-red-50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="relative bg-white rounded-2xl shadow-xl border border-orange-100">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              disabled={!hasCompletedSettings}
              className="w-full px-5 py-4 pr-28 rounded-2xl focus:outline-none resize-none text-[15px] text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
              style={{ maxHeight: '200px' }}
            />

            <div className="absolute right-2 bottom-2 flex items-center gap-2">
              {/* Image Upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={!hasCompletedSettings}
                className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Upload image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* Voice Input */}
              <button
                ref={transition({
                  key: 'mic-button',
                  ...fly({ x: -50, y: 50, opacity: true })
                })}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!hasCompletedSettings}
                className={`p-2.5 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording
                    ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                    : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                }`}
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                {isRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              {/* Send Button */}
              <button
                ref={transition({
                  key: 'send-button',
                  ...fly({ x: 50, y: 50, opacity: true })
                })}
                onClick={handleSendMessage}
                disabled={(!inputMessage.trim() && !selectedImage) || isLoading || !hasCompletedSettings}
                className="p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          {messages.length === 0 && hasCompletedSettings && (
            <div className="flex gap-2 mt-3 flex-wrap justify-center">
              <button
                onClick={() => setInputMessage("What's my current progress?")}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white text-sm text-gray-700 rounded-xl border border-orange-100 hover:border-orange-300 transition-all hover:shadow-md"
              >
                📊 My Progress
              </button>
              <button
                onClick={() => setInputMessage("Give me a workout plan")}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white text-sm text-gray-700 rounded-xl border border-orange-100 hover:border-orange-300 transition-all hover:shadow-md"
              >
                💪 Workout Plan
              </button>
              <button
                onClick={() => setInputMessage("Suggest a healthy meal")}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white text-sm text-gray-700 rounded-xl border border-orange-100 hover:border-orange-300 transition-all hover:shadow-md"
              >
                🥗 Meal Ideas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
