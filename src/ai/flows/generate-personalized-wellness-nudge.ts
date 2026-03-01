'use server';
/**
 * @fileOverview A Genkit flow for generating personalized wellbeing nudges based on a user's mood trends.
 *
 * - generatePersonalizedWellnessNudge - A function that handles the generation of a wellness nudge.
 * - GeneratePersonalizedWellnessNudgeInput - The input type for the generatePersonalizedWellnessNudge function.
 * - GeneratePersonalizedWellnessNudgeOutput - The return type for the generatePersonalizedWellnessNudge function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NudgeCategorySchema = z.enum(['CBT', 'mindfulness', 'social', 'physical', 'academic']);

const GeneratePersonalizedWellnessNudgeInputSchema = z.object({
  userName: z.string().describe('The name of the user for personalization.'),
  moodTrendDescription: z
    .string()
    .describe('A description of the user\'s recent mood trend (e.g., "declining energy levels", "increased stress").'),
  preferredNudgeCategory: NudgeCategorySchema.describe('The preferred category for the wellness nudge.'),
});
export type GeneratePersonalizedWellnessNudgeInput = z.infer<typeof GeneratePersonalizedWellnessNudgeInputSchema>;

const GeneratePersonalizedWellnessNudgeOutputSchema = z.object({
  nudgeMessage: z.string().describe('A personalized wellness nudge message for the user.'),
  suggestedAction: z.string().describe('A concrete micro-action the user can take.'),
  category: NudgeCategorySchema.describe('The category of the wellness nudge.'),
});
export type GeneratePersonalizedWellnessNudgeOutput = z.infer<typeof GeneratePersonalizedWellnessNudgeOutputSchema>;

export async function generatePersonalizedWellnessNudge(
  input: GeneratePersonalizedWellnessNudgeInput
): Promise<GeneratePersonalizedWellnessNudgeOutput> {
  try {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `You are a compassionate wellness coach creating personalized nudges for university students.
Based on the user's mood trends, generate a warm, empathetic wellness nudge that encourages self-care.

User Name: ${input.userName}
Recent Mood Trend: ${input.moodTrendDescription}
Preferred Category: ${input.preferredNudgeCategory}

Create a nudge message (under 100 words) and suggest one concrete micro-action (under 30 words) they can take right now.
Keep the tone supportive and non-judgmental.

Respond with a JSON object:
{
  "nudgeMessage": "...",
  "suggestedAction": "...",
  "category": "${input.preferredNudgeCategory}"
}`,
    });

    const responseText = response.text || '{}';

    try {
      const parsed = JSON.parse(responseText);
      return {
        nudgeMessage: String(parsed.nudgeMessage || ''),
        suggestedAction: String(parsed.suggestedAction || ''),
        category: (parsed.category || input.preferredNudgeCategory) as 'CBT' | 'mindfulness' | 'social' | 'physical' | 'academic',
      };
    } catch {
      return {
        nudgeMessage: String(responseText),
        suggestedAction: 'Take a moment to focus on your wellbeing.',
        category: input.preferredNudgeCategory,
      };
    }
  } catch (error) {
    console.error('Wellness nudge generation failed:', error);
    throw error;
  }
}
