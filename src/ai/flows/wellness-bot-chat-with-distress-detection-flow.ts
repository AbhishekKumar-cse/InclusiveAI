'use server';
/**
 * @fileOverview Implements a WellnessBot chat with strict history formatting for Gemini compatibility.
 *
 * - chatWithWellnessBot - Main entry point for the chat flow.
 * - ChatWithWellnessBotInput - Standard input schema with message and history.
 * - ChatWithWellnessBotOutput - Structured output with AI response and safety scores.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatHistoryPartSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const ChatWithWellnessBotInputSchema = z.object({
  chatHistory: z.array(ChatHistoryPartSchema).describe("The conversation history, including the latest user message as the last item."),
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

const WELLNESSBOT_SYSTEM_INSTRUCTION = `You are WellnessBot, a compassionate AI wellbeing companion for university students.
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
  // 1. Identify the current message and the preceding history
  const lastMessage = input.chatHistory[input.chatHistory.length - 1];
  const userPrompt = lastMessage?.content || "";
  const precedingHistory = input.chatHistory.slice(0, -1);

  // 2. Distress Detection
  let newRiskScore = 0;
  try {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: 'You are a psychological distress detector. Analyze the input message for signs of crisis, self-harm, or severe depression. Respond ONLY with a JSON object: {"score": number from 0 to 100}',
      prompt: userPrompt,
      config: {
        safetySettings: SAFETY_SETTINGS as any,
        responseMimeType: 'application/json',
      }
    });
    const output = response.output as any;
    newRiskScore = output?.score || 0;
  } catch (e) {
    console.warn('Distress detection failed:', e);
  }

  const flaggedForReview = newRiskScore >= 31;
  const humanHandoffTriggered = newRiskScore >= 71;

  // 3. Prepare History for Gemini
  // Rules: Must start with 'user', must alternate 'user'/'model'. Must end with 'model'.
  const messages: any[] = [];

  precedingHistory.forEach((msg) => {
    const role = msg.role === 'assistant' ? 'model' : 'user';

    // First message in history MUST be 'user'
    if (messages.length === 0 && role !== 'user') return;

    const last = messages[messages.length - 1];
    if (last && last.role === role) {
      last.content[0].text += `\n${msg.content}`;
    } else {
      messages.push({
        role,
        content: [{ text: msg.content }]
      });
    }
  });

  // Ensure history ends with 'model' so the next part (prompt) is 'user'
  while (messages.length > 0 && messages[messages.length - 1].role !== 'model') {
    messages.pop();
  }

  // 4. Generate Main Response
  let aiResponse = "I'm here to listen. Can you tell me more about how you're feeling?";
  try {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: WELLNESSBOT_SYSTEM_INSTRUCTION,
      history: messages,
      prompt: `User Language: ${input.userLanguage}\n\nMessage: ${userPrompt}`,
      config: {
        safetySettings: SAFETY_SETTINGS as any,
      }
    });

    if (response.text) {
      aiResponse = response.text;
    }
  } catch (e: any) {
    console.error('WellnessBot generation failed:', e);
    // Fallback is only used if API fails completely
  }

  // Return only serializable data
  return {
    aiResponse: String(aiResponse),
    newRiskScore: Number(newRiskScore),
    flaggedForReview: Boolean(flaggedForReview),
    humanHandoffTriggered: Boolean(humanHandoffTriggered),
  };
}
