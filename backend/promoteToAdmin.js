import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';

dotenv.config();

const promoteToAdmin = async (email) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📦 Connected to MongoDB');

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`❌ User with email "${email}" not found`);
            process.exit(1);
        }

        if (user.role === 'admin') {
            console.log(`✅ User "${email}" is already an admin`);
            process.exit(0);
        }

        user.role = 'admin';
        await user.save();

        console.log(`✅ Successfully promoted "${email}" to admin`);
        console.log(`👤 User: ${user.name}`);
        console.log(`📧 Email: ${user.email}`);
        console.log(`🔑 Role: ${user.role}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

// Get email from command line argument
const email = process.argv[2];

if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: node promoteToAdmin.js <email>');
    console.log('Example: node promoteToAdmin.js user@example.com');
    process.exit(1);
}

promoteToAdmin(email);
