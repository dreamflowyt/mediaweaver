'use server';

import {NextRequest, NextResponse} from 'next/server';
import fs from 'fs';
import path from 'path';
import {promisify} from 'util';

const stat = promisify(fs.stat);

const mediaDirectory = path.join(process.cwd(), 'public', 'media');

async function findVideoFile(id: string): Promise<{filePath: string; ext: string} | null> {
    const dirents = await fs.promises.readdir(mediaDirectory, { withFileTypes: true, recursive: true });
    
    for (const dirent of dirents) {
        if (dirent.isFile()) {
            const parsedPath = path.parse(dirent.name);
            const fileId = parsedPath.name.replace(/ /g, '-').toLowerCase();

            const fullDirentPath = path.join(dirent.path, dirent.name);
            const relativePath = path.relative(mediaDirectory, fullDirentPath);
            const pathParts = relativePath.split(path.sep);

            let constructedId = fileId;
            if (pathParts.length > 1) {
                // It's likely a show, construct the ID like show-sX-eY
                const showDirName = pathParts[0].replace(/ /g, '-').toLowerCase();
                const seasonMatch = pathParts[1].match(/season\s*(\d+)/i);
                const episodeMatch = parsedPath.name.match(/S(\d+)E(\d+)/i);
                
                if (seasonMatch && episodeMatch) {
                    const seasonNumber = parseInt(seasonMatch[1]);
                    const episodeNumber = parseInt(episodeMatch[2]);
                    constructedId = `${showDirName}-s${seasonNumber}-e${episodeNumber}`;
                } else if(seasonMatch) {
                    // Fallback if no SxxExx pattern
                    const seasonNumber = parseInt(seasonMatch[1]);
                    const episodeNumber = parseInt(parsedPath.name.match(/\d+/)?.[0] || '0');
                    constructedId = `${showDirName}-s${seasonNumber}-e${episodeNumber}`;
                }
            }


            if (constructedId === id) {
                return {
                    filePath: fullDirentPath,
                    ext: parsedPath.ext.toLowerCase(),
                };
            }
        }
    }
    return null;
}

function getMimeType(extension: string): string {
    switch (extension) {
        case '.mp4': return 'video/mp4';
        case '.mkv': return 'video/x-matroska';
        case '.webm': return 'video/webm';
        case '.ogg': return 'video/ogg';
        case '.mov': return 'video/quicktime';
        case '.hevc': return 'video/mp4'; // Often packaged in mp4
        default: return 'video/mp4';
    }
}


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const videoInfo = await findVideoFile(id);

    if (!videoInfo || !fs.existsSync(videoInfo.filePath)) {
        return new NextResponse('Video not found.', { status: 404 });
    }
    
    const { filePath, ext } = videoInfo;
    const mimeType = getMimeType(ext);

    try {
        const stats = await stat(filePath);
        const fileSize = stats.size;
        const range = req.headers.get('range');

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            
            const file = fs.createReadStream(filePath, { start, end });

            const headers = new Headers();
            headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
            headers.set('Accept-Ranges', 'bytes');
            headers.set('Content-Length', chunksize.toString());
            headers.set('Content-Type', mimeType);

            // For streaming, we need to return a ReadableStream
            const readableStream = new ReadableStream({
                start(controller) {
                    file.on('data', (chunk) => {
                        controller.enqueue(chunk);
                    });
                    file.on('end', () => {
                        controller.close();
                    });
                    file.on('error', (err) => {
                        controller.error(err);
                    });
                }
            });

            return new NextResponse(readableStream, {
                status: 206,
                headers,
            });

        } else {
            const headers = new Headers();
            headers.set('Content-Length', fileSize.toString());
            headers.set('Content-Type', mimeType);
            headers.set('Accept-Ranges', 'bytes');
            
            const file = fs.createReadStream(filePath);
            const readableStream = new ReadableStream({
                start(controller) {
                    file.on('data', (chunk) => {
                        controller.enqueue(chunk);
                    });
                    file.on('end', () => {
                        controller.close();
                    });
                    file.on('error', (err) => {
                        controller.error(err);
                    });
                }
            });
            return new NextResponse(readableStream, {
                status: 200,
                headers
            });
        }
    } catch (error) {
        console.error(error);
        return new NextResponse('Internal server error.', { status: 500 });
    }
}
