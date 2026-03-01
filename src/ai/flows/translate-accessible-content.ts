'use server';
/**
 * @fileOverview A Genkit flow for translating accessible content using Gemini 1.5 Pro.
 *
 * - translateAccessibleContent - A function that translates health or educational content.
 * - TranslateAccessibleContentInput - The input type for the translation function.
 * - TranslateAccessibleContentOutput - The return type for the translation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranslateAccessibleContentInputSchema = z.object({
  content: z.string().describe('The health or educational content to be translated.'),
  targetLanguage: z.string().describe('The target language for the translation (e.g., "hi" for Hindi, "ta" for Tamil).'),
});
export type TranslateAccessibleContentInput = z.infer<typeof TranslateAccessibleContentInputSchema>;

const TranslateAccessibleContentOutputSchema = z.object({
  translatedContent: z.string().describe('The translated content in the target language.'),
});
export type TranslateAccessibleContentOutput = z.infer<typeof TranslateAccessibleContentOutputSchema>;

export async function translateAccessibleContent(input: TranslateAccessibleContentInput): Promise<TranslateAccessibleContentOutput> {
  try {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-pro',
      prompt: `Translate the following health/educational content to ${input.targetLanguage}.
Maintain plain language (Flesch reading ease 70+).
Preserve all formatting and emphasis.
Maintain cultural sensitivity — do not translate idiomatic expressions literally.
Do not include any preamble — output only the translation.

Content:
${input.content}`,
    });

    const translatedContent = response.text || input.content;

    return {
      translatedContent: String(translatedContent),
    };
  } catch (error) {
    console.error('Translation failed:', error);
    throw error;
  }
}
