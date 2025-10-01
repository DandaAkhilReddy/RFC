-- ReddyFit Azure SQL Database Schema

-- Create user_profiles table
CREATE TABLE user_profiles (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL UNIQUE,
    firebase_uid NVARCHAR(255) UNIQUE,
    full_name NVARCHAR(255),
    gender NVARCHAR(10) CHECK (gender IN ('male', 'female')),
    avatar_url NVARCHAR(500),
    onboarding_completed BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE()
);

-- Create index on email for faster lookups
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_firebase_uid ON user_profiles(firebase_uid);

-- Create onboarding_responses table
CREATE TABLE onboarding_responses (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    fitness_goal NVARCHAR(100) NOT NULL,
    current_fitness_level NVARCHAR(50) NOT NULL,
    workout_frequency NVARCHAR(50) NOT NULL,
    diet_preference NVARCHAR(50) NOT NULL,
    motivation NVARCHAR(MAX) NOT NULL,
    biggest_challenge NVARCHAR(MAX) NOT NULL,
    how_found_us NVARCHAR(100) NOT NULL,
    feature_interest NVARCHAR(MAX), -- Stored as JSON string
    willing_to_pay NVARCHAR(20),
    price_range NVARCHAR(50),
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Create index for faster user lookups
CREATE INDEX idx_onboarding_user_id ON onboarding_responses(user_id);

-- Create trigger to update updated_at on user_profiles
GO
CREATE TRIGGER trg_user_profiles_update
ON user_profiles
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE user_profiles
    SET updated_at = GETUTCDATE()
    FROM user_profiles u
    INNER JOIN inserted i ON u.id = i.id;
END;
GO

-- Create waitlist table (legacy)
CREATE TABLE waitlist (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL UNIQUE,
    full_name NVARCHAR(255),
    created_at DATETIME2 DEFAULT GETUTCDATE()
);

CREATE INDEX idx_waitlist_email ON waitlist(email);
