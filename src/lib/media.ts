'use server';

import path from 'path';
import fs from 'fs/promises';
import { generateMediaMetadata } from '@/ai/flows/generate-media-metadata-flow';

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
        // Metadata file doesn't exist, generate it
        const videoPath = path.join(mediaDirectory, file);
        const videoBuffer = await fs.readFile(videoPath);
        const videoDataUri = `data:video/${path.extname(file).substring(1)};base64,${videoBuffer.toString(
          'base64'
        )}`;

        const generatedMetadata = await generateMediaMetadata({
          fileName: file,
          videoDataUri,
        });

        const thumbnailBuffer = Buffer.from(
          generatedMetadata.thumbnailDataUri.split(',')[1],
          'base64'
        );
        const thumbnailFilename = `${id}.png`;
        const thumbnailPath = path.join(metadataDirectory, thumbnailFilename);
        await fs.writeFile(thumbnailPath, thumbnailBuffer);

        metadata = {
          title: generatedMetadata.title,
          description: generatedMetadata.description,
          aiHint: generatedMetadata.aiHint,
          thumbnailUrl: `/metadata/${thumbnailFilename}`,
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
