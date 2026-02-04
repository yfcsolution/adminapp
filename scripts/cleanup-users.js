/**
 * Script to clean up users - removes all users except dafiyahilmulquran@gmail.com
 * 
 * Usage:
 *   node scripts/cleanup-users.js
 * 
 * Or call the API endpoint:
 *   DELETE /api/users/cleanup
 */

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_ENDPOINT = `${BASE_URL}/api/users/cleanup`;

async function cleanupUsers() {
  try {
    console.log('Starting user cleanup...');
    console.log(`Calling: ${API_ENDPOINT}`);
    
    const response = await axios.delete(API_ENDPOINT);
    
    console.log('✅ Cleanup completed successfully!');
    console.log(`Deleted ${response.data.deletedCount} user(s)`);
    console.log(`Kept user: ${response.data.keptEmail}`);
    console.log('\nResponse:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the cleanup
cleanupUsers();
