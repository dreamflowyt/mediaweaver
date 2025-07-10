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
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-12 text-center">
          <h2 className="text-xl font-semibold tracking-tight">
            Your Media Library is Empty
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            It looks like there are no videos here yet.
          </p>
        </div>
      )}
    </div>
  );
}
