import * as MediaLibrary from 'expo-media-library';

export interface AudioAsset {
  id: string;
  filename: string;
  uri: string;
  duration: number;
  creationTime: number;
  albumId?: string;
}

export async function requestMediaPermissions(): Promise<boolean> {
  const { status: currentStatus } = await MediaLibrary.getPermissionsAsync();
  if (currentStatus === 'granted') return true;
  
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
}

const SUPPORTED_AUDIO_EXTENSIONS = ['.mp3', '.opus', '.m4a', '.wav', '.flac', '.aac', '.ogg', '.wma'];

export async function scanForAudio(): Promise<AudioAsset[]> {
  const hasPermission = await requestMediaPermissions();
  
  if (!hasPermission) {
    throw new Error('Media library permission not granted');
  }


  const albums = await MediaLibrary.getAlbumsAsync({
    includeSmartAlbums: true,
  });

  const combinedAudioAssets: AudioAsset[] = [];

  for (const album of albums) {
    const titleLower = album.title.toLowerCase();
    

    if (titleLower !== 'music' && titleLower !== 'download' && !titleLower.includes('download')) {
      continue;
    }

    let hasNextPage = true;
    let endCursor: string | undefined = undefined;

    while (hasNextPage) {
      const pagedInfo: MediaLibrary.PagedInfo<MediaLibrary.Asset> = await MediaLibrary.getAssetsAsync({
        album: album.id,
        mediaType: 'audio',
        first: 100,
        after: endCursor,
      });

      const mappedAssets: AudioAsset[] = pagedInfo.assets
        .filter(asset => {
          const ext = asset.filename.slice(asset.filename.lastIndexOf('.')).toLowerCase();
          return SUPPORTED_AUDIO_EXTENSIONS.includes(ext);
        })
        .map(asset => ({
          id: asset.id,
          filename: asset.filename,
          uri: asset.uri,
          duration: asset.duration,
          creationTime: asset.creationTime,
          albumId: asset.albumId,
        }));

      combinedAudioAssets.push(...mappedAssets);

      hasNextPage = pagedInfo.hasNextPage;
      endCursor = pagedInfo.endCursor;
    }
  }


  const uniqueAudios = Array.from(new Map(combinedAudioAssets.map(item => [item.id, item])).values());
  uniqueAudios.sort((a, b) => b.creationTime - a.creationTime);

  return uniqueAudios;
}
