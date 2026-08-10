import dotenv from 'dotenv';
dotenv.config();

async function checkGeminiModels() {
  console.log('====================================================');
  console.log('🔍 GOOGLE GEMINI API MODELS DISCOVERY & INSPECTION');
  console.log('====================================================\n');

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.log('ℹ️ No GEMINI_API_KEY found in process.env. Querying public v1beta endpoint without key...');
  } else {
    const masked = apiKey.length > 8 ? `${apiKey.slice(0, 4)}••••${apiKey.slice(-4)}` : '••••••••';
    console.log(`🔑 Using API Key from env: ${masked}`);
  }

  const requestedModel = 'gemini-2.5-flash';
  console.log(`[Gemini] Model requested: ${requestedModel}`);

  const url = apiKey
    ? `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
    : `https://generativelanguage.googleapis.com/v1beta/models`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ HTTP ${res.status} when querying Gemini models API:`, errText);
      return;
    }

    const data = await res.json();
    const models = data.models || [];

    console.log(`\n📋 Google Gemini API returned ${models.length} total models:\n`);

    let requestedModelObj = null;
    models.forEach((m) => {
      const name = m.name; // e.g. "models/gemini-1.5-flash"
      const cleanName = name.replace('models/', '');
      const methods = m.supportedGenerationMethods || [];
      const supportsGenContent = methods.includes('generateContent');

      console.log(`  - ${cleanName} (${name})`);
      console.log(`    DisplayName: "${m.displayName}"`);
      console.log(`    SupportedMethods: [${methods.join(', ')}]`);
      console.log(`    Supports generateContent: ${supportsGenContent ? '✅ YES' : '❌ NO'}\n`);

      if (cleanName === requestedModel || name === `models/${requestedModel}`) {
        requestedModelObj = m;
      }
    });

    const isAvailable = Boolean(requestedModelObj);
    const supportsGen = Boolean(requestedModelObj && (requestedModelObj.supportedGenerationMethods || []).includes('generateContent'));

    console.log('====================================================');
    console.log(`[Gemini] Model requested: ${requestedModel}`);
    console.log(`[Gemini] Model available: ${isAvailable ? 'true' : 'false'}`);
    console.log(`[Gemini] Supports generateContent: ${supportsGen ? 'true' : 'false'}`);
    console.log('====================================================\n');

  } catch (err) {
    console.error('❌ Failed to fetch Gemini models list:', err.message);
  }
}

checkGeminiModels();
