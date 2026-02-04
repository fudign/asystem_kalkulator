// Test AI action directly
import { readFileSync } from 'fs';

// Read API key from .env.local
const envContent = readFileSync('./app/.env.local', 'utf-8');
const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/);
const anthropicKey = match ? match[1].trim() : null;

if (!anthropicKey) {
  console.error('No ANTHROPIC_API_KEY found');
  process.exit(1);
}

const systemPrompt = `Ты профессиональный менеджер по продажам IT-компании.

ВАЖНО! Ты ДОЛЖЕН отвечать ТОЛЬКО в формате JSON:
{
  "message": "Твой текстовый ответ",
  "extractedContext": {
    "projectName": "Название",
    "businessType": "Тип бизнеса"
  }
}

КРИТИЧНО: НЕ используй кавычки-ёлочки «» или "" внутри JSON! Только обычные кавычки или апострофы.`;

// Test with quote marks in the name
const userMessage = 'Привет! Хочу сайт для гончарной мастерской "Глиняные истории"';

async function test() {
  console.log('Testing AI...');
  console.log('User message:', userMessage);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('API Error:', data);
    return;
  }

  const text = data.content?.[0]?.text;

  console.log('\n=== RAW RESPONSE ===');
  console.log(text);
  console.log('\n=== TRYING TO PARSE ===');

  try {
    const parsed = JSON.parse(text);
    console.log('SUCCESS:', JSON.stringify(parsed, null, 2));
  } catch (e) {
    console.log('PARSE FAILED:', e.message);

    // Check for special quotes
    const specialChars = text.match(/[«»""\u201C\u201D\u00AB\u00BB]/g);
    if (specialChars) {
      console.log('Found special quotes:', [...new Set(specialChars)]);
    }
  }
}

test().catch(console.error);
