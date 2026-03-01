# **App Name**: InclusiveAI

## Core Features:

- AI-Enhanced Content Accessibility: Dynamically transforms web content (text, images, video) using Gemini Flash/Pro, providing features like dyslexia-optimized reading modes, AI-generated alt-text tool via Gemini Vision, real-time audio transcription, and multilingual content translation tool, with user preferences stored in Firestore.
- Intelligent Wellness Companion: A Gemini 1.5 Pro-powered conversational agent that provides multilingual health information, daily personalized wellbeing nudges based on mood logs (via a Gemini Flash tool), mood tracking, and real-time distress detection from chat messages, securely logging interactions and data in Firestore.
- Real-Time Campus Crisis Management: Monitors campus safety via real-time sensor data from a Realtime Database, uses a Gemini Flash tool to process risk levels and draft emergency alerts, facilitates a human approval workflow by safety officers, and broadcasts geo-targeted alerts across campus with incident details stored in Firestore.
- Automated WCAG Audit & Remediation Kit: Performs comprehensive WCAG 2.2 accessibility audits on web pages, automatically identifying issues and leveraging a Gemini Flash tool to suggest plain-language fixes and corrected code snippets, storing detailed audit reports and trends in Firestore.
- Personalized Accessibility Profile: Offers extensive user interface customization options including reading fonts, text size, letter spacing, line height, background colors, and neurodiverse UX presets, ensuring these accessibility preferences are globally applied across the application and persisted in Firestore.
- Secure Multi-Role User Management: Manages user authentication with Firebase Auth supporting Google, Email/Password, and anonymous login, and assigns granular user roles (student, counselor, safety_officer, admin) via Firestore to control feature access and manage campus-specific permissions.
- Human-in-the-Loop Safeguards: Integrates critical human oversight into AI-driven processes, specifically by enabling immediate counselor handoff when a user shows signs of distress in chat, and requiring explicit safety officer approval for AI-drafted crisis alerts before broadcast, with all critical events logged in Firestore and Realtime Database.

## Style Guidelines:

- Primary color: A vibrant, clear teal (#028090) embodying innovation and calm support, serving as the main brand accent and CTA color.
- Background color: A very deep, desaturated teal (#101718) to establish a sophisticated and immersive dark theme, complementing the primary color without being distracting.
- Accent color: An electric green (#00FF9D), analogous to the primary hue, providing sharp visual contrast for glowing effects, highlights, and interactive elements.
- Headline font: 'Clash Display' (sans-serif, geometric) for strong, impactful headings. Body font: 'DM Sans' (sans-serif) for clean, readable, and accessible main text. Code/Data font: 'JetBrains Mono' (monospace) for technical content and data points.
- Utilize 'Lucide React' for a comprehensive set of clean, vector-based icons, supplemented by custom-designed SVG icons for unique brand elements or specific accessibility features.
- Employ a highly modular, adaptive layout featuring split-panel designs, card-based components with glassmorphism styling, and responsive breakpoint adjustments to optimize user experience across all devices.
- Implement staggered bottom-up entrance animations for content elements, dynamic hover effects on cards for enhanced interactivity, and smooth shared-layout transitions for fluid page navigation.