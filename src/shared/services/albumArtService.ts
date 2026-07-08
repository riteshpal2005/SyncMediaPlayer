import { cleanAudioTitle } from '../utils/textUtils';

const albumArtCache = new Map<string, string | null>();

export async function fetchAlbumArt(title: string, artist: string = ''): Promise<string | null> {
  const cacheKey = `${title}-${artist}`.toLowerCase();
  
  if (albumArtCache.has(cacheKey)) {
    return albumArtCache.get(cacheKey) || null;
  }

  try {

    const cleanTitle = cleanAudioTitle(title);

    const searchTerm = artist && artist !== 'Unknown Artist' 
      ? `${cleanTitle} ${artist}` 
      : cleanTitle;

    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&limit=1`);
    if (!response.ok) {
      throw new Error('Failed to fetch album art');
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      if (result.artworkUrl100) {

        const highResArtwork = result.artworkUrl100.replace('100x100bb', '600x600bb');
        albumArtCache.set(cacheKey, highResArtwork);
        return highResArtwork;
      }
    }
    
    albumArtCache.set(cacheKey, null);
    return null;
  } catch (error) {
    console.warn("Album art fetch error:", error);
    return null;
  }
}
