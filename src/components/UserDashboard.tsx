import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  TrendingDown,
  Flame,
  Target,
  Calendar,
  Award,
  BarChart3,
  Upload,
  Plus,
  Activity,
  Droplet,
  Moon,
  Mic,
  Send,
  MessageSquare,
  Image as ImageIcon,
  Zap,
  TrendingUp,
  User,
  Settings,
  ChevronRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { sendChatMessage, transcribeAudio, type ChatMessage, type UserContext } from '../lib/aiService';
import { analyzeProgressPhotoWithGemini, analyzeMealPhotoWithGemini } from '../lib/geminiService';

interface DailyLog {
  date: string;
  weight?: number;
  caloriesEaten: number;
  proteinEaten: number;
  waterIntake: number;
  sleepHours: number;
  morningRun: boolean;
  eveningWorkout: boolean;
  progressPhoto?: string;
  mealPhotos: string[];
  notes: string;
  aiAnalysis?: {
    bodyFat?: number;
    muscleMass?: number;
    posture?: string;
    recommendations?: string[];
  };
}

interface UserFitnessData {
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  startDate: Date;
  targetDate: Date;
  dailyCalories: number;
  dailyProtein: number;
  bmr: number;
  height: number;
  age: number;
  fitnessGoal: string;
  currentLevel: string;
  profilePhoto?: string;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'chat' | 'log' | 'progress'>('chat');
  const [isRecording, setIsRecording] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [userData, setUserData] = useState<UserFitnessData>({
    startWeight: 85.5,
    currentWeight: 85.5,
    targetWeight: 69.9,
    startDate: new Date(),
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    dailyCalories: 1350,
    dailyProtein: 150,
    bmr: 1850,
    height: 175,
    age: 25,
    fitnessGoal: 'Six-Pack & Weight Loss',
    currentLevel: 'Beginner'
  });

  const [todayLog, setTodayLog] = useState<DailyLog>({
    date: new Date().toISOString().split('T')[0],
    caloriesEaten: 0,
    proteinEaten: 0,
    waterIntake: 0,
    sleepHours: 0,
    morningRun: false,
    eveningWorkout: false,
    mealPhotos: [],
    notes: ''
  });

  const [weeklyData, setWeeklyData] = useState([
    { day: 'Mon', weight: 85.5, calories: 1350, protein: 150 },
    { day: 'Tue', weight: 85.3, calories: 1320, protein: 155 },
    { day: 'Wed', weight: 85.1, calories: 1340, protein: 148 },
    { day: 'Thu', weight: 84.9, calories: 1360, protein: 152 },
    { day: 'Fri', weight: 84.7, calories: 1330, protein: 158 },
    { day: 'Sat', weight: 84.5, calories: 1350, protein: 150 },
    { day: 'Sun', weight: 84.5, calories: 1400, protein: 145 }
  ]);

  const [currentStreak, setCurrentStreak] = useState(1);
  const [totalWorkouts, setTotalWorkouts] = useState(0);

  // Calculate progress metrics
  const totalLoss = userData.startWeight - userData.currentWeight;
  const remainingLoss = userData.currentWeight - userData.targetWeight;
  const progressPercentage = (totalLoss / (userData.startWeight - userData.targetWeight)) * 100;
  const daysElapsed = Math.floor((new Date().getTime() - userData.startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.floor((userData.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Initial welcome message
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          role: 'assistant',
          content: `Hey ${user?.displayName || 'there'}! 👋 I'm your AI fitness coach. I'm here to help you reach your goal of ${userData.targetWeight}kg!\n\nYou can:\n🎤 **Voice record** your daily updates\n✍️ **Type** your questions or progress\n📸 **Upload photos** of your body, meals, or workouts\n\nWhat would you like to talk about today?`,
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  // Voice recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });

      // Use webm format for better compatibility
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
        content: '🎤 Could not access microphone. Please check your browser permissions and try again.',
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
      // Transcribe audio using OpenAI Whisper API
      const transcribedText = await transcribeAudio(audioBlob);

      // Add transcribed user message
      setChatMessages(prev => [...prev, {
        role: 'user',
        content: `🎤 ${transcribedText}`,
        timestamp: new Date()
      }]);

      // Build user context for AI
      const userContext: UserContext = {
        name: userData.name,
        email: user?.email || '',
        startWeight: userData.startWeight,
        currentWeight: userData.currentWeight,
        targetWeight: userData.targetWeight,
        fitnessGoal: userData.fitnessGoal,
        currentLevel: userData.currentLevel,
        dailyCalories: userData.dailyCalories,
        dailyProtein: userData.dailyProtein
      };

      // Convert chat history to ChatMessage format
      const conversationHistory: ChatMessage[] = chatMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Get AI response
      const aiResponse = await sendChatMessage(transcribedText, userContext, conversationHistory);

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    } catch (error) {
      console.error('Error processing audio:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I couldn\'t process the audio. Please try again or type your message.',
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage
    };

    setChatMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setIsTyping(true);

    try {
      // Build user context for AI
      const userContext: UserContext = {
        name: userData.name,
        email: user?.email || '',
        startWeight: userData.startWeight,
        currentWeight: userData.currentWeight,
        targetWeight: userData.targetWeight,
        fitnessGoal: userData.fitnessGoal,
        currentLevel: userData.currentLevel,
        dailyCalories: userData.dailyCalories,
        dailyProtein: userData.dailyProtein
      };

      // Convert chat history to ChatMessage format
      const conversationHistory: ChatMessage[] = chatMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call real OpenAI API
      const aiResponse = await sendChatMessage(userMessage, userContext, conversationHistory);

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    } catch (error) {
      console.error('Error calling AI:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error connecting to the AI. Please try again.',
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }
  };


  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'progress' | 'meal' | 'workout') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageData = reader.result as string;

      // Build user context for AI
      const userContext: UserContext = {
        name: userData.name,
        email: user?.email || '',
        startWeight: userData.startWeight,
        currentWeight: userData.currentWeight,
        targetWeight: userData.targetWeight,
        fitnessGoal: userData.fitnessGoal,
        currentLevel: userData.currentLevel,
        dailyCalories: userData.dailyCalories,
        dailyProtein: userData.dailyProtein
      };

      if (type === 'progress') {
        setTodayLog({ ...todayLog, progressPhoto: imageData });

        setChatMessages(prev => [...prev, {
          role: 'user',
          content: '📸 Uploaded progress photo',
          timestamp: new Date()
        }]);

        setIsTyping(true);

        try {
          // Call Gemini Vision API for progress photo analysis
          const analysis = await analyzeProgressPhotoWithGemini(imageData, userContext, todayLog.aiAnalysis);

          const aiAnalysis = `Great progress photo! 📸\n\n**AI Body Analysis:**\n🎯 Estimated body fat: ~${analysis.bodyFat}%\n💪 Muscle mass: ${analysis.muscleMass}\n📊 Posture: ${analysis.posture}\n${analysis.faceAnalysis ? `\n😊 Face analysis: ${analysis.faceAnalysis}` : ''}\n\n**Recommendations:**\n${analysis.recommendations.map(rec => `✅ ${rec}`).join('\n')}\n\n${analysis.comparison ? `**Comparison:** ${analysis.comparison}\n\n` : ''}Keep up the great work! 🔥`;

          // Save AI analysis to log
          setTodayLog(prev => ({
            ...prev,
            aiAnalysis: {
              bodyFat: analysis.bodyFat,
              muscleMass: analysis.muscleMass as any,
              posture: analysis.posture,
              recommendations: analysis.recommendations
            }
          }));

          setChatMessages(prev => [...prev, {
            role: 'assistant',
            content: aiAnalysis,
            timestamp: new Date()
          }]);
          setIsTyping(false);
        } catch (error) {
          console.error('Error analyzing progress photo:', error);
          setChatMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Sorry, I encountered an error analyzing your photo. Please try again.',
            timestamp: new Date()
          }]);
          setIsTyping(false);
        }

      } else if (type === 'meal') {
        setTodayLog({ ...todayLog, mealPhotos: [...todayLog.mealPhotos, imageData] });

        setChatMessages(prev => [...prev, {
          role: 'user',
          content: '🍽️ Uploaded meal photo',
          timestamp: new Date()
        }]);

        setIsTyping(true);

        try {
          // Call Gemini Vision API for meal analysis
          const mealData = await analyzeMealPhotoWithGemini(imageData, userContext);

          const mealAnalysis = `Nice meal! Let me analyze it... 🔍\n\n**Estimated nutrition:**\n🔥 Calories: ~${mealData.calories} cal\n🥩 Protein: ~${mealData.protein}g\n🍚 Carbs: ~${mealData.carbs}g\n🥑 Fats: ~${mealData.fats}g\n\n**Meal quality:** ${'⭐'.repeat(mealData.quality)} (${mealData.quality}/5)\n\n**Foods identified:**\n${mealData.foods.map(food => `• ${food}`).join('\n')}\n\n**Tips:**\n${mealData.recommendations.map(rec => `✅ ${rec}`).join('\n')}\n\n**Remaining today:**\n- ${userData.dailyCalories - (todayLog.caloriesEaten + mealData.calories)} cal\n- ${userData.dailyProtein - (todayLog.proteinEaten + mealData.protein)}g protein\n\nLogged to your daily tracker! 📊`;

          setChatMessages(prev => [...prev, {
            role: 'assistant',
            content: mealAnalysis,
            timestamp: new Date()
          }]);

          // Update daily log with real data
          setTodayLog(prev => ({
            ...prev,
            caloriesEaten: prev.caloriesEaten + mealData.calories,
            proteinEaten: prev.proteinEaten + mealData.protein
          }));

          setIsTyping(false);
        } catch (error) {
          console.error('Error analyzing meal photo:', error);
          setChatMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Sorry, I encountered an error analyzing your meal. Please try again.',
            timestamp: new Date()
          }]);
          setIsTyping(false);
        }
      }
    };

    reader.readAsDataURL(file);
  };

  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUserData({ ...userData, profilePhoto: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  // Chat View
  const ChatView = () => (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 px-4">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
            )}
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-first' : ''}`}>
              <div className={`rounded-3xl px-6 py-4 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-gray-800 shadow-xl border border-gray-100'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-line font-medium">{msg.content}</p>
              </div>
              <p className={`text-xs mt-2 px-2 ${msg.role === 'user' ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {msg.role === 'user' && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white shadow-xl border border-gray-100 rounded-3xl px-6 py-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Action Pills */}
      <div className="mb-6 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setInputMessage('What should I eat today?')}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full text-sm font-semibold whitespace-nowrap hover:shadow-lg hover:scale-105 transition-all"
          >
            🍽️ Meal Plan
          </button>
          <button
            onClick={() => setInputMessage('Show my progress')}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-full text-sm font-semibold whitespace-nowrap hover:shadow-lg hover:scale-105 transition-all"
          >
            📊 Progress
          </button>
          <button
            onClick={() => setInputMessage('I need motivation')}
            className="px-5 py-2.5 bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-full text-sm font-semibold whitespace-nowrap hover:shadow-lg hover:scale-105 transition-all"
          >
            💪 Motivate
          </button>
          <button
            onClick={() => setInputMessage('Create workout plan')}
            className="px-5 py-2.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-sm font-semibold whitespace-nowrap hover:shadow-lg hover:scale-105 transition-all"
          >
            🏋️ Workout
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            {/* Photo Upload */}
            <label className="p-3 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 rounded-2xl cursor-pointer transition-all group">
              <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-colors" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e, 'progress')}
                className="hidden"
              />
            </label>

            {/* Voice Recording */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3 rounded-2xl transition-all ${
                isRecording
                  ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white animate-pulse shadow-lg shadow-red-200'
                  : 'hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 text-gray-400 hover:text-purple-500'
              }`}
            >
              <Mic className="w-6 h-6" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 px-5 py-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all text-gray-700 placeholder-gray-400"
            />

            {/* Send Button */}
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim()}
              className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-xl hover:shadow-purple-200 hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-3">
            {isRecording ? (
              <div className="flex items-center gap-2 text-red-500 animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-xs font-medium">Recording... Tap mic to stop</p>
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                💬 Voice, text, or upload photos for instant AI analysis
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard View (simplified for space)
  const DashboardView = () => (
    <div className="space-y-6">
      {/* User Profile Card */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 rounded-3xl p-6 text-white shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center overflow-hidden">
              {userData.profilePhoto ? (
                <img src={userData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all">
              <Camera className="w-3 h-3 text-purple-600" />
              <input type="file" accept="image/*" onChange={handleProfilePhotoUpload} className="hidden" />
            </label>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user?.displayName || 'Fitness Warrior'}</h2>
            <p className="text-purple-100">Goal: {userData.fitnessGoal}</p>
          </div>

          <button className="p-2 hover:bg-white/20 rounded-lg transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/30">
          <div>
            <p className="text-2xl font-bold">{userData.currentWeight} kg</p>
            <p className="text-xs text-purple-100">Current</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{totalLoss.toFixed(1)} kg</p>
            <p className="text-xs text-purple-100">Lost</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{daysRemaining}</p>
            <p className="text-xs text-purple-100">Days Left</p>
          </div>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white">
          <Flame className="w-8 h-8 mb-2" />
          <p className="text-3xl font-bold">{currentStreak}</p>
          <p className="text-sm">Day Streak</p>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 text-white">
          <Target className="w-8 h-8 mb-2" />
          <p className="text-3xl font-bold">{todayLog.proteinEaten}g</p>
          <p className="text-sm">Protein Today</p>
        </div>
      </div>

      {/* Quick Actions */}
      <button
        onClick={() => setCurrentView('chat')}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6" />
          <div className="text-left">
            <p className="font-bold">Talk to AI Coach</p>
            <p className="text-xs text-purple-100">Get instant advice & tracking</p>
          </div>
        </div>
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ReddyFit AI
              </h1>
              <p className="text-sm text-gray-600">{userData.startWeight} → {userData.targetWeight} kg</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">{currentStreak}</p>
                <p className="text-xs text-gray-600">streak 🔥</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'chat' && <ChatView />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg shadow-2xl border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                currentView === 'dashboard' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Activity className="w-6 h-6" />
              <span className="text-xs font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentView('chat')}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                currentView === 'chat' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="w-6 h-6" />
              <span className="text-xs font-medium">AI Coach</span>
            </button>

            <button
              onClick={() => setCurrentView('progress')}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                currentView === 'progress' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-xs font-medium">Progress</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spacer for bottom nav */}
      <div className="h-24"></div>
    </div>
  );
}
