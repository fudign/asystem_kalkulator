// Image Generation Service
// Uses OpenRouter API with FLUX image generation models

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Available image models on OpenRouter
const IMAGE_MODELS = {
  fast: 'google/gemini-2.5-flash-image',       // Fast and cheap
  balanced: 'google/gemini-3-pro-image-preview', // Better quality
  quality: 'openai/gpt-5-image',               // Highest quality
};

interface ImageGenerationResult {
  url: string;
  thumbUrl: string;
  alt: string;
  credit: string;
  creditLink: string;
}

// Business type to prompt mapping for better image generation
const BUSINESS_PROMPTS: Record<string, string[]> = {
  'гончарная мастерская': [
    'cozy pottery workshop interior with clay wheel, warm lighting, artisan ceramics on wooden shelves, professional photo',
    'hands shaping clay on pottery wheel, artistic ceramic studio, natural light streaming through window',
    'beautiful handmade ceramic vases and bowls display, pottery studio showroom, warm ambient lighting',
    'pottery class in progress, students at wheels, friendly instructor, creative atmosphere',
  ],
  'керамика': [
    'ceramic art studio with handmade pottery, warm rustic atmosphere, professional photography',
    'artisan ceramics workshop, clay pottery on wooden shelves, natural lighting',
  ],
  'кофейня': [
    'modern cozy coffee shop interior, warm lighting, wooden barista counter, plants, professional photo',
    'specialty coffee being poured, beautiful latte art, cafe ambiance, close-up shot',
    'coffee shop with exposed brick walls, comfortable leather seating, warm atmosphere',
    'barista preparing espresso, steam rising, professional coffee equipment',
  ],
  'ресторан': [
    'elegant restaurant interior, fine dining atmosphere, soft chandelier lighting, professional photo',
    'chef preparing gourmet dish in modern kitchen, action shot, professional photography',
    'beautifully plated food, restaurant table setting, elegant presentation',
  ],
  'салон красоты': [
    'modern beauty salon interior, clean minimalist aesthetic, styling stations with mirrors, professional photo',
    'spa treatment room, relaxing zen atmosphere, candles, white towels, calming decor',
    'professional hair styling in progress, salon mirror reflection, elegant interior',
  ],
  'фитнес': [
    'modern gym interior with professional equipment, motivational atmosphere, natural light',
    'fitness training session, personal trainer with client, professional gym environment',
    'yoga studio, clean modern design, peaceful atmosphere, morning light',
  ],
  'стоматология': [
    'modern dental clinic reception, clean bright interior, professional welcoming atmosphere',
    'friendly dental office, comfortable patient area, modern equipment, calming colors',
  ],
  'автосервис': [
    'professional auto repair shop, car on hydraulic lift, clean organized garage, good lighting',
    'mechanic working on car engine, professional auto service center, modern equipment',
  ],
  'пекарня': [
    'artisan bakery interior with fresh bread and pastries display, warm golden lighting, rustic wood',
    'baker preparing fresh bread, flour dust in air, rustic bakery interior, warm atmosphere',
  ],
  'цветочный': [
    'beautiful flower shop interior, colorful bouquets display, natural light, fresh flowers everywhere',
    'florist arranging elegant bouquet, flower shop workspace, creative atmosphere',
  ],
};

// Generate image using OpenRouter FLUX model
async function generateImageWithAI(prompt: string, model: string = IMAGE_MODELS.fast): Promise<string | null> {
  if (!OPENROUTER_API_KEY) {
    console.warn('[IMAGE-GEN] No OpenRouter API key');
    return null;
  }

  try {
    console.log(`[IMAGE-GEN] Generating image with ${model}...`);

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://asystem.kg',
        'X-Title': 'ASYSTEM.KG Site Generator',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        // Request image output
        modalities: ['image', 'text'],
        // Image settings
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[IMAGE-GEN] OpenRouter error:', response.status, error);
      return null;
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;

    // Check for images array in message (Gemini format)
    if (message?.images && Array.isArray(message.images)) {
      for (const img of message.images) {
        if (img.type === 'image_url' && img.image_url?.url) {
          console.log('[IMAGE-GEN] Found image in images array');
          return img.image_url.url;
        }
      }
    }

    // Extract image URL from content
    const content = message?.content;

    if (typeof content === 'string') {
      // Check if it's a data URL
      if (content.startsWith('data:image')) {
        return content;
      }
      // Check if content contains an image URL
      const urlMatch = content.match(/https?:\/\/[^\s]+\.(png|jpg|jpeg|webp)/i);
      if (urlMatch) {
        return urlMatch[0];
      }
    }

    // Check for image in multimodal response format (array content)
    if (Array.isArray(content)) {
      for (const item of content) {
        if (item.type === 'image_url' && item.image_url?.url) {
          return item.image_url.url;
        }
        if (item.type === 'image' && item.url) {
          return item.url;
        }
      }
    }

    // Check alternate response formats
    if (message?.image_url) {
      return message.image_url;
    }

    console.warn('[IMAGE-GEN] No image found in response:', JSON.stringify(data).slice(0, 500));
    return null;
  } catch (error) {
    console.error('[IMAGE-GEN] Error generating image:', error);
    return null;
  }
}

// Get images for a business type
export async function getBusinessImages(
  businessType: string,
  sections: string[] = ['hero', 'about', 'services', 'gallery']
): Promise<Record<string, ImageGenerationResult[]>> {
  const results: Record<string, ImageGenerationResult[]> = {};

  // Find matching prompts
  const businessLower = businessType.toLowerCase();
  let prompts: string[] = [];

  for (const [key, value] of Object.entries(BUSINESS_PROMPTS)) {
    if (businessLower.includes(key) || key.includes(businessLower)) {
      prompts = value;
      break;
    }
  }

  // Default prompts if no match
  if (prompts.length === 0) {
    prompts = [
      `modern ${businessType} business interior, professional atmosphere, high quality photo`,
      `${businessType} team at work, friendly professional environment`,
      `${businessType} services in action, high quality professional photography`,
      `${businessType} products or results showcase, elegant presentation`,
    ];
  }

  // Generate images for each section (in parallel for speed)
  const promises = sections.map(async (section, i) => {
    const prompt = prompts[i % prompts.length];

    // Try to generate with AI
    const generatedUrl = await generateImageWithAI(prompt);

    if (generatedUrl) {
      return {
        section,
        images: [{
          url: generatedUrl,
          thumbUrl: generatedUrl,
          alt: `${businessType} - ${section}`,
          credit: 'AI Generated (Gemini)',
          creditLink: 'https://openrouter.ai',
        }],
      };
    } else {
      // Fallback to placeholders
      return {
        section,
        images: generatePlaceholders(businessType, section, 1),
      };
    }
  });

  const resolved = await Promise.all(promises);

  for (const { section, images } of resolved) {
    results[section] = images;
  }

  return results;
}

// Search/generate images
export async function searchImages(
  query: string,
  count: number = 3
): Promise<ImageGenerationResult[]> {
  const results: ImageGenerationResult[] = [];

  // Generate images in parallel
  const promises = Array.from({ length: count }, (_, i) =>
    generateImageWithAI(`${query}, variation ${i + 1}, professional photography`)
  );

  const generated = await Promise.all(promises);

  for (const url of generated) {
    if (url) {
      results.push({
        url,
        thumbUrl: url,
        alt: query,
        credit: 'AI Generated (Gemini)',
        creditLink: 'https://openrouter.ai',
      });
    }
  }

  // Fill with placeholders if needed
  if (results.length < count) {
    const placeholders = generatePlaceholders(query, 'image', count - results.length);
    results.push(...placeholders);
  }

  return results;
}

// Generate placeholder images when API is not available
function generatePlaceholders(query: string, section: string, count: number): ImageGenerationResult[] {
  const placeholders: ImageGenerationResult[] = [];

  // Use picsum.photos for realistic placeholder images
  const categories: Record<string, number[]> = {
    hero: [1015, 1016, 1018, 1019], // Nature/landscape IDs
    about: [1025, 1027, 1074, 1076], // People/team
    services: [180, 367, 403, 452], // Work/business
    gallery: [225, 250, 292, 326], // Products/art
  };

  const ids = categories[section] || [1001, 1002, 1003, 1004];

  for (let i = 0; i < count; i++) {
    const id = ids[i % ids.length];
    placeholders.push({
      url: `https://picsum.photos/id/${id}/1200/800`,
      thumbUrl: `https://picsum.photos/id/${id}/400/300`,
      alt: `${query} - ${section}`,
      credit: 'Placeholder (Picsum)',
      creditLink: 'https://picsum.photos',
    });
  }

  return placeholders;
}

// Get a single hero image
export async function getHeroImage(businessType: string): Promise<ImageGenerationResult | null> {
  const images = await searchImages(businessType, 1);
  return images[0] || null;
}

// Export types and models config
export type { ImageGenerationResult };
export type ImageSearchResult = ImageGenerationResult;
export { IMAGE_MODELS };
