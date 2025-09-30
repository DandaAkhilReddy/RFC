/*
  # Add full_name column to waitlist table
  
  ## Changes
  - Add `full_name` column to waitlist table
  - Make it NOT NULL with a default empty string for existing rows
  
  ## Migration Details
  This migration adds a full_name field to the waitlist table to capture
  user's full name during waitlist signup.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'waitlist' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE waitlist ADD COLUMN full_name text NOT NULL DEFAULT '';
  END IF;
END $$;