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
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Return a stable placeholder image. Replace this logic with real API call.
  // Example of real call:
  // const res = await fetch('https://api.example.com/generate-meme', { method: 'POST', body: JSON.stringify(params) })
  // const json = await res.json();
  // return { memeUrl: json.meme_url };

  return {
    memeUrl:
      'https://via.placeholder.com/1024x1024.png?text=Memeforge+Meme+Placeholder',
  };
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
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const lines = params.chatText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const title = lines.length > 0 ? lines[0].slice(0, 40) : 'Chat WhatsApp';

  return {
    stickerUrl: `https://via.placeholder.com/1024x1024.png?text=${encodeURIComponent(
      `Sticker ${title}`
    )}`,
    summary: `Sticker généré à partir de la conversation WhatsApp`,
  };
}

// Branching note:
// Import and call `generateMeme` from your screen. When backend is ready,
// update this single file to perform the real network request.
