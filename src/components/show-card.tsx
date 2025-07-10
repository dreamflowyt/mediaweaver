'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Show } from '@/lib/media';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tv } from 'lucide-react';

interface ShowCardProps {
  show: Show;
}

export function ShowCard({ show }: ShowCardProps) {
  const seasonCount = show.seasons.length;
  const episodeCount = show.seasons.reduce((acc, season) => acc + season.episodes.length, 0);

  return (
    <Link href={`/show/${show.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:border-primary">
        <CardContent className="relative p-0">
          <div className="aspect-video overflow-hidden">
            <Image
              src={show.thumbnailUrl}
              alt={`Poster for ${show.title}`}
              width={600}
              height={400}
              data-ai-hint={show.aiHint}
              className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
          </div>
           <Badge variant="secondary" className="absolute right-2 top-2">
                <Tv className="mr-1.5 h-3 w-3" />
                TV Show
            </Badge>
        </CardContent>
        <CardHeader>
          <CardTitle className="truncate text-lg font-semibold font-headline group-hover:text-primary">
            {show.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {seasonCount} {seasonCount > 1 ? 'Seasons' : 'Season'} &bull; {episodeCount} Episodes
          </p>
        </CardHeader>
      </Card>
    </Link>
  );
}
