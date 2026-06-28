import { generateMemeFromText } from '../src/services/MemeApiService';

describe('generateMemeFromText', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('falls back to a local placeholder image when the API returns 429', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    } as Response);

    const result = await generateMemeFromText({ text: 'Test meme', category: 'funny' });

    expect(result.memeUrl).toContain('via.placeholder.com');
  });
});
