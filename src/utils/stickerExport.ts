import RNFS from 'react-native-fs';

/**
 * Extracts base64 data from a data URI (e.g., "data:image/png;base64,...")
 */
function extractBase64FromDataUri(dataUri: string): string {
  const parts = dataUri.split(',');
  if (parts.length !== 2) {
    throw new Error('Invalid data URI format');
  }
  return parts[1];
}

/**
 * Converts an image (from HTTP URL or base64 data URI) into a cached local file.
 * For HTTP URLs, downloads from remote.
 * For data URIs, extracts base64 and writes to file.
 * Returns the local file path suitable for sharing.
 * 
 * TODO: For true sticker export, consider resizing/cropping to square and
 * making background transparent using a native image-processing library.
 */
export async function convertImageToSticker(imageUrl: string): Promise<string> {
  try {
    const dest = `${RNFS.CachesDirectoryPath}/memeforge-sticker-${Date.now()}.png`;
    
    if (imageUrl.startsWith('http')) {
      // Handle HTTP URLs - download from remote
      const dl = RNFS.downloadFile({ fromUrl: imageUrl, toFile: dest });
      const res = await dl.promise;
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
        return dest;
      }
      throw new Error(`Download failed with status ${res.statusCode}`);
    } else if (imageUrl.startsWith('data:image')) {
      // Handle base64 data URIs - extract and write to file
      const base64Data = extractBase64FromDataUri(imageUrl);
      await RNFS.writeFile(dest, base64Data, 'base64');
      return dest;
    } else {
      throw new Error('Unsupported image format: must be HTTP URL or data URI');
    }
  } catch (err) {
    throw new Error(`convertImageToSticker failed: ${(err as Error).message}`);
  }
}

// Branching note:
// Import `convertImageToSticker` in your sharing flow and pass the returned
// local path to react-native-share when sticker mode is active.
