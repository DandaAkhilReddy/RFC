import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getConnection, sql } from '../dbConfig';

export async function usersHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const action = request.params.action || '';

  context.log(`Processing request: ${request.method} /api/users/${action}`);

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return { status: 200, headers };
  }

  try {
    const pool = await getConnection();

    // Get user by email or firebase_uid
    if (request.method === 'GET' && action === 'profile') {
      const email = request.query.get('email');
      const firebaseUid = request.query.get('firebase_uid');

      if (!email && !firebaseUid) {
        return {
          status: 400,
          headers,
          body: JSON.stringify({ error: 'Email or firebase_uid required' })
        };
      }

      const result = await pool.request()
        .input('email', sql.NVarChar, email)
        .input('firebase_uid', sql.NVarChar, firebaseUid)
        .query(`
          SELECT * FROM user_profiles
          WHERE email = @email OR firebase_uid = @firebase_uid
        `);

      return {
        status: 200,
        headers,
        body: JSON.stringify(result.recordset[0] || null)
      };
    }

    // Create or update user profile
    if (request.method === 'POST' && action === 'profile') {
      const body = await request.json() as any;
      const { email, firebase_uid, full_name, gender, avatar_url } = body;

      if (!email) {
        return {
          status: 400,
          headers,
          body: JSON.stringify({ error: 'Email is required' })
        };
      }

      // Check if user exists
      const existingUser = await pool.request()
        .input('email', sql.NVarChar, email)
        .query('SELECT id FROM user_profiles WHERE email = @email');

      if (existingUser.recordset.length > 0) {
        // Update existing user
        await pool.request()
          .input('email', sql.NVarChar, email)
          .input('firebase_uid', sql.NVarChar, firebase_uid)
          .input('full_name', sql.NVarChar, full_name)
          .input('gender', sql.NVarChar, gender)
          .input('avatar_url', sql.NVarChar, avatar_url)
          .query(`
            UPDATE user_profiles
            SET firebase_uid = @firebase_uid,
                full_name = @full_name,
                gender = @gender,
                avatar_url = @avatar_url
            WHERE email = @email
          `);

        return {
          status: 200,
          headers,
          body: JSON.stringify({ message: 'Profile updated', id: existingUser.recordset[0].id })
        };
      } else {
        // Insert new user
        const result = await pool.request()
          .input('email', sql.NVarChar, email)
          .input('firebase_uid', sql.NVarChar, firebase_uid)
          .input('full_name', sql.NVarChar, full_name)
          .input('gender', sql.NVarChar, gender)
          .input('avatar_url', sql.NVarChar, avatar_url)
          .query(`
            INSERT INTO user_profiles (email, firebase_uid, full_name, gender, avatar_url)
            OUTPUT INSERTED.id
            VALUES (@email, @firebase_uid, @full_name, @gender, @avatar_url)
          `);

        return {
          status: 201,
          headers,
          body: JSON.stringify({ message: 'Profile created', id: result.recordset[0].id })
        };
      }
    }

    // Get all users (admin only - add auth check in production)
    if (request.method === 'GET' && action === 'all') {
      const result = await pool.request().query(`
        SELECT
          up.*,
          orr.fitness_goal,
          orr.current_fitness_level,
          orr.workout_frequency,
          orr.diet_preference,
          orr.motivation,
          orr.biggest_challenge,
          orr.how_found_us,
          orr.feature_interest,
          orr.willing_to_pay,
          orr.price_range
        FROM user_profiles up
        LEFT JOIN onboarding_responses orr ON up.id = orr.user_id
        ORDER BY up.created_at DESC
      `);

      return {
        status: 200,
        headers,
        body: JSON.stringify(result.recordset)
      };
    }

    // Update onboarding status
    if (request.method === 'PUT' && action === 'onboarding-status') {
      const body = await request.json() as any;
      const { email, completed } = body;

      await pool.request()
        .input('email', sql.NVarChar, email)
        .input('completed', sql.Bit, completed ? 1 : 0)
        .query(`
          UPDATE user_profiles
          SET onboarding_completed = @completed
          WHERE email = @email
        `);

      return {
        status: 200,
        headers,
        body: JSON.stringify({ message: 'Onboarding status updated' })
      };
    }

    return {
      status: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found' })
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

app.http('users', {
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'users/{action?}',
  handler: usersHandler
});
