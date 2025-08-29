# 🚀 BookNook Database Setup Instructions

## 📋 **Prerequisites**
- ✅ Supabase project created
- ✅ Environment variables set in `.env.local`
- ✅ Development server ready to restart

## 🔄 **Step 1: Clear Existing Database**
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Run this command to clear everything:
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   GRANT ALL ON SCHEMA public TO postgres;
   GRANT ALL ON SCHEMA public TO public;
   ```

## 🗄️ **Step 2: Run Master Schema**
1. In the **SQL Editor**, copy the entire contents of `supabase/master-schema.sql`
2. Paste and run the script
3. You should see success messages and verification results

## ✅ **Step 3: Verify Setup**
The script will automatically verify:
- ✅ 7 Austin libraries created
- ✅ 5 sample books added
- ✅ 5 sample ratings added
- ✅ All CRUD functions working
- ✅ RLS policies configured

## 🔧 **Step 4: Restart Development Server**
1. Stop your current dev server (`Ctrl+C`)
2. Start fresh: `npm run dev`
3. This ensures environment variables are loaded correctly

## 🧪 **Step 5: Test Connection**
1. Visit: `http://localhost:3000/api/test-supabase`
2. Should return: `{"success":true,"connection":"OK","librariesCount":7}`
3. If successful, your map should now work!

## 🗺️ **Step 6: Test Map**
1. Go to your map page
2. You should see 7 Austin libraries displayed
3. No more 500 errors!

## 🚨 **If You Still Get Errors**

### **Check Server Logs**
Look for detailed error messages in your terminal where `npm run dev` is running.

### **Common Issues & Solutions**

#### **"relation libraries does not exist"**
- The schema script didn't run completely
- Re-run the master schema script

#### **"permission denied"**
- RLS policies might be too restrictive
- Check if the script completed all policy creation

#### **"connection failed"**
- Environment variables not loaded
- Restart the development server

#### **"function does not exist"**
- The CRUD functions weren't created
- Re-run the master schema script

## 📚 **What the Master Schema Creates**

### **Tables**
- `libraries` - Core library locations with PostGIS coordinates
- `books` - Book inventory (for future features)
- `ratings` - User ratings and reviews (for future features)
- `search_index` - Search functionality (for future features)

### **Functions**
- `get_all_libraries()` - Fetch all active libraries
- `get_libraries_nearby()` - Geospatial search within radius
- `add_library()` - Create new libraries
- `update_library()` - Modify existing libraries
- `delete_library()` - Soft delete libraries

### **Features**
- ✅ PostGIS geospatial support
- ✅ Row Level Security (RLS) policies
- ✅ Performance indexes
- ✅ Sample Austin data
- ✅ Future-ready structure

## 🎯 **Expected Results**

After running the master schema, you should see:
```
🎉 BookNook Master Schema Complete! | 7 | libraries
📚 Books loaded successfully | 5 | books  
⭐ Ratings added | 5 | ratings
✅ get_all_libraries() working | 7 | result_count
✅ get_libraries_nearby() working | 7 | result_count
🚀 BookNook is ready! Your map should now display 7 Austin libraries with full functionality!
```

## 🚀 **Next Steps After Success**

Once your map is working:
1. **Add new libraries** using the map interface
2. **Implement book management** system
3. **Add AI image parsing** for book covers
4. **Build search and filtering** features
5. **Add real-time updates** and notifications

**The foundation is now solid and ready for advanced features!**
