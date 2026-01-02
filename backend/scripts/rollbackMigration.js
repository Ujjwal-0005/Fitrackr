import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/User.js';
import { clerkClient } from '@clerk/express';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

/**
 * Rollback migration
 */
async function rollbackMigration() {
    console.log('\n⚠️  ROLLBACK MIGRATION\n');
    console.log('='.repeat(60));
    console.log('This will:');
    console.log('  1. Remove clerkUserId from all MongoDB users');
    console.log('  2. Optionally delete users from Clerk');
    console.log('='.repeat(60));

    try {
        // Connect to MongoDB
        console.log('\n📊 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        // Get migrated users
        const migratedUsers = await User.find({ clerkUserId: { $exists: true, $ne: null } });
        console.log(`\n👥 Found ${migratedUsers.length} migrated users`);

        if (migratedUsers.length === 0) {
            console.log('\n✅ No migrated users found. Nothing to rollback.');
            await cleanup();
            return;
        }

        // Confirm rollback
        const confirm = await question('\n⚠️  Are you sure you want to rollback? (yes/no): ');
        if (confirm.toLowerCase() !== 'yes') {
            console.log('\n❌ Rollback cancelled');
            await cleanup();
            return;
        }

        // Ask about Clerk deletion
        const deleteClerk = await question('\n🗑️  Delete users from Clerk too? (yes/no): ');
        const shouldDeleteClerk = deleteClerk.toLowerCase() === 'yes';

        console.log('\n🔄 Rolling back...\n');

        let successCount = 0;
        let failureCount = 0;

        for (const user of migratedUsers) {
            try {
                console.log(`📝 Rolling back: ${user.email}`);

                // Delete from Clerk if requested
                if (shouldDeleteClerk && user.clerkUserId) {
                    try {
                        await clerkClient.users.deleteUser(user.clerkUserId);
                        console.log(`   → Deleted from Clerk`);
                    } catch (error) {
                        console.log(`   ⚠️  Could not delete from Clerk: ${error.message}`);
                    }
                }

                // Remove clerkUserId from MongoDB
                user.clerkUserId = undefined;
                user.migratedAt = undefined;
                await user.save();

                console.log(`   ✅ Rolled back ${user.email}`);
                successCount++;

            } catch (error) {
                console.error(`   ❌ Failed to rollback ${user.email}:`, error.message);
                failureCount++;
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 Rollback Summary');
        console.log('='.repeat(60));
        console.log(`✅ Successful: ${successCount}`);
        console.log(`❌ Failed: ${failureCount}`);
        console.log('\n⚠️  Note: You may need to restore passwords from backup\n');

    } catch (error) {
        console.error('\n❌ Rollback failed:', error);
    } finally {
        await cleanup();
    }
}

async function cleanup() {
    rl.close();
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB\n');
}

// Run rollback
rollbackMigration();
