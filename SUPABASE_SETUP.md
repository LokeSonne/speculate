# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `speculate-feature-specs`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 3. Set Up Environment Variables

1. Copy `env.example` to `.env`:

   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 4. Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:

- User profiles table
- Feature specifications table
- Related tables (success criteria, reviewers, etc.)
- Row Level Security policies
- Database triggers

## 5. Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Configure your site URL:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add `http://localhost:5173/**`
3. Optionally configure email templates in **Authentication** → **Email Templates**

## 6. Test the Setup

1. Start the development server:

   ```bash
   pnpm dev
   ```

2. Navigate to `http://localhost:5173`
3. Try creating an account and signing in
4. Create a feature specification to test the database integration

## 7. Production Setup

When deploying to production:

1. Update your environment variables with production URLs
2. In Supabase dashboard, update:
   - **Site URL** to your production domain
   - **Redirect URLs** to include your production domain
3. Consider setting up custom email templates
4. Review and adjust Row Level Security policies as needed

## Database Schema Overview

The schema includes these main tables:

- **profiles**: User profile information
- **feature_specs**: Main feature specification records
- **success_criteria**: Success criteria for each spec
- **reviewers**: Reviewers assigned to each spec
- **target_users**: Target user types for each spec
- **user_goals**: User goals for each spec
- **use_cases**: Use cases for each spec
- **core_interactions**: Core interactions for each spec

All tables have Row Level Security enabled, ensuring users can only access their own data and view public data.

## Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Make sure your `.env` file exists and has the correct values
   - Restart your development server after adding environment variables

2. **Authentication not working**
   - Check that your Site URL and Redirect URLs are configured correctly
   - Verify your environment variables are correct

3. **Database errors**
   - Make sure you've run the schema.sql file in the SQL Editor
   - Check that all tables and policies were created successfully

4. **Permission denied errors**
   - Verify Row Level Security policies are set up correctly
   - Check that users are properly authenticated

### Getting Help:

- Check the [Supabase Documentation](https://supabase.com/docs)
- Visit the [Supabase Community](https://github.com/supabase/supabase/discussions)
- Review the [Vue.js Integration Guide](https://supabase.com/docs/guides/getting-started/quickstarts/vue)
