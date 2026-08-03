import { WebhookAuth } from './WebhookAuth.js';
import { WebhookValidator } from './WebhookValidator.js';
import { WebhookService } from './WebhookService.js';

async function runTests() {
  console.log('=== Running Webhook System Test Suite ===\n');
  let passedCount = 0;
  let totalCount = 0;

  function assert(testName, actual, expected) {
    totalCount++;
    const isMatch = JSON.stringify(actual) === JSON.stringify(expected);
    if (isMatch) {
      passedCount++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      console.error(`   Expected:`, expected);
      console.error(`   Actual:  `, actual);
    }
  }

  // 1. Webhook Method Validation Test
  const m1 = WebhookValidator.validateMethod('POST', 'POST');
  assert('Method Check: Exact match POST', m1.valid, true);

  const m2 = WebhookValidator.validateMethod('GET', 'POST');
  assert('Method Check: Mismatched method GET vs POST', m2.valid, false);

  const m3 = WebhookValidator.validateMethod('DELETE', 'ANY');
  assert('Method Check: ANY allowed method', m3.valid, true);

  // 2. Webhook Authentication Test
  const mockReqNoAuth = { headers: {} };
  const authNone = WebhookAuth.validate(mockReqNoAuth, { authType: 'none' });
  assert('Auth Check: None type allowed', authNone.authorized, true);

  const mockReqBearerValid = { headers: { authorization: 'Bearer secret_token_123' } };
  const authBearerValid = WebhookAuth.validate(mockReqBearerValid, { authType: 'bearer', authSecret: 'secret_token_123' });
  assert('Auth Check: Valid Bearer Token', authBearerValid.authorized, true);

  const mockReqBearerInvalid = { headers: { authorization: 'Bearer wrong_token' } };
  const authBearerInvalid = WebhookAuth.validate(mockReqBearerInvalid, { authType: 'bearer', authSecret: 'secret_token_123' });
  assert('Auth Check: Invalid Bearer Token rejected', authBearerInvalid.authorized, false);

  const mockReqHeaderSecret = { headers: { 'x-webhook-secret': 'secret_pass_999' } };
  const authHeaderSecret = WebhookAuth.validate(mockReqHeaderSecret, { authType: 'secret', authSecret: 'secret_pass_999', headerName: 'x-webhook-secret' });
  assert('Auth Check: Valid Secret Header', authHeaderSecret.authorized, true);

  // 3. Webhook Rate Limiting Test
  const testSlug = 'rate_limit_test_webhook';
  for (let i = 0; i < 100; i++) {
    WebhookValidator.checkRateLimit(testSlug);
  }
  const overLimitCheck = WebhookValidator.checkRateLimit(testSlug);
  assert('Rate Limiter: 101st request in 1 minute rejected (429)', overLimitCheck.allowed, false);

  // 4. Webhook Payload Size Check
  const reqLarge = { headers: { 'content-length': '3000000' } }; // 3MB
  const sizeCheckLarge = WebhookValidator.validatePayloadSize(reqLarge);
  assert('Payload Size Check: 3MB rejected (> 2MB limit)', sizeCheckLarge.valid, false);

  const reqSmall = { headers: { 'content-length': '500' } };
  const sizeCheckSmall = WebhookValidator.validatePayloadSize(reqSmall);
  assert('Payload Size Check: 500B allowed', sizeCheckSmall.valid, true);

  // 5. Full Webhook Processing Test
  const mockWebhookReq = {
    method: 'POST',
    body: { name: 'Divyansh', email: 'divyansh@gmail.com' },
    headers: {},
    query: {},
    ip: '127.0.0.1',
    socket: { remoteAddress: '127.0.0.1' },
  };

  const processResult = await WebhookService.processRequest(mockWebhookReq, 'user-signup');
  assert('Full Webhook Service Processing', processResult.success, true);
  assert('Trigger Data Extracted (name)', processResult.triggerPayload.body.name, 'Divyansh');

  console.log(`\n=== Test Results: ${passedCount}/${totalCount} Passed ===`);
  if (passedCount === totalCount) {
    console.log('🎉 ALL WEBHOOK SYSTEM TESTS PASSED PERFECTLY!');
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
