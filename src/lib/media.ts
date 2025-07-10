export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  aiHint: string;
}

const mediaLibrary: Video[] = [
  {
    id: 'big-buck-bunny',
    title: 'Big Buck Bunny',
    description: 'A classic open-source movie by the Blender Foundation.',
    thumbnailUrl: 'https://placehold.co/600x400.png',
    aiHint: 'animated rabbit',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    id: 'elephants-dream',
    title: 'Elephants Dream',
    description: 'Another classic from the Blender Foundation.',
    thumbnailUrl: 'https://placehold.co/600x400.png',
    aiHint: 'surreal machine',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
  {
    id: 'for-bigger-blazes',
    title: 'For Bigger Blazes',
    description: 'A short film by the Blender Foundation.',
    thumbnailUrl: 'https://placehold.co/600x400.png',
    aiHint: 'campfire night',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 'for-bigger-escapes',
    title: 'For Bigger Escapes',
    description: 'Follow the adventure.',
    thumbnailUrl: 'https://placehold.co/600x400.png',
    aiHint: 'mountain landscape',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    id: 'for-bigger-fun',
    title: 'For Bigger Fun',
    description: 'Good times with friends.',
    thumbnailUrl: 'https://placehold.co/600x400.png',
    aiHint: 'people laughing',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  },
  {
    id: 'for-bigger-joyrides',
    title: 'For Bigger Joyrides',
    description: 'A scenic drive.',
    thumbnailUrl: 'https://placehold.co/600x400.png',
    aiHint: 'car driving',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  },
  {
    id: 'for-bigger-meltdowns',
    title: 'For Bigger Meltdowns',
    description: 'An emotional journey.',
    thumbnailUrl: 'https://placehold.co/600x400.png',
    aiHint: 'ice cream melting',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  },
  {
    id: 'subaru-outback-on-snowy-road',
    title: 'Subaru Outback On Snowy Road',
    description: 'A car ad.',
    thumbnailUrl: 'https://placehold.co/600x400.png',
    aiHint: 'car snow',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnSnowyRoad.mp4',
  },
];

export async function getMediaLibrary(): Promise<Video[]> {
  // In a real app, this would scan a directory
  return Promise.resolve(mediaLibrary);
}

export async function getVideoById(id: string): Promise<Video | undefined> {
  // In a real app, this might fetch from a database
  return Promise.resolve(mediaLibrary.find((video) => video.id === id));
}
