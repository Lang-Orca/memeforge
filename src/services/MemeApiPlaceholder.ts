export interface GenerateMemeParams {
  text: string;
  category: string;
  imageTemplateUrl?: string;
}

export interface GenerateMemeResponse {
  memeUrl: string;
}

/**
 * Simulate an API call to generate a meme.
 * TODO: remplacer par le vrai appel fetch vers le backend une fois l'endpoint confirmé.
 */
export async function generateMeme(
  params: GenerateMemeParams
): Promise<GenerateMemeResponse> {
  const BASE_URL = 'https://meme-ms6hdvj85-marcs-projects-e5f4b165.vercel.app';

  try {
    const res = await fetch(`${BASE_URL}/api/generate-meme`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }

    const json = await res.json();
    // Expecting { memeUrl: string } or { meme_url: string }
    return { memeUrl: json.memeUrl ?? json.meme_url ?? json.url };
  } catch (err) {
    // Fallback to placeholder image on network or parsing failure
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    return {
      memeUrl: `https://via.placeholder.com/1024x1024.png?text=${encodeURIComponent(
        params.text || 'Memeforge'
      )}`,
    };
  }
}

export interface GenerateChatStickerParams {
  chatText: string;
}

export interface GenerateChatStickerResponse {
  stickerUrl: string;
  summary: string;
}

export async function generateStickersFromChat(
  params: GenerateChatStickerParams
): Promise<GenerateChatStickerResponse> {
  const BASE_URL = 'https://meme-ms6hdvj85-marcs-projects-e5f4b165.vercel.app';

  try {
    const res = await fetch(`${BASE_URL}/api/generate-sticker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) throw new Error(`API error ${res.status}`);

    const json = await res.json();
    return { stickerUrl: json.stickerUrl ?? json.sticker_url ?? json.url, summary: json.summary ?? '' };
  } catch (err) {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    const lines = params.chatText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const title = lines.length > 0 ? lines[0].slice(0, 40) : 'Chat WhatsApp';

    return {
      stickerUrl: `https://via.placeholder.com/1024x1024.png?text=${encodeURIComponent(`Sticker ${title}`)}`,
      summary: `Sticker généré à partir de la conversation WhatsApp`,
    };
  }
}

// Branching note:
// Import and call `generateMeme` from your screen. When backend is ready,
// update this single file to perform the real network request.
