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
    context.log('Received onboarding request');

    const body = await request.json() as any;
    context.log('Request body:', JSON.stringify(body));

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
      context.log('Error: Email is required');
      return {
        status: 400,
        headers,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    context.log('Getting database connection...');
    const pool = await getConnection();
    context.log('Database connection established');

    // Get user ID from email
    context.log('Querying user profile for email:', email);
    const userResult = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id FROM user_profiles WHERE email = @email');

    if (userResult.recordset.length === 0) {
      context.log('Error: User not found for email:', email);
      return {
        status: 404,
        headers,
        body: JSON.stringify({ error: 'User not found. Please sign in first.' })
      };
    }

    const userId = userResult.recordset[0].id;
    context.log('Found user ID:', userId);

    // Check if onboarding already exists
    context.log('Checking for existing onboarding...');
    const existingOnboarding = await pool.request()
      .input('user_id', sql.UniqueIdentifier, userId)
      .query('SELECT id FROM onboarding_responses WHERE user_id = @user_id');

    if (existingOnboarding.recordset.length > 0) {
      // Update existing onboarding
      context.log('Updating existing onboarding response');
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
      context.log('Inserting new onboarding response');
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
    context.log('Marking onboarding as completed');
    await pool.request()
      .input('user_id', sql.UniqueIdentifier, userId)
      .query('UPDATE user_profiles SET onboarding_completed = 1, updated_at = GETUTCDATE() WHERE id = @user_id');

    context.log('Onboarding saved successfully');
    return {
      status: 200,
      headers,
      body: JSON.stringify({ message: 'Onboarding saved successfully', success: true })
    };

  } catch (error: any) {
    context.error('Error in onboarding handler:', error);
    context.error('Error stack:', error.stack);
    return {
      status: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to save onboarding response',
        details: error.message,
        success: false
      })
    };
  }
}

app.http('onboarding', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'onboarding',
  handler: onboardingHandler
});
