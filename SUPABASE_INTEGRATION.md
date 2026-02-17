# CampusVault Supabase Integration Guide

## Database Setup Instructions

### Step 1: Execute the SQL Schema

Go to your Supabase dashboard and navigate to **SQL Editor**. Copy the entire contents from `SUPABASE_SETUP.sql` and execute it.

This will create:
- ✅ `resources` table with complete schema
- ✅ `reviews` table for resource ratings
- ✅ Proper indexes for performance
- ✅ Row Level Security (RLS) policies

### Step 2: Configure Storage

1. Go to your Supabase project → **Storage**
2. Create a new bucket called `documents`
3. Click on the bucket and set the following policies:
   - **Insert policy**: Allow authenticated users to upload
   - **Select policy**: Allow public read access
   - **Delete policy**: Allow authenticated users to delete own files

### Step 3: Verify Environment Variables

Make sure your `.env` file has:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Application Integration

The application now uses Supabase for:

### Resources Management
- **Index.tsx**: Fetches public resources from Supabase (sorted by downloads)
- **Upload.tsx**: Uploads files to Supabase Storage and saves metadata to `resources` table
- **ResourceDetail.tsx**: Fetches individual resource details and manages sharing

### Features Implemented

#### 1. **Upload Resources**
- Navigate to `/upload`
- Select file (PDF, Word, Images)
- Fill in title, subject, semester, department, type
- Toggle public/private visibility
- File is stored in Supabase Storage, metadata in database

#### 2. **View Resources**
- Dashboard shows trending and latest resources
- Click any resource card to view details
- See file information, upload date, and uploader info

#### 3. **Review System**
- Authenticated users can rate and review resources
- Reviews are stored in the `reviews` table
- Average rating is calculated from individual ratings

#### 4. **Sharing**
- Private resources can be shared with specific emails
- Owner can grant/revoke access
- Shared users can access the resource

## Database Schema

### Resources Table
```
- id (Primary Key)
- title, subject, semester, department, type
- file_url, file_type, file_size
- uploader_id, uploader_name, uploader_college
- privacy (public/private)
- restricted_to_university
- shared_with (email array)
- downloads, average_rating, total_ratings
- created_at, updated_at
```

### Reviews Table
```
- id (Primary Key)
- resource_id (Foreign Key)
- user_id, user_name
- rating (1-5)
- comment
- created_at
```

## Data Transformation

The application transforms Supabase snake_case fields to camelCase:
- `file_url` → `fileUrl`
- `file_type` → `fileType`
- `uploader_id` → `uploaderId`
- `average_rating` → `averageRating`
- `total_ratings` → `totalRatings`
- `shared_with` → `sharedWith`

## Testing the Integration

1. **Upload a Resource**
   - Log in and go to `/upload`
   - Upload a test PDF
   - Click submit

2. **View on Dashboard**
   - Go to `/` (Dashboard)
   - You should see your uploaded resource

3. **View Details**
   - Click on the resource card
   - Check metadata, file size, and download button

4. **Add Review**
   - On resource detail page, rate and comment
   - Review appears immediately

## Troubleshooting

### Resources not appearing on dashboard
- Check Supabase Storage bucket is created and public
- Verify RLS policies are enabled
- Check browser console for errors

### Upload fails
- Ensure `documents` bucket exists in Storage
- Verify user has upload permissions
- Check file size (max 50MB)

### Reviews not saving
- Verify `reviews` table exists
- Check user is authenticated
- Ensure unique constraint on (resource_id, user_id)

## Next Steps

1. Connect authentication system (currently using mock data)
2. Add search functionality with filters
3. Implement download tracking
4. Add email notifications for shares
5. Create admin dashboard for resource moderation

## Files Modified

- `src/pages/Index.tsx` - Dashboard with Supabase integration
- `src/pages/Upload.tsx` - Upload form with file storage
- `src/pages/ResourceDetail.tsx` - Resource details and reviews
- `SUPABASE_SETUP.sql` - Database schema and policies
