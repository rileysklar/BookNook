# Activity Tracking Database Migration

This migration adds comprehensive activity tracking for user actions including library creation and search history.

## What This Migration Adds

### New Table: `activities`
- Tracks all user activities (library creation, searches, views, etc.)
- Links to users via `user_id`
- Stores activity metadata in JSONB format
- Includes timestamps for chronological ordering

### Activity Types
- `library_created` - When a user creates a new library
- `library_updated` - When a library is modified
- `library_deleted` - When a library is removed
- `search_performed` - When a user searches for locations
- `library_viewed` - When a user views a library
- `library_rated` - When a user rates a library

### Automatic Triggers
- **Library Creation Trigger**: Automatically creates activity when library is created
- **Search Activity Function**: Helper function to log search queries
- **Recent Activities Function**: Retrieves user's recent activities

### Security
- Row Level Security (RLS) enabled
- Users can only see/modify their own activities
- Proper access policies implemented

## How to Run This Migration

1. **Connect to your Supabase database**:
   ```bash
   # Using Supabase CLI
   supabase db reset
   
   # Or run the SQL directly in Supabase Dashboard SQL Editor
   ```

2. **Run the migration**:
   ```sql
   -- Copy and paste the contents of add-activity-tracking.sql
   -- into the Supabase SQL Editor and execute
   ```

3. **Verify the migration**:
   ```sql
   -- Check that the table was created
   SELECT * FROM activities LIMIT 5;
   
   -- Check that the trigger exists
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_create_library_activity';
   
   -- Test the functions
   SELECT get_user_recent_activities('your-user-id-here', 5);
   ```

## What Happens After Migration

1. **Automatic Library Tracking**: Every new library creation will automatically create an activity record
2. **Search History**: Search queries can be logged using the `create_search_activity` function
3. **Recent Activity Feed**: The UI can now display real user activity data
4. **Clickable History**: Users can click on past activities to revisit them

## API Integration

The migration provides these functions for the API to use:

- `create_search_activity(user_id, search_query, results_count, coordinates)` - Log search queries
- `get_user_recent_activities(user_id, limit)` - Get user's recent activities
- Automatic library creation tracking via database trigger

## Next Steps

After running this migration:
1. Update the API routes to use the new activity functions
2. Modify the Recent Activity UI to display real data
3. Add click handlers to make activities interactive
4. Implement search history tracking in the MapSearch component
