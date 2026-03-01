'use server';
/**
 * @fileOverview A Genkit flow for drafting multi-language emergency alerts based on sensor data.
 *
 * - aiGenerateCrisisAlerts - A function that handles the generation of crisis alerts.
 * - AIGenerateCrisisAlertsInput - The input type for the aiGenerateCrisisAlerts function.
 * - AIGenerateCrisisAlertsOutput - The return type for the aiGenerateCrisisAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema for the crisis alert generation
const AIGenerateCrisisAlertsInputSchema = z.object({
  incidentType: z.string().describe('The type of incident, e.g., "Flood", "Heat", "Fire".'),
  affectedZones: z.array(z.string()).describe('An array of names of zones affected by the incident.'),
  riskDetails: z.string().describe('Additional details about the risk or current situation.'),
});
export type AIGenerateCrisisAlertsInput = z.infer<typeof AIGenerateCrisisAlertsInputSchema>;

// Output schema for the generated crisis alerts in multiple languages
const AIGenerateCrisisAlertsOutputSchema = z.object({
  englishAlert: z.string().describe('The drafted emergency alert message in English.'),
  hindiAlert: z.string().describe('The drafted emergency alert message in Hindi.'),
  tamilAlert: z.string().describe('The drafted emergency alert message in Tamil.'),
});
export type AIGenerateCrisisAlertsOutput = z.infer<typeof AIGenerateCrisisAlertsOutputSchema>;

// Define the Genkit prompt for drafting crisis alerts
const aiDraftCrisisAlertsPrompt = ai.definePrompt({
  name: 'aiDraftCrisisAlertsPrompt',
  input: {schema: AIGenerateCrisisAlertsInputSchema.extend({affectedZonesString: z.string()})}, // Add processed field for affected zones
  output: {schema: AIGenerateCrisisAlertsOutputSchema},
  model: 'googleai/gemini-1.5-flash', // As specified in the prompt
  prompt: `You are an AI assistant tasked with drafting calm, clear, and urgent emergency alerts for university students.
The alert must be under 80 words for each language version.
Your response MUST be a JSON object containing three fields: "englishAlert", "hindiAlert", and "tamilAlert".
Do not include any other text or formatting outside of the JSON object.

Based on the following incident details, draft an emergency alert in English, Hindi, and Tamil.
Include:
- What the incident is.
- The affected area(s).
- What to do immediately.
- Where to go/what to avoid.
- The tone should be serious but not panic-inducing.

Incident Type: {{{incidentType}}}
Affected Area(s): {{{affectedZonesString}}}
Risk Details: {{{riskDetails}}}

Output JSON format:
{
  "englishAlert": "...",
  "hindiAlert": "...",
  "tamilAlert": "..."
}`
});

// Define the Genkit flow for generating crisis alerts
const aiDraftCrisisAlertsFlow = ai.defineFlow(
  {
    name: 'aiDraftCrisisAlertsFlow',
    inputSchema: AIGenerateCrisisAlertsInputSchema,
    outputSchema: AIGenerateCrisisAlertsOutputSchema,
  },
  async (input) => {
    // Pre-process affectedZones into a single string for the prompt
    const affectedZonesString = input.affectedZones.join(', ');

    // Call the prompt to generate the alerts
    const {output} = await aiDraftCrisisAlertsPrompt({ ...input, affectedZonesString });
    if (!output) {
      throw new Error('Failed to generate crisis alerts.');
    }
    return output;
  }
);

// Wrapper function to be called from the application
export async function aiGenerateCrisisAlerts(
  input: AIGenerateCrisisAlertsInput
):
Promise<AIGenerateCrisisAlertsOutput> {
  return aiDraftCrisisAlertsFlow(input);
}