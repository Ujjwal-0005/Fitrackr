import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/User.js';
import { getClerkUserByEmail } from './utils/clerkHelper.js';

dotenv.config();

/**
 * Verify migration success
 */
async function verifyMigration() {
    console.log('\n🔍 Verifying Migration\n');
    console.log('='.repeat(60));

    try {
        // Connect to MongoDB
        console.log('\n📊 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        // Get all users
        const allUsers = await User.find({});
        console.log(`\n👥 Total users in MongoDB: ${allUsers.length}`);

        // Check for users without clerkUserId
        const unmigrated = allUsers.filter(u => !u.clerkUserId);
        const migrated = allUsers.filter(u => u.clerkUserId);

        console.log('\n📊 Migration Status:');
        console.log(`   ✅ Migrated: ${migrated.length}`);
        console.log(`   ❌ Not migrated: ${unmigrated.length}`);

        if (unmigrated.length > 0) {
            console.log('\n⚠️  Users without Clerk ID:');
            unmigrated.forEach(u => {
                console.log(`   - ${u.email}`);
            });
        }

        // Verify Clerk users exist
        console.log('\n🔐 Verifying Clerk users...');
        let clerkVerified = 0;
        let clerkMissing = 0;

        for (const user of migrated) {
            const clerkUser = await getClerkUserByEmail(user.email);
            if (clerkUser) {
                clerkVerified++;
            } else {
                clerkMissing++;
                console.log(`   ⚠️  Clerk user not found for: ${user.email}`);
            }
        }

        console.log(`\n   ✅ Verified in Clerk: ${clerkVerified}`);
        console.log(`   ❌ Missing in Clerk: ${clerkMissing}`);

        // Check for password fields
        const usersWithPasswords = allUsers.filter(u => u.password);
        if (usersWithPasswords.length > 0) {
            console.log(`\n⚠️  ${usersWithPasswords.length} users still have password field:`);
            usersWithPasswords.forEach(u => {
                console.log(`   - ${u.email}`);
            });
        } else {
            console.log('\n✅ All password fields removed');
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 Verification Summary');
        console.log('='.repeat(60));

        if (unmigrated.length === 0 && clerkMissing === 0 && usersWithPasswords.length === 0) {
            console.log('✅ Migration successful! All users migrated correctly.');
        } else {
            console.log('⚠️  Migration incomplete. Please review issues above.');
        }
        console.log('\n');

    } catch (error) {
        console.error('\n❌ Verification failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB\n');
    }
}

// Run verification
verifyMigration();
