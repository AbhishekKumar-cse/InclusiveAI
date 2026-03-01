import { config } from 'dotenv';
config();

import '@/ai/flows/translate-accessible-content.ts';
import '@/ai/flows/ai-wcag-fix-suggestions.ts';
import '@/ai/flows/generate-personalized-wellness-nudge.ts';
import '@/ai/flows/access-assist-ai-help-chat.ts';
import '@/ai/flows/generate-image-alt-text-flow.ts';
import '@/ai/flows/wellness-bot-chat-with-distress-detection-flow.ts';
import '@/ai/flows/ai-draft-crisis-alerts.ts';