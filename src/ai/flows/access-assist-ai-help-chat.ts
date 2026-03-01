'use server';
/**
 * @fileOverview Provides a Genkit flow for the AccessAssist AI Help Chat.
 *
 * - accessAssistAIHelpChat - A function that handles user queries for AccessAssist features or text simplification.
 * - AccessAssistAIHelpChatInput - The input type for the accessAssistAIHelpChat function.
 * - AccessAssistAIHelpChatOutput - The return type for the accessAssistAIHelpChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AccessAssistAIHelpChatInputSchema = z.object({
  message: z.string().describe('The user\'s question about AccessAssist features or text to simplify.'),
});
export type AccessAssistAIHelpChatInput = z.infer<typeof AccessAssistAIHelpChatInputSchema>;

const AccessAssistAIHelpChatOutputSchema = z.object({
  response: z.string().describe('The AI\'s helpful response or simplified text.'),
});
export type AccessAssistAIHelpChatOutput = z.infer<typeof AccessAssistAIHelpChatOutputSchema>;

export async function accessAssistAIHelpChat(input: AccessAssistAIHelpChatInput): Promise<AccessAssistAIHelpChatOutput> {
  try {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `You are AccessAssistBot, an AI assistant specifically designed to help university students quickly understand and utilize the features of the InclusiveAI AccessAssist module. Your primary goal is to provide fast, clear, and concise answers to questions about AccessAssist functionalities or to simplify complex text provided by the user.

Key functionalities you can assist with include:
- Dyslexia Mode (OpenDyslexic, Lexie Readable, Atkinson Hyperlegible fonts, syllable highlighting)
- Text size, letter spacing, line height adjustments
- Background color changes (default, cream, yellow, blue, dark)
- Text-to-Speech (TTS) functionality and reading speed
- Neurodiverse UX Modes (ADHD Focus, Autism Calm, Sensory Sensitive, Processing Speed)
- Live Lecture Transcription
- Sign Language Companion
- Content Transformation (pasting URLs or raw text for transformation)

When asked to simplify text, you should make it easier to understand while preserving the original meaning.
Keep your responses under 150 words and focus on actionable advice or direct answers.

User's query:
${input.message}`,
    });

    const responseText = response.text || 'I\'m here to help with AccessAssist features.';

    return {
      response: String(responseText),
    };
  } catch (error) {
    console.error('AccessAssistBot generation failed:', error);
    throw error;
  }
}
