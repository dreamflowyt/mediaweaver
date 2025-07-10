'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Movie } from '@/lib/media';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface VideoCardProps {
  video: Movie;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/watch/${video.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:border-primary">
        <CardContent className="p-0">
          <div className="aspect-video overflow-hidden">
            <Image
              src={video.thumbnailUrl}
              alt={`Thumbnail for ${video.title}`}
              width={600}
              height={400}
              data-ai-hint={video.aiHint}
              className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
          </div>
        </CardContent>
        <CardHeader>
          <CardTitle className="truncate text-lg font-semibold font-headline group-hover:text-primary">
            {video.title}
          </CardTitle>
        </CardHeader>
      </Card>
    </Link>
  );
}
