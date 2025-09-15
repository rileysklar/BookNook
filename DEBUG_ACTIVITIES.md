# Debugging Activities API

## Current Issue
The activities API is failing with "Failed to fetch activities" error.

## Possible Causes
1. **Authentication Issue**: User not properly signed in
2. **Database Missing**: Activities table doesn't exist yet
3. **API Error**: Server-side error in the activities route

## Debugging Steps

### 1. Check Browser Console
Open browser dev tools and look for:
- Network tab: Check the `/api/activities` request
- Console tab: Look for detailed error messages
- Application tab: Check if Clerk session exists

### 2. Test Authentication
Make sure you're signed in:
- Check if user profile shows in the UI
- Look for Clerk session in browser storage
- Verify `auth()` is working in the API

### 3. Check Database
Run this in Supabase SQL Editor to check if table exists:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'activities';
```

### 4. Test API Directly
If signed in, test the API in browser console:
```javascript
fetch('/api/activities')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

## Quick Fix
If the activities table doesn't exist, run this SQL:

```sql
-- Create activity_types enum
CREATE TYPE activity_type AS ENUM (
  'library_created', 'library_updated', 'library_deleted',
  'search_performed', 'library_viewed', 'library_rated'
);

-- Create activities table
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    activity_type activity_type NOT NULL,
    entity_id UUID,
    entity_type VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes and security
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activities" ON activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" ON activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Expected Behavior After Fix
- Recent Activity section shows helpful error message
- No more console errors
- Activity tracking works after migration
