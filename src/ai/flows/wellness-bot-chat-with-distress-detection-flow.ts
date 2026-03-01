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
  score: z.number().int().min(0).max(100).describe('A numerical score (0-100) indicating the level of psychological distress. 0-30 = low/normal, 31-70 = medium/monitor, 71-100 = high/crisis.'),
  signals: z.array(z.string()).describe('An array of detected distress signals (e.g., "suicidal ideation", "hopelessness").'),
});

const detectDistressPrompt = ai.definePrompt({
  name: 'detectDistressPrompt',
  input: { schema: z.object({ message: z.string() }) },
  output: { schema: DistressDetectionOutputSchema },
  model: 'googleai/gemini-1.5-flash',
  prompt: `Analyze this message for signs of psychological distress.
Output ONLY a JSON object: { "score": 0-100, "signals": ["signal1", "signal2"] }
Score 0-30 = low/normal, 31-70 = medium/monitor, 71-100 = high/crisis.
Crisis signals: suicidal ideation, self-harm, hopelessness, isolation, crisis language.
Message: "{{{message}}}"`,
});

const WELNESSBOT_SYSTEM_INSTRUCTION = `You are WellnessBot, a compassionate AI wellbeing companion for university students.
CRITICAL RULES:
- You are NOT a doctor. Never diagnose. Never prescribe.
- If asked about medication, say: "Please consult a qualified healthcare professional."
- For crisis language: immediately display resources AND flag for human handoff.
- Always respond in the user's language (detected from input).
- Keep responses under 150 words. Be warm, specific, actionable.
- End every response with one concrete micro-action the student can take RIGHT NOW.
KNOWLEDGE BASE: CBT techniques, mindfulness, sleep hygiene, study strategies, campus resources.`;

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
    // Step 1: Detect distress in the user's message using Gemini 1.5 Flash
    const distressResult = await detectDistressPrompt({ message: input.message });
    const newRiskScore = distressResult.output?.score || 0;
    const flaggedForReview = newRiskScore >= 31; // Flag for review if medium or high risk
    const humanHandoffTriggered = newRiskScore >= 71; // Trigger handoff if crisis level risk

    // Step 2: Prepare chat history for WellnessBot (Gemini 1.5 Pro)
    const historyForModel = input.chatHistory.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Step 3: Get WellnessBot's response using Gemini 1.5 Pro
    const aiResponseGen = await ai.generate({
      model: 'googleai/gemini-1.5-pro',
      system: WELNESSBOT_SYSTEM_INSTRUCTION,
      history: historyForModel,
      prompt: input.message,
      config: {
        // Configure safety settings if desired, e.g., to be less strict for wellness context
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }, // Allowing discussion of difficult topics
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' }
        ]
      }
    });
    const aiResponse = aiResponseGen.text() || '';

    // Step 4: Return combined results
    return {
      aiResponse,
      newRiskScore,
      flaggedForReview,
      humanHandoffTriggered,
    };
  }
);
