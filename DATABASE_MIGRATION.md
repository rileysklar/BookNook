# Database Migration: Add Users and Creator Information

This migration adds user management and creator tracking to your BookNook database.

## 🚀 Quick Setup

### Option 1: Run via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**

2. **Run the Migration**
   - Copy the contents of `supabase/add-users-and-creator.sql`
   - Paste into the SQL Editor
   - Click **Run** to execute

3. **Verify Success**
   - You should see success messages like:
     - "🎉 Users table created!"
     - "📚 Libraries updated!"
     - "✅ API Join Test"

### Option 2: Run via Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db reset
supabase db push
```

## 📋 What This Migration Does

### ✅ **Creates Users Table**
- Extends Clerk authentication with user profiles
- Stores username, display_name, avatar_url
- Links to Clerk's `auth.users` table

### ✅ **Updates Libraries Table**
- Adds `creator_id` foreign key to users table
- Links each library to its creator

### ✅ **Sets Up Security**
- Row Level Security (RLS) policies
- Users can read all profiles
- Users can only update their own profile

### ✅ **Handles Existing Data**
- Creates a "system" user for existing libraries
- Updates all existing libraries with creator_id

## 🎯 Expected Results

After running this migration:

1. **API will return creator information**:
   ```json
   {
     "libraries": [
       {
         "id": "...",
         "name": "My Library",
         "creator": {
           "id": "user-id",
           "username": "john_doe",
           "display_name": "John Doe",
           "avatar_url": "https://..."
         }
       }
     ]
   }
   ```

2. **LibraryView will show creator details**:
   - Creator avatar (if available)
   - Creator name and username
   - Fallback to user ID if no profile

3. **New libraries will automatically**:
   - Create user profile if needed
   - Link to creator information

## 🔧 Troubleshooting

### If you get errors:

1. **"relation 'users' does not exist"**
   - Make sure you ran the migration script
   - Check that the users table was created

2. **"foreign key constraint"**
   - The migration handles existing data automatically
   - If issues persist, check the system user was created

3. **API still shows creator_id only**
   - Hard refresh your browser (Ctrl+Shift+R)
   - Check browser network tab for API responses

## 🎉 Next Steps

After migration:
1. **Test the API**: Visit `/api/libraries` to see creator info
2. **Create a library**: New libraries will have full creator details
3. **Update user profiles**: Users can add display names and avatars

The creator information will now be fully integrated! 🚀
