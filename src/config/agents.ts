import { LucideIcon } from 'lucide-react';

export interface Agent {
  key: string;
  name: string;
  category: 'flagship' | 'core';
  icon: string;
  emoji: string;
  tagline: string;
  description: string;
  route: string;
  gradient: string;
  comingSoon?: boolean;
}

export const AGENTS: Agent[] = [
  // Flagship Agents
  {
    key: 'rapid',
    name: 'AgentRapid',
    category: 'flagship',
    icon: 'Zap',
    emoji: '⚡',
    tagline: 'One fresh photo. Real numbers.',
    description: 'Full AI agent with personalized meal plans, workout generation, and voice commands',
    route: 'rapid-ai',
    gradient: 'from-purple-500 to-blue-500',
    comingSoon: true, // COMING SOON - Only Body Fat Checker is live
  },
  {
    key: 'cupid',
    name: 'AgentCupid',
    category: 'flagship',
    icon: 'Heart',
    emoji: '♥️',
    tagline: 'Find your fitness match',
    description: 'AI-powered fitness dating and matching with workout buddies near you',
    route: 'community',
    gradient: 'from-pink-500 to-red-500',
    comingSoon: true, // COMING SOON
  },
  // Core Agents
  {
    key: 'lean',
    name: 'AgentLean',
    category: 'core',
    icon: 'BarChart3',
    emoji: '📊',
    tagline: 'Scan your photo. Discover your lean potential.',
    description: 'Precision body fat calculator with detailed composition analysis',
    route: 'agents/lean',
    gradient: 'from-emerald-500 to-teal-500',
    comingSoon: true,
  },
  {
    key: 'rise',
    name: 'AgentRise',
    category: 'core',
    icon: 'TrendingUp',
    emoji: '📈',
    tagline: 'Track every rep. Celebrate every win.',
    description: 'Advanced progress tracking with AI-powered insights and milestone celebrations',
    route: 'agents/rise',
    gradient: 'from-blue-500 to-indigo-500',
    comingSoon: true,
  },
  {
    key: 'fuel',
    name: 'AgentFuel',
    category: 'core',
    icon: 'Utensils',
    emoji: '🍽️',
    tagline: 'Eat smart. Fuel your goals.',
    description: 'Personalized meal plans tailored to your macros, preferences, and fitness goals',
    route: 'agents/fuel',
    gradient: 'from-orange-500 to-amber-500',
    comingSoon: true,
  },
  {
    key: 'forge',
    name: 'AgentForge',
    category: 'core',
    icon: 'Dumbbell',
    emoji: '💪',
    tagline: 'Build strength. Shape your future.',
    description: 'AI-generated workout plans optimized for your level, equipment, and targets',
    route: 'agents/forge',
    gradient: 'from-red-500 to-rose-500',
    comingSoon: true,
  },
];

export const getFlagshipAgents = (): Agent[] => {
  return AGENTS.filter(agent => agent.category === 'flagship');
};

export const getCoreAgents = (): Agent[] => {
  return AGENTS.filter(agent => agent.category === 'core');
};

export const getAgentByKey = (key: string): Agent | undefined => {
  return AGENTS.find(agent => agent.key === key);
};
