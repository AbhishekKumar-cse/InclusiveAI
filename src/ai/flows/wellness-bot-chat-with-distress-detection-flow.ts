'use server';
/**
 * @fileOverview Implements a WellnessBot chat with distress detection.
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
  flaggedForReview: z.boolean().describe('True if the message content should be flagged for review (e.g., medium to high risk).'),
  humanHandoffTriggered: z.boolean().describe('True if a human counselor handoff should be triggered (e.g., crisis level risk).'),
});
export type ChatWithWellnessBotOutput = z.infer<typeof ChatWithWellnessBotOutputSchema>;

// Distress detection prompt using Gemini 1.5 Flash
const DistressDetectionOutputSchema = z.object({
  score: z.number().int().min(0).max(100).describe('A numerical score (0-100) indicating the level of psychological distress.'),
  signals: z.array(z.string()).describe('An array of detected distress signals.'),
});

const detectDistressPrompt = ai.definePrompt({
  name: 'detectDistressPrompt',
  input: { schema: z.object({ message: z.string() }) },
  output: { schema: DistressDetectionOutputSchema },
  model: 'googleai/gemini-1.5-flash',
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' }
    ]
  },
  prompt: `Analyze this message for signs of psychological distress.
Output ONLY a JSON object: { "score": 0-100, "signals": ["signal1", "signal2"] }
Score 0-30 = low/normal, 31-70 = medium/monitor, 71-100 = high/crisis.
Message: "{{{message}}}"`,
});

const WELNESSBOT_SYSTEM_INSTRUCTION = `You are WellnessBot, a compassionate AI wellbeing companion for university students.
CRITICAL RULES:
- You are NOT a doctor. Never diagnose. Never prescribe.
- If asked about medication, say: "Please consult a qualified healthcare professional."
- Always respond in the user's language.
- Keep responses under 150 words. Be warm, specific, actionable.
- End every response with one concrete micro-action.`;

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
    try {
      const distressResult = await detectDistressPrompt({ message: input.message });
      newRiskScore = distressResult.output?.score || 0;
    } catch (e) {
      console.warn('Distress detection failed:', e);
    }
    
    const flaggedForReview = newRiskScore >= 31; 
    const humanHandoffTriggered = newRiskScore >= 71; 

    // Robust history cleaning for Gemini: MUST alternate user/model and start with user
    let historyForModel: any[] = [];
    input.chatHistory.forEach((m) => {
      if (!m.content || m.content.trim() === '') return;
      const role = m.role === 'assistant' ? 'model' : 'user';
      
      const lastMessage = historyForModel[historyForModel.length - 1];
      if (!lastMessage || lastMessage.role !== role) {
        historyForModel.push({
          role: role,
          content: [{ text: m.content }],
        });
      } else {
        // Concatenate if consecutive roles detected to keep alternating pattern
        lastMessage.content[0].text += '\n' + m.content;
      }
    });

    // Ensure history starts with 'user'
    while (historyForModel.length > 0 && historyForModel[0].role !== 'user') {
      historyForModel.shift();
    }
    
    // Ensure history ends with 'model' so the next message (prompt) is 'user'
    if (historyForModel.length > 0 && historyForModel[historyForModel.length - 1].role !== 'model') {
      historyForModel.pop();
    }

    let aiResponse = "I'm here for you, but I'm having a little trouble connecting right now. Please tell me more about how you're feeling.";
    try {
      const aiResponseGen = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        system: WELNESSBOT_SYSTEM_INSTRUCTION,
        history: historyForModel.length > 0 ? historyForModel : undefined,
        prompt: input.message,
        config: {
          safetySettings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' }
          ]
        }
      });
      aiResponse = aiResponseGen.text || aiResponse;
    } catch (e: any) {
      console.error('WellnessBot generation failed:', e);
      // Fallback message is already set
    }

    return {
      aiResponse,
      newRiskScore,
      flaggedForReview,
      humanHandoffTriggered,
    };
  }
);
