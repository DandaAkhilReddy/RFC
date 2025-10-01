// API client for Azure Functions backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface UserProfile {
  id: string;
  email: string;
  firebase_uid?: string;
  full_name?: string;
  gender?: string;
  avatar_url?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingData {
  email: string;
  fitness_goal: string;
  current_fitness_level: string;
  workout_frequency: string;
  diet_preference: string;
  motivation: string;
  biggest_challenge: string;
  how_found_us: string;
  feature_interest: string[];
  willing_to_pay: string;
  price_range: string;
}

export const api = {
  // Get user profile by email or firebase_uid
  async getUserProfile(params: { email?: string; firebase_uid?: string }): Promise<UserProfile | null> {
    const queryParams = new URLSearchParams();
    if (params.email) queryParams.append('email', params.email);
    if (params.firebase_uid) queryParams.append('firebase_uid', params.firebase_uid);

    const response = await fetch(`${API_BASE_URL}/users/profile?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    return response.json();
  },

  // Create or update user profile
  async upsertUserProfile(data: {
    email: string;
    firebase_uid?: string;
    full_name?: string;
    gender?: string;
    avatar_url?: string;
  }): Promise<{ message: string; id: string }> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to upsert user profile');
    }
    return response.json();
  },

  // Get all users (admin only)
  async getAllUsers(): Promise<UserProfile[]> {
    const response = await fetch(`${API_BASE_URL}/users/all`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  },

  // Update onboarding status
  async updateOnboardingStatus(email: string, completed: boolean): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/users/onboarding-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, completed }),
    });
    if (!response.ok) {
      throw new Error('Failed to update onboarding status');
    }
    return response.json();
  },

  // Submit onboarding responses
  async submitOnboarding(data: OnboardingData): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to submit onboarding');
    }
    return response.json();
  },
};
