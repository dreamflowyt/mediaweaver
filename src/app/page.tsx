import { getMediaLibrary } from '@/lib/media';
import { VideoCard } from '@/components/video-card';

export default async function Home() {
  const videos = await getMediaLibrary();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold font-headline tracking-tight">
        Media Library
      </h1>
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <p>No videos found in your library.</p>
      )}
    </div>
  );
}
