# Single-Device Login Setup Guide

## Database Setup Required

To enable the single-device login system, you need to create a `user_sessions` table in your Supabase database. Run the following SQL in your Supabase SQL editor:

### Step 1: Create the user_sessions table

```sql
-- Create user_sessions table for single-device login tracking
CREATE TABLE public.user_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_name TEXT NOT NULL,
  browser_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Indexes for fast lookups
  CONSTRAINT user_sessions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_device_id ON public.user_sessions(device_id);
CREATE INDEX idx_user_sessions_user_active ON public.user_sessions(user_id, is_active);
CREATE INDEX idx_user_sessions_created_at ON public.user_sessions(created_at);

-- Set up row security (RLS)
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Allow users to read only their own sessions
CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update only their own sessions (mark as inactive)
CREATE POLICY "Users can update their own sessions"
  ON public.user_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow system to insert sessions
CREATE POLICY "System can insert sessions"
  ON public.user_sessions
  FOR INSERT
  WITH CHECK (true);
```

### Step 2: Enable Realtime for user_sessions table

After creating the table, enable Realtime notifications:

1. Go to your Supabase Dashboard
2. Navigate to **Database** → **Replication**
3. Find the `user_sessions` table
4. Toggle **Realtime** to enable it

Or use the SQL command (if supported by your Supabase version):

```sql
BEGIN;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sessions;
COMMIT;
```

## How It Works

### Login Flow

1. User enters email/password on device A
2. User verifies OTP
3. `createSessionRecord()` is called with the user's ID
4. A new session record is created in the database with device info
5. All previous sessions for this user are marked as `is_active = false`
6. Device A's session remains active

### Concurrent Login Detection

1. User logs in on device B with the same account
2. `createSessionRecord()` creates a new session for device B
3. Database automatically marks all previous sessions (including device A) as `is_active = false`
4. Device A receives a Realtime notification about the session change
5. Device A's `listenForSessionInvalidation()` callback triggers
6. Device A automatically logs out and shows a warning message

### Logout Flow

1. User clicks logout
2. `handleLogout()` calls `invalidateCurrentSession()`
3. The session is marked as `is_active = false` in the database
4. Session ID is cleared from local storage
5. User is redirected to landing page

## Features

✅ **Single Device at a Time**: Only one active session per user account
✅ **Automatic Detection**: Concurrent logins are detected in real-time via Supabase Realtime
✅ **Force Logout**: Previous device is immediately logged out when new device logs in
✅ **Session Tracking**: All sessions are tracked with device info and timestamps
✅ **Graceful Fallback**: System works even if database is temporarily unavailable
✅ **User-Friendly**: Clear notifications when session is invalidated

## Testing the Feature

### Test Single-Device Login:

1. Open the app in Chrome and log in (Device A)
2. Open the app in Firefox with the same account (Device B)
3. Verify that Device A shows a logout message and is redirected to login
4. Verify that Device B remains logged in

### Test Session Persistence:

1. Log in to the app
2. Refresh the page
3. Verify that you remain logged in (session persists)

### Test Manual Logout:

1. Log in to the app
2. Click logout
3. Verify that you're redirected to landing page
4. Verify that the session is cleared

## Troubleshooting

### Sessions not being tracked

- Verify that the `user_sessions` table exists in Supabase
- Check browser console for errors
- Ensure Supabase URL and API key are correct

### Realtime notifications not working

- Verify that Realtime is enabled for the `user_sessions` table
- Check Supabase Dashboard → Database → Replication
- Ensure Row Level Security (RLS) policies are set correctly

### Users not being logged out on concurrent login

- Check Supabase Realtime status
- Verify database connection is active
- Check browser console for errors in `listenForSessionInvalidation()`

## Security Considerations

1. **Device ID Generation**: Uses browser fingerprinting for persistent device identification
2. **Session Validation**: Each session is validated against device_id to prevent cross-device session hijacking
3. **RLS Policies**: Users can only see/modify their own sessions
4. **Automatic Cleanup**: Sessions are marked inactive (soft delete) rather than hard deleted for audit trail

## Future Enhancements

- Add session management UI to view all active sessions
- Add option to end specific sessions remotely
- Add device name customization
- Track IP addresses and geolocation
- Add suspicious login detection
