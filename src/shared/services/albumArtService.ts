const albumArtCache = new Map<string, string | null>();

export async function fetchAlbumArt(title: string, artist: string = ''): Promise<string | null> {
  const cacheKey = `${title}-${artist}`.toLowerCase();
  
  if (albumArtCache.has(cacheKey)) {
    return albumArtCache.get(cacheKey) || null;
  }

  try {
    // Clean up filename for better search results
    let cleanTitle = title.replace(/\.[^/.]+$/, ""); // remove extension
    cleanTitle = cleanTitle.replace(/official|video|lyrics|audio|music/gi, "").trim();

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
        // iTunes returns 100x100 by default, change it to 600x600 for high quality
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
