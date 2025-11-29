# Supabase Storage Setup for KYB Documents

## 🎯 Purpose
Store KYB compliance documents (PDFs, images) in Supabase Storage instead of filesystem (required for Vercel deployment).

## 📋 Setup Steps

### 1. Go to Supabase Dashboard
```
https://supabase.com/dashboard/project/YOUR_PROJECT_ID/storage/buckets
```

### 2. Create Storage Bucket

Click **"New bucket"** and configure:

**Bucket Name:** `kyb-documents`

**Public Bucket:** ✅ **YES** (Enable)
- Files need to be accessible by admins for review
- Or set to private and use signed URLs

**File Size Limit:** `10 MB`

**Allowed MIME types:**
- application/pdf
- image/jpeg
- image/jpg  
- image/png

### 3. Set Storage Policies

#### Allow Upload (Authenticated Users Only)
```sql
CREATE POLICY "Allow authenticated users to upload KYB documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'kyb-documents' AND auth.uid()::text = (storage.foldername(name))[2]);
```

#### Allow Read (Anyone - for admin review)
```sql
CREATE POLICY "Allow anyone to read KYB documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'kyb-documents');
```

Or for private access with signed URLs:
```sql
CREATE POLICY "Allow authenticated users to read their own KYB documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'kyb-documents' AND auth.uid()::text = (storage.foldername(name))[2]);
```

#### Allow Delete (Admin Only - Optional)
```sql
CREATE POLICY "Allow service role to delete KYB documents"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'kyb-documents');
```

### 4. Verify Environment Variables

Make sure these are in your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Note:** `SUPABASE_SERVICE_ROLE_KEY` is required for server-side uploads.

### 5. Test Upload

Go to your settings page and upload a test document. Check:
- ✅ File uploads without errors
- ✅ File appears in Supabase Storage dashboard
- ✅ File is accessible via public URL

## 📂 Storage Structure

Files are organized as:
```
kyb-documents/
  └── kyb/
      └── {userId}/
          ├── incorporation-{uuid}.pdf
          ├── license-{uuid}.pdf
          ├── shareholder-declaration-{uuid}.pdf
          ├── aml-policy-{uuid}.pdf
          └── data-protection-policy-{uuid}.pdf
```

## 🔒 Security Notes

1. **Public vs Private:**
   - Public: Admins can view via direct URL
   - Private: Use signed URLs with expiration

2. **RLS Policies:**
   - Users can only upload to their own folder
   - Admins can access all documents
   - Service role has full access

3. **File Validation:**
   - Max 10MB per file
   - Only PDF, JPG, PNG allowed
   - Validated on client and server

## 🐛 Troubleshooting

### Error: "Bucket not found"
→ Create the `kyb-documents` bucket in Supabase dashboard

### Error: "No permission to upload"
→ Check RLS policies are set correctly

### Error: "File too large"
→ Increase bucket file size limit to 10MB

### Error: "SUPABASE_SERVICE_ROLE_KEY not found"
→ Add service role key to `.env` file and redeploy

## ✅ Verification Checklist

- [ ] Bucket `kyb-documents` created
- [ ] Public access enabled (or RLS policies set)
- [ ] File size limit set to 10MB
- [ ] MIME types configured
- [ ] Environment variables set
- [ ] Test upload successful
- [ ] Files visible in storage dashboard
- [ ] Admin can view uploaded documents

---

**After setup, redeploy your app to Vercel for changes to take effect!**
