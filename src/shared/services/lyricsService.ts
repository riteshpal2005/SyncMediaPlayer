export interface LyricsResponse {
  id: number;
  name: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string;
  syncedLyrics: string;
}

const LRCLIB_API_URL = 'https://lrclib.net/api/search';

const lyricsCache = new Map<string, string | null>();

export async function fetchLyrics(title: string, artist: string = ''): Promise<string | null> {
  const cacheKey = `${title}-${artist}`.toLowerCase();
  
  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey) || null;
  }

  try {
    // Clean up filename (remove extension and common fluff)
    let cleanTitle = title.replace(/\.[^/.]+$/, ""); // remove extension
    // Optionally remove strings like "official video", "lyrics", etc.
    cleanTitle = cleanTitle.replace(/official|video|lyrics|audio|music/gi, "").trim();

    const query = new URLSearchParams({
      q: cleanTitle, // use q for general search which is more forgiving
    });

    const response = await fetch(`${LRCLIB_API_URL}?${query.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch lyrics');
    }

    const data: LyricsResponse[] = await response.json();
    
    if (data && data.length > 0) {
      // Pick the best match
      const bestMatch = data.find(d => !d.instrumental && d.plainLyrics);
      if (bestMatch && bestMatch.plainLyrics) {
        lyricsCache.set(cacheKey, bestMatch.plainLyrics);
        return bestMatch.plainLyrics;
      }
    }
    
    lyricsCache.set(cacheKey, null);
    return null;
  } catch (error) {
    console.warn("Lyrics fetch error:", error);
    return null;
  }
}
