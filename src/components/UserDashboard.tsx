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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendAudioToAI(audioBlob);
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

  const sendAudioToAI = async (audioBlob: Blob) => {
    // Add user message placeholder
    setChatMessages(prev => [...prev, {
      role: 'user',
      content: '🎤 Voice message...',
      timestamp: new Date()
    }]);

    setIsTyping(true);

    try {
      // In production, this will call your Make.com webhook or OpenAI API
      // For now, simulating AI response
      setTimeout(() => {
        const aiResponse = generateAIResponse('voice recording received');
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        }]);
        setIsTyping(false);
      }, 2000);
    } catch (error) {
      console.error('Error processing audio:', error);
      setIsTyping(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message
    setChatMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setIsTyping(true);

    try {
      // Call OpenAI API or Make.com webhook
      const aiResponse = await callAIAPI(userMessage);

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
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }
  };

  const callAIAPI = async (message: string): Promise<string> => {
    // TODO: Replace with actual OpenAI API call or Make.com webhook
    // For now, generate contextual responses
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateAIResponse(message));
      }, 1500);
    });
  };

  const generateAIResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    // Contextual responses based on keywords
    if (lowerMessage.includes('weight') || lowerMessage.includes('kg')) {
      return `Great question about weight! Based on your goal (${userData.targetWeight}kg), you're currently at ${userData.currentWeight}kg. That's ${remainingLoss.toFixed(1)}kg to go!\n\n📊 To lose this safely:\n- Continue your ${userData.dailyCalories} cal/day diet\n- Maintain ${userData.dailyProtein}g protein\n- Stay consistent with workouts\n\nYou've got ${daysRemaining} days to reach your goal. That's about ${(remainingLoss / (daysRemaining / 7)).toFixed(2)}kg per week - very achievable! 💪`;
    }

    if (lowerMessage.includes('meal') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
      return `Let's talk nutrition! 🍽️\n\n**Your daily targets:**\n- Calories: ${userData.dailyCalories} cal\n- Protein: ${userData.dailyProtein}g\n- Stay hydrated: 3-4L water\n\n**Today's intake:**\n- ${todayLog.caloriesEaten} cal (${userData.dailyCalories - todayLog.caloriesEaten} remaining)\n- ${todayLog.proteinEaten}g protein (${userData.dailyProtein - todayLog.proteinEaten}g to go)\n\n📸 Upload meal photos and I'll help you track macros!`;
    }

    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise') || lowerMessage.includes('train')) {
      return `Time to crush it! 💪\n\n**Your workout plan:**\n- Morning: 30-min cardio (fasted)\n- Evening: Strength training (PPL split)\n- Rest day: Active recovery\n\n**This week:** ${totalWorkouts} workouts completed\n**Streak:** ${currentStreak} days 🔥\n\nWhich workout are you doing today? I can suggest exercises and track your sets!`;
    }

    if (lowerMessage.includes('progress') || lowerMessage.includes('photo') || lowerMessage.includes('picture')) {
      return `Progress photos are KEY! 📸\n\n**Benefits:**\n- Visual tracking beats scale numbers\n- AI can estimate body fat %\n- Compare weekly changes\n- Motivation booster!\n\n**Pro tips:**\n- Same time daily (morning, fasted)\n- Same lighting & angle\n- Weekly front/side/back\n- Track measurements too\n\nUpload today's photo and I'll analyze your progress!`;
    }

    if (lowerMessage.includes('motivat') || lowerMessage.includes('give up') || lowerMessage.includes('hard')) {
      return `I hear you! 💙 Transformation isn't easy, but YOU'RE DOING IT!\n\n**Remember:**\n✨ You've already lost ${totalLoss.toFixed(1)}kg\n🔥 ${currentStreak} day streak - that's dedication!\n💪 ${totalWorkouts} workouts - you're building discipline\n\n**Why you started:**\n${userData.fitnessGoal}\n\nEvery day you show up = one day closer to your dream physique. The pain is temporary, but the six-pack is forever! 🏆\n\nWhat's one small win you can celebrate today?`;
    }

    if (lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('rest')) {
      return `Sleep is CRUCIAL for fat loss! 😴\n\n**Why it matters:**\n- Muscle recovery & growth\n- Hormone regulation (leptin, ghrelin)\n- Energy for workouts\n- Reduced cravings\n\n**Your sleep:** ${todayLog.sleepHours || 0} hours last night\n**Target:** 7-9 hours\n\n💡 Tips:\n- No screens 1hr before bed\n- Cool room (18-20°C)\n- Consistent schedule\n- Magnesium supplement\n\nHow's your sleep quality been?`;
    }

    // Default helpful response
    return `I'm here to help with your fitness journey! 🚀\n\n**I can assist with:**\n🎯 Daily tracking & accountability\n📊 Progress analysis & insights\n🍽️ Nutrition planning & macro tracking\n💪 Workout suggestions & form tips\n📸 Body composition analysis from photos\n🧘 Recovery & lifestyle advice\n\n**Quick actions:**\n- "Log today's weight"\n- "What should I eat?"\n- "Show my progress"\n- "I need motivation"\n\nWhat would you like to focus on?`;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'progress' | 'meal' | 'workout') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageData = reader.result as string;

      if (type === 'progress') {
        setTodayLog({ ...todayLog, progressPhoto: imageData });

        // Simulate AI analysis
        setChatMessages(prev => [...prev, {
          role: 'user',
          content: '📸 Uploaded progress photo',
          timestamp: new Date()
        }]);

        setIsTyping(true);

        setTimeout(() => {
          const aiAnalysis = `Great progress photo! 📸\n\n**AI Body Analysis:**\n🎯 Estimated body fat: ~18-20%\n💪 Muscle definition: Improving!\n📊 Posture: Good alignment\n\n**Changes detected:**\n- Visible reduction in midsection\n- Better shoulder definition\n- Core engagement improved\n\n**Recommendations:**\n✅ Keep up current calorie deficit\n✅ Increase ab-focused workouts\n✅ Consider adding HIIT sessions\n\n**Next milestone:** 2-3% body fat reduction = visible abs! Keep going! 🔥`;

          setChatMessages(prev => [...prev, {
            role: 'assistant',
            content: aiAnalysis,
            timestamp: new Date()
          }]);
          setIsTyping(false);
        }, 2000);

      } else if (type === 'meal') {
        setTodayLog({ ...todayLog, mealPhotos: [...todayLog.mealPhotos, imageData] });

        setChatMessages(prev => [...prev, {
          role: 'user',
          content: '🍽️ Uploaded meal photo',
          timestamp: new Date()
        }]);

        setIsTyping(true);

        setTimeout(() => {
          const mealAnalysis = `Nice meal! Let me analyze it... 🔍\n\n**Estimated nutrition:**\n🔥 Calories: ~450 cal\n🥩 Protein: ~35g\n🍚 Carbs: ~40g\n🥑 Fats: ~18g\n\n**Meal quality:** ⭐⭐⭐⭐ (4/5)\n✅ Good protein source\n✅ Balanced macros\n⚠️ Watch portion size\n\n**Remaining today:**\n- ${userData.dailyCalories - (todayLog.caloriesEaten + 450)} cal\n- ${userData.dailyProtein - (todayLog.proteinEaten + 35)}g protein\n\nLogged to your daily tracker! 📊`;

          setChatMessages(prev => [...prev, {
            role: 'assistant',
            content: mealAnalysis,
            timestamp: new Date()
          }]);

          // Update daily log
          setTodayLog(prev => ({
            ...prev,
            caloriesEaten: prev.caloriesEaten + 450,
            proteinEaten: prev.proteinEaten + 35
          }));

          setIsTyping(false);
        }, 2000);
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
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white shadow-md text-gray-800'
            }`}>
              <p className="text-sm whitespace-pre-line">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-purple-100' : 'text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white shadow-md rounded-2xl px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Action Buttons */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setInputMessage('What should I eat today?')}
          className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium whitespace-nowrap hover:bg-orange-200 transition-all"
        >
          🍽️ Meal suggestions
        </button>
        <button
          onClick={() => setInputMessage('Show my progress')}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium whitespace-nowrap hover:bg-blue-200 transition-all"
        >
          📊 View progress
        </button>
        <button
          onClick={() => setInputMessage('I need motivation')}
          className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium whitespace-nowrap hover:bg-pink-200 transition-all"
        >
          💪 Motivate me
        </button>
        <button
          onClick={() => setInputMessage('Log today')}
          className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium whitespace-nowrap hover:bg-green-200 transition-all"
        >
          ✅ Quick log
        </button>
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex items-center gap-3">
          {/* Photo Upload */}
          <label className="p-3 hover:bg-gray-100 rounded-xl cursor-pointer transition-all">
            <ImageIcon className="w-5 h-5 text-gray-600" />
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
            className={`p-3 rounded-xl transition-all ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message or question..."
            className="flex-1 px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim()}
            className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-2 text-center">
          {isRecording ? '🔴 Recording... Tap mic to stop' : 'Ask anything about fitness, nutrition, or your progress'}
        </p>
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
