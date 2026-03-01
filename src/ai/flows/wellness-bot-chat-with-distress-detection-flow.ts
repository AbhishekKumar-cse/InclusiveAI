'use server';
/**
 * @fileOverview Implements a WellnessBot chat with distress detection and robust history handling.
 * 
 * - chatWithWellnessBot - Handles conversation with strict history role alternation for Gemini.
 * - ChatWithWellnessBotInput - Input schema including current message and history.
 * - ChatWithWellnessBotOutput - Output including AI response and risk scores.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatHistoryPartSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const ChatWithWellnessBotInputSchema = z.object({
  message: z.string().describe("The user's current message to the WellnessBot."),
  chatHistory: z.array(ChatHistoryPartSchema).describe("The previous conversation history."),
  userLanguage: z.string().describe('The user\'s preferred language code.'),
});
export type ChatWithWellnessBotInput = z.infer<typeof ChatWithWellnessBotInputSchema>;

const ChatWithWellnessBotOutputSchema = z.object({
  aiResponse: z.string().describe("The WellnessBot's response."),
  newRiskScore: z.number().int().min(0).max(100).describe('Distress risk score (0-100).'),
  flaggedForReview: z.boolean().describe('True if content is flagged.'),
  humanHandoffTriggered: z.boolean().describe('True if handoff is triggered.'),
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
    
    // 1. Detect Distress (Using a separate clean call)
    try {
      const { output } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        system: 'Analyze message for psychological distress. Return JSON: {"score": 0-100, "signals": []}',
        prompt: input.message,
        config: {
          safetySettings: SAFETY_SETTINGS as any,
          responseMimeType: 'application/json',
        },
        output: {
          schema: z.object({
            score: z.number(),
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

    // 2. Clean History for Gemini
    // Rules: Must start with 'user', must alternate user/model, must end with 'model' if prompt is 'user'.
    const processedHistory: any[] = [];
    
    input.chatHistory.forEach((m) => {
      if (!m.content || m.content.trim() === '') return;
      const role = m.role === 'assistant' ? 'model' : 'user';
      
      const last = processedHistory[processedHistory.length - 1];
      if (!last || last.role !== role) {
        processedHistory.push({
          role: role,
          content: [{ text: m.content }],
        });
      } else {
        last.content[0].text += '\n' + m.content;
      }
    });

    // Aggressively ensure Gemini format
    while (processedHistory.length > 0 && processedHistory[0].role !== 'user') {
      processedHistory.shift();
    }
    while (processedHistory.length > 0 && processedHistory[processedHistory.length - 1].role !== 'model') {
      processedHistory.pop();
    }

    // 3. Generate Main Response
    let aiResponse = "I'm here for you. Please tell me more about what's on your mind.";
    try {
      const { text } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        system: WELNESSBOT_SYSTEM_INSTRUCTION,
        history: processedHistory,
        prompt: `User Language: ${input.userLanguage}\n\n${input.message}`,
        config: {
          safetySettings: SAFETY_SETTINGS as any,
        }
      });
      if (text) aiResponse = text;
    } catch (e: any) {
      console.error('WellnessBot generation failed:', e);
      // We keep the default aiResponse if generation fails
    }

    return {
      aiResponse,
      newRiskScore,
      flaggedForReview,
      humanHandoffTriggered,
    };
  }
);
