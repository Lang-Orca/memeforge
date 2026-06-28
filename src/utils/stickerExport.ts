import RNFS from 'react-native-fs';

/**
 * Downloads an image from a remote URL into the app cache and returns the local path.
 * Throws an error if download fails.
 * TODO: For true sticker export, consider resizing/cropping to square and
 * making background transparent using a native image-processing library.
 */
export async function convertImageToSticker(imageUrl: string): Promise<string> {
  try {
    const dest = `${RNFS.CachesDirectoryPath}/memeforge-sticker-${Date.now()}.png`;
    const dl = RNFS.downloadFile({ fromUrl: imageUrl, toFile: dest });
    const res = await dl.promise;
    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
      return dest;
    }
    throw new Error(`Download failed with status ${res.statusCode}`);
  } catch (err) {
    throw new Error(`convertImageToSticker failed: ${(err as Error).message}`);
  }
}

// Branching note:
// Import `convertImageToSticker` in your sharing flow and pass the returned
// local path to react-native-share when sticker mode is active.
