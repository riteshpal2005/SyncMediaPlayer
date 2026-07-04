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

  // Filter the target albums
  const targetAlbumNames = ['Download', 'Movies', 'Pictures'];
  const targetAlbums = albums.filter((album) =>
    targetAlbumNames.includes(album.title)
  );

  const videoGroups: VideoGroup[] = [];

  for (const album of targetAlbums) {
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
      // Remove duplicates just in case and sort by creation time
      const uniqueVideos = Array.from(new Map(albumVideos.map(item => [item.id, item])).values());
      uniqueVideos.sort((a, b) => b.creationTime - a.creationTime);

      videoGroups.push({
        albumId: album.id,
        albumName: album.title,
        videos: uniqueVideos,
      });
    }
  }

  return videoGroups;
}
