import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/User.js';

dotenv.config();

const addEmailVerificationField = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Update all existing users to have isEmailVerified: true
        const result = await User.updateMany(
            { isEmailVerified: { $exists: false } },
            { $set: { isEmailVerified: true } }
        );

        console.log(`✅ Migration complete: ${result.modifiedCount} users updated`);
        console.log('   All existing users now have isEmailVerified: true');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

addEmailVerificationField();
