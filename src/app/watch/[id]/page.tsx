import { getVideoById } from '@/lib/media';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WatchPageProps {
  params: {
    id: string;
  };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const video = await getVideoById(params.id);

  if (!video) {
    notFound();
  }

  // Use the new streaming API route
  const videoUrl = `/api/stream/${video.id}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Link>
        </Button>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-card shadow-lg">
          <video
            src={videoUrl}
            controls
            autoPlay
            crossOrigin="anonymous"
            className="h-full w-full"
          >
            {video.subtitlesUrl && (
              <track
                src={video.subtitlesUrl}
                kind="subtitles"
                srcLang="en"
                label="English"
                default
              />
            )}
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="mt-6 rounded-lg bg-card p-6 shadow-md">
          <h1 className="text-4xl font-bold font-headline tracking-tight text-primary">
            {video.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {video.description}
          </p>
        </div>
      </div>
    </div>
  );
}
