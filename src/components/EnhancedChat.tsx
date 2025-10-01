import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, User, Bot, Loader2, Square, Sparkles } from 'lucide-react';
import { sendChatMessage, transcribeAudio, type ChatMessage, type UserContext } from '../lib/aiService';

interface EnhancedChatProps {
  profile: {
    name: string;
    age: number;
    weight: number;
    height: number;
    targetWeight: number;
    dailyCalories: number;
    dailyProtein: number;
    fitnessGoal: string;
  };
  userEmail: string;
}

export default function EnhancedChat({ profile, userEmail }: EnhancedChatProps) {
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if first time user
  useEffect(() => {
    const hasVisited = localStorage.getItem('fitness_onboarding_complete');
    if (!hasVisited) {
      setShowOnboarding(true);
      startOnboarding();
    } else {
      // Load saved chat history
      const savedChat = localStorage.getItem('fitness_chat_history');
      if (savedChat) {
        setChatMessages(JSON.parse(savedChat));
      } else {
        setChatMessages([{
          role: 'assistant',
          content: `Welcome back, ${profile.name}! 💪 Ready to crush your fitness goals today?`,
          timestamp: new Date()
        }]);
      }
    }
  }, []);

  // Save chat history
  useEffect(() => {
    if (chatMessages.length > 0) {
      localStorage.setItem('fitness_chat_history', JSON.stringify(chatMessages));
    }
  }, [chatMessages]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingTime(0);
    }
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  const startOnboarding = () => {
    const onboardingQuestions = [
      `Hi ${profile.name}! 👋 I'm your AI fitness coach. Before we start, I'd love to know more about you. What's your main fitness goal?`,
      `Great! And what's your current fitness experience level? (Beginner, Intermediate, or Advanced)`,
      `Perfect! Do you have any dietary restrictions or preferences I should know about?`,
      `Last question - how many days per week can you commit to working out?`,
      `Awesome! 🎉 I have everything I need. Let's start your fitness journey! Ask me anything about workouts, nutrition, or your fitness goals.`
    ];

    setChatMessages([{
      role: 'assistant',
      content: onboardingQuestions[0],
      timestamp: new Date()
    }]);
  };

  const handleOnboardingResponse = (userResponse: string) => {
    const onboardingQuestions = [
      `Hi ${profile.name}! 👋 I'm your AI fitness coach. Before we start, I'd love to know more about you. What's your main fitness goal?`,
      `Great! And what's your current fitness experience level? (Beginner, Intermediate, or Advanced)`,
      `Perfect! Do you have any dietary restrictions or preferences I should know about?`,
      `Last question - how many days per week can you commit to working out?`,
      `Awesome! 🎉 I have everything I need. Let's start your fitness journey! Ask me anything about workouts, nutrition, or your fitness goals.`
    ];

    if (onboardingStep < 3) {
      setOnboardingStep(prev => prev + 1);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: onboardingQuestions[onboardingStep + 1],
        timestamp: new Date()
      }]);
    } else {
      setShowOnboarding(false);
      localStorage.setItem('fitness_onboarding_complete', 'true');
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: onboardingQuestions[4],
        timestamp: new Date()
      }]);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });

      const options = { mimeType: 'audio/webm' };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToAI(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Could not access microphone. Please check permissions and try again.',
        timestamp: new Date()
      }]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToAI = async (audioBlob: Blob) => {
    setIsTyping(true);

    try {
      const transcribedText = await transcribeAudio(audioBlob);

      setChatMessages(prev => [...prev, {
        role: 'user',
        content: transcribedText,
        timestamp: new Date()
      }]);

      if (showOnboarding) {
        handleOnboardingResponse(transcribedText);
        setIsTyping(false);
        return;
      }

      const userContext: UserContext = {
        name: profile.name,
        email: userEmail,
        startWeight: profile.weight,
        currentWeight: profile.weight,
        targetWeight: profile.targetWeight,
        fitnessGoal: profile.fitnessGoal,
        currentLevel: 'Intermediate',
        dailyCalories: profile.dailyCalories,
        dailyProtein: profile.dailyProtein
      };

      const conversationHistory: ChatMessage[] = chatMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const aiResponse = await sendChatMessage(transcribedText, userContext, conversationHistory);

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error processing audio:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Sorry, I couldn\'t process the audio. Please try typing your message instead.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    setChatMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    if (showOnboarding) {
      handleOnboardingResponse(userMessage);
      return;
    }

    setIsTyping(true);

    try {
      const userContext: UserContext = {
        name: profile.name,
        email: userEmail,
        startWeight: profile.weight,
        currentWeight: profile.weight,
        targetWeight: profile.targetWeight,
        fitnessGoal: profile.fitnessGoal,
        currentLevel: 'Intermediate',
        dailyCalories: profile.dailyCalories,
        dailyProtein: profile.dailyProtein
      };

      const conversationHistory: ChatMessage[] = chatMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const aiResponse = await sendChatMessage(userMessage, userContext, conversationHistory);

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            {msg.role === 'assistant' && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse-slow">
                <Bot className="w-6 h-6 text-white" />
              </div>
            )}
            <div className={`max-w-2xl ${msg.role === 'user' ? 'order-first' : ''}`}>
              <div className={`rounded-3xl px-6 py-4 backdrop-blur-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white shadow-2xl shadow-blue-300/50'
                  : 'bg-white/90 border-2 border-gray-100 text-gray-900 shadow-xl'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
              </div>
              <p className={`text-xs text-gray-400 mt-2 px-3 ${msg.role === 'user' ? 'text-right' : ''}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {msg.role === 'user' && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center flex-shrink-0 shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator with 3D effect */}
        {isTyping && (
          <div className="flex gap-4 animate-fadeIn">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center shadow-lg animate-bounce">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 rounded-3xl px-6 py-4 shadow-2xl shadow-purple-300/50">
              <div className="flex gap-2 items-center">
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-600 font-medium ml-2">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-8 py-6 bg-gradient-to-t from-gray-50 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-4">
            {/* 3D Mic Button */}
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="group relative"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse"></div>

                {/* Button */}
                <div className="relative p-4 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95">
                  <Mic className="w-7 h-7 text-white" />
                </div>

                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Start Recording
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                {/* Recording Animation */}
                <div className="relative">
                  {/* Pulse rings */}
                  <div className="absolute inset-0 bg-red-500 rounded-2xl animate-ping opacity-75"></div>
                  <div className="absolute inset-0 bg-red-500 rounded-2xl animate-pulse"></div>

                  {/* Stop Button */}
                  <button
                    onClick={stopRecording}
                    className="relative p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-110 active:scale-95"
                  >
                    <Square className="w-7 h-7 text-white fill-white" />
                  </button>
                </div>

                {/* Recording Timer */}
                <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
                  <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                  <span className="font-mono font-bold">{formatRecordingTime(recordingTime)}</span>
                </div>
              </div>
            )}

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Shift+Enter for new line)"
                className="w-full px-6 py-4 pr-14 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all resize-none max-h-32 overflow-y-auto shadow-lg bg-white/90 backdrop-blur-sm"
                rows={1}
                disabled={isRecording}
              />
              {inputMessage.length > 0 && (
                <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                  {inputMessage.length} chars
                </div>
              )}
            </div>

            {/* Send Button with 3D effect */}
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isRecording}
              className="group relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity"></div>

              {/* Button */}
              <div className={`relative p-4 rounded-2xl shadow-2xl transform transition-all duration-300 ${
                inputMessage.trim() && !isRecording
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 hover:scale-110 hover:-rotate-3 active:scale-95 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}>
                <Send className="w-7 h-7 text-white" />
              </div>

              {/* Tooltip */}
              {inputMessage.trim() && !isRecording && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Send Message
                </div>
              )}
            </button>
          </div>

          {/* Helper Text */}
          <div className="mt-3 text-center text-xs text-gray-500">
            {isRecording ? (
              <span className="text-red-600 font-semibold animate-pulse">🔴 Recording... Click the square to stop</span>
            ) : (
              <span>Press Enter to send • Shift+Enter for new line • Click mic to record</span>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
