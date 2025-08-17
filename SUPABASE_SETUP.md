# 🚀 Supabase Setup Guide

## 1. Create Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New project"
5. Fill in:
   - **Project name**: trading-diary (or anything you want)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
   - **Plan**: Free tier is perfect
6. Click "Create new project" (takes ~2 minutes)

## 2. Get Your API Keys

1. Once project is created, go to **Settings** (gear icon in sidebar)
2. Click **API** in the settings menu
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

## 3. Update Your .env.local File

Open `.env.local` and replace with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-long-anon-key...
```

## 4. Set Up Database Tables

1. In Supabase dashboard, click **SQL Editor** (in sidebar)
2. Click **New query**
3. Copy ALL content from `supabase-setup.sql` file
4. Paste it in the SQL editor
5. Click **Run** button

## 5. Create Storage Bucket

Still in SQL Editor:
1. Create new query
2. Run this command:

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('trade-images', 'trade-images', true);
```

3. Go to **Storage** in sidebar
4. You should see "trade-images" bucket
5. Click on it, then click **Policies**
6. Click **New Policy** → **For full customization**
7. Name: "Allow public uploads"
8. Policy: SELECT, INSERT, UPDATE, DELETE - all checked
9. Target roles: Check "anon"
10. WITH CHECK and USING: both set to `true`
11. Save

## 6. Restart Your App

```bash
npm run dev
```

## ✅ You're Done!

Your app now:
- Saves trades to Supabase database
- Uploads images to Supabase Storage
- Data persists across devices
- Can be accessed from anywhere

## 🔒 Security Note

Current setup allows public read/write. For production:
1. Add authentication (Supabase Auth)
2. Update RLS policies to check user ownership
3. Each user sees only their trades