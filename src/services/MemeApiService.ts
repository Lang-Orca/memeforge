import { MEME_CATEGORIES } from '../constants/categories';

// Fallback image URL for when API is rate-limited or fails
const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1024&q=80';

/**
 * API response interface for both /api/new and /update endpoints
 */
interface MemeApiResponse {
  result?: {
    image?: string; // either URL or base64 string
  };
}

/**
 * Detects if the image string is a URL or base64 and returns a usable URI for React Native Image
 */
function parseImageResponse(imageString: string): string {
  // Check if it's a URL
  if (imageString.startsWith('http://') || imageString.startsWith('https://')) {
    return imageString;
  }
  // Assume it's base64 and add data URL prefix
  return `data:image/png;base64,${imageString}`;
}

/**
 * Maps meme category to a context string that guides the API
 */
function mapCategoryToContext(category: string): string {
  const categoryObj = MEME_CATEGORIES.find((c) => c.id === category);
  const label = categoryObj?.label ?? 'Drôle';

  const contextMap: Record<string, string> = {
    funny: 'Crée un mème drôle et léger avec un humour absurde et décalé.',
    dark: 'Crée un mème avec un humour noir et cynique.',
    wholesome: 'Crée un mème positif, touchant et inspirant.',
    relatable: 'Crée un mème relatable sur la vie quotidienne et les expériences communes.',
    mocking: 'Crée un mème ironique et moqueur avec de l\'autodérision.',
  };

  let context = contextMap[category] || `Crée un mème amusant dans le style ${label}.`;

  // Ensure context is at least 20 characters
  if (context.length < 20) {
    context += ' Sois créatif et original.';
  }

  return context;
}

/**
 * Generate meme from text input with category context
 */
export async function generateMemeFromText(params: {
  text: string;
  category: string;
  temperature?: number;
}): Promise<{ memeUrl: string }> {
  if (!params.text || params.text.trim().length === 0) {
    throw new Error('Text input is required');
  }

  const context = mapCategoryToContext(params.category);
  const body = {
    context,
    user_prompt: params.text.trim(),
    temperature: params.temperature ?? 0.7,
  };

  console.log('[generateMemeFromText] Calling API https://meme-api-bice.vercel.app/api/new with body:', body);

  try {
    const res = await fetch('https://meme-api-bice.vercel.app/api/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    console.log('[generateMemeFromText] API response status:', res.status, res.statusText);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[generateMemeFromText] API returned error status. Response body:', errorText);
      
      // If rate-limited (429), return fallback image instead of throwing
      if (res.status === 429) {
        console.warn('[generateMemeFromText] API rate-limited (429). Using fallback image.');
        return { memeUrl: FALLBACK_IMAGE_URL };
      }
      
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    const json: MemeApiResponse = await res.json();
    console.log('[generateMemeFromText] API response JSON:', JSON.stringify(json));

    const imageString = json.result?.image;
    if (!imageString) {
      console.error('[generateMemeFromText] Invalid API response: missing result.image field');
      throw new Error('Invalid API response: missing image');
    }

    console.log('[generateMemeFromText] Successfully received image data');
    const memeUrl = parseImageResponse(imageString);
    return { memeUrl };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[generateMemeFromText] Exception caught:', errorMessage);
    throw error;
  }
}

/**
 * Generate meme from existing image (base64) with caption and category
 */
export async function generateMemeFromImage(params: {
  imageBase64: string;
  caption?: string;
  category: string;
}): Promise<{ memeUrl: string }> {
  if (!params.imageBase64 || params.imageBase64.trim().length === 0) {
    throw new Error('Base64 image is required');
  }

  const context = mapCategoryToContext(params.category);
  const userPrompt = params.caption
    ? `${params.caption} (Style ${params.category})`
    : `Applique le style ${params.category} à cette image`;

  const body = {
    base_image: params.imageBase64,
    context,
    user_prompt: userPrompt,
    temperature: 0.7,
  };

  console.log('[generateMemeFromImage] Calling API https://meme-api-bice.vercel.app/update with body (base_image truncated):', {
    ...body,
    base_image: body.base_image.substring(0, 50) + '...',
  });

  try {
    const res = await fetch('https://meme-api-bice.vercel.app/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    console.log('[generateMemeFromImage] API response status:', res.status, res.statusText);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[generateMemeFromImage] API returned error status. Response body:', errorText);
      
      // If rate-limited (429), return fallback image instead of throwing
      if (res.status === 429) {
        console.warn('[generateMemeFromImage] API rate-limited (429). Using fallback image.');
        return { memeUrl: FALLBACK_IMAGE_URL };
      }
      
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    const json: MemeApiResponse = await res.json();
    console.log('[generateMemeFromImage] API response JSON:', JSON.stringify(json));

    const imageString = json.result?.image;
    if (!imageString) {
      console.error('[generateMemeFromImage] Invalid API response: missing result.image field');
      throw new Error('Invalid API response: missing image');
    }

    console.log('[generateMemeFromImage] Successfully received image data');
    const memeUrl = parseImageResponse(imageString);
    return { memeUrl };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[generateMemeFromImage] Exception caught:', errorMessage);
    throw error;
  }
}

/**
 * Generate meme from voice transcription (reuses generateMemeFromText logic)
 */
export function generateMemeFromVoice(params: {
  transcript: string;
  category: string;
  temperature?: number;
}): Promise<{ memeUrl: string }> {
  return generateMemeFromText({
    text: params.transcript,
    category: params.category,
    temperature: params.temperature,
  });
}

/**
 * Generate sticker from chat text (uses generateMemeFromText under the hood)
 */
export function generateStickersFromChat(params: { chatText: string }): Promise<{ stickerUrl: string; summary: string }> {
  return generateMemeFromText({
    text: params.chatText,
    category: 'mocking',
    temperature: 0.8,
  }).then((result) => ({
    stickerUrl: result.memeUrl,
    summary: 'Sticker généré à partir de la conversation WhatsApp',
  }));
}
