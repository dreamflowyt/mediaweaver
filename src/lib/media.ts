export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  aiHint: string;
}

const mediaLibrary: Video[] = [];

export async function getMediaLibrary(): Promise<Video[]> {
  // In a real app, this would scan a directory
  return Promise.resolve(mediaLibrary);
}

export async function getVideoById(id: string): Promise<Video | undefined> {
  // In a real app, this might fetch from a database
  return Promise.resolve(mediaLibrary.find((video) => video.id === id));
}
