"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = __importDefault(require("openai"));
const generative_ai_1 = require("@google/generative-ai");
let AIService = class AIService {
    openai;
    gemini;
    provider;
    constructor() {
        this.provider = process.env.AI_PROVIDER || 'gemini';
        this.openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY || '' });
        this.gemini = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }
    buildAdSystemPrompt(prompt, tone, platform) {
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
    async generateAdContent(prompt, tone = 'professional', platform = 'FACEBOOK') {
        if (this.provider === 'none') {
            return {
                headline: "",
                primaryText: "",
                description: "",
            };
        }
        const systemPrompt = this.buildAdSystemPrompt(prompt, tone, platform);
        let result;
        if (this.provider === 'openai') {
            result = await this.generateWithOpenAI(systemPrompt);
        }
        else {
            result = await this.generateWithGemini(systemPrompt);
        }
        try {
            const cleanResult = result.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanResult);
        }
        catch (error) {
            console.error('[AI Ad Generation Parsing Error]', error, result);
            return {
                headline: "Professional Trades Service",
                primaryText: "Get high-quality service from local experts. Book your free estimate today!",
                description: "Expert Workmanship Guaranteed",
            };
        }
    }
    buildSystemPrompt(prompt, tone, location, hasImages, includeEmojis = true, captionLength = 'medium') {
        const lengthMap = {
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
    async generateCaption(prompt, tone = 'professional', location, imageUrls, includeEmojis = true, captionLength = 'medium') {
        if (this.provider === 'none') {
            return "";
        }
        const hasImages = imageUrls && imageUrls.length > 0;
        const systemPrompt = this.buildSystemPrompt(prompt, tone, location, hasImages, includeEmojis, captionLength);
        if (this.provider === 'openai') {
            return this.generateWithOpenAI(systemPrompt, imageUrls);
        }
        else {
            return this.generateWithGemini(systemPrompt, imageUrls);
        }
    }
    async generateWithGemini(prompt, imageUrls) {
        const model = this.gemini.getGenerativeModel({
            model: 'gemini-flash-latest',
        });
        const parts = [{ text: prompt }];
        if (imageUrls && imageUrls.length > 0) {
            for (const url of imageUrls.slice(0, 3)) {
                try {
                    const response = await fetch(url);
                    const buffer = await response.arrayBuffer();
                    const base64 = Buffer.from(buffer).toString('base64');
                    const mimeType = response.headers.get('content-type') || 'image/jpeg';
                    parts.push({
                        inlineData: { mimeType: mimeType, data: base64 },
                    });
                }
                catch {
                }
            }
        }
        const result = await model.generateContent(parts);
        return result.response.text();
    }
    async generateWithOpenAI(prompt, imageUrls) {
        if (imageUrls && imageUrls.length > 0) {
            const imageMessages = imageUrls.slice(0, 3).map(url => ({
                type: 'image_url',
                image_url: { url, detail: 'low' },
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
    async rewritePost(content, tone) {
        const prompt = `Rewrite the following social media post to have a ${tone} tone:\n${content}`;
        if (this.provider === 'openai') {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
            });
            return response.choices[0].message.content || '';
        }
        else {
            const model = this.gemini.getGenerativeModel({ model: 'gemini-flash-latest' });
            const result = await model.generateContent(prompt);
            return result.response.text();
        }
    }
};
exports.AIService = AIService;
exports.AIService = AIService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AIService);
//# sourceMappingURL=ai.service.js.map