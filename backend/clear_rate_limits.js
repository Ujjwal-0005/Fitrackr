// Simple script to clear rate limit memory
// Run this with: node clear_rate_limits.js

console.log('🔄 Rate limit clearing script');
console.log('Note: Rate limits are stored in memory and will clear on server restart');
console.log('To fix 429 errors, restart your backend server');

// Instructions for the user
console.log('\n📋 To fix the 429 errors:');
console.log('1. Stop your backend server (Ctrl+C)');
console.log('2. Restart it with: npm start or npm run dev');
console.log('3. The rate limits will be reset to the new development-friendly values');
console.log('\n✅ Changes made:');
console.log('- Increased auth rate limit from 10 to 100 requests per 15min in development');
console.log('- Increased API rate limit from 100 to 1000 requests per 15min in development');
console.log('- Added localhost skip conditions for development');
console.log('- Removed rate limiting from /auth/me endpoint (called frequently)');
console.log('- Excluded auth endpoints from general API rate limiting');
