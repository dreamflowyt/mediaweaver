'use server';
/**
 * @fileOverview A flow to generate metadata and a thumbnail for a video file.
 *
 * - generateMediaMetadata - A function that handles the metadata generation.
 * - GenerateMediaMetadataInput - The input type for the function.
 * - GenerateMediaMetadataOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateMediaMetadataInputSchema = z.object({
  fileName: z.string().describe('The original filename of the video.'),
  videoDataUri: z
    .string()
    .describe(
      "A video file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateMediaMetadataInput = z.infer<
  typeof GenerateMediaMetadataInputSchema
>;

const GenerateMediaMetadataOutputSchema = z.object({
  title: z
    .string()
    .describe('A creative and engaging title for the video, based on its content. Should be 3-5 words long.'),
  description: z
    .string()
    .describe(
      'A concise, one-sentence summary of the video content.'
    ),
  aiHint: z.string().describe('Two keywords separated by a space that can be used to find a replacement thumbnail on an image search engine.'),
  thumbnailDataUri: z
    .string()
    .describe(
      "A generated thumbnail image for the video, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateMediaMetadataOutput = z.infer<
  typeof GenerateMediaMetadataOutputSchema
>;

export async function generateMediaMetadata(
  input: GenerateMediaMetadataInput
): Promise<GenerateMediaMetadataOutput> {
  return generateMediaMetadataFlow(input);
}

const metadataPrompt = ai.definePrompt({
  name: 'generateMediaMetadataPrompt',
  input: { schema: GenerateMediaMetadataInputSchema },
  output: {
    schema: z.object({
      title: GenerateMediaMetadataOutputSchema.shape.title,
      description: GenerateMediaMetadataOutputSchema.shape.description,
      aiHint: GenerateMediaMetadataOutputSchema.shape.aiHint,
    }),
  },
  prompt: `You are a creative assistant. Analyze the video provided and generate a suitable title and description.
The original filename is {{{fileName}}}.

Video:
{{media url=videoDataUri}}

Generate a creative title and a one-sentence description.
Also provide two keywords for the aiHint, which will be used to search for a thumbnail image.`,
});

const generateMediaMetadataFlow = ai.defineFlow(
  {
    name: 'generateMediaMetadataFlow',
    inputSchema: GenerateMediaMetadataInputSchema,
    outputSchema: GenerateMediaMetadataOutputSchema,
  },
  async (input) => {
    const [{ output: textOutput }, { media }] = await Promise.all([
      metadataPrompt(input),
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Generate a compelling thumbnail for a video with the following description: ${input.fileName}`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    ]);

    if (!textOutput) {
      throw new Error('Could not generate text metadata.');
    }
    if (!media.url) {
      throw new Error('Could not generate thumbnail.');
    }

    return {
      ...textOutput,
      thumbnailDataUri: media.url,
    };
  }
);
