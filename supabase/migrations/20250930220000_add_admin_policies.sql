-- Add admin access policies to allow specific admin users to view all user data

-- Admin emails that can access all user data
-- Replace 'akhilreddyd3@gmail.com' with your actual admin email
CREATE OR REPLACE FUNCTION is_admin(user_email text)
RETURNS boolean AS $$
BEGIN
  RETURN user_email IN ('akhilreddyd3@gmail.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy to allow admins to view all user profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- Policy to allow admins to view all onboarding responses
CREATE POLICY "Admins can view all responses"
  ON onboarding_responses FOR SELECT
  TO authenticated
  USING (
    is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  );
