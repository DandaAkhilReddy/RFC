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
    // Load user context from Firestore and check if settings are complete
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

            // Welcome message after settings loaded
            setMessages([{
              id: '1',
              role: 'assistant',
              content: `Welcome back, ${user.displayName || 'Champion'}! 💪

I'm Reddy, your AI fitness coach. I've loaded your profile and I'm ready to help you achieve your goals!

WHAT CAN I HELP YOU WITH TODAY?
• Create a workout plan
• Get nutrition advice
• Analyze meal photos
• Track your progress
• Answer fitness questions
• Provide motivation

What would you like to focus on?`,
              timestamp: new Date()
            }]);
          } else {
            setHasCompletedSettings(false);
            setMessages([{
              id: '1',
              role: 'assistant',
              content: `Hey there! 👋 Welcome to Reddy AI!

I'd love to help you with your fitness journey, but I need some information first.

Please go to SETTINGS and fill in:
• Your current weight
• Your target weight
• Your fitness goal
• Your fitness level
• Your daily calorie goal

Once you complete your settings, come back and I'll create a personalized fitness plan for you! 🎯

Tap the back button to go to Settings.`,
              timestamp: new Date()
            }]);
          }
        } else {
          setHasCompletedSettings(false);
          setMessages([{
            id: '1',
            role: 'assistant',
            content: `Hey there! 👋 Welcome to Reddy AI!

I'd love to help you with your fitness journey, but I need some information first.

Please go to SETTINGS and fill in:
• Your current weight
• Your target weight
• Your fitness goal
• Your fitness level
• Your daily calorie goal

Once you complete your settings, come back and I'll create a personalized fitness plan for you! 🎯

Tap the back button to go to Settings.`,
            timestamp: new Date()
          }]);
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

    // Check if settings are completed
    if (!hasCompletedSettings) {
      const reminderMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Please complete your settings first! 🎯

Go to Settings and fill in:
• Your current weight
• Your target weight
• Your fitness goal
• Your fitness level
• Your daily calorie goal

Then come back and I'll be ready to help you!`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, reminderMessage]);
      setInputMessage('');
      return;
    }

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
        // Regular AI chat
        const conversationHistory: ChatMessage[] = messages
          .filter(m => m.role !== 'system')
          .map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }));

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
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 flex flex-col">
      {/* Header - Enhanced Modern Style */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 animate-pulse">
                    <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
                    Reddy AI
                    <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                  </h1>
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Active now
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={isSpeaking ? stopSpeaking : undefined}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                isSpeaking
                  ? 'bg-gradient-to-br from-orange-100 to-red-100 text-orange-600 shadow-md'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              {isSpeaking ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages - Enhanced Style */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`${
                message.role === 'assistant'
                  ? 'bg-gradient-to-br from-gray-50 to-orange-50/30'
                  : 'bg-white'
              } border-b border-gray-100/50 transition-all duration-300 hover:shadow-sm`}
            >
              <div className="px-3 sm:px-6 py-4 sm:py-6">
                <div className="flex gap-3 sm:gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/30'
                          : 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 shadow-orange-500/40'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs sm:text-sm font-bold text-gray-900">
                        {message.role === 'user' ? 'You' : 'Reddy AI'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {message.image && (
                      <div className="mb-3 group">
                        <img
                          src={message.image}
                          alt="Uploaded"
                          className="max-w-xs sm:max-w-sm rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 border-2 border-gray-100"
                        />
                      </div>
                    )}

                    <div className="prose prose-sm sm:prose max-w-none">
                      <div className={`text-sm sm:text-base whitespace-pre-wrap leading-relaxed ${
                        message.role === 'user' ? 'text-gray-800' : 'text-gray-900'
                      }`}>
                        {message.content.split('\n').map((line, idx) => {
                          // Format bold text (**text** becomes bold)
                          if (line.includes('**')) {
                            const parts = line.split('**');
                            return (
                              <p key={idx} className="mb-2">
                                {parts.map((part, i) =>
                                  i % 2 === 1 ? <strong key={i} className="font-bold text-gray-900">{part}</strong> : part
                                )}
                              </p>
                            );
                          }
                          // Regular line
                          return line ? <p key={idx} className="mb-2">{line}</p> : <br key={idx} />;
                        })}
                      </div>
                    </div>

                    {/* Voice button for AI messages */}
                    {message.role === 'assistant' && index === messages.length - 1 && !isLoading && (
                      <button
                        onClick={() => speakText(message.content)}
                        className="mt-3 px-3 py-1.5 text-xs bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 text-orange-700 rounded-full transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow-md font-medium"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Read aloud
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator - Enhanced */}
          {isLoading && (
            <div className="bg-gradient-to-br from-gray-50 to-orange-50/30 border-b border-gray-100/50">
              <div className="px-3 sm:px-6 py-4 sm:py-6">
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/40 animate-pulse">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />
                      <span className="text-sm font-medium bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        Reddy is thinking...
                      </span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
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

      {/* Input Area - Premium Style */}
      <div className="bg-white/90 backdrop-blur-md border-t border-gray-200/50 shadow-2xl">
        <div className="max-w-3xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="bg-gradient-to-br from-gray-50 to-orange-50/50 rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-inner border border-gray-200/50">
            <div className="flex items-end gap-2">
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
                className="p-2.5 text-gray-600 hover:bg-white rounded-xl transition-all duration-200 flex-shrink-0 hover:shadow-md hover:scale-105 active:scale-95"
                title="Upload image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              {/* Voice Input */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 hover:scale-105 active:scale-95 ${
                  isRecording
                    ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/50'
                    : 'text-gray-600 hover:bg-white hover:shadow-md'
                }`}
                title={isRecording ? 'Stop recording' : 'Start voice input'}
              >
                {isRecording ? (
                  <MicOff className="w-5 h-5 animate-pulse" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              {/* Text Input */}
              <div className="flex-1 bg-white rounded-xl px-1">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message Reddy..."
                  rows={1}
                  className="w-full px-3 py-2.5 bg-transparent border-none focus:outline-none resize-none text-sm sm:text-base text-gray-800 placeholder-gray-400"
                  style={{ maxHeight: '120px' }}
                />
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
                className={`p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 hover:scale-105 active:scale-95 ${
                  inputMessage.trim() || selectedImage
                    ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/50 hover:shadow-xl'
                    : 'text-gray-400 cursor-not-allowed bg-gray-200'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { icon: '💪', text: 'Workout plan' },
              { icon: '🍽️', text: 'Meal ideas' },
              { icon: '📸', text: 'Analyze photo' },
              { icon: '🔥', text: 'Motivate me' }
            ].map((action) => (
              <button
                key={action.text}
                onClick={() => setInputMessage(action.text)}
                className="px-3 py-1.5 text-xs sm:text-sm bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 border border-gray-200 text-gray-700 rounded-full transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md font-medium hover:scale-105 active:scale-95"
              >
                <span className="mr-1.5">{action.icon}</span>
                {action.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
