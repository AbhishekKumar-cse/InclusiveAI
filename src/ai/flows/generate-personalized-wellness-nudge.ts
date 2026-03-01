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
    .describe('A description of the user\u0027s recent mood trend (e.g., \