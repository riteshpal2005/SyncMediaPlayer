import * as MediaLibrary from 'expo-media-library';

export interface VideoAsset {
  id: string;
  filename: string;
  uri: string;
  duration: number;
  creationTime: number;
  albumId?: string;
  width: number;
  height: number;
}

export interface VideoGroup {
  albumId: string;
  albumName: string;
  videos: VideoAsset[];
}

export async function requestMediaPermissions(): Promise<boolean> {
  const { status: currentStatus } = await MediaLibrary.getPermissionsAsync();
  if (currentStatus === 'granted') return true;
  
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
}

export async function scanForVideos(): Promise<VideoGroup[]> {
  const hasPermission = await requestMediaPermissions();
  
  if (!hasPermission) {
    throw new Error('Media library permission not granted');
  }

  // Get all albums
  const albums = await MediaLibrary.getAlbumsAsync({
    includeSmartAlbums: true,
  });

  const videoGroups: VideoGroup[] = [];
  let ungroupedVideos: VideoAsset[] = [];

  for (const album of albums) {
    const titleLower = album.title.toLowerCase();
    if (titleLower === 'camera' || titleLower.includes('whatsapp')) {
      continue;
    }

    let hasNextPage = true;
    let endCursor: string | undefined = undefined;
    const albumVideos: VideoAsset[] = [];

    while (hasNextPage) {
      const pagedInfo: MediaLibrary.PagedInfo<MediaLibrary.Asset> = await MediaLibrary.getAssetsAsync({
        album: album.id,
        mediaType: 'video',
        first: 100,
        after: endCursor,
      });

      const mappedAssets: VideoAsset[] = pagedInfo.assets.map(asset => ({
        id: asset.id,
        filename: asset.filename,
        uri: asset.uri,
        duration: asset.duration,
        creationTime: asset.creationTime,
        albumId: asset.albumId,
        width: asset.width,
        height: asset.height,
      }));

      albumVideos.push(...mappedAssets);

      hasNextPage = pagedInfo.hasNextPage;
      endCursor = pagedInfo.endCursor;
    }

    if (albumVideos.length > 0) {
      // Remove duplicates just in case
      const uniqueVideos = Array.from(new Map(albumVideos.map(item => [item.id, item])).values());

      const titleLower = album.title.toLowerCase();
      if (titleLower === 'download' || titleLower === 'movies' || titleLower.includes('download')) {
        ungroupedVideos.push(...uniqueVideos);
      } else {
        uniqueVideos.sort((a, b) => b.creationTime - a.creationTime);
        videoGroups.push({
          albumId: album.id,
          albumName: album.title,
          videos: uniqueVideos,
        });
      }
    }
  }

  // Sort groups alphabetically by albumName
  videoGroups.sort((a, b) => a.albumName.localeCompare(b.albumName));

  // Add ungrouped videos at the top if there are any
  if (ungroupedVideos.length > 0) {
    // Sort combined ungrouped videos
    const uniqueUngrouped = Array.from(new Map(ungroupedVideos.map(item => [item.id, item])).values());
    uniqueUngrouped.sort((a, b) => b.creationTime - a.creationTime);
    
    videoGroups.unshift({
      albumId: 'ungrouped',
      albumName: 'Ungrouped', // This will be used to identify it in UI and hide the header
      videos: uniqueUngrouped,
    });
  }

  return videoGroups;
}
