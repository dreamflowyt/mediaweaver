'use server';

import {NextRequest, NextResponse} from 'next/server';
import fs from 'fs';
import path from 'path';
import {promisify} from 'util';

const stat = promisify(fs.stat);

const mediaDirectory = path.join(process.cwd(), 'public', 'media');

async function findVideoFile(id: string): Promise<string | null> {
    const files = await fs.promises.readdir(mediaDirectory);
    const videoFile = files.find(file => path.parse(file).name === id);
    return videoFile ? path.join(mediaDirectory, videoFile) : null;
}


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const videoPath = await findVideoFile(id);

    if (!videoPath || !fs.existsSync(videoPath)) {
        return new NextResponse('Video not found.', { status: 404 });
    }

    try {
        const stats = await stat(videoPath);
        const fileSize = stats.size;
        const range = req.headers.get('range');

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            
            const file = fs.createReadStream(videoPath, { start, end });

            const headers = new Headers();
            headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
            headers.set('Accept-Ranges', 'bytes');
            headers.set('Content-Length', chunksize.toString());
            headers.set('Content-Type', 'video/mp4'); // Adjust mime type if needed

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
            headers.set('Content-Type', 'video/mp4'); // Adjust mime type if needed
            headers.set('Accept-Ranges', 'bytes');
            
            const file = fs.createReadStream(videoPath);
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
