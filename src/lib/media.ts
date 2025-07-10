'use server';

import path from 'path';
import fs from 'fs/promises';

// Base interfaces
interface MediaBase {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  aiHint: string;
}

// Movie-specific interface
export interface Movie extends MediaBase {
  type: 'movie';
  videoUrl: string;
  subtitlesUrl?: string;
}

// Episode-specific interface, inherits from Movie
export interface Episode extends MediaBase {
  type: 'episode';
  videoUrl: string;
  subtitlesUrl?: string;
  episodeNumber: number;
  seasonNumber: number;
  showId: string;
}

// Season interface
export interface Season {
  seasonNumber: number;
  episodes: Episode[];
}

// Show-specific interface
export interface Show extends MediaBase {
  type: 'show';
  seasons: Season[];
}

// Union type for all media items
export type MediaItem = Movie | Show;
export type PlayableMedia = Movie | Episode;

const mediaDirectory = path.join(process.cwd(), 'public', 'media');
const metadataDirectory = path.join(process.cwd(), 'public', 'metadata');

// Utility Functions
async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

function formatTitle(filename: string): string {
    const nameWithoutExtension = path.parse(filename).name;
    return nameWithoutExtension
        .replace(/[-_]/g, ' ')
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
}

async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

function parseEpisodeFilename(filename: string): { season: number; episode: number } | null {
    const match = filename.match(/S(\d+)E(\d+)/i);
    if (match) {
        return { season: parseInt(match[1]), episode: parseInt(match[2]) };
    }
    return null;
}

// Metadata Management
async function readOrCreateMetadata(id: string, defaultTitle: string, showId?: string) {
    const metadataPath = path.join(metadataDirectory, `${id}.json`);
    try {
        const metadataFile = await fs.readFile(metadataPath, 'utf-8');
        return JSON.parse(metadataFile);
    } catch (error) {
        const metadata = {
            title: defaultTitle,
            description: `A video titled "${defaultTitle}".`,
            aiHint: showId ? 'tv show' : 'movie video',
            thumbnailUrl: `https://placehold.co/600x400.png`,
        };
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
        return metadata;
    }
}


// Core Media Library Functions
export async function getMediaLibrary(): Promise<MediaItem[]> {
  await ensureDirectoryExists(mediaDirectory);
  await ensureDirectoryExists(metadataDirectory);

  const dirents = await fs.readdir(mediaDirectory, { withFileTypes: true });
  const mediaLibrary: MediaItem[] = [];

  for (const dirent of dirents) {
      if (dirent.isDirectory()) {
          // Process as a TV Show
          const show = await processShow(dirent.name);
          if (show) mediaLibrary.push(show);
      } else if (/\.(mp4|webm|ogg|mkv|hevc|mov)$/i.test(dirent.name)) {
          // Process as a Movie
          const movie = await processMovie(dirent.name);
          mediaLibrary.push(movie);
      }
  }

  return mediaLibrary.sort((a, b) => a.title.localeCompare(b.title));
}

async function processShow(showDirName: string): Promise<Show | null> {
    const showId = showDirName.replace(/ /g, '-').toLowerCase();
    const showDirPath = path.join(mediaDirectory, showDirName);
    const seasonsMap: Map<number, Episode[]> = new Map();

    const seasonDirents = await fs.readdir(showDirPath, { withFileTypes: true });
    for (const seasonDirent of seasonDirents) {
        if (seasonDirent.isDirectory() && seasonDirent.name.toLowerCase().startsWith('season')) {
            const seasonNumber = parseInt(seasonDirent.name.replace(/season\s*/i, ''));
            if (isNaN(seasonNumber)) continue;
            
            const seasonPath = path.join(showDirPath, seasonDirent.name);
            const episodeFiles = await fs.readdir(seasonPath);

            for (const episodeFile of episodeFiles) {
                if (!/\.(mp4|webm|ogg|mkv|hevc|mov)$/i.test(episodeFile)) continue;

                const parsed = parseEpisodeFilename(episodeFile);
                const episodeNumber = parsed ? parsed.episode : parseInt(path.parse(episodeFile).name.match(/\d+/)?.[0] || '0');
                const episodeId = `${showId}-s${seasonNumber}-e${episodeNumber}`;
                const defaultTitle = formatTitle(episodeFile);
                const metadata = await readOrCreateMetadata(episodeId, defaultTitle, showId);

                const subtitlesPath = path.join(seasonPath, `${path.parse(episodeFile).name}.vtt`);
                const hasSubtitles = await fileExists(subtitlesPath);

                const episode: Episode = {
                    type: 'episode',
                    id: episodeId,
                    videoUrl: `/media/${showDirName}/${seasonDirent.name}/${episodeFile}`,
                    subtitlesUrl: hasSubtitles ? `/media/${showDirName}/${seasonDirent.name}/${path.parse(episodeFile).name}.vtt` : undefined,
                    episodeNumber,
                    seasonNumber,
                    showId,
                    ...metadata,
                };
                
                if (!seasonsMap.has(seasonNumber)) seasonsMap.set(seasonNumber, []);
                seasonsMap.get(seasonNumber)!.push(episode);
            }
        }
    }
    
    if (seasonsMap.size === 0) return null;
    
    const showMetadata = await readOrCreateMetadata(showId, formatTitle(showDirName));
    const seasons: Season[] = Array.from(seasonsMap.entries())
        .map(([seasonNumber, episodes]) => ({
            seasonNumber,
            episodes: episodes.sort((a, b) => a.episodeNumber - b.episodeNumber),
        }))
        .sort((a, b) => a.seasonNumber - b.seasonNumber);

    return {
        type: 'show',
        id: showId,
        seasons,
        ...showMetadata,
    };
}


async function processMovie(fileName: string): Promise<Movie> {
    const id = path.parse(fileName).name.replace(/ /g, '-').toLowerCase();
    const metadata = await readOrCreateMetadata(id, formatTitle(fileName));
    const subtitlesPath = path.join(mediaDirectory, `${path.parse(fileName).name}.vtt`);
    const hasSubtitles = await fileExists(subtitlesPath);

    return {
        type: 'movie',
        id,
        videoUrl: `/media/${fileName}`,
        subtitlesUrl: hasSubtitles ? `/media/${path.parse(fileName).name}.vtt` : undefined,
        ...metadata,
    };
}

export async function getShowById(id: string): Promise<Show | undefined> {
  const library = await getMediaLibrary();
  const show = library.find((item): item is Show => item.type === 'show' && item.id === id);
  return show;
}

export async function getMediaById(id: string): Promise<PlayableMedia | undefined> {
  const library = await getMediaLibrary();
  
  // Search for a movie first
  const movie = library.find((item): item is Movie => item.type === 'movie' && item.id === id);
  if (movie) return movie;
  
  // If not a movie, search for an episode
  for (const item of library) {
    if (item.type === 'show') {
      for (const season of item.seasons) {
        const episode = season.episodes.find(ep => ep.id === id);
        if (episode) return episode;
      }
    }
  }

  return undefined;
}
