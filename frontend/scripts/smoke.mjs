#!/usr/bin/env node

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function checkCatalog() {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) {
    throw new Error(`Catalog check failed: ${response.status} ${response.statusText}`);
  }
  const products = await response.json();
  console.log(`✅ Catalog returned ${products.length} products`);
}

async function checkLogin() {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@ncs.co.th', password: 'admin123' }),
  });
  if (!response.ok) {
    throw new Error(`Login check failed: ${response.status} ${response.statusText}`);
  }
  const body = await response.json();
  if (!body.accessToken || !body.refreshToken) {
    throw new Error('Login check failed: tokens missing in response');
  }
  console.log('✅ Authentication endpoint responded with access & refresh tokens');
}

(async () => {
  try {
    await checkCatalog();
    await checkLogin();
    console.log('🚀 Smoke checks completed successfully.');
  } catch (error) {
    console.error('❌ Smoke checks failed:', error.message);
    process.exitCode = 1;
  }
})();
