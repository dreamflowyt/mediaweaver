'use server';

import path from 'path';
import fs from 'fs/promises';

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  aiHint: string;
}

const mediaDirectory = path.join(process.cwd(), 'public', 'media');
const metadataDirectory = path.join(process.cwd(), 'public', 'metadata');

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Helper function to format filename into a title
function formatTitle(filename: string): string {
    const nameWithoutExtension = path.parse(filename).name;
    return nameWithoutExtension
        .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()); // Capitalize each word
}

export async function getMediaLibrary(): Promise<Video[]> {
  await ensureDirectoryExists(mediaDirectory);
  await ensureDirectoryExists(metadataDirectory);

  const files = await fs.readdir(mediaDirectory);
  const videoFiles = files.filter(file => /\.(mp4|webm|ogg|mkv|hevc|mov)$/i.test(file));

  const mediaLibrary: Video[] = await Promise.all(
    videoFiles.map(async (file) => {
      const id = path.parse(file).name;
      const metadataPath = path.join(metadataDirectory, `${id}.json`);
      let metadata;

      try {
        const metadataFile = await fs.readFile(metadataPath, 'utf-8');
        metadata = JSON.parse(metadataFile);
      } catch (error) {
        // Metadata file doesn't exist, generate it without AI
        const title = formatTitle(file);
        
        metadata = {
          title: title,
          description: `Video file: ${file}`,
          aiHint: 'video placeholder',
          thumbnailUrl: `https://placehold.co/600x400.png`,
        };
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      }

      return {
        id,
        videoUrl: `/media/${file}`,
        ...metadata,
      };
    })
  );

  return mediaLibrary;
}

export async function getVideoById(id: string): Promise<Video | undefined> {
  const library = await getMediaLibrary();
  return library.find((video) => video.id === id);
}
