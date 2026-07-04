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

export async function requestMediaPermissions(): Promise<boolean> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
}

export async function scanForVideos(): Promise<VideoAsset[]> {
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

  let allVideos: VideoAsset[] = [];

  for (const album of targetAlbums) {
    let hasNextPage = true;
    let endCursor: string | undefined = undefined;

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

      allVideos = [...allVideos, ...mappedAssets];

      hasNextPage = pagedInfo.hasNextPage;
      endCursor = pagedInfo.endCursor;
    }
  }

  // Also query without album constraints if for some reason albums didn't match perfectly,
  // but to adhere strictly to the user requirement: "Main Folders to look in Download, Movies, Pictures"
  // the above is sufficient.

  // Remove duplicates just in case
  const uniqueVideos = Array.from(new Map(allVideos.map(item => [item.id, item])).values());
  
  return uniqueVideos.sort((a, b) => b.creationTime - a.creationTime);
}
