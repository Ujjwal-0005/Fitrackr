import { clerkClient } from '@clerk/express';
import crypto from 'crypto';

/**
 * Create a user in Clerk
 * @param {Object} userData - User data from MongoDB
 * @returns {Promise<Object>} Created Clerk user
 */
export async function createClerkUser(userData) {
    try {
        const clerkUser = await clerkClient.users.createUser({
            emailAddress: [userData.email],
            firstName: userData.name?.split(' ')[0] || 'User',
            lastName: userData.name?.split(' ').slice(1).join(' ') || '',
            password: generateSecurePassword(),
            skipPasswordRequirement: false,
            skipPasswordChecks: false,
            publicMetadata: {
                role: userData.role || 'user',
                migratedFrom: 'jwt-auth',
                migratedAt: new Date().toISOString()
            }
        });

        return clerkUser;
    } catch (error) {
        if (error.errors?.[0]?.code === 'form_identifier_exists') {
            console.log(`⚠️  User ${userData.email} already exists in Clerk`);
            // Get existing user
            const users = await clerkClient.users.getUserList({
                emailAddress: [userData.email]
            });
            return users[0];
        }
        throw error;
    }
}

/**
 * Generate a secure random password
 * @returns {string} Secure password
 */
function generateSecurePassword() {
    return crypto.randomBytes(32).toString('base64');
}

/**
 * Send password reset email to user
 * @param {string} userId - Clerk user ID
 * @returns {Promise<void>}
 */
export async function sendPasswordResetEmail(userId) {
    try {
        // Clerk will send password reset email
        await clerkClient.users.updateUser(userId, {
            publicMetadata: {
                passwordResetRequired: true
            }
        });
        console.log(`✉️  Password reset marked for user ${userId}`);
    } catch (error) {
        console.error(`Failed to mark password reset for ${userId}:`, error.message);
    }
}

/**
 * Verify Clerk API connectivity
 * @returns {Promise<boolean>}
 */
export async function verifyClerkConnection() {
    try {
        await clerkClient.users.getUserList({ limit: 1 });
        console.log('✅ Clerk API connection verified');
        return true;
    } catch (error) {
        console.error('❌ Clerk API connection failed:', error.message);
        return false;
    }
}

/**
 * Get user from Clerk by email
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
export async function getClerkUserByEmail(email) {
    try {
        const users = await clerkClient.users.getUserList({
            emailAddress: [email]
        });
        return users[0] || null;
    } catch (error) {
        console.error(`Failed to get Clerk user for ${email}:`, error.message);
        return null;
    }
}
