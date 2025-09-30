/*
  # User Profiles and Onboarding Questionnaire

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `gender` (text: 'male' or 'female')
      - `avatar_url` (text, optional)
      - `onboarding_completed` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `onboarding_responses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `fitness_goal` (text: weight loss, muscle gain, general fitness, etc)
      - `current_fitness_level` (text: beginner, intermediate, advanced)
      - `workout_frequency` (text: 1-2, 3-4, 5-6, 7 days/week)
      - `diet_preference` (text: veg, non-veg, vegan, etc)
      - `motivation` (text: why they want to transform)
      - `biggest_challenge` (text: what holds them back)
      - `how_found_us` (text: social media, friend, search, etc)
      - `feature_interest` (text array: what features excite them most)
      - `willing_to_pay` (text: yes/no/maybe)
      - `price_range` (text: budget expectations)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can only read/update their own profile
    - Users can only insert/read their own onboarding responses
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  gender text CHECK (gender IN ('male', 'female')),
  avatar_url text,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create onboarding_responses table
CREATE TABLE IF NOT EXISTS onboarding_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  fitness_goal text NOT NULL,
  current_fitness_level text NOT NULL,
  workout_frequency text NOT NULL,
  diet_preference text NOT NULL,
  motivation text NOT NULL,
  biggest_challenge text NOT NULL,
  how_found_us text NOT NULL,
  feature_interest text[] DEFAULT '{}',
  willing_to_pay text,
  price_range text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own responses"
  ON onboarding_responses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own responses"
  ON onboarding_responses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own responses"
  ON onboarding_responses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON onboarding_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
