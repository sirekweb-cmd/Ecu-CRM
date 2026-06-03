async function testOcrSpace() {
  console.log("Testing OCR.space with 'helloworld' API key...");

  // Minimal 1x1 white PNG base64
  const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  try {
    const formData = new URLSearchParams();
    formData.append('apikey', 'helloworld');
    formData.append('base64Image', base64Image);
    formData.append('language', 'spa');
    formData.append('isOverlayRequired', 'false');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      console.log("OCR.space response:", JSON.stringify(data, null, 2));
    } else {
      console.error("HTTP Error:", response.status, await response.text());
    }
  } catch (error) {
    console.error("Network or script error:", error);
  }
}

testOcrSpace();
