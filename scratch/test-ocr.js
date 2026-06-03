const assert = require('assert');

const sleep = ms => new Promise(res => setTimeout(res, ms));

async function runTests() {
  console.log("Starting backend verification tests...");

  // Test 1: GET settings/gemini-key
  const resGet = await fetch('http://localhost:3000/api/settings/gemini-key');
  assert.strictEqual(resGet.status, 200, "GET gemini-key status should be 200");
  const dataGet = await resGet.json();
  console.log("GET settings/gemini-key response:", dataGet);
  assert.ok('isConfigured' in dataGet, "Response should have 'isConfigured'");

  // Test 2: POST settings/gemini-key
  const resPost = await fetch('http://localhost:3000/api/settings/gemini-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: 'TEST_KEY_1234' })
  });
  assert.strictEqual(resPost.status, 200, "POST gemini-key status should be 200");
  const dataPost = await resPost.json();
  console.log("POST settings/gemini-key response:", dataPost);
  assert.ok(dataPost.success, "Should return success: true");

  console.log("Waiting 3 seconds for Vite server to restart after .env change...");
  await sleep(3000);

  // Re-verify configuration status
  const resGet2 = await fetch('http://localhost:3000/api/settings/gemini-key');
  const dataGet2 = await resGet2.json();
  console.log("GET settings/gemini-key response (after save):", dataGet2);
  assert.strictEqual(dataGet2.isConfigured, true, "isConfigured should be true now");

  // Reset API key back to empty for testing fallback
  await fetch('http://localhost:3000/api/settings/gemini-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: '' })
  });

  console.log("Waiting 3 seconds for Vite server to restart after key reset...");
  await sleep(3000);

  // Test 3: POST analyze-receipt (with smart fallback parser)
  const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const resAnalyze = await fetch('http://localhost:3000/api/analyze-receipt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: base64Image,
      filename: "pichincha-mariano-delgado-375.png"
    })
  });
  assert.strictEqual(resAnalyze.status, 200, "analyze-receipt status should be 200");
  const dataAnalyze = await resAnalyze.json();
  console.log("analyze-receipt response for 'pichincha-mariano-delgado-375.png':", dataAnalyze);
  assert.ok(dataAnalyze.success, "Extraction should be successful");
  assert.strictEqual(dataAnalyze.data.bankName, "Banco Pichincha", "Bank should be Banco Pichincha");
  assert.strictEqual(dataAnalyze.data.clientName, "Mariano Delgado", "Client name should be Mariano Delgado");
  assert.strictEqual(dataAnalyze.data.totalAmount, 375, "Amount should be 375");
  assert.ok(dataAnalyze.data.ruc.startsWith('17'), "RUC should start with 17");
  assert.strictEqual(dataAnalyze.data.ruc.length, 10, "RUC (cédula) length should be 10");

  console.log("\nAll backend tests passed successfully! 🎉");
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
