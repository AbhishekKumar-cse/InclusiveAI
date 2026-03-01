'use server';
/**
 * @fileOverview A flow to generate descriptive alt text for images using AI.
 *
 * - generateImageAltText - A function that handles the alt text generation process.
 * - GenerateImageAltTextInput - The input type for the generateImageAltText function.
 * - GenerateImageAltTextOutput - The return type for the generateImageAltText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateImageAltTextInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    )
});
export type GenerateImageAltTextInput = z.infer<typeof GenerateImageAltTextInputSchema>;

const GenerateImageAltTextOutputSchema = z.object({
  altText: z.string().describe('The generated descriptive alt text for the image.')
});
export type GenerateImageAltTextOutput = z.infer<typeof GenerateImageAltTextOutputSchema>;

export async function generateImageAltText(
  input: GenerateImageAltTextInput
): Promise<GenerateImageAltTextOutput> {
  try {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-pro',
      prompt: `Describe this image comprehensively for a screen reader user in under 125 words.
Do not begin with 'Image of'. Include: subject, context, any visible text, spatial layout.

Image: ${input.photoDataUri}`,
    });

    const altText = response.text || 'Image';

    return {
      altText: String(altText),
    };
  } catch (error) {
    console.error('Alt text generation failed:', error);
    throw error;
  }
}
