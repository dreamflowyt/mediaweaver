import { getShowById } from '@/lib/media';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from '@/components/ui/card';

interface ShowPageProps {
  params: {
    id: string;
  };
}

export default async function ShowPage({ params }: ShowPageProps) {
  const show = await getShowById(params.id);

  if (!show) {
    notFound();
  }

  // Get the default open season, which is the latest one
  const defaultSeasonValue = show.seasons.length > 0 ? `season-${show.seasons[show.seasons.length - 1].seasonNumber}` : undefined;

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

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full md:w-1/3 lg:w-1/4">
          <Card className="overflow-hidden shadow-lg">
            <Image
              src={show.thumbnailUrl}
              alt={`Poster for ${show.title}`}
              width={600}
              height={900}
              data-ai-hint={show.aiHint}
              className="h-auto w-full object-cover"
            />
          </Card>
        </div>

        <div className="w-full md:w-2/3 lg:w-3/4">
          <h1 className="text-5xl font-bold font-headline tracking-tight text-primary">
            {show.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {show.description}
          </p>

          <h2 className="mt-10 border-b pb-2 text-3xl font-semibold font-headline tracking-tight">
            Seasons & Episodes
          </h2>
          <Accordion type="single" collapsible defaultValue={defaultSeasonValue} className="w-full">
            {show.seasons.map((season) => (
              <AccordionItem key={season.seasonNumber} value={`season-${season.seasonNumber}`}>
                <AccordionTrigger className="text-xl font-semibold">
                  Season {season.seasonNumber}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-3 pt-2">
                    {season.episodes.map((episode) => (
                      <Link
                        key={episode.id}
                        href={`/watch/${episode.id}?show=${show.id}`}
                        className="group flex items-center justify-between rounded-md p-3 transition-colors hover:bg-accent"
                      >
                        <div className="flex items-center gap-4">
                            <span className="text-lg font-mono text-muted-foreground group-hover:text-primary">
                                {String(episode.episodeNumber).padStart(2, '0')}
                            </span>
                            <span className="font-medium group-hover:text-primary">{episode.title}</span>
                        </div>
                        <PlayCircle className="h-6 w-6 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-primary" />
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
