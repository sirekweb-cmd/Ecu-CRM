const apiKey = "AIzaSyAzcxFGXDOtKtJ61jEeZ6Nc0_5TvMyOpYg";

async function testGeminiPro() {
  const models = [
    'v1beta/models/gemini-1.5-pro',
    'v1/models/gemini-1.5-pro',
    'v1beta/models/gemini-1.5-pro-latest'
  ];

  for (const model of models) {
    const apiURL = `https://generativelanguage.googleapis.com/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello' }] }]
        })
      });

      if (response.ok) {
        console.log(`✅ Success for ${model}`);
        return;
      } else {
        console.log(`❌ Fail for ${model}: ${response.status} - ${await response.text()}`);
      }
    } catch (e) {
      console.log(`💥 Error for ${model}:`, e.message);
    }
  }
}

testGeminiPro();
