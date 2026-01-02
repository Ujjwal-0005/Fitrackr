console.log('Starting debug script...');

import dotenv from 'dotenv';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

try {
    // Test basic imports
    console.log('Testing dotenv...');
    dotenv.config();
    console.log('✅ dotenv loaded');

    console.log('Testing express...');
    console.log('✅ express loaded');

    console.log('Testing server import...');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Load env first
    const envPath = path.resolve(__dirname, '.env');
    dotenv.config({ path: envPath });

    console.log('✅ Environment loaded');
    console.log('🔑 JWT Secret exists:', !!process.env.JWT_SECRET);
    console.log('📊 PORT:', process.env.PORT || 8080);

} catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
}
