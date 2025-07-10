'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getMediaById, PlayableMedia } from '@/lib/media';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface WatchPageProps {
  params: {
    id: string;
  };
}

export default function WatchPage({ params: { id } }: WatchPageProps) {
  const [mediaItem, setMediaItem] = useState<PlayableMedia | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const searchParams = useSearchParams();
  const showId = searchParams.get('show');

  useEffect(() => {
    async function loadMedia() {
      try {
        setIsLoading(true);
        const item = await getMediaById(id);
        if (!item) {
          setError('Media not found.');
        } else {
          setMediaItem(item);
        }
      } catch (e) {
        console.error("Failed to load media:", e);
        setError('Failed to load media.');
      } finally {
        setIsLoading(false);
      }
    }
    loadMedia();

    // Cleanup function to run when the component unmounts
    return () => {
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.removeAttribute('src'); // Detach the source
        video.load();
      }
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="mx-auto max-w-4xl">
          <Skeleton className="aspect-video w-full" />
          <div className="mt-6 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !mediaItem) {
    notFound(); // Let Next.js handle the 404 page
  }

  const backLink = showId ? `/show/${showId}` : '/';
  const backText = showId ? 'Back to Show' : 'Back to Library';
  const BackIcon = showId ? Tv : ArrowLeft;
  const videoUrl = `/api/stream/${mediaItem.id}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost">
          <Link href={backLink}>
            <BackIcon className="mr-2 h-4 w-4" />
            {backText}
          </Link>
        </Button>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-card shadow-lg">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            autoPlay
            crossOrigin="anonymous"
            className="h-full w-full"
          >
            {mediaItem.subtitlesUrl && (
              <track
                src={mediaItem.subtitlesUrl}
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
            {mediaItem.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {mediaItem.description}
          </p>
        </div>
      </div>
    </div>
  );
}
