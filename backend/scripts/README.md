# User Migration Scripts

This directory contains scripts for migrating existing MongoDB users to Clerk authentication.

## 📋 Prerequisites

1. **Backup your database** before running migration:
   ```bash
   mongodump --db gymtrackr --out ./backup-pre-clerk-migration
   ```

2. **Ensure environment variables are set**:
   - `MONGO_URI` - MongoDB connection string
   - `CLERK_SECRET_KEY` - Clerk secret key
   - `CLERK_PUBLISHABLE_KEY` - Clerk publishable key

## 🚀 Migration Process

### Step 1: Run Migration Script

```bash
cd backend
node scripts/migrateUsersToClerk.js
```

**What it does:**
- Finds all MongoDB users without `clerkUserId`
- Creates corresponding users in Clerk
- Updates MongoDB users with `clerkUserId`
- Removes password fields
- Marks users for password reset

### Step 2: Verify Migration

```bash
node scripts/verifyMigration.js
```

**What it checks:**
- All users have `clerkUserId`
- Clerk users exist for all MongoDB users
- Password fields removed
- Provides migration summary

### Step 3: Send Password Reset Emails

**Option A: Via Clerk Dashboard**
1. Go to https://dashboard.clerk.com
2. Select your application
3. Go to Users
4. Select all migrated users
5. Click "Send password reset email"

**Option B: Users reset themselves**
- Users click "Forgot Password" on sign-in page
- Clerk sends reset email automatically

## 🔄 Rollback (Emergency Only)

If something goes wrong:

```bash
node scripts/rollbackMigration.js
```

**What it does:**
- Removes `clerkUserId` from MongoDB users
- Optionally deletes users from Clerk
- **Note:** You'll need to restore passwords from backup

## 📊 Migration Flow

```
1. User in MongoDB (old JWT auth)
   ↓
2. Script creates user in Clerk
   ↓
3. Script updates MongoDB with clerkUserId
   ↓
4. Script removes password field
   ↓
5. User receives password reset email
   ↓
6. User sets new password in Clerk
   ↓
7. User can now sign in via Clerk
```

## ⚠️ Important Notes

### Password Migration

**Clerk cannot import bcrypt-hashed passwords.** Users must reset their passwords after migration.

**Why?**
- Security: Clerk uses its own secure password hashing
- Best practice: Force password reset on auth system migration

### User Communication

After migration, inform users:
- "We've upgraded our authentication system"
- "Please reset your password using the email we sent"
- "Or click 'Forgot Password' on the sign-in page"

### Data Preservation

**Preserved:**
- ✅ All user data (goals, sessions, PRs, etc.)
- ✅ User roles (admin, user)
- ✅ Profile information
- ✅ Avatar images

**Removed:**
- ❌ Password field (replaced by Clerk)

## 🧪 Testing

### Test with Single User First

1. Create a test user in MongoDB
2. Run migration
3. Verify in Clerk Dashboard
4. Test sign-in with password reset
5. Verify data intact

### Batch Migration

For production with many users:
1. Migrate admin users first
2. Test thoroughly
3. Migrate remaining users in batches
4. Monitor for errors

## 🛡️ Safety Features

- **Confirmation prompts** before migration
- **Detailed logging** of all operations
- **Error handling** with continue-on-failure
- **Rollback script** for emergencies
- **Verification script** for validation

## 📝 Files

- `migrateUsersToClerk.js` - Main migration script
- `verifyMigration.js` - Post-migration verification
- `rollbackMigration.js` - Emergency rollback
- `utils/clerkHelper.js` - Clerk API utilities
- `README.md` - This file

## 🆘 Troubleshooting

### "Clerk API connection failed"
- Check `CLERK_SECRET_KEY` in `.env`
- Verify key is correct in Clerk Dashboard

### "User already exists in Clerk"
- Script will link existing Clerk user
- Safe to continue

### "MongoDB connection failed"
- Check `MONGO_URI` in `.env`
- Ensure MongoDB is running

### Migration partially failed
- Check error messages
- Run verification script
- Re-run migration (safe, skips existing)

## 📞 Support

If you encounter issues:
1. Check error messages in console
2. Run verification script
3. Check Clerk Dashboard for user status
4. Review MongoDB for data integrity
