#!/usr/bin/env node

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

async function checkCatalog() {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) {
    throw new Error(`Catalog check failed: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  const products = Array.isArray(data) ? data : data.items ?? [];
  if (products.length === 0) {
    throw new Error('Catalog check failed: no products returned');
  }
  console.log(`✅ Catalog returned ${products.length} products`);
  return products;
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
  return body.accessToken;
}

async function checkCartFlow(accessToken, productId) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };

  const addResponse = await fetch(`${API_URL}/cart/items`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ productId, quantity: 1 }),
  });

  if (!addResponse.ok) {
    throw new Error(`Cart add failed: ${addResponse.status} ${addResponse.statusText}`);
  }

  const cartAfterAdd = await addResponse.json();
  const addedItem = cartAfterAdd.items?.find((item) => item.productId === productId);
  if (!addedItem) {
    throw new Error('Cart add failed: item missing in response payload');
  }

  const removeResponse = await fetch(`${API_URL}/cart/items/${addedItem.id}`, {
    method: 'DELETE',
    headers,
  });

  if (removeResponse.status !== 204) {
    throw new Error(`Cart remove failed: ${removeResponse.status} ${removeResponse.statusText}`);
  }

  const cartResponse = await fetch(`${API_URL}/cart`, { headers });
  if (!cartResponse.ok) {
    throw new Error(`Cart fetch failed: ${cartResponse.status} ${cartResponse.statusText}`);
  }

  const cartAfterRemove = await cartResponse.json();
  const stillPresent = cartAfterRemove.items?.some((item) => item.productId === productId);
  if (stillPresent) {
    throw new Error('Cart remove failed: item still present after deletion');
  }

  console.log('✅ Cart add/remove flow succeeded');
}

(async () => {
  try {
    const products = await checkCatalog();
    const accessToken = await checkLogin();
    const targetProduct = products.find((product) => product?.id) ?? products[0];
    if (!targetProduct?.id) {
      throw new Error('Cart check failed: unable to determine product id');
    }
    await checkCartFlow(accessToken, targetProduct.id);
    console.log('🚀 Smoke checks completed successfully.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Smoke checks failed:', message);
    process.exitCode = 1;
  }
})();
