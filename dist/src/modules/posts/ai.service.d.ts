export declare class AIService {
    private openai;
    private gemini;
    private provider;
    constructor();
    private buildSystemPrompt;
    generateCaption(prompt: string, tone?: string, location?: string, imageUrls?: string[], includeEmojis?: boolean, captionLength?: string): Promise<string>;
    private generateWithGemini;
    private generateWithOpenAI;
    rewritePost(content: string, tone: string): Promise<string>;
}
