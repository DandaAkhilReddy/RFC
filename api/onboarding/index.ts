import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getConnection, sql } from '../dbConfig';

export async function onboardingHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return { status: 200, headers };
  }

  try {
    const body = await request.json() as any;
    const {
      email,
      fitness_goal,
      current_fitness_level,
      workout_frequency,
      diet_preference,
      motivation,
      biggest_challenge,
      how_found_us,
      feature_interest,
      willing_to_pay,
      price_range
    } = body;

    if (!email) {
      return {
        status: 400,
        headers,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    const pool = await getConnection();

    // Get user ID from email
    const userResult = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id FROM user_profiles WHERE email = @email');

    if (userResult.recordset.length === 0) {
      return {
        status: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    const userId = userResult.recordset[0].id;

    // Check if onboarding already exists
    const existingOnboarding = await pool.request()
      .input('user_id', sql.UniqueIdentifier, userId)
      .query('SELECT id FROM onboarding_responses WHERE user_id = @user_id');

    if (existingOnboarding.recordset.length > 0) {
      // Update existing onboarding
      await pool.request()
        .input('user_id', sql.UniqueIdentifier, userId)
        .input('fitness_goal', sql.NVarChar, fitness_goal)
        .input('current_fitness_level', sql.NVarChar, current_fitness_level)
        .input('workout_frequency', sql.NVarChar, workout_frequency)
        .input('diet_preference', sql.NVarChar, diet_preference)
        .input('motivation', sql.NVarChar, motivation)
        .input('biggest_challenge', sql.NVarChar, biggest_challenge)
        .input('how_found_us', sql.NVarChar, how_found_us)
        .input('feature_interest', sql.NVarChar, JSON.stringify(feature_interest || []))
        .input('willing_to_pay', sql.NVarChar, willing_to_pay)
        .input('price_range', sql.NVarChar, price_range)
        .query(`
          UPDATE onboarding_responses
          SET fitness_goal = @fitness_goal,
              current_fitness_level = @current_fitness_level,
              workout_frequency = @workout_frequency,
              diet_preference = @diet_preference,
              motivation = @motivation,
              biggest_challenge = @biggest_challenge,
              how_found_us = @how_found_us,
              feature_interest = @feature_interest,
              willing_to_pay = @willing_to_pay,
              price_range = @price_range
          WHERE user_id = @user_id
        `);
    } else {
      // Insert new onboarding
      await pool.request()
        .input('user_id', sql.UniqueIdentifier, userId)
        .input('fitness_goal', sql.NVarChar, fitness_goal)
        .input('current_fitness_level', sql.NVarChar, current_fitness_level)
        .input('workout_frequency', sql.NVarChar, workout_frequency)
        .input('diet_preference', sql.NVarChar, diet_preference)
        .input('motivation', sql.NVarChar, motivation)
        .input('biggest_challenge', sql.NVarChar, biggest_challenge)
        .input('how_found_us', sql.NVarChar, how_found_us)
        .input('feature_interest', sql.NVarChar, JSON.stringify(feature_interest || []))
        .input('willing_to_pay', sql.NVarChar, willing_to_pay)
        .input('price_range', sql.NVarChar, price_range)
        .query(`
          INSERT INTO onboarding_responses (
            user_id, fitness_goal, current_fitness_level, workout_frequency,
            diet_preference, motivation, biggest_challenge, how_found_us,
            feature_interest, willing_to_pay, price_range
          )
          VALUES (
            @user_id, @fitness_goal, @current_fitness_level, @workout_frequency,
            @diet_preference, @motivation, @biggest_challenge, @how_found_us,
            @feature_interest, @willing_to_pay, @price_range
          )
        `);
    }

    // Update user profile to mark onboarding as completed
    await pool.request()
      .input('user_id', sql.UniqueIdentifier, userId)
      .query('UPDATE user_profiles SET onboarding_completed = 1 WHERE id = @user_id');

    return {
      status: 200,
      headers,
      body: JSON.stringify({ message: 'Onboarding saved successfully' })
    };

  } catch (error: any) {
    context.error('Database error:', error);
    return {
      status: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
}

app.http('onboarding', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'onboarding',
  handler: onboardingHandler
});
