export function cleanAudioTitle(filename: string): string {

  let clean = filename.replace(/\.[^/.]+$/, "");


  clean = decodeURIComponent(clean);



  clean = clean.replace(/[\[\(\{].*?[\]\)\}]/g, "");
  


  clean = clean.replace(/[-_ ]?[a-zA-Z0-9_-]{11}$/, "");


  const keywords = [
    "official", "music", "video", "audio", "lyric", "lyrics", "hd", "hq", 
    "1080p", "720p", "4k", "remastered", "original", "cover", "remix", 
    "feat", "ft\\.", "featuring", "kbps", "mp3", "download"
  ];
  const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
  clean = clean.replace(keywordRegex, "");


  clean = clean.replace(/[_-]/g, " ");


  clean = clean.replace(/\s{2,}/g, " ").trim();

  return clean;
}
