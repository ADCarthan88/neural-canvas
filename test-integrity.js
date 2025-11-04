#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🧪 Neural Canvas Project Integrity Test');
console.log('=====================================\n');

// Test Results Storage
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${name}: ${message}`);
  results.tests.push({ name, passed, message });
  if (passed) results.passed++;
  else results.failed++;
}

// 1. File Structure Tests
console.log('📁 Testing File Structure...');

const requiredFiles = [
  'package.json',
  'frontend/package.json',
  'backend/package.json',
  'backend/server-simple.js',
  'frontend/src/app/page.js',
  'frontend/src/app/admin/page.js',
  'frontend/src/components/EnterpriseAdmin.jsx'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  logTest(`File exists: ${file}`, exists, exists ? 'Found' : 'Missing');
});

// 2. Package.json Validation
console.log('\n📦 Testing Package Configuration...');

try {
  const rootPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  logTest('Root package.json valid', true, 'Valid JSON structure');
  
  const frontendPkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  logTest('Frontend package.json valid', true, 'Valid JSON structure');
  
  const backendPkg = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  logTest('Backend package.json valid', true, 'Valid JSON structure');
  
  // Check required dependencies
  const hasReact = frontendPkg.dependencies?.react;
  logTest('React dependency', !!hasReact, hasReact || 'Missing');
  
  const hasExpress = backendPkg.dependencies?.express;
  logTest('Express dependency', !!hasExpress, hasExpress || 'Missing');
  
} catch (error) {
  logTest('Package.json parsing', false, error.message);
}

// 3. Backend Server Test
console.log('\n🚀 Testing Backend Server...');

function testBackendEndpoint(path, expectedStatus = 200) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const success = res.statusCode === expectedStatus;
        resolve({
          success,
          status: res.statusCode,
          data: data.substring(0, 100) + (data.length > 100 ? '...' : '')
        });
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Request timeout' });
    });

    req.end();
  });
}

// 4. Security Tests
console.log('\n🔒 Testing Security Configuration...');

try {
  const serverContent = fs.readFileSync('backend/server-simple.js', 'utf8');
  
  const hasCors = serverContent.includes('cors');
  logTest('CORS middleware', hasCors, hasCors ? 'Configured' : 'Missing');
  
  const hasJsonParser = serverContent.includes('express.json');
  logTest('JSON body parser', hasJsonParser, hasJsonParser ? 'Configured' : 'Missing');
  
  const hasHealthCheck = serverContent.includes('/health');
  logTest('Health check endpoint', hasHealthCheck, hasHealthCheck ? 'Available' : 'Missing');
  
} catch (error) {
  logTest('Server file analysis', false, error.message);
}

// 5. Frontend Component Tests
console.log('\n⚛️ Testing Frontend Components...');

try {
  const adminPageContent = fs.readFileSync('frontend/src/app/admin/page.js', 'utf8');
  
  const hasUseClient = adminPageContent.includes("'use client'");
  logTest('Client component directive', hasUseClient, hasUseClient ? 'Present' : 'Missing');
  
  const hasAuthentication = adminPageContent.includes('isAuthenticated');
  logTest('Authentication logic', hasAuthentication, hasAuthentication ? 'Implemented' : 'Missing');
  
  const enterpriseAdminContent = fs.readFileSync('frontend/src/components/EnterpriseAdmin.jsx', 'utf8');
  
  const hasNoFramerMotion = !enterpriseAdminContent.includes('framer-motion');
  logTest('No problematic dependencies', hasNoFramerMotion, hasNoFramerMotion ? 'Clean' : 'Has framer-motion');
  
} catch (error) {
  logTest('Frontend component analysis', false, error.message);
}

// 6. Configuration Tests
console.log('\n⚙️ Testing Configuration Files...');

try {
  const nextConfig = fs.readFileSync('frontend/next.config.js', 'utf8');
  const hasThreeTranspile = nextConfig.includes('three');
  logTest('Next.js Three.js config', hasThreeTranspile, hasThreeTranspile ? 'Configured' : 'Missing');
  
} catch (error) {
  logTest('Next.js config', false, 'Config file missing or invalid');
}

// 7. Environment Setup Test
console.log('\n🌍 Testing Environment Setup...');

const envExists = fs.existsSync('backend/.env');
logTest('Environment file', envExists, envExists ? 'Present' : 'Missing (using defaults)');

// Run async backend tests
async function runBackendTests() {
  console.log('\n🌐 Testing Backend Endpoints...');
  
  const rootTest = await testBackendEndpoint('/');
  logTest('Root endpoint', rootTest.success, rootTest.success ? `Status ${rootTest.status}` : rootTest.error);
  
  const healthTest = await testBackendEndpoint('/health');
  logTest('Health endpoint', healthTest.success, healthTest.success ? `Status ${healthTest.status}` : healthTest.error);
  
  const apiTest = await testBackendEndpoint('/api');
  logTest('API documentation', apiTest.success, apiTest.success ? `Status ${apiTest.status}` : apiTest.error);
  
  // Print final results
  console.log('\n📊 Test Summary');
  console.log('===============');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log('\n🔧 Failed Tests:');
    results.tests.filter(t => !t.passed).forEach(test => {
      console.log(`   • ${test.name}: ${test.message}`);
    });
  }
  
  console.log('\n🎯 Recommendations:');
  if (results.failed === 0) {
    console.log('   • Project integrity is excellent!');
    console.log('   • Ready for development and deployment');
  } else {
    console.log('   • Fix failed tests before deployment');
    console.log('   • Run: npm run dev to start development servers');
    console.log('   • Check backend server is running on port 3001');
  }
}

// Execute async tests
runBackendTests().catch(console.error);