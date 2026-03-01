'use server';
/**
 * @fileOverview Implements a WellnessBot chat with distress detection and alternating history.
 * 
 * - chatWithWellnessBot - A function that handles the WellnessBot conversation and distress detection.
 * - ChatWithWellnessBotInput - The input type for the chatWithWellnessBot function.
 * - ChatWithWellnessBotOutput - The return type for the chatWithWellnessBot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatHistoryPartSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const ChatWithWellnessBotInputSchema = z.object({
  message: z.string().describe("The user's current message to the WellnessBot."),
  chatHistory: z.array(ChatHistoryPartSchema).describe("The previous conversation history between the user and WellnessBot."),
  userLanguage: z.string().describe('The BCP47 code for the user\'s preferred language (e.g., "en", "hi").'),
});
export type ChatWithWellnessBotInput = z.infer<typeof ChatWithWellnessBotInputSchema>;

const ChatWithWellnessBotOutputSchema = z.object({
  aiResponse: z.string().describe("The WellnessBot's response to the user's message."),
  newRiskScore: z.number().int().min(0).max(100).describe('The distress risk score (0-100) detected in the user\'s message.'),
  flaggedForReview: z.boolean().describe('True if the message content should be flagged for review.'),
  humanHandoffTriggered: z.boolean().describe('True if a human counselor handoff should be triggered.'),
});
export type ChatWithWellnessBotOutput = z.infer<typeof ChatWithWellnessBotOutputSchema>;

const WELNESSBOT_SYSTEM_INSTRUCTION = `You are WellnessBot, a compassionate AI wellbeing companion for university students.
CRITICAL RULES:
- You are NOT a doctor. Never diagnose or prescribe.
- If asked about medication, say: "Please consult a qualified healthcare professional."
- Always respond in the user's language.
- Keep responses under 150 words. Be warm and specific.
- End every response with one concrete micro-action.`;

const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
] as const;

export async function chatWithWellnessBot(input: ChatWithWellnessBotInput): Promise<ChatWithWellnessBotOutput> {
  return wellnessBotChatWithDistressDetectionFlow(input);
}

const wellnessBotChatWithDistressDetectionFlow = ai.defineFlow(
  {
    name: 'wellnessBotChatWithDistressDetectionFlow',
    inputSchema: ChatWithWellnessBotInputSchema,
    outputSchema: ChatWithWellnessBotOutputSchema,
  },
  async (input) => {
    let newRiskScore = 0;
    
    // 1. Detect Distress
    try {
      const { output } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        system: 'Analyze the following message for psychological distress. Return a JSON object with a "score" (0-100) and "signals" (array of strings).',
        prompt: input.message,
        config: {
          safetySettings: SAFETY_SETTINGS as any,
          responseMimeType: 'application/json',
        },
        output: {
          schema: z.object({
            score: z.number().int().min(0).max(100),
            signals: z.array(z.string()),
          }),
        }
      });
      newRiskScore = output?.score || 0;
    } catch (e) {
      console.warn('Distress detection failed:', e);
    }
    
    const flaggedForReview = newRiskScore >= 31; 
    const humanHandoffTriggered = newRiskScore >= 71; 

    // 2. Prepare History for Gemini
    // Gemini history MUST alternate: user, model, user, model...
    // The current prompt is added by Genkit as the final 'user' message,
    // so the history provided MUST end with a 'model' message.
    let historyForModel: any[] = [];
    
    input.chatHistory.forEach((m) => {
      if (!m.content || m.content.trim() === '') return;
      const role = m.role === 'assistant' ? 'model' : 'user';
      
      const last = historyForModel[historyForModel.length - 1];
      if (!last || last.role !== role) {
        historyForModel.push({
          role: role,
          content: [{ text: m.content }],
        });
      } else {
        last.content[0].text += '\n' + m.content;
      }
    });

    // Strategy: 
    // - Must start with 'user'.
    // - Must end with 'model' (because the current 'prompt' will be 'user').
    while (historyForModel.length > 0 && historyForModel[0].role !== 'user') {
      historyForModel.shift();
    }
    if (historyForModel.length > 0 && historyForModel[historyForModel.length - 1].role !== 'model') {
      historyForModel.pop();
    }

    // 3. Generate Response
    let aiResponse = "I'm here for you. Please tell me more about what's on your mind.";
    try {
      const { text } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        system: WELNESSBOT_SYSTEM_INSTRUCTION,
        history: historyForModel,
        prompt: `User Language: ${input.userLanguage}\nUser Message: ${input.message}`,
        config: {
          safetySettings: SAFETY_SETTINGS as any,
        }
      });
      aiResponse = text || aiResponse;
    } catch (e: any) {
      console.error('WellnessBot generation failed:', e);
    }

    return {
      aiResponse,
      newRiskScore,
      flaggedForReview,
      humanHandoffTriggered,
    };
  }
);
