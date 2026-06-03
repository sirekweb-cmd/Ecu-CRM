const apiKey = "AIzaSyAzcxFGXDOtKtJ61jEeZ6Nc0_5TvMyOpYg";

async function testGemini() {
  const models = [
    'v1/models/gemini-1.5-flash',
    'v1beta/models/gemini-1.5-flash',
    'v1beta/models/gemini-1.5-flash-latest',
    'v1beta/models/gemini-2.0-flash',
    'v1beta/models/gemini-2.5-flash'
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
        const json = await response.json();
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

testGemini();
