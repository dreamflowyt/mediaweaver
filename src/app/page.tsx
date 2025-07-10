'use client';

import { useState, useEffect } from 'react';
import type { MediaItem } from '@/lib/media';
import { getMediaLibrary } from '@/lib/media';
import { VideoCard } from '@/components/video-card';
import { ShowCard } from '@/components/show-card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMedia() {
      try {
        const mediaLibrary = await getMediaLibrary();
        setMedia(mediaLibrary);
      } catch (error) {
        console.error("Failed to load media library:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadMedia();
  }, []);

  const filteredMedia = media.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">
          Media Library
        </h1>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
             <div key={index} className="space-y-2">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="h-6 w-3/4" />
             </div>
          ))}
        </div>
      ) : filteredMedia.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredMedia.map((item) => {
            if (item.type === 'movie') {
              return <VideoCard key={item.id} video={item} />;
            }
            if (item.type === 'show') {
                return <ShowCard key={item.id} show={item} />;
            }
            return null;
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-12 text-center">
          <h2 className="text-xl font-semibold tracking-tight">
            {searchQuery ? 'No media found' : 'Your Media Library is Empty'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery
              ? 'Try adjusting your search.'
              : 'Add movies or TV shows to your public/media folder.'}
          </p>
        </div>
      )}
    </div>
  );
}
