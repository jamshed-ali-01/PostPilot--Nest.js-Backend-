import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';

/**
 * Dual AI Provider Service
 * Set AI_PROVIDER=openai in .env to use ChatGPT (requires billing)
 * Set AI_PROVIDER=gemini in .env to use Google Gemini (free tier)
 * Default: gemini
 */
@Injectable()
export class AIService {
    private openai: OpenAI;
    private gemini: GoogleGenerativeAI;
    private provider: 'openai' | 'gemini';

    constructor() {
        this.provider = (process.env.AI_PROVIDER as 'openai' | 'gemini') || 'gemini';
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
        this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }

    private buildAdSystemPrompt(prompt: string, tone: string, platform: string): string {
        return `You are a direct-response ad copywriter for UK trades businesses (plumbers, builders, electricians, etc.).
Generate a high-converting ad for ${platform}.
Rules:
- Headline: Catchy and under 40 characters
- Primary Text: Engaging, solves a pain point, and under 125 characters
- Description: Concise and highlights a benefit (e.g., "5-Year Warranty")
- Tone: ${tone}
- Style: Professional, trustworthy, and local.
- No fluff. Just the copy.

Business Context/Job: ${prompt}

Format the response as JSON:
{
  "headline": "...",
  "primaryText": "...",
  "description": "..."
}`;
    }

    async generateAdContent(prompt: string, tone: string = 'professional', platform: string = 'FACEBOOK'): Promise<{ headline: string, primaryText: string, description: string }> {
        const systemPrompt = this.buildAdSystemPrompt(prompt, tone, platform);
        let result: string;

        if (this.provider === 'openai') {
            result = await this.generateWithOpenAI(systemPrompt);
        } else {
            result = await this.generateWithGemini(systemPrompt);
        }

        try {
            // Remove markdown code blocks if present
            const cleanResult = result.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanResult);
        } catch (error) {
            console.error('[AI Ad Generation Parsing Error]', error, result);
            return {
                headline: "Professional Trades Service",
                primaryText: "Get high-quality service from local experts. Book your free estimate today!",
                description: "Expert Workmanship Guaranteed",
            };
        }
    }

    private buildSystemPrompt(prompt: string, tone: string, location?: string, hasImages?: boolean, includeEmojis: boolean = true, captionLength: string = 'medium'): string {
        const lengthMap: Record<string, string> = {
            'short': 'concise and under 150 characters',
            'medium': 'balanced and under 300 characters',
            'long': 'detailed and between 400-600 characters'
        };

        return `You are a social media expert for UK trades businesses (plumbers, builders, electricians, etc.).
Generate an engaging Instagram/Facebook/LinkedIn post caption.
Rules:
${includeEmojis ? '- Use 2-4 relevant emojis naturally throughout the caption' : '- Do NOT use any emojis in the caption'}
- Keep the main caption ${lengthMap[captionLength] || lengthMap['medium']}
- Add a clear call-to-action (e.g., "Book your free estimate today!")
- Include 5-8 relevant hashtags at the end on a NEW line, separated from caption
- Make it feel genuine and local, not corporate
- If a customer testimonial is mentioned, incorporate a brief quote
${location ? `- Location mentioned: ${location} — reference it in the caption` : ''}
${hasImages ? '- Images are attached — describe what you see and reference it naturally in the caption' : ''}

Job: ${prompt}
Tone: ${tone}

Write the caption now. Format: caption text first, then hashtags on a new line:`;
    }

    async generateCaption(prompt: string, tone: string = 'professional', location?: string, imageUrls?: string[], includeEmojis: boolean = true, captionLength: string = 'medium'): Promise<string> {
        const hasImages = imageUrls && imageUrls.length > 0;
        const systemPrompt = this.buildSystemPrompt(prompt, tone, location, hasImages, includeEmojis, captionLength);

        if (this.provider === 'openai') {
            return this.generateWithOpenAI(systemPrompt, imageUrls);
        } else {
            return this.generateWithGemini(systemPrompt, imageUrls);
        }
    }

    private async generateWithGemini(prompt: string, imageUrls?: string[]): Promise<string> {
        const model = this.gemini.getGenerativeModel({
            model: 'gemini-flash-latest',
        });

        const parts: Part[] = [{ text: prompt }];

        // Add images if present — fetch each and convert to base64
        if (imageUrls && imageUrls.length > 0) {
            for (const url of imageUrls.slice(0, 3)) {
                try {
                    const response = await fetch(url);
                    const buffer = await response.arrayBuffer();
                    const base64 = Buffer.from(buffer).toString('base64');
                    const mimeType = response.headers.get('content-type') || 'image/jpeg';
                    parts.push({
                        inlineData: { mimeType: mimeType as any, data: base64 },
                    });
                } catch {
                    // Skip image if fetch fails
                }
            }
        }

        const result = await model.generateContent(parts);
        return result.response.text();
    }

    private async generateWithOpenAI(prompt: string, imageUrls?: string[]): Promise<string> {
        if (imageUrls && imageUrls.length > 0) {
            const imageMessages = imageUrls.slice(0, 3).map(url => ({
                type: 'image_url' as const,
                image_url: { url, detail: 'low' as const },
            }));

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{
                    role: 'user',
                    content: [{ type: 'text', text: prompt }, ...imageMessages],
                }],
                max_tokens: 400,
                temperature: 0.8,
            });
            return response.choices[0].message.content || '';
        }

        const response = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 400,
            temperature: 0.8,
        });
        return response.choices[0].message.content || '';
    }

    async rewritePost(content: string, tone: string): Promise<string> {
        const prompt = `Rewrite the following social media post to have a ${tone} tone:\n${content}`;
        if (this.provider === 'openai') {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
            });
            return response.choices[0].message.content || '';
        } else {
            const model = this.gemini.getGenerativeModel({ model: 'gemini-flash-latest' });
            const result = await model.generateContent(prompt);
            return result.response.text();
        }
    }
}
