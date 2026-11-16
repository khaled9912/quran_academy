# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: stripe-runtime-check.spec.js >> stripe runtime exposes embedded checkout
- Location: stripe-runtime-check.spec.js:3:1

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test('stripe runtime exposes embedded checkout', async ({ page }) => {
  4  |   page.on('console', msg => console.log('BROWSER:', msg.type(), msg.text()));
  5  |   page.on('pageerror', err => console.log('PAGEERROR:', err.message));
  6  | 
  7  |   await page.goto('about:blank');
  8  |   await page.addScriptTag({ url: 'https://js.stripe.com/endive/stripe.js' });
  9  | 
  10 |   const result = await page.evaluate(async () => {
  11 |     const StripeCtor = window.Stripe;
  12 |     if (typeof StripeCtor !== 'function') {
  13 |       return { ok: false, reason: 'window.Stripe missing' };
  14 |     }
  15 |     try {
  16 |       const stripe = StripeCtor('pk_test_1234567890');
  17 |       return {
  18 |         ok: true,
  19 |         methods: {
  20 |           initEmbeddedCheckout: typeof stripe.initEmbeddedCheckout,
  21 |           createEmbeddedCheckoutPage: typeof stripe.createEmbeddedCheckoutPage,
  22 |           checkout: !!stripe,
  23 |         },
  24 |       };
  25 |     } catch (e) {
  26 |       return { ok: false, reason: String(e && e.message || e) };
  27 |     }
  28 |   });
  29 | 
  30 |   console.log(JSON.stringify(result, null, 2));
> 31 |   expect(result.ok).toBeTruthy();
     |                     ^ Error: expect(received).toBeTruthy()
  32 | });
  33 | 
```