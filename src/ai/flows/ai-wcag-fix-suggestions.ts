'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating WCAG fix suggestions.
 *
 * - generateWcagFixSuggestions - A function that leverages AI to provide plain-language descriptions,
 *   step-by-step fix instructions, and corrected code snippets for WCAG issues.
 * - WcagFixSuggestionInput - The input type for the generateWcagFixSuggestions function.
 * - WcagFixSuggestionOutput - The return type for the generateWcagFixSuggestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WcagFixSuggestionInputSchema = z.object({
  issueType: z.string().describe('The type of WCAG issue (e.g., contrast, alt_text, keyboard).'),
  severity: z.string().describe('The severity of the issue (e.g., critical, serious, moderate, minor).'),
  element: z.string().describe('A CSS selector or description of the affected HTML element.'),
  page: z.string().url().describe('The URL of the page where the issue was found.'),
  description: z.string().describe('The original description of the accessibility problem.'),
  wcagCriteria: z.string().describe('The WCAG criteria related to this issue (e.g., 1.1.1 Non-text Content (Level A)).'),
  offendingCodeSnippet: z.string().describe('The HTML code snippet that contains the accessibility issue.'),
});
export type WcagFixSuggestionInput = z.infer<typeof WcagFixSuggestionInputSchema>;

const WcagFixSuggestionOutputSchema = z.object({
  plainLanguageDescription: z.string().describe('A clear, plain-language explanation of the accessibility problem.'),
  fixInstructions: z.string().describe('Step-by-step instructions on how to fix the issue.'),
  correctedCodeSnippet: z.string().describe('The corrected HTML code snippet that resolves the issue.'),
});
export type WcagFixSuggestionOutput = z.infer<typeof WcagFixSuggestionOutputSchema>;

export async function generateWcagFixSuggestions(input: WcagFixSuggestionInput): Promise<WcagFixSuggestionOutput> {
  return wcagFixSuggestionFlow(input);
}

const wcagFixSuggestionPrompt = ai.definePrompt({
  name: 'wcagFixSuggestionPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: WcagFixSuggestionInputSchema },
  output: { schema: WcagFixSuggestionOutputSchema },
  prompt: `You are an expert accessibility consultant specializing in WCAG 2.2 standards.
Your task is to provide clear, actionable advice for fixing web accessibility issues.

Based on the following WCAG audit details, provide a plain-language description of the problem,
step-by-step fix instructions, and a corrected HTML code snippet. Ensure the corrected code
is ready to be used and directly addresses the issue.

WCAG Issue Details:
- Issue Type: {{{issueType}}}
- Severity: {{{severity}}}
- Affected Element: {{{element}}}
- Page URL: {{{page}}}
- Original Description: {{{description}}}
- WCAG Criteria: {{{wcagCriteria}}}
- Offending Code Snippet:
  ```html
  {{{offendingCodeSnippet}}}
  ```

Provide the response in the following JSON format:
{{json output.schema}}`,
});

const wcagFixSuggestionFlow = ai.defineFlow(
  {
    name: 'wcagFixSuggestionFlow',
    inputSchema: WcagFixSuggestionInputSchema,
    outputSchema: WcagFixSuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await wcagFixSuggestionPrompt(input);
    return output!;
  }
);
