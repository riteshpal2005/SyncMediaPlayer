export function cleanAudioTitle(filename: string): string {
  // 1. Remove extension
  let clean = filename.replace(/\.[^/.]+$/, "");

  // 2. Remove URL encoded junk if any
  clean = decodeURIComponent(clean);

  // 3. Remove content inside brackets [ ] and parentheses ( ) aggressively.
  // Downloaded MP3s often have [128kbps], (Official Video), (Lyric Video), etc.
  clean = clean.replace(/\[.*?\]/g, "");
  clean = clean.replace(/\(.*?\)/g, "");
  clean = clean.replace(/\{.*?\}/g, "");

  // 4. Remove common annoying keywords
  const keywords = [
    "official", "music", "video", "audio", "lyric", "lyrics", "hd", "hq", 
    "1080p", "720p", "4k", "remastered", "original", "cover", "remix", 
    "feat", "ft\\.", "featuring", "kbps", "mp3", "download"
  ];
  const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
  clean = clean.replace(keywordRegex, "");

  // 5. Clean up weird characters (underscores, dashes) and replace with space
  clean = clean.replace(/[_-]/g, " ");

  // 6. Remove multiple spaces and trim
  clean = clean.replace(/\s{2,}/g, " ").trim();

  return clean;
}
