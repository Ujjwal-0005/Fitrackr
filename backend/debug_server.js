console.log('Starting debug script...');

try {
    // Test basic imports
    console.log('Testing dotenv...');
    const dotenv = require('dotenv');
    dotenv.config();
    console.log('✅ dotenv loaded');

    console.log('Testing express...');
    const express = require('express');
    console.log('✅ express loaded');

    console.log('Testing server import...');
    const server = require('./src/server.js');
    console.log('✅ server loaded');

} catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
}
