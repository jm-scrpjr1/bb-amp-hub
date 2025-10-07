// Simple test script to verify API endpoints are working
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Mock auth token for testing
const AUTH_TOKEN = 'test-token';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AUTH_TOKEN}`
  }
});

async function testEndpoints() {
  console.log('🧪 Testing API Endpoints...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Health check:', healthResponse.data);
    console.log('');

    // Test chat endpoint (no auth required)
    console.log('2. Testing chat endpoint...');
    const chatResponse = await axios.post(`${API_BASE_URL}/chat`, {
      message: 'Hello ARIA, can you help me with group management?'
    });
    console.log('✅ Chat response:', chatResponse.data.response);
    console.log('   Intent detected:', chatResponse.data.intent);
    console.log('   Suggestions:', chatResponse.data.suggestions?.length || 0);
    console.log('');

    // Test groups endpoint
    console.log('3. Testing groups endpoint...');
    const groupsResponse = await api.get('/groups');
    console.log('✅ Groups:', groupsResponse.data);
    console.log('');

    // Test group health analysis
    if (groupsResponse.data.groups && groupsResponse.data.groups.length > 0) {
      const firstGroupId = groupsResponse.data.groups[0].id;
      console.log('4. Testing group health analysis...');
      const healthAnalysisResponse = await api.get(`/groups/${firstGroupId}/ai/health`);
      console.log('✅ Group health analysis:', {
        healthScore: healthAnalysisResponse.data.analysis.healthScore,
        insights: healthAnalysisResponse.data.analysis.insights.length,
        recommendations: healthAnalysisResponse.data.analysis.recommendations.length
      });
      console.log('');
    }

    // Test group recommendations
    console.log('5. Testing group recommendations...');
    const recommendationsResponse = await api.get('/groups/ai/recommendations');
    console.log('✅ Group recommendations:', recommendationsResponse.data.recommendations?.length || 0);
    console.log('');

    // Test user profile
    console.log('6. Testing user profile...');
    const profileResponse = await api.get('/user/profile');
    console.log('✅ User profile:', {
      name: profileResponse.data.name,
      role: profileResponse.data.role,
      godMode: profileResponse.data.role === 'OWNER'
    });
    console.log('');

    console.log('🎉 All API endpoints are working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running:');
      console.log('   cd src/backend && npm start');
    }
  }
}

// Run tests
testEndpoints();
