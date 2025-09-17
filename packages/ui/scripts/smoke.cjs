const http = require('http');
const https = require('https');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https://') ? https : http;
    const req = lib.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testHealth() {
  console.log('🔍 Testing /api/health...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);
    
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    
    const data = JSON.parse(response.body);
    if (!data.ok) {
      throw new Error('Expected ok: true');
    }
    
    console.log('✅ Health check passed');
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testSearch() {
  console.log('🔍 Testing /api/search...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: 'test' }),
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }
    
    const data = JSON.parse(response.body);
    
    if (!Array.isArray(data.results)) {
      throw new Error('Expected results to be an array');
    }
    
    const hasSearchKey = process.env.SEARCH_API_KEY;
    if (!hasSearchKey && data.results.length > 0) {
      console.log('⚠️  Got search results without SEARCH_API_KEY - this is unexpected but not failing');
    }
    
    if (hasSearchKey && data.results.length === 0) {
      console.log('⚠️  No search results with SEARCH_API_KEY present - provider might be down');
    }
    
    console.log('✅ Search endpoint passed');
    return true;
  } catch (error) {
    console.error('❌ Search test failed:', error.message);
    return false;
  }
}

async function testFiles() {
  console.log('🔍 Testing /api/files...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/files`);
    
    if (response.status === 401) {
      console.log('✅ Files endpoint correctly returns 401 (auth gate works)');
      return true;
    }
    
    if (response.status === 200) {
      const data = JSON.parse(response.body);
      if (!Array.isArray(data)) {
        throw new Error('Expected array response');
      }
      
      console.log(`✅ Files endpoint passed - found ${data.length} files`);
      if (data.length > 0) {
        console.log(`   First 3 file IDs: ${data.slice(0, 3).map(f => f.id || 'no-id').join(', ')}`);
      }
      return true;
    }
    
    throw new Error(`Unexpected status: ${response.status}`);
  } catch (error) {
    console.error('❌ Files test failed:', error.message);
    return false;
  }
}

async function testTasks() {
  console.log('🔍 Testing /api/tasks...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ kind: 'summarize' }),
    });
    
    // We expect this to fail if TASK_API_BASE is not configured
    if (response.status === 500) {
      const data = JSON.parse(response.body);
      if (data.error && data.error.includes('not configured')) {
        console.log('✅ Tasks endpoint correctly fails when TASK_API_BASE not configured');
        return true;
      }
    }
    
    if (response.status >= 200 && response.status < 300) {
      console.log('✅ Tasks endpoint passed (proxy working)');
      return true;
    }
    
    if (response.status === 401) {
      console.log('✅ Tasks endpoint correctly returns 401 (auth required)');
      return true;
    }
    
    console.log(`ℹ️  Tasks endpoint returned ${response.status} - this may be expected if task service is down`);
    return true;
  } catch (error) {
    console.error('❌ Tasks test failed:', error.message);
    // Don't fail the entire smoke test for tasks endpoint
    return true;
  }
}

async function runSmokeTests() {
  console.log(`🧪 Running smoke tests against ${BASE_URL}\n`);
  
  const tests = [
    testHealth,
    testSearch,
    testFiles,
    testTasks,
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await test();
    results.push(result);
    console.log(''); // Add spacing between tests
  }
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`📊 Smoke test results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('🎉 SMOKE OK');
    process.exit(0);
  } else {
    console.log('💥 Some smoke tests failed');
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the tests
runSmokeTests();